"use client";

import React, { useEffect, useState } from 'react';
import { useEdenMarketBackend, DeliveryOrder } from '@/contexts/backend';
import CreateDeliveryOrderForm from './CreateDeliveryOrderForm';

const DeliveryOrderList: React.FC = () => {
  const { fetchDeliveryOrders, user } = useEdenMarketBackend();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDeliveryOrders({ cashierId: user.id }).then(setOrders);
    }
  }, [user, fetchDeliveryOrders]);

  return (
    <div>
      <h2>Historial de pedidos de envío</h2>
      <button onClick={() => setShowForm(f => !f)}>
        {showForm ? 'Cerrar formulario' : 'Crear nuevo pedido'}
      </button>
      {showForm && <CreateDeliveryOrderForm />}
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.address} - {order.status} - {order.deliveryTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeliveryOrderList;
