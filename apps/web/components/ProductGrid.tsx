import type { Product } from "../types";

export function ProductGrid({
  products,
  onAdd
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-secondary border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest/50">
        <span className="material-symbols-outlined text-4xl mb-4 opacity-50">search_off</span>
        <h3 className="font-headline text-lg mb-1">No products found</h3>
        <p className="text-sm">Try adjusting your search query or add new stock.</p>
      </div>
    );
  }

  // Helper to generate a placeholder color based on product category/id
  const getProductImage = (name: string, category: string | null) => {
    // Generate a beautiful placeholder from UI Avatars using brand colors
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=e9e1d7&color=774420&size=256&font-size=0.3`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group cursor-pointer flex flex-col"
          onClick={() => onAdd(product)}
        >
          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-surface-container-low transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg relative ring-1 ring-outline-variant/20">
            {product.stock <= product.minStock && (
              <span className="absolute top-2 right-2 bg-error-container text-error text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                Low Stock
              </span>
            )}
            <img
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500"
              src={getProductImage(product.name, product.category)}
            />
            {/* Quick add overlay icon */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300">
                <span className="material-symbols-outlined text-primary text-xl">add_shopping_cart</span>
              </div>
            </div>
          </div>
          <div className="px-1">
            <h4 className="font-medium text-on-background text-sm md:text-base leading-tight md:truncate line-clamp-2 md:line-clamp-none mb-1">
              {product.name}
            </h4>
            <div className="flex justify-between items-center">
              <p className="text-primary font-headline font-bold text-sm md:text-base">
                Rs {product.price.toFixed(2)}
              </p>
              <p className="text-[10px] text-secondary tracking-widest hidden sm:block">
                QTY: {product.stock}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
