"use client";

import React, { useEffect, useState } from 'react';
import { useEdenMarketBackend, DeliveryOrder } from '@/contexts/backend';
import { Product } from '@/utils/constants/common';


const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completados' },
  { value: 'cancelled', label: 'Cancelados' },
];

const AssignedDeliveryList: React.FC = () => {
  const { fetchDeliveryOrders, user, updateDeliveryOrderStatus, fetchProducts } = useEdenMarketBackend();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
    // Filtrar pedidos duplicados por id
    const uniqueOrders = orders.filter(
      (order, idx, self) => idx === self.findIndex(o => o.id === order.id)
    );
  // Obtener productos para mostrar nombres
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);
  // Marcar pedido como enviado
  const handleMarkAsSent = async (orderId: string) => {
    setLoadingId(orderId);
    await updateDeliveryOrderStatus(orderId, 'completed');
    // Esperar un poco para que el backend actualice el estado
    setTimeout(() => {
      const params: Record<string, string> = user ? { courierId: user.id } : {};
      if (status) params.status = status;
      fetchDeliveryOrders(params).then(setOrders);
      setLoadingId(null);
    }, 500);
  };

  useEffect(() => {
    if (user) {
      const params: Record<string, string> = { courierId: user.id };
      if (status) params.status = status;
      fetchDeliveryOrders(params).then(setOrders);
    }
  }, [user, status]);

  return (
    <div>
      <h2>Pedidos asignados</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="status-select" style={{ marginRight: 8 }}>Filtrar por estado:</label>
        <select
          id="status-select"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {uniqueOrders.length === 0 ? (
            <li style={{ color: '#598C30', fontWeight: 'bold', padding: '16px', background: '#F4F1EA', borderRadius: '12px', marginBottom: '12px' }}>
              No hay pedidos para mostrar.
            </li>
          ) : (
            uniqueOrders.map(order => (
            <li
              key={order.id}
              style={{
                background: '#fff',
                color: '#273C1F',
                border: '2px solid #C1E3A4',
                borderRadius: '12px',
                marginBottom: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px #C1E3A433',
                fontWeight: '500',
                fontSize: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span><strong>Dirección:</strong> {order.address}</span>
              <span><strong>Estado:</strong> {order.status}</span>
              <span><strong>Entrega:</strong> {new Date(order.deliveryTime).toLocaleString()}</span>
              <div style={{ marginTop: '8px' }}>
                <strong>Productos:</strong>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {order.items.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    return (
                      <li key={idx} style={{ color: '#598C30', fontWeight: 'bold' }}>
                        {item.quantity} x {prod ? prod.name : item.productId}
                        {item.unitPrice !== undefined && (
                          <span style={{ color: '#273C1F', fontWeight: 'normal' }}> (${item.unitPrice})</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              {order.status === 'pending' && (
                <button
                  onClick={() => handleMarkAsSent(order.id)}
                  disabled={loadingId === order.id}
                  style={{
                    marginTop: '12px',
                    padding: '10px 18px',
                    background: '#0aa65d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: loadingId === order.id ? 'not-allowed' : 'pointer',
                    opacity: loadingId === order.id ? 0.7 : 1,
                  }}
                >
                  {loadingId === order.id ? 'Marcando...' : 'Marcar como enviado'}
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AssignedDeliveryList;
