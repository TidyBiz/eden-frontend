"use client";
import React, { useState, useEffect } from 'react';
import { useEdenMarketBackend, DeliveryOrderItem } from '@/contexts/backend';
import { Branch } from '@/utils/constants/common';

interface Product {
  id: string;
  name: string;
  price: number;
}

const CreateDeliveryOrderForm: React.FC = () => {
  const { createDeliveryOrder, user, fetchProducts, fetchCouriers, fetchBranches } = useEdenMarketBackend();
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [courierId, setCourierId] = useState('');
  const [items, setItems] = useState<DeliveryOrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [couriers, setCouriers] = useState<{ id: string | number; username: string }[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Estados para agregar productos
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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

  const handleAddItem = () => {
    if (!selectedProductId || selectedQuantity < 1) return;

    setItems((prev: any) => {
      const exists = prev.find(item => item.productId === selectedProductId);
      if (exists) {
        // Si ya existe, actualizar cantidad
        return prev.map(item =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + selectedQuantity }
            : item
        );
      }
      // Si no existe, agregar nuevo
      return [...prev, { productId: selectedProductId, quantity: selectedQuantity }];
    });

    // Resetear selección
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    setItems(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto';
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

    // Limpiar mensajes previos
    setSuccess(false);
    setError('');

    // Agregar unitPrice a cada item
    const itemsWithPrice = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        unitPrice: product ? product.price : 0,
      };
    });
    console.log('Valor de courierId seleccionado:', courierId);
    const dto = {
      address,
      customerName,
      deliveryTime: getDeliveryTimeISO(),
      cashierId: String(user.id), // Asegura que sea string
      cadeteId: Number(courierId),
      branchId,
      items: itemsWithPrice,
    };

    try {
      const result = await createDeliveryOrder(dto);
      setSuccess(!!result);
      setAddress('');
      setCustomerName('');
      setDeliveryTime('');
      setCourierId('');
      setItems([]);
      // Si solo hay una sucursal, mantenerla seleccionada
      if (branches.length === 1) setBranchId(branches[0].id);
      else setBranchId('');
    } catch (err) {
      // Mostrar error de stock
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el pedido';
      setError(errorMessage);
      console.error('Error creating delivery order:', err);
    }
  };

  return (
    <div className="max-w-[2600px] mx-auto px-4">
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
            <label className="block text-sm font-semibold text-[#598C30] mb-1">Nombre del Cliente</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
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
          <div className="md:col-span-2">
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
        </div>

        {/* Sección de productos rediseñada */}
        <div className="border-2 border-[#598C30] rounded-xl p-6 bg-white">
          <h4 className="text-lg font-bold text-[#273C1F] mb-4">Productos del pedido</h4>

          {/* Agregar producto */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#598C30] mb-1">Seleccionar producto</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
              >
                <option value="">-- Elegir producto --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-semibold text-[#598C30] mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                value={selectedQuantity}
                onChange={e => setSelectedQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
              />
            </div>
            <div className="w-full md:w-40">
              <label className="block text-sm font-semibold text-[#598C30] mb-1 invisible md:visible">Acción</label>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId}
                className="w-full h-[42px] px-4 bg-[#598C30] hover:bg-[#0aa65d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all duration-300 border-2 border-[#273C1F]"
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* Lista de productos agregados */}
          {items.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#598C30] mb-2">Productos agregados:</p>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 bg-[#C1E3A4]/30 p-3 rounded-lg border border-[#598C30]">
                  <span className="flex-1 font-semibold text-[#273C1F]">{getProductName(item.productId)}</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleUpdateQuantity(item.productId, Number(e.target.value))}
                    className="w-20 px-3 py-1 border-2 border-[#598C30] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-white text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.productId)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#598C30] py-4 italic">No hay productos agregados</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#0aa65d] hover:bg-[#598C30] text-white rounded-xl text-lg font-bold transition-all duration-300 border-2 border-[#273C1F]"
        >
          Crear pedido
        </button>
        {success && <p className="text-green-600 font-semibold mt-2">Pedido creado correctamente</p>}
        {error && (
          <div className="mt-2 p-4 bg-red-100 border-2 border-red-500 rounded-xl overflow-x-auto">
            <p className="text-red-700 font-semibold whitespace-pre-line break-words">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateDeliveryOrderForm;
