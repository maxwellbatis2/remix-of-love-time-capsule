import { useEffect, useState } from "react";
import { Heart, Camera, Music, Play, Pause } from "lucide-react";
import FloatingHearts from "@/components/FloatingHearts";

interface PreviewData {
  partner1_name: string;
  partner2_name: string;
  start_date: string;
  message?: string | null;
  music_url?: string | null;
}

interface Photo {
  id: string;
  photo_url: string;
}

interface Props {
  data: PreviewData;
  photos?: Photo[];
}

const LovePagePreview = ({ data, photos = [] }: Props) => {
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activePhoto, setActivePhoto] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!data?.start_date) return;
    const calc = () => {
      const start = new Date(data.start_date + "T00:00:00");
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      if (days < 0) { months--; days += 30; }
      if (months < 0) { years--; months += 12; }
      setTime({ years, months, days, hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() });
    };
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [data?.start_date]);

  return (
    <div className="bg-background relative overflow-hidden rounded-2xl border border-border">
      <FloatingHearts />
      <div className="px-4 py-6 relative z-10 space-y-4">
        <div className="text-center pt-2">
          <h1 className="text-gradient text-3xl font-bold font-display mb-1">
            {data.partner1_name || "Nome 1"} & {data.partner2_name || "Nome 2"}
          </h1>
          <p className="text-muted-foreground text-xs">
            Juntos desde {data.start_date ? new Date(data.start_date).toLocaleDateString("pt-BR") : "—"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-center text-muted-foreground text-[10px] mb-2 uppercase tracking-wider">Nosso tempo juntos</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { v: time.years, l: "Anos" },
              { v: time.months, l: "Meses" },
              { v: time.days, l: "Dias" },
              { v: time.hours, l: "Horas" },
              { v: time.minutes, l: "Min" },
              { v: time.seconds, l: "Seg" },
            ].map((it) => (
              <div key={it.l} className="text-center">
                <div className="bg-muted rounded-lg py-2 px-1 mb-1">
                  <span className="text-xl font-bold text-primary font-display">{String(it.v).padStart(2, "0")}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">{it.l}</span>
              </div>
            ))}
          </div>
        </div>

        {photos.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-3 w-3 text-primary" />
              <h2 className="text-foreground font-semibold text-xs">Nossos Momentos</h2>
            </div>
            <div className="rounded-xl overflow-hidden mb-2 aspect-square">
              <img src={photos[activePhoto]?.photo_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {photos.map((p, i) => (
                <button key={p.id} onClick={() => setActivePhoto(i)} className={`w-10 h-10 rounded-md overflow-hidden border-2 ${activePhoto === i ? "border-primary shadow-glow" : "border-border opacity-60"}`}>
                  <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {data.message && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-3 w-3 text-primary fill-primary" />
              <h2 className="text-foreground font-semibold text-xs">Mensagem de Amor</h2>
            </div>
            <div className="bg-muted rounded-xl p-3 border-l-2 border-primary">
              <p className="text-foreground text-xs italic whitespace-pre-wrap">{data.message}</p>
            </div>
          </div>
        )}

        {data.music_url && (
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-3 w-3 text-primary" />
              <h2 className="text-foreground font-semibold text-xs">Nossa Música</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground shadow-glow">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <span className="flex-1 text-xs text-foreground truncate">Tocando música</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LovePagePreview;
