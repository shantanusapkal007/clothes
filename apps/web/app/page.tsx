import { PosWorkspace } from "../components/PosWorkspace";

export default function HomePage() {
  return (
    <main className="ml-0 md:ml-64 pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="mb-8 md:mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">SALES FLOOR</span>
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-on-background max-w-2xl leading-tight">
            Scan fast. Edit anything. Checkout once.
          </h2>
        </div>
      </section>
      
      <PosWorkspace />
    </main>
  );
}
