import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-card to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" data-testid="text-terms-title">
              Terms of Service
            </h1>
            <Badge variant="secondary">Effective Date: November 25, 2025</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-8 prose prose-neutral dark:prose-invert max-w-none">
              <h2>Introduction</h2>
              <p>
                QSecureX is a desktop security vault application. By using it, you
                agree to these Terms of Service. Please read them carefully before
                using our software.
              </p>

              <h2>License Grant</h2>
              <p>
                Upon purchase, QSecureX grants you a non-exclusive, non-transferable
                license to use the software according to your plan:
              </p>
              <ul>
                <li>
                  <strong>Personal Edition:</strong> Single device license for
                  personal use
                </li>
                <li>
                  <strong>Professional Edition:</strong> Multi-device license (up to
                  3 devices) for professional use
                </li>
                <li>
                  <strong>Enterprise Edition:</strong> Volume licensing with custom
                  terms negotiated per agreement
                </li>
              </ul>

              <h2>Payment Terms</h2>
              <p>
                All standard plans are one-time purchases with lifetime access. We
                offer a 30-day money-back guarantee on all purchases. Refund requests
                must be submitted within 30 days of purchase.
              </p>

              <h2>User Responsibilities</h2>
              <p>
                You are solely responsible for:
              </p>
              <ul>
                <li>
                  Maintaining the security of your master passphrase/PIN
                </li>
                <li>
                  Creating and maintaining backups of your encrypted data
                </li>
                <li>
                  Ensuring the security of devices where QSecureX is installed
                </li>
                <li>
                  Complying with all applicable laws regarding data protection
                </li>
              </ul>

              <h2>Data and Privacy</h2>
              <p>
                QSecureX operates entirely offline. We do not:
              </p>
              <ul>
                <li>Collect, store, or transmit your personal data</li>
                <li>Have access to your encrypted files or passphrases</li>
                <li>Track your usage or activities within the application</li>
              </ul>

              <h2>Warranty Disclaimer</h2>
              <p>
                THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. While
                we employ industry-standard encryption algorithms, we cannot guarantee
                absolute protection against all forms of unauthorized access. Users
                should implement additional security measures as appropriate for their
                needs.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL QSECUREX BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE
                LOSSES.
              </p>

              <h2>Updates and Modifications</h2>
              <p>
                We may update these Terms from time to time. Continued use of the
                software after changes constitutes acceptance of the new Terms. Major
                changes will be communicated through the application or via email if
                provided.
              </p>

              <h2>Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
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
