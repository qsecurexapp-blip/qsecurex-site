import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Lock,
  Server,
  Wifi,
  WifiOff,
  Download,
  Key,
  FolderLock,
  Zap,
  MessageSquareLock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
  Newspaper,
  Briefcase,
  Building2,
  Monitor,
} from "lucide-react";
import heroImage from "@assets/gwag_1764444804643.png";
import securityDashboardImage from "@assets/phhh_1764586606748.png";
import dashboardAppImage from "@assets/phhh_1764586606748.png";

const stats = [
  { label: "Privacy", value: "100% Offline", icon: WifiOff },
  { label: "Security", value: "AES-256", icon: Lock },
  { label: "Tracking", value: "Zero", icon: EyeOff },
  { label: "Data Breaches", value: "0", icon: Shield },
];

const cloudComparison = {
  cloud: [
    "Vulnerable to server-side hacks",
    "Data mined for advertising",
    "Requires internet to access files",
    "Monthly subscription fees",
  ],
  qsecurex: [
    "Offline, device-only encryption",
    "User-controlled key derivation",
    "Access files directly on your device",
    "One-time payment, lifetime license",
  ],
};

const messagingFeatures = [
  { label: "AES-256-GCM", icon: Lock },
  { label: "No Metadata", icon: EyeOff },
  { label: "Audit Trail", icon: Eye },
  { label: "Self-Destruct", icon: Zap },
];

const perfectFor = [
  { title: "Journalists", desc: "Protect sources & intel", icon: Newspaper },
  { title: "Legal Pros", desc: "Client-Attorney privilege", icon: Briefcase },
  { title: "Executives", desc: "Trade secrets & IP", icon: Building2 },
];

const steps = [
  {
    step: 1,
    title: "Download & Install",
    desc: "Get the lightweight app for your device. No email or login required.",
    icon: Download,
  },
  {
    step: 2,
    title: "Create Master Key",
    desc: "Set a strong PIN or Password. This key never leaves your device.",
    icon: Key,
  },
  {
    step: 3,
    title: "Secure Your World",
    desc: "Drag & drop files to encrypt instantly. Messaging is ready to go.",
    icon: FolderLock,
  },
];

const testimonials = [
  {
    name: "Sarah J.",
    role: "Freelance Photographer",
    quote:
      "Finally, an app that doesn't ask for my email or upload my photos to some random server. Pure peace of mind.",
    rating: 5,
  },
  {
    name: "Michael R.",
    role: "Corporate Attorney",
    quote:
      "The secure messaging feature allows me to send sensitive legal documents to clients without fear of interception.",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Cybersecurity Analyst",
    quote:
      "Simple, fast, and actually offline. I audited the network traffic and it sends zero bytes out. Legit.",
    rating: 5,
  },
];

