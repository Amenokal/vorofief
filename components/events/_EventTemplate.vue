<template>
  <div ref="self" class="icon event template">
    <component :is="eventType" @click.stop="isOpen = true"/>
    <aside v-if="isOpen" class="popup-info">
      <p>{{ event.msg }}</p>
      <button @click="isOpen = false">X</button>
    </aside>
  </div>
</template>

<script setup>
import Error from '@/components/events/ErrorIcon.vue'
import Battle from '@/components/events/BattleIcon.vue'

const { event, onMap } = defineProps({ event: Object, onMap: Boolean })

const isOpen = ref(false)
const self = ref(null)
const eventType = shallowRef(null)

onMounted(() => {
  if(!event) return

  const key = event.key
  if(key === "collision") eventType.value = Error
  if(key === "battle") eventType.value = Battle

  if(onMap) {
    self.value.style.top = (event.cell.center.y - 20) + "px"
    self.value.style.left = (event.cell.center.x - 20) + "px"
  }
})
</script>

<style scoped>
.icon.event {
  height: 2.5rem;
  width: 2.5rem;
  background-color: rgb(180, 45, 45);
  color: white;
  cursor: pointer;
}
.event svg {
  height: 2.5rem;
  width: 2.5rem;
}
.popup-info {
  width: 10rem;
  border: 3px solid gray;
  background-color: white;
  color: black;
  border-radius: 10px;
  padding: .3rem;
  position: relative;
  text-align: center;
}
.popup-info button {
  position: absolute;
  top: -.5rem;
  right: -.5rem;
}

</style>