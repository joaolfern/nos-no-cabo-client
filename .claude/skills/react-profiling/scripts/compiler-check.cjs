// Usage: node .claude/skills/react-profiling/scripts/compiler-check.cjs <file> [--code]
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')

const projectRequire = createRequire(path.join(process.cwd(), 'package.json'))
const pluginPath = projectRequire.resolve('babel-plugin-react-compiler')
const babel = createRequire(pluginPath)('@babel/core')

const [file, flag] = process.argv.slice(2)
const events = []
const result = babel.transformSync(fs.readFileSync(file, 'utf8'), {
  filename: file,
  babelrc: false,
  configFile: false,
  parserOpts: { plugins: ['typescript', 'jsx'] },
  plugins: [
    [
      pluginPath,
      { panicThreshold: 'none', logger: { logEvent: (_, event) => events.push(event) } },
    ],
  ],
})

if (flag === '--code') {
  console.log(result.code)
} else {
  for (const event of events) {
    const reason = event.detail?.reason ?? event.detail?.options?.reason ?? ''
    console.log(event.kind, event.fnName ?? '', reason)
  }
}
