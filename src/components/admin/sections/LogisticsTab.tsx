"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Truck, Calendar, ArrowRight, CheckCircle, Clock, Download } from 'lucide-react'
import { useEdenMarketBackend, type StockTransfer, StockTransferStatus } from '@/contexts/backend'
import CreateStockTransferModal from '../../logistics/CreateStockTransferModal'
import { generateRemitoPDF } from '@/utils/lib/pdf-generator'

export default function LogisticsTab() {
    const { fetchStockTransfers, confirmStockTransfer, user } = useEdenMarketBackend()
    const [transfers, setTransfers] = useState<StockTransfer[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const loadTransfers = async () => {
        setIsLoading(true)
        const data = await fetchStockTransfers()
        setTransfers(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadTransfers()
    }, [])

    const handleConfirm = async (id: string) => {
        if (!user) return
        if (confirm('¿Estás seguro de que deseas confirmar la recepción de este remito? El stock impactará inmediatamente en la sucursal.')) {
            await confirmStockTransfer(id, user.id as number)
            loadTransfers()
        }
    }

    const getStatusBadge = (status: StockTransferStatus) => {
        switch (status) {
            case StockTransferStatus.RECEIVED:
                return (
                    <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" /> RECIBIDO
                    </span>
                )
            case StockTransferStatus.PENDING:
                return (
                    <span className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                        <Clock className="w-3.5 h-3.5" /> PENDIENTE
                    </span>
                )
            default:
                return (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                        {status.toUpperCase()}
                    </span>
                )
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with CTA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border-2 border-[#C1E3A4] shadow-xl shadow-[#598C30]/5 hover:shadow-[#598C30]/15 transition-all">
                <div>
                    <h3 className="text-2xl font-black text-[#273C1F] flex items-center gap-3">
                        <Truck className="w-8 h-8 text-[#598C30]" />
                        Control de Logística y Remitos
                    </h3>
                    <p className="text-[#598C30] font-medium mt-1">Monitorea el movimiento de mercadería entre sucursales</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#0aa65d] text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0aa65d]/20 ring-4 ring-[#0aa65d]/10"
                >
                    <Plus className="w-6 h-6" />
                    NUEVO REPARTO
                </button>
            </div>

            {/* List of Remitos */}
            <div className="bg-[#F4F1EA] rounded-3xl p-8 border-2 border-[#C1E3A4] shadow-lg">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-bold text-[#273C1F]">Envíos Recientes</h4>
                    <button onClick={loadTransfers} className="text-[#598C30] text-sm font-bold hover:underline">Actualizar lista</button>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : transfers.length > 0 ? (
                    <div className="grid gap-6">
                        {transfers.map((t) => (
                            <div
                                key={t.id}
                                className="bg-white border-2 border-[#C1E3A4] rounded-2xl p-6 hover:border-[#598C30] transition-all group relative overflow-hidden"
                            >
                                {/* Visual indicator for status */}
                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${t.status === StockTransferStatus.RECEIVED ? 'bg-green-500' : 'bg-yellow-400'}`} />

                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left: Info & Route */}
                                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <div>
                                            <div className="text-xs font-black text-[#598C30] tracking-widest uppercase mb-1">REMITO</div>
                                            <div className="text-lg font-black text-[#273C1F]">{t.remitoNumber}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                                                <Calendar className="w-3.5 h-3.5" /> {new Date(t.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="hidden md:block h-10 w-px bg-gray-100" />

                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">ORIGEN</div>
                                                <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold text-gray-600 border border-gray-200 uppercase">
                                                    {t.originBranch.name}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-[#C1E3A4]" />
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-[#598C30] uppercase">DESTINO</div>
                                                <div className="bg-[#C1E3A4]/30 px-3 py-1 rounded-lg text-sm font-black text-[#598C30] border border-[#C1E3A4] uppercase">
                                                    {t.destinationBranch.name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Items, Status & Actions */}
                                    <div className="flex items-center justify-between md:justify-end gap-8">
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase">CARGA</div>
                                                <div className="font-black text-[#273C1F] text-xl">
                                                    {t.items.length} <span className="text-sm text-gray-400 font-bold">ítems</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => generateRemitoPDF(t)}
                                                className="p-2 hover:bg-[#C1E3A4]/50 rounded-lg text-[#598C30] transition-colors shadow-sm active:scale-95"
                                                title="Descargar Remito PDF"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div>
                                            {getStatusBadge(t.status)}
                                        </div>

                                        {t.status === StockTransferStatus.PENDING && (
                                            <button
                                                onClick={() => handleConfirm(t.id)}
                                                className="bg-white border-2 border-[#598C30] text-[#598C30] hover:bg-[#598C30] hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                                            >
                                                Confirmar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/30 border-4 border-dashed border-[#C1E3A4] rounded-[40px]">
                        <Truck className="w-20 h-20 text-[#C1E3A4] mx-auto mb-6" />
                        <h5 className="text-2xl font-black text-[#598C30]">Sin remitos registrados</h5>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">
                            Cuando el dueño cargue mercadería para distribuir, los remitos aparecerán aquí.
                        </p>
                    </div>
                )}
            </div>

            <CreateStockTransferModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onSuccess={loadTransfers}
            />
        </div>
    )
}
