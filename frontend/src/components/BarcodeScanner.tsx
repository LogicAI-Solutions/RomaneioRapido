import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, RefreshCcw, CheckCircle2 } from 'lucide-react'

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void
    onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const containerId = "reader"
    const [scanSuccess, setScanSuccess] = useState(false)
    const isScanningRef = useRef(false)

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
            } catch (err) {
                console.warn("Stop error (safe to ignore):", err)
            }
        }
    }

    const startScanner = async () => {
        if (!scannerRef.current) return

        try {
            await stopScanner()

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }

            await scannerRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    // Evitar múltiplas chamadas consecutivas
                    if (isScanningRef.current) return
                    isScanningRef.current = true

                    console.log("CÓDIGO ENCONTRADO:", decodedText)
                    setScanSuccess(true)

                    // Feedback tátil
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100])

                    // Mostra o sucesso por 1 segundo antes de fechar e processar
                    setTimeout(() => {
                        onScan(decodedText)
                        stopScanner().then(onClose)
                    }, 1000)
                },
                () => {
                    // Ignora erros normais (quando nenhum código é achado no frame)
                }
            )
        } catch (err) {
            console.error("FALHA AO INICIAR:", err)
        }
    }

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(containerId)
        scannerRef.current = html5QrCode

        const timer = setTimeout(() => {
            startScanner()
        }, 500)

        return () => {
            clearTimeout(timer)
            stopScanner()
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${scanSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            {scanSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        </div>
                        <h2 className={`text-sm font-bold transition-colors ${scanSuccess ? 'text-emerald-600' : 'text-gray-900'} text-nowrap`}>
                            {scanSuccess ? 'Lido com sucesso!' : 'Centralize o Código'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-gray-900 border-x border-gray-900 relative">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-square shadow-2xl">

                        {/* Overlay de Sucesso */}
                        {scanSuccess && (
                            <div className="absolute inset-0 z-30 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                                <CheckCircle2 className="w-16 h-16 text-white mb-3 drop-shadow-md animate-bounce" />
                                <p className="text-white font-bold text-lg drop-shadow-md">Código Localizado</p>
                                <p className="text-emerald-50 text-sm font-medium mt-1">Processando...</p>
                            </div>
                        )}

                        {/* Area de Scan do html5-qrcode */}
                        <div id={containerId} className="w-full h-full" />

                        {/* Overlay visual fixo para guiar o usuário */}
                        {!scanSuccess && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className="w-[200px] h-[200px] border-2 border-blue-500/50 rounded-2xl relative shadow-[0_0_0_999px_rgba(0,0,0,0.3)] transition-all">
                                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                                    <div className="absolute top-1/2 left-4 right-4 h-px bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`p-6 transition-colors duration-300 text-center ${scanSuccess ? 'bg-emerald-50' : 'bg-white'}`}>
                    {!scanSuccess ? (
                        <>
                            <button
                                onClick={() => stopScanner().then(startScanner)}
                                className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-bold transition-colors"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" /> Reiniciar Câmera
                            </button>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                Aponte para o código e aguarde a detecção automática.<br />
                                Funciona com QR Codes e Códigos de Barras.
                            </p>
                        </>
                    ) : (
                        <p className="text-[13px] text-emerald-700 leading-relaxed font-bold animate-pulse">
                            Buscando no banco de dados...
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
