import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Plus, ExternalLink, QrCode, Settings, LogOut, User, Crown, Eye, Calendar, CreditCard, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LovePage {
  id: string;
  partner1_name: string;
  partner2_name: string;
  start_date: string;
  slug: string;
  plan: string;
  payment_status: string;
  is_published: boolean;
  created_at: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const [pages, setPages] = useState<LovePage[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: p }, { data: prof }] = await Promise.all([
        supabase.from("love_pages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setPages(p || []);
      setProfile(prof);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
    navigate("/");
  };

  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.is_published).length,
    pending: pages.filter((p) => p.payment_status === "pending").length,
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display font-bold text-lg text-foreground">My Love You</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="rounded-full">
                <Crown className="h-4 w-4 mr-1" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
            Olá, <span className="text-gradient">{profile?.full_name?.split(" ")[0] || "amor"}</span> 💕
          </h1>
          <p className="text-muted-foreground">Gerencie suas páginas de amor</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <Card className="p-4 md:p-6 bg-card border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Páginas</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-display">{stats.total}</p>
          </Card>
          <Card className="p-4 md:p-6 bg-card border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Publicadas</p>
            <p className="text-2xl md:text-3xl font-bold text-primary font-display">{stats.published}</p>
          </Card>
          <Card className="p-4 md:p-6 bg-card border-border">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Pendentes</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground font-display">{stats.pending}</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Minhas Páginas</h2>
          <Button onClick={() => navigate("/criar")} className="bg-gradient-cta rounded-full shadow-glow">
            <Plus className="h-4 w-4 mr-1" /> Nova Página
          </Button>
        </div>

        {/* Pages list */}
        {pages.length === 0 ? (
          <Card className="p-12 text-center bg-card border-dashed border-border">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Você ainda não criou nenhuma página de amor</p>
            <Button onClick={() => navigate("/criar")} className="bg-gradient-cta rounded-full">
              <Plus className="h-4 w-4 mr-1" /> Criar primeira página
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pages.map((page) => (
              <Card key={page.id} className="p-5 bg-card border-border hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {page.partner1_name} & {page.partner2_name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> Desde {new Date(page.start_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant={page.is_published ? "default" : "secondary"} className={page.is_published ? "bg-primary" : ""}>
                    {page.is_published ? "Publicada" : page.payment_status === "pending" ? "Pendente" : "Rascunho"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <CreditCard className="h-3 w-3" />
                  Plano: <span className="text-foreground font-medium capitalize">{page.plan === "monthly" ? "Mensal" : "Vitalício"}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => navigate(`/p/${page.slug}`)}>
                    <Eye className="h-3 w-3 mr-1" /> Ver
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full flex-1" onClick={() => navigate(`/painel/${page.id}`)}>
                    <Settings className="h-3 w-3 mr-1" /> Gerenciar
                  </Button>
                  <Button size="sm" className="rounded-full flex-1 bg-gradient-cta" onClick={() => navigate(`/painel/${page.id}#share`)}>
                    <Share2 className="h-3 w-3 mr-1" /> Compartilhar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
