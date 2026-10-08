import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Digital Asset Links — proves purposejour.netlify.app belongs to the Android
// wrapper app (Trusted Web Activity), hiding the browser bar for a native feel.
// The SHA-256 fingerprint comes from YOUR signing key (public, safe to share in
// chat). Bubblewrap prints it during `init`; paste it below and redeploy BEFORE
// installing the APK so verification passes on first launch.
const PACKAGE = "com.herpurpose.app";
// Fingerprint of her-purpose-release.keystore (public; generated 2026-10-08).
const SHA256_FINGERPRINT = "08:1D:DA:69:5B:11:3C:09:E9:90:C6:5B:56:55:93:92:37:76:F4:17:6A:6E:87:53:A4:77:93:0A:24:43:00:44";

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
