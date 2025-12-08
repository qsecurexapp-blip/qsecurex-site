import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Shield, ArrowLeft, Check, Crown, Zap, Building2, Download, Lock, Sparkles, Apple, Copy, Smartphone, Monitor, ClipboardCheck, Key, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "personal",
    name: "Personal",
    price: 1999,
    originalPrice: 3499,
    devices: 1,
    icon: Shield,
    color: "primary",
    features: [
      "1 Device License",
      "500 MB vault storage",
      "AES-256 encryption",
      "24 Hours audit logs",
      "Email support",
      "Lifetime updates",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 4999,
    originalPrice: 9999,
    devices: 3,
    icon: Crown,
    color: "amber",
    popular: true,
    features: [
      "3 Device Licenses",
      "Unlimited vault storage",
      "AES-256 encryption",
      "Secure Notes (Unlimited)",
      "Tamper Alerts included",
      "Secure Messaging included",
      "Full History audit logs",
      "Priority support",
    ],
  },
];

export default function PurchasePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    plan: string;
    licenseKey: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: licensesData, refetch: refetchLicenses } = useQuery<any[]>({
    queryKey: ["/api/licenses"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  const hasLicense = (planId: string) => {
    return licensesData?.some(l => l.plan === planId && l.status === "active") ?? false;
  };

  const handlePayment = async (plan: typeof plans[0]) => {
    if (hasLicense(plan.id)) {
      toast({
        title: "Already Owned",
        description: `You already have an active ${plan.name} license.`,
      });
      return;
    }

    setLoading(plan.id);
    try {
      // Get Razorpay key
      const keyResponse = await fetch("/api/payment/key");
      if (!keyResponse.ok) {
        const error = await keyResponse.json();
        throw new Error(error.error || "Payment service not available");
      }
      const { key } = await keyResponse.json();

      // Create order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to create order");
      }

      const order = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "QSecureX",
        description: `${plan.name} Edition - Lifetime License`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.id,
              }),
            });

            const result = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(result.error || "Payment verification failed");
            }

            toast({
              title: "Payment Successful!",
              description: `Your ${plan.name} license is now active.`,
            });

            // Set purchase success state to show download and tutorial
            setPurchaseSuccess({
              plan: plan.id,
              licenseKey: result.license?.licenseKey || "",
            });
            setLoading(null);
            refetchLicenses();
          } catch (error: any) {
            toast({
              title: "Verification Error",
              description: error.message,
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user?.email || "",
          name: user?.name || "",
        },
        theme: {
          color: "#22c55e",
        },
        modal: {
          ondismiss: () => {
            setLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Payment was not completed",
          variant: "destructive",
        });
        setLoading(null);
      });
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  if (!user) return null;

  // Show success screen with download and tutorial after purchase
  if (purchaseSuccess) {
    const downloadUrl = purchaseSuccess.plan === "pro" 
      ? "/api/download/macos-pro" 
      : "/api/download/macos-personal";
    
    const planName = purchaseSuccess.plan === "pro" ? "Pro" : "Personal";

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Payment <span className="text-primary">Successful!</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your {planName} Edition license is now active
            </p>
          </div>

          {/* Download Section */}
          <Card className="mb-8 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-amber-500" />
                Step 1: Download QSecureX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Download and install QSecureX on your device
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => window.open(downloadUrl, "_blank")}
              >
                <Apple className="h-5 w-5 mr-2" />
                Download for macOS
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Windows, Linux, and Android versions coming soon
              </p>
            </CardContent>
          </Card>

          {/* Tutorial Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Step 2: Activate Your App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Open the App & Copy Device ID</h4>
                    <p className="text-sm text-muted-foreground">
                      Open QSecureX on your device. You'll see your unique Device ID on the activation screen. Copy this ID.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Register Your Device</h4>
                    <p className="text-sm text-muted-foreground">
                      Go to your <span className="text-primary cursor-pointer underline underline-offset-2" onClick={() => setLocation("/dashboard")}>Dashboard</span>, find the "Register Device" section. Paste your Device ID, enter a device name (e.g., "My MacBook"), and select the device type.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Click Register & Wait</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the "Register Device" button and wait for the verification process to complete. Our team will verify your device.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Get Your Verification Key</h4>
                    <p className="text-sm text-muted-foreground">
                      After verification is complete, you'll receive a verification key. This will be visible in your dashboard.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Activate the App</h4>
                    <p className="text-sm text-muted-foreground">
                      Copy your license key and paste it into the app's activation screen. Click activate and you're done! Your app is now fully functional.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/dashboard")}
            >
              <Monitor className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setPurchaseSuccess(null)}
            >
              Purchase Another License
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/download")}
          className="mb-8"
          disabled={!!loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Downloads
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Choose Your <span className="text-primary">License</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            One-time payment. Lifetime access. No subscriptions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isOwned = hasLicense(plan.id);
            const isLoading = loading === plan.id;
            const isPro = plan.id === "pro";

            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all duration-300 ${
                  isPro 
                    ? "border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-transparent" 
                    : "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                } ${isOwned ? "opacity-75" : "hover:border-primary"}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-amber-500 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 ${
                  isPro ? "bg-amber-500" : "bg-primary"
                }`} />

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-xl ${
                      isPro 
                        ? "bg-amber-500/10 border border-amber-500/20" 
                        : "bg-primary/10 border border-primary/20"
                    }`}>
                      <Icon className={`h-6 w-6 ${isPro ? "text-amber-500" : "text-primary"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.devices} Device{plan.devices > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">₹{plan.price.toLocaleString()}</span>
                    <span className="text-lg text-muted-foreground line-through">₹{plan.originalPrice.toLocaleString()}</span>
                    <Badge variant="secondary" className="ml-2">
                      {Math.round((1 - plan.price / plan.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <Check className={`h-4 w-4 ${isPro ? "text-amber-500" : "text-primary"}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isOwned ? (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/10 text-primary">
                      <Check className="h-5 w-5" />
                      <span className="font-semibold">License Active</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handlePayment(plan)}
                      disabled={!!loading}
                      className={`w-full h-12 text-base font-semibold ${
                        isPro ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
                      }`}
                      size="lg"
                    >
                      {isLoading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Purchase {plan.name}
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <Card className="mt-8 max-w-4xl mx-auto bg-muted/30 border-muted-foreground/10">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">Need more than 5 devices? Contact us for custom pricing.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setLocation("/contact")}>
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <Card className="mt-6 max-w-4xl mx-auto bg-blue-500/5 border-blue-500/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Secure Payment:</strong> All transactions are processed securely through Razorpay with bank-grade encryption. 
                  Your license key will be instantly available after successful payment and will also be sent to your email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
