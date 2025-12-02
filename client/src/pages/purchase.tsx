import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PurchasePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLocation("/register");
    }
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, [user, setLocation]);

  const plans = [
    { name: "Free Download", price: 0, plan: "free", devices: 0, isFree: true },
    { name: "Personal", price: 1999, plan: "personal", devices: 1 },
    { name: "Pro", price: 4999, plan: "pro", devices: 3 },
    { name: "Enterprise", price: 0, plan: "enterprise", devices: 0 },
  ];

  const handlePayment = async (plan: typeof plans[0]) => {
    if ((plan as any).isFree) {
      // Free download - redirect to download page
      window.location.href = "/download";
      return;
    }
    if (plan.price === 0) {
      // Contact sales for enterprise
      window.location.href = "/contact";
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.plan,
          amount: plan.price,
          maxDevices: plan.devices,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "",
        amount: order.amount * 100, // Razorpay uses paise
        currency: order.currency,
        name: "QSecureX",
        description: `${plan.name} License - Lifetime Access`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.orderId,
                paymentId: response.razorpay_payment_id,
                plan: plan.plan,
                userId: user?.id,
                amount: order.amount,
                maxDevices: plan.devices,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();
            toast({
              title: "Payment Successful!",
              description: `Your ${plan.name} license has been activated. License Key: ${result.license?.licenseKey}`,
            });

            // Redirect to dashboard
            setTimeout(() => setLocation("/dashboard"), 2000);
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
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your License</h1>
          <p className="text-muted-foreground">
            Select a plan and complete your purchase with Razorpay
          </p>
        </div>

        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.plan} className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}{!(plan as any).isFree && " Edition"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(plan as any).isFree ? "macOS only • Limited to 20 downloads" : `Lifetime license • ${plan.devices > 0 ? `${plan.devices} devices` : "Unlimited"}`}
                    </p>
                  </div>
                  <div className="text-right">
                    {(plan as any).isFree ? (
                      <p className="text-2xl font-bold text-orange-500">Free</p>
                    ) : plan.price > 0 ? (
                      <p className="text-2xl font-bold">₹{plan.price.toLocaleString()}</p>
                    ) : (
                      <p className="text-2xl font-bold">Contact Sales</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handlePayment(plan)}
                  className={`w-full ${(plan as any).isFree ? "border-orange-500/50 text-orange-600 dark:text-orange-400" : "glow-primary"}`}
                  variant={(plan as any).isFree ? "outline" : "default"}
                  size="lg"
                  disabled={loading}
                  data-testid={`button-purchase-${plan.plan}`}
                >
                  {loading ? "Processing..." : (plan as any).isFree ? "Download Free" : plan.price === 0 ? "Contact Sales" : "Purchase Now"}
                </Button>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Secure payment powered by Razorpay. Your license key will be immediately available after successful payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
