<template>

  <main class="container">

    <!--o-o-o-o-o-o-o CELL INFO o-o-o-o-o-o-o-->

    <section class="left">
      <div v-if="CELL.current().name">
        <h1 :style="`color: ${CELL.current().owner.colors.main.fillStyle}`">{{ CELL.current().name }}</h1>
      </div>

      <div v-else>
        <h1>wild {{ CELL.current().type }}</h1>
      </div>

      <div v-if="CELL.current().colony && CELL.current().owner.id === PLAYER.current().id">
        <div class="unit-row">
          <button @click="changeTab(0)">Citoyens</button>
          <button @click="changeTab(1)">Production</button>
          <button @click="changeTab(2)">Unités</button>
        </div>

        <div v-if="leftTab === 0">
          <h2>Citoyens</h2>

          <h3>Civils disponibles</h3>
          <div class="unit-row" :key="citizenRefresh">
            <Unit class="unit-row" v-for="unit in CELL.civils()" :key="unit.id" :unit="unit" />
            <div class="unit-row" v-for="citizen in CELL.current().colony.maxCitizens - CELL.civils().length" :key="citizen.id">
              <div class="empty-slot"/>
            </div>
          </div>

          <h3>Activités</h3>
          <div v-for="industry in CELL.industries()" :key="industry.id" class="unit-row">
            <h3>{{ industry.at(0) }}</h3>
            <div>Revenus: <Resource v-for="resource in industry.at(1).at(0).income" :key="resource.id" :resource="resource"/></div>
            <div class="unit-row">
              <Citizen v-for="citizen in civilWithActivity(industry.at(0))" :key="citizen.id" :citizen="citizen">
                <button class="button" @click="handleRemoveCivilAction(industry.at(0))">X</button>
              </Citizen>
              <div @click="handleAssignCivilAction(industry.at(0))" class="empty-slot" v-for="citizen in industry.at(1).length - civilWithActivity(industry.at(0)).length" :key="citizen.id" />
            </div>
          </div>
        </div>

        <div v-if="leftTab === 1">
          <h2>Production</h2>
          <div>
            <div class="unit-row production" v-for="unit in CELL.current().colony.maxProduction - CELL.current().colony.production.length" :key="unit.id">
              <div class="empty-slot"/>
            </div>
            <div class="unit-row production" v-for="unit in CELL.current().colony.production" :key="unit.id">
              <Unit v-for="unit in CELL.current().colony.production" :key="unit.id" :unit="unit">
                <button class="button" @click="handleRemoveUnitProductionInTown(unit)">X</button>
              </Unit>
            </div>
          </div>

          <h3>Civils disponibles</h3>
          <div class="unit-row" :key="citizenRefresh">
            <div class="unit-row">
              <Unit v-for="unit in CELL.civils()" :key="unit.id" :unit="unit" />
            </div>
            <div class="unit-row" v-for="citizen in CELL.current().colony.maxCitizens - CELL.civils().length" :key="citizen.id">
              <div class="empty-slot"/>
            </div>
          </div>
          
          <h2>Bâtiments</h2>

          <h2>Unités</h2>
          <div class="unit-row" v-for="unit in unitTypes().filter(t => !t.cantBuild)" :key="unit.id">
            <Unit :unit="unit" />
            <p>{{ unit.name }}</p>
            <div>
              <h3>Coût</h3>
              <div v-for="cost in unit.cost" :key="cost.id">
                <Resource :resource="cost"/>
                {{ cost.nb }}
              </div>
              <button @click="handleAddUnitProductionInTown(unit)">Produire</button>
            </div>
          </div>
        </div>

        <div v-if="leftTab === 2">
          <h2>Unités</h2>

          <h3>Civils</h3>
          <div class="unit-row">
            <div class="unit-row">
              <Unit v-for="unit in idleCivils" :key="unit.id" :unit="unit" :with-energy="true"
              :preview="CELL.squads().find(s => s.units.find(u => u.id === unit.id)) ? true : false"
              :class="{'selected': tmpSquad.find(u => u.id === unit.id), 'selectable': isUnitSelectable(unit) && !tmpSquad.find(u => u.id === unit.id)}"
              @click="handleAddUnitToSquad(unit)"/>
            </div>
            <div class="unit-row" v-for="citizen in CELL.current().colony.maxCitizens - idleCivils.length" :key="citizen.id">
              <div class="empty-slot"/>
            </div>
          </div>

          <h3>Soldats</h3>
          <div class="unit-row">
            <Unit
              v-for="unit in CELL.units().filter(u => !u.isCivil)" :key="unit.id"
              :unit="unit" :with-energy="true"
              :preview="CELL.squads().find(s => s.units.find(u => u.id === unit.id)) ? true : false"
              :class="{'selected': tmpSquad.find(u => u.id === unit.id), 'selectable': isUnitSelectable(unit) && !tmpSquad.find(u => u.id === unit.id)}"
              @click="handleAddUnitToSquad(unit)"
            />
            <div v-for="slot in CELL.current().colony.maxUnits - CELL.units().filter(u => !u.isCivil).length" :key="slot.id">
              <div class="empty-slot" />
            </div>
          </div>

          <h3>Escouades</h3>
          <div v-if="CELL.units().length && PLAYER.towns().map(t => t.id).includes(CELL.current().id)">
            <button @click="handleManageSquad" v-if="playerState !== 'squad'">Nouvelle escouade</button>
          </div>

          <div v-if="!SQUAD.all().filter(s => squadOnCell(s.id, CELL.current().id)).length">
            <p>Pas d'escouade ici</p>
          </div>

          <div class="squad-container">
            <div class="squad" v-if="playerState === 'squad'">
              <h3>Nouvelle escouade</h3>
              <button @click="handleCancelSquad">Annuler</button>
              <button @click="handleCreateSquad">Créer</button>
              <Unit @click="handleRemoveUnitFromTmpSquad(unit)" v-for="unit in tmpSquad" :key="unit.id" :unit="unit" :preview="unit.path.length > 1"/>
              <div v-for="slot in (3 - tmpSquad.length)" :key="slot.id" class="empty-slot"/>
            </div>
          </div>

          <div v-for="squad in SQUAD.all().filter(s => squadOnCell(s.id, CELL.current().id))" :key="squad.id">
            <h3>Escouades présentes</h3>
            <div class="squad">
              <h3 v-if="!squad.units.length">Escouade vide</h3>
              <p v-if="SQUAD.current() && SQUAD.current().id === squad.id">sélectionnée</p>
              <button @click="SQUAD.select(squad)" v-if="!SQUAD.current() || (SQUAD.current() && SQUAD.current().id !== squad.id)">Sélectionner</button>
              <Unit v-for="unit in squad.units" :key="unit.id" :unit="unit" :preview="unit.path.length > 1"/>
                <button @click="handleDeleteSquad" v-if="playerState !=='path' && CELL.current().colony && SQUAD.current().units.at(0) && SQUAD.current().units.at(0).player.id === CELL.current().owner.id">Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!--o-o-o-o-o-o-o CANVAS o-o-o-o-o-o-o-->

    <section class="center">
      <div class="unit-row">
        <h2>Filtres</h2>
        <button @click="toggleMapFilter(0)">Terrain</button>
        <button @click="toggleMapFilter(1)">Territoires</button>
        <button @click="toggleMapFilter(2)">Tactique</button>

        <h2>Affichage</h2>
        <button @click="toggleMapDisplay(0)">Noms des villes</button>
        <button @click="toggleMapDisplay(1)">Bâtiments</button>
        <button @click="toggleMapDisplay(2)">Unités</button>
      </div>
      <div class="canvas">
        <div class="canvas-wrapper" @click="mapInteract">
          <div class="icon-container" :key="refreshIcons">
            <div v-if="mapDisplay.units">
              <Unit v-for="unit in SQUAD.mapDisplayed()" :key="unit.id" :unit="unit" :on-map="true"/>
              <Unit v-for="unit in SQUAD.mapPreviewDisplayed()" :key="unit.id" :unit="unit" :on-map="true" :preview="true"/>
            </div>
            <div v-if="mapDisplay.buildings">
              <Building v-for="building in BUILDING.mapDisplayed()" :key="building.id" :building="building" :on-map="true">
                <p v-if="mapDisplay.names" :style="`color: ${building.player.colors.main.fillStyle}`">{{ building.name }}</p>
              </Building>
            </div>
            <Events v-for="event in EVENT.mapDisplayed()" :key="event.id" :event="event" :on-map="true"/>
          </div>
          <canvas id="canvas" :height="height" :width="width"/>
        </div>
      </div>
    </section>

    <!--o-o-o-o-o-o-o ACTIONS o-o-o-o-o-o-o-->

    <section class="right">
      <div class="unit-row">
        <p v-for="player in players" :key="player.id">{{ player.name }} : {{ player.endedTurn ? 'y' : 'n' }} |</p>
      </div>
      <div class="player-resources">
        <h3 :style="`color: ${PLAYER.current().colors.main.fillStyle}`">{{ PLAYER.current().name }}</h3>
        <div v-for="resource in getPlayerResources(PLAYER.current().id).filter(r => !r.dontShow)" :key="resource.id">
          <Resource :resource="resource"/>
          {{ resource.nb }}
        </div>
        <button @click="handleNextPlayer">Joueur suivant</button>
        <button @click="handleEndTurn">Fin du tour</button>
      </div>

      <div v-if="SQUAD.current() && (SQUAD.position() && SQUAD.position().id === CELL.current().id)" class="squad-container">
        <h2>
          Escouade sélectionnée
          <button @click="handleUnselectSquad">X</button>
        </h2>

        <div v-if="!SQUAD.current().units.length" class="squad">
          <h3>L'escouade est vide</h3>
        </div>
        <div v-else class="squad" :key="refreshIcons">
          <Unit v-for="unit in SQUAD.current().units" :key="unit.id" :unit="unit" :with-energy="true"/>
          <div v-for="slot in (3- SQUAD.current().units.length)" :key="slot.id" class="empty-slot"/>
        </div>

        <div>
          <h2>Actions</h2>

          <div v-if="!SQUAD.current()">
            <h3>Aucune escouade sélectionnée</h3>
          </div>

          <div v-if="SQUAD.current().units.length && !playerState && !SQUAD.current().units.find(u => u.isCivil && u.action !== null)">
            <button @click="handleStartSquadMove" v-if="SQUAD.current()">Déplacer</button>
            <button @click="handleStartBuild" v-if="SQUAD.current().units.find(u => u.isCivil)">Construire</button>
            <button @click="handleChopWood" v-if="SQUAD.current().units.find(u => u.isCivil) && CELL.current().type === 'forest'">Couper du bois</button>
          </div>
          
          <div v-if="SQUAD.current().units.find(u => u.action && u.action === 'wood')">
            <button @click="handleStopChopWood">Arrêter de couper du bois</button>
          </div>

          <div v-if="SQUAD.current().units.length && playerState === 'path'">
            <button @click="handleStopSquadMove">Arrêter le mouvement</button>
          </div>

          <div v-if="SQUAD.current().units.length && playerState === 'build'">
            <button @click="handleStopBuild">Arrêter de construire</button>
            <div class="building-row" v-for="building in BUILDING.all(CELL.current())" :key="building.id">
              <Building :building="building" :cell="CELL.current()"/>
              <p>{{ building.name }}</p>
              <div>
                <h3>Coût</h3>
                <div v-for="cost in building.cost" :key="cost.id">
                  <Resource :resource="cost"/>
                  {{ cost.nb }}
                </div>
              </div>

              <h3>Income</h3>
                <div v-for="cost in building.income" :key="cost.id">
                  <Resource :resource="cost"/>
                  {{ cost.nb }}
                </div>
                <button @click="validateBuild(building)">Construire</button>
              </div>
            </div>

          <div v-if="SQUAD.current().units.length && SQUAD.current().units.find(u => u.action === 'build')">
            <button @click="handleStopBuild">Arrêter la construction</button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import Citizen from '@/components/citizens/_CitizenTemplate.vue'
