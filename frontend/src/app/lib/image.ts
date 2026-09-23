/**
 * Normalizes image URLs to ensure they render properly.
 * Specifically handles Google Drive share links by converting them to direct image URLs.
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();

  // Reject folder links and non-image Google Drive URLs that cannot be converted.
  if (/drive\.google\.com\/drive\/u\/\d\/folders\//i.test(trimmed)) {
    return "";
  }

  // Handle Google Drive share links
  // Pattern: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (driveFileMatch) {
    const fileId = driveFileMatch[1];
    // Use Google Drive's thumbnail endpoint, which is much more reliable for embedding images.
    const normalized = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    console.log("[image] normalized drive url:", trimmed, "->", normalized);
    return normalized;
  }

  // If it's a Google Drive export link with no file ID match above, keep as-is.
  if (/drive\.google\.com\/uc\?export=view/i.test(trimmed)) {
    return trimmed;
  }

  // Also support Google Drive thumbnail links, which are often more embed-friendly.
  const driveThumbMatch = trimmed.match(/drive\.google\.com\/thumbnail\/id\/([^/?#]+)/i);
  if (driveThumbMatch) {
    const fileId = driveThumbMatch[1];
    const normalized = `https://drive.google.com/thumbnail?id=${fileId}&export=download`;
    console.log("[image] normalized drive thumb url:", trimmed, "->", normalized);
    return normalized;
  }

  // Already a direct export link or other URL - return as is
  return trimmed;
}

/**
 * Normalizes an array of image URLs.
 */
export function normalizeImageUrls(urls: (string | undefined | null)[]): string[] {
  return urls.map(normalizeImageUrl).filter(Boolean);
}