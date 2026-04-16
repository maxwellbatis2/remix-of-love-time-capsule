import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Camera, Music, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FloatingHearts from "@/components/FloatingHearts";

const PaginaPublicaPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activePhoto, setActivePhoto] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("love_pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle().then(async ({ data }) => {
      if (data) {
        setPage(data);
        const { data: ph } = await supabase.from("love_photos").select("*").eq("page_id", data.id).order("sort_order");
        setPhotos(ph || []);
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!page?.start_date) return;
    const calc = () => {
      const start = new Date(page.start_date + "T00:00:00");
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();
      if (days < 0) { months--; days += 30; }
      if (months < 0) { years--; months += 12; }
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setTime({ years, months, days, hours, minutes, seconds });
    };
    calc();
    const i = setInterval(calc, 1000);
    return () => clearInterval(i);
  }, [page]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Carregando...</div>;

  if (!page) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Heart className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Página não encontrada</h1>
      <p className="text-muted-foreground mb-6 text-center">Esta página não existe ou ainda não foi publicada.</p>
      <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingHearts />

      <div className="container mx-auto max-w-md px-4 py-8 relative z-10 space-y-6">
        <div className="text-center pt-8">
          <h1 className="text-gradient text-4xl md:text-5xl font-bold font-display mb-2">
            {page.partner1_name} & {page.partner2_name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Juntos desde {new Date(page.start_date).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-center text-muted-foreground text-xs mb-3 uppercase tracking-wider">Nosso tempo juntos</h2>
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
                <div className="bg-muted rounded-xl py-3 px-1 mb-1">
                  <span className="text-2xl font-bold text-primary font-display">{String(it.v).padStart(2, "0")}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{it.l}</span>
              </div>
            ))}
          </div>
        </div>

        {photos.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4 text-primary" />
              <h2 className="text-foreground font-semibold text-sm">Nossos Momentos</h2>
            </div>
            <div className="rounded-xl overflow-hidden mb-3 aspect-square">
              <img src={photos[activePhoto]?.photo_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {photos.map((p, i) => (
                <button key={p.id} onClick={() => setActivePhoto(i)} className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${activePhoto === i ? "border-primary shadow-glow" : "border-border opacity-60"}`}>
                  <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {page.message && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <h2 className="text-foreground font-semibold text-sm">Mensagem de Amor</h2>
            </div>
            <div className="bg-muted rounded-xl p-4 border-l-2 border-primary">
              <p className="text-foreground text-sm italic whitespace-pre-wrap">{page.message}</p>
            </div>
          </div>
        )}

        {page.music_url && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-primary" />
              <h2 className="text-foreground font-semibold text-sm">Nossa Música</h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground shadow-glow">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <a href={page.music_url} target="_blank" rel="noreferrer" className="flex-1 text-sm text-foreground truncate hover:underline">
                Ouvir música
              </a>
            </div>
          </div>
        )}

        <div className="text-center pt-6 pb-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
            Crie a sua em <span className="text-gradient font-bold">My Love You</span> 💕
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaginaPublicaPage;
