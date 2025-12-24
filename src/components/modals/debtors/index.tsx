import React, { useEffect, useState } from 'react'
import { ClientCredit } from '@/utils/constants/common'
import { useEdenMarketBackend } from '@/contexts/backend'
import ConfirmationModal from '../confirmation'

interface DebtorsModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function DebtorsModal({ isOpen, onClose }: DebtorsModalProps) {
    const { fetchDebtors, settleDebt } = useEdenMarketBackend()
    const [debtors, setDebtors] = useState<ClientCredit[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDebtor, setSelectedDebtor] = useState<ClientCredit | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')
    const [processing, setProcessing] = useState(false)
    const [settleAmount, setSettleAmount] = useState<string>('')

    const loadDebtors = async () => {
        setLoading(true)
        try {
            const data = await fetchDebtors()
            setDebtors(data)
        } catch (error) {
            console.error('Error loading debtors:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadDebtors()
        }
    }, [isOpen])

    const filteredDebtors = debtors.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.dni.includes(searchTerm)
    )

    const handleSettleClick = (debtor: ClientCredit) => {
        setSelectedDebtor(debtor)
        setSettleAmount('') // Start empty or with total? User asked for total button, so maybe empty
        setShowConfirm(true)
    }

    const handleTotalClick = () => {
        if (selectedDebtor) {
            setSettleAmount(selectedDebtor.amount.toString())
        }
    }

    const handleConfirmSettle = async () => {
        if (!selectedDebtor) return

        setProcessing(true)
        try {
            const amount = settleAmount ? parseFloat(settleAmount) : undefined
            await settleDebt(selectedDebtor.dni, paymentMethod, amount)
            await loadDebtors() // Reload list
            setShowConfirm(false)
            setSelectedDebtor(null)
        } catch (error) {
            console.error('Error settling debt:', error)
            alert('Error al liquidar la deuda')
        } finally {
            setProcessing(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Fiados / Deudores
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-100"
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredDebtors.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No se encontraron deudores.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredDebtors.map((debtor) => (
                                <div
                                    key={debtor.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {debtor.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            DNI: {debtor.dni}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Actualizado: {new Date(debtor.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                                            ${debtor.amount.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleSettleClick(debtor)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                        >
                                            Liquidar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSettle}
                title="Liquidar Deuda"
                isLoading={processing}
                confirmText="Confirmar Pago"
                type="warning"
                message={
                    selectedDebtor && (
                        <div className="space-y-4">
                            <p>
                                ¿Confirma que el cliente{' '}
                                <span className="font-semibold">{selectedDebtor.name}</span> va
                                a liquidar su deuda total de{' '}
                                <span className="font-bold text-red-600">
                                    ${selectedDebtor.amount.toFixed(2)}
                                </span>
                                ?
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Monto a Liquidar:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={settleAmount}
                                        onChange={(e) => setSettleAmount(e.target.value)}
                                        placeholder="Ingrese monto (opcional)"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                                    />
                                    <button
                                        onClick={handleTotalClick}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Total
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Método de Pago:
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex-1 py-2 px-3 rounded-md border text-center transition-colors ${paymentMethod === 'cash'
                                            ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                                            }`}
                                    >
                                        Efectivo
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('transfer')}
                                        className={`flex-1 py-2 px-3 rounded-md border text-center transition-colors ${paymentMethod === 'transfer'
                                            ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'
                                            }`}
                                    >
                                        Transferencia
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            />
        </div >
    )
}
