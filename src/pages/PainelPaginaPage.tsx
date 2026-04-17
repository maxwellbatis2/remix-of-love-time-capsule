import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, QrCode, Copy, MessageCircle, ExternalLink, Trash2, Eye, EyeOff, Save, Upload, X, Instagram, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LovePagePreview from "@/components/LovePagePreview";

const PainelPaginaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  // form state
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");
  const [musicUrl, setMusicUrl] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data, error } = await supabase.from("love_pages").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
      if (error || !data) {
        toast.error("Página não encontrada");
        navigate("/dashboard");
        return;
      }
      setPage(data);
      setPartner1(data.partner1_name);
      setPartner2(data.partner2_name);
      setStartDate(data.start_date);
      setMessage(data.message || "");
      setMusicUrl(data.music_url || "");
      const { data: ph } = await supabase.from("love_photos").select("*").eq("page_id", data.id).order("sort_order");
      setPhotos(ph || []);
      setLoading(false);
    })();
  }, [user, id, navigate]);

  const publicUrl = page ? `${window.location.origin}/p/${page.slug}` : "";

  const previewData = {
    partner1_name: partner1,
    partner2_name: partner2,
    start_date: startDate,
    message,
    music_url: musicUrl,
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("love_pages")
      .update({
        partner1_name: partner1,
        partner2_name: partner2,
        start_date: startDate,
        message,
        music_url: musicUrl,
      })
      .eq("id", page.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setPage({ ...page, partner1_name: partner1, partner2_name: partner2, start_date: startDate, message, music_url: musicUrl });
    toast.success("Alterações salvas 💕");
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${user!.id}/${page.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("love-photos").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("love-photos").getPublicUrl(path);
        await supabase.from("love_photos").insert({ page_id: page.id, photo_url: pub.publicUrl, sort_order: photos.length });
      }
      const { data: ph } = await supabase.from("love_photos").select("*").eq("page_id", page.id).order("sort_order");
      setPhotos(ph || []);
      toast.success("Fotos enviadas!");
    } catch (e: any) {
      toast.error(e.message || "Erro no upload");
    }
    setUploading(false);
  };

  const removePhoto = async (photoId: string) => {
    const { error } = await supabase.from("love_photos").delete().eq("id", photoId);
    if (error) return toast.error(error.message);
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const togglePublish = async () => {
    const { error } = await supabase.from("love_pages").update({ is_published: !page.is_published }).eq("id", page.id);
    if (error) return toast.error(error.message);
    setPage({ ...page, is_published: !page.is_published });
    toast.success(page.is_published ? "Página despublicada" : "Página publicada! 🎉");
  };

  const deletePage = async () => {
    if (!confirm("Tem certeza? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("love_pages").delete().eq("id", page.id);
    if (error) return toast.error(error.message);
    toast.success("Página excluída");
    navigate("/dashboard");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const shareWhatsapp = () => {
    const text = encodeURIComponent(`Amor, criei algo especial pra nós 💕\n\n${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareInstagram = () => {
    copyLink();
    toast.info("Link copiado! Cole no seu story do Instagram 📸");
  };

  const downloadQR = () => {
    const svg = document.getElementById("page-qr") as unknown as SVGSVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `qr-${page.slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (authLoading || loading || !page) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">Editor da Página</span>
          </Link>
          <Badge className={`ml-auto ${page.is_published ? "bg-primary" : "bg-muted text-muted-foreground"}`}>
            {page.is_published ? "● Publicada" : "○ Rascunho"}
          </Badge>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobilePreview(!mobilePreview)}>
            <Smartphone className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Editor */}
          <div className={mobilePreview ? "hidden lg:block" : ""}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-4 bg-card mb-4 w-full">
                <TabsTrigger value="info">💑 Info</TabsTrigger>
                <TabsTrigger value="message">💌 Texto</TabsTrigger>
                <TabsTrigger value="photos">🖼️ Fotos</TabsTrigger>
                <TabsTrigger value="share">🔗 Share</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <Card className="p-5 bg-card border-border space-y-4">
                  <div>
                    <Label className="text-foreground">Nome do(a) parceiro(a) 1</Label>
                    <Input value={partner1} onChange={(e) => setPartner1(e.target.value)} className="bg-background mt-1 h-12 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-foreground">Nome do(a) parceiro(a) 2</Label>
                    <Input value={partner2} onChange={(e) => setPartner2(e.target.value)} className="bg-background mt-1 h-12 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-foreground">Data de início</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background mt-1 h-12 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-foreground">Música (link YouTube/Spotify)</Label>
                    <Input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="https://..." className="bg-background mt-1 h-12 rounded-xl" />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="message">
                <Card className="p-5 bg-card border-border">
                  <Label className="text-foreground">Sua mensagem de amor</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={10}
                    placeholder="Escreva algo do coração..."
                    className="bg-background mt-2 rounded-xl resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">{message.length} caracteres</p>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card className="p-5 bg-card border-border">
                  <label className="block border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files)}
                      disabled={uploading}
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-foreground font-medium">{uploading ? "Enviando..." : "Arraste ou clique para enviar fotos"}</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP</p>
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {photos.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(p.id)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="share">
                <Card className="p-5 bg-card border-border space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-2xl shadow-glow">
                      <QRCodeSVG id="page-qr" value={publicUrl} size={180} level="H" />
                    </div>
                    <Button onClick={downloadQR} variant="outline" className="rounded-full mt-3">
                      <QrCode className="h-4 w-4 mr-1" /> Baixar QR Code
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Link público</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={publicUrl} readOnly className="bg-background text-xs" />
                      <Button size="icon" variant="outline" onClick={copyLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button onClick={shareWhatsapp} className="bg-gradient-cta rounded-full">
                      <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                    </Button>
                    <Button onClick={shareInstagram} variant="outline" className="rounded-full">
                      <Instagram className="h-4 w-4 mr-1" /> Instagram
                    </Button>
                    <Button onClick={copyLink} variant="outline" className="rounded-full">
                      <Copy className="h-4 w-4 mr-1" /> Copiar
                    </Button>
                  </div>

                  <Button onClick={() => window.open(publicUrl, "_blank")} variant="outline" className="w-full rounded-full">
                    <ExternalLink className="h-4 w-4 mr-1" /> Abrir página
                  </Button>

                  <div className="border-t border-border pt-4">
                    <Button onClick={deletePage} variant="outline" className="w-full rounded-full text-destructive border-destructive/50 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir página
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: Preview ao vivo */}
          <div className={`${mobilePreview ? "block" : "hidden"} lg:block lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3" /> Preview ao vivo
            </div>
            <LovePagePreview data={previewData} photos={photos} />
          </div>
        </div>
      </main>

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 max-w-7xl">
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-cta rounded-full flex-1 sm:flex-initial">
            <Save className="h-4 w-4 mr-1" /> {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={() => window.open(publicUrl, "_blank")} variant="outline" className="rounded-full flex-1 sm:flex-initial">
            <ExternalLink className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Visualizar</span>
          </Button>
          <Button onClick={togglePublish} variant="outline" className="rounded-full flex-1 sm:flex-initial">
            {page.is_published ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {page.is_published ? "Despublicar" : "Publicar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PainelPaginaPage;
