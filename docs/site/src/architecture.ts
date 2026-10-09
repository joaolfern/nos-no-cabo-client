export type NodeKind =
  'client' | 'worker' | 'private' | 'store' | 'queue' | 'external'

export interface ArchNode {
  id: string
  kind: NodeKind
  label: string
  sub: string
  x: number
  y: number
  summary: string
  facts: string[]
  cron?: string
  diagram?: string
}

export type EdgeKind = 'http' | 'binding' | 'rpc' | 'queue' | 'data' | 'notify'

export interface ArchEdge {
  id: string
  from: string
  to: string
  kind: EdgeKind
  label: string
  via?: [number, number][]
  labelAt?: number
}

export type FlowStep =
  | { edge: string; reverse?: boolean; caption: string }
  | { node: string; caption: string }

export interface Flow {
  id: string
  title: string
  summary: string
  diagram: string
  steps: FlowStep[]
}

export const EDGE_KINDS: Record<EdgeKind, string> = {
  http: 'HTTP',
  binding: 'Service binding',
  rpc: 'RPC',
  queue: 'Queue',
  data: 'Database',
  notify: 'Email and push',
}

export const NODES: ArchNode[] = [
  {
    id: 'spa',
    kind: 'client',
    label: 'nos-client',
    sub: 'nosnocabo.com.br',
    x: 110,
    y: 300,
    summary:
      'The React SPA, served as static assets by the nosnocabo Worker. Keeps drafts, the voter id and the terms acceptance in localStorage.',
    facts: [
      'React 19, react-router 7, TanStack Query (60 s stale time)',
      'Every visit link goes through the router (/r/<code>)',
      'Landing page ring baked at deploy (ringSnapshot.json)',
      'Deployed by hand: pnpm run deploy:web',
    ],
    diagram: 'v1/frontend/20-modules',
  },
  {
    id: 'sw',
    kind: 'client',
    label: 'sw.js',
    sub: 'service worker',
    x: 110,
    y: 780,
    summary:
      'Shows the Web Push notification when a submission is published or rejected, and opens the site on click.',
    facts: [
      'Registered once notification permission is granted',
      'Off while MSW mocks run, or without a VAPID public key',
    ],
    diagram: 'v1/backend/17-seq-web-push',
  },
  {
    id: 'members',
    kind: 'external',
    label: 'Member sites',
    sub: 'the webring widget',
    x: 400,
    y: 780,
    summary:
      'The projects in the ring. Their widget links point to the router; verification fetches them to find the widget.',
    facts: [
      'Widget marker: data-nnc-widget="<id>"',
      'Links: /ring/:id/prev, next, random and the home page',
    ],
    diagram: 'v1/backend/15-seq-verification',
  },
  {
    id: 'turnstile',
    kind: 'external',
    label: 'Turnstile',
    sub: 'bot check',
    x: 700,
    y: 90,
    summary:
      'Cloudflare Turnstile. Every write a visitor makes carries a token: submit, report, vote.',
    facts: [
      'Validated server-side with siteverify',
      'No per-IP limits anywhere',
    ],
  },
  {
    id: 'gateway',
    kind: 'worker',
    label: 'gateway',
    sub: 'api.nosnocabo.com.br',
    x: 400,
    y: 300,
    summary:
      'The public /v1 API. Applies CORS and forwards each route to its service over service bindings.',
    facts: [
      'POST /v1/websites/:id/verify → verification',
      'GET …/stats, POST …/votes → metrics',
      'GET /v1/websites/:id/page: website + neighbours + stats in one request',
      'Everything else under /v1 → catalog',
    ],
    diagram: 'v1/backend/10-services',
  },
  {
    id: 'router',
    kind: 'worker',
    label: 'router',
    sub: 'nosnocabo.com.br/ring/*, /r/*',
    x: 400,
    y: 560,
    summary:
      'Answers widget and short links with a 302, then records the click without making the visitor wait.',
    facts: [
      'Ring snapshot in memory; checks getRingVersion every 60 s',
      'Keeps a stale snapshot if the catalog fails',
      'Unknown ids and codes go to the home page',
      'robots.txt keeps crawlers out of /ring/ and /r/',
    ],
    diagram: 'v1/backend/16-seq-clicks-ranking',
  },
  {
    id: 'pushsvc',
    kind: 'external',
    label: 'Push services',
    sub: 'browser vendors',
    x: 1260,
    y: 780,
    summary:
      'The browser vendors’ push endpoints (FCM, Mozilla, Apple). The catalog sends them an encrypted, VAPID-signed message.',
    facts: ['RFC 8291 encryption and RFC 8292 VAPID on WebCrypto'],
    diagram: 'v1/backend/17-seq-web-push',
  },
  {
    id: 'verification',
    kind: 'worker',
    label: 'verification',
    sub: 'no public URL',
    x: 700,
    y: 780,
    summary:
      'Checks that a member site shows the widget, on request and hourly. Only the hourly recheck can remove the badge.',
    facts: [
      'One check per site per minute (atomic claim, else 429)',
      'Reads the first 1 MB of the page with HTMLRewriter',
      'Two misses in a row remove the badge',
    ],
    cron: 'Every hour at :17 (17 * * * *), rechecks up to 20 verified sites.',
    diagram: 'v1/backend/15-seq-verification',
  },
  {
    id: 'catalog',
    kind: 'worker',
    label: 'catalog',
    sub: 'no public URL',
    x: 700,
    y: 300,
    summary:
      'Owns the websites. The only Worker that writes the catalog database; the others call CatalogRpc.',
    facts: [
      'Submit, list, search, categories, reports, subscriptions',
      'Scrapes a site’s title, description and colour for the form preview',
      'CatalogRpc: moderation, ring, verification and metrics methods',
      'Sends alert emails and reads review replies (dismiss | ban)',
      'Sends Web Push when a submission is decided',
    ],
    cron: 'Every hour at :41 (41 * * * *), pushes decisions made by review and drops subscriptions older than 7 days.',
    diagram: 'v1/backend/10-services',
  },
  {
    id: 'metrics',
    kind: 'worker',
    label: 'metrics',
    sub: 'no public URL',
    x: 700,
    y: 560,
    summary:
      'Counts clicks without cookies, keeps votes, and pushes rank_score and likes to the catalog.',
    facts: [
      'Visitor = SHA-256(salt : day : IP /64 : user-agent), deleted after its day',
      'Bots and link previews are skipped',
      'score = 3·ln(1+clicks30d) + ln(1+clicks) + 2·verified',
    ],
    cron: 'Every 3 hours at :23 (23 */3 * * *), pushes rank_score and likes to the catalog.',
    diagram: 'v1/backend/16-seq-clicks-ranking',
  },
  {
    id: 'catalogDb',
    kind: 'store',
    label: 'catalog D1',
    sub: 'nnc-catalog',
    x: 980,
    y: 380,
    summary:
      'websites, categories, FTS5 search, reports, moderation results and backlog, push subscriptions.',
    facts: [
      'Counts, categories and search kept by triggers (ADR 0005)',
      'Migrations 0001–0011',
    ],
    diagram: 'v1/backend/11-data-model',
  },
  {
    id: 'metricsDb',
    kind: 'store',
    label: 'metrics D1',
    sub: 'nnc-metrics',
    x: 980,
    y: 600,
    summary: 'visits (dedupe only), daily_stats, site_totals and votes.',
    facts: ['daily_stats and site_totals kept by triggers'],
    diagram: 'v1/backend/11-data-model',
  },
  {
    id: 'queue',
    kind: 'queue',
    label: 'moderation-jobs',
    sub: 'queue + DLQ',
    x: 980,
    y: 190,
    summary:
      'One message per submission. Failures retry 3 times, then go to the dead-letter queue, which holds the site for review.',
    facts: ['Batches of 5, concurrency 2'],
    diagram: 'v1/backend/14-seq-submit-moderation',
  },
  {
    id: 'moderation',
    kind: 'private',
    label: 'moderation',
    sub: 'private repo',
    x: 1260,
    y: 190,
    summary:
      'Checks a submission’s text with Workers AI and tells the catalog to publish, reject or hold it. Its code is private.',
    facts: [
      'At most 250 AI checks per UTC day',
      'Over budget: the site waits in the backlog',
    ],
    cron: 'Daily at 00:05 UTC (5 0 * * *), drains the backlog with the new day’s budget.',
    diagram: 'v1/backend/14-seq-submit-moderation',
  },
  {
    id: 'ai',
    kind: 'external',
    label: 'Workers AI',
    sub: 'content check',
    x: 1260,
    y: 50,
    summary: 'Classifies the submitted text.',
    facts: ['Free plan: 10k neurons per day'],
  },
  {
    id: 'email',
    kind: 'external',
    label: 'Email Routing',
    sub: 'alertas@nosnocabo.com.br',
    x: 1260,
    y: 470,
    summary:
      'Delivers alerts to the reviewer and routes their replies back to the catalog’s email handler.',
    facts: [
      'Reply-To carries the site id and an HMAC signature',
      'Only replies from ALERT_TO act',
    ],
    diagram: 'v1/backend/18-seq-report-review',
  },
]

