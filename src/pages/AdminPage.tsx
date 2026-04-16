import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Users, FileHeart, CreditCard, TrendingUp, Crown, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [pages, setPages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!roleLoading && user && !isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate("/dashboard");
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("love_pages").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]).then(([p, pr, pay]) => {
      setPages(p.data || []);
      setProfiles(pr.data || []);
      setPayments(pay.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const conversion = profiles.length ? Math.round((pages.length / profiles.length) * 100) : 0;

  const filteredPages = pages.filter((p) =>
    `${p.partner1_name} ${p.partner2_name} ${p.slug}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProfiles = profiles.filter((p) => p.full_name?.toLowerCase().includes(search.toLowerCase()));

  if (authLoading || roleLoading || loading) {
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
            <span className="font-display font-bold text-lg text-foreground">Admin</span>
          </Link>
          <Badge className="ml-auto bg-gradient-cta">
            <Crown className="h-3 w-3 mr-1" /> Administrador
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
          Painel <span className="text-gradient">Administrativo</span>
        </h1>
        <p className="text-muted-foreground mb-8">Visão completa do SaaS</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-card border-border">
            <Users className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Usuários</p>
            <p className="text-2xl font-bold text-foreground font-display">{profiles.length}</p>
          </Card>
          <Card className="p-5 bg-card border-border">
            <FileHeart className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Páginas</p>
            <p className="text-2xl font-bold text-foreground font-display">{pages.length}</p>
          </Card>
          <Card className="p-5 bg-card border-border">
            <CreditCard className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-2xl font-bold text-primary font-display">R$ {totalRevenue.toFixed(2)}</p>
          </Card>
          <Card className="p-5 bg-card border-border">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Conversão</p>
            <p className="text-2xl font-bold text-foreground font-display">{conversion}%</p>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card h-12 rounded-xl"
          />
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="bg-card">
            <TabsTrigger value="pages">Páginas ({pages.length})</TabsTrigger>
            <TabsTrigger value="users">Usuários ({profiles.length})</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos ({payments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-4 space-y-2">
            {filteredPages.map((p) => (
              <Card key={p.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-display font-bold text-foreground">{p.partner1_name} & {p.partner2_name}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.is_published ? "default" : "secondary"} className={p.is_published ? "bg-primary" : ""}>
                    {p.is_published ? "Publicada" : "Rascunho"}
                  </Badge>
                  <Badge variant="outline">{p.plan === "monthly" ? "Mensal" : "Vitalício"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/p/${p.slug}`, "_blank")}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-4 space-y-2">
            {filteredProfiles.map((u) => (
              <Card key={u.id} className="p-4 bg-card border-border flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-foreground">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="mt-4 space-y-2">
            {payments.map((pay) => (
              <Card key={pay.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-display font-bold text-foreground">R$ {Number(pay.amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{pay.plan} · {new Date(pay.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <Badge className={pay.status === "paid" ? "bg-primary" : "bg-muted text-muted-foreground"}>
                  {pay.status}
                </Badge>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
