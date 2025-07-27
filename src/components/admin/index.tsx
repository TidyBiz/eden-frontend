import React, { useEffect, useState } from 'react'
import {
  useEdenMarketBackend,
  type BranchAnalytics,
  type StockAnalytics,
} from '@/contexts/backend'
import AddProducts from '../modals/addProducts'

interface AdminInterfaceProps {
  className?: string
}

const AdminInterface: React.FC<AdminInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'stores'>(
    'overview'
  )
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false)

  const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics>({
    revenuePerBranch: [],
    activeBranchesCount: 0,
    totalRevenue: 0,
  })
  const [stockAnalytics, setStockAnalytics] = useState<StockAnalytics>({
    lowStockAlerts: [],
    lowStockCount: 0,
  })
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  const {
    products,
    fetchProducts,
    branches,
    transactions,
    totalRevenue,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchTotalRevenue,
    fetchTransactions,
  } = useEdenMarketBackend()

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingAnalytics(true)
      try {
        await Promise.all([
          fetchProducts(),
          fetchBranches(),
          loadAnalyticsData(),
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

  const loadAnalyticsData = async () => {
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
  }

  useEffect(() => {
    if (activeTab === 'overview') {
      loadAnalyticsData()
    } else if (activeTab === 'stock') {
      fetchProducts()
      fetchStockAnalytics(20).then(setStockAnalytics)
    }
  }, [activeTab])

  const handleProductCreated = () => {
    fetchProducts()
    loadAnalyticsData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Facturación Total"
          value={formatCurrency(Number(totalRevenue) || 0)}
          subtitle="Desde el inicio"
          color="green"
          isLoading={isLoadingAnalytics}
        />
        <KPICard
          title="Transacciones Totales"
          value={Number(transactions?.length) || 0}
          subtitle="Registros de stock"
          color="blue"
          isLoading={isLoadingAnalytics}
        />
        <KPICard
          title="Sucursales Activas"
          value={Number(branches?.length) || 0}
          subtitle="En funcionamiento"
          color="purple"
          isLoading={isLoadingAnalytics}
        />
        <KPICard
          title="Alertas de Stock"
          value={Number(stockAnalytics.lowStockCount) || 0}
          subtitle="Productos con stock bajo"
          color="red"
          isLoading={isLoadingAnalytics}
        />
        <KPICard
          title="Productos Activos"
          value={products?.length || 0}
          subtitle="En catálogo"
          color="indigo"
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
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 font-bold">
                      {Number(alert.currentStock) || 0} unidades
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
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => {
                  const totalStock = product.stock
                    .reduce((sum, stock) => sum + stock.quantity, 0)
                    .toFixed(2)
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
                        {totalStock}
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
                        <span>Stock actual: {currentStock}</span>
                        <span>Umbral: {threshold}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-300 font-bold text-lg">
                        {currentStock} unidades
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
              Todos los productos mantienen niveles de stock saludables
            </p>
          </div>
        )}
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
              <div className="space-y-2">
                {/* <div className="flex justify-between">
                  <span className="text-gray-400">Facturación:</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(store.revenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ventas:</span>
                  <span className="text-blue-400 font-medium">
                    {store.sales}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Empleados:</span>
                  <span className="text-purple-400 font-medium">
                    {store.employees}
                  </span>
                </div> */}
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
    </div>
  )
}

export default AdminInterface
