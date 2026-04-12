import { motion } from "framer-motion";
import type { Product } from "../types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
};

export function ProductGrid({
  products,
  onAdd
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="p-8 text-center text-secondary border border-dashed border-white/80 rounded-lg bg-white/70 backdrop-blur-md"
      >
        <span className="material-symbols-outlined text-5xl mb-4 opacity-40">search_off</span>
        <h3 className="font-headline text-xl mb-1 text-on-surface">No products found</h3>
        <p className="text-sm">Try adjusting your search query or add new stock.</p>
      </motion.div>
    );
  }

  const getProductImage = (name: string, category: string | null) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=ccfbf1&color=0f766e&size=256&font-size=0.3`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6"
    >
      {products.map((product) => (
        <motion.div
          variants={itemVariants}
          key={product.id}
          className="group flex cursor-pointer flex-col rounded-lg p-2 transition-colors hover:bg-white/70"
          onClick={() => onAdd(product)}
        >
          <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-lg bg-surface-container-low ring-1 ring-white/80 shadow-[0_8px_20px_rgb(0,0,0,0.03)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_15px_35px_rgb(0,0,0,0.06)]">
            <img
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
              src={getProductImage(product.name, product.category)}
            />
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-xl w-12 h-12 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-[0_8px_20px_rgba(15,118,110,0.15)] transform translate-y-4 group-hover:translate-y-0 duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] block">
                <span className="material-symbols-outlined text-primary text-2xl">add</span>
              </div>
            </div>
          </div>
          <div className="px-1.5">
            <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-on-surface md:text-base">
              {product.name}
            </h4>
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-primary font-headline font-bold text-sm md:text-base tracking-tight">
                Rs {product.price.toFixed(2)}
              </p>
              <p className="inline-flex items-center rounded-lg bg-white/70 px-2 py-0.5 text-[10px] font-bold tracking-widest text-on-secondary-container">
                {product.stock}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
