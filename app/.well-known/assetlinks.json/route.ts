import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Digital Asset Links — proves purposejour.netlify.app belongs to the Android
// wrapper app (Trusted Web Activity), hiding the browser bar for a native feel.
// The SHA-256 fingerprint comes from YOUR signing key (public, safe to share in
// chat). Bubblewrap prints it during `init`; paste it below and redeploy BEFORE
// installing the APK so verification passes on first launch.
const PACKAGE = "com.herpurpose.app";
const SHA256_FINGERPRINT = "REPLACE_WITH_KEY_SHA256_FINGERPRINT";

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
