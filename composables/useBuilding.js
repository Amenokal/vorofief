import { v4 as generateUUID } from 'uuid'
import { generateCityName } from '@/game/services/name.service'

const buildings = ref([])

function isNearVillage(cell) {
  const { PLAYER } = usePlayer()
  const { getOwnedCells } = useCell()
  const av = getOwnedCells(PLAYER.current()).map(c => c.neighboors).flat()
  return av.includes(cell.id)
}

const buildingTypes = () => {
  const { RESOURCE } = useResource()
  return [
    // on map
    { id: 3, name: 'Moulin', key: 'mill',
      cost: [{ type: RESOURCE.wood, nb: 5 }],
      income: [{ type: RESOURCE.food, nb: 2 }, { type: RESOURCE.gold, nb: 2 }],
      canBuildHere: (cell, player) => cell.type === "plain" && isNearVillage(cell, player)
    },
    { id: 4, name: 'Ferme', key: 'farm',
      cost: [{ type: RESOURCE.wood, nb: 3 }],
      income: [{ type: RESOURCE.food, nb: 2 }],
      canBuildHere: (cell, player) => cell.type === "plain" && isNearVillage(cell, player)
    },
    { id: 6, name: 'Scierie', key: 'woodcutter',
      cost: [{ type: RESOURCE.wood, nb: 3 }],
      income: [{ type: RESOURCE.wood, nb: 2 }],
      canBuildHere: (cell, player) => cell.type === "forest" && isNearVillage(cell, player)
    },
    { id: 7, name: 'Carrière', key: 'stoneMine',
      cost: [{ type: RESOURCE.wood, nb: 5 }],
      income: [{ type: RESOURCE.stone, nb: 1 }],
      canBuildHere: (cell, player) => cell.type === "hill" && isNearVillage(cell, player)
    },
    { id: 8, name: 'Mine', key: 'ironMine',
      cost: [{ type: RESOURCE.wood, nb: 5 }],
      income: [{ type: RESOURCE.iron, nb: 1 }],
      canBuildHere: (cell, player) => cell.type === "hill" && isNearVillage(cell, player)
    },
    
    // in city
    { id: 0, name: 'Village', key: 'village',
      cost: [{ type: RESOURCE.food, nb: 5 }, { type: RESOURCE.wood, nb: 3 }, { type: RESOURCE.gold, nb: 5 }],
      income: [{ type: RESOURCE.gold, nb: 1 }],
      maxCitizens: 2,
      maxUnits: 2,
      maxSquad: 1,
      production: [],
      maxProduction: 1,
      canBuildHere: (cell, player) => cell.type === "plain" || cell.type === "forest" || cell.type === "hill"
    },
    { id: 1, name: 'Château', key: 'castle',
      cost: [{ type: RESOURCE.food, nb: 5 }, { type: RESOURCE.stone, nb: 10 }, { type: RESOURCE.wood, nb: 5 }, { type: RESOURCE.gold, nb: 10 }],
      income: [{ type: RESOURCE.gold, nb: 2 }],
      maxCitizens: 3,
      maxUnits: 4,
      maxSquad: 3,
      production: [],
      maxProduction: 2,
      canBuildHere: (cell, player) => cell.colony
    },
    { id: 2, name: 'Cité', key: 'city',
      cost: [{ type: RESOURCE.food, nb: 10 }, { type: RESOURCE.stone, nb: 10 }, { type: RESOURCE.wood, nb: 10 }, { type: RESOURCE.gold, nb: 20 }],
      income: [{ type: RESOURCE.gold, nb: 3 }],
      maxCitizens: 5,
      maxUnits: 8,
      maxSquad: 4,
      production: [],
      maxProduction: 3,
      canBuildHere: (cell, player) => cell.colony
    },
    { id: 9, name: 'Marché', key: 'market',
      cost: [{ type: RESOURCE.stone, nb: 3 }, { type: RESOURCE.wood, nb: 3 }],
      income: [{ type: RESOURCE.gold, nb: 3 }],
      canBuildHere: (cell, player) => cell.colony
    }
  ]
}

const useBuilding = () => {

  function getCellBuildings(cellId) {
    return buildings.value.filter(u => u.cell.id === cellId)
  }

  function getBuildingIcon(type) {
    return buildingTypes().find(b => b.type === type).icon
  }

  function addColony(cell, player, type) {
    const colonyInfos = buildingTypes().find(building => building.key === type)
    const colony = {
      ...colonyInfos,
      id: generateUUID(),
      cell,
    }

    cell.name = generateCityName()
    cell.colony = colony
    cell.owner = player
    cell.type = "colony"

    addBuilding(cell, type, player, cell.name)
  }

  function addBuilding(cell, type,  player = false, name = false) {
    const typeInfos = buildingTypes().find(building => building.key === type)
    const building = {
      ...typeInfos,
      id: generateUUID(),
      cell,
    }

    if(player)
    building.player = player

    if(name)
    building.name = name

    buildings.value.push(building)
  }

  const BUILDING = {
    all: getBuildingList,
    mapDisplayed: getMapDisplayedBuildings,
  }

  function getBuildingList(cell) {
    return buildingTypes().filter(b => b.canBuildHere(cell))
  }

  function getMapDisplayedBuildings() {
    return buildings.value.filter(b => b.key !== 'market')
  }

  return {
    BUILDING,
    buildings,
    getCellBuildings,
    getBuildingIcon,
    addColony,
    addBuilding,
  }
}

export default useBuilding