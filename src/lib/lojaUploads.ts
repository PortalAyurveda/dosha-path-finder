// Helpers de upload para o bucket "samkhya" usado pela loja.
import { supabase } from "@/integrations/supabase/client";
import { sanitizeSlug } from "@/lib/sanitizeSlug";

const BUCKET = "samkhya";

/**
 * Faz upload de um arquivo para o bucket samkhya.
 * Usa o slug do produto/kit + timestamp para evitar colisões.
 * Retorna a URL pública do arquivo enviado.
 */
export async function uploadToSamkhyaBucket(
  file: File,
  contextSlug: string,
): Promise<{ url: string; path: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Arquivo deve ser uma imagem." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeContext = sanitizeSlug(contextSlug || "produto");
  const stamp = Date.now();
  const filename = `${safeContext}-${stamp}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return { url: data.publicUrl, path: filename };
}
