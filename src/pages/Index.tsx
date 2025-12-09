import { Header } from "@/components/Header";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { CategoryGrid } from "@/components/CategoryGrid";
import { BusinessSection } from "@/components/BusinessSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-roboto">
      <Header />
      <TopBannerAd />
      <CategoryGrid />
      <BusinessSection />
      <BottomBannerAd />
      <Footer />
    </div>
  );
};

export default Index;
