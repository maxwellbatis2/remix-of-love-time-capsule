import { useState } from "react";
import { Heart, ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const CadastroPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Preencha todos os campos!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(form.email, form.password, form.name);
      toast.success("Conta criada com sucesso! 🎉");
      navigate("/criar");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">Criar Conta</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-gradient text-3xl font-bold font-display mb-2">My Love You</h1>
            <p className="text-muted-foreground">Crie sua conta e comece a eternizar seu amor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground font-medium">Seu Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Seu nome completo" className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" className="pl-10 pr-10 bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-cta text-primary-foreground hover:opacity-90 h-12 rounded-xl text-lg shadow-glow">
              {isLoading ? <span className="animate-pulse-slow">Criando conta...</span> : <><Heart className="mr-2 h-5 w-5" /> Criar Minha Conta</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <button onClick={() => navigate("/login")} className="text-primary hover:underline font-medium">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroPage;