export const EDGES: ArchEdge[] = [
  {
    id: 'spa-gateway',
    from: 'spa',
    to: 'gateway',
    kind: 'http',
    label: 'REST /v1',
  },
  {
    id: 'spa-turnstile',
    from: 'spa',
    to: 'turnstile',
    kind: 'http',
    label: 'token',
  },
  {
    id: 'spa-router',
    from: 'spa',
    to: 'router',
    kind: 'http',
    label: 'Visitar site',
  },
  {
    id: 'members-router',
    from: 'members',
    to: 'router',
    kind: 'http',
    label: 'widget links',
  },
  {
    id: 'gateway-catalog',
    from: 'gateway',
    to: 'catalog',
    kind: 'binding',
    label: '/v1/*',
  },
  {
    id: 'gateway-verification',
    from: 'gateway',
    to: 'verification',
    kind: 'binding',
    label: 'verify',
    via: [
      [560, 420],
      [560, 690],
    ],
  },
  {
    id: 'gateway-metrics',
    from: 'gateway',
    to: 'metrics',
    kind: 'binding',
    label: 'stats, votes',
    labelAt: 0.72,
  },
  {
    id: 'catalog-turnstile',
    from: 'catalog',
    to: 'turnstile',
    kind: 'http',
    label: 'siteverify',
  },
  {
    id: 'metrics-turnstile',
    from: 'metrics',
    to: 'turnstile',
    kind: 'http',
    label: 'siteverify',
    via: [
      [830, 480],
      [830, 160],
    ],
  },
  {
    id: 'verification-members',
    from: 'verification',
    to: 'members',
    kind: 'http',
    label: 'find widget',
  },
  {
    id: 'verification-catalog',
    from: 'verification',
    to: 'catalog',
    kind: 'rpc',
    label: 'CatalogRpc',
    via: [
      [860, 690],
      [860, 400],
    ],
  },
  {
    id: 'router-catalog',
    from: 'router',
    to: 'catalog',
    kind: 'rpc',
    label: 'getRing',
    labelAt: 0.3,
  },
  {
    id: 'router-metrics',
    from: 'router',
    to: 'metrics',
    kind: 'rpc',
    label: 'recordClick',
  },
  {
    id: 'metrics-catalog',
    from: 'metrics',
    to: 'catalog',
    kind: 'rpc',
    label: 'setMetrics',
  },
  {
    id: 'moderation-catalog',
    from: 'moderation',
    to: 'catalog',
    kind: 'rpc',
    label: 'applyModeration',
    via: [[1120, 290]],
  },
  {
    id: 'catalog-queue',
    from: 'catalog',
    to: 'queue',
    kind: 'queue',
    label: 'send',
  },
  {
    id: 'queue-moderation',
    from: 'queue',
    to: 'moderation',
    kind: 'queue',
    label: 'deliver',
  },
  {
    id: 'moderation-ai',
    from: 'moderation',
    to: 'ai',
    kind: 'http',
    label: 'classify',
  },
  {
    id: 'catalog-catalogDb',
    from: 'catalog',
    to: 'catalogDb',
    kind: 'data',
    label: 'D1',
  },
  {
    id: 'metrics-metricsDb',
    from: 'metrics',
    to: 'metricsDb',
    kind: 'data',
    label: 'D1',
  },
  {
    id: 'catalog-email',
    from: 'catalog',
    to: 'email',
    kind: 'notify',
    label: 'alerts, replies',
    via: [[1120, 470]],
  },
  {
    id: 'catalog-pushsvc',
    from: 'catalog',
    to: 'pushsvc',
    kind: 'notify',
    label: 'Web Push',
    via: [
      [880, 470],
      [1120, 560],
      [1120, 700],
    ],
  },
  {
    id: 'pushsvc-sw',
    from: 'pushsvc',
    to: 'sw',
    kind: 'notify',
    label: 'push event',
    via: [
      [1260, 870],
      [110, 870],
    ],
  },
]

