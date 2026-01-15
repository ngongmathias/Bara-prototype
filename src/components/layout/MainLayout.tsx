import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBannerAd />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <BottomBannerAd />
      <Footer />
    </div>
  );
}
