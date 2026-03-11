'use client'

// ** React
import type React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'

// ** Components
import AddStockModal from '../modals/add-stock'
import EditProductModal from '../modals/edit-product'
import LogisticsTab from './sections/LogisticsTab'
import MarketListTab from './sections/MarketListTab'
import StockTab from './sections/StockTab'

// ** Contexts
import {
  useEdenMarketBackend,
  type BranchAnalytics,
  type StockAnalytics,
  type StockByBranch,
  type CashPerBranch,
} from '@/contexts/backend'
import {
  useAdminNotifications,
  type MoneyExtractionNotification,
} from '@/hooks/useAdminNotifications'

// ** Types & Utils
import {
  BRANCH_COLORS,
  type BranchColor,
  type Product,
} from '@/utils/constants/common'

import market from '../../../public/market.svg'
import Image from 'next/image'

interface AdminInterfaceProps {
  className?: string
}

////////////////////////////////////////////////////////////////////////////
const AdminInterface: React.FC<AdminInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'stock' | 'stores' | 'logistics' | 'market-list'
  >('overview')
  const [displayedTab, setDisplayedTab] = useState<
    'overview' | 'stock' | 'stores' | 'logistics' | 'market-list'
  >('overview')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
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
  const [cashPerBranch, setCashPerBranch] = useState<CashPerBranch[]>([])
  const [recentExtractions, setRecentExtractions] = useState<
    MoneyExtractionNotification[]
  >([])

  const refreshCashData = useCallback(async () => {
    const { fetchBranchAnalytics, fetchCashPerBranch } = functionsRef.current
    try {
      await Promise.all([
        fetchBranchAnalytics().then(setBranchAnalytics),
        fetchCashPerBranch().then(setCashPerBranch),
      ])
    } catch (error) {
      console.error('Error refreshing cash data:', error)
    }
  }, [])

  const handleNewExtraction = useCallback(
    (extraction: MoneyExtractionNotification) => {
      setRecentExtractions((prev) => [extraction, ...prev].slice(0, 20))
      refreshCashData()
    },
    [refreshCashData]
  )

  useAdminNotifications({
    onExtraction: handleNewExtraction,
    onCashRegisterClose: refreshCashData,
  })

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
    fetchCashPerBranch,
  } = useEdenMarketBackend()

  const functionsRef = useRef({
    fetchProducts,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    fetchTotalRevenue,
    fetchTransactions,
    fetchCashPerBranch,
  })

  functionsRef.current = {
    fetchProducts,
    fetchBranches,
    fetchBranchAnalytics,
    fetchStockAnalytics,
    fetchStockByBranch,
    fetchTotalRevenue,
    fetchTransactions,
    fetchCashPerBranch,
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
          fetchCashPerBranch,
        } = functionsRef.current
        await Promise.all([
          fetchProducts(),
          fetchBranches(),
          fetchBranchAnalytics().then(setBranchAnalytics),
          fetchStockAnalytics(20).then(setStockAnalytics),
          fetchTransactions(),
          fetchTotalRevenue(),
          fetchCashPerBranch().then(setCashPerBranch),
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
    setDisplayedTab(activeTab)
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
    isLoading = false,
  }: {
    title: string
    value: string | number
    subtitle?: string
    color?: string
    isLoading?: boolean
  }) => (
    <div
      className={`bg-[#C1E3A4] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg hover:border-[#0aa65d] transition-all duration-300 hover:shadow-xl hover:shadow-[#0aa65d]/20 hover:scale-[1.02]`}
    >
      <h3 className="text-[#598C30] text-sm font-semibold mb-3 tracking-wide uppercase">
        {title}
      </h3>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-[#C1E3A4] rounded-lg w-24 mb-2"></div>
          <div className="h-3 bg-[#C1E3A4] rounded-lg w-16"></div>
        </div>
      ) : (
        <>
          <p className={`text-4xl font-bold text-[#273C1F] mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-[#598C30] text-xs font-medium">{subtitle}</p>
          )}
        </>
      )}
    </div>
    // </CHANGE>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
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

      <div className="bg-[#F4F1EA] rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          Extracciones en Tiempo Real
        </h3>
        {recentExtractions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentExtractions.map((extraction, index) => {
              const date = new Date(extraction.createdAt)
              const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              const formattedTime = date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 hover:border-[#598C30] transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💰</span>
                        <span className="font-bold text-lg text-[#273C1F]">
                          {extraction.branchName}
                        </span>
                      </div>
                      <div className="text-sm text-[#598C30] mb-1">
                        <span className="font-semibold">Cashier:</span>{' '}
                        <span className="text-[#273C1F]">
                          {extraction.cashierName}
                        </span>
                      </div>
                      {extraction.comment && (
                        <div className="text-sm text-[#598C30] mb-2">
                          <span className="font-semibold">Motivo:</span>{' '}
                          <span className="text-[#273C1F]">
                            {extraction.comment}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600 mb-1">
                        -${extraction.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>{formattedDate}</div>
                        <div>{formattedTime}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#C1E3A480] text-center py-12 bg-[#C1E3A4]/30 rounded-xl">
            <p className="font-semibold text-[#598C30] text-3xl">
              No hay extracciones registradas
            </p>
            <p className="text-sm mt-2 text-[#598C30]">
              Las extracciones aparecerán aquí en tiempo real
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#598C30] rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          Dinero en Caja por Sucursal
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-32 h-4 bg-[#C1E3A4] rounded-lg"></div>
                <div className="flex-1 h-6 bg-[#C1E3A4] rounded-lg"></div>
                <div className="w-24 h-4 bg-[#C1E3A4] rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : Array.isArray(cashPerBranch) && cashPerBranch.length > 0 ? (
          <div className="space-y-4">
            {cashPerBranch.map((branch) => {
              const branchCash = Number(branch.totalCash) || 0
              const totalCash = cashPerBranch.reduce(
                (sum, b) => sum + (Number(b.totalCash) || 0),
                0
              )
              const percentage =
                totalCash > 0 ? (branchCash / totalCash) * 100 : 0
              return (
                <div
                  key={branch.branchId}
                  className="flex items-center space-x-4 group"
                >
                  <div className="max-w-1/3 text-white text-lg truncate font-semibold">
                    {branch.branchName || 'Sucursal'}
                  </div>
                  <div className="flex-1 bg-[#8cb869] rounded-full h-8 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-[#273C1F] h-8 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold drop-shadow-md">
                      {formatCurrency(branchCash)}
                    </span>
                  </div>
                  <div className="text-white text-lg w-24 text-right font-bold">
                    {Math.round(percentage)}%
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">💰</div>
            <p className="font-semibold text-[#273C1F]">
              No hay dinero en caja disponible
            </p>
            <p className="text-sm mt-2">
              El dinero aparecerá aquí cuando se abran sesiones de caja
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#F4F1EA] rounded-2xl p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          Facturación por Sucursal
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-32 h-4 bg-[#C1E3A4] rounded-lg"></div>
                <div className="flex-1 h-6 bg-[#C1E3A4] rounded-lg"></div>
                <div className="w-12 h-4 bg-[#C1E3A4] rounded-lg"></div>
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
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-32 text-[#273C1F] text-sm truncate font-semibold">
                    {branch.branchName || 'Sucursal'}
                  </div>
                  <div className="flex-1 bg-[#C1E3A4] rounded-full h-8 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#0aa65d] to-[#598C30] h-8 rounded-full transition-all duration-500 group-hover:from-[#598C30] group-hover:to-[#4E7526]"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow-md">
                      {formatCurrency(branchRevenue)}
                    </span>
                  </div>
                  <div className="text-[#598C30] text-sm w-12 text-right font-bold">
                    {Math.round(percentage)}%
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl">
            <p className="font-semibold text-[#598C30] text-3xl">
              No hay datos de facturación disponibles
            </p>
            <p className="text-sm mt-2 text-[#598C30]">
              Las ventas aparecerán aquí una vez que se registren transacciones
            </p>
          </div>
        )}
      </div>
      {/* </CHANGE> */}

      <div className={`${stockAnalytics.lowStockAlerts.length > 0 ? 'bg-[#FF0D0D] text-white' : 'bg-[#F4F1EA] text-[#273C1F]'} rounded-lg p-6`}>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          Alertas de Stock Bajo
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#F4F1EA66] rounded-lg p-4 h-24"></div>
            ))}
          </div>
        ) : Array.isArray(stockAnalytics.lowStockAlerts) &&
          stockAnalytics.lowStockAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAnalytics.lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#F4F1EA66] rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#B0855F]/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {alert.product?.name || 'Producto'}
                    </h4>
                    <p className="text-sm mt-1 font-medium">
                      PLU: {alert.product?.PLU || 'N/A'}
                    </p>
                    <p className="text-sm font-medium">
                      Sucursal: {alert.branch?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {Number(alert.currentStock) || 0}{' '}
                      {alert.product?.isSoldByWeight ? 'kg' : 'u.'}
                    </p>
                    <p className="text-sm font-medium">
                      Umbral: {Number(alert.threshold) || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl">
            <p className="font-semibold text-[#598C30] text-3xl">
              No hay productos con stock bajo
            </p>
            <p className="text-sm mt-2 text-[#598C30]">
              Todos los productos tienen stock suficiente
            </p>
          </div>
        )}
      </div>
      {/* </CHANGE> */}
    </div>
  )

  const StoresTab = () => (
    <div className="space-y-6">
      <div className="bg-[#F4F1EA] rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          Gestión de Sucursales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((store, i) => (
            <div
              key={store.id}
              className="bg-[#C1E3A4] rounded-xl p-5 hover:border-[#0aa65d] transition-all duration-300 hover:shadow-lg hover:shadow-[#0aa65d]/20"
            >
              <div className="flex flex-col justify-between gap-4">
                <h4 className="font-bold text-[#598C30] text-lg">
                  Sucursal #{i + 1}
                </h4>
                <p className="text-[#598C30] text-sm">
                  {store.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* </CHANGE> */}
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <div className="mb-8 bg-[#F4F1EA] rounded-2xl p-6 shadow-lg">
            <div className="text-4xl font-bold text-[#273C1F] mb-2 flex items-center gap-3">
              <Image src={market} alt="Market" width={50} height={50} />
              <div className="ml-6 flex flex-col">
                <h1 className="text-3xl">Panel de Administración - Eden Verdulerías</h1>
                <p className="text-[#598C30] text-lg font-medium">
                  Gestión completa de la cadena de verdulerías en tiempo real
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-8 bg-[#273C1F] rounded-2xl p-1.5 shadow-lg">
            {[
              { id: 'overview', label: 'RESUMEN', icon: '📊' },
              { id: 'stock', label: 'STOCK', icon: '📦' },
              { id: 'market-list', label: 'MARKET LIST', icon: '🛒' },
              { id: 'logistics', label: 'LOGÍSTICA', icon: '🚚' },
              { id: 'stores', label: 'SUCURSALES', icon: '🏪' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id !== activeTab && !isTransitioning) {
                    setIsTransitioning(true)
                    setActiveTab(
                      tab.id as
                        | 'overview'
                        | 'stock'
                        | 'stores'
                        | 'logistics'
                        | 'market-list'
                    )
                    setTimeout(() => {
                      setDisplayedTab(
                        tab.id as
                          | 'overview'
                          | 'stock'
                          | 'stores'
                          | 'logistics'
                          | 'market-list'
                      )
                      setIsTransitioning(false)
                    }, 200)
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#F4F1EA] text-[#273C1F] shadow-lg shadow-[#0aa65d]/30 scale-[1.02]'
                    : 'text-[#A2D45E] hover:text-[#273C1F] hover:bg-[#C1E3A4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-96 relative overflow-hidden">
            <div
              key={displayedTab}
              className={
                isTransitioning ? 'animate-tab-exit' : 'animate-tab-enter'
              }
            >
              {displayedTab === 'overview' && <OverviewTab />}
              {displayedTab === 'stock' && (
                <StockTab
                  products={products}
                  branches={branches}
                  stockAnalytics={stockAnalytics}
                  stockByBranch={stockByBranch}
                  selectedBranchId={selectedBranchId}
                  setSelectedBranchId={setSelectedBranchId}
                  isAddProductsOpen={isAddProductsOpen}
                  setIsAddProductsOpen={setIsAddProductsOpen}
                  onProductCreated={handleProductCreated}
                  onEditProduct={(product) => {
                    setSelectedProduct(product)
                    setIsEditProductOpen(true)
                  }}
                  onAddStock={(product) => {
                    setSelectedProduct(product)
                    setIsAddStockOpen(true)
                  }}
                  formatCurrency={formatCurrency}
                  formatStock={formatStock}
                  getBranchColor={getBranchColor}
                />
              )}
              {displayedTab === 'market-list' && <MarketListTab />}
              {displayedTab === 'logistics' && <LogisticsTab />}
              {displayedTab === 'stores' && <StoresTab />}
            </div>
          </div>
        </div>
      </div>

      <AddStockModal
        isOpen={isAddStockOpen}
        setIsOpen={setIsAddStockOpen}
        product={selectedProduct}
        onStockAdded={handleProductCreated}
      />
      <EditProductModal
        isOpen={isEditProductOpen}
        setIsOpen={setIsEditProductOpen}
        product={selectedProduct}
        onProductUpdated={handleProductCreated}
      />
    </div>
    // </CHANGE>
  )
}

export default AdminInterface
