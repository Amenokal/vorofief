import { v4 as generateUUID } from 'uuid'

const events = ref([])

const eventTypes = [
  { id: 0, key: "collision" },
  { id: 1, key: "battle" },
]

const useEvent = () => {

  function getEvents() {
    return events.value
  }

  function getCollisionEvents(player) {
    return events.value.filter(e => e.key === 'collision' && e.player.id === player.id)
  }

  function createEvent(player, type, cell, msg) {
    const typeInfos = eventTypes.find(e => e.key === type)
    events.value.push({
      ...typeInfos,
      id: generateUUID(),
      player,
      cell,
      msg
    })
  }

  function removeEvent(eventId) {
    events.value = events.value.filter(e => e.id !== eventId)
  }

  function resetCollisionEvents() {
    events.value = events.value.filter(e => e.key !== 'collision')
  }
  
  function resetBattlesEvents() {
    events.value = events.value.filter(e => e.key !== 'battle')
  }

  const EVENT =  {
    mapDisplayed: getEvents,
    create: createEvent,
    remove: removeEvent,
    resetCollisions: resetCollisionEvents,
    resetBattles: resetBattlesEvents,
  }

  return {
    EVENT,
    getCollisionEvents
  }
}

export default useEvent