// https://talesofscheherazade.blogspot.com/2019/01/town-name-generators-for-pseudo-britain_18.html
// https://fr.wikipedia.org/wiki/Toponymie_fran%C3%A7aise
// https://en.wikipedia.org/wiki/Norman_toponymy

const cityPrefixes = [
  "Gerr", "Ser", "Pe", "Ver", "Mouss", "Pa", "Var", "Mall", "Sir", "Tou", "Acr", "Ver", "Mar", "Orl"
]
const citySuffixes = [
  "ac", "ignac", "gny", "gy", "ey", "a", "o", "éon", "es", "ie", "ez", "az", "illon", "tin", "mont", "bourg", "ville", "abes", "ry"
]

export function generateCityName() {
  const rdmPrefix = cityPrefixes.at(Math.floor(Math.random() * cityPrefixes.length))
  const rdmSuffix = citySuffixes.at(Math.floor(Math.random() * citySuffixes.length))
  return rdmPrefix + rdmSuffix
}