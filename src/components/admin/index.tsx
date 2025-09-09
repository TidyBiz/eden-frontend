// ** React
import React, { useEffect, useState, useRef } from 'react'

// ** Components
import AddProducts from '../modals/add-products'
import AddStockModal from '../modals/add-stock'

// ** Contexts
import {
  useEdenMarketBackend,
  type BranchAnalytics,
  type StockAnalytics,
  type StockByBranch,
} from '@/contexts/backend'

// ** Types & Utils
import { BRANCH_COLORS, BranchColor, Product } from '@/utils/constants/common'

interface AdminInterfaceProps {
  className?: string
}

const AdminInterface: React.FC<AdminInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'stores'>(
    'overview'
  )
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false)
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics>({
    revenuePerBranch: [],
    activeBranchesCount: 0,
    totalRevenue: 0,
  })
  const [stockAnalytics, setStockAnalytics] = useState<StockAnalytics>({
    lowStockAlerts: [],
    lowStockCount: 0,
  })
  const [stockByBranch, setStockByBranch] = useState<StockByBranch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  const {
    products,
    fetchProducts,
    branches,
    totalRevenue,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    fetchTotalRevenue,
    fetchTransactions,
  } = useEdenMarketBackend()

  // Usar refs para evitar dependencias infinitas
  const functionsRef = useRef({
    fetchProducts,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    fetchTotalRevenue,
    fetchTransactions,
  })

  // Actualizar las referencias cuando cambien las funciones
  functionsRef.current = {
    fetchProducts,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    fetchTotalRevenue,
    fetchTransactions,
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingAnalytics(true)
      try {
        const {
          fetchProducts,
          fetchBranches,
          fetchBranchAnalytics,
          fetchStockAnalytics,
          fetchTransactions,
          fetchTotalRevenue,
        } = functionsRef.current
        await Promise.all([
          fetchProducts(),
          fetchBranches(),
          fetchBranchAnalytics().then(setBranchAnalytics),
          fetchStockAnalytics(20).then(setStockAnalytics),
          fetchTransactions(),
          fetchTotalRevenue(),
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    const loadTabData = async () => {
      const {
        fetchBranchAnalytics,
        fetchStockAnalytics,
        fetchProducts,
        fetchStockByBranch,
      } = functionsRef.current

      if (activeTab === 'overview') {
        try {
          const [branchData, stockData] = await Promise.all([
            fetchBranchAnalytics(),
            fetchStockAnalytics(20),
          ])
          setBranchAnalytics(branchData)
          setStockAnalytics(stockData)
        } catch (error) {
          console.error('Error loading analytics data:', error)
        }
      } else if (activeTab === 'stock') {
        try {
          await Promise.all([
            fetchProducts(),
            fetchStockAnalytics(20).then(setStockAnalytics),
            fetchStockByBranch(selectedBranchId || undefined).then(
              setStockByBranch
            ),
          ])
        } catch (error) {
          console.error('Error loading stock data:', error)
        }
      }
    }

    loadTabData()
  }, [activeTab, selectedBranchId])

  const handleProductCreated = () => {
    fetchProducts()
    fetchBranchAnalytics().then(setBranchAnalytics)
    fetchStockAnalytics(20).then(setStockAnalytics)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatStock = (amount: number) => {
    return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2)
  }

  const getBranchColor = (branchId: string): BranchColor => {
    if (!branchId) return BRANCH_COLORS[0]

    let hash = 0
    for (let i = 0; i < branchId.length; i++) {
      const char = branchId.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    const colorIndex = Math.abs(hash) % BRANCH_COLORS.length
    return BRANCH_COLORS[colorIndex]
  }

  const KPICard = ({
    title,
    value,
    subtitle,
    color = 'blue',
    isLoading = false,
  }: {
    title: string
    value: string | number
    subtitle?: string
    color?: string
    isLoading?: boolean
  }) => (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-${color}-500 transition-colors`}
    >
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      ) : (
        <>
          <p className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </>
      )}
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          title="Facturación Total"
          value={formatCurrency(Number(totalRevenue) || 0)}
          subtitle="Desde el inicio"
          color="green"
          isLoading={isLoadingAnalytics}
        />
        <KPICard
          title="Sucursales Activas"
          value={Number(branches?.length) || 0}
          subtitle="En funcionamiento"
          color="purple"
          isLoading={isLoadingAnalytics}
        />
      </div>

      {/* Gráfico de barras de facturación por sucursal */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          Facturación por Sucursal
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-32 h-4 bg-gray-700 rounded"></div>
                <div className="flex-1 h-6 bg-gray-700 rounded"></div>
                <div className="w-12 h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : Array.isArray(branchAnalytics.revenuePerBranch) &&
          branchAnalytics.revenuePerBranch.length > 0 ? (
          <div className="space-y-4">
            {branchAnalytics.revenuePerBranch.map((branch) => {
              const globalRevenue = Number(totalRevenue) || 0
              const branchRevenue = Number(branch.totalRevenue) || 0
              const percentage =
                globalRevenue > 0 ? (branchRevenue / globalRevenue) * 100 : 0
              return (
                <div
                  key={branch.branchId}
                  className="flex items-center space-x-4"
                >
                  <div className="w-32 text-gray-300 text-sm truncate">
                    {branch.branchName || 'Sucursal'}
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                      {formatCurrency(branchRevenue)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm w-12 text-right">
                    {Math.round(percentage)}%
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <p>No hay datos de facturación disponibles</p>
            <p className="text-sm mt-2">
              Las ventas aparecerán aquí una vez que se registren transacciones
            </p>
          </div>
        )}
      </div>

      {/* Productos con stock bajo */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          ⚠️ Alertas de Stock Bajo
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        ) : Array.isArray(stockAnalytics.lowStockAlerts) &&
          stockAnalytics.lowStockAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAnalytics.lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-red-900/20 border border-red-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-300">
                      {alert.product?.name || 'Producto'}
                    </h4>
                    <p className="text-red-400 text-sm">
                      PLU: {alert.product?.PLU || 'N/A'}
                    </p>
                    <p className="text-red-400 text-sm">
                      Sucursal: {alert.branch?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 font-bold">
                      {Number(alert.currentStock) || 0}{' '}
                      {alert.product?.isSoldByWeight ? 'kg' : 'unidades'}
                    </p>
                    <p className="text-red-500 text-sm">
                      Umbral: {Number(alert.threshold) || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <p>🎉 ¡Excelente! No hay productos con stock bajo</p>
            <p className="text-sm mt-2">
              Todos los productos tienen stock suficiente
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const StockTab = () => (
    <div className="space-y-6">
      {/* Stock total por producto */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-100">
            Stock Total por Producto
          </h3>
          <AddProducts
            isOpen={isAddProductsOpen}
            setIsOpen={setIsAddProductsOpen}
            branches={branches}
            onProductCreated={handleProductCreated}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Producto</th>
                <th className="text-center py-3 px-4 text-gray-300">PLU</th>
                <th className="text-right py-3 px-4 text-gray-300">Precio</th>
                <th className="text-right py-3 px-4 text-gray-300">
                  Stock Total
                </th>
                <th className="text-center py-3 px-4 text-gray-300">Estado</th>
                <th className="text-center py-3 px-4 text-gray-300">
                  Añadir stock
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
                      className="border-b border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <td className="py-3 px-4 text-gray-100 font-medium">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        {product.PLU}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-100">
                        {formatCurrency(product.price)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right ${
                          isLowStock ? 'text-red-400' : 'text-gray-100'
                        }`}
                      >
                        {formatStock(totalStock)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isLowStock
                              ? 'bg-red-900/50 text-red-300 border border-red-700'
                              : 'bg-green-900/50 text-green-300 border border-green-700'
                          }`}
                        >
                          {isLowStock ? 'Stock Bajo' : 'Normal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsAddStockOpen(true)
                          }}
                          className="px-3 py-1.5 bg-gray-600 text-gray-200 text-xs rounded-md hover:bg-gray-500 transition-colors cursor-pointer border border-gray-500"
                        >
                          Añadir stock
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No hay productos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de Stock Bajo - Versión detallada */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          ⚠️ Stock Bajo por Sucursal
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
                  className="bg-red-900/20 border border-red-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-red-300 mb-1">
                        {alert.product?.name || 'Producto'}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-red-400">
                        <span>PLU: {alert.product?.PLU || 'N/A'}</span>
                        <span>Precio: {formatCurrency(productPrice)}</span>
                        <span>
                          Stock actual: {formatStock(currentStock)} {unit}
                        </span>
                        <span>
                          Umbral: {threshold} {unit}
                        </span>
                        <span className="text-yellow-400">
                          📍 {alert.branch?.name || 'Sucursal'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-300 font-bold text-lg">
                        {formatStock(currentStock)} {unit}
                      </p>
                      <p className="text-red-500 text-sm">
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
          <div className="text-gray-400 text-center py-8">
            <p>🎉 ¡Perfecto! No hay alertas de stock bajo</p>
            <p className="text-sm mt-2">
              Todos los productos mantienen niveles de stock saludables por
              sucursal
            </p>
          </div>
        )}
      </div>

      {/* Stock por Sucursal - Nueva sección */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-100">
            📊 Stock por Sucursal
          </h3>
          <div className="flex items-center space-x-4">
            <label className="text-gray-300 text-sm">
              Filtrar por sucursal:
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las sucursales</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Sucursal</th>
                <th className="text-left py-3 px-4 text-gray-300">Producto</th>
                <th className="text-center py-3 px-4 text-gray-300">PLU</th>
                <th className="text-right py-3 px-4 text-gray-300">Precio</th>
                <th className="text-right py-3 px-4 text-gray-300">Stock</th>
                <th className="text-center py-3 px-4 text-gray-300">Estado</th>
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
                      className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${
                        isLowStock ? 'bg-red-900/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-md font-medium ${
                            getBranchColor(stock.branch?.id || '').textColor
                          } ${getBranchColor(stock.branch?.id || '').bgColor}`}
                        >
                          {stock.branch?.name || 'Sucursal'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-100 font-medium">
                        {stock.product?.name || 'Producto'}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-300">
                        {stock.product?.PLU || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-100">
                        {formatCurrency(stock.product?.price || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right ${
                          isLowStock ? 'text-red-400' : 'text-gray-100'
                        }`}
                      >
                        {formatStock(stock.quantity)} {unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isLowStock
                              ? 'bg-red-900/50 text-red-300 border border-red-700'
                              : 'bg-green-900/50 text-green-300 border border-green-700'
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
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    {selectedBranchId
                      ? 'No hay stock registrado para esta sucursal'
                      : 'No hay stock registrado'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const StoresTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          Gestión de Sucursales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((store) => (
            <div
              key={store.id}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-100">{store.name}</h4>
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    store.status === 'active'
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                  }`}
                >
                  {store.status === 'active' ? 'Activa' : 'Mantenimiento'}
                </span> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            🏪 Panel de Administración - Eden Verdulerías
          </h1>
          <p className="text-gray-400">
            Gestión completa de la cadena de verdulerías en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: '📊 Resumen', icon: '📊' },
            { id: 'stock', label: '📦 Stock', icon: '📦' },
            { id: 'stores', label: '🏪 Sucursales', icon: '🏪' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as 'overview' | 'stock' | 'stores')
              }
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-96">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'stock' && <StockTab />}
          {activeTab === 'stores' && <StoresTab />}
        </div>
      </div>

      {/* Modals */}
      <AddStockModal
        isOpen={isAddStockOpen}
        setIsOpen={setIsAddStockOpen}
        product={selectedProduct}
        onStockAdded={handleProductCreated}
      />
    </div>
  )
}

export default AdminInterface
