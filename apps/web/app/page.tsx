import { PosWorkspace } from "../components/PosWorkspace";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1600px] px-3 pb-10 pt-20 sm:px-4 md:ml-64 md:px-8 md:pb-12 md:pt-24">
      {/* Hero Section */}
      <section className="mb-6 md:mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">SALES FLOOR</span>
          <h2 className="max-w-2xl text-2xl font-headline font-bold leading-tight text-on-background sm:text-3xl md:text-5xl">
            Scan fast. Edit anything. Checkout once.
          </h2>
        </div>
      </section>
      
      <PosWorkspace />
    </main>
  );
}
