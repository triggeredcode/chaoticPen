'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryProps {
  images: string[];
  onSelect: (src: string) => void;
}

export default function Gallery({ images, onSelect }: GalleryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-gray-600 px-4 py-2 text-[0.65rem] uppercase tracking-wider text-gray-400 transition hover:border-white hover:text-white"
      >
        {open ? 'Hide Gallery' : 'Choose from Gallery'}
      </button>
      {open && (
        <div className="flex gap-3">
          {images.map((src) => (
            <button
              key={src}
              onClick={() => onSelect(src)}
              className="overflow-hidden rounded-lg border-2 border-transparent opacity-70 transition hover:border-white hover:opacity-100"
            >
              <Image
                src={src}
                alt="Portrait"
                width={90}
                height={90}
                className="h-[90px] w-[90px] object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
