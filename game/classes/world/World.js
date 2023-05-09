import { generateVoronoi2 } from "./services/voronoi.service"
import { generateWorld } from "./services/world.service"

export default class World {
  constructor() {
    const voronoi = generateVoronoi2()
    console.log(voronoi)
  }
}