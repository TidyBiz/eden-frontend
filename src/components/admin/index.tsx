import React, { useEffect, useState } from 'react'
import { mockData } from './mockData'
import { useEdenMarketBackend } from '@/contexts/backend'
import AddProducts from '../modals/addProducts'

interface AdminInterfaceProps {
  className?: string
}

const AdminInterface: React.FC<AdminInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock' | 'stores' | 'employees'
  >('overview')
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false)

  const { products, fetchProducts, branches, fetchBranches } = useEdenMarketBackend()

  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, [])

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
  }: {
    title: string
    value: string | number
    subtitle?: string
    color?: string
  }) => (
    <div
      className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-${color}-500 transition-colors`}
    >
      <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Facturación Total"
          value={formatCurrency(mockData.overview.totalRevenue)}
          subtitle="Último mes"
          color="green"
        />
        <KPICard
          title="Ventas Totales"
          value={mockData.overview.totalSales}
          subtitle="Transacciones"
          color="blue"
        />
        <KPICard
          title="Sucursales"
          value={mockData.overview.totalStores}
          subtitle="Activas"
          color="purple"
        />
        <KPICard
          title="Stock Bajo"
          value={mockData.overview.lowStockItems}
          subtitle="Productos"
          color="red"
        />
        <KPICard
          title="Empleados"
          value={mockData.overview.totalEmployees}
          subtitle="Total"
          color="indigo"
        />
      </div>

      {/* Gráfico de barras simple de facturación por sucursal */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          Facturación por Sucursal
        </h3>
        <div className="space-y-4">
          {mockData.stores.map((store) => {
            const percentage =
              (store.revenue /
                Math.max(...mockData.stores.map((s) => s.revenue))) *
              100
            return (
              <div key={store.id} className="flex items-center space-x-4">
                <div className="w-32 text-gray-300 text-sm">{store.name}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-6 relative">
                  <div
                    className="bg-green-500 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {formatCurrency(store.revenue)}
                  </span>
                </div>
                <div className="text-gray-400 text-sm w-12 text-right">
                  {Math.round(percentage)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Productos con stock bajo */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          ⚠️ Alertas de Stock Bajo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockData.products
            .filter((p) => p.lowStock)
            .map((product) => (
              <div
                key={product.id}
                className="bg-red-900/20 border border-red-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-300">{product.name}</h4>
                    <p className="text-red-400 text-sm">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-300 font-bold">
                      {product.totalStock} unidades
                    </p>
                    <p className="text-red-500 text-sm">Stock crítico</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const StockTab = () => (
    <div className="space-y-6">
      {/* Stock total por producto */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className='flex justify-between items-center mb-4'>
          <h3 className="text-xl font-bold text-gray-100">
            Stock Total por Producto
          </h3>
          <AddProducts isOpen={isAddProductsOpen} setIsOpen={setIsAddProductsOpen} branches={branches} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Producto</th>
                <th className="text-right py-3 px-4 text-gray-300">Precio</th>
                <th className="text-right py-3 px-4 text-gray-300">
                  Stock Total
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4 text-gray-100 font-medium">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-100">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-100">
                    {product.stock[0]?.quantity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {/* <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.lowStock
                          ? 'bg-red-900/50 text-red-300 border border-red-700'
                          : 'bg-green-900/50 text-green-300 border border-green-700'
                      }`}
                    >
                      {product.lowStock ? 'Stock Bajo' : 'Normal'}
                    </span> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock por sucursal */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          Stock por Sucursal
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Sucursal</th>
                <th className="text-center py-3 px-4 text-gray-300">Tomate</th>
                <th className="text-center py-3 px-4 text-gray-300">Lechuga</th>
                <th className="text-center py-3 px-4 text-gray-300">
                  Zanahoria
                </th>
                <th className="text-center py-3 px-4 text-gray-300">Manzana</th>
                <th className="text-center py-3 px-4 text-gray-300">Banana</th>
                <th className="text-center py-3 px-4 text-gray-300">Palta</th>
                <th className="text-center py-3 px-4 text-gray-300">Cebolla</th>
                <th className="text-center py-3 px-4 text-gray-300">Papa</th>
              </tr>
            </thead>
            <tbody>
              {mockData.stockByStore.map((store, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4 text-gray-100 font-medium">
                    {store.storeName}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-100">
                    {store.tomate}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-100">
                    {store.lechuga}
                  </td>
                  <td
                    className={`py-3 px-4 text-center ${
                      store.zanahoria <= 5 ? 'text-red-400' : 'text-gray-100'
                    }`}
                  >
                    {store.zanahoria}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-100">
                    {store.manzana}
                  </td>
                  <td
                    className={`py-3 px-4 text-center ${
                      store.banana <= 10 ? 'text-red-400' : 'text-gray-100'
                    }`}
                  >
                    {store.banana}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-100">
                    {store.palta}
                  </td>
                  <td
                    className={`py-3 px-4 text-center ${
                      store.cebolla <= 2 ? 'text-red-400' : 'text-gray-100'
                    }`}
                  >
                    {store.cebolla}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-100">
                    {store.papa}
                  </td>
                </tr>
              ))}
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

  const EmployeesTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          Gestión de Empleados
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300">Empleado</th>
                <th className="text-left py-3 px-4 text-gray-300">Sucursal</th>
                <th className="text-left py-3 px-4 text-gray-300">Posición</th>
                <th className="text-right py-3 px-4 text-gray-300">Ventas</th>
                <th className="text-center py-3 px-4 text-gray-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockData.employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4 text-gray-100 font-medium">
                    {employee.name}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{employee.store}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {employee.position}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    {formatCurrency(employee.sales)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.status === 'active'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                      }`}
                    >
                      {employee.status === 'active' ? 'Activo' : 'Licencia'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            { id: 'employees', label: '👥 Empleados', icon: '👥' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as 'overview' | 'stock' | 'stores' | 'employees'
                )
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
          {activeTab === 'employees' && <EmployeesTab />}
        </div>
      </div>
    </div>
  )
}

export default AdminInterface
