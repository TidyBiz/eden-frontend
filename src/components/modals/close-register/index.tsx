import React, { useState, useEffect } from 'react';
import { useModalAnimation } from '@/hooks/useModalAnimation';

interface CloseRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmClose: (finalCash: number) => Promise<void>;
    stats: {
        initialCash: number;
        cashSales: number;
        transferSales: number;
        creditSales: number;
        totalExtractions: number;
        totalCashInBox: number; // calculated (initial + cashSales - totalExtractions)
        totalSales: number;
    } | null;
    isLoading: boolean;
}

export default function CloseRegisterModal({
    isOpen,
    onClose,
    onConfirmClose,
    stats,
    isLoading,
}: CloseRegisterModalProps) {
    const [finalCash, setFinalCash] = useState('');
    const [discrepancy, setDiscrepancy] = useState<number | null>(null);

    useEffect(() => {
        if (stats && finalCash !== '') {
            const counted = parseFloat(finalCash);
            setDiscrepancy(counted - stats.totalCashInBox);
        } else {
            setDiscrepancy(null);
        }
    }, [finalCash, stats]);

    const { isVisible, isClosing } = useModalAnimation(isOpen && !!stats);

    if (!isVisible || !stats) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalCash) return;
        onConfirmClose(parseFloat(finalCash));
    };

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-md ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}
            onClick={(e) => {

                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border-2 border-[#598C30] flex flex-col max-h-[90vh] ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#c53030] to-[#dc2626] p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Cierre de Caja</h2>
                        <p className="text-red-50 opacity-95 text-sm">
                            Verifica los montos y confirma el cierre.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Totals Summary */}
                        <div className="space-y-5">
                            <h3 className="text-xl font-semibold text-[#273C1F] border-b-2 border-[#598C30] pb-3">Resumen de Ventas</h3>

                            <div className="flex justify-between items-center text-base">
                                <span className="text-[#273C1F]">Efectivo Inicial:</span>
                                <span className="font-mono font-semibold text-[#273C1F] text-lg">${stats.initialCash.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-base">
                                <span className="text-[#273C1F]">Ventas en Efectivo (+):</span>
                                <span className="font-mono font-semibold text-[#0aa65d] text-lg">${stats.cashSales.toFixed(2)}</span>
                            </div>

                            {stats.totalExtractions > 0 && (
                                <div className="flex justify-between items-center text-base">
                                    <span className="text-[#273C1F]">Extracciones (-):</span>
                                    <span className="font-mono font-semibold text-[#c53030] text-lg">${stats.totalExtractions.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-base pt-3 border-t-2 border-[#598C30]">
                                <span className="font-bold text-[#273C1F]">Total Efectivo Esperado:</span>
                                <span className="font-mono font-bold text-xl text-[#273C1F]">${stats.totalCashInBox.toFixed(2)}</span>
                            </div>

                            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#598C30]">
                                <div className="flex justify-between items-center text-base mb-3">
                                    <span className="text-[#273C1F]">Ventas Transferencia:</span>
                                    <span className="font-mono font-semibold text-blue-600 text-lg">${stats.transferSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-base">
                                    <span className="text-[#273C1F]">Ventas Fiado (Crédito):</span>
                                    <span className="font-mono font-semibold text-orange-600 text-lg">${stats.creditSales.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t-2 border-[#598C30]">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#273C1F] text-lg">Venta Total del Turno:</span>
                                    <span className="font-mono font-bold text-2xl text-[#0aa65d]">${stats.totalSales.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <div className="bg-[#F4F1EA] p-6 rounded-xl border-2 border-[#598C30]">
                            <h3 className="text-xl font-semibold text-[#273C1F] mb-5">Conteo de Efectivo</h3>
                            <form onSubmit={handleSubmit} id="close-register-form">
                                <label className="block text-base font-semibold text-[#598C30] mb-3">
                                    Dinero físico en caja ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={finalCash}
                                    onChange={(e) => setFinalCash(e.target.value)}
                                    className="w-full px-5 py-4 bg-white border-2 border-[#598C30] rounded-xl text-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] mb-5"
                                    placeholder="Ingrese el monto contado"
                                    autoFocus
                                />

                                {discrepancy !== null && (
                                    <div className={`p-5 rounded-xl text-center border-2 ${Math.abs(discrepancy) < 1 ? 'bg-green-50 text-green-800 border-green-300' : 'bg-red-50 text-[#c53030] border-[#c53030]'}`}>
                                        <p className="text-sm uppercase font-bold tracking-wide mb-2">Diferencia</p>
                                        <p className="text-3xl font-bold">
                                            {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}
                                        </p>
                                        <p className="text-sm opacity-90 mt-2">
                                            {Math.abs(discrepancy) < 1 ? 'Cuadra perfecto (aprox)' : discrepancy > 0 ? 'Sobra dinero' : 'Falta dinero'}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-2 border-[#598C30] bg-[#F4F1EA] flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-700 bg-gray-200 border-2 border-gray-300 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="close-register-form"
                        className="px-6 py-3 bg-[#c53030] hover:bg-[#dc2626] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !finalCash}
                    >
                        {isLoading ? 'Cerrando...' : 'Confirmar Cierre'}
                    </button>
                </div>
            </div>
        </div>
    );
}
