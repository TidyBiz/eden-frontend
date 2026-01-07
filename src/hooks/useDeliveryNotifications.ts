"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEdenMarketBackend } from '@/contexts/backend';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface DeliveryOrder {
    customerName: string;
    address: string;
    [key: string]: unknown;
}

export function useDeliveryNotifications(onNewOrder?: (order: DeliveryOrder) => void) {
    const { user } = useEdenMarketBackend();
    const socketRef = useRef<Socket | null>(null);
    const onNewOrderRef = useRef(onNewOrder);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Keep the callback ref updated
    useEffect(() => {
        onNewOrderRef.current = onNewOrder;
    }, [onNewOrder]);

    // Precargar el audio en la primera interacción del usuario
    useEffect(() => {
        const preloadAudio = () => {
            if (!audioRef.current) {
                audioRef.current = new Audio('/notification.mp3');
                audioRef.current.volume = 0.7;
                audioRef.current.load();
                console.log('Audio preloaded');
            }
        };

        // Precargar en el primer click o touch
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, preloadAudio, { once: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, preloadAudio);
            });
        };
    }, []);

    useEffect(() => {
        // Solo conectar si el usuario es cadete/courier
        if (!user || !['cadete', 'courier'].includes(user.role)) {
            return;
        }

        // Crear conexión WebSocket
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Registrar el cadete
            socket.emit('registerCourier', user.id);
        });

        socket.on('newOrder', (order) => {
            console.log('New order received:', order);

            // Reproducir sonido de notificación
            try {
                // Usar el audio precargado si existe, sino crear uno nuevo
                const audio = audioRef.current || new Audio('/notification.mp3');
                audio.volume = 0.7;

                // Reiniciar el audio si ya se estaba reproduciendo
                audio.currentTime = 0;

                audio.play().catch(err => {
                    console.log('Error playing notification sound:', err);
                    // Si falla, intentar de nuevo después de un pequeño delay
                    setTimeout(() => {
                        audio.play().catch(e => console.log('Second attempt failed:', e));
                    }, 100);
                });
            } catch (err) {
                console.log('Error creating audio:', err);
            }

            // Mostrar notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Nuevo Pedido Asignado', {
                    body: `Cliente: ${order.customerName}\nDirección: ${order.address}`,
                    icon: '/logo.png',
                });
            }

            // Llamar al callback si existe
            if (onNewOrderRef.current) {
                onNewOrderRef.current(order);
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Cleanup al desmontar
        return () => {
            socket.disconnect();
        };
    }, [user]);

    return socketRef.current;
}

// Hook para solicitar permisos de notificación
export function useNotificationPermission() {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
}