import Unit from '@/components/units/_UnitTemplate.vue'
import Resource from '@/components/resources/_ResourceTemplate.vue'
import Building from '@/components/buildings/_BuildingTemplate.vue'
import Events from '@/components/events/_EventTemplate.vue'

const { height, width } = useConfig()
const { init, endPlayerTurn } = useGame()
const { CELL } = useCell()
const { SQUAD, tmpSquads, squadOnCell, checkCollision, unitTypes, idleCivils, civilWithActivity } = useUnit()
const { players, PLAYER, playerState, getPlayerResources } = usePlayer()
const { BUILDING } = useBuilding()
const { EVENT } = useEvent()
const refreshIcons = ref(0)

onMounted(async () => {
  await init()
  updateCanvas()

})

function handleNextPlayer() {
  if(!playerState.value) {
    handleEndTurn()
    PLAYER.next()
    CELL.set({ id: PLAYER.towns().at(0).id })
    updateCanvas()
  }
}

async function handleEndTurn() {
  if(!playerState.value) {
    if(checkCollision())
    return console.warn("units collision detected, can't end turn")

    else
    await endPlayerTurn(updateCanvas)
  }
}


//   ______________________
//  /\                      \
//  \_|    Tile info tabs    |
//    |   ___________________|_
//     \_/____________________/


