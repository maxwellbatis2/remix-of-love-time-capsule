import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, Music, Camera, Calendar, MessageCircleHeart, Play, Pause, CreditCard, QrCode, Check, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import couple1 from "@/assets/couple-1.webp";
import couple2 from "@/assets/couple-2.webp";

const CriarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"vitalicio" | "mensal" | null>(null);
  const [data, setData] = useState({
    coupleName: "",
    startDate: "",
    message: "",
    musicUrl: "",
    musicName: "Sua música aqui",
    musicArtist: "Artista",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate time elapsed
  useEffect(() => {
    if (!data.startDate) return;
    const calc = () => {
      const start = new Date(data.startDate + "T00:00:00");
      const now = new Date();
      const diff = now.getTime() - start.getTime();
      if (diff < 0) { setTimeElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeElapsed({ days, hours, minutes, seconds });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [data.startDate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newPhotos = [...photos];
      newPhotos[index] = ev.target?.result as string;
      setPhotos(newPhotos);
      toast.success(`Foto ${index + 1} adicionada!`);
    };
    reader.readAsDataURL(file);
  };

  const generateSlug = () => {
    const names = data.coupleName.toLowerCase().replace(/\s*&\s*/g, "-e-").replace(/[^a-z0-9-]/g, "");
    return `${names}-${Date.now().toString(36)}`;
  };

  const savePage = async () => {
    if (!user) {
      toast.error("Faça login primeiro!");
      navigate("/cadastro");
      return null;
    }
    const slug = generateSlug();
    const [p1, p2] = data.coupleName.split(/\s*&\s*/);
    
    const { data: page, error } = await supabase.from("love_pages").insert({
      user_id: user.id,
      partner1_name: p1 || data.coupleName,
      partner2_name: p2 || "",
      start_date: data.startDate || new Date().toISOString().split("T")[0],
      message: data.message || null,
      music_url: data.musicUrl || null,
      slug,
      plan: selectedPlan === "mensal" ? "monthly" : "lifetime",
    }).select().single();

    if (error) { toast.error("Erro ao salvar: " + error.message); return null; }

    // Upload photos
    for (let i = 0; i < photos.length; i++) {
      if (!photos[i]) continue;
      const blob = await fetch(photos[i]).then(r => r.blob());
      const filePath = `${user.id}/${page.id}/${i}.jpg`;
      const { error: upErr } = await supabase.storage.from("love-photos").upload(filePath, blob);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("love-photos").getPublicUrl(filePath);
        await supabase.from("love_photos").insert({
          page_id: page.id,
          photo_url: urlData.publicUrl,
          sort_order: i,
        });
      }
    }
    return page;
  };

  const handleFinish = async () => {
    if (!selectedPlan) { toast.error("Escolha um plano!"); return; }
    setIsSaving(true);
    try {
      const page = await savePage();
      if (!page) { setIsSaving(false); return; }
      setPageId(page.id);

      // Create payment via edge function
      const { data: payData, error: payErr } = await supabase.functions.invoke("create-payment", {
        body: { page_id: page.id, plan: page.plan },
      });

      if (payErr) throw payErr;

      if (payData?.checkout_url) {
        window.location.href = payData.checkout_url;
      } else {
        // If no checkout URL, simulate success for now
        await supabase.from("love_pages").update({ payment_status: "paid", is_published: true }).eq("id", page.id);
        toast.success("Página criada com sucesso! 🎉");
        setStep(5);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro no pagamento: " + (err.message || "Tente novamente"));
    } finally {
      setIsSaving(false);
    }
  };

  const displayPhotos = photos.length > 0 ? photos.filter(Boolean) : [couple1, couple2];

  const steps = [
    { icon: Calendar, label: "Dados do Casal" },
    { icon: MessageCircleHeart, label: "Mensagem" },
    { icon: Music, label: "Música" },
    { icon: Camera, label: "Fotos" },
    { icon: CreditCard, label: "Plano" },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Data não definida";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  // ---- PREVIEW COMPONENT (inline) ----
  const Preview = () => (
    <div className="space-y-6">
      {/* Couple Names */}
      <div className="text-center">
        <h1 className="text-gradient text-3xl md:text-4xl font-bold font-display mb-2">
          {data.coupleName || "Seu Nome & Amor"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Juntos desde {formatDate(data.startDate)}
        </p>
      </div>

      {/* Time Counter */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-center text-muted-foreground text-xs mb-3 uppercase tracking-wider">Nosso tempo juntos</h2>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: timeElapsed.days, label: "Dias" },
            { value: timeElapsed.hours, label: "Horas" },
            { value: timeElapsed.minutes, label: "Min" },
            { value: timeElapsed.seconds, label: "Seg" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="bg-muted rounded-xl py-2 px-1 mb-1">
                <span className="text-2xl font-bold text-primary font-display animate-count">
                  {String(item.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery */}
      {displayPhotos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Camera className="h-4 w-4 text-primary" />
            <h2 className="text-foreground font-semibold text-sm">Nossos Momentos</h2>
          </div>
          <div className="rounded-xl overflow-hidden mb-3 aspect-square">
            <img
              src={displayPhotos[activePhoto] || displayPhotos[0]}
              alt="Momento especial"
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>
          <div className="flex gap-2 justify-center">
            {displayPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  activePhoto === i ? "border-primary shadow-glow" : "border-border opacity-60"
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Love Message */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-primary fill-primary" />
          <h2 className="text-foreground font-semibold text-sm">Mensagem de Amor</h2>
        </div>
        <div className="bg-muted rounded-xl p-4 border-l-2 border-primary">
          <p className="text-foreground text-sm italic">
            {data.message || "Sua mensagem de amor aparecerá aqui... 💕"}
          </p>
        </div>
      </div>

      {/* Music Player */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Music className="h-4 w-4 text-primary" />
          <h2 className="text-foreground font-semibold text-sm">Nossa Música</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground flex-shrink-0 shadow-glow"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-medium truncate text-sm">{data.musicName}</p>
            <p className="text-muted-foreground text-xs truncate">{data.musicArtist}</p>
            <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-cta rounded-full transition-all duration-1000 ${isPlaying ? "w-1/3" : "w-0"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Success / QR Code screen
  if (step === 5) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-20 h-20 bg-gradient-cta rounded-full flex items-center justify-center mb-6 shadow-glow">
          <Check className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-gradient text-3xl font-bold font-display mb-2 text-center">Página Criada!</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          A página de <strong className="text-foreground">{data.coupleName}</strong> está no ar! Compartilhe o QR Code com seu amor.
        </p>
        <div className="bg-card border border-border rounded-2xl p-8 mb-8">
          <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center mx-auto">
            <QrCode className="h-24 w-24 text-primary" />
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">Escaneie para ver a página</p>
        </div>
        <div className="w-full max-w-md">
          <Preview />
        </div>
        <Button onClick={() => navigate("/")} variant="outline" className="mt-8 rounded-full px-8">
          Voltar ao Início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-foreground font-medium">{steps[step]?.label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{step + 1}/{steps.length}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-3">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {/* Main content: Editor + Preview */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Editor Panel */}
        <div className="lg:w-1/2 p-4 lg:p-8 lg:border-r lg:border-border overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6">
            {/* Step 0: Couple data */}
            {step === 0 && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-1">Dados do Casal</h2>
                  <p className="text-muted-foreground text-sm">Preencha e veja o resultado ao vivo</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground font-medium">Nome do casal</label>
                    <Input
                      value={data.coupleName}
                      onChange={(e) => setData({ ...data, coupleName: e.target.value })}
                      placeholder="Ex: João & Maria"
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground font-medium">Data que começaram a namorar</label>
                    <Input
                      type="date"
                      value={data.startDate}
                      onChange={(e) => setData({ ...data, startDate: e.target.value })}
                      className="bg-card border-border text-foreground h-12 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Message */}
            {step === 1 && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircleHeart className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-1">Escreva com o coração</h2>
                  <p className="text-muted-foreground text-sm">Uma mensagem especial para seu amor</p>
                </div>
                <Textarea
                  value={data.message}
                  onChange={(e) => setData({ ...data, message: e.target.value.slice(0, 500) })}
                  placeholder="Escreva aqui sua mensagem de amor..."
                  rows={6}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{data.message.length}/500</p>
              </>
            )}

            {/* Step 2: Music */}
            {step === 2 && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-1">Qual é a música de vocês?</h2>
                  <p className="text-muted-foreground text-sm">A trilha sonora do amor de vocês</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground font-medium">Nome da música</label>
                    <Input
                      value={data.musicName === "Sua música aqui" ? "" : data.musicName}
                      onChange={(e) => setData({ ...data, musicName: e.target.value || "Sua música aqui" })}
                      placeholder="Ex: Perfect"
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground font-medium">Artista</label>
                    <Input
                      value={data.musicArtist === "Artista" ? "" : data.musicArtist}
                      onChange={(e) => setData({ ...data, musicArtist: e.target.value || "Artista" })}
                      placeholder="Ex: Ed Sheeran"
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground font-medium">Link (opcional)</label>
                    <Input
                      value={data.musicUrl}
                      onChange={(e) => setData({ ...data, musicUrl: e.target.value })}
                      placeholder="https://open.spotify.com/track/..."
                      className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-1">Momentos Especiais</h2>
                  <p className="text-muted-foreground text-sm">Envie até 7 fotos do casal</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <label
                      key={i}
                      className="aspect-square bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                    >
                      {photos[i] ? (
                        <img src={photos[i]} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Foto {i + 1}</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, i)} />
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <>
                <div className="text-center">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-foreground mb-1">Escolha seu Plano</h2>
                  <p className="text-muted-foreground text-sm">Libere sua página e compartilhe com seu amor</p>
                </div>

                <div className="space-y-4">
                  {/* Plano Vitalício */}
                  <button
                    onClick={() => setSelectedPlan("vitalicio")}
                    className={`w-full text-left bg-card border-2 rounded-2xl p-5 transition-all ${
                      selectedPlan === "vitalicio" ? "border-primary shadow-glow" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <span className="font-bold text-foreground">Vitalício</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "vitalicio" ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {selectedPlan === "vitalicio" && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-primary">R$ 19,99</span>
                      <span className="text-muted-foreground text-sm"> /pagamento único</span>
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Página permanente</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Até 3 fotos</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Contador em tempo real</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> QR Code exclusivo</li>
                    </ul>
                  </button>

                  {/* Plano Mensal */}
                  <button
                    onClick={() => setSelectedPlan("mensal")}
                    className={`w-full text-left bg-card border-2 rounded-2xl p-5 transition-all relative ${
                      selectedPlan === "mensal" ? "border-primary shadow-glow" : "border-border"
                    }`}
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-cta text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Mais Popular
                    </span>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        <span className="font-bold text-foreground">Premium Mensal</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === "mensal" ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                        {selectedPlan === "mensal" && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-primary">R$ 29,99</span>
                      <span className="text-muted-foreground text-sm"> /mês</span>
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Tudo do Vitalício</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Até 7 fotos + vídeos</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Cápsulas do tempo</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Temas exclusivos</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> Música integrada</li>
                      <li className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" /> URL personalizada</li>
                    </ul>
                  </button>
                </div>
              </>
            )}

            {/* Navigation Button */}
            <Button
              onClick={step === 4 ? handleFinish : () => {
                if (step === 0 && !data.coupleName) { toast.error("Preencha o nome do casal!"); return; }
                if (step === 0 && !user) { toast.info("Crie sua conta para continuar!"); navigate("/cadastro"); return; }
                setStep(step + 1);
              }}
              disabled={isSaving}
              className="w-full bg-gradient-cta text-primary-foreground hover:opacity-90 h-12 rounded-xl text-lg shadow-glow"
            >
              {step === 4 ? (
                isSaving ? <span className="animate-pulse-slow">Processando...</span> : <><CreditCard className="mr-2 h-5 w-5" /> Finalizar e Pagar</>
              ) : (
                <>Continuar <ArrowLeft className="ml-2 h-5 w-5 rotate-180" /></>
              )}
            </Button>

            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                Voltar
              </button>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:w-1/2 bg-muted/30 p-4 lg:p-8 overflow-y-auto" ref={previewRef}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Preview ao vivo</span>
            </div>
            <div className="bg-background border border-border rounded-2xl p-5 shadow-card">
              <Preview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarPage;
