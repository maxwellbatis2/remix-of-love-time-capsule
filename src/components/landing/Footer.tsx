import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="container text-center">
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
          Feito com <Heart className="h-4 w-4 text-primary fill-primary" /> por My Love You © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
