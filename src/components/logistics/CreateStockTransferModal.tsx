"use client"

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Truck, Package, Save } from 'lucide-react'
import { useEdenMarketBackend, type CreateStockTransferDto } from '@/contexts/backend'
import { useModalAnimation } from '@/hooks/useModalAnimation'

interface CreateStockTransferModalProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    onSuccess?: () => void
}

export default function CreateStockTransferModal({
    isOpen,
    setIsOpen,
    onSuccess,
}: CreateStockTransferModalProps) {
    const { products, branches, user, createStockTransfer } = useEdenMarketBackend()

    const [remitoNumber, setRemitoNumber] = useState('')
    const [destinationBranchId, setDestinationBranchId] = useState('')
    const [observations, setObservations] = useState('')
    const [items, setItems] = useState<{ productId: string; quantity: number; note: string; productName: string }[]>([])
    const [selectedProductId, setSelectedProductId] = useState('')
    const [itemQuantity, setItemQuantity] = useState<string>('')
    const [itemNote, setItemNote] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            // Generar un número de remito aleatorio por ahora
            const date = new Date()
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
            setRemitoNumber(`R-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${random}`)
        }
    }, [isOpen])

    const addItem = () => {
        if (!selectedProductId || !itemQuantity || parseFloat(itemQuantity) <= 0) return

        const product = products.find(p => p.id === selectedProductId)
        if (!product) return

        setItems([...items, {
            productId: selectedProductId,
            productName: product.name,
            quantity: parseFloat(itemQuantity),
            note: itemNote
        }])

        setSelectedProductId('')
        setItemQuantity('')
        setItemNote('')
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!destinationBranchId || items.length === 0 || !user) {
            setError('Por favor complete la sucursal de destino y añada al menos un producto.')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Buscar la sucursal de origen (buscaremos la que diga "Central" o la primera por defecto)
            const originBranch = branches.find(b => b.name.toLowerCase().includes('central')) || branches[0]

            const dto: CreateStockTransferDto = {
                remitoNumber,
                originBranchId: originBranch.id,
                destinationBranchId,
                createdById: user.id as number,
                observations,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    note: item.note
                }))
            }

            await createStockTransfer(dto)
            setIsOpen(false)
            if (onSuccess) onSuccess()

            // Reset state
            setItems([])
            setObservations('')
            setDestinationBranchId('')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Error al crear el remito')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const { isVisible, isClosing } = useModalAnimation(isOpen)

    if (!isVisible) return null

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 ${isClosing ? 'animate-modal-overlay-exit' : 'animate-modal-overlay-enter'}`}>
            <div
                className={`bg-[#F4F1EA] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col border-4 border-[#598C30] overflow-hidden ${isClosing ? 'animate-modal-content-exit' : 'animate-modal-content-enter'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[#598C30] to-[#0aa65d] text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Crear Nuevo Remito</h2>
                            <p className="text-white/80 font-medium">Distribución mayorista a sucursales</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-black/10 p-2 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[#273C1F] font-bold flex items-center gap-2">
                                N° de Remito
                            </label>
                            <input
                                type="text"
                                value={remitoNumber}
                                onChange={e => setRemitoNumber(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none font-bold text-[#273C1F]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[#273C1F] font-bold">Sucursal de Destino</label>
                            <select
                                value={destinationBranchId}
                                onChange={e => setDestinationBranchId(e.target.value)}
                                className="w-full px-4 py-3 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none font-medium text-[#273C1F]"
                                required
                            >
                                <option value="">Seleccione una sucursal...</option>
                                {branches.filter(b => !b.name.toLowerCase().includes('central')).map(branch => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Add Item Form */}
                    <div className="bg-[#C1E3A4]/30 rounded-3xl p-6 border-2 border-[#C1E3A4]">
                        <h3 className="text-lg font-bold text-[#273C1F] mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#598C30]" />
                            Añadir Productos al Camión
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#598C30] uppercase">Producto</label>
                                <select
                                    value={selectedProductId}
                                    onChange={e => setSelectedProductId(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none"
                                >
                                    <option value="">Buscar producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (PLU: {p.PLU})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#598C30] uppercase">Cantidad</label>
                                <input
                                    type="number"
                                    value={itemQuantity}
                                    onChange={e => setItemQuantity(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-[#598C30] uppercase">Nota (Opcional)</label>
                                    <input
                                        type="text"
                                        value={itemNote}
                                        onChange={e => setItemNote(e.target.value)}
                                        placeholder="Ej: Calidad extra"
                                        className="w-full px-4 py-2 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="bg-[#598C30] text-white p-2.5 rounded-xl hover:bg-[#0aa65d] transition-transform active:scale-95"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-[#273C1F]">Detalle de Carga</h3>
                        {items.length > 0 ? (
                            <div className="border-2 border-[#C1E3A4] rounded-2xl overflow-hidden bg-white">
                                <table className="w-full">
                                    <thead className="bg-[#F4F1EA] text-[#598C30] text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Producto</th>
                                            <th className="px-6 py-4 text-center">Cantidad</th>
                                            <th className="px-6 py-4 text-left">Observaciones</th>
                                            <th className="px-6 py-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-[#F4F1EA]">
                                        {items.map((item, index) => (
                                            <tr key={index} className="hover:bg-[#C1E3A4]/10 transition-colors">
                                                <td className="px-6 py-4 font-bold text-[#273C1F]">{item.productName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-[#C1E3A4] px-4 py-2 rounded-lg font-black text-[#273C1F]">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[#598C30] text-sm font-medium italic">
                                                    {item.note || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/50 border-2 border-dashed border-[#C1E3A4] rounded-3xl">
                                <Package className="w-12 h-12 text-[#C1E3A4] mx-auto mb-4" />
                                <p className="text-[#598C30] font-bold">No haz añadido productos al camión todavía</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[#273C1F] font-bold">Observaciones Generales</label>
                        <textarea
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-[#C1E3A4] rounded-xl focus:border-[#0aa65d] focus:outline-none min-h-[100px]"
                            placeholder="Notas generales sobre el envío..."
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold animate-shake">
                            {error}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 bg-[#F4F1EA] border-t-4 border-[#C1E3A4] flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-6 py-3 font-bold text-[#598C30] hover:text-[#273C1F] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || items.length === 0}
                        className="bg-[#0aa65d] text-white px-8 py-3 rounded-2xl font-black text-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0aa65d]/30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-6 h-6" />
                                EMITIR REMITO
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
