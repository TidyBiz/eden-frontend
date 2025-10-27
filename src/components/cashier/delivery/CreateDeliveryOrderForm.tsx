"use client";
import React, { useState, useEffect } from 'react';
import { useEdenMarketBackend, DeliveryOrderItem, Product, User } from '@/contexts/backend';
import { Branch } from '@/utils/constants/common';


const CreateDeliveryOrderForm: React.FC = () => {
  const { createDeliveryOrder, user, fetchProducts, fetchCouriers, fetchBranches } = useEdenMarketBackend();
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [courierId, setCourierId] = useState('');
  const [items, setItems] = useState<DeliveryOrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [couriers, setCouriers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCouriers().then(setCouriers);
    fetchBranches().then(setBranches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Si el usuario tiene branchId, seleccionarlo por defecto
    if (user?.branchId) {
      setBranchId(user.branchId);
    }
  }, [user]);

  const handleAddItem = (productId: string, quantity: number) => {
    setItems(prev => {
      const exists = prev.find(item => item.productId === productId);
      if (exists) {
        return prev.map(item => item.productId === productId ? { ...item, quantity } : item);
      }
      return [...prev, { productId, quantity }];
    });
  };

  // Convierte deliveryTime (ej: "18:00") a ISO string para hoy
  const getDeliveryTimeISO = () => {
    if (!deliveryTime) return '';
    const now = new Date();
    const [hours, minutes] = deliveryTime.split(':');
    now.setHours(Number(hours), Number(minutes), 0, 0);
    return now.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !branchId) return;
    // Agregar unitPrice a cada item
    const itemsWithPrice = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        unitPrice: product ? product.price : 0,
      };
    });
    const dto = {
      address,
      deliveryTime: getDeliveryTimeISO(),
      cashierId: user.id,
      courierId,
      branchId,
      items: itemsWithPrice,
    };
    const result = await createDeliveryOrder(dto);
    setSuccess(!!result);
    setAddress('');
    setDeliveryTime('');
    setCourierId('');
    setItems([]);
    // Si solo hay una sucursal, mantenerla seleccionada
  if (branches.length === 1) setBranchId(branches[0].id);
  else setBranchId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-[#273C1F] mb-4">Crear pedido de envío</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#598C30] mb-1">Dirección</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Dirección de entrega"
            required
            className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#598C30] mb-1">Hora de entrega</label>
          <input
            value={deliveryTime}
            onChange={e => setDeliveryTime(e.target.value)}
            placeholder="Ej: 18:00"
            required
            className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#598C30] mb-1">Sucursal</label>
          <select
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            required
            className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
          >
            <option value="">Seleccionar sucursal</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#598C30] mb-1">Seleccionar cadete</label>
        <select
          value={courierId}
          onChange={e => setCourierId(e.target.value)}
          required
          className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
        >
          <option value="">Seleccionar cadete</option>
          {couriers.map(courier => (
            <option key={courier.id} value={courier.id}>{courier.username}</option>
          ))}
        </select>
      </div>
      <div>
        <h4 className="text-lg font-bold text-[#273C1F] mb-2">Productos</h4>
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="flex items-center gap-3">
              <span className="font-semibold text-[#598C30] w-32">{product.name}</span>
              <input
                type="number"
                min={1}
                placeholder="Cantidad"
                value={items.find(i => i.productId === product.id)?.quantity || ''}
                onChange={e => handleAddItem(product.id, Number(e.target.value))}
                className="w-24 px-3 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-[#0aa65d] hover:bg-[#598C30] text-white rounded-xl text-lg font-bold transition-all duration-300 border-2 border-[#273C1F]"
      >
        Crear pedido
      </button>
      {success && <p className="text-green-600 font-semibold mt-2">Pedido creado correctamente</p>}
    </form>
  );
};

export default CreateDeliveryOrderForm;
