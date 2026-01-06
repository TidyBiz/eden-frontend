import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StockTransfer } from '@/contexts/backend'

// Logo dibujado con vectores internos de jsPDF para máxima compatibilidad y nitidez
const drawLogo = (doc: jsPDF, x: number, y: number, scale: number = 1) => {
    const lime = [175, 205, 92] // #AFCD5C
    const green = [89, 140, 48] // #598C30
    const darkGreen = [39, 60, 31] // #273C1F

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

export const generateRemitoPDF = (transfer: StockTransfer) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // --- Header Estético ---
    // Rectángulo lateral decorativo
    doc.setFillColor(89, 140, 48) // Verde Principal
    doc.rect(0, 0, 10, 297, 'F')

    // Franja superior
    doc.setFillColor(39, 60, 31) // Verde Oscuro
    doc.rect(10, 0, pageWidth - 10, 45, 'F')

    // Dibujar Logo
    drawLogo(doc, 20, 12)

    // Título y Subtítulo
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('REMITO DE CARGA', 95, 24)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(175, 205, 92) // Lima
    doc.text('SISTEMA DE LOGÍSTICA INTERNA', 95, 30)

    // Caja de Número de Remito (Destacada)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(pageWidth - 65, 12, 50, 22, 3, 3, 'F')

    doc.setTextColor(39, 60, 31)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('REMITO N°', pageWidth - 60, 19)
    doc.setFontSize(14)
    doc.text(transfer.remitoNumber.toUpperCase(), pageWidth - 60, 28)

    // --- Cuerpo del Documento ---
    // Divisor visual
    doc.setDrawColor(89, 140, 48)
    doc.setLineWidth(0.5)
    doc.line(20, 55, pageWidth - 15, 55)

    // Bloque de Información de Traslado
    doc.setFillColor(244, 241, 234) // Crema
    doc.roundedRect(20, 62, pageWidth - 35, 35, 4, 4, 'F')

    doc.setTextColor(39, 60, 31)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')

    // Columna 1
    doc.text('ORIGEN:', 30, 72)
    doc.text('DESTINO:', 30, 82)
    doc.text('EMITIDO POR:', 30, 91)

    doc.setFont('helvetica', 'normal')
    doc.text(transfer.originBranch.name.toUpperCase(), 60, 72)
    doc.text(transfer.destinationBranch.name.toUpperCase(), 60, 82)
    doc.text(transfer.createdBy.username.toUpperCase(), 60, 91)

    // Columna 2 (Fecha)
    doc.setFont('helvetica', 'bold')
    doc.text('FECHA:', 130, 72)
    doc.text('ESTADO:', 130, 82)

    doc.setFont('helvetica', 'normal')
    doc.text(new Date(transfer.createdAt).toLocaleString(), 150, 72)
    doc.text(transfer.status.toUpperCase(), 150, 82)

    // Tabla de Productos
    const tableData = transfer.items.map(item => [
        { content: item.product?.PLU || 'N/A', styles: { halign: 'center', fontStyle: 'bold' } as any },
        item.product?.name.toUpperCase() || 'PRODUCTO DESCONOCIDO',
        { content: item.quantity.toFixed(2), styles: { halign: 'center', fontStyle: 'bold' } as any },
        { content: item.product?.isSoldByWeight ? 'KG' : 'UNID.', styles: { halign: 'center' } as any },
        item.note || '-'
    ])

    autoTable(doc, {
        startY: 105,
        margin: { left: 20 },
        head: [['PLU', 'DESCRIPCIÓN DEL PRODUCTO', 'CANT.', 'U.M.', 'OBSERVACIONES']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [89, 140, 48],
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [39, 60, 31],
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [250, 249, 245]
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 25 },
            3: { cellWidth: 20 },
            4: { cellWidth: 40 }
        }
    })

    // Observaciones Generales
    const finalTableY = (doc as any).lastAutoTable.finalY || 150
    if (transfer.observations) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('NOTAS ADICIONALES:', 20, finalTableY + 15)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const splitObs = doc.splitTextToSize(transfer.observations, pageWidth - 40)
        doc.text(splitObs, 20, finalTableY + 22)
    }

    // --- Footer de Firmas ---
    const footerY = 265
    doc.setDrawColor(39, 60, 31)
    doc.setLineWidth(0.3)

    // Firma 1
    doc.line(25, footerY, 85, footerY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('DESPACHADO POR (CENTRAL)', 35, footerY + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(transfer.createdBy.username.toUpperCase(), 35, footerY + 10)

    // Firma 2
    doc.line(pageWidth - 90, footerY, pageWidth - 30, footerY)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('RECIBIDO CONFORME (SUC.)', pageWidth - 80, footerY + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(transfer.receivedBy?.username.toUpperCase() || '____________________', pageWidth - 80, footerY + 10)

    // Copyright / Page Info
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text(`Generado por Eden Market System - ${new Date().toLocaleString()} - Hoja 1/1`, pageWidth / 2, 285, { align: 'center' })

    // Guardar
    doc.save(`REMITO_${transfer.remitoNumber.toUpperCase()}.pdf`)
}
