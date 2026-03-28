import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, MessageCircleHeart, Music, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const steps = [
  { icon: Calendar, label: "Data Especial" },
  { icon: MessageCircleHeart, label: "Mensagem" },
  { icon: Music, label: "Música" },
  { icon: Camera, label: "Fotos" },
];

const CriarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    partnerName: "",
    startDate: "",
    message: "",
    musicUrl: "",
  });

  const handleNext = () => {
    if (step === 0 && (!data.partnerName || !data.startDate)) {
      toast.error("Preencha o nome e a data!");
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      toast.success("Lembrança criada! 🎉 Veja a demonstração.");
      navigate("/demo");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">{steps[step].label}</span>
        <span className="ml-auto text-xs text-muted-foreground">{step + 1}/{steps.length}</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Step 0: Date */}
          {step === 0 && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Quando tudo começou?</h2>
                <p className="text-muted-foreground text-sm">O início da história de vocês</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-foreground font-medium">Nome do(a) parceiro(a)</label>
                  <Input
                    value={data.partnerName}
                    onChange={(e) => setData({ ...data, partnerName: e.target.value })}
                    placeholder="Ex: Maria"
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
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircleHeart className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Escreva com o coração</h2>
                <p className="text-muted-foreground text-sm">Uma mensagem especial para seu amor</p>
              </div>
              <Textarea
                value={data.message}
                onChange={(e) => setData({ ...data, message: e.target.value })}
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
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Qual é a música de vocês?</h2>
                <p className="text-muted-foreground text-sm">Cole o link do YouTube ou Spotify</p>
              </div>
              <Input
                value={data.musicUrl}
                onChange={(e) => setData({ ...data, musicUrl: e.target.value })}
                placeholder="https://open.spotify.com/track/..."
                className="bg-card border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Opcional — você pode adicionar depois</p>
            </>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Momentos Especiais</h2>
                <p className="text-muted-foreground text-sm">Envie até 7 fotos do casal</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <label
                    key={i}
                    className="aspect-square bg-card border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Foto {i + 1}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={() => toast.success(`Foto ${i + 1} selecionada!`)} />
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Você pode adicionar ou trocar fotos depois</p>
            </>
          )}

          {/* Navigation */}
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-cta text-primary-foreground hover:opacity-90 h-12 rounded-xl text-lg shadow-glow"
          >
            {step === steps.length - 1 ? (
              <>
                <Heart className="mr-2 h-5 w-5" />
                Criar Minha Lembrança
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriarPage;
