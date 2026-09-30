#!/usr/bin/env node
// Read-only helper for the release-notes skill. Gathers everything the model
// needs to decide a semver bump and write release notes, and prints it as JSON.
// It never writes files, commits or pushes.
//
// Usage: node <skill>/scripts/release-context.mjs [options]
//   --base <ref>            compare against this branch/ref (default: auto-detected)
//   --base-version <x.y.z>  one-off override of the version to bump from. Use it to
//                           correct a wrong version on the base branch; never persisted
//   --max-diff-lines <n>    cap on the source diff included in the output (default 1500)
//
// Optional project config: release-notes.config.json at the repo root (see DEFAULT_CONFIG).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const CONFIG_PATH = 'release-notes.config.json'

const DEFAULT_CONFIG = {
  // Branch releases are compared against. null = auto-detect (origin/HEAD, main, master, develop).
  baseBranch: null,
  // package.json whose "version" is bumped. Point it at a workspace package in a monorepo.
  packageJsonPath: 'package.json',
  // Where end-user notes are written (consumed by the app, if it has a UI for them).
  userNotesPath: 'public/changelog.json',
  developerNotesPath: 'CHANGELOG.md',
  // Directories whose text diff is included. null = auto-detect common source dirs, else whole repo.
  sourceDirs: null,
  // Extra pathspec globs to leave out of the diff and file list.
  ignore: [],
  // Formatter command with a {files} placeholder. null = detect prettier + package manager.
  formatCommand: null,
  // Language of the end-user notes. null = match existing notes, else the app's UI language.
  language: null,
  // Who reads the end-user notes, e.g. "recruiters using the hiring portal". null = "the app's users".
  audience: null,
  // Version used when no version can be found anywhere.
  firstReleaseVersion: '0.1.0',
}

const LOCKFILES = [
  'pnpm-lock.yaml',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
]
const GENERATED_DIRS = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  '.svelte-kit',
  '.turbo',
  '.cache',
  '.vite',
]
const GENERATED_FILE_GLOBS = ['*.min.js', '*.min.css', '*.map', '*.snap']
const SOURCE_DIR_CANDIDATES = [
  'src',
  'app',
  'apps',
  'packages',
  'lib',
  'libs',
  'server',
  'client',
  'pages',
  'components',
]
// Directories whose immediate children are meaningful groups (src/pages, packages/api, ...).
const CONTAINER_DIRS = new Set([
  'src',
  'app',
  'apps',
  'packages',
  'lib',
  'libs',
])
const MAX_COMMITS = 200
const MAX_LISTED_FILES_PER_GROUP = 30

const args = process.argv.slice(2)

function readFlag(name, fallback) {
  const index = args.indexOf(name)
  return index === -1 ? fallback : args[index + 1]
}