const leftTab = ref(0)

function changeTab(id) {
  playerState.value = null
  leftTab.value = id
}


//   ______________
//  /\              \
//  \_|    Canvas    |
//    |   ___________|_
//     \_/____________/


function mapInteract(e) {
  if(playerState.value === 'build') {
    handleStopBuild()
  }

  if(playerState.value === "path") {
    if(!pathIsValid(e))
    return

    selectPath(e)
  }
  else {
    CELL.set({ e })
    updateCanvas()
  }
}

function updateCanvas() {
  const { draw, drawLine, drawArrow, drawCellBorders } = useCanvas()

  draw({
    territory: mapFilter.value === 1,
    tactic: mapFilter.value === 2,
  })
  
  if (playerState.value === "path" && SQUAD.current().units.at(0).energy > 0)
  CELL.neighboors()
    .filter(c => c.type !== "water" && c.type !== "mountain")
    .forEach(c => drawCellBorders(c, 'orange'))

  if (CELL.current())
  drawCellBorders(CELL.current())

  if(!tmpSquads.value.length)
  SQUAD.all()
    .filter(s => s.units.find(u => u.path.length))
    .forEach(s => {
      s.units.forEach(u => {
        u.path.forEach((c, i) => {
          if(u.path[i-1] && !u.path[i+1]) drawArrow(u.path[i-1].center, c.center, 'red')
          if(u.path[i-1]) drawLine(u.path[i-1].center, c.center, 'red')
        })
      })
    })
    
  if(tmpSquads.value.length)
  tmpSquads.value
    .forEach((s, i) => {
      s._tmpPath.forEach((c, i) => {
        if(s._tmpPath[i+1] && !s._tmpPath[i+1]) drawArrow(s._tmpPath[i-1].center, c.center, 'red')
        if(s._tmpPath[i-1]) drawLine(s._tmpPath[i-1].center,  c.center, 'red')
      })
    })
    
  refreshIcons.value += 1
}

