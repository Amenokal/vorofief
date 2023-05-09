import { getDistance } from '@/game/services/math.service'
import { getHeightMap } from '@/game/services/map.service'
import { generateVoronoi } from '@/game/services/voronoi.service'

export function generateWorld() {
  generateVoronoi()
  addNaturalData()
  addPlayerData()
}

// ----------------------------------------------------------------------------------------------------

function addNaturalData() {
  setType()
  setWater()
  setShores()
}

// ---

function setType() {
  const { getPixelData } = useCanvas()
  const map = getHeightMap()
  const { cells } = useCell()

  cells.value.forEach(c => {
    const data = getPixelData(Math.floor(c.center.x), Math.floor(c.center.y))
    c.height = Number((data.at(0) / 255).toFixed(2))
    c.type = map.getType(c.height)
  })
}

function setWater() {
  const { width, height, waterIteration } = useConfig()
  const { cells } = useCell()
  const map = getHeightMap()

  cells.value.forEach(c => {
    if (c.points.find(p => p.x === 0 || p.x === width || p.y === 0 || p.y === height))
      c.type = "water"
  })

  for (let i = 0; i < waterIteration; i++) {
    cells.value
      .filter(c => c.type === "water")
      .forEach(c => {
        if (Math.random() < 1 / (i + .8))
          c.neighboors
            .map(n => cells.value.find(el => el.id === n))
            .forEach(n => n.type = "water")
      })
  }

  for (let i = 0; i < map.bays; i++) {
    addBay()
  }

  for (let i = 0; i < map.forests; i++) {
    addForest()
  }
}

function addBay() {
  const { cells } = useCell()

  const baySpots = cells.value
    .filter(c => c.type === "plain")
    .filter(c => {
      const ngb = c.neighboors
        .map(n => cells.value.find(el => el.id === n))

      if (ngb.find(n => n.type === "water"))
        return true
    })

  const bay = baySpots.at(Math.floor(Math.random() * baySpots.length))
  bay.type === "water"
  bay.neighboors
    .map(n => cells.value.find(el => el.id === n))
    .forEach(n => n.type = "water")
}

function addForest() {
  const { cells } = useCell()

  const forestSpots = cells.value.filter(c => c.type === "plain")
  const forest = forestSpots.at(Math.floor(Math.random() * forestSpots.length))
  forest.type === "forest"
  forest.neighboors
    .map(n => cells.value.find(el => el.id === n))
    .forEach(n => {
      if(n.type === "plain")
      n.type = "forest"
    })
}

function setShores() {
  const { cells } = useCell()

  cells.value
    .filter(c => c.type !== "water")
    .forEach(c => {
      const neighboors = c.neighboors
        .map(n => cells.value.find(el => el.id === n))

      if (neighboors.find(n => n.type === "water"))
        c.onShore = true
    })
}

// ----------------------------------------------------------------------------------------------------


export function addPlayerData() {
  setSpawns()
  addStarter()
}

// ---

function setSpawns() {
  const { cells } = useCell()
  const { players } = usePlayer()
  const { addColony } = useBuilding()

  const shore = cells.value.filter(c => c.onShore)
  const firstSpawn = shore.at(0)

  const spawns = crawlShore(firstSpawn)

  spawns.forEach((spawn, i) => {
    addColony(spawn, players.value.at(i), "village")
  })

  return spawns
}

// ---

let crawlerI = 0
let crawled = []
let spawns = []

function crawlShore(current) {

  const { cells } = useCell()
  const { players } = usePlayer()

  const shore = cells.value.filter(c => c.onShore)
  const minDist = Math.floor(shore.length / players.value.length)

  const nextShoreTile = getNextShore(current)

  crawled.push(nextShoreTile)

  if (crawlerI % minDist === 0 && spawns.length < players.value.length)
    spawns.push(nextShoreTile)

  crawlerI++

  if (crawlerI < shore.length)
  return crawlShore(nextShoreTile)

  else
  return spawns
}

function getNextShore(current) {
  const { cells } = useCell()
  const { height, width } = useConfig()
  const mapCenter = { x: width / 2, y: height / 2 }

  if(current) {
    const next = current.neighboors
    .map(n => cells.value.find(el => el.id === n))
    .filter(n => n.onShore && !crawled.find(p => n.id === p.id))
    .sort((a, b) => getDistance(a.center, mapCenter) - getDistance(b.center, mapCenter))
    .at(0)
    
    return next || goBack()
  }
}

function goBack(i = 1) {
  const { cells } = useCell()
  const { height, width } = useConfig()
  const mapCenter = { x: width / 2, y: height / 2 }

  if(crawled.at(crawlerI - i)) {
    const retry = crawled.at(crawlerI - i).neighboors
    .map(n => cells.value.find(el => el.id === n))
    .filter(n => n.onShore && !crawled.find(p => n.id === p.id))
    .sort((a, b) => getDistance(a.center, mapCenter) - getDistance(b.center, mapCenter))
    .at(0)
    
    return retry || goBack(++i)
  }
}

// -----------

function addStarter() {
  const { players, PLAYER } = usePlayer()

  players.value.forEach(player => {
    PLAYER.set(player.id)
    addStarterUnits()
    addStarterResources()
  })
}

function addStarterUnits() {
  const { PLAYER } = usePlayer()
  const { addUnit } = useUnit()

  const spawn = PLAYER.towns().find(c => c.owner.id === PLAYER.current().id)
  addUnit(spawn, PLAYER.current(), "civil", 2)
}

function addStarterResources() {
  const { PLAYER } = usePlayer()
  const { addResource } = useResource()

  addResource(PLAYER.current(), 'gold', 5)
  addResource(PLAYER.current(), 'food', 3)
  addResource(PLAYER.current(), 'wood', 3)
}