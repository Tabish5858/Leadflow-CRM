import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

/**
 * Proxies files from Cloudinary through our server, stripping restrictive
 * headers (X-Frame-Options, Content-Disposition) that block iframe embedding.
 *
 * For authenticated (blocked) assets, generates a signed Cloudinary URL
 * using the API secret before fetching.
 *
 * Usage: GET /api/deliverables/proxy-file?url=<encoded-cloudinary-url>
 */
export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
    }

    const targetUrl = decodeURIComponent(urlParam);

    // Validate it's a Cloudinary URL (security: prevent open proxy)
    if (!targetUrl.includes("res.cloudinary.com")) {
      return NextResponse.json({ error: "Only Cloudinary URLs are allowed" }, { status: 400 });
    }

    // Try fetching the public URL first
    let response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(30000),
    });

    // If 401, the asset is authenticated — try a signed URL
    if (response.status === 401) {
      const signedUrl = generateSignedCloudinaryUrl(targetUrl);
      if (signedUrl) {
        response = await fetch(signedUrl, {
          signal: AbortSignal.timeout(30000),
        });
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the file data and content type
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();

    // Return with permissive headers (no X-Frame-Options, no Content-Disposition)
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Frame-Options": "ALLOWALL",
        "Content-Disposition": "inline",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy file error:", error);
    return NextResponse.json({ error: "Failed to proxy file" }, { status: 500 });
  }
}

/**
 * Generates a signed Cloudinary URL from a public Cloudinary URL.
 *
 * URL format: https://res.cloudinary.com/<cloud>/<resource>/<type>/v<version>/<publicId>.<ext>
 *
 * Returns the signed URL string, or null if the URL can't be parsed.
 */
function generateSignedCloudinaryUrl(publicUrl: string): string | null {
  // Parse Cloudinary URL components
  const regex = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/([^/]+)\/([^/]+)\/v(\d+)\/(.+)\.([a-zA-Z0-9]+)$/;
  const match = publicUrl.match(regex);

  if (!match) {
    console.warn("Could not parse Cloudinary URL for signing:", publicUrl);
    return null;
  }

  const [, cloudName, resourceType, type, version, publicId, format] = match;

  try {
    // Generate a signed URL using the Cloudinary SDK
    const signedUrl = cloudinary.url(publicId, {
      cloud_name: cloudName,
      resource_type: resourceType,
      type: type as "upload" | "authenticated" | "private" | "fetch",
      sign_url: true,
      version: parseInt(version, 10),
      format,
      secure: true,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed Cloudinary URL:", error);
    return null;
  }
}
