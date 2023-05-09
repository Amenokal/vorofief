<template>
  <div ref="self" class="resource template">
    <component :is="resourceType" />
  </div>
</template>

<script setup>
import Citizen from '@/components/resources/CitizenIcon.vue'
import Gold from '@/components/resources/GoldIcon.vue'
import Food from '@/components/resources/FoodIcon.vue'
import Wood from '@/components/resources/WoodIcon.vue'
import Stone from '@/components/resources/StoneIcon.vue'
import Iron from '@/components/resources/IronIcon.vue'

const { resource } = defineProps({ resource: Object })

const self = ref(null)
const resourceType = shallowRef(null)

onMounted(() => {
  if(!resource) return

  const key = resource.key || resource.type.key 
  if(key === "citizen") resourceType.value = Citizen
  if(key === "gold") resourceType.value = Gold
  if(key === "food") resourceType.value = Food
  if(key === "wood") resourceType.value = Wood
  if(key === "stone") resourceType.value = Stone
  if(key === "iron") resourceType.value = Iron
})
</script>

<style scoped>
.resource svg {
  height: 2rem;
  width: 2rem;
}
.template .gold {
  color: goldenrod;
}
.template .food {
  color: burlywood;
}
.template .wood {
  color: rgb(154, 108, 74);
}
.template .stone {
  color: rgb(94, 94, 94);
}
.template .iron {
  color: rgb(173, 173, 173);
}
</style>