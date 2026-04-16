import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import DemoPage from "./pages/DemoPage.tsx";
import CadastroPage from "./pages/CadastroPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import CriarPage from "./pages/CriarPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import PerfilPage from "./pages/PerfilPage.tsx";
import PainelPaginaPage from "./pages/PainelPaginaPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import PaginaPublicaPage from "./pages/PaginaPublicaPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/criar" element={<CriarPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/painel/:id" element={<PainelPaginaPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/p/:slug" element={<PaginaPublicaPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
