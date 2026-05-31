import { headers } from "next/headers";
import { getMeetingTypeBySlug } from "@/lib/firebase/server-admin";
import { BookingPageClient } from "@/app/b/[token]/booking-page-client";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SchedulePage({ params }: Props) {
  const { slug } = await params;

  const meetingType = await getMeetingTypeBySlug(slug);
  if (!meetingType) {
    notFound();
  }

  // Cloudflare sets cf-timezone based on the visitor's IP (handles VPN).
  // On localhost this header is absent, so the client falls back to Intl/IP API.
  const headersList = await headers();
  const cfTz = headersList.get("cf-timezone");

  return (
    <BookingPageClient
      token={meetingType.bookingToken}
      detectedTimezone={cfTz}
    />
  );
}
