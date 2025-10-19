<template>
  <div class="tabla-productos">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <span>Listado de Productos</span>
        </div>
      </template>
      <template #content>
        <div class="contenedor-tabla">
          <DataTable
            :value="productos"
            :loading="cargando"
            paginator
            :rows="filasPorPagina"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :totalRecords="productos.length"
            tableStyle="min-width: 50rem"
            class="p-datatable-sm"
          >
            <Column field="id" header="ID" style="width: 10%"></Column>
            <Column field="nombre" header="Nombre" style="width: 25%"></Column>
            <Column field="descripcion" header="Descripción" style="width: 30%">
              <template #body="datosFila">
                {{ datosFila.data.descripcion || 'Sin descripción' }}
              </template>
            </Column>
            <Column field="precio" header="Precio" style="width: 15%">
              <template #body="datosFila">
                {{ formatearPrecio(datosFila.data.precio) }}
              </template>
            </Column>
            <Column header="Acciones" style="width: 20%">
              <template #body="datosFila">
                <div class="acciones-tabla">
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-warning p-button-text p-button-rounded"
                    @click="editarProducto(datosFila.data)"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-danger p-button-text p-button-rounded"
                    @click="confirmarEliminar(datosFila.data)"
                  />
                  <Button
                    icon="pi pi-file-pdf"
                    class="p-button-help p-button-text p-button-rounded"
                    @click="generarPDFProducto(datosFila.data)"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="estado-vacio">
                <i class="pi pi-inbox" style="font-size: 2rem"></i>
                <p>No se encontraron productos</p>
              </div>
            </template>

            <template #loading>
              <div class="estado-cargando">
                <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
                <p>Cargando productos...</p>
              </div>
            </template>
          </DataTable>
        </div>

        <div class="flex justify-content-between align-items-center mt-3">
          <span class="p-text-secondary">
            Mostrando {{ productos.length }} de {{ productos.length }} productos
          </span>
          <Button
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            class="p-button-help"
            @click="generarPDFCompleto"
            :disabled="productos.length === 0"
          />
        </div>
      </template>
    </Card>

    <!-- Modal para agregar/editar producto -->
    <Dialog
      v-model:visible="modalVisible"
      :style="{ width: '500px' }"
      :header="productoForm.id ? 'Editar Producto' : 'Nuevo Producto'"
      :modal="true"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="nombre">Nombre</label>
          <InputText
            id="nombre"
            v-model="productoForm.nombre"
            required
            autofocus
            :class="{ 'p-invalid': submitted && !productoForm.nombre }"
          />
          <small class="p-error" v-if="submitted && !productoForm.nombre">
            El nombre es requerido
          </small>
        </div>

        <div class="field">
          <label for="descripcion">Descripción</label>
          <Textarea
            id="descripcion"
            v-model="productoForm.descripcion"
            rows="3"
            required
            :class="{ 'p-invalid': submitted && !productoForm.descripcion }"
          />
          <small class="p-error" v-if="submitted && !productoForm.descripcion">
            La descripción es requerida
          </small>
        </div>

        <div class="field">
          <label for="precio">Precio</label>
          <InputNumber
            id="precio"
            v-model="productoForm.precio"
            mode="currency"
            currency="MXN"
            locale="es-MX"
            required
            :class="{ 'p-invalid': submitted && !productoForm.precio }"
          />
          <small class="p-error" v-if="submitted && !productoForm.precio">
            El precio es requerido
          </small>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="ocultarModal" />
        <Button
          label="Guardar"
          icon="pi pi-check"
          class="p-button-success"
          @click="guardarProducto"
        />
      </template>
    </Dialog>

    <!-- Dialogo de confirmación para eliminar -->
    <Dialog
      v-model:visible="dialogoEliminarVisible"
      :style="{ width: '450px' }"
      header="Confirmar Eliminación"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span
          >¿Está seguro de que desea eliminar el producto <b>{{ productoSeleccionado?.nombre }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          @click="dialogoEliminarVisible = false"
        />
        <Button
          label="Eliminar"
          icon="pi pi-check"
          class="p-button-danger"
          @click="eliminarProductoConfirmado"
        />
      </template>
    </Dialog>

    <!-- Componente Toast para notificaciones -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductoService } from '@/service/api'
import { useToast } from 'primevue/usetoast'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Desestructuramos las funciones del servicio
const { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } =
  useProductoService()

const toast = useToast()

// Variables reactivas
const productos = ref([])
const cargando = ref(false)
const filasPorPagina = ref(5)
const modalVisible = ref(false)
const dialogoEliminarVisible = ref(false)
const submitted = ref(false)

// Formulario y selección
const productoForm = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio: null,
})
const productoSeleccionado = ref(null)

// Métodos
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(precio || 0)
}

const mostrarModalProducto = () => {
  productoForm.value = { id: null, nombre: '', descripcion: '', precio: null }
  submitted.value = false
  modalVisible.value = true
}

const ocultarModal = () => {
  modalVisible.value = false
  submitted.value = false
}

const editarProducto = (producto) => {
  productoForm.value = { ...producto }
  submitted.value = false
  modalVisible.value = true
}

const guardarProducto = async () => {
  submitted.value = true

  if (!productoForm.value.nombre || !productoForm.value.descripcion || !productoForm.value.precio) {
    return
  }

  try {
    if (productoForm.value.id) {
      // Actualizar producto existente
      await actualizarProducto(productoForm.value.id, {
        nombre: productoForm.value.nombre,
        descripcion: productoForm.value.descripcion,
        precio: productoForm.value.precio,
      })
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto actualizado',
        life: 3000,
      })
    } else {
      // Crear nuevo producto
      await crearProducto(productoForm.value)
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto creado',
        life: 3000,
      })
    }

    modalVisible.value = false
    await cargarProductos()
  } catch (error) {
    console.error('Error al guardar producto:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al guardar producto',
      life: 3000,
    })
  }
}

