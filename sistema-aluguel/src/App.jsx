import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Páginas Gerais
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Financeiro from './pages/Financeiro'

// Módulo Clientes (Adicionei o Formulário aqui)
import Clientes from './pages/Clientes'
import FormularioCliente from './pages/clientes/Formulario'

// Módulo Estoque
import ListaEstoque from './pages/estoque/Lista'
import FormularioEstoque from './pages/estoque/Formulario'

// Módulo Aluguéis
import ListaAlugueis from './pages/alugueis/Lista'
import FormularioAluguel from './pages/alugueis/Formulario'
import EntregaAluguel from './pages/alugueis/Entrega'
import DevolucaoAluguel from './pages/alugueis/Devolucao'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Início */}
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/financeiro" element={<Financeiro />} />
        
        {/* Rotas de Clientes (Novas) */}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/novo" element={<FormularioCliente />} />
        <Route path="/clientes/editar/:id" element={<FormularioCliente />} />

        {/* Rotas de Estoque (Limpei a duplicada) */}
        <Route path="/estoque" element={<ListaEstoque />} />
        <Route path="/estoque/novo" element={<FormularioEstoque />} />
        <Route path="/estoque/editar/:id" element={<FormularioEstoque />} />
        
        {/* Rotas de Aluguéis */}
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