import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = (props) => {
  // Hook para saber a página atual
  const { pathname } = useLocation();

  // Define as condições de forma mais clara
  const isHomePage = pathname === "/"; // A página inicial (Estatísticas)
  const isRankingPage = pathname.includes("/ranking");

  // Componente interno para os botões, mantendo o código limpo
  const NavButton = ({ to, icon, text }) => (
    <Link to={to}>
      <Button
        variant="ghost"
        className="text-white hover:bg-white/10 h-auto p-2 flex flex-col sm:flex-row sm:h-10 sm:px-3 items-center"
      >
        {icon}
        <span className="mt-1 text-xs sm:mt-0 sm:ml-2 sm:text-sm">{text}</span>
      </Button>
    </Link>
  );

  return (
    <header className="page-header bg-[#034ea2] text-white py-6 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Lado esquerdo: Logo + Título + Subtítulo */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
            {/* Logo e nome da instituição */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src="/logo/logo-rodape.png"
                alt="Governo do Piauí"
                className="h-9 sm:h-11 w-auto"
              />
              <div className="flex flex-col text-xs sm:text-sm leading-tight">
                <span className="font-bold">JUNTA COMERCIAL</span>
                <span>DO PIAUÍ - JUCEPI</span>
              </div>
            </div>
            {/* Separador e títulos */}
            <div className="flex flex-col sm:border-l sm:border-white/20 sm:pl-6">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                {props.titulo}
              </h1>
              <p className="text-blue-100 text-sm">{props.subtitulo}</p>
            </div>
          </div>
          {/* Lado direito: Navegação */}
          <div className="flex items-center justify-center lg:justify-end gap-2 flex-shrink-0">
            {isHomePage && (
              <NavButton
                to="/ranking"
                icon={<Trophy className="w-5 h-5" />}
                text="Ranking"
              />
            )}
            {isRankingPage && (
              <NavButton
                to="/"
                icon={<BarChart3 className="w-5 h-5" />}
                text="Estatísticas"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
