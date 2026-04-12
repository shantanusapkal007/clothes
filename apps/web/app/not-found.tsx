import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-20 text-center md:ml-64">
      <section className="rounded-lg border border-outline-variant/40 bg-white p-6 shadow-[0_20px_60px_rgba(8,47,46,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Page not found
        </p>
        <h1 className="mt-3 font-headline text-3xl font-bold text-on-surface">
          Back to the counter.
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-secondary-container">
          This page is not available. Return to sales and continue checkout.
        </p>
        <Link className="button button-primary mt-6 w-full" href="/">
          Open sales
        </Link>
      </section>
    </main>
  );
}
