import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Mic2 } from 'lucide-react';

const GENRES = [
  'Afrobeats', 'Amapiano', 'Highlife', 'Afropop', 'Bongo Flava', 'Gengetone',
  'Gqom', 'Kwaito', 'Afro-Soul', 'Gospel', 'R&B', 'Hip Hop', 'Dancehall',
  'Reggae', 'Jazz', 'Pop', 'Other',
];

interface Props {
  artistId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const EditArtistProfileModal = ({ artistId, onClose, onSaved }: Props) => {
  const { user } = useUser();
  const { toast } = useToast();
  const imgRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('artists')
        .select('name, bio, genre, country, image_url, twitter_handle, instagram_handle')
        .eq('id', artistId)
        .maybeSingle();
      if (data) {
        setName(data.name || '');
        setBio(data.bio || '');
        setGenre(data.genre || '');
        setCountry(data.country || '');
        setTwitter((data as any).twitter_handle || '');
        setInstagram((data as any).instagram_handle || '');
        setImgPreview(data.image_url || null);
      }
      setLoading(false);
    })();
  }, [artistId]);

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast({ title: 'Artist name required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (imgFile && user?.id) {
        const ext = imgFile.name.split('.').pop() || 'jpg';
        const path = `artists/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('music').upload(path, imgFile, { contentType: imgFile.type });
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from('music').getPublicUrl(path).data.publicUrl;
      }
      const update: Record<string, any> = {
        name: name.trim(),
        bio: bio.trim() || null,
        genre: genre || null,
        country: country.trim() || null,
        twitter_handle: twitter.trim() || null,
        instagram_handle: instagram.trim() || null,
      };
      if (imageUrl) update.image_url = imageUrl;
      const { error } = await supabase.from('artists').update(update).eq('id', artistId);
      if (error) throw error;
      toast({ title: 'Profile updated' });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Couldn't save", description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const label = 'block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900">Edit Artist Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close"><X size={22} /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-900" size={28} /></div>
        ) : (
          <div className="overflow-y-auto p-5 space-y-4">
            <div className="flex items-center gap-4">
              <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
              <div onClick={() => imgRef.current?.click()} className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                {imgPreview ? <img src={imgPreview} alt="" className="w-full h-full object-cover" /> : <Mic2 className="text-gray-400" size={26} />}
              </div>
              <div className="flex-1">
                <label className={label}>Artist name</label>
                <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
                <p className="text-[11px] text-gray-400 mt-2">Tap the circle to change your photo.</p>
              </div>
            </div>

            <div>
              <label className={label}>Bio</label>
              <textarea className={`${input} min-h-[90px] resize-none`} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell listeners about yourself…" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Main genre</label>
                <select className={input} value={genre} onChange={(e) => setGenre(e.target.value)}>
                  <option value="">—</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Country</label>
                <input className={input} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Rwanda" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Twitter / X</label>
                <input className={input} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@you" />
              </div>
              <div>
                <label className={label}>Instagram</label>
                <input className={input} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@you" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-md text-gray-700 font-bold hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="flex-1 py-2.5 rounded-md bg-gray-900 text-white font-black hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save profile'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
