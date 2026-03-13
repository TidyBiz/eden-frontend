"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Calendar, ArrowRight, CheckCircle, Clock, Download, RefreshCcw, Truck } from 'lucide-react'
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
            <div className="flex flex-col bg-surface-highlight justify-between items-start gap-4 p-6 rounded-3xl shadow-xl transition-all">
                <h3 className="text-2xl font-black text-heading flex items-center gap-3">
                    <Truck className="w-6 h-6" />
                    Control de Logística y Remitos
                </h3>
                <div className="flex justify-between items-center gap-4 w-full">
                    <p className="text-heading text-lg font-bold mt-1">Monitorea el movimiento de mercadería entre sucursales</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white cursor-pointer text-text-option text-heading px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-action-primary/20 ring-4 ring-action-primary/10"
                    >
                        <Plus className="w-6 h-6" />
                        NUEVO REPARTO
                </button>
                </div>
            </div>

            {/* List of Remitos */}
            <div className="bg-surface-secondary rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="text-2xl font-bold text-heading">Envíos Recientes</h4>
                    <button onClick={loadTransfers} className="text-text-accent-strong flex items-center gap-2 py-2 px-4 rounded-lg bg-accent-strong text-sm font-bold cursor-pointer hover:bg-accent-strong/80 transition-all">
                        <RefreshCcw className="w-4 h-4" />
                        Actualizar lista
                    </button>
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
                                className="bg-white border-2 border-surface-accent rounded-2xl p-6 hover:border-accent-strong transition-all group relative overflow-hidden"
                            >
                                {/* Visual indicator for status */}
                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${t.status === StockTransferStatus.RECEIVED ? 'bg-green-500' : 'bg-yellow-400'}`} />

                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left: Info & Route */}
                                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <div>
                                            <div className="text-xs font-black text-accent-strong tracking-widest uppercase mb-1">REMITO</div>
                                            <div className="text-lg font-black text-heading">{t.remitoNumber}</div>
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
                                            <ArrowRight className="w-5 h-5 text-text-muted" />
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-accent-strong uppercase">DESTINO</div>
                                                <div className="bg-surface-accent/30 px-3 py-1 rounded-lg text-sm font-black text-accent-strong border border-surface-accent uppercase">
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
                                                <div className="font-black text-heading text-xl">
                                                    {t.items.length} <span className="text-sm text-gray-400 font-bold">ítems</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => generateRemitoPDF(t)}
                                                className="p-2 hover:bg-surface-accent/50 rounded-lg text-accent-strong transition-colors shadow-sm active:scale-95"
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
                                                className="bg-white border-2 border-accent-strong text-accent-strong hover:bg-accent-strong hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
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
                    <div className="text-center py-20 bg-ui-empty-bg-subtle rounded-lg text-ui-empty-text">
                        <svg width={80} height={80} viewBox="0 0 41 30" fill="none" className="mx-auto mb-6 text-text-accent-strong" aria-hidden>
                            <path d="M29.8182 5.6228H35.4091L41 13.2248V24.3655H37.2075C36.9831 25.9269 36.2068 27.3548 35.0209 28.3875C33.8349 29.4203 32.3187 29.9887 30.75 29.9887C29.1813 29.9887 27.665 29.4203 26.4791 28.3875C25.2932 27.3548 24.5169 25.9269 24.2925 24.3655H14.8439C14.6223 25.9291 13.8472 27.3599 12.6609 28.395C11.4747 29.4301 9.95688 30 8.38636 30C6.81584 30 5.29805 29.4301 4.11178 28.395C2.92551 27.3599 2.15041 25.9291 1.92886 24.3655H0V1.87427C0 1.37718 0.196347 0.900453 0.545846 0.54896C0.895346 0.197467 1.36937 0 1.86364 0H27.9545C28.4488 0 28.9228 0.197467 29.2723 0.54896C29.6218 0.900453 29.8182 1.37718 29.8182 1.87427V5.6228ZM29.8182 9.37133V14.9941H37.2727V14.46L33.5305 9.37133H29.8182Z" fill="currentColor" />
                        </svg>
                        <h5 className="text-2xl font-black">Sin remitos registrados</h5>
                        <p className="font-medium max-w-xs mx-auto mt-2">
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
