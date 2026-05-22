import type { Metadata } from "next";
import Link from "next/link";

const supportEmail = "contact@tabishbinishfaq.dev";
const appName = "LeadFlow";
const updatedAt = "May 22, 2026";

export const metadata: Metadata = {
  title: "Terms of Service - LeadFlow",
  description: "Terms of service for LeadFlow.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 space-y-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to app
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <p>
          These Terms of Service govern your access to and use of {appName}. By
          using the service, you agree to these terms.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>You are responsible for keeping your account secure.</li>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for activity that occurs under your account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Do not use the service for unlawful, harmful, or abusive activity.</li>
            <li>Do not attempt to access or disrupt other accounts or systems.</li>
            <li>Do not upload malware or attempt to bypass security controls.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your content</h2>
          <p>
            You retain ownership of the data you upload. You grant us a license
            to host and process that data solely to provide the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Third-party services</h2>
          <p>
            The service may integrate with third-party services. Their terms and
            privacy policies apply to your use of those services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Termination</h2>
          <p>
            We may suspend or terminate access if you violate these terms or if
            required by law. You can stop using the service at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Disclaimers</h2>
          <p>
            The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis
            without warranties of any kind. To the extent permitted by law, we
            are not liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes means you accept the updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a
              className="text-primary hover:underline"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
