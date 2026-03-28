import { Gift, Calendar, Music, Camera, MessageCircleHeart, QrCode } from "lucide-react";

const features = [
  {
    icon: Gift,
    title: "Único e Exclusivo",
    description: "Um app personalizado só para vocês, com suas fotos e momentos especiais.",
  },
  {
    icon: Calendar,
    title: "Contador Personalizado",
    description: "Cada segundo do seu amor contabilizado com carinho. Dias, horas, minutos e segundos.",
  },
  {
    icon: Music,
    title: "Música do Casal",
    description: "A trilha sonora do seu amor tocando em momentos especiais.",
  },
  {
    icon: Camera,
    title: "Galeria de Fotos",
    description: "Até 7 fotos especiais do casal em uma galeria linda e interativa.",
  },
  {
    icon: MessageCircleHeart,
    title: "Mensagens de Amor",
    description: "Escreva mensagens carinhosas que seu amor vai ler com emoção.",
  },
  {
    icon: QrCode,
    title: "QR Code Exclusivo",
    description: "Um QR Code único para seu amor escanear e acessar a página especial.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl">
        <h2 className="text-gradient text-3xl md:text-4xl font-bold font-display text-center mb-4">
          Tudo que Vocês Precisam
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Recursos pensados para tornar cada momento ainda mais especial
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
