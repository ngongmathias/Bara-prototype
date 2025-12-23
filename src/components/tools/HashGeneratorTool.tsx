import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export const HashGeneratorTool: React.FC = () => {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const generateHashes = async () => {
    if (!text) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const results: Record<string, string> = {};

    try {
      const sha1 = await crypto.subtle.digest('SHA-1', data);
      results.sha1 = Array.from(new Uint8Array(sha1))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const sha256 = await crypto.subtle.digest('SHA-256', data);
      results.sha256 = Array.from(new Uint8Array(sha256))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const sha384 = await crypto.subtle.digest('SHA-384', data);
      results.sha384 = Array.from(new Uint8Array(sha384))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const sha512 = await crypto.subtle.digest('SHA-512', data);
      results.sha512 = Array.from(new Uint8Array(sha512))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setHashes(results);
    } catch (error) {
      console.error('Error generating hashes:', error);
    }
  };

  const copyToClipboard = (hash: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(hash);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Enter text to hash</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter any text..."
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          onClick={generateHashes}
          className="w-full bg-black text-white hover:bg-gray-800"
          disabled={!text}
        >
          Generate Hashes
        </Button>
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algorithm, hash]) => (
            <div key={algorithm} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black uppercase">{algorithm}</h3>
                <Button
                  onClick={() => copyToClipboard(algorithm, hash)}
                  variant="outline"
                  size="sm"
                >
                  {copied === algorithm ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-white rounded p-3 border border-gray-200 font-mono text-xs break-all">
                {hash}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
