import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Lembrança Especial",
    price: "R$ 29",
    period: "/único",
    popular: false,
    features: [
      { text: "1 ano de acesso ao app", included: true },
      { text: "Até 3 fotos especiais", included: true },
      { text: "Contador personalizado", included: true },
      { text: "QR Code exclusivo", included: true },
      { text: "Música personalizada", included: false },
      { text: "Temas exclusivos", included: false },
      { text: "URL personalizada", included: false },
    ],
  },
  {
    name: "Celebração Eterna",
    price: "R$ 49",
    period: "/único",
    popular: true,
    features: [
      { text: "Acesso vitalício", included: true },
      { text: "Até 7 fotos especiais", included: true },
      { text: "Contador personalizado", included: true },
      { text: "QR Code exclusivo", included: true },
      { text: "Música personalizada", included: true },
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
              <h3 className="text-xl font-bold text-foreground text-center mb-2">{plan.name}</h3>
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

              onClick={() => navigate("/cadastro")}
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
