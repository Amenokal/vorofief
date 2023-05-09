<template>
  <div class="container">
    <canvas id="canvas" height="800" width="800"/>
  </div>

</template>

<script setup>
import Game from '../game/Game'
const game = new Game()
</script>

<style scoped>
.container {
  width: 100vw;
  display: flex;
  justify-content: center;
}

canvas {
  margin-top: 1rem;
  border: 1px solid blue;
}
</style>