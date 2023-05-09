function random(a, b) {
  return Math.floor(Math.random() * (b - a)) + a
}

export function generateRandomPoints([width, height], nPoints, margin) {
  const points = []
  for (let i = 0; i < nPoints; i++) {
    points.push({
      x: random(margin, width - margin),
      y: random(margin, height - margin)
    })
  }
  return points
}

// https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript
export function getPolygonCentroid(pts) {
  var first = pts[0], last = pts[pts.length-1]
  if (first.x != last.x || first.y != last.y) pts.push(first)
  var twicearea=0,
  x=0, y=0,
  nPts = pts.length,
  p1, p2, f
  for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
     p1 = pts[i]; p2 = pts[j]
     f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x)
     twicearea += f
     x += (p1.x + p2.x - 2 * first.x) * f
     y += (p1.y + p2.y - 2 * first.y) * f
  }
  f = twicearea * 3

  const nX = x/f + first.x, nY = y/f + first.y
  return { x: Number(nX.toFixed(1)), y: Number(nY.toFixed(1))}
}

export function insidePolygon(point, cell) {
  // ray-casting algorithm based on
  // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
  
  const vs = cell.points.map(p => [p.x, p.y])

  var x = point.x, y = point.y
  
  var inside = false

  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1]
      var xj = vs[j][0], yj = vs[j][1]
      
      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
  }
  
  return inside
}

export function sortClockwise (points) {
  if (!points) {
    return
  }
  else if (points.length === 0) {
    return []
  }
  
  // Find min max to get center
  // Sort from top to bottom
  const ySortedPoints = [...points].sort((a, b) => a[1] - b[1])

  // Get center y
  const cy = (ySortedPoints[0][1] + ySortedPoints[ySortedPoints.length - 1][1]) / 2

  // Sort from right to left
  const xSortedPoints = [...ySortedPoints].sort((a, b) => b[0] - a[0])

  // Get center x
  const cx = (xSortedPoints[0][0] + xSortedPoints[xSortedPoints.length - 1][0]) / 2

  // Center point
  const center = [cx, cy]

  const angle = (point) => Math.atan2(point[1] - center[1], point[0] - center[0])
 
  //  Sort clockwise;
  return [...points].sort((a, b) => angle(b) - angle(a))
}

export function getDistance({x1, y1}, {x2, y2}) {
  let y = x2 - x1
  let x = y2 - y1    
  return Math.sqrt(x * x + y * y)
}