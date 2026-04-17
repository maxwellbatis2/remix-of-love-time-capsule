import TimerBadge from "@/components/landing/TimerBadge";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import BuyerNotifications from "@/components/BuyerNotifications";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TimerBadge />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <BuyerNotifications />
    </div>
  );
};

export default Index;
