export interface DiagramGroup {
  title: string
  diagrams: { path: string; title: string; description: string }[]
}

export const DIAGRAM_GROUPS: DiagramGroup[] = [
  {
    title: 'System',
    diagrams: [
      {
        path: 'v1/00-system-context',
        title: 'System context',
        description: 'Who uses Nós no Cabo and what it talks to.',
      },
      {
        path: 'v1/01-deployment',
        title: 'Deployment',
        description:
          'Every Worker with its domain, D1s, queues, crons and bindings.',
      },
    ],
  },
  {
    title: 'Backend',
    diagrams: [
      {
        path: 'v1/backend/10-services',
        title: 'Services',
        description:
          'What each Worker serves, CatalogRpc and MetricsRpc, and who owns which data.',
      },
      {
        path: 'v1/backend/11-data-model',
        title: 'Data model',
        description: 'The catalog and metrics D1 schemas.',
      },
      {
        path: 'v1/backend/12-website-lifecycle',
        title: 'Website lifecycle',
        description:
          'checking → published or rejected, review, and the verified badge.',
      },
      {
        path: 'v1/backend/13-api-contract',
        title: 'API contract',
        description: 'The /v1 API and the redirects, from @nosnocabo/contract.',
      },
      {
        path: 'v1/backend/14-seq-submit-moderation',
        title: 'Submission and moderation',
        description: 'The queue, the daily AI budget and the decision.',
      },
      {
        path: 'v1/backend/15-seq-verification',
        title: 'Widget verification',
        description: 'On request and hourly.',
      },
      {
        path: 'v1/backend/16-seq-clicks-ranking',
        title: 'Clicks, votes and ranking',
        description: 'How "Melhores" gets its order.',
      },
      {
        path: 'v1/backend/17-seq-web-push',
        title: 'Web Push',
        description: 'Notifying submitters who left.',
      },
      {
        path: 'v1/backend/18-seq-report-review',
        title: 'Reports and review',
        description: 'Alert emails and review by reply.',
      },
    ],
  },
  {
    title: 'Frontend',
    diagrams: [
      {
        path: 'v1/frontend/20-modules',
        title: 'Feature modules',
        description:
          'Feature folders and their deliberate cross-feature imports.',
      },
      {
        path: 'v1/frontend/21-seq-submit-optimistic',
        title: 'Optimistic submit',
        description: 'The form, the local draft and its status checks.',
      },
      {
        path: 'v1/frontend/22-routes',
        title: 'Routes',
        description: 'The route map.',
      },
      {
        path: 'v1/frontend/23-data-layer',
        title: 'Data layer',
        description: 'Query and mutation hooks and the endpoints they call.',
      },
    ],
  },
  {
    title: 'UML',
    diagrams: [
      {
        path: 'v1/uml/30-use-case',
        title: 'Use cases',
        description:
          'Use case diagram: who does what, with include and extend.',
      },
      {
        path: 'v1/uml/31-class-domain',
        title: 'Domain model',
        description:
          'Class diagram: websites, categories, reports, votes and visits.',
      },
      {
        path: 'v1/uml/32-class-interfaces',
        title: 'Interfaces and contract',
        description:
          'Class diagram: CatalogRpc, MetricsRpc and the contract types.',
      },
      {
        path: 'v1/uml/33-object-snapshot',
        title: 'One moment',
        description:
          'Object diagram: a published site, a report and a draft in review.',
      },
      {
        path: 'v1/uml/34-package',
        title: 'Packages',
        description: 'Package diagram: both repos and their imports.',
      },
      {
        path: 'v1/uml/35-composite-catalog',
        title: 'Inside the catalog',
        description:
          'Composite structure: the catalog Worker’s parts and ports.',
      },
      {
        path: 'v1/uml/36-profile',
        title: 'Stereotypes',
        description: 'Profile diagram: the stereotypes these diagrams use.',
      },
      {
        path: 'v1/uml/37-activity-submission',
        title: 'Submitting a site',
        description: 'Activity diagram with swimlanes, from form to decision.',
      },
      {
        path: 'v1/uml/38-activity-ring-redirect',
        title: 'Answering a ring link',
        description: 'Activity diagram: the router’s decisions.',
      },
      {
        path: 'v1/uml/39-state-draft',
        title: 'A draft in the browser',
        description:
          'State machine: checks, rejection, expiry and notifications.',
      },
      {
        path: 'v1/uml/40-communication-website-page',
        title: 'Opening a website page',
        description: 'Communication diagram with numbered messages.',
      },
      {
        path: 'v1/uml/41-interaction-overview',
        title: 'Life of a listed site',
        description: 'Interaction overview linking the sequence diagrams.',
      },
      {
        path: 'v1/uml/42-timing-submission',
        title: 'A submitter who leaves',
        description: 'Timing diagram: why Web Push matters.',
      },
    ],
  },
]

export const diagramUrl = (path: string) => `diagrams/${path}.svg`
