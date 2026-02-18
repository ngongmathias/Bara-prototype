import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { GlobalPlayer } from "@/components/streams/GlobalPlayer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TopBannerAd />
      <main className="flex-grow">
        {children}
      </main>
      <GlobalPlayer />
      <BottomBannerAd />
      <Footer />
    </div>
  );
}
