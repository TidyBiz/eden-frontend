'use client'

import React from 'react'
import AddProducts from '../../modals/add-products'
import type { StockAnalytics, StockByBranch } from '@/contexts/backend'
import type { Branch, BranchColor, Product } from '@/utils/constants/common'

export interface StockTabProps {
  products: Product[]
  branches: Branch[]
  stockAnalytics: StockAnalytics
  stockByBranch: StockByBranch[]
  selectedBranchId: string
  setSelectedBranchId: (id: string) => void
  isAddProductsOpen: boolean
  setIsAddProductsOpen: (open: boolean) => void
  onProductCreated: () => void
  onEditProduct: (product: Product) => void
  onAddStock: (product: Product) => void
  formatCurrency: (amount: number) => string
  formatStock: (amount: number) => string
  getBranchColor: (branchId: string) => BranchColor
}

export default function StockTab({
  products,
  branches,
  stockAnalytics,
  stockByBranch,
  selectedBranchId,
  setSelectedBranchId,
  isAddProductsOpen,
  setIsAddProductsOpen,
  onProductCreated,
  onEditProduct,
  onAddStock,
  formatCurrency,
  formatStock,
}: StockTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-surface-secondary rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-heading flex items-center gap-3">
            Stock Total por Producto
          </h3>
          <AddProducts
            isOpen={isAddProductsOpen}
            setIsOpen={setIsAddProductsOpen}
            branches={branches}
            onProductCreated={onProductCreated}
          />
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-accent-strong bg-surface-accent/50">
                <th className="text-left py-4 px-4 text-accent-strong font-bold">
                  Producto
                </th>
                <th className="text-center py-4 px-4 text-accent-strong font-bold">
                  PLU
                </th>
                <th className="text-right py-4 px-4 text-accent-strong font-bold">
                  Precio
                </th>
                <th className="text-right py-4 px-4 text-accent-strong font-bold">
                  Stock Total
                </th>
                <th className="text-center py-4 px-4 text-accent-strong font-bold">
                  Estado
                </th>
                <th className="text-center py-4 px-4 text-accent-strong font-bold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => {
                  const totalStock = product.stock.reduce(
                    (sum, stock) => sum + stock.quantity,
                    0
                  )
                  const isLowStock = stockAnalytics.lowStockAlerts.some(
                    (alert) => alert.product.id === product.id
                  )

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-surface-accent hover:bg-surface-accent/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-heading font-semibold">
                        {product.name}
                      </td>
                      <td className="py-4 px-4 text-center text-accent-strong font-medium">
                        {product.PLU}
                      </td>
                      <td className="py-4 px-4 text-right text-heading font-semibold">
                        {formatCurrency(product.price)}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isLowStock ? 'text-status-warning' : 'text-action-primary'}`}
                      >
                        {formatStock(totalStock)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            isLowStock
                              ? 'bg-status-warning/20 text-status-warning-foreground border-2 border-status-warning'
                              : 'bg-action-primary/20 text-heading border-2 border-action-primary'
                          }`}
                        >
                          {isLowStock ? 'Stock Bajo' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-2 bg-surface-secondary text-accent-strong rounded-lg border-2 border-accent-strong hover:bg-accent-strong hover:text-white transition-all duration-200 cursor-pointer"
                            title="Editar Producto"
                          >
                            ⚙️
                          </button>
                          <button
                            onClick={() => onAddStock(product)}
                            className="px-4 py-2 bg-accent-strong text-white text-xs font-bold rounded-lg hover:bg-accent-strong-hover transition-all duration-200 cursor-pointer border-2 border-surface-primary hover:shadow-lg hover:shadow-accent-strong/30"
                          >
                            + Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-accent-strong">
                    <div className="text-center py-12 bg-surface-accent/30 rounded-xl">
                        <p className="font-semibold text-accent-strong text-3xl">
                        No hay productos registrados
                        </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de Stock Bajo - Versión detallada */}
      <div className={`${stockAnalytics.lowStockAlerts.length > 0 ? 'bg-status-error text-white' : 'bg-surface-secondary text-heading'} rounded-lg p-6`}>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          Alertas de Stock Bajo por Sucursal
        </h3>
        {Array.isArray(stockAnalytics.lowStockAlerts) &&
        stockAnalytics.lowStockAlerts.length > 0 ? (
          <div className="space-y-4">
            {stockAnalytics.lowStockAlerts.map((alert) => {
              const currentStock = Number(alert.currentStock) || 0
              const threshold = Number(alert.threshold) || 0
              const productPrice = Number(alert.product?.price) || 0
              const isWeightable = alert.product?.isSoldByWeight || false
              const unit = isWeightable ? 'kg' : 'unidades'

              return (
                <div
                  key={alert.id}
                  className="bg-surface-secondary/40 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:shadow-status-warning/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold mb-2 text-lg">
                        {alert.product?.name || 'Producto'}
                      </h4>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                        <span className="font-bold">
                          PLU: {alert.product?.PLU || 'N/A'}
                        </span>
                        <span>Precio: {formatCurrency(productPrice)}</span>
                        <span className="font-bold">
                          Stock actual: {formatStock(currentStock)} {unit}
                        </span>
                        <span>
                          Umbral: {threshold} {unit}
                        </span>
                        <span className="font-bold">
                          📍 {alert.branch?.name || 'Sucursal'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-2xl">
                        {formatStock(currentStock)} {unit}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        {currentStock <= threshold / 2
                          ? '🚨 Crítico'
                          : '⚠️ Bajo'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-accent-strong text-center py-12 bg-surface-accent/30 rounded-xl">
            <p className="font-semibold text-accent-strong text-3xl">
              No hay productos con stock bajo
            </p>
            <p className="text-lg">
              Todos los productos tienen stock suficiente
            </p>
          </div>
        )}
      </div>

      {/* Stock por Sucursal */}
      <div className="bg-surface-secondary rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-heading flex items-center gap-3">
            Stock por Sucursal
          </h3>
          <div className="flex items-center space-x-4">
            <label className="text-heading text-sm font-semibold">
              Filtrar por:
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-accent-strong text-white border-2 border-accent-strong rounded-lg px-4 py-2 text-sm transition-all font-medium"
            >
              <option value="" className='bg-white text-heading hover:bg-accent-strong hover:text-white cursor-pointer'>Todas las sucursales</option>
              {branches.map((branch) => (
                <option className='bg-white text-heading hover:bg-accent-strong hover:text-white' key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-accent-strong bg-surface-accent/50">
                <th className="text-left py-4 px-4 text-accent-strong font-bold">
                  Sucursal
                </th>
                <th className="text-left py-4 px-4 text-accent-strong font-bold">
                  Producto
                </th>
                <th className="text-center py-4 px-4 text-accent-strong font-bold">
                  PLU
                </th>
                <th className="text-right py-4 px-4 text-accent-strong font-bold">
                  Precio
                </th>
                <th className="text-right py-4 px-4 text-accent-strong font-bold">
                  Stock
                </th>
                <th className="text-center py-4 px-4 text-accent-strong font-bold">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {stockByBranch.length > 0 ? (
                stockByBranch.map((stock) => {
                  const isWeightable = stock.product?.isSoldByWeight || false
                  const unit = isWeightable ? 'kg.' : 'u.'
                  const isLowStock = stock.isLowStock

                  return (
                    <tr
                      key={stock.id}
                      className={`border-b border-surface-accent hover:bg-surface-accent/30 transition-colors ${
                        isLowStock ? 'bg-status-warning/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-heading font-semibold">
                        {stock.branch?.name || 'Sucursal'}
                      </td>
                      <td className="py-4 px-4 text-heading font-semibold">
                        {stock.product?.name || 'Producto'}
                      </td>
                      <td className="py-4 px-4 text-center text-accent-strong font-medium">
                        {stock.product?.PLU || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right text-heading font-semibold">
                        {formatCurrency(stock.product?.price || 0)}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isLowStock ? 'text-status-warning' : 'text-action-primary'}`}
                      >
                        {formatStock(stock.quantity)} {unit}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            isLowStock
                              ? 'bg-status-warning/20 text-status-warning-foreground border-2 border-status-warning'
                              : 'bg-action-primary/20 text-heading border-2 border-action-primary'
                          }`}
                        >
                          {isLowStock ? 'Stock Bajo' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-accent-strong">
                    <div className="text-center py-12 bg-surface-accent/30 rounded-xl">
                        <p className="font-semibold text-accent-strong text-3xl">
                        No hay stock registrado
                        </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
