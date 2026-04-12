"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-20 text-center md:ml-64">
      <section className="rounded-lg border border-error/20 bg-white p-6 shadow-[0_20px_60px_rgba(8,47,46,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-error">
          Something went wrong
        </p>
        <h1 className="mt-3 font-headline text-3xl font-bold text-on-surface">
          The counter is still safe.
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-secondary-container">
          Refresh this screen and try again. If the same bill fails twice, check the product stock
          and printer connection before saving another sale.
        </p>
        <button className="button button-primary mt-6 w-full" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
