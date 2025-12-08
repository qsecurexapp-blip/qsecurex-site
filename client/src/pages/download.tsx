import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  Shield,
  CheckCircle,
  ArrowRight,
  Terminal,
  Zap,
  AlertTriangle,
  Lock,
  Clock,
  HardDrive,
  Cpu,
  Wifi,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

const platforms = [
  {
    name: "macOS",
    icon: Apple,
    description: "macOS 11+ (Big Sur and later)",
    size: "72 MB",
    free: true,
    pro: false,
    available: true,
    badge: "Free Trial",
  },
  {
    name: "macOS Pro",
    icon: Apple,
    description: "macOS 11+ Pro Edition",
    size: "72 MB",
    free: false,
    pro: true,
    available: true,
    price: "₹4,999",
    badge: "Pro Edition",
  },
  {
    name: "Windows",
    icon: Monitor,
    description: "Windows 10 & 11",
    size: "68 MB",
    free: false,
    pro: false,
    available: false,
    badge: "Coming Soon",
  },
  {
    name: "Linux",
    icon: Terminal,
    description: "Ubuntu, Fedora, Debian",
    size: "65 MB",
    free: false,
    pro: false,
    available: false,
    badge: "Coming Soon",
  },
  {
    name: "Android",
    icon: Smartphone,
    description: "Android 8.0+",
    size: "45 MB",
    free: false,
    pro: false,
    available: false,
    badge: "Coming Soon",
  },
];

const requirements = [
  { icon: HardDrive, text: "100 MB free disk space" },
  { icon: Cpu, text: "2 GB RAM minimum" },
  { icon: Wifi, text: "No internet required after installation" },
  { icon: Lock, text: "Valid license key for premium features" },
];

export default function DownloadPage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: downloadData, refetch } = useQuery<{ remaining: number; total: number; limit: number; enabled: boolean }>({
    queryKey: ["/api/download/remaining"],
    refetchInterval: 3000,
  });

  const { data: userDownloadStatus } = useQuery<{ hasDownloaded: boolean }>({
    queryKey: ["/api/download/user-status"],
    enabled: !!user,
  });

  const { data: licensesData } = useQuery<any[]>({
    queryKey: ["/api/licenses"],
    enabled: !!user,
  });

  const remaining = downloadData?.remaining ?? 20;
  const total = downloadData?.total ?? 0;
  const limit = downloadData?.limit ?? 20;
  const isLimitReached = remaining <= 0;
  const hasAlreadyDownloaded = userDownloadStatus?.hasDownloaded ?? false;
  const isDownloadEnabled = downloadData?.enabled ?? true;
  const hasProLicense = licensesData?.some((l: any) => l.plan === "pro" && l.status === "active") ?? false;
  const progressPercent = ((limit - remaining) / limit) * 100;

  if (isLoading || !user) {
    return null;
  }

  const handleMacOSDownload = async () => {
    setIsDownloading(true);
    try {
      const checkResponse = await fetch("/api/download/check-eligibility");
      const checkData = await checkResponse.json();
      
      if (!checkResponse.ok) {
        throw new Error(checkData.error || "Download failed");
      }
      
      if (!checkData.eligible) {
        throw new Error(checkData.reason || "You are not eligible for free download");
      }

      window.open("/api/download/macos-dmg", "_self");
      toast({ title: "Download started", description: "QSecureX macOS installer is downloading" });
      
      setTimeout(() => refetch(), 1000);
    } catch (error: any) {
      toast({ 
        title: "Download failed", 
        description: error.message || "Could not download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  }

  const handleMacOSProDownload = async () => {
    setIsDownloading(true);
    try {
      if (!hasProLicense) {
        setLocation("/purchase");
        return;
      }

      window.open("/api/download/macos-pro", "_self");
      toast({ title: "Download started", description: "QSecureX Pro Edition macOS installer is downloading" });
    } catch (error: any) {
      toast({ 
        title: "Download failed", 
        description: error.message || "Could not download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-8">
              <Download className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Download <span className="text-primary">QSecureX</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get the safest offline vault app for your device. Military-grade encryption with no cloud dependency.
            </p>

            {/* Download Stats Card */}
            <Card className="max-w-md mx-auto border-primary/20 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Free Trial Downloads</span>
                  </div>
                  <Badge variant={isDownloadEnabled ? "default" : "destructive"} className="font-mono">
                    {remaining} / {limit}
                  </Badge>
                </div>
                <Progress value={progressPercent} className="h-2 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isDownloadEnabled 
                    ? `${remaining} free downloads remaining for macOS trial`
                    : "Free downloads are currently disabled by admin"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Available Platforms */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Available Platforms</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Download QSecureX for your preferred platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* macOS Free Trial Card */}
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                      <Apple className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">macOS</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">macOS 11+ (Big Sur and later)</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Free Trial
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" /> 72 MB
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Instant Download
                  </span>
                </div>
                
                {hasAlreadyDownloaded ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">You've already downloaded the free trial</span>
                  </div>
                ) : !isDownloadEnabled ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Free downloads temporarily disabled</span>
                  </div>
                ) : isLimitReached ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Download limit reached. Consider Pro edition.</span>
                  </div>
                ) : null}

                <Button 
                  onClick={handleMacOSDownload}
                  disabled={isDownloading || isLimitReached || hasAlreadyDownloaded || !isDownloadEnabled}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {isDownloading ? "Downloading..." : hasAlreadyDownloaded ? "Already Downloaded" : isLimitReached ? "Limit Reached" : "Download Free Trial"}
                </Button>
              </CardContent>
            </Card>

            {/* macOS Pro Card */}
            <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent hover:border-amber-500/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <Crown className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">macOS Pro</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Full-featured Pro Edition</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Pro Edition
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" /> 72 MB
                  </span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">₹4,999</span>
                </div>

                {hasProLicense ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Pro License Active - Ready to download!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                    <span className="text-sm">Purchase Pro license to download</span>
                  </div>
                )}

                <Button 
                  onClick={handleMacOSProDownload}
                  disabled={isDownloading}
                  className={`w-full h-12 text-base font-semibold ${hasProLicense ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
                  size="lg"
                  variant={hasProLicense ? "default" : "outline"}
                >
                  {hasProLicense ? (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      {isDownloading ? "Downloading..." : "Download Pro Edition"}
                    </>
                  ) : (
                    <>
                      <Crown className="h-5 w-5 mr-2" />
                      Purchase Pro License
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Platforms */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-center mb-6 text-muted-foreground">Coming Soon</h3>
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {platforms.filter(p => !p.available).map((platform) => (
                <Card key={platform.name} className="bg-muted/30 border-muted-foreground/10">
                  <CardContent className="p-5 text-center">
                    <div className="inline-flex p-3 rounded-xl bg-muted mb-3">
                      <platform.icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold mb-1">{platform.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">System Requirements</h2>
            <p className="text-muted-foreground">Minimum requirements to run QSecureX</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {requirements.map((req, index) => (
              <Card key={index} className="bg-background/50">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <req.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{req.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Need Help Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="py-10 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Having trouble with installation or need assistance? Our support team is ready to help you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg">
                    Explore Features
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
