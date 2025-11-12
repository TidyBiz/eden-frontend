import React from 'react';
import CourierOrders from './CourierOrders';

const CourierIndex: React.FC = () => {
  return (
    <div>
      <h1>Pedidos asignados</h1>
      <CourierOrders />
    </div>
  );
};

export default CourierIndex;
