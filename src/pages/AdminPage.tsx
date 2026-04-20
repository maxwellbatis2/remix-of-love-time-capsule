import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart, Users, FileHeart, CreditCard, TrendingUp, Crown, Eye, Search,
  Ban, ShieldCheck, EyeOff, Activity, DollarSign, CalendarDays, LogOut,
  AlertCircle, CheckCircle2, Trash2, Pencil, LayoutDashboard, Home,
  RefreshCw, ExternalLink, MoreVertical, ShieldAlert, UserCog, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

type Section = "overview" | "pages" | "users" | "payments" | "logs";

const sections: { id: Section; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "pages", label: "Páginas", icon: FileHeart },
  { id: "users", label: "Usuários", icon: Users },
  { id: "payments", label: "Pagamentos", icon: CreditCard },
  { id: "logs", label: "Webhook logs", icon: Activity },
];

const AdminSidebar = ({
  active, onChange, onLogout, counts,
}: {
  active: Section;
  onChange: (s: Section) => void;
  onLogout: () => void;
  counts: Record<Section, number | null>;
}) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-1">
          <Heart className="h-5 w-5 text-primary fill-primary shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm text-sidebar-foreground truncate">Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">My Love You</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((s) => (
                <SidebarMenuItem key={s.id}>
                  <SidebarMenuButton
                    isActive={active === s.id}
                    onClick={() => onChange(s.id)}
                    className="hover:bg-sidebar-accent"
                  >
                    <s.icon className="h-4 w-4" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        {s.label}
                        {counts[s.id] !== null && (
                          <Badge variant="outline" className="text-[10px] h-5">{counts[s.id]}</Badge>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Atalhos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/"><Home className="h-4 w-4" />{!collapsed && <span>Site</span>}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" />{!collapsed && <span>Dashboard usuário</span>}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [section, setSection] = useState<Section>("overview");
  const [pages, setPages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!roleLoading && user && !isAdmin) {
      toast.error("Acesso restrito a administradores");
      navigate("/dashboard");
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  const loadAll = async () => {
    setRefreshing(true);
    const [p, pr, pay, lg, r] = await Promise.all([
      supabase.from("love_pages").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("webhook_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("user_roles").select("*"),
    ]);
    setPages(p.data || []);
    setProfiles(pr.data || []);
    setPayments(pay.data || []);
    setLogs(lg.data || []);
    setRoles(r.data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Sessão encerrada");
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

  // Helpers
  const isUserAdmin = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "admin");

  // Actions: pages
  const togglePublishPage = async (pageId: string, currentlyPublished: boolean) => {
    const { error } = await supabase.from("love_pages").update({ is_published: !currentlyPublished }).eq("id", pageId);
    if (error) return toast.error(error.message);
    toast.success(currentlyPublished ? "Despublicada" : "Publicada");
    loadAll();
  };
  const deletePage = async (pageId: string) => {
    await supabase.from("love_photos").delete().eq("page_id", pageId);
    await supabase.from("payments").delete().eq("page_id", pageId);
    const { error } = await supabase.from("love_pages").delete().eq("id", pageId);
    if (error) return toast.error(error.message);
    toast.success("Página excluída");
    loadAll();
  };
  const setPagePlan = async (pageId: string, plan: string) => {
    const { error } = await supabase.from("love_pages").update({ plan, payment_status: "paid" }).eq("id", pageId);
    if (error) return toast.error(error.message);
    toast.success(`Plano alterado para ${plan}`);
    loadAll();
  };

  // Actions: users
  const toggleBlockUser = async (profileId: string, blocked: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_blocked: !blocked }).eq("id", profileId);
    if (error) return toast.error(error.message);
    toast.success(blocked ? "Desbloqueado" : "Bloqueado");
    loadAll();
  };
  const toggleAdminRole = async (uid: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Permissão de admin removida");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Promovido a admin");
    }
    loadAll();
  };

  // Actions: payments
  const updatePaymentStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("payments").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Pagamento marcado como ${status}`);
    loadAll();
  };

  // Export CSV
  const exportCSV = (rows: any[], filename: string) => {
    if (!rows.length) return toast.info("Nada para exportar");
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(","),
      ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // Filters
  const filteredPages = pages.filter((p) =>
    `${p.partner1_name} ${p.partner2_name} ${p.slug}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProfiles = profiles.filter((p) => p.full_name?.toLowerCase().includes(search.toLowerCase()));
  const filteredPayments = payments.filter((p) =>
    `${p.cakto_payment_id || ""} ${p.plan} ${p.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const counts: Record<Section, number | null> = {
    overview: null,
    pages: pages.length,
    users: profiles.length,
    payments: payments.length,
    logs: logs.length,
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Carregando painel...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar active={section} onChange={setSection} onLogout={handleLogout} counts={counts} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header always visible */}
          <header className="h-14 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40 flex items-center px-3 gap-2">
            <SidebarTrigger />
            <Badge className="bg-gradient-cta hidden sm:flex"><Crown className="h-3 w-3 mr-1" /> Admin</Badge>
            <h2 className="font-display font-bold text-foreground capitalize ml-1 truncate">
              {sections.find((s) => s.id === section)?.label}
            </h2>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={loadAll} disabled={refreshing} title="Atualizar">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}><UserCog className="h-4 w-4 mr-2" /> Meu perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}><LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard usuário</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {/* OVERVIEW */}
            {section === "overview" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                  <Card className="p-4 bg-card border-border">
                    <DollarSign className="h-4 w-4 text-primary mb-1" />
                    <p className="text-[11px] text-muted-foreground">Receita total</p>
                    <p className="text-xl font-bold text-primary font-display">R$ {totalRevenue.toFixed(2)}</p>
                  </Card>
                  <Card className="p-4 bg-card border-border">
                    <CalendarDays className="h-4 w-4 text-primary mb-1" />
                    <p className="text-[11px] text-muted-foreground">Receita mês</p>
                    <p className="text-xl font-bold text-foreground font-display">R$ {monthRevenue.toFixed(2)}</p>
                  </Card>
                  <Card className="p-4 bg-card border-border">
                    <Users className="h-4 w-4 text-primary mb-1" />
                    <p className="text-[11px] text-muted-foreground">Usuários</p>
                    <p className="text-xl font-bold text-foreground font-display">{profiles.length}</p>
                  </Card>
                  <Card className="p-4 bg-card border-border">
                    <FileHeart className="h-4 w-4 text-primary mb-1" />
                    <p className="text-[11px] text-muted-foreground">Páginas</p>
                    <p className="text-xl font-bold text-foreground font-display">{pages.length}</p>
                  </Card>
                  <Card className="p-4 bg-card border-border col-span-2 lg:col-span-1">
                    <TrendingUp className="h-4 w-4 text-primary mb-1" />
                    <p className="text-[11px] text-muted-foreground">Conversão</p>
                    <p className="text-xl font-bold text-foreground font-display">{conversion}%</p>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
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
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
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
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }} />
                        <Area type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" fill="url(#userGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </>
            )}

            {/* Search bar (não-overview) */}
            {section !== "overview" && (
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-card h-11 rounded-xl"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (section === "pages") exportCSV(filteredPages, "paginas.csv");
                    if (section === "users") exportCSV(filteredProfiles, "usuarios.csv");
                    if (section === "payments") exportCSV(filteredPayments, "pagamentos.csv");
                    if (section === "logs") exportCSV(logs, "webhook-logs.csv");
                  }}
                  title="Exportar CSV"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* PAGES */}
            {section === "pages" && (
              <div className="space-y-2">
                {filteredPages.map((p) => (
                  <Card key={p.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-foreground truncate">{p.partner1_name} & {p.partner2_name}</p>
                      <p className="text-xs text-muted-foreground truncate">/{p.slug} · {new Date(p.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={p.is_published ? "bg-primary" : "bg-muted text-muted-foreground"}>
                        {p.is_published ? "Publicada" : "Rascunho"}
                      </Badge>
                      <Badge variant="outline">{p.plan === "monthly" ? "Mensal" : "Vitalício"}</Badge>
                      <Badge variant="outline" className={p.payment_status === "paid" ? "border-primary/40 text-primary" : ""}>
                        {p.payment_status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => window.open(`/p/${p.slug}`, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" /> Ver pública
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/painel/${p.id}`)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublishPage(p.id, p.is_published)}>
                            {p.is_published ? <><EyeOff className="h-4 w-4 mr-2" /> Despublicar</> : <><Eye className="h-4 w-4 mr-2" /> Publicar</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs">Forçar plano</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setPagePlan(p.id, "lifetime")}>Vitalício (pago)</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPagePlan(p.id, "monthly")}>Mensal (pago)</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso remove {p.partner1_name} & {p.partner2_name}, fotos e pagamentos vinculados. Ação permanente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePage(p.id)} className="bg-destructive">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
                {filteredPages.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma página</p>}
              </div>
            )}

            {/* USERS */}
            {section === "users" && (
              <div className="space-y-2">
                {filteredProfiles.map((u) => {
                  const admin = isUserAdmin(u.user_id);
                  return (
                    <Card key={u.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-foreground truncate flex items-center gap-2">
                          {u.full_name}
                          {admin && <Crown className="h-3 w-3 text-primary" />}
                        </p>
                        <p className="text-xs text-muted-foreground">Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.is_blocked
                          ? <Badge variant="destructive">Bloqueado</Badge>
                          : <Badge variant="outline" className="border-primary/30 text-primary">Ativo</Badge>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => toggleBlockUser(u.id, u.is_blocked)}>
                              {u.is_blocked ? <><ShieldCheck className="h-4 w-4 mr-2" /> Desbloquear</> : <><Ban className="h-4 w-4 mr-2" /> Bloquear</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleAdminRole(u.user_id, admin)}>
                              {admin ? <><ShieldAlert className="h-4 w-4 mr-2" /> Remover admin</> : <><Crown className="h-4 w-4 mr-2" /> Tornar admin</>}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  );
                })}
                {filteredProfiles.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum usuário</p>}
              </div>
            )}

            {/* PAYMENTS */}
            {section === "payments" && (
              <div className="space-y-2">
                {filteredPayments.map((pay) => (
                  <Card key={pay.id} className="p-4 bg-card border-border flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-foreground">R$ {Number(pay.amount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {pay.plan} · {pay.cakto_payment_id || "—"} · {new Date(pay.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge className={
                      pay.status === "paid" ? "bg-primary"
                        : pay.status === "failed" || pay.status === "refunded" ? "bg-destructive"
                        : "bg-muted text-muted-foreground"
                    }>{pay.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuLabel className="text-xs">Alterar status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(pay.id, "paid")}><CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Marcar pago</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(pay.id, "pending")}>Pendente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(pay.id, "failed")}>Falhou</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(pay.id, "refunded")} className="text-destructive">Reembolsar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Card>
                ))}
                {filteredPayments.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum pagamento</p>}
              </div>
            )}

            {/* LOGS */}
            {section === "logs" && (
              <div className="space-y-2">
                {logs.length === 0 && (
                  <Card className="p-8 bg-card border-border text-center">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum log de webhook ainda</p>
                  </Card>
                )}
                {logs.map((log) => (
                  <Card key={log.id} className="p-4 bg-card border-border">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {log.status === "error"
                          ? <AlertCircle className="h-4 w-4 text-destructive" />
                          : <CheckCircle2 className="h-4 w-4 text-primary" />}
                        <span className="font-display font-bold text-foreground text-sm">{log.event_type || "evento"}</span>
                        <Badge variant="outline" className="text-xs">{log.provider}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                    </div>
                    {log.error_message && <p className="text-xs text-destructive mt-2">{log.error_message}</p>}
                    {log.payload && (
                      <pre className="mt-2 p-2 bg-background rounded text-xs text-muted-foreground overflow-x-auto max-h-32">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
