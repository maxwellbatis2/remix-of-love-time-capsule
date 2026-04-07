import { useState, useEffect } from "react";
import { Heart, Music, Camera, ArrowLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import demoCouple from "@/assets/demo-couple.jpg";
import couple1 from "@/assets/couple-1.webp";
import couple2 from "@/assets/couple-2.webp";
import coupleBeach from "@/assets/couple-beach.jpg";
import coupleFlamengo from "@/assets/couple-flamengo.jpg";
import FloatingHearts from "@/components/FloatingHearts";

const DEMO_START_DATE = new Date("2026-02-01T00:00:00");

const DemoPage = () => {
  const navigate = useNavigate();
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const diff = now.getTime() - DEMO_START_DATE.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeElapsed({ days, hours, minutes, seconds });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  const photos = [demoCouple, couple1, couple2, coupleBeach, coupleFlamengo];

  const messages = [
    "Cada segundo ao seu lado é um presente. Te amo mais do que palavras podem expressar. 💕",
    "Você é a razão do meu sorriso todos os dias. Obrigado(a) por existir na minha vida. ❤️",
    "Nosso amor é a coisa mais bonita que já construí. Quero eternizá-lo para sempre. 🌹",
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingHearts />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">Demonstração do App</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8 relative z-20">
        {/* Couple Names */}
        <div className="text-center animate-fade-in">
          <h1 className="text-gradient text-4xl font-bold font-display mb-2"><h1 className="text-gradient text-4xl font-bold font-display mb-2">Maxwell & Gabriela</h1></h1>
          <p className="text-muted-foreground text-sm">Juntos desde 01/02/2026</p>
        </div>

        {/* Time Counter */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-center text-muted-foreground text-sm mb-4 uppercase tracking-wider">Nosso tempo juntos</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: timeElapsed.days, label: "Dias" },
              { value: timeElapsed.hours, label: "Horas" },
              { value: timeElapsed.minutes, label: "Min" },
              { value: timeElapsed.seconds, label: "Seg" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="bg-muted rounded-xl py-3 px-2 mb-1">
                  <span className="text-3xl md:text-4xl font-bold text-primary font-display">
                    {String(item.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery with floating hearts */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-fade-in relative overflow-hidden" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="text-foreground font-semibold">Nossos Momentos</h2>
          </div>
          <div className="rounded-xl overflow-hidden mb-3 aspect-square relative">
            <img
              src={photos[activePhoto]}
              alt="Momento especial"
              className="w-full h-full object-cover transition-all duration-700 scale-100 hover:scale-105"
            />
            {/* Mini floating hearts over photo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-primary/20 animate-float-heart"
                  style={{
                    left: `${15 + i * 14}%`,
                    fontSize: `${14 + i * 3}px`,
                    animationDuration: `${5 + i * 1.5}s`,
                    animationDelay: `${i * 1.2}s`,
                  }}
                >
                  ♥
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover-scale ${
                  activePhoto === i ? "border-primary shadow-glow" : "border-border opacity-60"
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Love Messages */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary fill-primary animate-pulse-slow" />
            <h2 className="text-foreground font-semibold">Mensagens de Amor</h2>
          </div>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className="bg-muted rounded-xl p-4 border-l-2 border-primary animate-fade-in" style={{ animationDelay: `${0.4 + i * 0.15}s` }}>
                <p className="text-foreground text-sm italic">{msg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Music Player */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5 text-primary" />
            <h2 className="text-foreground font-semibold">Nossa Música</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground flex-shrink-0 shadow-glow hover-scale"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium truncate">Perfect</p>
              <p className="text-muted-foreground text-sm truncate">Ed Sheeran</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-cta rounded-full transition-all duration-1000 ${isPlaying ? "w-1/3" : "w-0"}`} />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pb-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <p className="text-muted-foreground">Gostou? Crie a sua agora!</p>
          <Button
            size="lg"
            onClick={() => navigate("/criar")}
            className="bg-gradient-cta text-primary-foreground hover:opacity-90 text-lg px-10 py-6 rounded-full shadow-glow w-full hover-scale"
          >
            <Heart className="mr-2 h-5 w-5" />
            Criar Minha Surpresa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
