"use client";
import React, { useState } from 'react';

interface ExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, comment: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ExtractionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ExtractionModalProps) {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const getFinalAmount = (): number => {
    if (selectedAmount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(selectedAmount) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    if (finalAmount <= 0 || !comment.trim()) return;
    
    await onSubmit(finalAmount, comment.trim());
    // Limpiar formulario después de enviar
    setSelectedAmount('');
    setCustomAmount('');
    setComment('');
  };

  const handleClose = () => {
    setSelectedAmount('');
    setCustomAmount('');
    setComment('');
    onClose();
  };

  // Opciones de cantidad predefinidas
  const amountOptions = [
    { value: '100', label: '$100' },
    { value: '200', label: '$200' },
    { value: '500', label: '$500' },
    { value: '1000', label: '$1,000' },
    { value: '2000', label: '$2,000' },
    { value: '5000', label: '$5,000' },
    { value: '10000', label: '$10,000' },
    { value: 'custom', label: 'Monto personalizado' },
  ];

  const finalAmount = getFinalAmount();
  const isValid = finalAmount > 0 && comment.trim().length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" 
      onClick={(e) => {
        // Solo cerrar si el clic fue directamente en el fondo (no en el contenido del modal)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#598C30] w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#273C1F]">Extracción de Dinero</h2>
          <button
            onClick={handleClose}
            className="text-[#598C30] hover:text-[#273C1F] text-2xl font-bold transition-colors"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select de cantidad */}
          <div>
            <label className="block text-sm font-semibold text-[#598C30] mb-2">
              Cantidad a extraer
            </label>
            <select
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
            >
              <option value="">Seleccionar cantidad</option>
              {amountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Input personalizado si se selecciona "Monto personalizado" */}
          {selectedAmount === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-[#598C30] mb-2">
                Ingrese el monto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Ej: 1500.50"
                className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA]"
              />
            </div>
          )}

          {/* Campo de comentario */}
          <div>
            <label className="block text-sm font-semibold text-[#598C30] mb-2">
              Motivo del egreso
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Ingrese el motivo de la extracción..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-[#598C30] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0aa65d] text-[#273C1F] bg-[#F4F1EA] resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex-1 px-4 py-2 bg-[#0aa65d] hover:bg-[#598C30] text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Confirmar Extracción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
