<template>
  <div ref="self" class="icon unit template">
    <component :is="icon"/>

    <slot />

    <div>

    </div>
  </div>
</template>

<script setup>

import Idle from '@/components/citizens/IdleIcon.vue'
import Farmer from '@/components/citizens/FarmerIcon.vue'
import Fisherman from '@/components/citizens/FishermanIcon.vue'
import Woodcutter from '@/components/citizens/WoodcutterIcon.vue'
import Miner from '@/components/citizens/MinerIcon.vue'

const { citizen } = defineProps({ citizen: Object })

const self = ref(null)
const icon = shallowRef(null)

onMounted(() => {
  if(!citizen)
  return

  if(citizen.key === 'idle' || citizen.action === null) icon.value = Idle
  if(citizen.key === 'farmer' || citizen.action === 'farmer') icon.value = Farmer
  if(citizen.key === 'fisherman' || citizen.action === 'fisherman') icon.value = Fisherman
  if(citizen.key === 'woodcutter' || citizen.action === 'woodcutter') icon.value = Woodcutter
  if(citizen.key === 'miner' || citizen.action === 'miner') icon.value = Miner

  if(citizen.player)
  self.value.style.color = citizen.player.colors.main.strokeStyle
})
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
.template.on-map svg {
  height: 1rem;
  width: 1rem;
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