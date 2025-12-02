import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Eye,
  CreditCard,
  Code,
  Heart,
} from "lucide-react";

const values = [
  {
    title: "Privacy First",
    description:
      "Your files never leave your device. No cloud storage, no analytics.",
    icon: Eye,
  },
  {
    title: "No Subscriptions",
    description: "Buy QSecureX once and own it forever. No hidden fees.",
    icon: CreditCard,
  },
  {
    title: "Security by Design",
    description: "Industry standard algorithms vetted by professionals.",
    icon: Shield,
  },
];

const techSpecs = [
  { label: "Encryption", value: "AES-256-GCM", standard: "FIPS 197" },
  { label: "Hashing", value: "SHA-256", standard: "FIPS 180-4" },
  { label: "Derivation", value: "HKDF", standard: "RFC 5869" },
  { label: "Platform Support", value: "macOS, Windows 10/11, Linux", standard: "" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6" variant="secondary">
              Our Mission
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-about-title">
              Building Security Software That{" "}
              <span className="gradient-text">Respects Your Privacy</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              QSecureX is an independent security vault application designed to
              give you complete control over your sensitive data—without
              subscriptions, cloud dependencies, or compromises.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Privacy Without Compromise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your data belongs to you, and only you. We built QSecureX on this
              fundamental principle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={value.title} className="text-center hover-elevate" data-testid={`card-value-${index}`}>
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">
                <Heart className="h-3 w-3 mr-1" />
                Our Story
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why We Built QSecureX
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  QSecureX was created by an independent developer who needed a
                  reliable, offline encryption solution that didn't compromise on
                  security or privacy.
                </p>
                <p>
                  After years of using cloud-based solutions and watching data
                  breaches make headlines, it became clear that the only truly
                  secure data is data that never leaves your device.
                </p>
                <p>
                  Designed for professionals, freelancers, and privacy-conscious
                  individuals who believe security is a fundamental right—not a
                  premium feature.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-background">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Independent Development</p>
                      <p className="text-sm text-muted-foreground">
                        No venture capital, no data harvesting
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-3xl font-bold text-primary">0</p>
                      <p className="text-sm text-muted-foreground">
                        Data Collected
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-3xl font-bold text-primary">100%</p>
                      <p className="text-sm text-muted-foreground">
                        Offline First
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Standards */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">
              <Lock className="h-3 w-3 mr-1" />
              Technical
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Proven Standards
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built on industry-standard cryptographic algorithms vetted by
              security professionals worldwide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {techSpecs.map((spec, index) => (
              <Card key={spec.label} className="text-center" data-testid={`card-spec-${index}`}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {spec.label}
                  </p>
                  <p className="text-lg font-mono font-bold text-primary">
                    {spec.value}
                  </p>
                  {spec.standard && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {spec.standard}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Transparent & Accessible
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Enterprise-grade security shouldn't require an enterprise budget.
            QSecureX brings professional-level protection to everyone through
            accessible pricing and honest, transparent practices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm py-1.5 px-4">
              No Hidden Collection
            </Badge>
            <Badge variant="secondary" className="text-sm py-1.5 px-4">
              Accessible Pricing
            </Badge>
            <Badge variant="secondary" className="text-sm py-1.5 px-4">
              Offline-First Architecture
            </Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
