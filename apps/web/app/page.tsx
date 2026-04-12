import { PosWorkspace } from "../components/PosWorkspace";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1600px] px-3 pb-10 pt-20 sm:px-4 md:ml-64 md:px-8 md:pb-12 md:pt-24">
      <section className="mb-5 rounded-lg border border-white/80 bg-white/85 p-4 shadow-[0_18px_60px_rgba(8,47,40,0.06)] backdrop-blur-xl md:mb-8 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">SALES FLOOR</span>
            <h2 className="mt-2 max-w-2xl text-2xl font-headline font-bold leading-tight text-on-background sm:text-3xl md:text-4xl">
              Scan fast. Edit anything. Checkout once.
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-[0.18em] text-on-secondary-container sm:flex">
            <span className="rounded-lg bg-primary-fixed px-3 py-2 text-primary">80mm ready</span>
            <span className="rounded-lg bg-tertiary-fixed px-3 py-2 text-on-tertiary-fixed-variant">WhatsApp bill</span>
          </div>
        </div>
      </section>
      
      <PosWorkspace />
    </main>
  );
}
