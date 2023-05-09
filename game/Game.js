import { generateVoronoi2 } from "./services/voronoi.service"

export default class Game {
  constructor() {
    const voronoi = generateVoronoi2()
    console.log(voronoi)
  }
}