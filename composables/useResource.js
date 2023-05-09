import { v4 as generateUUID } from 'uuid'

const resources = ref([])

const resourceTypes = [
  { key: "citizen", name: "Citoyen", dontShow: true },
  { key: "gold", name: "Or" },
  { key: "food", name: "Provisions" },
  { key: "wood", name: "Bois" },
  { key: "stone", name: "Pierre" },
  { key: "iron", name: "Fer" },
]

const useResource = () => {

  function getResourceByType(type) {
    return resourceTypes.find(r => r.type === type)
  }

  function getPlayerResources(playerId) {
    return resources.value.filter(r => r.player.id === playerId)
  }

  function hasEnoughResources(player, item) {
    const { idleCivils } = useUnit()

    const playerResources = getPlayerResources(player.id)
    let hasEnough = true

    item.cost.filter(r => r.type.key !== "citizen").forEach(r => {
      if(playerResources.filter(pR => pR.key === r.type.key).length < r.nb)
      hasEnough = false
    })

    if(item.cost.filter(r => r.type.key === "citizen").length > idleCivils.value.length)
    hasEnough = false

    if(!hasEnough)
    console.warn('not enough resources')

    return hasEnough
  }

  function addResource(player, type, nb) {
    const { units } = useUnit()
    const { PLAYER} = usePlayer()

    const resource = resourceTypes.find(r => r.key === type)

    for (let i = 0; i < nb; i++) {
      resources.value.push({
        ...resource,
        id: generateUUID(),
        player
      })
    }

    if(type === 'citizen')
    units.value.find(u => u.action === "production" && u.player.id === PLAYER.current().id).action = null
  }

  function removeResource(player, type, nb) {
    const { idleCivils } = useUnit()

    const resourcesToRemove = resources.value
    .filter(r => r.player.id === player.id && r.key === type)
    .splice(0, nb)
    .map(r => r.id)

    if(type === "citizen")
    for(let i = 0; i< nb; i++) {
      idleCivils.value.at(0).action = "production"
    }


    resources.value = resources.value.filter(r => !resourcesToRemove.includes(r.id))
  }

  const RESOURCE = {
    citizen: resourceTypes.find(r => r.key === "citizen"),
    gold: resourceTypes.find(r => r.key === "gold"),
    food: resourceTypes.find(r => r.key === "food"),
    wood: resourceTypes.find(r => r.key === "wood"),
    stone: resourceTypes.find(r => r.key === "stone"),
    iron: resourceTypes.find(r => r.key === "iron"),
  }

  return {
    RESOURCE,
    resources,
    resourceTypes,
    getResourceByType,
    getPlayerResources,
    hasEnoughResources,
    addResource,
    removeResource,
  }
}

export default useResource