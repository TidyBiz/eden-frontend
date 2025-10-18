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
  // Si es un número de 6-14 dígitos, tomar el primer número distinto de cero en adelante como PLU
  if (/^\d{6,14}$/.test(cleanData)) {
    // Eliminar ceros a la izquierda
    const pluStr = cleanData.replace(/^0+/, "")
    // Si después de quitar ceros quedan al menos 6 dígitos
    if (pluStr.length >= 6) {
      return {
        decodedData: {
          PLU: Number(pluStr),
          weight: 0,
          weightRaw: '',
          original: cleanData,
        },
        error: null,
      }
    }
  }

  // Si tiene 13 dígitos, anteponer un cero para llegar a 14
  let processedData = cleanData
  if (cleanData.length === 13) {
    processedData = '0' + cleanData
  }

  if (processedData.length !== 14) {
    return {
      decodedData: null,
      error: 'Invalid barcode data',
    }
  }

  // Lógica para extraer PLU y peso de código largo
  const middle = processedData.slice(2, 12)
  const plu = middle.slice(0, 5)
  const weightRaw = middle.slice(5, 10)
  const weightNumber = parseInt(weightRaw, 10) / 1000

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
