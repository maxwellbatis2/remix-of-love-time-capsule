import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Save, Mail, User as UserIcon, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PerfilPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ pages: 0, payments: 0 });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("love_pages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "paid"),
    ]).then(([{ data: prof }, pagesRes, payRes]) => {
      setFullName(prof?.full_name || "");
      setStats({ pages: pagesRes.count || 0, payments: payRes.count || 0 });
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro: " + error.message);
    else toast.success("Perfil atualizado!");
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display font-bold text-lg text-foreground">Meu Perfil</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Avatar / Identity */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-cta mx-auto flex items-center justify-center mb-4 shadow-glow">
            <UserIcon className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">{fullName || "Sem nome"}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <Mail className="h-3 w-3" /> {user.email}
          </p>
          {isAdmin && (
            <Badge className="mt-3 bg-gradient-cta">
              <Crown className="h-3 w-3 mr-1" /> Administrador
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-5 bg-card border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Páginas criadas</p>
            <p className="text-3xl font-bold text-primary font-display">{stats.pages}</p>
          </Card>
          <Card className="p-5 bg-card border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Pagamentos</p>
            <p className="text-3xl font-bold text-foreground font-display">{stats.payments}</p>
          </Card>
        </div>

        {/* Edit form */}
        <Card className="p-6 bg-card border-border mb-6">
          <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Dados pessoais
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-foreground font-medium mb-2 block">Nome completo</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="h-12 rounded-xl bg-background"
              />
            </div>
            <div>
              <label className="text-sm text-foreground font-medium mb-2 block">E-mail</label>
              <Input value={user.email || ""} disabled className="h-12 rounded-xl bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">O e-mail não pode ser alterado</p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-cta rounded-full">
              <Save className="h-4 w-4 mr-2" /> {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Card>

        <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full rounded-full">
          Voltar ao Dashboard
        </Button>
      </main>
    </div>
  );
};

export default PerfilPage;
