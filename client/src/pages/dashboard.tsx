import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import {
  Shield,
  Download,
  Key,
  Monitor,
  Smartphone,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Apple,
  Terminal,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import type { License } from "@shared/schema";

const downloadLinks = [
  { name: "Windows", icon: Monitor, size: "68 MB", available: false },
  { name: "macOS", icon: Apple, size: "72 MB", available: true },
  { name: "Linux", icon: Terminal, size: "65 MB", available: false },
  { name: "Android", icon: Smartphone, size: "45 MB", available: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("windows");
  const [registering, setRegistering] = useState(false);

  const { data: licenses, isLoading: licensesLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
    enabled: !!user,
  });

  // Find the most recently sent license, fallback to most recent active license
  const activeLicense = licenses
    ?.filter((l) => l.status === "active")
    .sort((a, b) => {
      // Prioritize licenses with sentAt first
      if (a.sentAt && !b.sentAt) return -1;
      if (!a.sentAt && b.sentAt) return 1;
      if (a.sentAt && b.sentAt) {
        return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime();
      }
      return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    })[0];

  const isLicenseKeyVisible = () => {
    if (!activeLicense?.sentAt) return false;
    const sentTime = new Date(activeLicense.sentAt).getTime();
    const expiryTime = sentTime + 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() < expiryTime;
  };

  const getCountdownTime = () => {
    if (!activeLicense?.sentAt) return "";
    const sentTime = new Date(activeLicense.sentAt).getTime();
    const expiryTime = sentTime + 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (now >= expiryTime) return "Expired";
    
    const remaining = expiryTime - now;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (!isLicenseKeyVisible()) {
      setCountdown("");
      return;
    }

    const interval = setInterval(() => {
      setCountdown(getCountdownTime());
    }, 1000);

    setCountdown(getCountdownTime());
    return () => clearInterval(interval);
  }, [activeLicense?.sentAt]);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "pro":
        return Crown;
      case "enterprise":
        return Shield;
      default:
        return Sparkles;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro":
        return "text-yellow-500";
      case "enterprise":
        return "text-purple-500";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-welcome">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your licenses, downloads, and account settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* License Status */}
            <Card data-testid="card-license-status">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
                <CardTitle className="text-lg">License Status</CardTitle>
                {activeLicense && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {licensesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : activeLicense ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const PlanIcon = getPlanIcon(activeLicense.plan);
                        return (
                          <div className={`p-2 rounded-lg bg-muted ${getPlanColor(activeLicense.plan)}`}>
                            <PlanIcon className="h-6 w-6" />
                          </div>
                        );
                      })()}
                      <div>
                        <p className="font-semibold capitalize">
                          {activeLicense.plan} Edition
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Lifetime License
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Key className="h-4 w-4" />
                          License Key
                        </div>
                        {isLicenseKeyVisible() ? (
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm flex-1 break-all">
                              {activeLicense.licenseKey}
                            </p>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(activeLicense.licenseKey);
                                setCopied(true);
                                toast({ title: "License key copied!" });
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              data-testid="button-copy-license-key"
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <p className="font-mono text-sm text-muted-foreground">
                            Key expired
                          </p>
                        )}
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          {isLicenseKeyVisible() ? (
                            <>
                              <Clock className="h-4 w-4" />
                              Expires in
                            </>
                          ) : (
                            <>
                              <Monitor className="h-4 w-4" />
                              Status
                            </>
                          )}
                        </div>
                        <p className="font-semibold text-sm">
                          {isLicenseKeyVisible() ? countdown : "Expired"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-flex p-4 rounded-full bg-muted mb-4">
                      <Key className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">No Active License</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchase a license to unlock all features
                    </p>
                    <Link href="/purchase">
                      <Button data-testid="button-get-license">
                        Get a License
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Downloads Section */}
            <Card data-testid="card-downloads">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeLicense ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {downloadLinks.map((platform) => {
                      const handleDownload = () => {
                        if (!platform.available) {
                          toast({ 
                            title: "Coming Soon", 
                            description: `${platform.name} version is coming soon!` 
                          });
                          return;
                        }
                        if (platform.name === "macOS") {
                          const downloadUrl = activeLicense.plan === "pro" 
                            ? "/api/download/macos-pro" 
                            : "/api/download/macos-personal";
                          window.location.href = downloadUrl;
                        }
                      };
                      return (
                        <Button
                          key={platform.name}
                          variant="outline"
                          className="justify-start h-auto py-3"
                          onClick={handleDownload}
                          data-testid={`button-download-${platform.name.toLowerCase()}`}
                        >
                          <platform.icon className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platform.available ? platform.size : "Coming Soon"}
                            </p>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Purchase a license to access downloads</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/purchase" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-upgrade">
                    <Crown className="h-4 w-4 mr-2" />
                    Get License
                  </Button>
                </Link>
                <Link href="/community" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-community">
                    <Shield className="h-4 w-4 mr-2" />
                    Community
                  </Button>
                </Link>
                <Link href="/contact" className="block">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card data-testid="card-account-info">
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Free License Requests */}
            <Card data-testid="card-free-license-request">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Request Free License</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Request a free license for Personal or Pro edition. Admins will review your request.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      apiRequest("POST", "/api/licenses/free-request", { requestedPlan: "personal" }).then(() => {
                        toast({ title: "License request submitted!" });
                        queryClient.invalidateQueries({ queryKey: ["/api/licenses/free-requests"] });
                      }).catch((err) => {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      });
                    }}
                    data-testid="button-request-personal-license"
                  >
                    Request Personal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      apiRequest("POST", "/api/licenses/free-request", { requestedPlan: "pro" }).then(() => {
                        toast({ title: "License request submitted!" });
                        queryClient.invalidateQueries({ queryKey: ["/api/licenses/free-requests"] });
                      }).catch((err) => {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      });
                    }}
                    data-testid="button-request-pro-license"
                  >
                    Request Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Device Registration */}
            <Card data-testid="card-device-ids">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Register Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Add a new device to your account and notify admins.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Device ID <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Enter unique device identifier"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      data-testid="input-device-id"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Device Name <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      placeholder="e.g., My Laptop, Office PC"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      data-testid="input-device-name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Device Type <span className="text-destructive">*</span>
                    </label>
                    <Select value={deviceType} onValueChange={setDeviceType}>
                      <SelectTrigger data-testid="select-device-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="windows">Windows</SelectItem>
                        <SelectItem value="mac">macOS</SelectItem>
                        <SelectItem value="linux">Linux</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => {
                      if (!deviceId.trim()) {
                        toast({ title: "Device ID is required", variant: "destructive" });
                        return;
                      }
                      setRegistering(true);
                      apiRequest("POST", "/api/devices", { 
                        deviceId: deviceId.trim(), 
                        deviceName: deviceName.trim() || undefined,
                        deviceType
                      }).then(() => {
                        toast({ title: "Device registered!", description: "Admins have been notified." });
                        setDeviceId("");
                        setDeviceName("");
                        setDeviceType("windows");
                        queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
                      }).catch((err) => {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      }).finally(() => {
                        setRegistering(false);
                      });
                    }}
                    disabled={registering}
                    className="w-full"
                    data-testid="button-register-device"
                  >
                    {registering ? "Registering..." : "Register Device"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card className="bg-primary/5 border-primary/20" data-testid="card-security-tips">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Security Tips</p>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Use a strong, unique master password
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Enable local backup recovery key
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Keep QSecureX updated
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
