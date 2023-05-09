import { v4 as generateUUID } from 'uuid'
import { groupBy } from '../game/services/helpers.service'

import Civil from '@/components/units/CivilIcon.vue'
import Woodcutter from '@/components/units/WoodcutterIcon.vue'

const units = ref([])
const squads = ref([])
const tmpSquads = ref([])
const selectedSquad = ref(null)

const unitTypes = () => {
  const { RESOURCE } = useResource()
  return [
    // build a new citizen
    { id: 0, name: 'Villageois', key: 'citizen',
    isCivil: true,
    maxEnergy: 0, energy: 0,
    cost: [{ type: RESOURCE.food, nb: 3 }],
    },
    { id: 0, name: 'Civil', key: 'civil', action: null,
    cantBuild: true,
    isCivil: true,
    maxEnergy: 2, energy: 2,
    cost: [{ type: RESOURCE.citizen, nb: 1 }],
    upkeep: [{ type: RESOURCE.food, nb: 1 }],
    },

    { id: 1, name: 'Vougier', key: 'sergeant',
    isSergent: true,
    maxEnergy: 2, energy: 2,
    cost: [{ type: RESOURCE.citizen, nb: 1 }, { type: RESOURCE.wood, nb: 1 }, { type: RESOURCE.gold, nb: 2 }],
    upkeep: [{ type: RESOURCE.food, nb: 1 }, { type: RESOURCE.gold, nb: 1 }],
    },

    { id: 2, name: 'Archer', key: 'bow',
    isBowman: true,
    maxEnergy: 2, energy: 2,
    cost: [{ type: RESOURCE.citizen, nb: 1 }, { type: RESOURCE.wood, nb: 1 }, { type: RESOURCE.gold, nb: 2 }],
    upkeep: [{ type: RESOURCE.food, nb: 1 }, { type: RESOURCE.gold, nb: 2 }],
    },

    { id: 3, name: 'Chevalier', key: 'knight',
    isKnight: true,
    maxEnergy: 3, energy: 3,
    cost: [{ type: RESOURCE.citizen, nb: 1 }, { type: RESOURCE.gold, nb: 5 }, { type: RESOURCE.iron, nb: 1 }],
    upkeep: [{ type: RESOURCE.food, nb: 1 }, { type: RESOURCE.gold, nb: 3 }],
    },
  ]
}

const citizenTypes = () => {
  const { RESOURCE } = useResource()
  return [
    { id: 0, name: "Citoyen", key: 'idle',
      action: "idle",
      cost: [{ type: RESOURCE.food, nb: 3 }],
    },
    { id: 0, name: "Fermier", key: 'farmer',
      income: [{ type: RESOURCE.food, nb: 1 }],
    },
    { id: 1, name: "Pêcheur", key: 'fisherman',
      income: [{ type: RESOURCE.food, nb: 1 }],
    },
    { id: 2, name: "Bûcheron", key: 'woodcutter',
      income: [{ type: RESOURCE.wood, nb: 1 }],
    },
    { id: 3, name: "Mineur de pierre", key: 'stoneMiner',
      income: [{ type: RESOURCE.stone, nb: 1 }],
    },
    { id: 4, name: "Mineur de fer", key: 'ironMiner',
      income: [{ type: RESOURCE.iron, nb: 1 }],
    },
  ]
}

const idleCivils = computed(() => {
  const { PLAYER } = usePlayer()
  const { CELL } = useCell()

  if(!PLAYER.current() || !CELL.current().colony)
  return []

  return units.value.filter(u => u.player.id === PLAYER.current().id &&
    u.key === "civil" &&
    u.action === null &&
    !squads.value.find(s => s.units.find(sU => sU.id === u.id)) &&
    !u.path.length &&
    u.cell.id === CELL.current().id 
  )
})

const civilWithActivity = (activity) => {
  const { PLAYER } = usePlayer()
  const { CELL } = useCell()

  if(!PLAYER.current() || !CELL.current().colony)
  return []

  return units.value.filter(u => u.player.id === PLAYER.current().id &&
    u.key === "civil" &&
    u.action === activity &&
    !squads.value.find(sU => sU.id === u.id) &&
    !u.path.length &&
    u.cell.id === CELL.current().id 
  )
}

const previewUnits = computed(() => {
  return units.value
    .filter(u => u.path.length)
    .map(u => ({
      ...u,
      cell: u.path.at(-1)
    }))
})

function getCellUnits(cellId) {
  return units.value.filter(u => u.cell.id === cellId)
}

function getUnitAltIcon(unit) {
  if(unit.isCivil && unit.action === 'wood')
  return Woodcutter
  if(unit.isCivil && !unit.action)
  return Civil
}

