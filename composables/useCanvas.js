const useCanvas = () => {

  const cvs = document.getElementById("canvas")
  const ctx = cvs.getContext('2d')
  ctx.lineWidth = "1.5"

  function save() { ctx.save() }
  function restore() { ctx.restore() }

  async function drawImage(map) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const w = cvs.width
        const a = (Math.floor(Math.random() * 4) * 90) * Math.PI / 180
        
        ctx.save()
        ctx.translate(w/2, w/2)
        ctx.rotate(a)
        ctx.drawImage(img, -w/2, -w/2, w, w)
        ctx.restore()
        resolve()
      }
      img.src = map.src
    })
  }

  function getPixelData(x, y) {
    return ctx.getImageData(x, y, 1, 1).data
  }

  function drawPoints({x, y}, r){
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.closePath()
  }

  function drawCircles({x, y}, r){
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.closePath()
  }

  function drawLine(from, to, color) {
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.closePath()

    if(color) ctx.strokeStyle = color
    ctx.stroke()
  }

  function drawArrow(from, to, color) {
    const { x: fromx, y: fromy } = from
    const { x: tox, y: toy } = to

    //variables to be used when creating the arrow
    var arrowWidth = 5;
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
 
    ctx.save();
    ctx.strokeStyle = color || "red";
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
               toy-headlen*Math.sin(angle+Math.PI/7));
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //draws the paths created above
    ctx.stroke();
    ctx.restore();
  }

  function drawCellBorders(cell, color) {
    ctx.beginPath()
    cell.points.forEach((point, i) => {
      if(i===0)
      ctx.moveTo(point.x, point.y)

      else 
      ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()

    ctx.strokeStyle = color || "red"
    ctx.stroke()
  }

  function drawCell(cell, player = false) {
    ctx.beginPath()
    cell.points.forEach((point, i) => {
      if(i===0)
      ctx.moveTo(point.x, point.y)

      else 
      ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()

    if(cell.type === "water") {
      ctx.fillStyle = `dodgerblue`
      ctx.strokeStyle = "white"
    }
    if(cell.type === "mountain") {
      ctx.fillStyle = `gray`
      ctx.strokeStyle = `rgb(159, 159, 159)`
    }
    if(cell.type === "hill") {
      ctx.fillStyle = `hsl(86, 37%, 20%)`
      ctx.strokeStyle = `hsl(86, 37%, 40%)`
    }
    if(cell.type === "forest") {
      ctx.fillStyle = `hsl(86, 37%, 30%)`
      ctx.strokeStyle = `hsl(86, 37%, 40%)`
    }
    if(cell.type === "plain") {
      ctx.fillStyle = `hsl(86, 37%, 60%)`        
      ctx.strokeStyle = `hsl(86, 37%, 40%)`
    }
    if(cell.type === "colony") {
      ctx.fillStyle = `rgb(222, 193, 158)`        
      ctx.strokeStyle = `rgb(209, 193, 175)`
    }

    if(player) {
      ctx.fillStyle = player.fillStyle       
      ctx.strokeStyle = player.strokeStyle
    }

    ctx.fill()
    ctx.stroke()
  }

  function drawTerritoryCell(cell) {
    ctx.beginPath()
    cell.points.forEach((point, i) => {
      if(i===0)
      ctx.moveTo(point.x, point.y)

      else 
      ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()

    if(cell.type === "water" || cell.type === "mountain") {
      ctx.fillStyle = `rgb(69, 69, 69)`
      ctx.strokeStyle = `white`
    }
    else {
      ctx.fillStyle = `gray`
      ctx.strokeStyle = "lightgray"
    }

    ctx.fill()
    ctx.stroke()
  }

  function drawTacticCell(cell) {
    ctx.beginPath()
    cell.points.forEach((point, i) => {
      if(i===0)
      ctx.moveTo(point.x, point.y)

      else 
      ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()

    if(cell.type === "water") {
      ctx.fillStyle = `black`
      ctx.strokeStyle = "black"
    }
    if(cell.type === "mountain") {
      ctx.fillStyle = `black`
      ctx.strokeStyle = `white`
    }
    if(cell.type === "hill") {
      ctx.fillStyle = `rgb(69, 69, 69)`
      ctx.strokeStyle = `white`
    }
    if(cell.type === "forest") {
      ctx.fillStyle = `gray`
      ctx.strokeStyle = `white`
    }
    if(cell.type === "plain") {
      ctx.fillStyle = `white`        
      ctx.strokeStyle = `gray`
    }
    if(cell.type === "colony" && cell.owner) {
      ctx.fillStyle = cell.owner.colors.main.fillStyle
      ctx.strokeStyle = cell.owner.colors.main.strokeStyle
    }

    ctx.fill()
    ctx.stroke()
  }


  function drawWithFilterColors(filters, cell) {
    if(filters.territory)
    drawTerritoryCell(cell)

    else if(filters.tactic)
    drawTacticCell(cell)

    else
    drawCell(cell)
  }

  function drawPlayerCells() {
    const { cells } = useCell()

    cells.value
      .filter(cell => cell.colony)
      .map(cell => ({...cell, neighboors: cell.neighboors.map(n => cells.value.find(c => c.id === n))}))
      .forEach(cell => {
        cell.neighboors
        .filter(n => n.type !== 'water')
        .forEach(n => {
          drawCell(n, cell.owner.colors.territory)
        })
        drawCell(cell, cell.owner.colors.main)
      })
  }

  function draw(filters) {
    const { cells } = useCell()
    const { width } = useConfig()
    ctx.clearRect(0, 0, width, width)
  
    cells.value
    .sort((a, b) => b.type === "water" ? -1 : 1)
    .forEach(cell =>  drawWithFilterColors(filters, cell))
  
    cells.value
    .filter(c => c.type === "mountain")
    .forEach(cell =>  drawWithFilterColors(filters, cell))

    if(filters.territory)
    drawPlayerCells()
  }

  return {
    canvas,
    save, restore,
    getPixelData,
    drawImage,
    drawPoints,
    drawCircles,
    drawLine,
    drawArrow,
    drawCell,
    drawCellBorders,
    draw
  }
}

export default useCanvas