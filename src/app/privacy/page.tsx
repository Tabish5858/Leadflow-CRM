import type { Metadata } from "next";
import Link from "next/link";

const supportEmail = "contact@tabishbinishfaq.dev";
const appName = "LeadFlow";
const updatedAt = "May 22, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy - LeadFlow",
  description: "Privacy policy for LeadFlow.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10 space-y-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to app
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <p>
          This Privacy Policy explains how {appName} collects, uses, and shares
          information when you use our website and services.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Information we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Account information such as name, email address, and password.
            </li>
            <li>
              Workspace data you add, including leads, contacts, and notes.
            </li>
            <li>
              Usage data like pages viewed, features used, and basic device and
              browser information.
            </li>
            <li>
              Cookies or local storage used to keep you signed in and remember
              preferences.
            </li>
            <li>
              If you connect Google services, we access only the data required
              for the feature you enable (for example, calendar events for
              scheduling).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            How we use information
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide and improve the service.</li>
            <li>Authenticate users and secure accounts.</li>
            <li>Respond to support requests.</li>
            <li>Monitor usage to prevent abuse and diagnose issues.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            How we share information
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              With service providers that help us operate the app (hosting,
              analytics, email delivery).
            </li>
            <li>
              With your workspace members when you share records inside a
              workspace.
            </li>
            <li>
              To comply with legal obligations or protect the rights and safety
              of users.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Data retention</h2>
          <p>
            We keep your data for as long as your account is active or as needed
            to provide the service. You can request deletion by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect
            your information. No method of transmission or storage is 100%
            secure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Your choices</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Access or update your account details in the app settings.</li>
            <li>Request data deletion by contacting support.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact us</h2>
          <p>
            If you have questions about this policy, email us at{" "}
            <a
              className="text-primary hover:underline"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Changes</h2>
          <p>
            We may update this policy from time to time. We will post the updated
            version with a new effective date.
          </p>
        </section>
      </div>
    </div>
  );
}
