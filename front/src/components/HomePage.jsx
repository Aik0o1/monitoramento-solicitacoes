import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { estados, formatNomeParaUrl } from '../data/estados';

const HomePage = () => {
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
                <h1 className="text-3xl font-bold text-white">Estados do Brasil</h1>
                <p className="text-blue-100 mt-1">Sistema de Monitoramento de Solicitações</p>
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
          <p className="text-muted-foreground">
            Clique em um estado para visualizar as informações de tempo médio e quantidade de solicitações.
          </p>
        </div>

        {/* Estados Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {estados.map((estado) => (
            <Link 
              key={estado.sigla} 
              to={`/${estado.sigla.toLowerCase()}`}
              className="block"
            >
              <Card className="estado-card h-full cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                  <img
                    src={`/src/assets/bandeiras-brasileiras/${estado.sigla}.png`}
                    alt={`Bandeira de ${estado.nome}`}
                    className="bandeira-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
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

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Desenvolvido por</span>
            <img 
              src={`/src/assets/logoJUCEPI.png`}
              alt="Governo do Piauí" 
              className="h-10"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

