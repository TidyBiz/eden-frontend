'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Download,
  MessageSquare,
} from 'lucide-react'
import { useEdenMarketBackend, type LowStockAlert } from '@/contexts/backend'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function MarketListTab() {
  const { fetchStockAnalytics } = useEdenMarketBackend()
  const [loading, setLoading] = useState(true)
  const [marketItems, setMarketItems] = useState<
    {
      productId: string
      name: string
      plu: number
      totalNeeded: number
      unit: string
      details: { branch: string; current: number; threshold: number }[]
    }[]
  >([])

  const loadMarketList = async () => {
    setLoading(true)
    const analytics = await fetchStockAnalytics(10) // Umbral por defecto 10

    // Agrupar por producto
    const grouped = analytics.lowStockAlerts.reduce(
      (acc: any, alert: LowStockAlert) => {
        const pid = alert.product.id
        if (!acc[pid]) {
          acc[pid] = {
            productId: pid,
            name: alert.product.name,
            plu: alert.product.PLU,
            totalNeeded: 0,
            unit: alert.product.isSoldByWeight ? 'kg' : 'unid.',
            details: [],
          }
        }

        const neededInThisBranch = Math.max(
          0,
          alert.threshold * 2 - alert.currentStock
        ) // Sugerimos comprar el doble del umbral para tener backstock
        acc[pid].totalNeeded += neededInThisBranch
        acc[pid].details.push({
          branch: alert.branch.name,
          current: alert.currentStock,
          threshold: alert.threshold,
        })

        return acc
      },
      {}
    )

    setMarketItems(Object.values(grouped))
    setLoading(false)
  }

  useEffect(() => {
    loadMarketList()
  }, [])

  const downloadMarketListPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Logo dibujado con vectores internos de jsPDF para máxima compatibilidad y nitidez
    const drawLogo = (doc: jsPDF, x: number, y: number) => {
      const lime = [175, 205, 92] // #AFCD5C
      const green = [89, 140, 48] // #598C30

      // Dibujo simplificado de hoja/planta inspirado en el logo
      doc.setFillColor(lime[0], lime[1], lime[2])
      doc.ellipse(x + 5, y + 10, 4, 8, 'F')

      doc.setFillColor(green[0], green[1], green[2])
      doc.ellipse(x + 12, y + 8, 5, 10, 'F')

      doc.setFillColor(lime[0], lime[1], lime[2])
      doc.ellipse(x + 19, y + 12, 4, 7, 'F')

      // Texto del Logo
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('EDEN', x + 28, y + 12)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(lime[0], lime[1], lime[2])
      doc.text('MARKET', x + 28, y + 18)
    }

    // Cabecera Premium
    doc.setFillColor(39, 60, 31) // Verde Oscuro
    doc.rect(0, 0, pageWidth, 40, 'F')

    // Dibujar Logo Nativamente
    drawLogo(doc, 15, 8)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('MARKET LIST', 65, 25)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`GENERADO EL ${new Date().toLocaleDateString()}`, 65, 32)

    const tableData = marketItems.map((item) => [
      {
        content: item.plu,
        styles: { halign: 'center', fontStyle: 'bold' } as any,
      },
      item.name.toUpperCase(),
      {
        content: `${item.totalNeeded.toFixed(2)} ${item.unit.toUpperCase()}`,
        styles: { halign: 'right', fontStyle: 'bold' } as any,
      },
      '[   ]',
    ])

    autoTable(doc, {
      startY: 50,
      head: [['PLU', 'PRODUCTO / VARIEDAD', 'CANTIDAD SUGERIDA', 'OK']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [89, 140, 48],
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 11,
        textColor: [39, 60, 31],
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 50 },
        3: { cellWidth: 20, halign: 'center' },
      },
    })

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      'Lista consolidada para reposición de stock óptimo - Eden Market',
      pageWidth / 2,
      285,
      { align: 'center' }
    )

    doc.save(`LISTA_MERCADO_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Summary Card */}
      <div className="bg-surface-highlight rounded-lg p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-heading mb-2 flex items-center gap-4">
            <ShoppingCart className="w-10 h-10 text-heading" />
            Market List
          </h2>
          <p className="text-heading font-black text-lg max-w-md">
            Consolidado de todas las sucursales para tu próxima compra
            mayorista.
          </p>
        </div>

        <button
          onClick={downloadMarketListPDF}
          disabled={marketItems.length === 0}
          className="relative text-text-option z-10 bg-white px-10 py-5 rounded-lg gap-2 cursor-pointer font-black flex items-center hover:bg-black/10 transition-all shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white text-heading"
        >
          <Download className="w-6 h-6" />
          <p>DESCARGAR LISTA</p>
        </button>

        {/* Decorative Circles */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        {/* Main List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-3xl font-black text-heading flex items-center gap-2 px-2">
            Productos a Reponer
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white animate-pulse rounded-3xl border-2 border-surface-accent"
                />
              ))}
            </div>
          ) : marketItems.length > 0 ? (
            <div className="grid gap-4">
              {marketItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-3xl p-6 border-2 border-surface-accent hover:border-accent-strong transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-surface-secondary rounded-2xl flex items-center justify-center text-2xl group-hover:bg-surface-accent transition-colors font-black text-accent-strong">
                      {item.plu}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-heading uppercase">
                        {item.name}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        {item.details.map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-surface-secondary text-accent-strong px-2 py-1 rounded-full font-bold"
                          >
                            {d.branch}: {d.current}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">
                      COMPRAR
                    </div>
                    <div className="text-3xl font-black text-action-primary">
                      {item.totalNeeded.toFixed(1)}{' '}
                      <span className="text-lg opacity-60 font-bold">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-25 px-20 bg-ui-empty-bg-subtle rounded-lg">
              <h4 className="text-2xl font-black text-ui-empty-text">
                ¡Stock al día!
              </h4>
              <p className="text-ui-empty-text-muted font-medium text-lg mt-2">
                No se detectaron productos por debajo del umbral mínimo.
              </p>
            </div>
          )}
        </div>

        {/* Tips & Info */}
        <div className="space-y-6 col-span-2">
          <div className="text-heading pb-8">
            <h4 className="text-accent-strong font-black text-3xl mb-4">
              ¿Cómo funciona?
            </h4>
            <ul className="space-y-4 text-lg text-accent-strong font-medium">
              <li className="flex gap-3">
                <div className="flex items-start justify-center shrink-0 text-lg font-black">
                  • 1 -
                </div>
                Escaneamos todas tus verdulerías buscando productos con stock
                bajo.
              </li>
              <li className="flex gap-3">
                <div className="flex items-start justify-center shrink-0 text-lg font-black">
                  • 2 -
                </div>
                Calculamos cuánto falta para llegar a un nivel óptimo de
                reserva.
              </li>
              <li className="flex gap-3">
                <div className="flex items-start justify-center shrink-0 text-lg font-black">
                  • 3 -
                </div>
                Te damos una lista consolidada para que compres todo de una vez
                en el mercado.
              </li>
            </ul>
          </div>

          <div className="text-heading">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6" />
              <h4 className="font-black text-3xl">Consejo Pro</h4>
            </div>
            <p className="text-lg font-medium">
              Las cantidades sugeridas incluyen un stock de reserva del 100%
              sobre el umbral mínimo para evitar quiebres de stock repentinos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
