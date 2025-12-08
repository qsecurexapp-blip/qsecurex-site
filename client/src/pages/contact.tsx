import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Globe, Building2, Send } from "lucide-react";

const contactMethods = [
  {
    title: "Email Support",
    description: "For general inquiries and technical help.",
    value: "qsecurexapp@gmail.com",
    icon: Mail,
    href: "mailto:qsecurexapp@gmail.com",
  },
  {
    title: "Online Portal",
    description: "Visit our support center for FAQs and guides.",
    value: "Documentation",
    icon: Globe,
    href: "/features",
  },
  {
    title: "Enterprise",
    description: "For volume licensing and custom features.",
    value: "qsecurexapp@gmail.com",
    icon: Building2,
    href: "mailto:qsecurexapp@gmail.com?subject=Enterprise%20Inquiry",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-contact-title">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions, feedback, or need support? Reach out to us anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="block"
                data-testid={`link-contact-${method.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="pt-6">
                    <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                      <method.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    <p className="text-sm text-primary font-medium">{method.value}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action="https://formsubmit.co/qsecurexapp@gmail.com"
                method="POST"
                className="space-y-6"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    data-testid="input-contact-name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <Textarea
                    name="message"
                    placeholder="How can we help you?"
                    className="min-h-[150px] resize-none"
                    required
                    data-testid="textarea-contact-message"
                  />
                </div>

                {/* FormSubmit hidden inputs */}
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value={`${window.location.origin}/contact?success=true`} />
                <input type="hidden" name="_subject" value="New QSecureX Contact Form Submission" />

                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-submit-contact"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
