'use client';
import { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/fetcher';

type Folder = 'lessons' | 'thumbnails' | 'submissions' | 'avatars' | 'invoices';

interface FileUploadProps {
  folder: Folder;
  /** Name of the hidden input carrying the URL, so it can live inside a FormData form. */
  name?: string;
  value?: string | null;
  onChange?: (url: string) => void;
  accept?: string;
  /** Allow pasting an external URL (e.g. YouTube) instead of uploading. */
  allowUrl?: boolean;
}

export function FileUpload({ folder, name, value, onChange, accept, allowUrl = true }: FileUploadProps) {
  const [url, setUrl] = useState(value ?? '');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function update(next: string) {
    setUrl(next);
    onChange?.(next);
  }

  async function handleFile(file: File) {
    setError('');
    setProgress(0);
    try {
      const sig = await apiFetch('/api/upload/sign', { body: { folder } });
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('signature', sig.signature);
      form.append('folder', sig.folder);

      // XHR rather than fetch so we can report upload progress for large videos.
      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
        xhr.upload.onprogress = e => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText || '{}');
          xhr.status < 300 ? resolve(data.secure_url) : reject(new Error(data.error?.message || 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(form);
      });
      update(secureUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-2">
      {name && <input type="hidden" name={name} value={url} />}
      <div className="flex gap-2">
        {allowUrl ? (
          <Input value={url} onChange={e => update(e.target.value)} placeholder="Paste a URL or upload a file" />
        ) : (
          <div className="flex-1 flex items-center h-10 px-3 rounded-md border text-sm text-muted-foreground truncate">
            {url ? <a href={url} target="_blank" rel="noreferrer" className="text-brand-600 truncate hover:underline">{url.split('/').pop()}</a> : 'No file selected'}
          </div>
        )}
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={progress !== null}>
          {progress !== null ? <><Loader2 className="h-4 w-4 animate-spin" />{progress}%</> : <><Upload className="h-4 w-4" />Upload</>}
        </Button>
        {url && (
          <Button type="button" variant="ghost" size="icon" onClick={() => update('')} aria-label="Clear file">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {url && !error && progress === null && (
        <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />File attached</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
