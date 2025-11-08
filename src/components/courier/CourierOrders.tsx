import { useEdenMarketBackend } from '@/contexts/backend';
import { DeliveryOrder } from '@/contexts/backend';
import { useEffect, useState } from 'react';

const CourierOrders = () => {
  const { user, fetchDeliveryOrders, updateDeliveryOrderStatus } = useEdenMarketBackend();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (user) {
  fetchDeliveryOrders({ cadeteId: Number(user.id) }).then((data: DeliveryOrder[]) => setOrders(data));
    }
  }, [user, fetchDeliveryOrders]);

  const handleStatus = async (orderId: string, status: 'delivered' | 'cancelled') => {
    await updateDeliveryOrderStatus(orderId, status);
    setMessage(status === 'delivered' ? 'Pedido marcado como enviado.' : 'Pedido cancelado y stock restaurado.');
    setOrders(prev => prev.filter(order => order.id !== orderId));
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pedidos asignados</h2>
      {message && <div className="mb-2 text-green-700 font-semibold">{message}</div>}
      {orders.length === 0 && <p>No tienes pedidos asignados.</p>}
      {orders.map((order: DeliveryOrder) => (
        <div key={order.id} className="border p-4 mb-2 rounded-xl bg-[#F4F1EA]">
          <div><strong>Dirección:</strong> {order.address}</div>
          <div><strong>Estado:</strong> {order.status}</div>
          <div><strong>Entrega:</strong> {new Date(order.deliveryTime).toLocaleString()}</div>
          <div><strong>Productos:</strong>
            <ul className="ml-4">
              {order.items.map((i, idx) => (
                <li key={idx}>
                  {i.quantity} x
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => handleStatus(order.id, 'delivered')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >Marcar como enviado</button>
            <button
              onClick={() => handleStatus(order.id, 'cancelled')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >Cancelar pedido</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourierOrders;
