"use client"


import { useEdenMarketBackend } from "@/contexts/backend"
import type { DeliveryOrder } from "@/contexts/backend"
import { useEffect, useState, useCallback } from "react"
import { useDeliveryNotifications, useNotificationPermission } from "@/hooks/useDeliveryNotifications"

const CourierOrders = () => {

  const { user, fetchDeliveryOrders, updateDeliveryOrderStatus, products, fetchProducts } = useEdenMarketBackend()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [message, setMessage] = useState<string>("")
  const [tab, setTab] = useState<'pendientes' | 'finalizados'>("pendientes")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Solicitar permisos de notificación
  useNotificationPermission();

  // Conectar a WebSocket y escuchar nuevos pedidos
  const handleNewOrder = useCallback((newOrder: any) => {
    // Recargar la lista de pedidos cuando llega uno nuevo
    if (user) {
      fetchDeliveryOrders({ cadeteId: Number(user.id) }).then((data: DeliveryOrder[]) => setOrders(data));
    }
    // Mostrar mensaje de éxito
    setMessage("¡Nuevo pedido asignado!");
    setTimeout(() => setMessage(""), 3000);
  }, [user, fetchDeliveryOrders]);

  useDeliveryNotifications(handleNewOrder);

  // Cargar productos si no están cargados
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products, fetchProducts])


  useEffect(() => {
    if (user) {
      fetchDeliveryOrders({ cadeteId: Number(user.id) }).then((data: DeliveryOrder[]) => setOrders(data))
    }
  }, [user, fetchDeliveryOrders])

  const handleStatus = async (orderId: string, status: "delivered" | "cancelled") => {
    await updateDeliveryOrderStatus(orderId, status)
    setMessage(status === "delivered" ? "Pedido marcado como enviado." : "Pedido cancelado y stock restaurado.")
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
    setTimeout(() => setMessage(""), 2000)
  }


  // Separar pedidos por estado
  const pendientes = orders.filter((o) => o.status === 'pending')

  // Filtrar finalizados solo del día actual
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Inicio del día

  const finalizados = orders.filter((o) => {
    if (o.status !== 'delivered' && o.status !== 'cancelled') return false

    const orderDate = new Date(o.deliveryTime)
    orderDate.setHours(0, 0, 0, 0)

    return orderDate.getTime() === today.getTime()
  })

  // Paginación para finalizados
  const totalPages = Math.ceil(finalizados.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFinalizados = finalizados.slice(startIndex, endIndex)

  // Resetear página cuando cambia el tab
  const handleTabChange = (newTab: 'pendientes' | 'finalizados') => {
    setTab(newTab)
    setCurrentPage(1)
  }

  // Helper para mostrar nombre del producto (ahora viene directo en el objeto)
  const getProductName = (item: any) => {
    if (item.product && typeof item.product === 'object') {
      return item.product.name || `Producto (${item.product.id || ''})`;
    }
    return 'Producto';
  }

  return (
    <div className="bg-[#F4F1EA] rounded-2xl shadow-xl p-6 border-2 border-[#C1E3A4]">
      <h2 className="text-3xl font-bold mb-6 text-[#273C1F] flex items-center gap-3">
        <span className="text-4xl">📦</span>
        Pedidos asignados
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-all duration-200 ${tab === 'pendientes' ? 'border-[#0aa65d] bg-[#C1E3A4] text-[#273C1F]' : 'border-transparent bg-transparent text-[#598C30]'}`}
          onClick={() => handleTabChange('pendientes')}
        >
          Pendientes
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-bold border-b-2 transition-all duration-200 ${tab === 'finalizados' ? 'border-[#B0855F] bg-[#F4E7DE] text-[#6A442C]' : 'border-transparent bg-transparent text-[#B0855F]'}`}
          onClick={() => handleTabChange('finalizados')}
        >
          Completados/Cancelados
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 text-[#273C1F] bg-[#C1E3A4] rounded-xl font-semibold border-2 border-[#0aa65d] shadow-md">
          ✓ {message}
        </div>
      )}

      {/* Lista de pedidos */}
      {tab === 'pendientes' && pendientes.length === 0 && (
        <div className="text-center py-12 text-[#598C30] bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
          <div className="text-6xl mb-3">📭</div>
          <p className="text-lg font-bold text-[#273C1F]">No tienes pedidos pendientes</p>
          <p className="text-sm mt-2 font-medium">Los pedidos aparecerán aquí cuando se asignen</p>
        </div>
      )}
      {tab === 'finalizados' && finalizados.length === 0 && (
        <div className="text-center py-12 text-[#B0855F] bg-[#F4E7DE]/60 rounded-xl border-2 border-[#B0855F]">
          <div className="text-6xl mb-3">📭</div>
          <p className="text-lg font-bold text-[#6A442C]">No tienes pedidos completados/cancelados</p>
        </div>
      )}

      <div className="space-y-4">
        {(tab === 'pendientes' ? pendientes : paginatedFinalizados).map((order: DeliveryOrder) => (
          <div
            key={order.id}
            className={`bg-white rounded-xl border-2 ${tab === 'pendientes' ? 'border-[#598C30] hover:border-[#0aa65d]' : 'border-[#B0855F] hover:border-[#6A442C]'} p-5 shadow-md hover:shadow-lg transition-all duration-300 ${tab === 'pendientes' ? 'hover:shadow-[#0aa65d]/20' : 'hover:shadow-[#B0855F]/20'}`}
          >
            {/* Order Info Section */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-sm font-semibold text-[#598C30]">Cliente</p>
                  <p className="font-bold text-[#273C1F]">{order.customerName || 'Cliente'}</p>
                  <p className="text-sm font-semibold text-[#598C30] mt-1">Dirección</p>
                  <p className="font-bold text-[#273C1F]">{order.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-[#598C30]">Hora de entrega</p>
                  <p className="font-bold text-[#273C1F]">{new Date(order.deliveryTime).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-sm font-semibold text-[#598C30]">Estado</p>
                  <p className="font-bold text-[#273C1F] bg-[#C1E3A4]/50 inline-block px-3 py-1 rounded-lg border border-[#598C30]">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="border-t-2 border-[#C1E3A4] pt-4 mb-5">
              <p className="text-sm font-semibold text-[#598C30] mb-3 flex items-center gap-2">
                <span>📦</span> Productos
              </p>
              <ul className="space-y-2 pl-6">
                {order.items.map((i, idx) => (
                  <li key={idx} className="text-[#273C1F] font-medium">
                    <span className="bg-[#C1E3A4] px-2 py-1 rounded font-bold text-[#598C30] mr-2">{i.quantity}x</span>
                    {getProductName(i)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons solo para pendientes */}
            {tab === 'pendientes' && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleStatus(order.id, "delivered")}
                  className="flex-1 px-4 py-3 bg-[#0aa65d] hover:bg-[#598C30] text-white rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#0aa65d]/30 border-2 border-[#273C1F] hover:scale-[1.02] active:scale-[0.98]"
                >
                  ✓ Marcar enviado
                </button>
                <button
                  onClick={() => handleStatus(order.id, "cancelled")}
                  className="flex-1 px-4 py-3 bg-[#B0855F] hover:bg-[#6A442C] text-white rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#B0855F]/30 border-2 border-[#6A442C] hover:scale-[1.02] active:scale-[0.98]"
                >
                  ✕ Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación solo para finalizados */}
      {tab === 'finalizados' && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 border-2 ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-[#F4E7DE] text-[#6A442C] border-[#B0855F] hover:bg-[#B0855F] hover:text-white'
              }`}
          >
            ← Anterior
          </button>

          <span className="text-[#273C1F] font-bold">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 border-2 ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-[#F4E7DE] text-[#6A442C] border-[#B0855F] hover:bg-[#B0855F] hover:text-white'
              }`}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default CourierOrders
