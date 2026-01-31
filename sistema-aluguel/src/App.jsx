import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Futuramente colocaremos a rota do dashboard aqui */}
        <Route path="/dashboard" element={<div className="p-10">Bem-vindo ao Dashboard! (Em construção)</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App