const mapFilter = ref(0)
function toggleMapFilter(i) {
  playerState.value = null
  mapFilter.value = i
  updateCanvas()
}

const mapDisplay = ref({
  names: true,
  buildings: true,
  units: true
})
function toggleMapDisplay(id) {
  if(id === 0) mapDisplay.value.names = !mapDisplay.value.names
  if(id === 1) mapDisplay.value.buildings = !mapDisplay.value.buildings
  if(id === 2) mapDisplay.value.units = !mapDisplay.value.units
}


//   ________________
//  /\                \
//  \_| Colony actions |
//    |   _____________|_
//     \_/______________/


// CITIZENS

const citizenRefresh = ref(0)

function handleAssignCivilAction(activity) {
  citizenRefresh.value += 1
  if(!idleCivils.value.length)
  return console.warn('no idle civil to assign an action')

  const { units } = useUnit()
  const idle = units.value.find(u => u.id === idleCivils.value.at(0).id)
  idle.action = activity
}

function handleRemoveCivilAction(activity) {
  citizenRefresh.value += 1
  const citizens = civilWithActivity(activity)
  citizens.at(0).action = null
}


// PRODUCTION
function handleAddUnitProductionInTown(unit) {
  const { units, canProduceUnitHere } = useUnit()
  const { hasEnoughResources, removeResource } = useResource()

  if(!hasEnoughResources(PLAYER.current(), unit))
  return

  if(!canProduceUnitHere(CELL.current().colony, unit))
  return console.warn('max units reached')

  const productionBar = CELL.current().colony.production
  const maxProduction = CELL.current().colony.maxProduction

  if(productionBar.length < maxProduction)
  productionBar.push(unit)

  unit.cost.forEach(r => {
    removeResource(PLAYER.current(), r.type.key, r.nb)
  })

  console.log(">", idleCivils.value)
  const t = idleCivils.value.at(0)
  const tU = units.value.find(u => u.id === t.id)
  tU.action = unit.key
  
  citizenRefresh.value += 1

  console.log(">", idleCivils.value)
}

