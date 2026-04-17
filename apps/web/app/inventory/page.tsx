import { InventoryManager } from "../../components/InventoryManager";

export default function InventoryPage() {
  return (
    <main className="app-shell min-h-screen px-2 pb-4 pt-[3.75rem] sm:px-4 sm:pt-20 md:ml-64 md:px-8 md:pb-12 md:pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="relative mb-5 flex min-h-[150px] flex-col justify-end overflow-hidden rounded-lg bg-primary-container p-4 shadow-lg sm:p-6 md:mb-8 md:min-h-[260px] md:p-10">
          <div className="absolute inset-0 z-0">
            <img
              alt="Boutique Interior"
              data-alt="Minimalist high-end fashion boutique interior with warm lighting, wooden textures, and neatly organized clothing racks"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_SRvqzkINqRx4IeV-OhzOtIK1nyOFxzbgLa90xbjCLRUW8z-49LbM4VwNP4LcLwGDVpy4oLexlX66WJ9kclyGR5-mE0A-N69M87RnE9TVecFNTBScLkU5qp9gWXobragwatW1DZAJV4NJNrYJRGTn8uBDVZFPF_226s2mFmT0Eri3Wd7prXdvpqB_gyaWVURnnoNtYQsHGHfRjCOCVR92WgOgGJPW2bA7HIqaGz-eghe1Vgtgw_GtHM1Hn-EAgGOeJ2ESqM9syrI"
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <span className="text-on-primary-container/80 font-bold tracking-[0.2em] text-xs md:text-sm mb-2 block uppercase">
              BACK OFFICE
            </span>
            <h1 className="max-w-xl text-2xl leading-tight text-on-primary-container sm:text-3xl md:text-4xl font-serif">
              Inventory that stays fast under pressure.
            </h1>
          </div>
        </header>
        
        <InventoryManager />
      </div>
    </main>
  );
}
