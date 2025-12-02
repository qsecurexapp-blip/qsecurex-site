import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

const platforms = [
  {
    name: "Windows",
    icon: Monitor,
    description: "Windows 10 & 11",
    size: "68 MB",
    free: false,
  },
  {
    name: "macOS",
    icon: Apple,
    description: "macOS 11+ (Free Trial - 20 Users Limit)",
    size: "72 MB",
    free: true,
  },
  {
    name: "Linux",
    icon: Terminal,
    description: "Ubuntu, Fedora, Debian",
    size: "65 MB",
    free: false,
  },
  {
    name: "Android",
    icon: Smartphone,
    description: "Android 8.0+",
    size: "45 MB",
    free: false,
  },
];

const requirements = [
  "Valid license key (Personal, Pro, or Enterprise)",
  "100 MB free disk space",
  "2 GB RAM minimum",
  "No internet required after installation",
];

export default function DownloadPage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: downloadData, refetch } = useQuery({
    queryKey: ["/api/download/remaining"],
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  });

  const { data: userDownloadStatus } = useQuery({
    queryKey: ["/api/download/user-status"],
    enabled: !!user,
  });

  const remaining = downloadData?.remaining ?? 20;
  const isLimitReached = remaining <= 0;
  const hasAlreadyDownloaded = userDownloadStatus?.hasDownloaded ?? false;

  if (isLoading || !user) {
    return null; // Show nothing while loading or redirecting
  }

  const handleMacOSDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/download/macos-dmg");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "QSecureX-macOS.dmg";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Download started", description: "QSecureX macOS DMG is downloading" });
      
      // Refresh countdown after successful download
      setTimeout(() => refetch(), 500);
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
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-download-title">
              Download QSecureX
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The safest offline vault app for Android & Desktop.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                Version 1.0.0
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                68 MB
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                All Platforms
              </Badge>
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-sm py-1.5 px-4 flex items-center gap-2" data-testid="badge-free-downloads">
                <Zap className="h-3 w-3" />
                {remaining} Free Downloads Left
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform) => (
              <Card 
                key={platform.name} 
                className={`text-center hover-elevate ${platform.free ? "border-primary/50 bg-primary/5" : ""}`} 
                data-testid={`card-platform-${platform.name.toLowerCase()}`}
              >
                <CardContent className="pt-6">
                  <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
                    <platform.icon className="h-8 w-8" />
                  </div>
                  {platform.free && (
                    <div className="mb-3 space-y-2">
                      <Badge className="block text-center" variant="default">Free Trial</Badge>
                      {remaining > 0 && (
                        <div className="text-xs font-semibold text-primary">
                          {remaining} / 20 available
                        </div>
                      )}
                    </div>
                  )}
                  <h3 className="font-semibold mb-1">{platform.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {platform.description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">{platform.size}</p>
                  {platform.name === "macOS" && (
                    <Button 
                      onClick={handleMacOSDownload}
                      disabled={isDownloading || isLimitReached || hasAlreadyDownloaded}
                      className="w-full"
                      size="sm"
                      variant={isLimitReached ? "destructive" : hasAlreadyDownloaded ? "secondary" : "default"}
                      data-testid="button-download-macos"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isDownloading ? "Downloading..." : isLimitReached ? "Limit Reached" : hasAlreadyDownloaded ? "Already Downloaded" : "Download DMG"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Premium Downloads</h2>
              <p className="text-muted-foreground mb-6">
                For Windows, Linux & Android - a valid license key is required.
              </p>
              <Link href="/register">
                <Button size="lg" className="glow-primary" data-testid="button-get-license">
                  Create Account & Get License
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Create a free account to get a license key for all platforms.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">System Requirements</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Having trouble with installation? Our support team is here to help.
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg" data-testid="button-contact-support">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
