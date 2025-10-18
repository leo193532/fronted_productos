<template>
  <div class="dashboard">
    <div class="encabezado">
      <h1>Panel Principal</h1>
      {{ usuario?.name || usuario?.email }}
      <Button label="Salir" @click="cerrarSession" severity="danger" />
    </div>

    <div class="contenido">
      <NuevoProducto @producto-creado="recargarProductos" />
      <ProductoTable ref="tablaProductos" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthService } from '@/service/api'
import ProductoTable from './productos/ProductoTable.vue'
import NuevoProducto from './productos/nuevoProducto.vue'

const router = useRouter()
const { getUserData, logout } = useAuthService()
const usuario = ref(null)
const token = ref('')

onMounted(() => {
  usuario.value = getUserData()
  token.value = localStorage.getItem('auth_token') || ''
})

const cerrarSession = async () => {
  await logout()
  router.push('/login')
}

//  Cuando inicie fuerza la recarga de productos despues de crear un nuevo registro
const tablaProductos = ref(null)

// Funcion para recargar los productos despues de crear un nuevo registro
const recargarProductos = () => {
  if (tablaProductos.value && typeof tablaProductos.value.cargarProductos === 'function') {
    tablaProductos.value.cargarProductos()
  }
}
</script>
