import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, ArrowLeft, BarChart3 } from "lucide-react";

const Header = (props) => {
  // Hook para saber a página atual
  const { pathname } = useLocation();

  // Define as condições de forma mais clara
  const isHomePage = pathname === "/"; // A página inicial (Estatísticas)
  const isRankingPage = pathname.includes("/ranking");

  // Componente interno para os botões, mantendo o código limpo
  const NavButton = ({ to, icon, text }) => (
    <Link
      to={to}
      className="
        flex items-center justify-center
        px-5 py-3 
        bg-[#fdb913] text-[#034ea2]
        rounded-full 
        font-bold
        shadow-lg hover:shadow-xl
        transform transition-all duration-300 ease-in-out
        hover:bg-[#ef4123] hover:text-white
        hover:-translate-y-0.5
      "
    >
      {icon}
      <span className="ml-2 text-sm">{text}</span>
    </Link>
  );

  return (
    <header className="page-header bg-[#034ea2] text-white py-6 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Lado esquerdo: Logo + Título + Subtítulo */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
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
            <div className="flex flex-col sm:border-l sm:border-white/20 sm:pl-6">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                {props.titulo}
              </h1>
              <p className="text-blue-100 text-sm">{props.subtitulo}</p>
            </div>
          </div>
          
          {/* Lado direito: Botão de Navegação Repaginado */}
          <div className="flex items-center">
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
}

export default Header;