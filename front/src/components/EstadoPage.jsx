import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, FileText, Calendar, TrendingUp } from 'lucide-react';
import { getEstadoBySigla } from '../data/estados';

const EstadoPage = () => {
  const { siglaEstado } = useParams();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [dadosEstado, setDadosEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState({});

  const estado = getEstadoBySigla(siglaEstado);

  // Mapeamento de meses
  const mesesMap = {
    'janeiro': 'Janeiro',
    'fevereiro': 'Fevereiro',
    'março': 'Março',
    'abril': 'Abril',
    'maio': 'Maio',
    'junho': 'Junho',
    'julho': 'Julho',
    'agosto': 'Agosto',
    'setembro': 'Setembro',
    'outubro': 'Outubro',
    'novembro': 'Novembro',
    'dezembro': 'Dezembro'
  };

  // Carregar períodos disponíveis
  useEffect(() => {
    const carregarPeriodos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/periodos');
        const result = await response.json();
        
        if (result.success) {
          setPeriodosDisponiveis(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar períodos:', error);
      }
    };

    carregarPeriodos();
  }, []);

  const buscarDados = async () => {
    if (!selectedMonth || !selectedYear || !estado) return;

    setLoading(true);
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/dados/${estado.sigla}?mes=${selectedMonth}&ano=${selectedYear}`
      );
      const result = await response.json();
      
      if (result.success) {
        setDadosEstado(result.data);
      } else {
        console.error('Erro na API:', result.error);
        setDadosEstado(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setDadosEstado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      buscarDados();
    }
  }, [selectedMonth, selectedYear, estado]);

  if (!estado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Estado não encontrado</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="page-header py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <img
                  src={`/src/assets/bandeiras-brasileiras/${estado.sigla}.png`}
                  alt={`Bandeira de ${estado.nome}`}
                  className="w-12 h-8 object-cover rounded border-2 border-white/20"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{estado.nome}</h1>
                  <p className="text-blue-100">{estado.sigla} • {estado.regiao}</p>
                </div>
              </div>
            </div>
            <img 
              src="https://www.pi.gov.br/wp-content/uploads/2024/11/logo_white.svg" 
              alt="Governo do Piauí" 
              className="header-logo"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Filtros */}
        <Card className="filter-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Filtros de Período</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mês
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(periodosDisponiveis).length > 0 && 
                     Object.values(periodosDisponiveis).flat()
                       .map(p => p.mes)
                       .filter((mes, index, self) => self.indexOf(mes) === index)
                       .sort((a, b) => Object.keys(mesesMap).indexOf(a) - Object.keys(mesesMap).indexOf(b))
                       .map((mes) => (
                         <SelectItem key={mes} value={mes}>
                           {mesesMap[mes] || mes}
                         </SelectItem>
                       ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ano
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(periodosDisponiveis).sort((a, b) => a - b).map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={buscarDados} 
                disabled={!selectedMonth || !selectedYear || loading}
                className="w-full md:w-auto"
              >
                {loading ? 'Carregando...' : 'Buscar Dados'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados */}
        {dadosEstado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span>Tempo Médio de Abertura</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-2">
                  {dadosEstado.tempo_medio_aberturas}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-accent" />
                  <span>Quantidade de Solicitações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-2">
                  {dadosEstado.qtd_solicitacoes}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mensagem quando não há dados */}
        {!dadosEstado && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecione um período
              </h3>
              <p className="text-muted-foreground">
                Escolha o mês e ano para visualizar os dados de {estado.nome}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados...</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EstadoPage;

