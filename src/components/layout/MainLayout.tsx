import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { TopBannerAd } from "@/components/TopBannerAd";
import { BottomBannerAd } from "@/components/BottomBannerAd";
import { GlobalPlayer } from "@/components/streams/GlobalPlayer";
import { GlobalGamification } from "@/components/gamification/GlobalGamification";
import { DailyMissions } from "@/components/gamification/DailyMissions";
import { useEffect } from "react";
import { useToast } from '@/hooks/use-toast';
import { Zap } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const MainLayout = ({ children, hideHeader = false, hideFooter = false }: MainLayoutProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const handleMissionComplete = (e: any) => {
      const { title, target, progress } = e.detail;
      toast({
        title: "Mission Completed!",
        description: `${title} - ${progress}/${target}`,
      });
    };

    window.addEventListener('bara_mission_completed', handleMissionComplete);
    return () => window.removeEventListener('bara_mission_completed', handleMissionComplete);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <TopBannerAd />
      <main className="flex-grow">
        {children}
      </main>
      <GlobalGamification />
      <DailyMissions />
      <GlobalPlayer />
      <BottomBannerAd />
      <Footer />
    </div>
  );
}
