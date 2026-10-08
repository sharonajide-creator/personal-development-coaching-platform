import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Digital Asset Links — proves purposejour.netlify.app belongs to the Android
// wrapper app (Trusted Web Activity), hiding the browser bar for a native feel.
// The SHA-256 fingerprint comes from YOUR signing key (public, safe to share in
// chat). Bubblewrap prints it during `init`; paste it below and redeploy BEFORE
// installing the APK so verification passes on first launch.
const PACKAGE = "com.herpurpose.app";
// Fingerprint of her-purpose-release.keystore (public; generated 2026-10-08).
const SHA256_FINGERPRINT = "2C:95:92:78:FC:E2:A8:1A:28:9C:13:4A:47:BF:21:D1:73:42:D6:7B:AA:70:6E:57:D7:2C:41:01:3C:64:15:B6";

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: { namespace: "android_app", package_name: PACKAGE, sha256_cert_fingerprints: [SHA256_FINGERPRINT] },
      },
    ],
    { headers: { "content-type": "application/json" } }
  );
}
