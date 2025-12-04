"use client";

import React from 'react';
import { useEdenMarketBackend, DeliveryOrder } from '@/contexts/backend';

type Props = { order: DeliveryOrder };

const DeliveryOrderDetail: React.FC<Props> = ({ order }) => {
  const { updateDeliveryOrderStatus } = useEdenMarketBackend();

  const handleMarkDelivered = async () => {
    await updateDeliveryOrderStatus(order.id, 'delivered');
    // Aquí podrías actualizar el estado local o recargar la lista
  };

  return (
    <div>
      <h2>Detalle del pedido</h2>
      <p>Cliente: {order.customerName}</p>
      <p>Dirección: {order.address}</p>
      <p>Estado: {order.status}</p>
      <button onClick={handleMarkDelivered} disabled={order.status === 'delivered'}>
        Marcar como entregado
      </button>
    </div>
  );
};

export default DeliveryOrderDetail;
