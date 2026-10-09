import { select } from 'd3-selection'
import { curveBasis, line } from 'd3-shape'
import 'd3-transition'
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import {
  EDGES,
  EDGE_KINDS,
  NODES,
  type ArchEdge,
  type ArchNode,
  type EdgeKind,
  type Flow,
} from './architecture'

const NODE_WIDTH = 176
const NODE_HEIGHT = 56
const VIEW_WIDTH = 1400
const VIEW_HEIGHT = 900
const PULSE_MS = 900
const NARROW_WIDTH = 700
const NARROW_SCALE = 2.4
const NARROW_HOME = { x: 560, y: 320, width: 0, height: 0 }

const nodeById = new Map(NODES.map((node) => [node.id, node]))
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Point {
  x: number
  y: number
}

function anchor(node: ArchNode, toward: Point): Point & { side: Point } {
  const dx = toward.x - node.x
  const dy = toward.y - node.y
  const horizontal = Math.abs(dx) * NODE_HEIGHT > Math.abs(dy) * NODE_WIDTH
  if (horizontal) {
    const sign = Math.sign(dx) || 1
    return {
      x: node.x + (sign * NODE_WIDTH) / 2,
      y: node.y,
      side: { x: sign, y: 0 },
    }
  }
  const sign = Math.sign(dy) || 1
  return {
    x: node.x,
    y: node.y + (sign * NODE_HEIGHT) / 2,
    side: { x: 0, y: sign },
  }
}

const toPoint = ([x, y]: [number, number]): Point => ({ x, y })
const routedLine = line<Point>()
  .x((point) => point.x)
  .y((point) => point.y)
  .curve(curveBasis)

type Port = Point & { side: Point }

function rawEnds(edge: ArchEdge) {
  const from = nodeById.get(edge.from)!
  const to = nodeById.get(edge.to)!
  const via = (edge.via ?? []).map(toPoint)
  const fromToward = via[0] ?? to
  const toToward = via.at(-1) ?? from
  return [
    { node: from, toward: fromToward, port: anchor(from, fromToward) },
    { node: to, toward: toToward, port: anchor(to, toToward) },
  ]
}

function spreadPorts() {
  const ports = new Map<string, Port>()
  const groups = new Map<
    string,
    { key: string; toward: Point; port: Port; node: ArchNode }[]
  >()
  for (const edge of EDGES) {
    rawEnds(edge).forEach((end, index) => {
      const key = `${edge.id}:${index}`
      const group = `${end.node.id}:${end.port.side.x},${end.port.side.y}`
      groups.set(group, [...(groups.get(group) ?? []), { key, ...end }])
    })
  }
  for (const members of groups.values()) {
    const vertical = members[0]!.port.side.y !== 0
    const span = (vertical ? NODE_WIDTH : NODE_HEIGHT) * 0.6
    members.sort((a, b) =>
      vertical ? a.toward.x - b.toward.x : a.toward.y - b.toward.y
    )
    members.forEach((member, index) => {
      const offset =
        members.length === 1 ? 0 : (index / (members.length - 1) - 0.5) * span
      ports.set(member.key, {
        ...member.port,
        x: member.port.x + (vertical ? offset : 0),
        y: member.port.y + (vertical ? 0 : offset),
      })
    })
  }
  return ports
}

const PORTS = spreadPorts()

function edgePath(edge: ArchEdge) {
  const via = (edge.via ?? []).map(toPoint)
  const start = PORTS.get(`${edge.id}:0`)!
  const end = PORTS.get(`${edge.id}:1`)!
  if (via.length > 0) {
    const lead = {
      x: start.x + start.side.x * 24,
      y: start.y + start.side.y * 24,
    }
    const tail = { x: end.x + end.side.x * 24, y: end.y + end.side.y * 24 }
    return routedLine([start, lead, ...via, tail, end])!
  }
  const reach = Math.max(
    40,
    Math.hypot(end.x - start.x, end.y - start.y) * 0.35
  )
  const c1 = {
    x: start.x + start.side.x * reach,
    y: start.y + start.side.y * reach,
  }
  const c2 = { x: end.x + end.side.x * reach, y: end.y + end.side.y * reach }
  return `M${start.x},${start.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`
}

export interface MapController {
  showStep: (flow: Flow, index: number) => void
  clearFlow: () => void
  select: (nodeId: string | null) => void
  resetView: () => void
}

