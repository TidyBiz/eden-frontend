"use client"

import React, { useState, useEffect } from "react"
import { useEdenMarketBackend } from "@/contexts/backend"
import { Product } from "@/utils/constants/common"
import { X, Save, Trash2, AlertCircle } from "lucide-react"

interface EditProductModalProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    product: Product | null
    onProductUpdated: () => void
}

export default function EditProductModal({
    isOpen,
    setIsOpen,
    product,
    onProductUpdated,
}: EditProductModalProps) {
    const { updateProduct, deleteProduct } = useEdenMarketBackend()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        PLU: 0,
        price: 0,
        altPrice: 0,
        isSoldByWeight: true,
        description: "",
        reorderPoint: 10,
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                PLU: product.PLU,
                price: product.price,
                altPrice: product.altPrice,
                isSoldByWeight: product.isSoldByWeight,
                description: product.description,
                reorderPoint: product.reorderPoint || 10,
            })
        }
    }, [product])

    const handleSave = async () => {
        if (!product) return
        setLoading(true)
        try {
            await updateProduct(product.id, formData)
            onProductUpdated()
            setIsOpen(false)
        } catch (error) {
            console.error("Error updating product:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!product) return
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
            setLoading(true)
            try {
                await deleteProduct(product.id)
                onProductUpdated()
                setIsOpen(false)
            } catch (error) {
                console.error("Error deleting product:", error)
            } finally {
                setLoading(false)
            }
        }
    }

    if (!isOpen || !product) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-[#273C1F]">
            <div className="bg-[#F4F1EA] rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-[#598C30] animate-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#598C30] p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Editar Producto</h2>
                        <p className="text-white/80 font-bold">PLU: {product.PLU}</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-[#598C30] uppercase mb-1 ml-1">Nombre del Producto</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border-2 border-[#C1E3A4] rounded-2xl px-5 py-3 font-bold focus:border-[#598C30] outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-[#598C30] uppercase mb-1 ml-1">Precio Sugerido</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#598C30]">$</span>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-white border-2 border-[#C1E3A4] rounded-2xl pl-8 pr-5 py-3 font-bold focus:border-[#598C30] outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-[#598C30] uppercase mb-1 ml-1">Precio Alternativo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#5FB0B0]">$</span>
                                    <input
                                        type="number"
                                        value={formData.altPrice}
                                        onChange={(e) => setFormData({ ...formData, altPrice: Number(e.target.value) })}
                                        className="w-full bg-white border-2 border-[#C1E3A4] rounded-2xl pl-8 pr-5 py-3 font-bold focus:border-[#5FB0B0] outline-none transition-all text-[#2C6A6A]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#C1E3A4]/30 rounded-3xl p-6 border-2 border-[#C1E3A4]">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-[#598C30] w-6 h-6" />
                                <h4 className="font-black text-[#273C1F] uppercase italic">Ajuste de Temporada</h4>
                            </div>
                            <label className="block text-xs font-black text-[#598C30] uppercase mb-2 ml-1">
                                Stock Bajo (Configurar Alerta)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={formData.reorderPoint}
                                    onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                                    className="w-24 bg-white border-2 border-[#598C30] rounded-xl px-4 py-2 font-black text-center focus:ring-4 ring-[#598C30]/20 outline-none transition-all"
                                />
                                <span className="font-bold text-[#273C1F]">
                                    {formData.isSoldByWeight ? "kg." : "unidades"}
                                </span>
                            </div>
                            <p className="text-[10px] text-[#598C30] font-bold mt-2 uppercase tracking-tight">
                                * Cambia este valor según la época del año o demanda.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-6 py-4 bg-red-100 text-red-600 rounded-3xl font-black hover:bg-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 bg-[#598C30] text-white py-4 rounded-3xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#598C30]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-6 h-6" />
                            {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
