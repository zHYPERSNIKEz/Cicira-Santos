import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ListaEstoque from './pages/estoque/Lista'
import FormularioEstoque from './pages/estoque/Formulario'
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
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/estoque" element={<ListaEstoque />} />
        <Route path="/estoque" element={<ListaEstoque />} />
        
        
        {/* Novas Rotas de Aluguéis */}
        <Route path="/alugueis" element={<ListaAlugueis />} />
        <Route path="/alugueis/novo" element={<FormularioAluguel />} />
        <Route path="/alugueis/editar/:id" element={<FormularioAluguel />} />
        <Route path="/alugueis/entregar/:id" element={<EntregaAluguel />} />
        <Route path="/alugueis/devolver/:id" element={<DevolucaoAluguel />} />
        <Route path="/estoque/novo" element={<FormularioEstoque />} />
        <Route path="/estoque/editar/:id" element={<FormularioEstoque />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App