const useUnit = () => {

    // --- UNITS ---

    
  function addUnit(cell, player, type, nb = 1) {
    for(let i = 0; i < nb; i++) {
      const typeInfos = unitTypes().find(t => t.key === type)
      const unit = {
        ...typeInfos,
        id: generateUUID(),
        cell, 
        player,
        path: [],
      }

      units.value.push(unit)
    }
  }

  function canProduceUnitHere(colony, unit) {
    if(unit.isCivil &&
      units.value.filter(u => u.isCivil &&
        u.path.length ? u.path.at(-1).id  : colony.cell.id || u.cell.id === colony.cell.id ).length >= colony.maxCitizens)
    {
      console.warn('max civil population reached')
      return false
    }
    else if(!unit.isCivil &&
      units.value.filter(u => !u.isCivil && (u.path.length ? u.path.at(-1).id : colony.cell.id) === colony.cell.id ).length >= colony.maxUnits)
    {
      console.warn('max soldiers population reached')
      return false
    }

    console.log('?')
    return true
  }


    // --- SQUADS ---


  function squadOnCell(squadId, cellId) {
    const squad = squads.value.find(s => s.id === squadId)

    if(!squad.units.length)
    return true

    if(squad.units.at(0).path.length)
    return squad.units.at(0).path.at(-1).id === cellId

    else
    return squad.units.at(0).cell.id === cellId
  }

  const SQUAD = {
    current: getSelectedSquad,
    position: getSquadPosition,
    all: getAllSquads,

    mapDisplayed: getMapDisplayed,
    mapPreviewDisplayed: getMapPreviewDisplayed,

    create: createSquad,
    select: selectSquad,
    addUnit: addUnitToSelectedSquad,
    removeUnit: removeUnitFromSelectedSquad,
    move: moveSquad,
    goBack: moveSquadBack,
    cancelMove: cancelSquadMove,
    remove: removeSquad,
  }

  // ----
  // GETTERS
  function getSelectedSquad() {
    return selectedSquad.value
  }

  function getSquadPosition() {
    const { CELL } = useCell()
    const unit = selectedSquad.value.units.at(0)

    if(!unit)
    return CELL.current()

    else if(!unit.path.length)
    return unit.cell

    else
    return unit.path.at(-1)
  }

  function getAllSquads() {
    return squads.value
  }

  // ----
  // MAP
  function getMapDisplayed() {
    const displayed = squads.value.reduce((acc, val) => {
      if(!val.units.length)
      return acc

      if(val.units.find(u => u.cell.colony || u.path.length ))
      return acc
      
      else
      return [...acc, val.units.at(0)]
    }, [])
    return displayed
  }
  
  function getMapPreviewDisplayed() {
    const displayed = squads.value.reduce((acc, val) => {
      if(!val.units.length)
      return acc

      if(val.units.find(u => !u.path.length || (u.path.length && u.path.at(-1).colony)))
      return acc

      else
      return [...acc, val.units.at(0)]
    }, [])
    return displayed
  }
  
  // ----
  // ACTIONS
  function createSquad(player) {
    const squad = {  
      id: generateUUID(),
      player,
      units: [],
    }
    squads.value.push(squad)
    selectedSquad.value = squads.value.find(s => s.id === squad.id)
  }

  function selectSquad(squad) {
    selectedSquad.value = squad
  }

  function addUnitToSelectedSquad(unit) {
    if(!selectedSquad.value)
    return console.warn("add unit - no selected squad")

    if(selectedSquad.value.units.find(u => u.type !== unit.type))
    return console.warn("add unit - can't add different unit type")

    if(selectedSquad.value.units.length > 2)
    return console.warn("add unit - maximum squad size reached")

    selectedSquad.value.units.push(unit)
  }

  function removeUnitFromSelectedSquad(unit) {
    if(!selectedSquad.value)
    return console.warn("remove unit - no selected squad")

    if((unit.path.length && unit.path.at(-1).colony && !unit.path.at(-1).owner && unit.path.at(-1).owner && unit.path.at(-1).owner.id !== unit.player.id) ||
       (!unit.path.length && unit.cell.colony && unit.cell.owner && unit.cell.owner.id === unit.player.id))
    selectedSquad.value.units = selectedSquad.value.units.filter(u => u.id !== unit.id)

    else
    return console.warn("remove unit - not at home cell")
  }

  function moveSquad(cell) {
    if(!selectedSquad.value)
    return console.warn("move squad - no selected squad")

    selectedSquad.value.units.forEach(u => {
      if(!u.path.length)
      u.path.push(u.cell)

      if(u.action)
      u.action = null
      
      u.energy = u.maxEnergy - u.path.length
      u.path.push(cell)
    })
  }

  function moveSquadBack(cell) {
    if(!selectedSquad.value)
    return console.warn("move squad back - no selected squad")
    
    selectedSquad.value.units.forEach(u => {
      const index = u.path.findIndex(c => c.id === cell.id)

      u.path = u.path.map((c, i) => {
        if(u.action)
        u.action = null
        
        if(i <= index) {
          return c
        }
        else {
          return {...c, _rmv: true}
        }
      })
      .filter(c => !c._rmv)

      u.energy = u.maxEnergy - u.path.filter(c => c.id !== u.cell.id).length
      
      if(u.path.length === 1)
      u.path = []
    })
  }

  function cancelSquadMove() {
    if(!selectedSquad.value)
    return console.warn("cancel move squad - no selected squad")

    selectedSquad.value.units.forEach(u => u.path = [])
  }

  function removeSquad(squad) {
    squads.value = squads.value.filter(s => s.id !== squad.id)
    selectedSquad.value = null
  }


  // ----
  // END TURN
  async function endUnitTurn(updateCanvas) {
    if(!checkCollision())
    await moveUnits(updateCanvas)

    settleEndTurn()
    updateCanvas()
  }

  // check collision loop
  function checkCollision() {
    const { PLAYER } = usePlayer()
    const { EVENT } = useEvent()

    const getLastPos = (unit) => unit.path.length ? unit.path.at(-1) : unit.cell

    // check same player collisions = collision error
    EVENT.resetCollisions()
    const collisionData = units.value
      .filter(u => u.player.id === PLAYER.current().id)
      .map(u => ({ id: u.id, type: u.key, player: u.player.id, pos: getLastPos(u) }))
    const collisionDetector = groupBy(collisionData, "pos")
    collisionDetector
      .forEach(([cell, units]) => {
        const unitTypes = groupBy(units, "type")
        unitTypes.forEach(([type, u]) => {
          if(u.length > 3)
          EVENT.create(PLAYER.current(), 'collision', cell, `Plus de 3 unité du type ${type} sur la même case`)
        })
      })

    // check all player units collision = battle event
    EVENT.resetBattles()
    const battleData = units.value.map(u => ({ id: u.id, type: u.key, player: u.player.id, pos: getLastPos(u) }))
    const battleDetector = groupBy(battleData, "pos")
    battleDetector
      .forEach(([cell, cellUnits]) => {
        if(cellUnits.find(u => u.player === PLAYER.current().id) && cellUnits.find(u => u.player !== PLAYER.current().id)) {
          EVENT.create(PLAYER.current(), 'battle', cell, "Bataille ici")
          cellUnits
            .forEach(cellUnit => {
              const unit = units.value.find(t => t.id === cellUnit.id && cellUnit.player === PLAYER.current().id)
              if(unit)
              unit.energy = 0
            })
          }
        })

    if(EVENT.mapDisplayed().length)
    return true
  }

  async function moveUnits(updateCanvas) {
    const times = squads.value
    .map(s => s.units.map(u => u.path.length))
    .flat()
    .reduce((acc, val) => val > acc ? val : acc, 0)
    
    // init tmp squads
    tmpSquads.value = squads.value.map(s => {
      const _tmpPath = s.units.at(0).path.length ? [...s.units.at(0).path] : [s.units.at(0).cell]
      return { ...s, _tmpPath }
    })
    
    for(let i = 0; i < times + 1; i++) {
      await new Promise(resolve => {
        setTimeout(() => {          
          tmpSquads.value.forEach(s => {
            if(s._tmpPath.length > 1)
            s._tmpPath.splice(0, 1)
          })
          
          updateCanvas()
          resolve()
        }, 800)
      })
    }

  }

  function settleEndTurn() {
    squads.value.forEach(s => {
      const newData = tmpSquads.value.find(n => n.id === s.id)
      s.units.forEach(u => {
        u.cell = newData._tmpPath.at(0)
        u.energy = u.maxEnergy
        u.path = []
        
        const rUnit = units.value.find(rU => rU.id === u.id)
        rUnit.cell = newData._tmpPath.at(0)
        rUnit.energy = u.maxEnergy
        rUnit.path = []
      })
    })
  
    tmpSquads.value = []
  }

  return {
    idleCivils,
    civilWithActivity,
    citizenTypes,
    units,
    unitTypes,
    squads,
    tmpSquads,
    previewUnits,
    addUnit,
    SQUAD,
    squadOnCell,
    getUnitAltIcon,
    getCellUnits,
    checkCollision,
    canProduceUnitHere,
    endUnitTurn
  }
}

export default useUnit