import React from "react";
import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Header = (props) => {
  return (
    <header className="page-header py-4 md:py-8 px-4 bg-[#034ea2]">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 w-full">
          
          {/* Botão Voltar - sempre no lado esquerdo */}
          {props.showBackButton && (
            <div className="flex justify-start w-full lg:w-auto lg:flex-shrink-0 order-1 lg:order-none">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          )}
          
          {/* Seção Principal do Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:flex-1 order-2 lg:order-none">
            
            {/* Info da Junta + Logo */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              
              {/* Info da Junta Comercial */}
              <div className="flex flex-col text-center sm:text-left text-xs sm:text-sm">
                <span className="font-bold text-white">JUNTA COMERCIAL</span>
                <span className="text-blue-100">DO PIAUÍ - JUCEPI</span>
              </div>
              
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/logo/logo-rodape.png"
                  alt="Governo do Piauí"
                  className="header-logo h-8 sm:h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            
            {/* Títulos */}
            <div className="text-center lg:text-left w-full sm:w-auto lg:flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {props.titulo}
              </h1>
              {props.subtitulo && (
                <p className="text-blue-100 mt-1 text-sm sm:text-base">
                  {props.subtitulo}
                </p>
              )}
            </div>
          </div>
          
          {/* Botão de Ranking */}
          {props.botao && (
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center lg:justify-end order-3 lg:order-none">
              <a href="/ranking" className="inline-block">
                <div 
                  className="group relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #fdb913 0%, #ef4123 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="flex items-center gap-1 sm:gap-2 justify-center">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Ranking</span>
                  </div>
                  
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Borda animada */}
                  <div className="absolute inset-0 rounded-xl border-2 border-white/30 group-hover:border-white/50 transition-all duration-300"></div>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;