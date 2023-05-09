import Voronoi from 'voronoi'
import { generateRandomPoints, getPolygonCentroid, sortClockwise } from './math.service'
import Config from '../Config'

export function generateVoronoi2() {
  const points = generateRandomPoints(Config.canvas, Config.voronoi.cells, 0)
  const diagram = generateDiagram(points)
  const modified = generateCells(diagram)
  const relaxed = relaxeVoronoi(modified, Config.voronoi.relaxations)
  return relaxed
}

export function generateVoronoi() {
  const config = useConfig()
  const points = generateRandomPoints([config.width, config.height], config.nbPoints, config.margin)
  const diagram = generateDiagram(points)
  const modified = generateCells(diagram)
  const relaxed = relaxeVoronoi(modified, 3)
  const final = addExtraData(relaxed)

  const { cells } = useCell()
  cells.value = final

  return final
}

// ---

function generateDiagram(points) {
  const config = useConfig()
  const voronoi = new Voronoi()
  const bbox = { xl: config.margin, xr: config.width - config.margin, yt: config.margin, yb: config.height - config.margin }
  const diagram = voronoi.compute(points, bbox)

  diagram.cells = diagram.cells.map(c => ({
    ...c,
    halfedges: c.halfedges.map(h => ({
      ...h,
      edge: {
        ...h.edge,
        va: { x: Number((h.edge.va.x).toFixed(1)), y: Number((h.edge.va.y).toFixed(1)) },
        vb: { x: Number((h.edge.vb.x).toFixed(1)), y: Number((h.edge.vb.y).toFixed(1)) }
      }}
    ))
  }))

  diagram.edges = diagram.edges.map(e => ({
    ...e,
    va: { x: Number((e.va.x).toFixed(1)), y: Number((e.va.y).toFixed(1)) },
    vb: { x: Number((e.vb.x).toFixed(1)), y: Number((e.vb.y).toFixed(1)) }
  }))

  return diagram
}


// Cell calculation
// -> transform raw voronoi
// -> find next center & neighboors

function generateCells(diagram) {
  return diagram.cells.map(c => {

    // Points
    const set = Array.from(new Set(
      c.halfedges
      .map(h => h.edge)
      .map(e => [[e.va.x, e.va.y], [e.vb.x, e.vb.y]])
      .flat()
      .map(JSON.stringify)
    ))
    .map(JSON.parse)

    const points = sortClockwise(set)
      .map(p => ({
        x: p[0],
        y: p[1]
      }))

    // Neighboors
    const neighboors = Array.from(new Set(
      c.halfedges
      .map(h => h.edge)
      .map(e => {
        const n = []
        if(e.rSite) n.push(e.rSite.voronoiId)
        if(e.lSite) n.push(e.lSite.voronoiId)
        return n
      })
      .flat()
      .sort((a, b) => a - b)
    ))

    return {
      id: c.site.voronoiId,
      center: { x: c.site.x, y: c.site.y },
      nextCenter: getPolygonCentroid(points),
      points,
      neighboors
    }
  })
}

// Lloyd algorithm
function relaxeVoronoi(cells, i) {
  if(i >= 0) {
    const newCentroids = cells.map(cell => getPolygonCentroid(cell.points))
    const newDiagram = generateDiagram(newCentroids)
    const newCells = generateCells(newDiagram)
    return relaxeVoronoi(newCells, --i)
  }
  else {
    return cells
  }
}

function addExtraData(cells) {  
  return cells.map(cell => {
    delete cell.nextCenter
    
    return {
      ...cell,
      owner: null,
      colony: null,
      production: null
    }
  })
}