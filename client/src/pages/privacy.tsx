import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle } from "lucide-react";

const shortVersion = [
  "We do not collect your personal data",
  "We do not access your files",
  "We do not store keys or passwords",
  "We do not track your usage",
  "Your data never leaves your device",
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-privacy-title">
              Privacy Policy
            </h1>
            <Badge variant="secondary">Effective Date: November 25, 2025</Badge>
          </div>
        </div>
      </section>

      {/* Short Version */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <h2 className="text-xl font-semibold mb-4 text-center">
                The Short Version
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {shortVersion.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Full Content */}
      <section className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8 prose prose-neutral dark:prose-invert max-w-none">
              <h2>Our Commitment</h2>
              <p>
                Our business model is not based on collecting or selling your data.
                We sell software, not users. This privacy policy explains our
                commitment to your privacy in clear, simple terms.
              </p>

              <h2>Data Collection</h2>
              <p>
                <strong>QSecureX does not collect any personal data.</strong> The
                application operates entirely offline and does not transmit any
                information to our servers or any third party.
              </p>
              <p>We do not collect:</p>
              <ul>
                <li>Personal identification information</li>
                <li>Usage statistics or analytics</li>
                <li>Device identifiers or fingerprints</li>
                <li>Location data</li>
                <li>Any content you store in the vault</li>
              </ul>

              <h2>Data Storage</h2>
              <p>
                All data is stored <strong>locally</strong> on your device's hard
                drive within an encrypted vault container. Your files, passwords, and
                encryption keys never leave your device.
              </p>
              <p>
                The encryption key is derived from your master passphrase using
                industry-standard key derivation functions. We do not have access to
                your passphrase and cannot recover it if lost.
              </p>

              <h2>Third-Party Sharing</h2>
              <p>
                We do not share your data with third parties because we do not
                collect any data to share. This includes:
              </p>
              <ul>
                <li>No advertising networks</li>
                <li>No analytics providers</li>
                <li>No data brokers</li>
                <li>No government agencies (unless legally compelled, but we have no data to provide)</li>
              </ul>

              <h2>Website and Purchase Data</h2>
              <p>
                When you purchase a license through our website, we collect only the
                minimum information necessary to process your transaction:
              </p>
              <ul>
                <li>Email address (for license delivery and support)</li>
                <li>Payment information (processed by our payment provider)</li>
              </ul>
              <p>
                This information is stored securely and is never sold or shared with
                third parties for marketing purposes.
              </p>

              <h2>Cookies and Tracking</h2>
              <p>
                Our website uses only essential cookies required for basic
                functionality. We do not use:
              </p>
              <ul>
                <li>Third-party tracking cookies</li>
                <li>Analytics tracking scripts</li>
                <li>Social media tracking pixels</li>
                <li>Advertising cookies</li>
              </ul>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Request deletion of any account data we hold</li>
                <li>Access any information we have about you</li>
                <li>Opt out of marketing communications</li>
              </ul>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will
                be posted on this page with an updated effective date.
              </p>

              <h2>Contact</h2>
              <p>
                For privacy-related questions, please contact us at{" "}
                <a href="mailto:qsecurexapp@gmail.com" className="text-primary">
                  qsecurexapp@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
