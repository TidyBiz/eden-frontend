interface BarcodeData {
  PLU: number
  weight: number
  weightRaw: string
  original: string
}

export default function decodeBarcodeData(data: string): {
  decodedData: BarcodeData | null
  error: string | null
} {
  // Limpiar espacios en blanco
  const cleanData = data.trim()
  if (cleanData.length === 0 || cleanData.length > 13) {
    return {
      decodedData: null,
      error: 'Invalid barcode data',
    }
  }

  // Si tiene 12 dígitos, añadir un 0 al principio
  let processedData = cleanData
  if (cleanData.length === 12) {
    processedData = '0' + cleanData
  }

  if (processedData && processedData.length === 13) {
    const middle = processedData.slice(2, 12)
    const plu = middle.slice(0, 5)
    const weightRaw = middle.slice(5, 10)

    // Convertir a número: "12345" -> 12345 -> 12.345
    const weightNumber = parseInt(weightRaw, 10) / 1000 // Dividir por 1000 para mover la coma 3 lugares

    return {
      decodedData: {
        PLU: Number(plu),
        weight: weightNumber,
        weightRaw,
        original: processedData,
      },
      error: null,
    }
  }

  return {
    decodedData: null,
    error: 'Invalid barcode data',
  }
}
