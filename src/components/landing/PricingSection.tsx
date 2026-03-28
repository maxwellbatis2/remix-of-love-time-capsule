import { Check, X, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Vitalício",
    price: "R$ 19,99",
    period: "/pagamento único",
    popular: false,
    icon: Crown,
    features: [
      { text: "Página permanente", included: true },
      { text: "Até 3 fotos especiais", included: true },
      { text: "Contador em tempo real", included: true },
      { text: "QR Code exclusivo", included: true },
      { text: "Cápsulas do tempo", included: false },
      { text: "Música integrada", included: false },
      { text: "Temas exclusivos", included: false },
      { text: "URL personalizada", included: false },
    ],
  },
  {
    name: "Premium Mensal",
    price: "R$ 29,99",
    period: "/mês",
    popular: true,
    icon: Star,
    features: [
      { text: "Tudo do Vitalício", included: true },
      { text: "Até 7 fotos + vídeos", included: true },
      { text: "Contador em tempo real", included: true },
      { text: "QR Code exclusivo", included: true },
      { text: "Cápsulas do tempo", included: true },
      { text: "Música integrada", included: true },
      { text: "Temas exclusivos", included: true },
      { text: "URL personalizada", included: true },
    ],
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 px-4">
      <div className="container max-w-4xl">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold font-display text-center mb-3">
          Escolha o Plano Perfeito para Vocês
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          Todos os planos incluem um QR Code exclusivo e seu próprio app personalizado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-8 ${
                plan.popular ? "border-primary shadow-glow" : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-cta text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                  Mais Popular
                </span>
              )}
              <div className="flex items-center justify-center gap-2 mb-2">
                <plan.icon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    {f.included ? (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/criar")}
                className={`w-full rounded-full py-6 text-lg ${
                  plan.popular
                    ? "bg-gradient-cta text-primary-foreground hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Começar Agora
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
