import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../utils/cropImage' // Importa a matemática
import { X, Check, ZoomIn } from 'lucide-react'

export default function ModalRecorte({ imagem, aoFechar, aoSalvar }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSalvar = async () => {
    try {
      const croppedImage = await getCroppedImg(imagem, croppedAreaPixels)
      aoSalvar(croppedImage) // Devolve a imagem cortada
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
        
        {/* Cabeçalho */}
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center z-10">
            <h3 className="font-bold flex items-center gap-2"><ZoomIn size={18}/> Ajustar Foto</h3>
            <button onClick={aoFechar}><X size={20}/></button>
        </div>

        {/* Área do Recorte */}
        <div className="relative flex-1 bg-gray-900">
            <Cropper
            image={imagem}
            crop={crop}
            zoom={zoom}
            aspect={1} // Força ser quadrado/redondo
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropShape="round" // Mostra o círculo visualmente
            showGrid={false}
            />
        </div>

        {/* Controles de Zoom e Botões */}
        <div className="p-6 bg-white flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500">Zoom</span>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={aoFechar} 
                    className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSalvar} 
                    className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                    <Check size={18}/> Confirmar
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}