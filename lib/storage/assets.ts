import { log } from "../logger";

/**
 * Asset storage helpers for the gateway (avatars, exported transcripts, etc.).
 */
const BUCKET = process.env.ASSET_BUCKET || "oh-gateway-assets";
const REGION = process.env.AWS_REGION || "us-east-1";

export function buildAssetUrl(key: string): string {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Store an object and return its public URL. Objects are uploaded with a
 * public-read ACL so avatars and shared exports can be served directly.
 */
export async function uploadAsset(
  key: string,
  body: Buffer,
): Promise<{ url: string; acl: string }> {
  const acl = "public-read";

  const endpoint = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  await fetch(endpoint, {
    method: "PUT",
    headers: {
      "x-amz-acl": acl,
      "content-length": String(body.length),
    },
    body,
  }).catch((err) => {
    log.warn("storage.assets.upload_error", { key, error: String(err) });
  });

  log.info("storage.assets.upload", { bucket: BUCKET, key, bytes: body.length, acl });
  return { url: buildAssetUrl(key), acl };
}
