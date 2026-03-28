import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const BUYERS = [
  { name: "Ana", city: "São Paulo" },
  { name: "Lucas & Maria", city: "Rio de Janeiro" },
  { name: "Pedro", city: "Belo Horizonte" },
  { name: "Juliana", city: "Curitiba" },
  { name: "Rafael & Camila", city: "Salvador" },
  { name: "Fernanda", city: "Brasília" },
  { name: "Gustavo", city: "Porto Alegre" },
  { name: "Isabela", city: "Recife" },
  { name: "Thiago & Larissa", city: "Fortaleza" },
  { name: "Carla", city: "Florianópolis" },
  { name: "Bruno & Aline", city: "Manaus" },
  { name: "Mariana", city: "Goiânia" },
  { name: "Felipe & Beatriz", city: "Campinas" },
  { name: "Renata", city: "Vitória" },
  { name: "Diego & Priscila", city: "Belém" },
];

const TIMES = ["agora", "2 min atrás", "5 min atrás", "8 min atrás", "12 min atrás"];

const BuyerNotifications = () => {
  const [notification, setNotification] = useState<{ name: string; city: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => {
      const buyer = BUYERS[Math.floor(Math.random() * BUYERS.length)];
      const time = TIMES[Math.floor(Math.random() * TIMES.length)];
      setNotification({ ...buyer, time });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    // First notification after 3s
    const firstTimeout = setTimeout(show, 3000);
    // Then every 8-15s
    const interval = setInterval(show, 8000 + Math.random() * 7000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-[100] max-w-[320px] transition-all duration-500 ${
        visible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    >
      <div className="bg-card/95 backdrop-blur-md border border-primary/30 rounded-2xl p-3 shadow-glow flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center flex-shrink-0">
          <Heart className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground text-sm font-medium truncate">
            {notification.name}
          </p>
          <p className="text-muted-foreground text-xs truncate">
            criou uma surpresa • {notification.city}
          </p>
          <p className="text-primary text-[10px]">{notification.time}</p>
        </div>
      </div>
    </div>
  );
};

export default BuyerNotifications;