function handleRemoveUnitProductionInTown(unit) {
  const { addResource } = useResource()

  CELL.current().colony.production = CELL.current().colony.production.filter(u => u.id !== unit.id)

  unit.cost.forEach(r => {
    addResource(PLAYER.current(), r.type.key, r.nb)
  })

  // CELL.civils().find(u => u.action === unit.key).action = null

  citizenRefresh.value += 1
}

//   _______________
//  /\               \
//  \_| Squad actions |
//    |   ____________|_
//     \_/_____________/


// MANAGE SQUAD
function handleCreateSquad() {
  if(!tmpSquad.value.length)
  return console.warn("can't create empty squad")

  playerState.value = null
  SQUAD.create(PLAYER.current())
  tmpSquad.value.forEach(u => SQUAD.addUnit(u))
  tmpSquad.value = []
}

function handleUnselectSquad() {
  playerState.value = null
  SQUAD.select(null)
  updateCanvas()
}

function handleDeleteSquad() {
  if(SQUAD.position().colony && CELL.current().owner && SQUAD.position().owner.id === CELL.current().owner.id)
  SQUAD.remove(SQUAD.current())

  else
  return console.warn("can't remove squad out of owned town")
}

// MANAGE UNITS
const tmpSquad = ref([])

const isUnitSelectable = computed(() => (unit) => {
  return playerState.value === 'squad' && !tmpSquad.value.find(u => u.key !== unit.key) && tmpSquad.value.length <= 2
})

function handleManageSquad() {
  playerState.value = 'squad'
  tmpSquad.value = []
}

function handleAddUnitToSquad(unit) {
  if(playerState.value === 'squad' && !tmpSquad.value.find(u => u.id === unit.id) && !tmpSquad.value.find(u => u.key !== unit.key) && tmpSquad.value.length <= 2)
  tmpSquad.value.push(unit)
}

function handleRemoveUnitFromTmpSquad(unit) {
  if(playerState.value === 'squad')
  tmpSquad.value = tmpSquad.value.filter(u => u.id !== unit.id)
}

function handleCancelSquad() {
  playerState.value = null
  tmpSquad.value = []
}


// ACTIONS
function handleStartSquadMove() {
  playerState.value = "path"
  updateCanvas()
}

function handleStopSquadMove() {
  playerState.value = null
  updateCanvas()
}

function handleChopWood() {
  if(SQUAD.current().units.find(u => !u.isCivil))
  return console.warn("only civil can chop wood")

  if(SQUAD.current().units.find(u => !u.energy))
  return console.warn("not enough energy")

  SQUAD.current().units.forEach(u => {
    u.action = "wood"
  })
  updateCanvas()
}

function handleStopChopWood() {
  if(SQUAD.current().units.find(u => !u.isCivil))
  return console.warn("only civil can stop chop wood")

  SQUAD.current().units.forEach(u => {
    u.action = null
  })
  updateCanvas()
}

function handleStartBuild() {
  playerState.value = 'build'
}

