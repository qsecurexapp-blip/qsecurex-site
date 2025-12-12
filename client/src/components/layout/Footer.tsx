import { Link, useLocation } from "wouter";
import { Shield, Mail } from "lucide-react";
import logoImage from "@assets/app_icon_1024_1764268476863.png";
import { useAuth } from "@/lib/auth";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/premium" },
    { label: "Download", href: "/download" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setLocation("/login");
    } else {
      setLocation("/download");
    }
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="QSecureX" className="h-8 w-8" />
              <span className="text-lg font-bold">
                <span className="text-foreground">Q</span>
                <span className="text-primary">Secure</span>
                <span className="text-foreground">X</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Military-grade encryption that lives on your device. No Cloud. No Tracking. Just Privacy.
            </p>
            <div className="flex flex-col gap-4 text-sm text-muted-foreground">
              <a
                href="mailto:qsecurexapp@gmail.com"
                className="flex items-center gap-2 hover:text-primary transition-colors"
                data-testid="link-email"
              >
                <Mail className="h-4 w-4" />
                qsecurexapp@gmail.com
              </a>

              {/* Product Hunt Badge */}
              <a 
                href="https://www.producthunt.com/products/qsecurex?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-qsecurex" 
                target="_blank" 
                rel="noreferrer"
                className="mt-2 block"
              >
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1049222&theme=light&t=1765510913089" 
                  alt="QSecureX - Product Hunt" 
                  style={{ width: '250px', height: '54px' }} 
                  width="250" 
                  height="54" 
                />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  {link.label === "Download" ? (
                    <a
                      href="#"
                      onClick={handleDownloadClick}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QSecureX. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-primary" />
                100% Offline
              </span>
              <span>AES-256 Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
