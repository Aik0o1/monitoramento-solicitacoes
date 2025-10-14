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

// Componente Reutilizável para o Gráfico de Comparação (Ajustado)
export const ComparisonChart = ({
  dataType,
  anosComparacao,
  dadosGraficoComparativo,
  loadingHistorico,
}) => {
  const colorPalette =
    dataType === "posicao"
      ? ["#007932", "#034ea2", "#fdb913", "#d9534f", "#5bc0de", "#f0ad4e"]
      : ["#034ea2", "#007932", "#fdb913", "#d9534f", "#5bc0de", "#f0ad4e"];

  // O conteúdo do gráfico em si
  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={dadosGraficoComparativo}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          reversed={true}
          domain={[1, "dataMax"]}
          allowDecimals={false}
          label={{ value: "Posição", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value, name) => [`${value}º`, `${name.split("_").pop()}`]}
        />
        <Legend wrapperStyle={{ paddingTop: "40px" }} />
        {anosComparacao
          .sort((a, b) => b - a)
          .map((ano, index) => (
            <Line
              key={ano}
              type="monotone"
              dataKey={`${dataType}_${ano}`}
              name={`${ano}`}
              stroke={colorPalette[index % colorPalette.length]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // Mensagem de "Carregando" ou "Sem dados"
  const placeholderContent = (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">
        {loadingHistorico
          ? "Carregando..."
          : "Selecione um ano para ver o gráfico."}
      </p>
    </div>
  );

  return dadosGraficoComparativo.length > 0 ? chartContent : placeholderContent;
};
