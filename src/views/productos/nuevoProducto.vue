<template>
  <div class="nuevo-producto">
    <Button label="Registrar" icon="pi pi-plus" @click="abrirModal" />

    <Dialog
      v-model:visible="visible"
      modal
      header="Registrar nuevo producto"
      :style="{ with: '450px' }"
      :draggable="false"
    >
      <div class="formulario-producto">
        <div class="campo">
          <label for="nombre" class="etiqueta">Nombre del producto*:</label>
          <InputText
            v-model="producto.nombre"
            id="nombre"
            class="input-completo"
            placeholder="Ej: Lapto HP"
          />
        </div>

        <div class="campo">
          <label for="descripcion" class="etiqueta">Descripción del producto*:</label>
          <Textarea
            v-model="producto.descripcion"
            id="descripcion"
            class="input-completo"
            placeholder="Ej: Explica el detalle del producto"
            rows="3"
            autoResize
          />
        </div>

        <div class="campo">
          <label for="precio" class="etiqueta">Precio*:</label>
          <InputNumber v-model="producto.precio" id="precio" class="input-completo" />
        </div>
      </div>

      <template #footer>
        <div class="pie-modal">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            class="boton-secundario"
            style="margin-right: 0.5rem"
            severity="secondary"
          />

          <Button
            label="Guardar"
            icon="pi pi-check"
            class="boton-primario"
            @click="guardarProducto"
          />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useProductoService } from '@/service/api'

import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
const toast = useToast()

const emit = defineEmits(['producto-creado'])
const visible = ref(false)

const abrirModal = () => {
  visible.value = true
  resetearFormulario()
}

const producto = reactive({
  nombre: '',
  descripcion: '',
  precio: null,
})

const errores = reactive({
  nombre: '',
  descripcion: '',
  precio: '',
})
const { createProducto } = useProductoService()

const guardarProducto = async () => {
  try {
    // Preparar datos para enviar al API
    const datosProducto = {
      nombre: producto.nombre.trim(),
      descripcion: producto.descripcion.trim(),
      precio: parseFloat(producto.precio),
    }
    //LLamar al enpoint para crear el producto
    const respuesta = await createProducto(datosProducto)

    //Mostrar Mensaje de éxito
    toast.add({
      severity: 'success',
      summary: 'Exito',
      detail: 'Producto ${producto.nombre} almacenado',
      life: 5000,
    })

    //Emitir el evento para recargar los productos en la tabla del dashboard
    emit('producto-creado')

    // Cerrar Modal
    cerrarModal()
  } catch (error) {
    console.error('Error al guardar producto:', error)

    //Mostrar Mensaje de error
    let mensajeError = 'No se pudo crear el registro'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: mensajeError,
      life: 5000,
    })
  }
}

const resetearFormulario = () => {
  producto.nombre = ''
  producto.descripcion = ''
  producto.precio = null
  Object.keys(errores).forEach((key) => (errores[key] = ''))
}

const cerrarModal = () => {
  visible.value = false
}
</script>
