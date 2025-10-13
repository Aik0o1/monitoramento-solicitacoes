import React, { useState, useEffect, useRef } from "react";
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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ORDEM_MESES = [
  "janeiro",
  "fevereiro",
  "marco",
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
  const siglaEstado = siglaDaUrl ? siglaDaUrl.toUpperCase() : "";

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [dadosEstado, setDadosEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState({});
  const navigate = useNavigate();
  const estado = getEstadoBySigla(siglaEstado);

  const [anosComparacao, setAnosComparacao] = useState([]);
  const [dadosGraficoComparativo, setDadosGraficoComparativo] = useState([]);
  const dadosHistoricosCompletosRef = useRef({});
  const [loadingHistorico, setLoadingHistorico] = useState(true);

  useEffect(() => {
    setDadosEstado(null);
    setDadosGraficoComparativo([]);
    setAnosComparacao([]);
    dadosHistoricosCompletosRef.current = {};
  }, [siglaEstado]);

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
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL_API}/api/periodos`
        );
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
    const preCarregarHistoricoCompleto = async () => {
      if (!siglaEstado || Object.keys(periodosDisponiveis).length === 0) return;

      setLoadingHistorico(true);
      const anosParaBuscar = Object.keys(periodosDisponiveis);

      const promises = anosParaBuscar.map((ano) =>
        fetch(
          `${
            import.meta.env.VITE_URL_API
          }/api/dados-anuais/${siglaEstado}/${ano}`
        )
          .then((res) => res.json())
          .then((result) => ({ ano, result }))
      );

      try {
        const resultados = await Promise.allSettled(promises);
        const dadosAnuais = {};
        resultados.forEach((item) => {
          if (item.status === "fulfilled") {
            const { ano, result } = item.value;
            if (result.success && result.data[siglaEstado]) {
              dadosAnuais[ano] = result.data[siglaEstado];
            }
          } else {
            console.error(
              `Falha ao carregar dados do ano: ${item.reason?.toString()}`
            );
          }
        });
        dadosHistoricosCompletosRef.current = dadosAnuais;
      } catch (error) {
        console.error("Erro massivo ao buscar histórico completo:", error);
      } finally {
        setLoadingHistorico(false);
      }
    };

    preCarregarHistoricoCompleto();
  }, [siglaEstado, periodosDisponiveis]);

  useEffect(() => {
    if (Object.keys(periodosDisponiveis).length > 0) {
      const anoMaisRecente = Object.keys(periodosDisponiveis).sort(
        (a, b) => b - a
      )[0];
      const mesesDoAno = periodosDisponiveis[anoMaisRecente];
      if (mesesDoAno && mesesDoAno.length > 0) {
        const mesMaisRecente = mesesDoAno.sort(
          (a, b) =>
            ORDEM_MESES.indexOf(b.mes.toLowerCase()) -
            ORDEM_MESES.indexOf(a.mes.toLowerCase())
        )[0].mes;
        setSelectedYear(anoMaisRecente);
        setSelectedMonth(mesMaisRecente);
      }
    }
  }, [periodosDisponiveis]);

  useEffect(() => {
    if (!loadingHistorico && selectedYear) {
      setAnosComparacao([selectedYear]);
    }
  }, [loadingHistorico, selectedYear]);

  // LÓGICA: Busca os dados para os CARDS da página principal.
  useEffect(() => {
    const buscarDados = async () => {
      if (!selectedMonth || !selectedYear || !estado) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_URL_API}/api/dados/${
            estado.sigla
          }?mes=${selectedMonth}&ano=${selectedYear}`
        );
        const result = await response.json();
        if (result.success) {
          setDadosEstado(result.data);
        } else {
          setDadosEstado(null);
        }
      } catch (error) {
        setDadosEstado(null);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
    // AÇÃO: A função buscarHistorico() foi removida daqui por ser redundante.
  }, [selectedMonth, selectedYear, siglaEstado]);

  const handleEstadoChange = (novaSigla) => {
    if (novaSigla && novaSigla !== siglaEstado) {
      navigate(`/${novaSigla}`);
    }
  };

  const transformarDadosParaGraficoComparativo = (dadosPorAno) => {
    const dadosFormatados = ORDEM_MESES.map((mes) => {
      const entradaMes = { name: mesesMap[mes] || mes };
      for (const ano in dadosPorAno) {
        if (dadosPorAno[ano] && dadosPorAno[ano][mes]) {
          entradaMes[`posicao_${ano}`] = dadosPorAno[ano][mes].posicao;
          entradaMes[`posicao_registro_${ano}`] =
            dadosPorAno[ano][mes].posicao_registro;
        }
      }
      return entradaMes;
    }).filter((m) => m.name); // Garante que meses como "marco" não criem entradas vazias
    setDadosGraficoComparativo(dadosFormatados);
  };

  useEffect(() => {
    if (loadingHistorico || anosComparacao.length < 1) {
      setDadosGraficoComparativo([]);
      return;
    }
    const dadosColetados = {};
    for (const ano of anosComparacao) {
      if (dadosHistoricosCompletosRef.current[ano]) {
        dadosColetados[ano] = dadosHistoricosCompletosRef.current[ano];
      }
    }
    transformarDadosParaGraficoComparativo(dadosColetados);
  }, [anosComparacao, loadingHistorico]);

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
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const CheckboxComparacao = () => (
    <div className="border-t border-b border-border py-4 my-4">
      <p className="text-sm font-medium text-foreground mb-3">
        Comparar com outros anos:
      </p>
      {loadingHistorico ? (
        <p className="text-sm text-muted-foreground">
          Carregando dados históricos...
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-4">
          {Object.keys(periodosDisponiveis)
            .sort((a, b) => b - a)
            .map((ano) => (
              <div key={ano} className="flex items-center space-x-2">
                <Checkbox
                  id={`compare-${ano}-modal`}
                  checked={anosComparacao.includes(ano)}
                  onCheckedChange={(checked) => {
                    setAnosComparacao((prev) =>
                      checked ? [...prev, ano] : prev.filter((a) => a !== ano)
                    );
                  }}
                  disabled={!dadosHistoricosCompletosRef.current[ano]}
                />
                <Label
                  htmlFor={`compare-${ano}-modal`}
                  className="cursor-pointer"
                >
                  {ano}
                </Label>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="page-header py-6 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 w-full">
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

            <div className="flex flex-row-reverse sm:flex-row-reverse gap-3 sm:gap-4 justify-center sm:border-r sm:border-white/20 sm:pr-6 lg:justify-end w-full lg:w-auto lg:flex-shrink-0 order-2 lg:order-none items-center">
              <div className="flex flex-col text-center sm:text-left text-xs sm:text-sm ">
                <span className="font-bold text-white">JUNTA COMERCIAL</span>
                <span className="text-blue-100">DO PIAUÍ - JUCEPI</span>
              </div>
              <img
                src="/logo/logo-rodape.png"
                alt="Governo do Piauí"
                className="h-9 sm:h-11 w-auto"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:flex-1 order-3 lg:order-none">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={`/bandeiras-brasileiras/${estado.sigla}.png`}
                    alt={`Bandeira de ${estado.nome}`}
                    className="w-14 h-10 sm:w-12 sm:h-8 md:w-14 md:h-9 object-cover rounded border-2 border-white/20 shadow-sm"
                  />
                </div>

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
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
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
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Estado
                </Label>
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
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Mês
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(periodosDisponiveis).length > 0 &&
                      [
                        ...new Set(
                          Object.values(periodosDisponiveis)
                            .flat()
                            .map((p) => p.mes)
                        ),
                      ]
                        .sort(
                          (a, b) =>
                            ORDEM_MESES.indexOf(a) - ORDEM_MESES.indexOf(b)
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
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Ano
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(periodosDisponiveis)
                      .sort((a, b) => b - a)
                      .map((ano) => (
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
                    Ranking Geral - Tempo de Abertura de Empresas
                    <span className="text-sm text-muted-foreground align-super">
                      {" "}
                      1
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-[#007932]">
                    {dadosEstado.posicao}º
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dadosEstado.periodo_filtrado}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ver evolução
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{`Evolução - Ranking Geral (${estado.nome})`}</DialogTitle>
                      <DialogDescription>
                        Acompanhe a evolução da posição e compare com outros
                        anos.
                      </DialogDescription>
                    </DialogHeader>
                    <CheckboxComparacao />
                    <div className="w-full h-96 mt-4">
                      {dadosGraficoComparativo.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dadosGraficoComparativo}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              reversed={true}
                              domain={[1, "dataMax"]}
                              allowDecimals={false}
                              label={{
                                value: "Posição",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              formatter={(value, name) => [
                                `${value}º`,
                                `${name}`,
                              ]}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            {anosComparacao
                              .sort((a, b) => b - a)
                              .map((ano, index) => (
                                <Line
                                  key={ano}
                                  type="monotone"
                                  dataKey={`posicao_${ano}`}
                                  name={`${ano}`}
                                  stroke={
                                    [
                                      "#007932",
                                      "#034ea2",
                                      "#fdb913",
                                      "#d9534f",
                                      "#5bc0de",
                                      "#f0ad4e",
                                    ][index % 6]
                                  }
                                  strokeWidth={2}
                                  activeDot={{ r: 8 }}
                                />
                              ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            {loadingHistorico
                              ? "Carregando..."
                              : "Selecione um ano para ver o gráfico."}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Trophy className="w-5 h-5 text-[#007932]" />
                  <span>
                    Ranking - Tempo de Registro
                    <span className="text-sm text-muted-foreground align-super">
                      {" "}
                      2
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-[#007932]">
                    {dadosEstado.posicao_registro}º
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {dadosEstado.periodo_filtrado}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Ver evolução
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>{`Evolução - Ranking de Tempo de Registro (${estado.nome})`}</DialogTitle>
                      <DialogDescription>
                        Acompanhe a evolução da posição e compare com outros
                        anos.
                      </DialogDescription>
                    </DialogHeader>
                    <CheckboxComparacao />
                    <div className="w-full h-96 mt-4">
                      {dadosGraficoComparativo.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={dadosGraficoComparativo}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              reversed={true}
                              domain={[1, "dataMax"]}
                              allowDecimals={false}
                              label={{
                                value: "Posição",
                                angle: -90,
                                position: "insideLeft",
                              }}
                            />
                            <Tooltip
                              formatter={(value, name) => [
                                `${value}º`,
                                `${name}`,
                              ]}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            {anosComparacao
                              .sort((a, b) => b - a)
                              .map((ano, index) => (
                                <Line
                                  key={ano}
                                  type="monotone"
                                  dataKey={`posicao_registro_${ano}`}
                                  name={`${ano}`}
                                  stroke={
                                    [
                                      "#034ea2",
                                      "#007932",
                                      "#fdb913",
                                      "#d9534f",
                                      "#5bc0de",
                                      "#f0ad4e",
                                    ][index % 6]
                                  }
                                  strokeWidth={2}
                                  activeDot={{ r: 8 }}
                                />
                              ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            {loadingHistorico
                              ? "Carregando..."
                              : "Selecione um ano para ver o gráfico."}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
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

        {!dadosEstado && (loading || loadingHistorico) && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados...</p>
            </CardContent>
          </Card>
        )}
        {!dadosEstado && !loading && !loadingHistorico && (
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

        {dadosEstado && (
          <div className="text-muted-foreground text-sm mt-6 space-y-1">
            <p>
              <span className="align-super text-[10px]">1 </span> Consulta
              Prévia no Município + Tempo de Registro na Junta Comercial
            </p>
            <p>
              <span className="align-super text-[10px]">2 </span> Tempo de
              Registro na Junta Comercial
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EstadoPage;