const faqs = [
  {
    question: "Is internet required to use QSecureX?",
    answer:
      "No. QSecureX is an offline-first vault. Internet is only required for the initial download and optional updates. Your data never leaves your device.",
  },
  {
    question: "What happens if I forget my PIN?",
    answer:
      "Since we use zero-knowledge encryption, we cannot recover your PIN. However, if you enabled the local recovery key option during setup, you can use that to reset access.",
  },
  {
    question: "Does it work on Mac and Windows?",
    answer:
      "Yes, the Pro plan includes licenses for both Android mobile devices and Desktop environments (Windows/Mac/Linux).",
  },
  {
    question: "Is the payment recurring?",
    answer:
      "No. All our standard plans are one-time purchases for a lifetime license. No subscriptions.",
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section with Grid Background */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-background grid-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 text-sm px-4 py-1.5 bg-primary/20 border-primary/40 text-primary" data-testid="badge-hero">
                Offline Encryption Software (2025)
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-tight text-foreground">
                Your Data.{" "}
                <span className="gradient-text-animated">Under Your Control.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Military-grade encryption performed locally on your device — no servers involved.
              </p>
              <p className="text-lg font-semibold text-primary mb-10 max-w-2xl mx-auto lg:mx-0">
                No Cloud. No Tracking. Just Privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/premium">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" data-testid="button-download-hero">
                    <Download className="mr-2 h-5 w-5" />
                    Download Now
                  </Button>
                </Link>
                <Link href="/premium">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-muted-foreground/30" data-testid="button-view-plans">
                    View Plans
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full">
                <img
                  src={heroImage}
                  alt="QSecureX Security Architecture"
                  className="relative w-full h-auto rounded-lg border border-primary/20 shadow-2xl"
                  data-testid="img-hero-architecture"
                />
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 lg:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card/30 border border-primary/10 backdrop-blur"
                data-testid={`stat-${stat.label.toLowerCase()}`}
              >
                <stat.icon className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold font-mono stat-glow mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Encryption Animation Section */}
      <section className="py-20 lg:py-32 bg-card grid-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Encryption Animation */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10 border border-primary/20" />
                <Lock className="h-24 w-24 text-primary encrypt-animation" data-testid="icon-encrypt-animation" />
                <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-primary particle" style={{ animationDelay: "0s" }} />
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 particle" style={{ animationDelay: "0.5s" }} />
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-primary particle" style={{ animationDelay: "1s" }} />
              </div>
            </div>
            
            {/* Encryption Text */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                <span className="gradient-text-animated">Real-Time Encryption</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Your files are encrypted instantly as you save them. Every byte is protected with AES-256-GCM encryption before being written to disk.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground">Automatic encryption on save</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground">Zero performance overhead</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground">Military-grade security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* File Encryption Animation Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* File Encryption Text */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Local File Encryption
              </h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Select any file and encrypt it instantly. Files are encrypted locally on your device using AES-256 before being written to disk.
              </p>
            </div>

            {/* File Lock Animation */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm h-64 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-primary/10 border border-primary/20" />
                <div className="flex flex-col items-center gap-4">
                  <FolderLock className="h-24 w-24 text-primary file-lock-animation" data-testid="icon-file-lock-animation" />
                  <div className="text-sm font-medium text-primary opacity-0 animate-pulse">
                    Encrypting...
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Go Offline Section */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-section-title">
              Why Go Offline?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cloud storage is convenient, but it's not private. Your data is scanned,
              indexed, and often sold. QSecureX brings privacy back to your device.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Cloud */}
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Server className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold">Traditional Cloud</h3>
                </div>
                <ul className="space-y-4">
                  {cloudComparison.cloud.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* QSecureX Vault */}
            <Card className="bg-primary/5 border-primary/20 glow-primary-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Local Encrypted Container</h3>
                </div>
                <ul className="space-y-4">
                  {cloudComparison.qsecurex.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Secure Messaging Section */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary" data-testid="badge-new-feature">
                New Feature
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Encrypted Message Transfer (Optional)
              </h2>
              <p className="text-xl text-muted-foreground mb-2">
                Confidential comms. No metadata.
              </p>
              <p className="text-muted-foreground mb-8">
                Share encrypted content using a local, peer-to-peer transfer method. 
                Messages are encrypted locally and never stored on servers.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {messagingFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex flex-col items-center p-4 rounded-lg bg-background border border-border"
                  >
                    <feature.icon className="h-6 w-6 text-primary mb-2" />
                    <span className="text-xs font-medium text-center">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium mb-4 text-muted-foreground">
                  Perfect For:
                </p>
                <div className="flex flex-wrap gap-3">
                  {perfectFor.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                    >
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Card className="w-full max-w-sm bg-background/50 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MessageSquareLock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 bg-primary/10 rounded-lg rounded-tl-none p-3">
                        <p className="text-sm">
                          Sending encrypted document...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AES-256-GCM Encrypted
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="p-2 rounded-full bg-muted">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 bg-muted rounded-lg rounded-tr-none p-3">
                        <p className="text-sm">Document received securely</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Self-destructs in 24h
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Security Steps */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Security in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <Card key={step.step} className="relative hover-elevate">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 rounded-2xl bg-primary/10">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by Privacy Advocates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview for Logged-in Users */}
      {user && (
        <section className="py-20 lg:py-32 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Welcome, {user.name}!
              </h2>
              <p className="text-lg text-muted-foreground">
                Access your dashboard to manage licenses and devices
              </p>
            </div>
            
            <div className="mb-12 rounded-lg overflow-hidden border border-primary/20">
              <img 
                src={dashboardAppImage} 
                alt="QSecureX Dashboard" 
                className="w-full h-auto"
                data-testid="img-dashboard-preview"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Your Licenses</h3>
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    View and manage your active licenses with remaining device slots and expiry information.
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full glow-primary">
                      View Licenses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Registered Devices</h3>
                    <Monitor className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Register new devices, track active installations, and manage security settings.
                  </p>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Manage Devices
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 lg:py-32 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to reclaim your privacy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who use QSecureX to encrypt sensitive data on their own devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto glow-primary" data-testid="button-cta-register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-cta-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Licenses are a one-time purchase with lifetime access.
          </p>
        </div>
      </section>
    </div>
  );
}
