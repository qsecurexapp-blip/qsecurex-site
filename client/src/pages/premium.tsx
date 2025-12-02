import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Sparkles, Building2, Plus, ArrowRight, Download, Apple, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

const plans = [
  {
    name: "Free Download",
    price: 0,
    originalPrice: 0,
    popular: false,
    features: [
      "macOS only (Big Sur 11+)",
      "Limited to 20 downloads total",
      "One download per account",
      "Free license key generated",
      "Full features included",
      "Community support",
    ],
    icon: Download,
    ctaText: "Download Now",
    plan: "free",
    isFree: true,
  },
  {
    name: "Personal Edition",
    price: 1999,
    originalPrice: 3499,
    popular: false,
    features: [
      "Offline AES-256 encrypted vault",
      "Vault storage up to 500 MB",
      "Secure file encryption & decryption",
      "PIN/Password protection",
      "Single device license",
      "Lifetime updates",
    ],
    icon: Sparkles,
    ctaText: "Get Personal",
    plan: "personal",
  },
  {
    name: "Pro Edition",
    price: 4999,
    originalPrice: 9999,
    popular: true,
    features: [
      "Everything in Personal",
      "Unlimited vault size",
      "Secure end-to-end encrypted messaging",
      "Multi-device support (up to 3)",
      "Desktop + Mobile licenses",
      "Priority support",
      "Advanced file organization",
    ],
    icon: Crown,
    ctaText: "Get Pro",
    plan: "pro",
  },
  {
    name: "Enterprise Edition",
    price: 0,
    originalPrice: 0,
    popular: false,
    features: [
      "Bulk licensing & volume discounts",
      "Dedicated account manager",
      "Custom branding & white-label",
      "Team deployment tools",
      "Admin console access",
      "SLA & priority support",
      "Custom feature development",
    ],
    icon: Building2,
    ctaText: "Contact Sales",
    plan: "enterprise",
  },
];

const addons = [
  {
    name: "Additional Device License",
    price: 1999,
    description: "Add one extra device activation key",
  },
  {
    name: "Custom Feature Module",
    price: 19999,
    priceLabel: "Starting at",
    description: "Custom features built only for you",
  },
  {
    name: "Offline Backup Setup Support",
    price: 5999,
    description: "1-on-1 remote setup for secure offline backups",
  },
];

export default function PremiumPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-pricing-title">
              Choose Your Shield
            </h1>
            <p className="text-xl text-muted-foreground">
              Select the perfect plan for your security needs.{" "}
              <span className="text-foreground font-medium">
                One-time payment, lifetime access.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Free Download Alert */}
      <section className="py-8 bg-card/50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 max-w-2xl">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="font-medium">Free macOS Download Available</p>
              <p className="text-sm text-muted-foreground">Only 20 free downloads available. One download per account. All features included.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary glow-primary-sm scale-105 z-10"
                    : plan.isFree ? "border-orange-500/50 bg-orange-500/5" : ""
                }`}
                data-testid={`card-plan-${plan.plan}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                {plan.isFree && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">
                    Limited Time
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        plan.popular ? "bg-primary/20" : plan.isFree ? "bg-orange-500/20" : "bg-muted"
                      }`}
                    >
                      <plan.icon
                        className={`h-8 w-8 ${
                          plan.popular ? "text-primary" : plan.isFree ? "text-orange-500" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {plan.isFree ? (
                      <div className="text-4xl font-bold text-orange-500">Free</div>
                    ) : plan.price > 0 ? (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold">
                            ₹{plan.price.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="line-through">
                            ₹{plan.originalPrice.toLocaleString()}
                          </span>{" "}
                          <span className="text-primary font-medium">
                            Save{" "}
                            {Math.round(
                              ((plan.originalPrice - plan.price) /
                                plan.originalPrice) *
                                100
                            )}
                            %
                          </span>
                        </p>
                      </>
                    ) : (
                      <div className="text-4xl font-bold">Custom</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  {plan.isFree ? (
                    user ? (
                      <Link href="/download" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-orange-500/50 text-orange-600 dark:text-orange-400"
                          data-testid={`button-plan-${plan.plan}`}
                        >
                          {plan.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/register" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full border-orange-500/50 text-orange-600 dark:text-orange-400"
                          data-testid={`button-plan-${plan.plan}`}
                        >
                          {plan.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )
                  ) : plan.plan === "enterprise" ? (
                    <Link href="/contact" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full"
                        data-testid={`button-plan-${plan.plan}`}
                      >
                        {plan.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : user ? (
                    <Link href="/purchase" className="w-full">
                      <Button
                        className={`w-full ${plan.popular ? "glow-primary" : ""}`}
                        variant={plan.popular ? "default" : "secondary"}
                        data-testid={`button-plan-${plan.plan}`}
                      >
                        {plan.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register" className="w-full">
                      <Button
                        className={`w-full ${plan.popular ? "glow-primary" : ""}`}
                        variant={plan.popular ? "default" : "secondary"}
                        data-testid={`button-plan-${plan.plan}`}
                      >
                        {plan.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Optional Add-ons
            </h2>
            <p className="text-muted-foreground">
              Enhance your QSecureX experience with these extras
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {addons.map((addon, index) => (
              <Card key={addon.name} className="hover-elevate" data-testid={`card-addon-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{addon.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {addon.description}
                  </p>
                  <p className="text-lg font-bold">
                    {addon.priceLabel && (
                      <span className="text-sm font-normal text-muted-foreground mr-1">
                        {addon.priceLabel}
                      </span>
                    )}
                    ₹{addon.price.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not satisfied? Get a full refund within 30 days of purchase, no
            questions asked. We're confident you'll love QSecureX.
          </p>
        </div>
      </section>
    </div>
  );
}
