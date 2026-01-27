import React, { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEdenMarketBackend } from '@/contexts/backend';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface MoneyExtractionNotification {
  branchName: string;
  cashierName: string;
  amount: number;
  comment: string;
  createdAt: Date | string;
}

interface UseAdminNotificationsOptions {
  onExtraction?: (extraction: MoneyExtractionNotification) => void;
  onCashRegisterClose?: () => void;
}

export function useAdminNotifications(options?: UseAdminNotificationsOptions) {
  const { user, isAuthenticated } = useEdenMarketBackend();
  const socketRef = useRef<Socket | null>(null);
  const onExtractionRef = useRef(options?.onExtraction);
  const onCashRegisterCloseRef = useRef(options?.onCashRegisterClose);

  // Mantener los callbacks actualizados
  useEffect(() => {
    onExtractionRef.current = options?.onExtraction;
    onCashRegisterCloseRef.current = options?.onCashRegisterClose;
  }, [options?.onExtraction, options?.onCashRegisterClose]);

  useEffect(() => {
    // Solo conectar si el usuario es admin
    if (!user || user.role !== 'admin' || !isAuthenticated) {
      return;
    }

    // Crear conexión WebSocket al namespace de admin
    const socket = io(`${SOCKET_URL}/admin-notifications`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin connected to WebSocket server');
      // Registrar el admin
      socket.emit('registerAdmin', user.id);
    });

    // Escuchar notificaciones de extracciones
    socket.on('moneyExtraction', (data: MoneyExtractionNotification) => {
      console.log('Money extraction notification received:', data);
      
      // Toast personalizado con JSX para mejor estilo
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-[#598C30]`}
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-4xl">💰</div>
              <div className="ml-4 flex-1">
                <p className="text-xl font-bold text-[#273C1F] mb-3">
                  Extracción Realizada
                </p>
                <div className="space-y-2 text-base">
                  <div>
                    <span className="font-bold text-[#598C30]">Sucursal:</span>{' '}
                    <span className="text-[#273C1F]">{data.branchName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#598C30]">Cashier:</span>{' '}
                    <span className="text-[#273C1F]">{data.cashierName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#598C30]">Monto:</span>{' '}
                    <span className="text-[#273C1F] font-bold text-lg">
                      ${data.amount.toFixed(2)}
                    </span>
                  </div>
                  {data.comment && (
                    <div>
                      <span className="font-bold text-[#598C30]">Motivo:</span>{' '}
                      <span className="text-[#273C1F]">{data.comment}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
      });

      // Llamar al callback si existe (para refrescar datos y almacenar extracción)
      if (onExtractionRef.current) {
        onExtractionRef.current(data);
      }

      // TODO: Aquí se puede agregar la funcionalidad de envío de email
      // Ejemplo:
      // await sendExtractionEmail({
      //   branchName: data.branchName,
      //   cashierName: data.cashierName,
      //   amount: data.amount,
      //   comment: data.comment,
      //   recipients: ['admin@example.com']
      // });
    });

    // Escuchar notificaciones de cierre de caja
    socket.on('cashRegisterClose', (data: {
      branchName: string;
      cashierName: string;
      finalCash: number;
      totalSales: number;
      totalExtractions: number;
      closedAt: Date;
    }) => {
      console.log('Cash register close notification received:', data);
      
      // Toast personalizado con JSX para mejor estilo
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-[#598C30]`}
        >
          <div className="flex-1 w-0 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-4xl">🏪</div>
              <div className="ml-4 flex-1">
                <p className="text-xl font-bold text-[#273C1F] mb-3">
                  Caja Cerrada
                </p>
                <div className="space-y-2 text-base">
                  <div>
                    <span className="font-bold text-[#598C30]">Sucursal:</span>{' '}
                    <span className="text-[#273C1F]">{data.branchName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#598C30]">Cashier:</span>{' '}
                    <span className="text-[#273C1F]">{data.cashierName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#598C30]">Efectivo final:</span>{' '}
                    <span className="text-[#273C1F] font-bold text-lg">
                      ${data.finalCash.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#598C30]">Ventas:</span>{' '}
                    <span className="text-[#273C1F] font-bold text-lg">
                      ${data.totalSales.toFixed(2)}
                    </span>
                  </div>
                  {data.totalExtractions > 0 && (
                    <div>
                      <span className="font-bold text-[#598C30]">Extracciones:</span>{' '}
                      <span className="text-[#273C1F] font-bold text-lg text-red-600">
                        -${data.totalExtractions.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
      });

      // Llamar al callback si existe (para refrescar datos)
      if (onCashRegisterCloseRef.current) {
        onCashRegisterCloseRef.current();
      }

      // TODO: Aquí se puede agregar la funcionalidad de envío de email
      // Ejemplo:
      // await sendCashRegisterCloseEmail({
      //   branchName: data.branchName,
      //   cashierName: data.cashierName,
      //   finalCash: data.finalCash,
      //   totalSales: data.totalSales,
      //   totalExtractions: data.totalExtractions,
      //   recipients: ['admin@example.com']
      // });
    });

    socket.on('disconnect', () => {
      console.log('Admin disconnected from WebSocket server');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, isAuthenticated]);

  return socketRef.current;
}
