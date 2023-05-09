import { v4 as generateUUID } from 'uuid'
import Building from '@/game/classes/buildings/_Building'

export default class Cell {
  constructor (type, player, geometry, neighboors) {
    this.uuid = generateUUID()
    this.type = type
    this.geometry = geometry
    this.neighboors = neighboors
    this.player = player
    this.colors = player.colors.main
  }

  colony() {
    return Building.getColony(this.uuid)
  }
  
  building() {
    return Building.getBuilding(this.uuid)
  }

  units() {
    return Unit.getAllOnCell(this.uuid)
  }
  
  civils() {
    return Unit.getCivilsOnCell(this.uuid)
  }
  
  soldiers() {
    return Unit.getSoldiersOnCell(this.uuid)
  }
}