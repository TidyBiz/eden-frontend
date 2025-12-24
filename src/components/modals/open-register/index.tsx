import React, { useState } from 'react';

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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialCash) return;
        onOpenRegister(parseFloat(initialCash));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-800 animate-fade-in-up">
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
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={initialCash}
                                onChange={(e) => setInitialCash(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
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
