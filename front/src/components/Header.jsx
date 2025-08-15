import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, ArrowLeft, BarChart3 } from "lucide-react";

// O Header recebe um objeto 'pageInfo' e as props do botão
const Header = (props) => {  
  const { pathname } = useLocation();
   const isRankingPage = pathname === "/"; 
  const isHomePage = pathname === "/estatisticas"; // A página inicial (Estatísticas)

  const NavButton = ({ to, onClick, icon, text, className }) => {
    const styleClasses = `
    flex items-center justify-center
    px-5 py-3 
    bg-[#fdb913] text-[#034ea2]
    rounded-full 
    font-bold
    shadow-lg hover:shadow-xl
    transform transition-all duration-300 ease-in-out
    hover:bg-[#ef4123] hover:text-white
    hover:-translate-y-0.5
  `;

    if (to) {
      return (
        <Link to={to} className={`${styleClasses} ${className}`}>
          {icon}
          <span className="ml-2 text-sm">{text}</span>
        </Link>
      );
    }
    return (
      <button onClick={onClick} className={`${styleClasses} ${className}`}>
        {icon}
        <span className="ml-2 text-sm">{text}</span>
      </button>
    );
  };

  return (
    <header className="page-header bg-[#034ea2] text-white py-6 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          {/* Lado esquerdo: Logo + Conteúdo Dinâmico */}
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
            {/* Logo Fixo */}
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

            {/* Conteúdo que muda com base nas props */}
            <div className="sm:border-l sm:border-white/20 sm:pl-6">
              {/* Se a prop 'bandeira' existir, mostra o layout do estado */}
              {props?.bandeira ? (
                <div className="flex items-center gap-4">
                  {" "}
                  {/* AQUI ESTÁ A MÁGICA */}
                  <img
                    src={props.bandeira}
                    alt={`Bandeira de ${props.nome}`}
                    className="w-14 h-9 object-cover rounded shadow-md border-2 border-white/20"
                  />
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {props.nome}
                    </h1>
                    <p className="text-blue-100 text-sm">{props.sigla}</p>
                  </div>
                </div>
              ) : (
                /* Caso contrário, mostra o título e subtítulo padrão */
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {props?.titulo}
                  </h1>
                  <p className="text-blue-100 text-sm">{props?.subtitulo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lado direito: Botão de Navegação */}
          <div className="flex items-center">
            {isHomePage && (
              <NavButton
                to="/"
                icon={<Trophy className="w-5 h-5" />}
                text="Ranking"
              />
            )}

            {isRankingPage && (
              <NavButton
                to="/estatisticas"
                icon={<BarChart3 className="w-5 h-5" />}
                text="Estatísticas"
              />
            )}

            {props.showBackButton && (
              <NavButton
                to="/"
                icon={<ArrowLeft className="w-5 h-5" />}
                text="Voltar"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
