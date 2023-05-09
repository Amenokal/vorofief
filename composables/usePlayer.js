const players = ref([
  {
    id: 0,
    name: "Player 1",
    endedTurn: false,
    colors: {
      main: { fillStyle: "hsl(240, 61%, 35%)", strokeStyle: "hsl(240, 61%, 60%)" },
      territory: { fillStyle: "hsl(240, 61%, 65%)", strokeStyle: "hsl(240, 61%, 80%)" }
    },
  },
  {
    id: 1,
    name: "Player 2",
    endedTurn: false,
    colors: {
      main: { fillStyle: "hsl(29, 74%, 50%)", strokeStyle: "hsl(39, 67%, 56%)" },
      territory: { fillStyle: "hsl(43, 57%, 56%)", strokeStyle: "hsl(43, 55%, 64%)" }
    },
  },
  {
    id: 2,
    name: "Player 3",
    endedTurn: false,
    colors: {
      main: { fillStyle: "hsl(0, 77%, 27%)", strokeStyle: "hsl(7, 80%, 36%)" },
      territory: { fillStyle: "hsl(16, 62%, 40%)", strokeStyle: "hsl(16, 55%, 48%)" }
    },
  },
])

const player = ref(players.value.at(0))
const playerState = ref(null)

const usePlayer = () => {

  function getPlayerResources(playerId) {
    const { resources, resourceTypes } = useResource()
    const player = players.value.find(p => p.id === playerId)

    return resourceTypes.map(resource => ({
      ...resource,
      nb: resources.value.filter(r => r.key === resource.key && r.player.id === player.id).length
    }))
  }

  function allPlayersHaveEndedTurn() {
    return !players.value.find(p => !p.endedTurn)
  }

  const PLAYER = {
    current: getSelectedPlayer,
    set: selectPlayer,
    next: selectNextPlayer,
    towns: getPlayerColonies,
    endTurn: endTurnForCurrentPlayer,
  }

  function getSelectedPlayer() {
    return player.value
  }

  function selectPlayer(playerId) {
    player.value = players.value.find(p => p.id === playerId)
  }

  function selectNextPlayer() {
    const { CELL } = useCell()
    const index = players.value.findIndex(p => p.id === player.value.id)
    
    if(players.value.at(index+1)) {
      player.value = players.value.at(index+1) || players.value.at(0)
    }

    else {
      player.value = players.value.at(0)
    }

    CELL.set({ id: PLAYER.towns().filter(c => c.owner.id === player.value.id).at(0).id })
  }

  function getPlayerColonies() {
    const { cells } = useCell()
    return cells.value.filter(c => c.colony)
  }

  function endTurnForCurrentPlayer() {
    const { getCollisionEvents } = useEvent()

    if(getCollisionEvents(PLAYER.current()).length)
    return console.warn('collision event not resolved')

    else {
      PLAYER.current().endedTurn = true
      console.info('player turn ended')
    }
  }

  return {
    PLAYER,
    player,
    playerState,
    players,
    selectPlayer,
    getPlayerResources,
    allPlayersHaveEndedTurn,
  }
}

export default usePlayer