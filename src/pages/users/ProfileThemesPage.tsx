import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useProfileTheme, PROFILE_THEMES } from '@/hooks/useProfileTheme';
import { useGamification } from '@/hooks/useGamification';
import { useAdFree } from '@/hooks/useAdFree';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Coins,
  Check,
  Lock,
  Sparkles,
  ShieldOff,
  Clock,
  Loader2,
} from 'lucide-react';

export default function ProfileThemesPage() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useGamification();
  const {
    activeThemeId,
    ownedThemes,
    loading: themeLoading,
    purchaseTheme,
    activateTheme,
  } = useProfileTheme();
  const {
    isAdFree,
    loading: adFreeLoading,
    activateAdFree,
    timeRemaining,
    cost: adFreeCost,
    duration: adFreeDuration,
  } = useAdFree();

  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (themeId: string) => {
    if (!isSignedIn) {
      navigate('/user/sign-in');
      return;
    }
    setPurchasing(themeId);
    const result = await purchaseTheme(themeId);
    toast({
      title: result.success ? 'Theme Unlocked!' : 'Purchase Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    setPurchasing(null);
  };

  const handleActivate = async (themeId: string) => {
    const success = await activateTheme(themeId);
    if (success) {
      const theme = PROFILE_THEMES.find((t) => t.id === themeId);
      toast({
        title: 'Theme Applied!',
        description: `${theme?.name || 'Theme'} is now your active profile theme.`,
      });
    }
  };

  const handleAdFree = async () => {
    if (!isSignedIn) {
      navigate('/user/sign-in');
      return;
    }
    const result = await activateAdFree();
    toast({
      title: result.success ? 'Ad-Free Activated!' : 'Activation Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-comfortaa text-gray-900 flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-600" />
          Coin Shop
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Spend your Bara Coins on profile themes and perks
        </p>
        {profile && (
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm mt-3">
            <Coins className="w-4 h-4" />
            {profile.bara_coins} coins available
          </div>
        )}
      </div>

      {/* Ad-Free Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <ShieldOff className="w-5 h-5 text-blue-600" />
          Ad-Free Browsing
        </h2>
        <Card className={`border-2 ${isAdFree ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">
                {isAdFree ? 'Ad-Free Active' : 'Remove All Ads'}
              </h3>
              <p className="text-sm text-gray-500">
                {isAdFree
                  ? `Expires in ${timeRemaining() || 'soon'}`
                  : `Browse without banner ads for ${adFreeDuration} hours`}
              </p>
            </div>
            <div className="text-right">
              {isAdFree ? (
                <Badge className="bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Button
                  onClick={handleAdFree}
                  disabled={adFreeLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {adFreeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-1" />
                      {adFreeCost} coins
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Themes */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Profile Themes
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PROFILE_THEMES.map((theme) => {
            const owned = ownedThemes.includes(theme.id);
            const active = activeThemeId === theme.id;

            return (
              <Card
                key={theme.id}
                className={`overflow-hidden transition-all ${
                  active ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
                }`}
              >
                {/* Preview */}
                <div className={`h-24 ${theme.preview} relative`}>
                  {active && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-600 text-white text-[10px]">Active</Badge>
                    </div>
                  )}
                  {!owned && theme.cost > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/60 text-white text-[10px]">
                        <Lock className="w-3 h-3 mr-1" />
                        {theme.cost}
                      </Badge>
                    </div>
                  )}
                  {owned && !active && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white text-[10px]">
                        <Check className="w-3 h-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  <h3 className="font-bold text-sm text-gray-900">{theme.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-3">{theme.description}</p>

                  {active ? (
                    <Button disabled size="sm" className="w-full text-xs bg-purple-100 text-purple-700">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Button>
                  ) : owned ? (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(theme.id)}
                      className="w-full text-xs bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      Apply Theme
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(theme.id)}
                      disabled={purchasing === theme.id || themeLoading}
                      className="w-full text-xs bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
                    >
                      {purchasing === theme.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Coins className="w-3 h-3 mr-1" />
                          {theme.cost === 0 ? 'Free' : `${theme.cost} coins`}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
