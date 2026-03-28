import { Heart } from "lucide-react";

const testimonials = [
  {
    quote: "Meu namorado chorou ao ver nosso app personalizado. Foi o presente mais lindo que já dei!",
    names: "João e Maria",
    city: "São Paulo, SP",
  },
  {
    quote: "O contador mostrando cada momento juntos é muito especial. Amamos!",
    names: "Pedro e Ana",
    city: "Rio de Janeiro, RJ",
  },
  {
    quote: "A música personalizada e as fotos tornaram tudo ainda mais romântico.",
    names: "Lucas e Julia",
    city: "Belo Horizonte, MG",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-4xl">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold font-display text-center mb-12">
          O que os Casais Dizem
        </h2>

        <div className="space-y-6">
          {testimonials.map((t) => (
            <div key={t.names} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3].map((i) => (
                  <Heart key={i} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-foreground italic mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{t.names}</span>
                <span className="text-muted-foreground text-sm">{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
