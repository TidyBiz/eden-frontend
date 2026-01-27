import React, { useState, useEffect } from 'react';

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

    if (!isOpen || !stats) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!finalCash) return;
        onConfirmClose(parseFloat(finalCash));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Cierre de Caja</h2>
                        <p className="text-red-100 opacity-90 text-sm">
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
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Totals Summary */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Resumen de Ventas</h3>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Efectivo Inicial:</span>
                                <span className="font-mono font-medium text-gray-900 dark:text-gray-100">${stats.initialCash.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Ventas en Efectivo (+):</span>
                                <span className="font-mono font-medium text-green-600">${stats.cashSales.toFixed(2)}</span>
                            </div>

                            {stats.totalExtractions > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Extracciones (-):</span>
                                    <span className="font-mono font-medium text-red-600">${stats.totalExtractions.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Total Efectivo Esperado:</span>
                                <span className="font-mono font-bold text-lg text-gray-900 dark:text-gray-100">${stats.totalCashInBox.toFixed(2)}</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Ventas Transferencia:</span>
                                    <span className="font-mono font-medium text-blue-600">${stats.transferSales.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Ventas Fiado (Crédito):</span>
                                    <span className="font-mono font-medium text-orange-600">${stats.creditSales.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">Venta Total del Turno:</span>
                                    <span className="font-mono font-bold text-xl text-green-700 dark:text-green-400">${stats.totalSales.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Conteo de Efectivo</h3>
                            <form onSubmit={handleSubmit} id="close-register-form">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dinero físico en caja ($)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={finalCash}
                                    onChange={(e) => setFinalCash(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-lg focus:ring-2 focus:ring-red-500 outline-none mb-4"
                                    placeholder="Ingrese el monto contado"
                                    autoFocus
                                />

                                {discrepancy !== null && (
                                    <div className={`p-4 rounded-lg text-center ${Math.abs(discrepancy) < 1 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                        <p className="text-xs uppercase font-bold tracking-wide mb-1">Diferencia</p>
                                        <p className="text-2xl font-bold">
                                            {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}
                                        </p>
                                        <p className="text-xs opacity-80 mt-1">
                                            {Math.abs(discrepancy) < 1 ? 'Cuadra perfecto (aprox)' : discrepancy > 0 ? 'Sobra dinero' : 'Falta dinero'}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="close-register-form"
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !finalCash}
                    >
                        {isLoading ? 'Cerrando...' : 'Confirmar Cierre'}
                    </button>
                </div>
            </div>
        </div>
    );
}