function git(...gitArgs) {
  return execFileSync('git', gitArgs, {
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function tryGit(...gitArgs) {
  try {
    return git(...gitArgs)
  } catch {
    return null
  }
}

// Every path below is relative to the repository root, wherever the script is launched from.
process.chdir(git('rev-parse', '--show-toplevel'))

function loadConfig() {
  if (!existsSync(CONFIG_PATH))
    return { config: { ...DEFAULT_CONFIG }, warnings: [] }

  let userConfig
  try {
    userConfig = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  } catch (error) {
    throw new Error(`${CONFIG_PATH} is not valid JSON: ${error.message}`)
  }

  const unknownKeys = Object.keys(userConfig).filter(
    (key) => !(key in DEFAULT_CONFIG)
  )
  return {
    config: { ...DEFAULT_CONFIG, ...userConfig },
    warnings: unknownKeys.map(
      (key) => `Unknown key "${key}" in ${CONFIG_PATH} (ignored)`
    ),
  }
}

function refExists(ref) {
  return tryGit('rev-parse', '--verify', '--quiet', ref) !== null
}

function resolveBaseRef(config) {
  const requested = readFlag('--base', null) ?? config.baseBranch
  if (requested) {
    const found = [requested, `origin/${requested}`].find(refExists)
    if (found) return found
    throw new Error(
      `Base branch "${requested}" not found (also tried origin/${requested}).`
    )
  }

  const currentBranch = tryGit('rev-parse', '--abbrev-ref', 'HEAD')
  const remoteDefault = tryGit(
    'symbolic-ref',
    '--short',
    'refs/remotes/origin/HEAD'
  )?.replace(/^origin\//, '')
  const names = [
    ...new Set([remoteDefault, 'main', 'master', 'develop']),
  ].filter((name) => name && name !== currentBranch)
  const candidates = names.flatMap((name) => [name, `origin/${name}`])
  const found = candidates.find(refExists)
  if (found) return found

  throw new Error(
    `Could not find a base branch (tried ${candidates.join(', ')}). ` +
      `Pass --base <ref> or set "baseBranch" in ${CONFIG_PATH}.`
  )
}

const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)/

function isVersion(value) {
  return typeof value === 'string' && SEMVER.test(value)
}

function parseVersion(version) {
  const match = SEMVER.exec(version ?? '')
  if (!match) throw new Error(`Not a semver version: "${version}"`)
  return match.slice(1).map(Number)
}

function compareVersions(a, b) {
  const left = parseVersion(a)
  const right = parseVersion(b)
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1
  }
  return 0
}

// Pre-release/build suffixes (1.2.3-beta.1) are dropped: a release always lands on a plain x.y.z.
function bumpVersion(version, level) {
  const [major, minor, patch] = parseVersion(version)
  if (level === 'major') return `${major + 1}.0.0`
  if (level === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

function readJsonAtRef(ref, path) {
  const raw = tryGit('show', `${ref}:${path}`)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readWorkingJson(path) {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

/**
 * The version to bump from. In order of trust:
 *   1. --base-version, an explicit one-off correction;
 *   2. "version" in the base branch's package.json (the source of truth);
 *   3. `latest` in the base branch's published user notes;
 *   4. nothing: this is the first release.
 */
function resolveBaseVersion(baseRef, config, baseNotes) {
  const flagVersion = readFlag('--base-version', null)
  if (flagVersion !== null) {
    if (!isVersion(flagVersion))
      throw new Error(`--base-version "${flagVersion}" is not x.y.z`)
    return {
      version: flagVersion.replace(/^v/, ''),
      source: '--base-version flag',
    }
  }

  const baseManifest = readJsonAtRef(baseRef, config.packageJsonPath)
  if (isVersion(baseManifest?.version)) {
    return {
      version: baseManifest.version,
      source: `${config.packageJsonPath} on ${baseRef}`,
    }
  }

  const notesVersion = baseNotes?.latest ?? baseNotes?.releases?.[0]?.version
  if (isVersion(notesVersion)) {
    return {
      version: notesVersion,
      source: `${config.userNotesPath} on ${baseRef}`,
    }
  }

  return { version: null, source: 'none found' }
}

const CONVENTIONAL_COMMIT = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/

function parseCommits(baseRef) {
  const raw = tryGit(
    'log',
    '--no-merges',
    '--format=%H%x1f%s%x1f%b%x1e',
    `${baseRef}..HEAD`
  )
  if (!raw) return { total: 0, list: [] }

  const entries = raw
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)

  const list = entries.slice(0, MAX_COMMITS).map((entry) => {
    const [hash, subject, body = ''] = entry.split('\x1f')
    const match = CONVENTIONAL_COMMIT.exec(subject)
    return {
      hash: hash.slice(0, 7),
      subject,
      type: match ? match[1].toLowerCase() : null,
      description: match ? match[4] : subject,
      breaking: Boolean(match?.[3]) || /BREAKING[ -]CHANGE/.test(body),
      body: body.trim(),
    }
  })

  return { total: entries.length, list }
}

function detectSourceDirs(config) {
  if (Array.isArray(config.sourceDirs)) return config.sourceDirs
  return SOURCE_DIR_CANDIDATES.filter((dir) => existsSync(dir))
}

// Pathspecs that keep lockfiles, generated output and the release files themselves out of the diff.
function buildExcludeSpecs(config) {
  const releaseFiles = [
    config.userNotesPath,
    config.developerNotesPath,
    CONFIG_PATH,
  ]
  return [
    ...LOCKFILES.map((name) => `:(exclude,glob)**/${name}`),
    ...GENERATED_DIRS.map((dir) => `:(exclude,glob)**/${dir}/**`),
    ...GENERATED_FILE_GLOBS.map((glob) => `:(exclude,glob)**/${glob}`),
    ...releaseFiles.map((path) => `:(exclude)${path}`),
    ...config.ignore.map((glob) => `:(exclude,glob)${glob}`),
  ]
}

function groupOf(path) {
  const parts = path.split('/')
  const file = parts[parts.length - 1]

  if (file === 'package.json') return 'dependencies'
  if (parts.length === 1) return /\.mdx?$/.test(file) ? 'docs' : 'root'
  if (CONTAINER_DIRS.has(parts[0]) && parts.length > 2)
    return `${parts[0]}/${parts[1]}`
  return parts[0]
}

function groupChangedFiles(mergeBase, excludeSpecs) {
  const raw = tryGit(
    'diff',
    '--name-status',
    '--find-renames',
    mergeBase,
    '--',
    '.',
    ...excludeSpecs
  )
  const groups = {}
  if (!raw) return groups

  for (const line of raw.split('\n')) {
    const [status, first, second] = line.split('\t')
    const path = second ?? first
    const group = (groups[groupOf(path)] ??= {
      added: 0,
      modified: 0,
      deleted: 0,
      renamed: 0,
      files: [],
    })

    if (status.startsWith('A')) group.added += 1
    else if (status.startsWith('D')) group.deleted += 1
    else if (status.startsWith('R')) group.renamed += 1
    else group.modified += 1

    if (group.files.length < MAX_LISTED_FILES_PER_GROUP) {
      group.files.push(`${status[0]} ${path}`)
    }
  }

  return groups
}

function readSourceDiff(mergeBase, sourceDirs, excludeSpecs, maxDiffLines) {
  // Deleted files are listed in changedFiles; their removed content only adds noise.
  const scope = sourceDirs.length > 0 ? sourceDirs : ['.']
  const raw =
    tryGit(
      'diff',
      '--unified=2',
      '--diff-filter=AMR',
      mergeBase,
      '--',
      ...scope,
      ...excludeSpecs
    ) ?? ''
  const lines = raw.split('\n')
  return {
    diffScope: scope,
    diff: lines.slice(0, maxDiffLines).join('\n'),
    diffTotalLines: lines.length,
    diffTruncated: lines.length > maxDiffLines,
  }
}

function isPreStable(baseVersion) {
  return baseVersion !== null && parseVersion(baseVersion)[0] === 0
}

function suggestBump(commits, baseVersion) {
  if (baseVersion === null) return 'initial'

  const hasBreaking = commits.some((commit) => commit.breaking)
  const hasFeature = commits.some((commit) => commit.type === 'feat')

  // Before 1.0.0, breaking changes and features both move the minor number;
  // "major" would mean declaring the API stable, which is never inferred.
  if (isPreStable(baseVersion))
    return hasBreaking || hasFeature ? 'minor' : 'patch'

  if (hasBreaking) return 'major'
  return hasFeature ? 'minor' : 'patch'
}

function computeNextVersions(baseVersion, config) {
  if (baseVersion === null) return { initial: config.firstReleaseVersion }

  return {
    major: bumpVersion(baseVersion, 'major'),
    minor: bumpVersion(baseVersion, 'minor'),
    patch: bumpVersion(baseVersion, 'patch'),
  }
}

function detectFormatCommand(config) {
  if (config.formatCommand) return config.formatCommand

  const manifest = readWorkingJson(config.packageJsonPath)
  const hasPrettier = Boolean(
    manifest?.dependencies?.prettier ?? manifest?.devDependencies?.prettier
  )
  if (!hasPrettier) return null

  const runner = existsSync('pnpm-lock.yaml')
    ? 'pnpm exec'
    : existsSync('yarn.lock')
      ? 'yarn'
      : existsSync('bun.lock') || existsSync('bun.lockb')
        ? 'bunx'
        : 'npx'
  return `${runner} prettier --write {files}`
}

function readDirtyFiles(config) {
  const releaseFiles = [
    config.packageJsonPath,
    config.userNotesPath,
    config.developerNotesPath,
    CONFIG_PATH,
  ]
  const raw = tryGit('status', '--porcelain') ?? ''
  return (
    raw
      .split('\n')
      .filter(Boolean)
      // `git()` trims, which eats the leading space of the first porcelain line (" M path"),
      // so strip the status column by pattern instead of by fixed width.
      .map((line) => line.replace(/^\s*[A-Z?!]{1,2}\s+/, ''))
      .filter((path) => !releaseFiles.includes(path))
  )
}

// Local calendar date: toISOString() is UTC and reads "tomorrow" late in the evening west of Greenwich.
function localDate() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function samplePriorNotes(baseNotes) {
  const release = baseNotes?.releases?.[0]
  if (!release) return null
  return {
    version: release.version,
    title: release.title,
    changes: (release.changes ?? []).slice(0, 3),
  }
}

const { config, warnings } = loadConfig()
const baseRef = resolveBaseRef(config)
const mergeBase = git('merge-base', baseRef, 'HEAD')
const baseNotes = readJsonAtRef(baseRef, config.userNotesPath)
const base = resolveBaseVersion(baseRef, config, baseNotes)
const currentVersion = readWorkingJson(config.packageJsonPath)?.version ?? null
const commits = parseCommits(baseRef)
const suggestedBump = suggestBump(commits.list, base.version)
const nextVersions = computeNextVersions(base.version, config)
const sourceDirs = detectSourceDirs(config)
const excludeSpecs = buildExcludeSpecs(config)

// A release already prepared on this branch is the notes entry matching the branch's own version.
const workingNotes = readWorkingJson(config.userNotesPath)
const versionDiffersFromBase =
  base.version !== null && currentVersion !== base.version
const existingRelease =
  currentVersion !== null && (versionDiffersFromBase || base.version === null)
    ? ((workingNotes?.releases ?? []).find(
        (release) => release.version === currentVersion
      ) ?? null)
    : null

const context = {
  branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
  today: localDate(),
  baseRef,
  // null when no version could be found anywhere: this branch is then the first release.
  baseVersion: base.version,
  baseVersionSource: base.source,
  isFirstRelease: base.version === null,
  isPreStable: isPreStable(base.version),
  currentVersion,
  alreadyBumped: existingRelease !== null || versionDiffersFromBase,
  // package.json is *lower* than the base version: a deliberate correction, or a mistake. Ask.
  versionRegression:
    base.version !== null &&
    currentVersion !== null &&
    compareVersions(currentVersion, base.version) < 0,
  suggestedBump,
  suggestedVersion: nextVersions[suggestedBump],
  nextVersions,
  existingRelease,
  // False when the base branch has published no user notes yet (nothing to compare with).
  hasPriorUserNotes: (baseNotes?.releases ?? []).length > 0,
  priorNotesSample: samplePriorNotes(baseNotes),
  config: {
    ...config,
    sourceDirs,
    formatCommand: detectFormatCommand(config),
  },
  configWarnings: warnings,
  dirtyNonReleaseFiles: readDirtyFiles(config),
  commitCount: commits.total,
  commits: commits.list,
  diffStat:
    tryGit('diff', '--shortstat', mergeBase, '--', '.', ...excludeSpecs) ?? '',
  changedFiles: groupChangedFiles(mergeBase, excludeSpecs),
  ...readSourceDiff(
    mergeBase,
    sourceDirs,
    excludeSpecs,
    Number(readFlag('--max-diff-lines', 1500))
  ),
}

process.stdout.write(`${JSON.stringify(context, null, 2)}\n`)
