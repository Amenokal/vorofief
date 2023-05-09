import { insidePolygon } from "@/game/services/math.service"
import { groupBy } from "../game/services/helpers.service"

const cells = ref([])
const selectedCell = ref(null)

const useCell = () => {

  function getCellByClick(e) {
    const pos = { x: e.offsetX, y: e.offsetY }
    return cells.value.find(c => insidePolygon(pos, c))
  }
  
  function getCellById(id) {
    return cells.value.find(c => c.id === id)
  }

  function getCell({ e = false, id = false}) {
    if(!e && !id)
    return console.warn("can't set cell without coord or id")

    if(e)
    return getCellByClick(e)
    
    if(id)
    return getCellById(id)
  }

  function getSelectedCell() {
    return selectedCell.value || {name:""}
  }

  function getSelectedCellNeighboors() {
    return selectedCell.value.neighboors.map(neighboorId => cells.value.find(c => c.id === neighboorId))
  }

  function getOwnedCells(player) {
    return cells.value.filter(cell => cell.owner && cell.owner.id === player.id)
  }

  function setCellType(cell, type) {
    cell.type = type
  }



  // ----

  const CELL = {
    find: getCell,
    set: setCell,
    current: getSelectedCell,
    neighboors: getSelectedCellNeighboors,
    buildings: getCellBuildings,
    industries: getCellIndustries,
    civils: getCellCivils,
    units: getCellUnits,
    squads: getCellSquads,
  }

  function setCell({ e = false, id = false }) { 
    let cell = null

    if(e)
    cell = getCell({e})
    
    if(id)
    cell = getCell({id})

    if(cell.type !== "water" && cell.type !== "mountain")
    selectedCell.value = cell

    console.info('selected cell:', selectedCell.value)
  }

  function getCellNeighboors(cell) {
    return cell.neighboors.map(n => cells.value.find(c => n === c.id))
  }

  function getCellBuildings() {
    if(!selectedCell.value) return []

    const { buildings } = useBuilding()
    return buildings.value.filter(u => u.cell.id === selectedCell.value.id)
  }

  function getCellIndustries() {
    if(!selectedCell.value || !selectedCell.value.colony ) return []

    const { citizenTypes } = useUnit()
    const { buildings } = useBuilding()

    const industries = groupBy(getCellNeighboors(selectedCell.value)
      .filter(c => !c.colony)
      .filter(c => buildings.value.find(b => b.cell.id === c.id) || c.type === "water")
      .map(c => {
        if(c.type === "plain")
        return citizenTypes().find(c => c.key === "farmer")

        if(c.type === "forest")
        return citizenTypes().find(c => c.key === "woodcutter")

        if(c.type === "water")
        return citizenTypes().find(c => c.key === "fisherman")

        if(c.type === "hill" || c.type === "mountain")
        return citizenTypes().find(c => c.key === "miner")
      })
    , "key")

    return industries
  }

  function getCellCivils() {
    if(!selectedCell.value) return []

    const { units } = useUnit()
    const u = units.value.filter(u => u.cell.id === selectedCell.value.id && u.isCivil)
    return u
  }

  function getCellUnits() {
    if(!selectedCell.value) return []

    const { units } = useUnit()
    const u = units.value.filter(u => u.cell.id === selectedCell.value.id)
    return u
  }
  
  function getCellSquads() {
    if(!selectedCell.value) return []

    const { SQUAD } = useUnit()
    return SQUAD.all().filter(s => {
      if(!s.units.length)
      return []

      else
      return s.units.at(0).cell.id === selectedCell.value.id
    })
  }

  return {
    cells,
    CELL, 
    getCellUnits,
    getOwnedCells,
    setCellType
  }
}

export default useCell