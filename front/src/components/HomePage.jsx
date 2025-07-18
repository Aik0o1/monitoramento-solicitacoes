import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { estados, formatNomeParaUrl } from "../data/estados";

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
      <header className="page-header py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="https://www.pi.gov.br/wp-content/uploads/2024/11/logo_white.svg"
                alt="Governo do Piauí"
                className="header-logo"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">Estatísticas</h1>
                <p className="text-blue-100 mt-1">
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
              className="pl-10"
            />
          </div>
        </div>

        {/* Estados Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {estadosFiltrados.map((estado) => (
            <Link
              key={estado.sigla}
              to={`/${estado.sigla.toLowerCase()}`}
              className="block"
            >
              <Card className="estado-card h-full cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                  <img
                    src={`/bandeiras-brasileiras/${estado.sigla}.png`}
                    alt={`Bandeira de ${estado.nome}`}
                    className="bandeira-img"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
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

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Desenvolvido por</span>
            <img src={`/logo/logoJUCEPI.png`} alt="JUCEPI" className="h-10" />
          </div>

          <div className="inline-flex items-center ml-2 text-sm text-muted-foreground">
           | Dados obtidos de&nbsp;
            <a
              href="https://estatistica.redesim.gov.br/tempos-abertura"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              estatistica.redesim.gov.br
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