export function renderMap(
  container: HTMLElement,
  onSelectNode: (node: ArchNode | null) => void
): MapController {
  const svg = select(container)
    .append('svg')
    .attr('class', 'map')
    .attr('viewBox', `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`)
    .attr('role', 'img')
    .attr(
      'aria-label',
      'Map of the Nós no Cabo v1 system: Workers, databases, queue and third parties, connected by their bindings.'
    )

  const defs = svg.append('defs')
  const kinds = [...Object.keys(EDGE_KINDS), 'signal'] as (
    EdgeKind | 'signal'
  )[]
  for (const kind of kinds) {
    defs
      .append('marker')
      .attr('id', `arrow-${kind}`)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M0,1 L9,5 L0,9 z')
      .attr('class', `arrowhead arrowhead--${kind}`)
  }

  const viewport = svg.append('g').attr('class', 'viewport')
  const edgeLayer = viewport.append('g').attr('class', 'edges')
  const labelLayer = viewport.append('g').attr('class', 'edge-labels')
  const nodeLayer = viewport.append('g').attr('class', 'nodes')
  const signalLayer = viewport.append('g').attr('class', 'signals')

  const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
    SVGSVGElement,
    unknown
  >()
    .scaleExtent([0.5, 4])
    .on('zoom', (event) => viewport.attr('transform', event.transform))
  svg.call(zoomBehavior).on('dblclick.zoom', null)

  const edges = edgeLayer
    .selectAll<SVGPathElement, ArchEdge>('path')
    .data(EDGES, (edge) => edge.id)
    .join('path')
    .attr('class', (edge) => `edge edge--${edge.kind}`)
    .attr('d', edgePath)
    .attr('marker-end', (edge) => `url(#arrow-${edge.kind})`)

  const labels = labelLayer
    .selectAll<SVGGElement, ArchEdge>('g')
    .data(EDGES, (edge) => edge.id)
    .join('g')
    .attr('class', 'edge-label')
    .attr('transform', (edge) => {
      const path = edges.filter(({ id }) => id === edge.id).node()!
      const mid = path.getPointAtLength(
        path.getTotalLength() * (edge.labelAt ?? 0.5)
      )
      return `translate(${mid.x},${mid.y})`
    })
  labels
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .text((edge) => edge.label)
  labels.each(function () {
    const group = select(this)
    const box = (group.select('text').node() as SVGTextElement).getBBox()
    group
      .insert('rect', 'text')
      .attr('x', box.x - 4)
      .attr('y', box.y - 1)
      .attr('width', box.width + 8)
      .attr('height', box.height + 2)
      .attr('rx', 3)
  })

  const nodes = nodeLayer
    .selectAll<SVGGElement, ArchNode>('g')
    .data(NODES, (node) => node.id)
    .join('g')
    .attr('class', (node) => `node node--${node.kind}`)
    .attr(
      'transform',
      (node) =>
        `translate(${node.x - NODE_WIDTH / 2},${node.y - NODE_HEIGHT / 2})`
    )
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', (node) => `${node.label}, ${node.sub}`)

  nodes
    .append('rect')
    .attr('class', 'node-body')
    .attr('width', NODE_WIDTH)
    .attr('height', NODE_HEIGHT)
    .attr('rx', (node) => (node.kind === 'store' ? 18 : 6))
  nodes
    .append('rect')
    .attr('class', 'node-port')
    .attr('width', 6)
    .attr('height', NODE_HEIGHT - 16)
    .attr('x', 0)
    .attr('y', 8)
    .attr('rx', 2)
  nodes
    .append('text')
    .attr('class', 'node-label')
    .attr('x', 18)
    .attr('y', 24)
    .text((node) => node.label)
  nodes
    .append('text')
    .attr('class', 'node-sub')
    .attr('x', 18)
    .attr('y', 42)
    .text((node) => node.sub)
  nodes
    .filter((node) => Boolean(node.cron))
    .append('g')
    .attr('class', 'node-cron')
    .attr('transform', `translate(${NODE_WIDTH - 16},16)`)
    .call((clock) => {
      clock.append('title').text((node) => node.cron ?? '')
      clock.append('circle').attr('r', 7)
      clock.append('path').attr('d', 'M0,-4 V0 L3,2')
    })

  let selectedId: string | null = null
  let flowActive = false

  function connectedTo(nodeId: string) {
    return (edge: ArchEdge) => edge.from === nodeId || edge.to === nodeId
  }

  function highlightNode(nodeId: string | null) {
    if (flowActive) return
    const hasFocus = nodeId !== null
    const isConnected = nodeId ? connectedTo(nodeId) : () => false
    const neighbours = new Set(
      EDGES.filter(isConnected).flatMap((edge) => [edge.from, edge.to])
    )
    edges
      .classed('is-dim', (edge) => hasFocus && !isConnected(edge))
      .classed('is-lit', (edge) => isConnected(edge))
    labels
      .classed('is-dim', (edge) => hasFocus && !isConnected(edge))
      .classed('is-lit', (edge) => isConnected(edge))
    nodes.classed('is-dim', (node) => hasFocus && !neighbours.has(node.id))
  }

  nodes
    .on('mouseenter', (_event, node) => highlightNode(node.id))
    .on('mouseleave', () => highlightNode(selectedId))
    .on('click', (_event, node) => controller.select(node.id))
    .on('keydown', (event: KeyboardEvent, node) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        controller.select(node.id)
      }
    })

  svg.on('click', (event: MouseEvent) => {
    if (event.target === svg.node()) controller.select(null)
  })

  const isNarrow = () => container.clientWidth < NARROW_WIDTH

  function focusOn(box: {
    x: number
    y: number
    width: number
    height: number
  }) {
    const scale = isNarrow() ? NARROW_SCALE : 1
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    const transform = isNarrow()
      ? zoomIdentity
          .translate(
            VIEW_WIDTH / 2 - scale * centerX,
            VIEW_HEIGHT / 2 - scale * centerY
          )
          .scale(scale)
      : zoomIdentity
    svg
      .transition()
      .duration(prefersReducedMotion() ? 0 : 400)
      .call(zoomBehavior.transform, transform)
  }

  function sendSignal(path: SVGPathElement, reverse: boolean) {
    signalLayer.selectAll('*').interrupt().remove()
    if (prefersReducedMotion()) return
    const length = path.getTotalLength()
    const pointAt = (t: number) =>
      path.getPointAtLength(length * (reverse ? 1 - t : t))
    const start = pointAt(0)
    signalLayer
      .append('circle')
      .attr('class', 'signal')
      .attr('r', 7)
      .attr('cx', start.x)
      .attr('cy', start.y)
      .transition()
      .duration(PULSE_MS)
      .attrTween('cx', () => (t: number) => String(pointAt(t).x))
      .attrTween('cy', () => (t: number) => String(pointAt(t).y))
      .transition()
      .duration(250)
      .attr('r', 14)
      .style('opacity', 0)
      .remove()
  }

  function pingNode(node: ArchNode) {
    signalLayer.selectAll('*').interrupt().remove()
    if (prefersReducedMotion()) return
    signalLayer
      .append('rect')
      .attr('class', 'signal-ring')
      .attr('x', node.x - NODE_WIDTH / 2)
      .attr('y', node.y - NODE_HEIGHT / 2)
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .attr('rx', 8)
      .transition()
      .duration(PULSE_MS)
      .attr('x', node.x - NODE_WIDTH / 2 - 12)
      .attr('y', node.y - NODE_HEIGHT / 2 - 12)
      .attr('width', NODE_WIDTH + 24)
      .attr('height', NODE_HEIGHT + 24)
      .style('opacity', 0)
      .remove()
  }

  function stepTouches(flow: Flow, index: number) {
    const step = flow.steps[index]!
    if ('node' in step) return { edgeId: null, nodeIds: [step.node] }
    const edge = EDGES.find(({ id }) => id === step.edge)!
    return { edgeId: edge.id, nodeIds: [edge.from, edge.to] }
  }

  const controller: MapController = {
    showStep(flow, index) {
      flowActive = true
      const flowEdges = new Set<string>()
      const flowNodes = new Set<string>()
      flow.steps.forEach((_step, stepIndex) => {
        const { edgeId, nodeIds } = stepTouches(flow, stepIndex)
        if (edgeId) flowEdges.add(edgeId)
        nodeIds.forEach((id) => flowNodes.add(id))
      })
      const current = stepTouches(flow, index)
      const currentNodes = new Set(current.nodeIds)

      edges
        .classed('is-dim', (edge) => !flowEdges.has(edge.id))
        .classed('is-lit', false)
        .classed('is-flow', (edge) => flowEdges.has(edge.id))
        .classed('is-current', (edge) => edge.id === current.edgeId)
        .attr('marker-end', (edge) =>
          edge.id === current.edgeId
            ? 'url(#arrow-signal)'
            : `url(#arrow-${edge.kind})`
        )
      labels
        .classed('is-dim', (edge) => !flowEdges.has(edge.id))
        .classed('is-lit', false)
        .classed('is-current', (edge) => edge.id === current.edgeId)
      nodes
        .classed('is-dim', (node) => !flowNodes.has(node.id))
        .classed('is-current', (node) => currentNodes.has(node.id))

      const step = flow.steps[index]!
      if ('node' in step) {
        const node = nodeById.get(step.node)!
        if (isNarrow()) focusOn({ x: node.x, y: node.y, width: 0, height: 0 })
        pingNode(node)
        return
      }
      const path = edges.filter((edge) => edge.id === step.edge).node()
      if (!path) return
      if (isNarrow()) focusOn(path.getBBox())
      sendSignal(path, Boolean(step.reverse))
    },
    clearFlow() {
      flowActive = false
      signalLayer.selectAll('*').interrupt().remove()
      edges
        .classed('is-flow', false)
        .classed('is-current', false)
        .attr('marker-end', (edge) => `url(#arrow-${edge.kind})`)
      labels.classed('is-current', false)
      nodes.classed('is-current', false)
      highlightNode(selectedId)
    },
    select(nodeId) {
      selectedId = nodeId
      nodes.classed('is-selected', (node) => node.id === nodeId)
      highlightNode(nodeId)
      onSelectNode(nodeId ? nodeById.get(nodeId)! : null)
    },
    resetView() {
      focusOn(NARROW_HOME)
    },
  }

  if (isNarrow()) {
    svg.call(
      zoomBehavior.transform,
      zoomIdentity
        .translate(
          VIEW_WIDTH / 2 - NARROW_SCALE * NARROW_HOME.x,
          VIEW_HEIGHT / 2 - NARROW_SCALE * NARROW_HOME.y
        )
        .scale(NARROW_SCALE)
    )
  }

  return controller
}
