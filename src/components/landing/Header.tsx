import { Heart, LayoutDashboard, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();

  const handleLogout = async () => {
    await signOut();
    toast.success("Você saiu da conta");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <Heart className="h-5 w-5 text-primary fill-primary" />
          <span className="font-display font-bold text-gradient text-lg">My Love You</span>
        </button>

        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="text-foreground"
                >
                  <Shield className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="border-border"
              >
                <LayoutDashboard className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/login")}
              className="bg-gradient-cta text-primary-foreground hover:opacity-90"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
