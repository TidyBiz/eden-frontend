"use client"
import React, { useState } from "react";
import RoleRedirect from "../role-redirect";
import Navbar from "@/components/navbar";
import AssignedDeliveryList from "@/components/courier/delivery/AssignedDeliveryList";
import { useEdenMarketBackend } from "@/contexts/backend";

export default function CourierPage() {
  const { user, isAuthenticated, logout } = useEdenMarketBackend();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleUserMenu = () => setShowUserMenu((v) => !v);

  return (
    <RoleRedirect>
      <div className="min-h-screen bg-[#F4F1EA] p-4">
        <div className="max-w-4xl mx-auto">
          <Navbar
            isLoggedIn={isAuthenticated}
            user={user}
            handleLogin={() => {}}
            handleLogout={logout}
            toggleUserMenu={toggleUserMenu}
            showUserMenu={showUserMenu}
          />
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#598C30]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#273C1F] tracking-tight" style={{ fontFamily: 'var(--font-chewy)' }}>
                Pedidos asignados
              </h1>
              <button
                className="bg-[#598C30] hover:bg-[#4E7526] text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-200 border-2 border-[#273C1F]"
                onClick={() => {/* Aquí puedes abrir modal o redirigir */}}
              >
                Crear pedido
              </button>
            </div>
            <AssignedDeliveryList />
          </div>
        </div>
      </div>
    </RoleRedirect>
  );
}
