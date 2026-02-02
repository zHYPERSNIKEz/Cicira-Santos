import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Estoque from './pages/Estoque' 
import Clientes from './pages/Clientes'
import Alugueis from './pages/Alugueis'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/estoque" element={<Estoque />} /> {}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/alugueis" element={<Alugueis />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App