import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Clock, Award } from "lucide-react";
import { estados } from "../data/estados";

const DestaqueDoMes = () => {
  const [destaqueData, setDestaqueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para obter o mês anterior
  const getMesAnterior = () => {
    const agora = new Date();
    const mesAtual = agora.getMonth(); // 0-11
    const anoAtual = agora.getFullYear();

    let mesAnterior, anoAnterior;

    if (mesAtual === 0) {
      // Se estamos em janeiro, o mês anterior é dezembro do ano passado
      mesAnterior = 11;
      anoAnterior = anoAtual - 1;
    } else {
      mesAnterior = mesAtual - 1;
      anoAnterior = anoAtual;
    }

    const nomesMeses = [
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

    return {
      mes: nomesMeses[mesAnterior],
      ano: anoAnterior.toString(),
    };
  };

  // Função para buscar dados com fallback para meses anteriores
  const buscarDadosComFallback = async (mesInicial, anoInicial) => {
    const nomesMeses = [
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

    let mesIndex = nomesMeses.indexOf(mesInicial);
    let ano = parseInt(anoInicial);

    // Tentar até 6 meses anteriores
    for (let tentativas = 0; tentativas < 6; tentativas++) {
      const mesAtual = nomesMeses[mesIndex];

      try {
        const response = await fetch(`http://localhost:5000/api/dados?mes=${mesAtual}&ano=${ano}`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            return { data: result.data, mes: mesAtual, ano: ano.toString() };
          }
        }
      } catch (error) {
        console.log(`Erro ao buscar dados para ${mesAtual}/${ano}:`, error);
      }

      // Ir para o mês anterior
      mesIndex--;
      if (mesIndex < 0) {
        mesIndex = 11;
        ano--;
      }
    }

    throw new Error(
      "Não foi possível encontrar dados para nenhum dos últimos 6 meses"
    );
  };

  useEffect(() => {
    const carregarDestaque = async () => {
      try {
        setLoading(true);
        const { mes, ano } = getMesAnterior();

        const resultado = await buscarDadosComFallback(mes, ano);

        // Encontrar o estado com posição 1
        const estadoPrimeiro = Object.entries(resultado.data).find(
          ([sigla, dados]) => dados.posicao === 1
        );

        if (estadoPrimeiro) {
          const [sigla, dados] = estadoPrimeiro;
          const infoEstado = estados.find((e) => e.sigla === sigla);

          setDestaqueData({
            sigla,
            nome: infoEstado?.nome || sigla,
            regiao: infoEstado?.regiao || "",
            dados,
            mes: resultado.mes,
            ano: resultado.ano,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar destaque do mês:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    carregarDestaque();
  }, []);

  if (loading) {
    return (
      <div className="mb-4 sm:mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-4 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !destaqueData) {
    return null; // Não mostrar nada se houver erro
  }

  const formatarMes = (mes) => {
    const mesesFormatados = {
      janeiro: "Janeiro",
      fevereiro: "Fevereiro",
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
    return mesesFormatados[mes] || mes;
  };

  return (
    <div className="mb-4 sm:mb-8 px-2 sm:px-0">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-1 shadow-2xl">
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

        {/* Decorações de fundo - ocultas em mobile */}
        <div className="hidden sm:block absolute top-4 right-4 opacity-20">
          <Star className="w-12 h-12 lg:w-16 lg:h-16 text-white animate-pulse" />
        </div>
        <div className="hidden sm:block absolute bottom-4 left-4 opacity-10">
          <Award className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
        </div>

        <div className="relative bg-white rounded-xl p-3 sm:p-6">
          {/* Badge de destaque */}
          <div className="absolute -top-2 sm:-top-1 left-3 sm:left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
            Destaque - {formatarMes(destaqueData.mes)} de {destaqueData.ano}
          </div>

          <div className="pt-3 sm:pt-4">
            {/* Header principal - layout responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
              <div className="rounded-lg p-3 flex items-center space-x-3 sm:space-x-4flex sm:space-x-4">
                <div className="relative flex-shrink-0">
                  {/* Círculo dourado com efeito de brilho */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  {/* Efeito de brilho ao redor */}
                  <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400/40 to-orange-500/40 rounded-full animate-ping"></div>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    1º LUGAR
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 font-semibold leading-tight">
                    Ranking Geral - Tempo de Abertura de Empresas
                  </p>
                </div>
              </div>

              <a
                href={`https://rankingnacional.jucepi.pi.gov.br/${destaqueData.sigla}`}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline block"
              >
                <div className="rounded-lg p-3 border border-blue-100 flex max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-3 justify-between items-center">
                  <div className="estado flex gap-2 items-center">
                    <img
                      src={`/bandeiras-brasileiras/${destaqueData.sigla}.png`}
                      alt={`Bandeira de ${destaqueData.nome}`}
                      className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded border-2 border-white shadow-md"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div>
                      <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">
                        {destaqueData.nome}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 font-semibold leading-tight">
                        {destaqueData.regiao}
                      </p>
                    </div>
                  </div>

                  <div className="tempo-estado">
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {destaqueData.dados.media_tempo_total_para_registro}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 font-semibold leading-tight">
                      Tempo Médio de Abertura
                    </p>
                  </div>
                </div>
              </a>
            </div>

            {/* Métricas adicionais - layout responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div className="rounded-lg p-3 border border-blue-100">
                <div className="text-xs text-gray-600 font-semibold mb-1 leading-tight">
                  Ranking - Tempo de Registro
                </div>
                <div className="text-base sm:text-lg font-bold text-blue-700">
                  {destaqueData.dados.posicao_registro}º lugar -{" "}
                  {destaqueData.dados.tempo_medio_tempo_de_registro}
                </div>
              </div>

              <div className="rounded-lg p-3 border border-blue-100">
                <div className="text-xs text-gray-600 font-semibold mb-1">
                  Quantidade de solicitações
                </div>
                <div className="text-base sm:text-lg font-bold text-green-700">
                  {destaqueData.dados.qtd_processo}
                </div>
              </div>
            </div>

            {/* Período */}
            {/* <div className="text-center py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <p className="text-xs sm:text-sm font-semibold text-indigo-800 px-2">
                📅 Dados referentes a {formatarMes(destaqueData.mes)} de{" "}
                {destaqueData.ano}
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestaqueDoMes;