const confirmarEliminar = (producto) => {
  productoSeleccionado.value = producto
  dialogoEliminarVisible.value = true
}

const eliminarProductoConfirmado = async () => {
  try {
    await eliminarProducto(productoSeleccionado.value.id)
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Producto eliminado',
      life: 3000,
    })
    dialogoEliminarVisible.value = false
    await cargarProductos()
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al eliminar producto',
      life: 3000,
    })
  }
}

const generarPDFProducto = (producto) => {
  try {
    // Convertir el Proxy a objeto plano
    const prod = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
    }

    const doc = new jsPDF()

    // Título
    doc.setFontSize(20)
    doc.setTextColor(40, 40, 40)
    doc.text('Detalle del Producto', 105, 20, { align: 'center' })

    // Línea decorativa
    doc.setDrawColor(0, 128, 0)
    doc.setLineWidth(0.5)
    doc.line(20, 25, 190, 25)

    // Información del producto
    doc.setFontSize(12)
    doc.setTextColor(60, 60, 60)

    let yPos = 40

    doc.setFont(undefined, 'bold')
    doc.text('ID:', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(String(prod.id), 50, yPos)

    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('Nombre:', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(prod.nombre, 50, yPos)

    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('Descripción:', 20, yPos)
    doc.setFont(undefined, 'normal')
    const descripcion = prod.descripcion || 'Sin descripción'
    const splitDescripcion = doc.splitTextToSize(descripcion, 140)
    doc.text(splitDescripcion, 50, yPos)

    yPos += splitDescripcion.length * 7 + 3
    doc.setFont(undefined, 'bold')
    doc.text('Precio:', 20, yPos)
    doc.setFont(undefined, 'normal')
    doc.text(formatearPrecio(prod.precio), 50, yPos)

    // Fecha de generación
    yPos += 20
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 20, yPos)

    // Guardar PDF
    const nombreArchivo = `producto_${prod.id}_${prod.nombre.replace(/\s+/g, '_')}.pdf`
    doc.save(nombreArchivo)

    toast.add({
      severity: 'success',
      summary: 'PDF Generado',
      detail: `PDF del producto "${prod.nombre}" descargado exitosamente`,
      life: 3000,
    })
  } catch (error) {
    console.error('Error al generar PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error al generar el PDF: ${error.message}`,
      life: 3000,
    })
  }
}

const generarPDFCompleto = () => {
  try {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.setTextColor(40, 40, 40)
    doc.text('Listado Completo de Productos', 105, 20, { align: 'center' })

    // Subtítulo con total
    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.text(`Total de productos: ${productos.value.length}`, 105, 30, { align: 'center' })

    // Convertir productos a objetos planos
    const tableData = productos.value.map((producto) => {
      const prod = {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
      }
      return [
        prod.id,
        prod.nombre,
        prod.descripcion || 'Sin descripción',
        formatearPrecio(prod.precio),
      ]
    })

    // Usar autoTable de la instancia global
    if (typeof doc.autoTable === 'function') {
      doc.autoTable({
        startY: 40,
        head: [['ID', 'Nombre', 'Descripción', 'Precio']],
        body: tableData,
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          textColor: 50,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 45 },
          2: { cellWidth: 80 },
          3: { halign: 'right', cellWidth: 30 },
        },
        margin: { top: 40 },
      })
    } else {
      // Si autoTable no está disponible, crear tabla manualmente
      let yPos = 50
      doc.setFontSize(10)

      // Encabezados
      doc.setFont(undefined, 'bold')
      doc.text('ID', 20, yPos)
      doc.text('Nombre', 40, yPos)
      doc.text('Descripción', 90, yPos)
      doc.text('Precio', 170, yPos)

      yPos += 7
      doc.setFont(undefined, 'normal')

      // Datos
      tableData.forEach((row) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(String(row[0]), 20, yPos)
        doc.text(row[1].substring(0, 20), 40, yPos)
        doc.text(row[2].substring(0, 30), 90, yPos)
        doc.text(row[3], 170, yPos)
        yPos += 7
      })
    }

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Página ${i} de ${pageCount} - Generado: ${new Date().toLocaleDateString('es-MX')}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      )
    }

    // Guardar PDF
    const nombreArchivo = `productos_completo_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(nombreArchivo)

    toast.add({
      severity: 'success',
      summary: 'PDF Generado',
      detail: 'PDF completo descargado exitosamente',
      life: 3000,
    })
  } catch (error) {
    console.error('Error al generar PDF completo:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error al generar el PDF completo: ${error.message}`,
      life: 3000,
    })
  }
}

// Cargar productos
const cargarProductos = async () => {
  cargando.value = true
  try {
    const respuesta = await obtenerProductos()

    // El backend devuelve { message: "...", data: [...] }
    if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
      productos.value = respuesta.data
    } else if (Array.isArray(respuesta)) {
      productos.value = respuesta
    } else {
      console.error('Estructura de respuesta no reconocida:', respuesta)
      productos.value = []
    }
  } catch (error) {
    console.error('Error al cargar productos:', error)
    productos.value = []
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar productos',
      life: 3000,
    })
  } finally {
    cargando.value = false
  }
}

// Exponer método al componente padre
defineExpose({
  cargarProductos,
})

// Ciclo de vida
onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.acciones-tabla {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.estado-vacio,
.estado-cargando {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.confirmation-content {
  display: flex;
  align-items: center;
}

.tabla-productos {
  margin: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}
</style>
