"use client";

import { useState } from "react";

export function PersonPhoto({
  src,
  name,
}: {
  src: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center bg-[var(--accent-soft)]"
        aria-label={`View full photo of ${name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="max-h-[28rem] w-full object-contain"
        />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ) : null}
    </>
  );
}
