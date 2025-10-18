<template>
  <h1>Prueba</h1>
  <InputText type="text" v-model="text" />
  <Button label="Enviar" />
  {{ text }}
</template>

<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
const text = ref('')
</script>

<style scoped></style>