export const FLOWS: Flow[] = [
  {
    id: 'submit',
    title: 'Submit a site',
    summary:
      'Anyone submits a site. It stays a private draft until the content check publishes it.',
    diagram: 'v1/backend/14-seq-submit-moderation',
    steps: [
      { edge: 'spa-turnstile', caption: 'The form gets a Turnstile token.' },
      {
        edge: 'spa-gateway',
        caption: 'POST /v1/websites with the submission and the token.',
      },
      {
        edge: 'gateway-catalog',
        caption: 'The gateway forwards it to the catalog.',
      },
      {
        edge: 'catalog-turnstile',
        caption: 'The catalog validates the token.',
      },
      {
        edge: 'catalog-catalogDb',
        caption:
          'A duplicate URL gets a 409. A new site is stored as checking.',
      },
      {
        edge: 'catalog-queue',
        caption:
          'The catalog queues a moderation job and answers 202. The SPA keeps a local draft.',
      },
      {
        edge: 'queue-moderation',
        caption: 'The moderation Worker takes the job.',
      },
      {
        edge: 'moderation-catalog',
        reverse: true,
        caption:
          'It reads the site and takes one check from the daily AI budget. Over budget, the site waits in the backlog.',
      },
      { edge: 'moderation-ai', caption: 'Workers AI classifies the text.' },
      {
        edge: 'moderation-catalog',
        caption: 'applyModeration: publish, reject or hold for review.',
      },
      {
        edge: 'catalog-email',
        caption: 'The reviewer gets an alert they can answer by email.',
      },
      {
        edge: 'catalog-pushsvc',
        caption: 'If the submitter subscribed, the catalog sends a Web Push.',
      },
      {
        edge: 'pushsvc-sw',
        caption: 'The service worker shows "{name} foi publicado".',
      },
    ],
  },
  {
    id: 'click',
    title: 'Follow a widget link',
    summary:
      'A ring link sends the visitor on at once; the click and the referral are counted afterwards.',
    diagram: 'v1/backend/16-seq-clicks-ranking',
    steps: [
      {
        edge: 'members-router',
        caption:
          'A visitor clicks "next" in a member site’s widget: /ring/:id/next.',
      },
      {
        node: 'router',
        caption:
          'The router picks the neighbour from its in-memory ring snapshot.',
      },
      {
        edge: 'members-router',
        reverse: true,
        caption: '302 to the neighbour site. Nothing waits for metrics.',
      },
      {
        edge: 'router-metrics',
        caption:
          'In waitUntil: recordClick with a cookieless, daily visitor hash.',
      },
      {
        edge: 'metrics-metricsDb',
        caption:
          'One click for the target and one referral for the source, per visitor per day.',
      },
    ],
  },
  {
    id: 'rank',
    title: 'Rank "Melhores"',
    summary:
      'Every 3 hours, metrics turns clicks into rank_score for the feed’s default order.',
    diagram: 'v1/backend/16-seq-clicks-ranking',
    steps: [
      { node: 'metrics', caption: 'Cron 23 */3 * * * starts pushRanks.' },
      {
        edge: 'metrics-catalog',
        reverse: true,
        caption: 'getRankInputs: the published sites and which are verified.',
      },
      {
        edge: 'metrics-metricsDb',
        caption: 'Recent clicks, total clicks and net likes per site.',
      },
      {
        edge: 'metrics-catalog',
        caption: 'setMetrics with only the values that changed.',
      },
      {
        edge: 'catalog-catalogDb',
        caption: 'GET /v1/websites?sort=melhores now reads the new order.',
      },
    ],
  },
  {
    id: 'vote',
    title: 'Vote',
    summary:
      'A 👍 or 👎 changes the net likes "Curtidos" sorts by, right away.',
    diagram: 'v1/backend/16-seq-clicks-ranking',
    steps: [
      { edge: 'spa-turnstile', caption: 'The vote gets a Turnstile token.' },
      {
        edge: 'spa-gateway',
        caption: 'POST /v1/websites/:id/votes with a random voter id.',
      },
      {
        edge: 'gateway-metrics',
        caption: 'The gateway forwards it to metrics.',
      },
      { edge: 'metrics-turnstile', caption: 'Metrics validates the token.' },
      {
        edge: 'metrics-catalog',
        reverse: true,
        caption: 'isPublished: only published sites take votes.',
      },
      {
        edge: 'metrics-metricsDb',
        caption: 'The vote is stored hashed; triggers update the totals.',
      },
      {
        edge: 'metrics-catalog',
        caption: 'setMetrics pushes the new net likes.',
      },
    ],
  },
  {
    id: 'verify',
    title: 'Verify the widget',
    summary:
      'A site owner installs the widget and presses "Verificar" to earn the badge.',
    diagram: 'v1/backend/15-seq-verification',
    steps: [
      { edge: 'spa-gateway', caption: 'POST /v1/websites/:id/verify.' },
      {
        edge: 'gateway-verification',
        caption: 'The gateway forwards it to verification.',
      },
      {
        edge: 'verification-catalog',
        caption: 'It claims the one check per minute for this site.',
      },
      {
        edge: 'verification-members',
        caption:
          'It fetches the site and looks for data-nnc-widget with this id.',
      },
      {
        edge: 'verification-catalog',
        caption: 'Found: verified_at is set and the site ranks higher.',
      },
    ],
  },
  {
    id: 'report',
    title: 'Report and review',
    summary:
      'A report flags a site; the reviewer decides by replying to the alert email.',
    diagram: 'v1/backend/18-seq-report-review',
    steps: [
      {
        edge: 'spa-gateway',
        caption:
          'POST /v1/websites/:id/reports with a reason and a Turnstile token.',
      },
      {
        edge: 'gateway-catalog',
        caption: 'The gateway forwards it to the catalog.',
      },
      {
        edge: 'catalog-catalogDb',
        caption: 'The report is stored and the site flagged. It stays visible.',
      },
      {
        edge: 'catalog-email',
        caption: 'The reviewer gets an alert with a signed Reply-To.',
      },
      {
        edge: 'catalog-email',
        reverse: true,
        caption: 'They reply "dismiss" or "ban"; the email handler applies it.',
      },
      {
        edge: 'catalog-catalogDb',
        caption: 'dismiss clears the reports; ban rejects the site.',
      },
    ],
  },
  {
    id: 'page',
    title: 'Open a website page',
    summary: 'The website page is one request, composed by the gateway.',
    diagram: 'v1/frontend/23-data-layer',
    steps: [
      { edge: 'spa-gateway', caption: 'GET /v1/websites/:id/page.' },
      {
        edge: 'gateway-catalog',
        caption: 'In parallel: the website and its ring neighbours…',
      },
      {
        edge: 'gateway-metrics',
        caption: '…and its stats. If metrics fails, stats is null.',
      },
      {
        edge: 'spa-router',
        caption:
          '"Visitar site" goes through the router, which counts the click.',
      },
    ],
  },
]
