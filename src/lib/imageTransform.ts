import { supabase } from "@/integrations/supabase/client";

const SUPABASE_STORAGE_PREFIX = "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/";

/**
 * Transforms a Supabase storage public URL to use native image transforms.
 * If the URL is not from Supabase storage, returns it unchanged.
 */
export function getTransformedImageUrl(
  url: string | null | undefined,
  width = 600,
  quality = 80
): string {
  if (!url) return "";
  if (!url.startsWith(SUPABASE_STORAGE_PREFIX)) return url;

  // Extract bucket and path from the URL
  const rest = url.slice(SUPABASE_STORAGE_PREFIX.length);
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return url;

  const bucket = rest.slice(0, slashIdx);
  const filePath = rest.slice(slashIdx + 1);

  // Only apply transforms to portal_capas bucket
  if (bucket !== "portal_capas") return url;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath, { transform: { width, quality } });

  return data.publicUrl;
}
