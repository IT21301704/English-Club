/** Converts YouTube / Vimeo / Google Drive share links into embeddable iframe URLs. Returns null for direct files. */
export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v') ?? (u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : null);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === 'player.vimeo.com') return url;
    if (host === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
    }
  } catch {
    // not a valid URL — treat as a direct file
  }
  return null;
}
