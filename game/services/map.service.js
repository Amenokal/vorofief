const mapSet2 = [
  { name: 'Hilly Island',
    imgSrc: "hmaps/map1.png",
    features: { bays: 3, forests: 1 },
    pixelSensibility: (height) => {
      if(height > .8) return 'mountain'
      else if(height > .6) return 'hill'
      else if(height > .05) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Peek Island',
    imgSrc: "hmaps/map2.jpg",
    features: { bays: 4, forests: 2 },
    pixelSensibility: (height) => {
      if(height > .65) return 'mountain'
      else if(height > .25) return 'hill'
      else if(height > 0) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Plain Island', // BOF
    imgSrc: "hmaps/map3.jpg",
    features: { bays: 10 },
    pixelSensibility: (height) => {
      if(height > .2) return 'hill'
      else if(height > 0) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Forest Island',
    imgSrc: "hmaps/map4.jpg",
    features: { bays: 7 },
    pixelSensibility: (height) => {
      if(height > .35) return 'hill'
      else if(height > .1) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Mountain Island',
    imgSrc: "hmaps/map5.jpg",
    features: { bays: 3, forests: 3 },
    pixelSensibility: (height) => {
      if(height > .65) return 'mountain'
      else if(height > .4) return 'hill'
      else if(height > .05) return 'forest'
      else return 'plain'
    }
  },
]

const mapSet = [
  { name: 'Hilly Island',
    src: "hmaps/map1.png",
    bays: 3,
    forests: 1,
    getType: (height) => {
      if(height > .8) return 'mountain'
      else if(height > .6) return 'hill'
      else if(height > .05) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Peek Island',
    src: "hmaps/map2.jpg",
    bays: 4,
    forests: 2,
    getType: (height) => {
      if(height > .65) return 'mountain'
      else if(height > .25) return 'hill'
      else if(height > 0) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Plain Island', // BOF
    src: "hmaps/map3.jpg",
    size: 300,
    bays: 10,
    getType: (height) => {
      if(height > .2) return 'hill'
      else if(height > 0) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Forest Island',
    src: "hmaps/map4.jpg",
    bays: 7,
    getType: (height) => {
      if(height > .35) return 'hill'
      else if(height > .1) return 'forest'
      else return 'plain'
    }
  },
  { name: 'Mountain Island',
    src: "hmaps/map5.jpg",
    bays: 3,
    forests: 3,
    getType: (height) => {
      if(height > .65) return 'mountain'
      else if(height > .4) return 'hill'
      else if(height > .05) return 'forest'
      else return 'plain'
    }
  },
]

const map = mapSet[0]

export async function generateHeightMap() {
  const { drawImage } = useCanvas()
  await drawImage(map)
}

export function getHeightMap() {
  return map
}