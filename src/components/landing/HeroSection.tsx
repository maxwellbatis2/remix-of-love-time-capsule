import { Heart, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-couple.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full opacity-20" style={{ background: "var(--gradient-glow)" }} />
      </div>

      <h1 className="text-gradient text-5xl md:text-7xl font-bold font-display text-center mb-4 relative z-10">
        My Love You
      </h1>

      <p className="text-xl md:text-2xl font-display text-foreground text-center max-w-2xl mb-3 relative z-10">
        O Presente que Mostra o Quanto Cada Segundo ao Lado Dele(a) Valeu a Pena
      </p>

      <p className="text-muted-foreground text-center max-w-xl mb-8 relative z-10">
        Imagine a emoção do seu amor ao escanear um QR Code e descobrir um aplicativo exclusivo para vocês, cheio das suas fotos, sua música e a contagem exata de cada dia incrível juntos.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-10">
        <Button size="lg" onClick={() => navigate("/criar")} className="bg-gradient-cta text-primary-foreground hover:opacity-90 text-lg px-8 py-6 rounded-full shadow-glow">
          <Heart className="mr-2 h-5 w-5" />
          Criar Minha Surpresa!
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate("/demo")} className="border-border text-foreground hover:bg-muted text-lg px-8 py-6 rounded-full">
          <QrCode className="mr-2 h-5 w-5" />
          Ver demonstração do App
        </Button>
      </div>

      {/* Social proof */}
      <div className="bg-card border border-border rounded-xl px-6 py-4 mb-10 relative z-10">
        <p className="text-foreground">
          <span className="text-primary font-semibold">🎉 Sucesso!</span>{" "}
          <strong>73 casais</strong> já criaram suas lembranças especiais hoje. Não perca essa chance!
        </p>
      </div>

      {/* Hero image */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden shadow-card">
        <img src={heroImage} alt="Casal feliz usando My Love You" width={1024} height={768} className="w-full h-auto object-cover" />
      </div>
    </section>
  );
};

export default HeroSection;
