import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-3xl">
        <div className="bg-gradient-cta rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 30% 50%, white, transparent 60%)" }} />
          <h2 className="text-3xl md:text-4xl font-bold font-display text-primary-foreground mb-4 relative z-10">
            Pronto para Surpreender seu Amor?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto relative z-10">
            Crie agora sua lembrança personalizada e veja a emoção nos olhos de quem você ama.
          </p>
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 text-lg px-10 py-6 rounded-full relative z-10"
          >
            <Heart className="mr-2 h-5 w-5 text-primary" />
            Criar Minha Lembrança
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
