import { generateHeightMap } from "@/game/services/map.service"
import { generateWorld } from "@/game/services/world.service"

const useGame = () => {
  
  async function init() {
    const { CELL } = useCell()
    const { players, PLAYER } = usePlayer()

    await generateHeightMap()
    generateWorld()
    PLAYER.set(players.value.at(0).id)
    CELL.set({ id: PLAYER.towns().filter(t => t.owner.id === PLAYER.current().id).at(0).id })
  }
  
  async function endPlayerTurn(updateCanvas) {
    const { PLAYER, allPlayersHaveEndedTurn } = usePlayer()
    PLAYER.endTurn()
    PLAYER.next()

    if(allPlayersHaveEndedTurn()) {
      const { endUnitTurn } = useUnit()

      await endUnitTurn(updateCanvas)
      endGameTurn(updateCanvas)
    }
  }

  async function endGameTurn(updateCanvas) {
    const { cells } = useCell()
    const { players, PLAYER } = usePlayer()
    const { buildings, addColony, addBuilding } = useBuilding()
    const { units, squads, SQUAD, citizenTypes, addUnit } = useUnit()
    const { addResource } = useResource()

    // battles here

    // unitProduction
    players.value.forEach(player => {
      const colonies = cells.value
        .filter(c => c.colony && c.owner.id === player.id)
        .map(c => c.colony)

      colonies.forEach(c => {
        c.production.forEach(u => {
          addUnit(c.cell, player, u.key)
          c.production = []
        })
      })
    })


    // = endResourceTurn
    players.value.forEach(player => {
      const ofPlayer = (el) => el.filter(e => e.player.id === player.id)

      const income = ofPlayer(buildings.value)
        .filter(b => b.income)
        .concat(ofPlayer(units.value).filter(u => u.action && u.action !== "build"))
        .map(el => {
          if(el.action === "wood")
          return { type: {key: "wood"}, nb : el.energy}

          else if(el.action) {
            console.log(el.action)
            return citizenTypes().find(c => c.key === el.action).income
          }

          else
          return el.income
        })

      income.flat().forEach(el => {
        addResource(player, el.type.key, el.nb)
      })

      // const upkeep = ofPlayer(units.value)
      //   .filter(u => u.upkeep)
      //   .map(el => el.upkeep)

      
    })
    
    // = endBuildingTurn
    players.value.forEach(player => {
      const ofPlayer = (el) => el.filter(e => e.player.id === player.id)
      const builders = ofPlayer(units.value).filter(u => u.action === "build")
      const constructions = builders.map(u => u.cell)
      constructions.forEach(c => {
        if(c.production.key === "village")
        addColony(c, PLAYER.current(), 'village')

        else
        addBuilding(c, c.production.key, PLAYER.current())
      })

      const toRemove = builders.map(b => b.id)
      units.value = units.value.filter(u => !toRemove.includes(u.id))
      squads.value.forEach(s => {
        s.units = s.units.filter(u => !toRemove.includes(u.id))
        if(!s.units.length) {
          squads.value = squads.value.filter(s2 => s.id !== s2.id)
          SQUAD.select(null)
        }
      })
    })

    // = endPlayerTurn
    players.value.forEach(player => {
      player.endedTurn = false
    })
  }

  return {
    init,
    endPlayerTurn
  }
}

export default useGame