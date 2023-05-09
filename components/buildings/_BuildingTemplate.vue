<template>
  <div ref="self" class="icon template" :class="{ 'on-map': onMap }" @click="handleMapClick">
    <component :is="icon"/>

    <slot/>
  </div>
</template>

<script setup>
import Village from '~/components/buildings/VillageIcon.vue'
import Castle from '~/components/buildings/CastleIcon.vue'
import City from '~/components/buildings/CityIcon.vue'

import Farm from '~/components/buildings/FarmIcon.vue'
import Mill from '~/components/buildings/MillIcon.vue'
import Fishboat from '~/components/buildings/Fishboaticons.vue'
import Woodcutter from '~/components/buildings/WoodcutterIcon.vue'
import Quarry from '~/components/buildings/QuarryIcon.vue'
import Mine from '~/components/buildings/MineIcon.vue'
import Stable from '~/components/buildings/StableIcon.vue'
import Market from '~/components/buildings/MarketIcon.vue'

const { building, onMap } = defineProps({ building: Object, onMap: Boolean })

const self = ref(null)
const icon = shallowRef(null)

onMounted(() => {
  if(!building)
  return

  if(building.key === 'village') icon.value = Village
  if(building.key === 'castle') icon.value = Castle
  if(building.key === 'city') icon.value = City

  if(building.key === 'farm') icon.value = Farm
  if(building.key === 'mill') icon.value = Mill
  if(building.key === 'fishermen') icon.value = Fishboat
  if(building.key === 'woodcutter') icon.value = Woodcutter
  if(building.key === 'stoneMine') icon.value = Quarry
  if(building.key === 'ironMine') icon.value = Mine
  if(building.key === 'stable') icon.value = Stable
  if(building.key === 'market') icon.value = Market
  
  self.value.style.color = building.cell && building.cell.owner ? building.cell.owner.colors.main.strokeStyle : "black"

  if(onMap) {
    self.value.style.top = (building.cell.center.y - 20) + "px"
    self.value.style.left = (building.cell.center.x - 20) + "px"
  }
})

function handleMapClick() {
  const { CELL } = useCell()
  
  if(onMap)
  CELL.set({ id: building.cell.id })
}
</script>

<style scoped>
.template {
  height: 3rem;
  width: 3rem;
  position: relative;
}
.template svg {
  height: 3rem;
  width: 3rem;
}
.template.on-map {
  height: 2.5rem;
  width: 2.5rem;
  position: absolute;
  cursor: pointer;
}
.template.on-map svg {
  height: 2.5rem;
  width: 2.5rem;
}

.template.preview {
  filter: opacity(.5);
  border-style: dashed;
}
</style>