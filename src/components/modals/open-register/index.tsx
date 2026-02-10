import React, { useState } from 'react';
import { useModalAnimation } from '@/hooks/useModalAnimation';

interface OpenRegisterModalProps {
    isOpen: boolean;
    onOpenRegister: (initialCash: number) => Promise<void>;
    isLoading: boolean;
    userBranch: string;
}

export default function OpenRegisterModal({
    isOpen,
    onOpenRegister,
    isLoading,
    userBranch,
}: OpenRegisterModalProps) {
    const [initialCash, setInitialCash] = useState('');
    const { isVisible, isClosing } = useModalAnimation(isOpen);

    if (!isVisible) return null;

    // Format number with thousand separators (points)
    const formatNumber = (value: string): string => {
        // Remove all non-digit characters except decimal point
        const numericValue = value.replace(/[^\d.]/g, '');
        
        if (!numericValue) return '';
        
        // Find the last dot to determine if it's a decimal separator
        const lastDotIndex = numericValue.lastIndexOf('.');
        const afterLastDot = lastDotIndex !== -1 ? numericValue.substring(lastDotIndex + 1) : '';
        
        // If there's a dot and 1-2 digits after it, treat it as decimal
        const hasDecimal = lastDotIndex !== -1 && afterLastDot.length > 0 && afterLastDot.length <= 2 && /^\d+$/.test(afterLastDot);
        
        if (hasDecimal) {
            // Split: integer part and decimal part
            const integerPart = numericValue.substring(0, lastDotIndex).replace(/\./g, '');
            const decimalPart = afterLastDot.substring(0, 2); // Limit to 2 decimal places
            
            // Format integer part with thousand separators
            const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            return `${formattedInteger}.${decimalPart}`;
        } else {
            // No decimal part, just format the integer
            const integerPart = numericValue.replace(/\./g, '');
            return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
    };

    // Parse formatted number back to numeric value
    const parseFormattedNumber = (value: string): number => {
        if (!value) return 0;
        
        // Find the last dot - it's the decimal separator
        const lastDotIndex = value.lastIndexOf('.');
        
        if (lastDotIndex !== -1) {
            // Check if the part after the last dot has 1-2 digits (likely decimal)
            const afterLastDot = value.substring(lastDotIndex + 1);
            const beforeLastDot = value.substring(0, lastDotIndex);
            
            // If after last dot has 1-2 digits, treat it as decimal
            if (afterLastDot.length <= 2 && /^\d+$/.test(afterLastDot)) {
                // Remove all dots from beforeLastDot (thousand separators)
                const integerPart = beforeLastDot.replace(/\./g, '');
                return parseFloat(`${integerPart}.${afterLastDot}`) || 0;
            } else {
                // Last dot is not a decimal, remove all dots
                return parseFloat(value.replace(/\./g, '')) || 0;
            }
        }
        
        // No decimal point, just remove thousand separators
        return parseFloat(value.replace(/\./g, '')) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow empty string
        if (value === '') {
            setInitialCash('');
            return;
        }
        // Format the number
        const formatted = formatNumber(value);
        setInitialCash(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialCash) return;
        const numericValue = parseFormattedNumber(initialCash);
        if (numericValue > 0) {
            onOpenRegister(numericValue);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-md ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}>
            <div 
                className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-800 ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
                    <h2 className="text-2xl font-bold text-white mb-1">Apertura de Caja</h2>
                    <p className="text-green-100 opacity-90 text-sm">
                        Inicia tu turno registrando el efectivo inicial.
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Monto inicial en caja ($)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                required
                                value={initialCash}
                                onChange={handleChange}
                                className="w-full pl-8 pr-4 py-3 text-gray-500 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                        {userBranch && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Sucursal: {userBranch}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading || !initialCash}
                            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Abriendo Caja...
                                </span>
                            ) : (
                                'Abrir Caja'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
