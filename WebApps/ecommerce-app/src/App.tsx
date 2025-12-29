import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { OrdersPage } from './pages/OrderPage';
import { CheckoutPage } from './pages/CheckoutPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rota Protegida (Simples por enquanto) */}
        <Route path="/catalog" element={<CatalogPage />} />
        
        {/* Redireciona raiz para login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Rota para Meus Pedidos */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;