import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Shield,
  Lock,
  CloudOff,
  Zap,
  FolderClosed,
  Smartphone,
  Eye,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "Strong Encryption",
    description:
      "Your files are protected with AES-256 encryption. Virtually impossible to crack.",
    icon: Lock,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "No Cloud Uploads",
    description:
      "We never store or access your files. Everything stays strictly on your local device.",
    icon: CloudOff,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Fast Performance",
    description:
      "Optimized engine for smooth file handling and instant locking/unlocking capabilities.",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Smart Organization",
    description:
      "Create custom folders, manage files, and hide any sensitive content seamlessly.",
    icon: FolderClosed,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Instant Panic Lock",
    description:
      "Close the app or flip your phone and it instantly re-locks to protect your data.",
    icon: Smartphone,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Privacy First",
    description:
      "No login required, no ads, no tracking scripts — complete freedom and privacy.",
    icon: Eye,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-features-title">
              Powerful Security, Simplified
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to keep your digital life secure and private.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="group hover-elevate"
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="pt-6">
                  <div
                    className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Technical Specifications
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with industry-standard cryptographic algorithms
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Encryption</p>
                <p className="text-lg font-mono font-bold text-primary">
                  AES-256-GCM
                </p>
                <p className="text-xs text-muted-foreground mt-1">FIPS 197</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Hashing</p>
                <p className="text-lg font-mono font-bold text-primary">
                  SHA-256
                </p>
                <p className="text-xs text-muted-foreground mt-1">FIPS 180-4</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Derivation</p>
                <p className="text-lg font-mono font-bold text-primary">HKDF</p>
                <p className="text-xs text-muted-foreground mt-1">RFC 5869</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">Platforms</p>
                <p className="text-lg font-mono font-bold text-primary">
                  All Major
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Win/Mac/Linux/Android
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to secure your data?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Download QSecureX today and take control of your privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/download">
              <Button size="lg" className="w-full sm:w-auto glow-primary" data-testid="button-download-features">
                Download Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-pricing-features">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