function validateBuild(building) {
  if(CELL.current().production)
  return console.warn('already building here')

  const { hasEnoughResources, removeResource } = useResource()

  if(!hasEnoughResources(PLAYER.current(), building))
  return console.warn('not enough resources')

  building.cost.forEach(r => {
    removeResource(PLAYER.current(), r.type.key, r.nb)
  })

  playerState.value = null
  SQUAD.current().units.forEach(u => u.action = 'build')
  CELL.current().production = building
  updateCanvas()
}

function handleStopBuild() {
  const { addResource } = useResource()

  CELL.current().production.cost.forEach(r => {
    addResource(PLAYER.current(), r.type.key, r.nb)
  })

  playerState.value = null
  SQUAD.current().units.forEach(u => u.action = null)
  CELL.current().production = []
  updateCanvas()
}


//   _____________
//  /\             \
//  \_| Select Path |
//    |   __________|_
//     \_/___________/


function pathIsValid(e) {
  const cell = CELL.find({e})

  if(!CELL.current().neighboors.find(n => cell.id === n)) {
    console.warn('cell is not a neighboor')
    return false
  }
  
  if(cell.type === "water" || cell.type === "mountain") {
    console.warn('wrong cell type')
    return false
  }
  
  return true
}

function selectPath(e) { 
  const cell = CELL.find({e})
  const { units } = SQUAD.current()
    
  if(units.find(u => u.energy === 0) && !units.at(0).path.find(c => c.id === cell.id))
  return console.warn('squad units have no energy')

  if(units.at(0).path.find(c => c.id === cell.id))
  SQUAD.goBack(cell)

  else
  SQUAD.move(cell)

  CELL.set({ e })

  checkCollision()

  updateCanvas()
}

</script>

<style>
body {
  margin: 0;
}

.container {
  display: flex;
  position: relative;
}

section.left,
section.right {
  width: 28%;
}
section.left > div,
section.right > div {
  border: 1px solid gray;
  border-radius: 5px;
  padding: 1rem 2rem;
  margin: 1rem;
} 

section.center {
  width: 44%;
}

/* ----- */

.player-info {
  border: 1px solid gray;
  border-radius: 5px;
  padding: 1rem 2rem;
  margin: 1rem;
  display: flex;
  justify-content: space-between;
}
.player-resources {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.unit.selected {
  transform: scale(1.2);
}
.player-info h1 {
  margin: 0;
}

/* ----- */


.unit-row {
  display: flex;
}
.unit-row > * {
  margin: 0 .25rem;
}
.unit-row div {
  display: flex;
}

.selectable {
  animation: selectableAnimation 2s infinite;
  cursor: pointer;
}
.selectable:hover {
  transform: scale(1.2) !important;
}

.squad {
  padding: 1rem;
  border: 1px solid;
  display: flex;
  border-radius: 10px;
}

.empty-slot {
  height: 3rem;
  width: 3rem;
  border: 3px solid gray;
  border-radius: 100px;
}

@keyframes selectableAnimation {
  from { transform: scale(1);}
  50% { transform: scale(1.1);}
  to { transform: scale(1);}
}


/* ----- */


.canvas {
  margin: 2rem;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
  #hmap {
    position: absolute;
    display: none;
  }

  #canvas {
    position: absolute;
    box-sizing: border-box;
    cursor: pointer;
    border: 5px solid rgb(62, 78, 134);
    border-radius: 20px;
  }

.icon-container {
  height: 800px;
  width: 800px;
  position: relative;
}
.icon-container .icon {
  position: absolute;
}

.icon {
  height: 2rem;
  width: 2rem;
  border: 3px solid;
  background-color: white;
  border-radius: 100%;
  padding: 1px;
  z-index: 2;
}

.cell-info p {
  height: 2rem;
  display: flex;
  align-items: center;
}

.cell-info p .icon {
  margin-right: .5rem;
}

/* ----- */

.template .button {
  height: 1.5rem;
  width: 1.5rem;
  position: absolute;
  top: -.5rem;
  right: -1rem;
}

.template p {
  position: absolute;
  bottom: -3rem;
  background-color: white;
  padding: 0 .25rem;
  border-radius: 5px;
  right: -1rem;
}
</style>