<template>
  <div ref="self" class="icon unit template" :class="{ 'on-map': onMap, 'preview': preview }" @click="handleMapClick">
    <component :is="icon"/>

    <slot />

    <div v-if="withEnergy" class="energy-container">
      <span v-for="(n, i) in unit.maxEnergy" class="energy-point" :class="{'full': unit.energy > i}"></span>
    </div>
  </div>
</template>

<script setup>
import Citizen from '@/components/units/CitizenIcon.vue'
import Civil from '@/components/units/CivilIcon.vue'
import Woodcutter from '@/components/units/WoodcutterIcon.vue'
import Builder from '@/components/units/BuilderIcon.vue'

import Idle from '@/components/citizens/IdleIcon.vue'
import Farmer from '@/components/citizens/FarmerIcon.vue'
import Fisherman from '@/components/citizens/FishermanIcon.vue'
import Miner from '@/components/citizens/MinerIcon.vue'

import Spearman from '@/components/units/SpearmanIcon.vue'
import Bowman from '@/components/units/BowmanIcon.vue'
import Knight from '@/components/units/KnightIcon.vue'
import _BuildingTemplate from '../buildings/_BuildingTemplate.vue'

const { unit, withEnergy, preview, onMap } = defineProps({ unit: Object, withEnergy: Boolean, preview: Boolean, onMap: Boolean })

const self = ref(null)
const icon = shallowRef(null)

onMounted(() => {
  if(!unit)
  return

  if(unit.key === 'citizen') icon.value = Citizen

  if(unit.key === 'civil' && !unit.action) icon.value = Civil
  if(unit.key === 'civil' && unit.action === 'wood') icon.value = Woodcutter
  if(unit.key === 'civil' && unit.action === 'build') icon.value = Builder

  if(unit.action === "woodcutter") icon.value = Woodcutter
  if(unit.action === "fisherman") icon.value = Fisherman
  if(unit.action === "miner") icon.value = Miner
  if(unit.action === "idle") icon.value = Idle
  if(unit.action === "farmer") icon.value = Farmer

  if(unit.action === "sergeant") icon.value = Spearman
  if(unit.action === "bowman") icon.value = Bowman
  if(unit.action === "knight") icon.value = Knight

  if(unit.key === 'sergeant') icon.value = Spearman
  if(unit.key === 'bow') icon.value = Bowman
  if(unit.key === 'knight') icon.value = Knight

  if(unit.player)
  self.value.style.color = unit.player.colors.main.strokeStyle

  if(onMap) {
    if(preview) {
      self.value.style.top = (unit.path.at(-1).center.y - 15) + "px"
      self.value.style.left = (unit.path.at(-1).center.x - 15) + "px"
    }
    else {
      self.value.style.top = (unit.cell.center.y - 15) + "px"
      self.value.style.left = (unit.cell.center.x - 15) + "px"
    }
  }
})

function handleMapClick() {
  const { CELL } = useCell()

  if(onMap)
  CELL.set({ id: unit.path.at(-1) || unit.cell.id })
}

</script>

<style scoped>
.template.unit {
  height: 3rem;
  width: 3rem;
  position: relative;
}
.template svg {
  height: 3rem;
  width: 3rem;
}
.template.unit.on-map {
  height: 2rem;
  width: 2rem;
  position: relative;
  cursor: pointer;
}
.template.on-map svg {
  height: 1.8rem;
  width: 1.8rem;
}

.template.preview {
  filter: opacity(.5);
  border-style: dashed;
}

.energy-container {
  display: flex;
  width: max-content;
  position: absolute;
  bottom: -.5rem;
  left: -.3rem;
}
.energy-point {
  display: block;
  height: .8rem;
  width: .8rem;
  border-radius: 100px;
  border: 1px solid yellow;
  margin: 0 .2rem;
}
.full {
  background-color: goldenrod;
}

.template .button {
  height: .3rem;
  width: .3rem;
  position: absolute;
  top: -.2rem;
  right: -.2rem;
}
</style>