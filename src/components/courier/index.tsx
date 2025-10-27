import React from 'react';
import AssignedDeliveryList from './delivery/AssignedDeliveryList';

const CourierIndex: React.FC = () => {
  return (
    <div>
      <h1>Pedidos asignados</h1>
      <AssignedDeliveryList />
    </div>
  );
};

export default CourierIndex;
