import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Footer from "./Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { getEstadoBySigla, estados } from "../data/estados";

const ORDEM_MESES = [
  "janeiro",
  "fevereiro",
  "marco",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const EstadoPage = () => {
  const { siglaEstado: siglaDaUrl } = useParams();
  const siglaEstado = siglaDaUrl ? siglaDaUrl.toUpperCase() : '';

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dadosEstado, setDadosEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState({});

  const navigate = useNavigate();
  const estado = getEstadoBySigla(siglaEstado);

  const mesesMap = {
    janeiro: "Janeiro",
    fevereiro: "Fevereiro",
    março: "Março",
    marco: "Março",
    abril: "Abril",
    maio: "Maio",
    junho: "Junho",
    julho: "Julho",
    agosto: "Agosto",
    setembro: "Setembro",
    outubro: "Outubro",
    novembro: "Novembro",
    dezembro: "Dezembro",
  };

  useEffect(() => {
    const carregarPeriodos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_URL_API}/api/periodos`);
        const result = await response.json();
        if (result.success) {
          setPeriodosDisponiveis(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar períodos:", error);
      }
    };
    carregarPeriodos();
  }, []);

  useEffect(() => {
    // Verifica se os períodos já foram carregados
    if (Object.keys(periodosDisponiveis).length > 0) {
      // 1. Encontra o ano mais recente
      const anoMaisRecente = Object.keys(periodosDisponiveis).sort(
        (a, b) => b - a
      )[0];

      // 2. Encontra o mês mais recente dentro daquele ano
      const mesesDoAno = periodosDisponiveis[anoMaisRecente];
      const mesMaisRecente = mesesDoAno.sort(
        (a, b) =>
          ORDEM_MESES.indexOf(b.mes.toLowerCase()) -
          ORDEM_MESES.indexOf(a.mes.toLowerCase())
      )[0].mes;

      // 3. Define os estados, o que vai disparar a busca de dados
      setSelectedYear(anoMaisRecente);
      setSelectedMonth(mesMaisRecente);
    }
  }, [periodosDisponiveis]); // Roda sempre que a lista de períodos for atualizada

  const buscarDados = async () => {
    if (!selectedMonth || !selectedYear || !estado) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/${estado.sigla}?mes=${selectedMonth}&ano=${selectedYear}`
      );
      const result = await response.json();
      if (result.success) {
        setDadosEstado(result.data);
      } else {
        console.error("Erro na API:", result.error);
        setDadosEstado(null);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setDadosEstado(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [selectedMonth, selectedYear, siglaEstado]); // Removido 'estado' e adicionado 'siglaEstado' para mais precisão

  const handleEstadoChange = (novaSigla) => {
    if (novaSigla && novaSigla !== siglaEstado) {
      navigate(`/${novaSigla}`);
    }
  };

  if (!estado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Estado não encontrado
          </h1>
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
      <header className="page-header py-6 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 w-full">

            {/* Botão Voltar - sempre à esquerda */}
            <div className="flex justify-start w-full lg:w-auto lg:flex-shrink-0 order-1 lg:order-none">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 cursor-pointer text-xs sm:text-sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Voltar
              </Button>
            </div>

            {/* Seção Central - Bandeira + Info do Estado */}
            <div className="flex flex-row-reverse sm:flex-row-reverse gap-3 sm:gap-4 justify-center sm:border-r sm:border-white/20 sm:pr-6 lg:justify-end w-full lg:w-auto lg:flex-shrink-0 order-2 lg:order-none items-center">
              <div className="flex flex-col text-center sm:text-left text-xs sm:text-sm ">
                <span className="font-bold text-white">JUNTA COMERCIAL</span>
                <span className="text-blue-100">DO PIAUÍ - JUCEPI</span>
              </div>
              <img
                src="https://www.pi.gov.br/wp-content/uploads/2024/11/logo_white.svg"
                alt="Governo do Piauí"
                className="h-9 sm:h-11 w-auto"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:flex-1 order-3 lg:order-none">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Bandeira do Estado */}
                <div className="flex-shrink-0">
                  <img
                    src={`/bandeiras-brasileiras/${estado.sigla}.png`}
                    alt={`Bandeira de ${estado.nome}`}
                    className="w-14 h-10 sm:w-12 sm:h-8 md:w-14 md:h-9 object-cover rounded border-2 border-white/20 shadow-sm"
                  />
                </div>

                {/* Informações do Estado */}
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">
                    {estado.nome}
                  </h1>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-sm mt-0.5">
                    {estado.sigla} • {estado.regiao}
                  </p>
                </div>
              </div>
            </div>
            {/* Logo do Governo - sempre à direita */}
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
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estado
                </label>
                <Select value={siglaEstado} onValueChange={handleEstadoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((e) => (
                      <SelectItem key={e.sigla} value={e.sigla}>
                        {e.nome} ({e.sigla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                      Object.values(periodosDisponiveis)
                        .flat()
                        .map((p) => p.mes)
                        .filter(
                          (mes, index, self) => self.indexOf(mes) === index
                        )
                        .sort(
                          (a, b) =>
                            Object.keys(mesesMap).indexOf(a) -
                            Object.keys(mesesMap).indexOf(b)
                        )
                        .map((mes) => (
                          <SelectItem key={mes} value={mes}>
                            {mesesMap[mes] || mes}
                          </SelectItem>
                        ))}
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
                    {Object.keys(periodosDisponiveis).map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {dadosEstado && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Trophy className="w-5 h-5 text-[#007932]" />
                  <span>
                    Ranking Geral - Tempo de Abertura de Empresas{" "}
                    <span className="text-sm text-muted-foreground align-super">
                      1
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#007932] mb-2">
                  {dadosEstado.posicao}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Trophy className="w-5 h-5 text-[#007932]" />
                  <span>
                    Ranking - Tempo de Registro para Abertura de Empresas{" "}
                    <span className="text-sm text-muted-foreground align-super">
                      2
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#007932] mb-2">
                  {dadosEstado.posicao_registro}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="w-5 h-5 text-[#fdb913]" />
                  <span>Média de Tempo Total - Abertura de Empresas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fdb913] mb-2">
                  {dadosEstado.media_tempo_total_para_registro}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="w-5 h-5 text-[#fdb913]" />
                  <span>Tempo Médio de Registro</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fdb913] mb-2">
                  {dadosEstado.tempo_medio_tempo_de_registro}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="w-5 h-5 text-[#fdb913]" />
                  <span>Tempo Médio de Consulta de Nome</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fdb913] mb-2">
                  {dadosEstado.tempo_medio_cp_nome}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Clock className="w-5 h-5 text-[#fdb913]" />
                  <span>Tempo Médio de Consulta de Endereço</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#fdb913] mb-2">
                  {dadosEstado.tempo_medio_cp_end}
                </div>
                <p className="text-sm text-muted-foreground">
                  {dadosEstado.periodo_filtrado}
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-[#034ea2]" />
                  <span>Quantidade de solicitações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#034ea2] mb-2">
                  {dadosEstado.qtd_processo}
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

        {/* Observações */}
        {dadosEstado && (
          <div className="text-muted-foreground text-sm mt-6 space-y-1">
            <p>
              <span className="align-super text-[10px]">1 </span>
              Consulta Prévia no Município + Tempo de Registro na Junta
              Comercial
            </p>
            <p>
              <span className="align-super text-[10px]">2 </span>
              Tempo de Registro na Junta Comercial
            </p>
          </div>
        )}
      </main>
      <Footer></Footer>
    </div>
  );
};

export default EstadoPage;
