import React, { useState, useEffect, useCallback } from "react";
import { Trophy, Medal, Award, Calendar, Download, List } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getEstadoBySigla, estados } from "../data/estados";

// Mapeamento das métricas com nomes amigáveis
const metricas = {
  media_tempo_total_para_registro: "Tempo Total de Abertura de Empresas",
  tempo_medio_tempo_de_registro: "Tempo de Registro",
  tempo_medio_cp_nome: "Consulta de Nome",
  tempo_medio_cp_end: "Consulta de Endereço",
};

// As constantes não precisam de exportação
const ORDEM_MESES = [
  "janeiro",
  "fevereiro",
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

const mesesMap = {
  janeiro: "Janeiro",
  fevereiro: "Fevereiro",
  março: "Março",
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

// Ícones para cada posição
const iconMap = {
  1: Trophy,
  2: Medal,
  3: Medal,
};

// Cores para cada posição usando as cores especificadas
const colorMap = {
  1: "bg-gradient-to-b from-yellow-400 to-yellow-600", // Ouro
  2: "bg-gradient-to-b from-gray-300 to-gray-500", // Prata
  3: "bg-gradient-to-b from-orange-400 to-orange-600", // Bronze
};

// Alturas para cada posição - RESPONSIVAS
const heightMap = {
  1: "h-40 sm:h-56 lg:h-64", // Mobile menor, desktop maior
  2: "h-32 sm:h-48 lg:h-56", // Mobile menor, desktop maior
  3: "h-24 sm:h-40 lg:h-48", // Mobile menor, desktop maior
};

const Ranking = () => {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMetrica, setSelectedMetrica] = useState(
    "media_tempo_total_para_registro"
  );
  const [loading, setLoading] = useState(true);
  const [dadosEstados, setDadosEstados] = useState([]);

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const response = await fetch(`http://10.40.25.162:5000/api/periodos`);
        const result = await response.json();
        if (result.success && Object.keys(result.data).length > 0) {
          setPeriodos(result.data);
          const anoMaisRecente = Object.keys(result.data).sort(
            (a, b) => b - a
          )[0];
          const mesesDoAno = result.data[anoMaisRecente];
          const mesMaisRecente = mesesDoAno.sort(
            (a, b) =>
              ORDEM_MESES.indexOf(b.mes.toLowerCase()) -
              ORDEM_MESES.indexOf(a.mes.toLowerCase())
          )[0].mes;
          setSelectedYear(anoMaisRecente);
          setSelectedMonth(mesMaisRecente);
        }
      } catch (error) {
        console.error("Erro ao carregar períodos:", error);
      }
    };
    carregarDadosIniciais();
  }, []);

  const buscarDados = useCallback(async () => {
    if (!selectedMonth || !selectedYear) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://10.40.25.162:5000/api/dados?mes=${selectedMonth}&ano=${selectedYear}`
      );
      const result = await response.json();
      if (result.success) {
        // Ordenar baseado na métrica selecionada
        const dadosOrdenados = Object.entries(result.data).sort(
          ([, valorA], [, valorB]) => {
            if (
              selectedMetrica === "posicao" ||
              selectedMetrica === "posicao_registro"
            ) {
              return valorA[selectedMetrica] - valorB[selectedMetrica];
            } else if (selectedMetrica === "qtd_processo") {
              return valorB[selectedMetrica] - valorA[selectedMetrica]; // Maior quantidade primeiro
            } else {
              // Para métricas de tempo, converter para segundos para comparação
              const timeToSeconds = (timeStr) => {
                if (!timeStr || timeStr === "N/A") return 999999;
                const parts = timeStr.split(":");
                return (
                  parseInt(parts[0]) * 3600 +
                  parseInt(parts[1]) * 60 +
                  parseInt(parts[2])
                );
              };
              return (
                timeToSeconds(valorA[selectedMetrica]) -
                timeToSeconds(valorB[selectedMetrica])
              );
            }
          }
        );
        setDadosEstados(dadosOrdenados);
      } else {
        console.error("Erro na API:", result.error);
        setDadosEstados([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setDadosEstados([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedMetrica]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  // Lógica de renderização do pódio
  const getPodiumData = () => {
    if (!dadosEstados || dadosEstados.length === 0) {
      return [];
    }

    // Pega os 3 primeiros do array (já está ordenado pela métrica selecionada)
    const top3 = dadosEstados.slice(0, 3);

    // Mapeia para o formato que o componente do pódio espera
    const podiumWinners = top3.map(([uf, data], index) => ({
      position: index + 1, // Posição baseada na métrica selecionada
      estado: getEstadoBySigla(uf),
      sigla: uf,
      valor: data[selectedMetrica],
    }));

    // Reordena para o layout visual: 2º, 1º, 3º
    if (podiumWinners.length === 3) {
      return [podiumWinners[1], podiumWinners[0], podiumWinners[2]];
    }
    return podiumWinners;
  };

  const formatarValor = (valor, metrica) => {
    if (metrica === "qtd_processo") {
      return valor.toLocaleString();
    } else if (metrica === "posicao" || metrica === "posicao_registro") {
      return `#${valor}`;
    } else {
      return valor || "N/A";
    }
  };

  // Função para exportar tabela
  const exportarTabela = () => {
    if (!dadosEstados || dadosEstados.length === 0) return;

    const headers = ["Posição", "Estado", "UF", "Tempo"];
    const rows = dadosEstados.map(([uf, data], index) => {
      const estado = getEstadoBySigla(uf);
      return [
        index + 1,
        estado.nome,
        uf,
        formatarValor(data[selectedMetrica], selectedMetrica),
      ];
    });

    // Criar CSV
    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Download do arquivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const filename = `ranking_${metricas[selectedMetrica].replace(
      /\s+/g,
      "_"
    )}_${selectedMonth}_${selectedYear}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const orderedWinnersFromAPI = getPodiumData();

  if (loading && dadosEstados.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          titulo="Ranking"
          subtitulo="Classificação dos estados quanto aos tempos"
        />
        <div className="flex justify-center items-center py-20">
          <p className="text-lg" style={{ color: "#231f20" }}>
            Carregando dados...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        titulo="Ranking"
        subtitulo="Classificação dos estados quanto aos tempos"
      />

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Calendar className="w-5 h-5" />
              <span className="text-black">Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Métrica
                </label>
                <Select
                  value={selectedMetrica}
                  onValueChange={setSelectedMetrica}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a métrica" />
                  </SelectTrigger>
                  <SelectContent className="max-w-xs">
                    {Object.entries(metricas).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-sm">
                        {label}
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
                    {periodos &&
                      Object.keys(periodos).length > 0 &&
                      selectedYear &&
                      periodos[selectedYear] &&
                      periodos[selectedYear]
                        .sort(
                          (a, b) =>
                            ORDEM_MESES.indexOf(a.mes.toLowerCase()) -
                            ORDEM_MESES.indexOf(b.mes.toLowerCase())
                        )
                        .map((periodo) => (
                          <SelectItem key={periodo.mes} value={periodo.mes}>
                            {mesesMap[periodo.mes.toLowerCase()] || periodo.mes}
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
                    {periodos &&
                      Object.keys(periodos)
                        .sort((a, b) => b - a) // Anos mais recentes primeiro
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

        {/* SEÇÃO DO PÓDIO */}
        <div className="podio-ranking mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6" style={{ color: "#034ea2" }} />
                <h2 className="text-xl font-bold" style={{ color: "#034ea2" }}>
                  {metricas[selectedMetrica]}
                </h2>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedMonth && selectedYear && (
                  <span>
                    {" "}
                    {mesesMap[selectedMonth.toLowerCase()]} de {selectedYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading && <p className="text-center">Atualizando ranking...</p>}

          {!loading && orderedWinnersFromAPI.length > 0 ? (
            <div className="top3-ranking w-full mb-8 sm:mb-12">
              <div className="relative flex items-end justify-center gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8">
                {orderedWinnersFromAPI.map((winner) => {
                  const IconComponent = iconMap[winner.position] || Trophy;
                  const color = colorMap[winner.position] || "bg-gray-400";
                  const height = heightMap[winner.position] || "h-24";

                  return (
                    <div
                      key={winner.position}
                      className="flex flex-col items-center w-20 sm:w-32 lg:w-40 text-center"
                    >
                      <div className="mb-2 sm:mb-4 transform transition-all duration-300 hover:scale-105">
                        <div className="relative mb-2 sm:mb-3">
                          <div className="w-20 h-14 sm:w-32 sm:h-24 lg:w-40 lg:h-28 bg-gray-200 shadow-lg flex items-center justify-center border-2 sm:border-4 border-white overflow-hidden rounded-lg">
                            <img
                              src={`/bandeiras-brasileiras/${winner.sigla}.png`}
                              alt={`Bandeira de ${winner.estado.nome}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          {/* Ícone da Posição - Responsivo */}
                          <div
                            className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full ${color} flex items-center justify-center shadow-md`}
                          >
                            <IconComponent
                              size={12}
                              className="text-white sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                            />
                          </div>
                        </div>

                        {/* Texto abaixo do Avatar - Responsivo */}
                        <div>
                          <h3 className="font-semibold text-gray-800 text-xs sm:text-base lg:text-lg leading-tight">
                            {winner.estado.nome}
                          </h3>

                          <div
                            className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base font-medium"
                            style={{ color: "#034ea2" }}
                          >
                            {formatarValor(winner.valor, selectedMetrica)}
                          </div>
                        </div>
                      </div>

                      {/* Bloco do Pódio - Totalmente Responsivo */}
                      <div
                        className={`w-16 sm:w-28 lg:w-36 ${height} ${color} rounded-t-lg shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
                          <span className="text-white font-bold text-lg sm:text-3xl lg:text-4xl drop-shadow-lg">
                            {winner.position}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !loading && (
              <p className="text-gray-500 text-center">
                Não há dados de ranking para este período.
              </p>
            )
          )}
        </div>

        {/* SEÇÃO DA TABELA COMPLETA */}
        <div className="tabela-ranking">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <List className="w-6 h-6" style={{ color: "#034ea2" }} />
                <h2 className="text-xl font-bold" style={{ color: "#034ea2" }}>
                  Ranking Completo
                </h2>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{metricas[selectedMetrica]}</span>
                {selectedMonth && selectedYear && (
                  <span>
                    {" "}
                    • {mesesMap[selectedMonth.toLowerCase()]} de {selectedYear}
                  </span>
                )}
              </div>
            </div>
            {!loading && dadosEstados.length > 0 && (
              <Button
                onClick={exportarTabela}
                variant="outline"
                className="flex items-center gap-2 mt-4 sm:mt-0"
                style={{ borderColor: "#034ea2", color: "#034ea2" }}
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            )}
          </div>

          {!loading && dadosEstados.length > 0 ? (
            <Card className="border border-[#034ea2] mb-8 rounded-none py-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow style={{ backgroundColor: "#f8f9fa" }}>
                        <TableHead
                          className="font-semibold text-xs sm:text-sm"
                          style={{ color: "#034ea2" }}
                        >
                          POSIÇÃO
                        </TableHead>
                        <TableHead
                          className="font-semibold text-xs sm:text-sm"
                          style={{ color: "#034ea2" }}
                        >
                          ESTADO
                        </TableHead>
                        <TableHead
                          className="font-semibold text-xs sm:text-sm"
                          style={{ color: "#034ea2" }}
                        >
                          TEMPO
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosEstados.map(([uf, data], index) => {
                        const estado = getEstadoBySigla(uf);
                        const posicao = index + 1;

                        return (
                          <TableRow
                            key={uf}
                            className={`hover:bg-gray-50 ${
                              posicao <= 3 ? "bg-yellow-50" : ""
                            } cursor-pointer`}
                            onClick={() => navigate(`/${uf}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white ${
                                    posicao === 1
                                      ? "bg-yellow-500"
                                      : posicao === 2
                                      ? "bg-gray-400"
                                      : posicao === 3
                                      ? "bg-orange-500"
                                      : "bg-gray-300"
                                  }`}
                                >
                                  {posicao}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                  src={`/bandeiras-brasileiras/${uf}.png`}
                                  alt={`Bandeira de ${estado.nome}`}
                                  className="w-6 h-4 sm:w-8 sm:h-6 object-contain rounded border"
                                />
                                <div>
                                  <div className="font-medium text-xs sm:text-sm">
                                    {estado.nome}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {uf}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              className="font-medium text-xs sm:text-sm"
                              style={{ color: "#034ea2" }}
                            >
                              {formatarValor(
                                data[selectedMetrica],
                                selectedMetrica
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            !loading && (
              <p className="text-gray-500 text-center">
                Não há dados para exibir na tabela.
              </p>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Ranking;
