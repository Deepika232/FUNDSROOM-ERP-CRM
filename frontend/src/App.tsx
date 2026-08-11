import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ChallanDetail from "./pages/ChallanDetail";
import ChallanForm from "./pages/ChallanForm";
import ChallanList from "./pages/ChallanList";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerForm from "./pages/CustomerForm";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import ProductForm from "./pages/ProductForm";
import Products from "./pages/Products";
import StockMovements from "./pages/StockMovements";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "ACCOUNTS"]}>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES"]}>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "ACCOUNTS"]}>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES"]}>
                <CustomerForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE"]}>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]}>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE"]}>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-movements"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"]}>
                <StockMovements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]}>
                <ChallanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES"]}>
                <ChallanForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]}>
                <ChallanDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/challans/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SALES"]}>
                <ChallanForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
