import './styles.css'
import { EDGE_KINDS, FLOWS, type ArchNode, type Flow } from './architecture'
import { DIAGRAM_GROUPS, diagramUrl } from './diagrams'
import { renderMap } from './map'

const PLAY_INTERVAL_MS = 2200
const VIEWS = ['map', 'diagrams', 'v0'] as const

const isWideLayout = () => window.matchMedia('(min-width: 861px)').matches

const $ = <T extends Element>(selector: string, root: ParentNode = document) =>
  root.querySelector<T>(selector)!

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = []
) {
  const node = Object.assign(document.createElement(tag), props)
  node.append(...children)
  return node
}

function showView() {
  const hash = location.hash.slice(1)
  const view = VIEWS.find((name) => name === hash) ?? 'map'
  document.querySelectorAll<HTMLElement>('section.view').forEach((section) => {
    section.hidden = section.dataset.view !== view
  })
  document.querySelectorAll<HTMLAnchorElement>('.tabs a').forEach((tab) => {
    if (tab.dataset.view === view) tab.setAttribute('aria-current', 'page')
    else tab.removeAttribute('aria-current')
  })
}

function renderDetail(node: ArchNode | null) {
  const detail = $<HTMLElement>('.detail')
  detail.hidden = node === null
  if (!node) return
  $('.detail-title', detail).textContent = node.label
  $('.detail-sub', detail).textContent = node.sub
  $('.detail-summary', detail).textContent = node.summary
  $('.detail-facts', detail).replaceChildren(
    ...node.facts.map((fact) => element('li', {}, [fact]))
  )
  const cron = $<HTMLElement>('.detail-cron', detail)
  cron.hidden = !node.cron
  cron.textContent = node.cron ?? ''
  const link = $<HTMLAnchorElement>('.detail-diagram', detail)
  link.hidden = !node.diagram
  if (node.diagram) link.href = diagramUrl(node.diagram)
}

function renderLegend() {
  $('.legend').replaceChildren(
    ...Object.entries(EDGE_KINDS).map(([kind, label]) =>
      element('li', { className: `legend-item legend-item--${kind}` }, [label])
    )
  )
}

function renderGallery() {
  $('.gallery').replaceChildren(
    ...DIAGRAM_GROUPS.map((group) =>
      element('section', { className: 'gallery-group' }, [
        element('h2', {}, [group.title]),
        element(
          'div',
          { className: 'gallery-grid' },
          group.diagrams.map((diagram) =>
            element(
              'a',
              {
                className: 'diagram-card',
                href: diagramUrl(diagram.path),
                target: '_blank',
                rel: 'noopener',
              },
              [
                element('span', { className: 'diagram-thumb' }, [
                  element('img', {
                    src: diagramUrl(diagram.path),
                    alt: '',
                    loading: 'lazy',
                  }),
                ]),
                element('strong', {}, [diagram.title]),
                element('span', { className: 'diagram-description' }, [
                  diagram.description,
                ]),
              ]
            )
          )
        ),
      ])
    )
  )
}

function setUpFlows() {
  const map = renderMap($('.map-host'), renderDetail)
  const player = $<HTMLElement>('.player')
  const flowList = $<HTMLElement>('.flows')
  const playButton = $<HTMLButtonElement>('[data-action="play"]', player)
  let flow: Flow | null = null
  let stepIndex = 0
  let timer: number | undefined

  function stop() {
    window.clearInterval(timer)
    timer = undefined
    playButton.textContent = 'Play'
  }

  function goTo(index: number) {
    if (!flow) return
    stepIndex = Math.max(0, Math.min(flow.steps.length - 1, index))
    map.showStep(flow, stepIndex)
    player.querySelectorAll('li').forEach((item, itemIndex) => {
      item.classList.toggle('is-done', itemIndex < stepIndex)
      if (itemIndex !== stepIndex) return item.removeAttribute('aria-current')
      item.setAttribute('aria-current', 'step')
      if (isWideLayout()) item.scrollIntoView({ block: 'nearest' })
    })
    $<HTMLButtonElement>('[data-action="prev"]', player).disabled =
      stepIndex === 0
    $<HTMLButtonElement>('[data-action="next"]', player).disabled =
      stepIndex === flow.steps.length - 1
  }

  function open(next: Flow) {
    stop()
    flow = next
    map.select(null)
    flowList.querySelectorAll('button').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.flow === next.id)
      )
    })
    player.hidden = false
    $('.player-summary', player).textContent = next.summary
    $<HTMLAnchorElement>('.player-diagram', player).href = diagramUrl(
      next.diagram
    )
    $('.player-steps', player).replaceChildren(
      ...next.steps.map((step, index) => {
        const item = element('li', {}, [
          element(
            'button',
            {
              type: 'button',
              className: 'step-button',
              onclick: () => {
                stop()
                goTo(index)
              },
            },
            [step.caption]
          ),
        ])
        return item
      })
    )
    goTo(0)
  }

  function close() {
    stop()
    flow = null
    player.hidden = true
    flowList
      .querySelectorAll('button')
      .forEach((button) => button.setAttribute('aria-pressed', 'false'))
    map.clearFlow()
  }

  function play() {
    if (!flow) return
    if (timer !== undefined) return stop()
    if (stepIndex === flow.steps.length - 1) goTo(0)
    playButton.textContent = 'Pause'
    timer = window.setInterval(() => {
      if (!flow || stepIndex >= flow.steps.length - 1) return stop()
      goTo(stepIndex + 1)
    }, PLAY_INTERVAL_MS)
  }

  flowList.replaceChildren(
    ...FLOWS.map((item) =>
      element(
        'button',
        { type: 'button', className: 'flow-button', onclick: () => open(item) },
        [item.title]
      )
    )
  )
  flowList.querySelectorAll('button').forEach((button, index) => {
    button.dataset.flow = FLOWS[index]!.id
    button.setAttribute('aria-pressed', 'false')
  })

  player.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-action]'
    )?.dataset.action
    if (action === 'prev') {
      stop()
      goTo(stepIndex - 1)
    }
    if (action === 'next') {
      stop()
      goTo(stepIndex + 1)
    }
    if (action === 'play') play()
    if (action === 'close') close()
  })

  document.addEventListener('keydown', (event) => {
    if (!flow || (event.target as HTMLElement).closest('input, textarea'))
      return
    if (event.key === 'ArrowRight') {
      stop()
      goTo(stepIndex + 1)
    }
    if (event.key === 'ArrowLeft') {
      stop()
      goTo(stepIndex - 1)
    }
    if (event.key === 'Escape') close()
  })

  $('.detail-close').addEventListener('click', () => map.select(null))
  $('.reset-view').addEventListener('click', () => map.resetView())
}

renderLegend()
renderGallery()
setUpFlows()
showView()
window.addEventListener('hashchange', showView)
