import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Estoque from './pages/Estoque' 
import Clientes from './pages/Clientes'
import ListaAlugueis from './pages/alugueis/Lista'
import FormularioAluguel from './pages/alugueis/Formulario'
import EntregaAluguel from './pages/alugueis/Entrega'
import DevolucaoAluguel from './pages/alugueis/Devolucao'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/clientes" element={<Clientes />} />
        
        {/* Novas Rotas de Aluguéis */}
        <Route path="/alugueis" element={<ListaAlugueis />} />
        <Route path="/alugueis/novo" element={<FormularioAluguel />} />
        <Route path="/alugueis/editar/:id" element={<FormularioAluguel />} />
        <Route path="/alugueis/entregar/:id" element={<EntregaAluguel />} />
        <Route path="/alugueis/devolver/:id" element={<DevolucaoAluguel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App