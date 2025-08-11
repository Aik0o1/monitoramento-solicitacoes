import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { estados, formatNomeParaUrl } from "../data/estados";
import DestaqueDoMes from "./DestaqueDoMes";
import Footer from "./Footer";

const HomePage = () => {
  const [filtroEstado, setFiltroEstado] = useState("");

  // Filtrar estados baseado no texto digitado
  const estadosFiltrados = estados.filter((estado) =>
    estado.nome.toLowerCase().includes(filtroEstado.toLowerCase()) ||
    estado.sigla.toLowerCase().includes(filtroEstado.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="page-header py-8 px-4 bg-[#034ea2]">
        <div className="container  max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex px-6 flex-col sm:gap-15 sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
              <div className=" flex items-center">

              <div className="flex flex-col text-sm">
                <span className="font-bold">JUNTA COMERCIAL </span>
                <span>DO PIAUÍ - JUCEPI</span>
              </div>
              <img
                src="/logo/logo-rodape.png"
                alt="Governo do Piauí"
                className="header-logo"
                />
                </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Estatísticas</h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">
                  Tempo do processo de abertura de Empresas e demais Pessoas
                  Jurídicas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Destaque do Mês */}
        <DestaqueDoMes />
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Selecione um Estado
          </h2>
          <p className="text-muted-foreground mb-6">
            Clique em um estado para visualizar as informações de tempo médio e
            quantidade de solicitações.
          </p>

          {/* Filtro de Estados */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar estado por nome ou sigla..."
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Estados Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {estadosFiltrados.map((estado) => (
            <Link
              key={estado.sigla}
              to={`/${estado.sigla.toLowerCase()}`}
              className="block"
            >
              <Card className="estado-card h-full cursor-pointer">
                <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <img
                    src={`/bandeiras-brasileiras/${estado.sigla}.png`}
                    alt={`Bandeira de ${estado.nome}`}
                    className="bandeira-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                      {estado.nome}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {estado.sigla} • {estado.regiao}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {estadosFiltrados.length === 0 && filtroEstado && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum estado encontrado para "{filtroEstado}"
            </p>
          </div>
        )}

      </main>
        <Footer></Footer>
    </div>
  );
};

export default HomePage;

