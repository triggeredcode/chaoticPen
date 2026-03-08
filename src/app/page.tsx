'use client';

import { useState, useCallback, useRef } from 'react';
import Gallery from '@/components/Gallery';
import PenCanvas from '@/components/PenCanvas';

type View = 'splash' | 'drawing';

const GALLERY_IMAGES = [
  '/alexander-krivitskiy-o7wiNx9x9OQ-unsplash.jpg',
  '/jimmy-fermin-bqe0J0b26RQ-unsplash.jpg',
  '/houcine-ncib-B4TjXnI0Y2c-unsplash.jpg',
];

export default function Home() {
  const [view, setView] = useState<View>('splash');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGallerySelect = useCallback((src: string) => {
    setImageSrc(src);
    setView('drawing');
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string);
      setView('drawing');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleRestart = useCallback(() => {
    setView('splash');
    setImageSrc(null);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col">
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5">
        <span className="text-[0.7rem] font-light uppercase tracking-[0.3em] text-gray-500">
          Chaotic Pen
        </span>
        {view === 'drawing' && (
          <button
            onClick={handleRestart}
            className="rounded-full border border-gray-600 px-4 py-1.5 text-[0.65rem] uppercase tracking-wider text-gray-400 transition hover:border-white hover:text-white"
          >
            Restart
          </button>
        )}
      </header>

      {view === 'splash' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-extralight uppercase tracking-[0.4em]">
            Chaotic Pen
          </h1>
          <p className="max-w-md text-center text-sm leading-relaxed text-gray-500">
            Upload a portrait. The system detects the face, builds a density map,
            and deploys a single chaotic pen to sketch it — one continuous stroke.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Load Portrait
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <Gallery images={GALLERY_IMAGES} onSelect={handleGallerySelect} />
        </div>
      )}

      {view === 'drawing' && imageSrc && <PenCanvas imageSrc={imageSrc} />}
    </main>
  );
}
