import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-[#0B0C0E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#FACC15]" />
            <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
              ARENA <span className="text-[#FACC15]">PRO</span>
            </span>
          </div>

          <div className="flex gap-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>

          <p className="text-gray-600 text-xs font-medium">
            © 2024 ARENA PRO. A elite da gestão esportiva.
          </p>
        </div>
      </div>
    </footer>
  );
}
