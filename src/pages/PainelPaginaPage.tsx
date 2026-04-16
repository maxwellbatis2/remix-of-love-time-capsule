import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, QrCode, Copy, Share2, Mail, MessageCircle, ExternalLink, Trash2, Eye, EyeOff, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PainelPaginaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partnerEmail, setPartnerEmail] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    supabase.from("love_pages").select("*").eq("id", id).eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      if (error || !data) {
        toast.error("Página não encontrada");
        navigate("/dashboard");
        return;
      }
      setPage(data);
      setLoading(false);
    });
  }, [user, id, navigate]);

  const publicUrl = page ? `${window.location.origin}/p/${page.slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsapp = () => {
    const text = encodeURIComponent(`Amor, criei algo especial pra nós 💕\n\n${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const inviteByEmail = () => {
    if (!partnerEmail) return toast.error("Digite o e-mail");
    const subject = encodeURIComponent("Uma surpresa pra você 💕");
    const body = encodeURIComponent(`Olá meu amor,\n\nFiz algo especial pra contar nossa história. Acesse:\n${publicUrl}\n\nCom amor.`);
    window.location.href = `mailto:${partnerEmail}?subject=${subject}&body=${body}`;
    toast.success("Abrindo seu e-mail...");
  };

  const togglePublish = async () => {
    const { error } = await supabase.from("love_pages").update({ is_published: !page.is_published }).eq("id", page.id);
    if (error) return toast.error(error.message);
    setPage({ ...page, is_published: !page.is_published });
    toast.success(page.is_published ? "Página despublicada" : "Página publicada!");
  };

  const deletePage = async () => {
    if (!confirm("Tem certeza? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("love_pages").delete().eq("id", page.id);
    if (error) return toast.error(error.message);
    toast.success("Página excluída");
    navigate("/dashboard");
  };

  const downloadQR = () => {
    const svg = document.getElementById("page-qr") as unknown as SVGSVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${page.slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading || !page) {
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
            <span className="font-display font-bold text-lg text-foreground">Painel da Página</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            {page.partner1_name} & {page.partner2_name}
          </h1>
          <Badge className={page.is_published ? "bg-primary" : "bg-muted text-muted-foreground"}>
            {page.is_published ? "● Publicada" : "○ Não publicada"}
          </Badge>
        </div>

        {/* QR Code & Link */}
        <Card id="share" className="p-6 bg-card border-border">
          <h2 className="font-display font-bold text-xl text-foreground mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" /> Compartilhar com seu amor
          </h2>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-4 rounded-2xl shadow-glow">
              <QRCodeSVG id="page-qr" value={publicUrl} size={180} level="H" />
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Link público</label>
                <div className="flex gap-2">
                  <Input value={publicUrl} readOnly className="bg-background text-xs" />
                  <Button size="icon" variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareWhatsapp} className="bg-gradient-cta rounded-full">
                  <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                </Button>
                <Button onClick={downloadQR} variant="outline" className="rounded-full">
                  <QrCode className="h-4 w-4 mr-1" /> Baixar QR
                </Button>
              </div>

              <Button onClick={() => window.open(publicUrl, "_blank")} variant="outline" className="w-full rounded-full">
                <ExternalLink className="h-4 w-4 mr-1" /> Abrir página
              </Button>
            </div>
          </div>
        </Card>

        {/* Invite partner */}
        <Card className="p-6 bg-card border-border">
          <h2 className="font-display font-bold text-xl text-foreground mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Convidar parceiro(a) por e-mail
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Envie a surpresa direto pro e-mail do seu amor</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="email-do-amor@exemplo.com"
              className="bg-background h-12 rounded-xl"
            />
            <Button onClick={inviteByEmail} className="bg-gradient-cta rounded-full h-12 px-6">
              Enviar surpresa 💕
            </Button>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 bg-card border-border">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Configurações</h2>
          <div className="space-y-3">
            <Button onClick={togglePublish} variant="outline" className="w-full rounded-full justify-start">
              {page.is_published ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {page.is_published ? "Despublicar página" : "Publicar página"}
            </Button>
            <Button onClick={() => navigate(`/criar?edit=${page.id}`)} variant="outline" className="w-full rounded-full justify-start">
              <Crown className="h-4 w-4 mr-2" /> Editar conteúdo
            </Button>
            <Button onClick={deletePage} variant="outline" className="w-full rounded-full justify-start text-destructive border-destructive/50 hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir página
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PainelPaginaPage;
