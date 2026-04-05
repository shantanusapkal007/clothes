"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Sales", href: "/", icon: "payments" },
    { name: "Stock", href: "/inventory", icon: "inventory_2" }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-[#fbf9f5]/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4 md:gap-12">
          <h1 className="text-xl md:text-2xl font-serif tracking-tight text-[#774420]">FRIENDS</h1>
          <nav className="hidden md:flex items-center gap-8 h-16">
            <Link 
              href="/" 
              className={`font-semibold h-full flex items-center px-2 transition-colors duration-300 ${
                pathname === "/" ? "text-[#774420] border-b-2 border-[#774420]" : "text-[#67625a] hover:text-[#945b35]"
              }`}
            >
              POS
            </Link>
            <Link 
              href="/inventory" 
              className={`font-medium h-full flex items-center px-2 transition-colors duration-300 ${
                pathname === "/inventory" ? "text-[#774420] border-b-2 border-[#774420]" : "text-[#67625a] hover:text-[#945b35]"
              }`}
            >
              Inventory
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="material-symbols-outlined p-2 text-[#67625a] hover:text-[#774420] transition-colors cursor-pointer active:opacity-70">
            notifications
          </button>
          <button className="material-symbols-outlined p-2 text-[#67625a] hover:text-[#774420] transition-colors cursor-pointer active:opacity-70">
            settings
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 ring-2 ring-primary-fixed cursor-pointer">
            <img
              alt="Manager Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Dkd6HkJ0s18H_Aod9frXDryOaLvEzlHK4e7Xo2sXhWglcvhuAjUgYTCzZmeu_KOR3Ur9AOqM6Mg6oNR3-YkRgC1_LxPzHa57E1nOvVx4Xcj_8r7zGHDtY-y4mPj87ZwJVQbknqKJadv4dYfpmyEa6Sdw95BAz7WQfycMzshLP8dm9BlEkXFF9SagKgdoj-EtfCVT9RbHOevLF5RXXP0GNCuz5dmZ8g68AskiDwrSAqHuXP2w7qP7DmI9SUzzWcCiaW9b53Q_jog"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Mobile menu button */}
          <button 
            className="md:hidden material-symbols-outlined p-2 text-[#67625a] hover:text-[#774420] transition-colors cursor-pointer active:opacity-70"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "close" : "menu"}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-16 left-0 w-full bg-[#f7f1e7] shadow-lg z-40 md:hidden flex flex-col p-4 border-b border-[#e9e1d7]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 px-6 flex items-center gap-3 rounded-xl mb-2 transition-colors ${
                  isActive ? "bg-[#ffdbc8] text-[#774420] font-bold" : "text-[#67625a] hover:bg-[#e9e1d7]/50"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Side Navigation Anchor (Desktop Only) */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] py-8 flex-col gap-2 w-64 bg-[#f7f1e7] shadow-[20px_0_40px_rgba(49,19,0,0.03)] z-40 hidden md:flex rounded-r-3xl">
        <div className="px-8 mb-8">
          <h4 className="text-lg font-serif italic text-[#774420]">Back Office</h4>
          <p className="font-sans text-xs tracking-wide text-[#67625a] uppercase font-bold opacity-60">Management Suite</p>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`rounded-full mx-4 py-3 px-6 flex items-center gap-3 transition-all cursor-pointer hover:translate-x-1 duration-200 active:scale-95 ${
                  isActive 
                    ? "bg-[#ffdbc8] text-[#774420] font-bold shadow-sm" 
                    : "text-[#67625a] hover:bg-stone-200/50"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-sans text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Inactive placeholders */}
          <div className="text-[#67625a] opacity-50 rounded-full mx-4 py-3 px-6 flex items-center gap-3 transition-all cursor-not-allowed">
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="font-sans text-sm tracking-wide">Orders</span>
          </div>
          <div className="text-[#67625a] opacity-50 rounded-full mx-4 py-3 px-6 flex items-center gap-3 transition-all cursor-not-allowed">
            <span className="material-symbols-outlined">group</span>
            <span className="font-sans text-sm tracking-wide">Staff</span>
          </div>
        </nav>
        <div className="px-8 py-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/50 p-1">
              <img
                alt="Atelier Friends Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD9UG5Ct8w_kKziztfse4IyC1DLiguLbWyp9UjS_mq9n_YeSdgCQ4MFoJ0fyXK9G4-kh-mx5gbiMV4Ve1vOv93N4jWM3Kur_Rr7WF8OZok2gMkQgXdbjCHnxiHNbuPc74EEltnGLNQk3NhsMcqzqZkExsA8XEzvyW5h8mPouvA5epdwInq9D5tKTtjPBUtl6S5irh4mQFSLIbCZnWJLkZN6vwPmG049ZD7jp1LZ7iUqmaeCHmWT0yqKI14H0CRUNz8dwRBzv3_KbE"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#774420]">v2.4.0</p>
              <p className="text-[10px] text-[#67625a]">Atelier Premium POS</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
