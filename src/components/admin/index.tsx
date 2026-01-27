"use client"

// ** React
import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"

// ** Components
import AddProducts from "../modals/add-products"
import AddStockModal from "../modals/add-stock"
import EditProductModal from "../modals/edit-product"
import LogisticsTab from "./sections/LogisticsTab"
import MarketListTab from "./sections/MarketListTab"

// ** Contexts
import { useEdenMarketBackend, type BranchAnalytics, type StockAnalytics, type StockByBranch, type CashPerBranch } from "@/contexts/backend"
import { useAdminNotifications, type MoneyExtractionNotification } from "@/hooks/useAdminNotifications"

// ** Types & Utils
import { BRANCH_COLORS, type BranchColor, type Product } from "@/utils/constants/common"

interface AdminInterfaceProps {
  className?: string
}

const AdminInterface: React.FC<AdminInterfaceProps> = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "stock" | "stores" | "logistics" | "market-list">("overview")
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [cashPerBranch, setCashPerBranch] = useState<CashPerBranch[]>([])
  const [recentExtractions, setRecentExtractions] = useState<MoneyExtractionNotification[]>([])

  // Función para refrescar datos de caja
  const refreshCashData = useCallback(async () => {
    const { fetchBranchAnalytics, fetchCashPerBranch } = functionsRef.current;
    try {
      await Promise.all([
        fetchBranchAnalytics().then(setBranchAnalytics),
        fetchCashPerBranch().then(setCashPerBranch),
      ]);
    } catch (error) {
      console.error('Error refreshing cash data:', error);
    }
  }, []);

  // Función para manejar nuevas extracciones
  const handleNewExtraction = useCallback((extraction: MoneyExtractionNotification) => {
    // Agregar la nueva extracción al inicio del array
    setRecentExtractions((prev) => [extraction, ...prev].slice(0, 20)); // Mantener solo las últimas 20
    // Refrescar datos de caja
    refreshCashData();
  }, [refreshCashData]);

  // Conectar a WebSocket para recibir notificaciones de extracciones y cierres de caja
  useAdminNotifications({
    onExtraction: handleNewExtraction,
    onCashRegisterClose: refreshCashData,
  });

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

  // Usar refs para evitar dependencias infinitas
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

  // Actualizar las referencias cuando cambien las funciones
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
        console.error("Error loading initial data:", error)
      } finally {
        setIsLoadingAnalytics(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    const loadTabData = async () => {
      const { fetchBranchAnalytics, fetchStockAnalytics, fetchProducts, fetchStockByBranch } = functionsRef.current

      if (activeTab === "overview") {
        try {
          const [branchData, stockData] = await Promise.all([fetchBranchAnalytics(), fetchStockAnalytics(20)])
          setBranchAnalytics(branchData)
          setStockAnalytics(stockData)
        } catch (error) {
          console.error("Error loading analytics data:", error)
        }
      } else if (activeTab === "stock") {
        try {
          await Promise.all([
            fetchProducts(),
            fetchStockAnalytics(20).then(setStockAnalytics),
            fetchStockByBranch(selectedBranchId || undefined).then(setStockByBranch),
          ])
        } catch (error) {
          console.error("Error loading stock data:", error)
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
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
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
      className={`bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] hover:border-[#0aa65d] transition-all duration-300 hover:shadow-xl hover:shadow-[#0aa65d]/20 hover:scale-[1.02]`}
    >
      <h3 className="text-[#598C30] text-sm font-semibold mb-3 tracking-wide uppercase">{title}</h3>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-[#C1E3A4] rounded-lg w-24 mb-2"></div>
          <div className="h-3 bg-[#C1E3A4] rounded-lg w-16"></div>
        </div>
      ) : (
        <>
          <p className={`text-4xl font-bold text-[#273C1F] mb-1`}>{value}</p>
          {subtitle && <p className="text-[#598C30] text-xs font-medium">{subtitle}</p>}
        </>
      )}
    </div>
    // </CHANGE>
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

      {/* Extracciones en Tiempo Real */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">💰</span>
          Extracciones en Tiempo Real
        </h3>
        {recentExtractions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentExtractions.map((extraction, index) => {
              const date = new Date(extraction.createdAt);
              const formattedDate = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-[#C1E3A4] hover:border-[#598C30] transition-all duration-200 hover:shadow-md"
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
                        <span className="text-[#273C1F]">{extraction.cashierName}</span>
                      </div>
                      {extraction.comment && (
                        <div className="text-sm text-[#598C30] mb-2">
                          <span className="font-semibold">Motivo:</span>{' '}
                          <span className="text-[#273C1F]">{extraction.comment}</span>
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
              );
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">💰</div>
            <p className="font-semibold text-[#273C1F]">No hay extracciones registradas</p>
            <p className="text-sm mt-2">Las extracciones aparecerán aquí en tiempo real</p>
          </div>
        )}
      </div>

      {/* Dinero en Caja por Sucursal */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">💰</span>
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
              const totalCash = cashPerBranch.reduce((sum, b) => sum + (Number(b.totalCash) || 0), 0)
              const percentage = totalCash > 0 ? (branchCash / totalCash) * 100 : 0
              return (
                <div key={branch.branchId} className="flex items-center space-x-4 group">
                  <div className="w-32 text-[#273C1F] text-sm truncate font-semibold">
                    {branch.branchName || "Sucursal"}
                  </div>
                  <div className="flex-1 bg-[#C1E3A4] rounded-full h-8 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#0aa65d] to-[#598C30] h-8 rounded-full transition-all duration-500 group-hover:from-[#598C30] group-hover:to-[#4E7526]"
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow-md">
                      {formatCurrency(branchCash)}
                    </span>
                  </div>
                  <div className="text-[#598C30] text-sm w-24 text-right font-bold">{Math.round(percentage)}%</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">💰</div>
            <p className="font-semibold text-[#273C1F]">No hay dinero en caja disponible</p>
            <p className="text-sm mt-2">El dinero aparecerá aquí cuando se abran sesiones de caja</p>
          </div>
        )}
      </div>

      {/* Gráfico de barras de facturación por sucursal */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">📊</span>
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
        ) : Array.isArray(branchAnalytics.revenuePerBranch) && branchAnalytics.revenuePerBranch.length > 0 ? (
          <div className="space-y-4">
            {branchAnalytics.revenuePerBranch.map((branch) => {
              const globalRevenue = Number(totalRevenue) || 0
              const branchRevenue = Number(branch.totalRevenue) || 0
              const percentage = globalRevenue > 0 ? (branchRevenue / globalRevenue) * 100 : 0
              return (
                <div key={branch.branchId} className="flex items-center space-x-4 group">
                  <div className="w-32 text-[#273C1F] text-sm truncate font-semibold">
                    {branch.branchName || "Sucursal"}
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
                  <div className="text-[#598C30] text-sm w-12 text-right font-bold">{Math.round(percentage)}%</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">📈</div>
            <p className="font-semibold text-[#273C1F]">No hay datos de facturación disponibles</p>
            <p className="text-sm mt-2">Las ventas aparecerán aquí una vez que se registren transacciones</p>
          </div>
        )}
      </div>
      {/* </CHANGE> */}

      {/* Productos con stock bajo */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          Alertas de Stock Bajo
        </h3>
        {isLoadingAnalytics ? (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#C1E3A4] rounded-xl p-4 h-24"></div>
            ))}
          </div>
        ) : Array.isArray(stockAnalytics.lowStockAlerts) && stockAnalytics.lowStockAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockAnalytics.lowStockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#B0855F]/10 border-2 border-[#B0855F] rounded-xl p-4 hover:bg-[#B0855F]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#B0855F]/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#6A442C]">{alert.product?.name || "Producto"}</h4>
                    <p className="text-[#B0855F] text-sm mt-1 font-medium">PLU: {alert.product?.PLU || "N/A"}</p>
                    <p className="text-[#B0855F] text-sm font-medium">Sucursal: {alert.branch?.name || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6A442C] font-bold text-lg">
                      {Number(alert.currentStock) || 0} {alert.product?.isSoldByWeight ? "kg" : "u."}
                    </p>
                    <p className="text-[#B0855F] text-sm font-medium">Umbral: {Number(alert.threshold) || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-semibold text-[#273C1F]">¡Excelente! No hay productos con stock bajo</p>
            <p className="text-sm mt-2">Todos los productos tienen stock suficiente</p>
          </div>
        )}
      </div>
      {/* </CHANGE> */}
    </div>
  )

  const StockTab = () => (
    <div className="space-y-6">
      {/* Stock total por producto */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#273C1F] flex items-center gap-3">
            <span className="text-3xl">📦</span>
            Stock Total por Producto
          </h3>
          <AddProducts
            isOpen={isAddProductsOpen}
            setIsOpen={setIsAddProductsOpen}
            branches={branches}
            onProductCreated={handleProductCreated}
          />
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#598C30] bg-[#C1E3A4]/50">
                <th className="text-left py-4 px-4 text-[#273C1F] font-bold">Producto</th>
                <th className="text-center py-4 px-4 text-[#273C1F] font-bold">PLU</th>
                <th className="text-right py-4 px-4 text-[#273C1F] font-bold">Precio</th>
                <th className="text-right py-4 px-4 text-[#273C1F] font-bold">Stock Total</th>
                <th className="text-center py-4 px-4 text-[#273C1F] font-bold">Estado</th>
                <th className="text-center py-4 px-4 text-[#273C1F] font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => {
                  const totalStock = product.stock.reduce((sum, stock) => sum + stock.quantity, 0)
                  const isLowStock = stockAnalytics.lowStockAlerts.some((alert) => alert.product.id === product.id)

                  return (
                    <tr key={product.id} className="border-b border-[#C1E3A4] hover:bg-[#C1E3A4]/30 transition-colors">
                      <td className="py-4 px-4 text-[#273C1F] font-semibold">{product.name}</td>
                      <td className="py-4 px-4 text-center text-[#598C30] font-medium">{product.PLU}</td>
                      <td className="py-4 px-4 text-right text-[#273C1F] font-semibold">
                        {formatCurrency(product.price)}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isLowStock ? "text-[#B0855F]" : "text-[#0aa65d]"}`}
                      >
                        {formatStock(totalStock)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${isLowStock
                            ? "bg-[#B0855F]/20 text-[#6A442C] border-2 border-[#B0855F]"
                            : "bg-[#0aa65d]/20 text-[#273C1F] border-2 border-[#0aa65d]"
                            }`}
                        >
                          {isLowStock ? "Stock Bajo" : "Normal"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditProductOpen(true)
                            }}
                            className="p-2 bg-[#F4F1EA] text-[#598C30] rounded-lg border-2 border-[#598C30] hover:bg-[#598C30] hover:text-white transition-all duration-200 cursor-pointer"
                            title="Editar Producto"
                          >
                            ⚙️
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsAddStockOpen(true)
                            }}
                            className="px-4 py-2 bg-[#598C30] text-white text-xs font-bold rounded-lg hover:bg-[#4E7526] transition-all duration-200 cursor-pointer border-2 border-[#273C1F] hover:shadow-lg hover:shadow-[#598C30]/30"
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
                  <td colSpan={5} className="py-12 text-center text-[#598C30]">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-semibold text-[#273C1F]">No hay productos registrados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* </CHANGE> */}

      {/* Alertas de Stock Bajo - Versión detallada */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          Stock Bajo por Sucursal
        </h3>
        {Array.isArray(stockAnalytics.lowStockAlerts) && stockAnalytics.lowStockAlerts.length > 0 ? (
          <div className="space-y-4">
            {stockAnalytics.lowStockAlerts.map((alert) => {
              const currentStock = Number(alert.currentStock) || 0
              const threshold = Number(alert.threshold) || 0
              const productPrice = Number(alert.product?.price) || 0
              const isWeightable = alert.product?.isSoldByWeight || false
              const unit = isWeightable ? "kg" : "unidades"

              return (
                <div
                  key={alert.id}
                  className="bg-[#B0855F]/10 border-2 border-[#B0855F] rounded-xl p-5 hover:bg-[#B0855F]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#B0855F]/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-[#6A442C] mb-2 text-lg">{alert.product?.name || "Producto"}</h4>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-[#B0855F] font-medium">
                        <span className="font-bold">PLU: {alert.product?.PLU || "N/A"}</span>
                        <span>Precio: {formatCurrency(productPrice)}</span>
                        <span className="font-bold">
                          Stock actual: {formatStock(currentStock)} {unit}
                        </span>
                        <span>
                          Umbral: {threshold} {unit}
                        </span>
                        <span className="text-[#598C30] font-bold">📍 {alert.branch?.name || "Sucursal"}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-[#6A442C] font-bold text-2xl">
                        {formatStock(currentStock)} {unit}
                      </p>
                      <p className="text-[#B0855F] text-sm font-bold mt-1">
                        {currentStock <= threshold / 2 ? "🚨 Crítico" : "⚠️ Bajo"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-[#598C30] text-center py-12 bg-[#C1E3A4]/30 rounded-xl border-2 border-[#C1E3A4]">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-semibold text-[#273C1F]">¡Perfecto! No hay alertas de stock bajo</p>
            <p className="text-sm mt-2">Todos los productos mantienen niveles de stock saludables por sucursal</p>
          </div>
        )}
      </div>
      {/* </CHANGE> */}

      {/* Stock por Sucursal - Nueva sección */}
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#273C1F] flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Stock por Sucursal
          </h3>
          <div className="flex items-center space-x-4">
            <label className="text-[#598C30] text-sm font-semibold">Filtrar por sucursal:</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-white text-[#273C1F] border-2 border-[#598C30] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0aa65d] focus:border-[#0aa65d] transition-all font-medium"
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

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#598C30] bg-[#C1E3A4]/50">
                <th className="text-left py-4 px-4 text-[#273C1F] font-bold">Sucursal</th>
                <th className="text-left py-4 px-4 text-[#273C1F] font-bold">Producto</th>
                <th className="text-center py-4 px-4 text-[#273C1F] font-bold">PLU</th>
                <th className="text-right py-4 px-4 text-[#273C1F] font-bold">Precio</th>
                <th className="text-right py-4 px-4 text-[#273C1F] font-bold">Stock</th>
                <th className="text-center py-4 px-4 text-[#273C1F] font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stockByBranch.length > 0 ? (
                stockByBranch.map((stock) => {
                  const isWeightable = stock.product?.isSoldByWeight || false
                  const unit = isWeightable ? "kg." : "u."
                  const isLowStock = stock.isLowStock

                  return (
                    <tr
                      key={stock.id}
                      className={`border-b border-[#C1E3A4] hover:bg-[#C1E3A4]/30 transition-colors ${isLowStock ? "bg-[#B0855F]/10" : ""
                        }`}
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-bold ${getBranchColor(stock.branch?.id || "").textColor
                            } ${getBranchColor(stock.branch?.id || "").bgColor}`}
                        >
                          {stock.branch?.name || "Sucursal"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#273C1F] font-semibold">{stock.product?.name || "Producto"}</td>
                      <td className="py-4 px-4 text-center text-[#598C30] font-medium">
                        {stock.product?.PLU || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-right text-[#273C1F] font-semibold">
                        {formatCurrency(stock.product?.price || 0)}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-bold ${isLowStock ? "text-[#B0855F]" : "text-[#0aa65d]"}`}
                      >
                        {formatStock(stock.quantity)} {unit}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${isLowStock
                            ? "bg-[#B0855F]/20 text-[#6A442C] border-2 border-[#B0855F]"
                            : "bg-[#0aa65d]/20 text-[#273C1F] border-2 border-[#0aa65d]"
                            }`}
                        >
                          {isLowStock ? "Stock Bajo" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#598C30]">
                    <div className="text-5xl mb-3">📦</div>
                    <p className="font-semibold text-[#273C1F]">
                      {selectedBranchId ? "No hay stock registrado para esta sucursal" : "No hay stock registrado"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* </CHANGE> */}
    </div>
  )

  const StoresTab = () => (
    <div className="space-y-6">
      <div className="bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#C1E3A4] shadow-lg">
        <h3 className="text-2xl font-bold text-[#273C1F] mb-6 flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          Gestión de Sucursales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl p-5 border-2 border-[#598C30] hover:border-[#0aa65d] transition-all duration-300 hover:shadow-lg hover:shadow-[#0aa65d]/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-[#273C1F] text-lg">{store.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* </CHANGE> */}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#C1E3A4] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-[#F4F1EA] rounded-2xl p-6 border-2 border-[#598C30] shadow-lg">
          <h1 className="text-4xl font-bold text-[#273C1F] mb-2 flex items-center gap-3">
            <span className="text-5xl">🏪</span>
            Panel de Administración - Eden Verdulerías
          </h1>
          <p className="text-[#598C30] text-lg font-medium">
            Gestión completa de la cadena de verdulerías en tiempo real
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-[#F4F1EA] rounded-2xl p-1.5 shadow-lg border-2 border-[#C1E3A4]">
          {[
            { id: "overview", label: "📊 Resumen", icon: "📊" },
            { id: "stock", label: "📦 Stock", icon: "📦" },
            { id: "market-list", label: "🛒 Market List", icon: "🛒" },
            { id: "logistics", label: "🚚 Logística", icon: "🚚" },
            { id: "stores", label: "🏪 Sucursales", icon: "🏪" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "stock" | "stores")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                ? "bg-[#0aa65d] text-white shadow-lg shadow-[#0aa65d]/30 scale-[1.02]"
                : "text-[#598C30] hover:text-[#273C1F] hover:bg-[#C1E3A4]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-96">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "stock" && <StockTab />}
          {activeTab === "market-list" && <MarketListTab />}
          {activeTab === "logistics" && <LogisticsTab />}
          {activeTab === "stores" && <StoresTab />}
        </div>
      </div>

      {/* Modals */}
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
