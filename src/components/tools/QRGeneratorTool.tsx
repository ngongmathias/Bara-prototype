import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

export const QRGeneratorTool: React.FC = () => {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');

  const generateQR = async () => {
    if (!text) return;
    try {
      const qr = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qr);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qr-code.png';
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Enter text or URL</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com or any text..."
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          onClick={generateQR}
          className="w-full bg-black text-white hover:bg-gray-800"
          disabled={!text}
        >
          Generate QR Code
        </Button>
      </div>

      {qrCode && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <div className="flex justify-center">
            <img src={qrCode} alt="QR Code" className="border-4 border-white shadow-lg rounded-lg" />
          </div>
          <Button
            onClick={downloadQR}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
};
