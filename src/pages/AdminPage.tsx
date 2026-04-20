import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Heart, Users, FileHeart, CreditCard, TrendingUp, Crown, Eye, Search,
  Ban, ShieldCheck, EyeOff, Activity, DollarSign, CalendarDays, LogOut, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [pages, setPages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!roleLoading && user && !isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate("/dashboard");
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  const loadAll = async () => {
    const [p, pr, pay, lg] = await Promise.all([
      supabase.from("love_pages").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("webhook_logs").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setPages(p.data || []);
    setProfiles(pr.data || []);
    setPayments(pay.data || []);
    setLogs(lg.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // KPIs
  const paidPayments = payments.filter((p) => p.status === "paid");
  const totalRevenue = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
  const now = new Date();
  const monthRevenue = paidPayments
    .filter((p) => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + Number(p.amount), 0);
  const conversion = profiles.length ? Math.round((paidPayments.length / profiles.length) * 100) : 0;

  // Sales by day (last 14d)
  const salesByDay = useMemo(() => {
    const days: { date: string; vendas: number; receita: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayPays = paidPayments.filter((p) => p.created_at.slice(0, 10) === key);
      days.push({
        date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        vendas: dayPays.length,
        receita: dayPays.reduce((s, p) => s + Number(p.amount), 0),
      });
    }
    return days;
  }, [payments]);

  // User growth (last 14d cumulative)
  const userGrowth = useMemo(() => {
    const days: { date: string; usuarios: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(23, 59, 59, 999);
      const count = profiles.filter((p) => new Date(p.created_at) <= d).length;
      days.push({
        date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        usuarios: count,
      });
    }
    return days;
  }, [profiles]);

  // Actions
  const toggleBlockUser = async (profileId: string, currentlyBlocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !currentlyBlocked })
      .eq("id", profileId);
    if (error) return toast.error("Erro: " + error.message);
    toast.success(currentlyBlocked ? "Usuário desbloqueado" : "Usuário bloqueado");
    loadAll();
  };

  const togglePublishPage = async (pageId: string, currentlyPublished: boolean) => {
    const { error } = await supabase
      .from("love_pages")
      .update({ is_published: !currentlyPublished })
      .eq("id", pageId);
    if (error) return toast.error("Erro: " + error.message);
    toast.success(currentlyPublished ? "Página despublicada" : "Página publicada");
    loadAll();
  };

  const filteredPages = pages.filter((p) =>
    `${p.partner1_name} ${p.partner2_name} ${p.slug}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProfiles = profiles.filter((p) =>
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPayments = payments.filter((p) =>
    `${p.cakto_payment_id || ""} ${p.plan} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display font-bold text-lg text-foreground">Admin</span>
          </Link>
          <Badge className="ml-auto bg-gradient-cta">
            <Crown className="h-3 w-3 mr-1" /> Administrador
          </Badge>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
          Painel <span className="text-gradient">Administrativo</span>
        </h1>
        <p className="text-muted-foreground mb-8">Visão completa do SaaS · {profiles.length} usuários</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-5 bg-card border-border">
            <DollarSign className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Receita total</p>
            <p className="text-2xl font-bold text-primary font-display">R$ {totalRevenue.toFixed(2)}</p>
          </Card>
          <Card className="p-5 bg-card border-border">
            <CalendarDays className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Receita mês</p>
            <p className="text-2xl font-bold text-foreground font-display">R$ {monthRevenue.toFixed(2)}</p>
          </Card>
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
          <Card className="p-5 bg-card border-border col-span-2 lg:col-span-1">
            <TrendingUp className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Conversão</p>
            <p className="text-2xl font-bold text-foreground font-display">{conversion}%</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Vendas por dia</h3>
              <Badge variant="outline" className="text-xs">14 dias</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">Crescimento de usuários</h3>
              <Badge variant="outline" className="text-xs">14 dias</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" fill="url(#userGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, slug, plano..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card h-12 rounded-xl"
          />
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="bg-card flex-wrap h-auto">
            <TabsTrigger value="pages">Páginas ({pages.length})</TabsTrigger>
            <TabsTrigger value="users">Usuários ({profiles.length})</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos ({payments.length})</TabsTrigger>
            <TabsTrigger value="logs">
              <Activity className="h-4 w-4 mr-1" /> Webhook ({logs.length})
            </TabsTrigger>
          </TabsList>

          {/* Pages */}
          <TabsContent value="pages" className="mt-4 space-y-2">
            {filteredPages.map((p) => (
              <Card key={p.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {p.partner1_name} & {p.partner2_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{p.slug} · {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={p.is_published ? "default" : "secondary"} className={p.is_published ? "bg-primary" : ""}>
                    {p.is_published ? "Publicada" : "Rascunho"}
                  </Badge>
                  <Badge variant="outline">{p.plan === "monthly" ? "Mensal" : "Vitalício"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/p/${p.slug}`, "_blank")} title="Ver">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" title={p.is_published ? "Despublicar" : "Publicar"}>
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {p.is_published ? "Despublicar" : "Publicar"} página?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {p.partner1_name} & {p.partner2_name} ({p.slug})
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => togglePublishPage(p.id, p.is_published)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
            {filteredPages.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma página encontrada</p>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users" className="mt-4 space-y-2">
            {filteredProfiles.map((u) => (
              <Card key={u.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-foreground truncate">{u.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_blocked ? (
                    <Badge variant="destructive">Bloqueado</Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary/30">Ativo</Badge>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" title={u.is_blocked ? "Desbloquear" : "Bloquear"}>
                        {u.is_blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {u.is_blocked ? "Desbloquear" : "Bloquear"} {u.full_name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {u.is_blocked
                            ? "O usuário voltará a ter acesso normal."
                            : "O usuário ficará marcado como bloqueado."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toggleBlockUser(u.id, u.is_blocked)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
            {filteredProfiles.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado</p>
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="mt-4 space-y-2">
            {filteredPayments.map((pay) => (
              <Card key={pay.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-foreground">R$ {Number(pay.amount).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {pay.plan} · {pay.cakto_payment_id || "—"} · {new Date(pay.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  className={
                    pay.status === "paid"
                      ? "bg-primary"
                      : pay.status === "failed"
                      ? "bg-destructive"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {pay.status}
                </Badge>
              </Card>
            ))}
            {filteredPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum pagamento encontrado</p>
            )}
          </TabsContent>

          {/* Webhook Logs */}
          <TabsContent value="logs" className="mt-4 space-y-2">
            {logs.length === 0 && (
              <Card className="p-8 bg-card border-border text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhum log de webhook ainda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Eventos da Cakto aparecerão aqui em tempo real
                </p>
              </Card>
            )}
            {logs.map((log) => (
              <Card key={log.id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {log.status === "error" ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-display font-bold text-foreground text-sm">
                      {log.event_type || "evento"}
                    </span>
                    <Badge variant="outline" className="text-xs">{log.provider}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </span>
                </div>
                {log.error_message && (
                  <p className="text-xs text-destructive mt-2">{log.error_message}</p>
                )}
                {log.payload && (
                  <pre className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground overflow-x-auto max-h-32">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
