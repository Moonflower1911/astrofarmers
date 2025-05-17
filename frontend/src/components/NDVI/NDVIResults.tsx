'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface NDVIResultsProps {
  data: {
    stats: {
      mean: number;
      min: number;
      max: number;
    };
    interpretation: string;
    imagePath?: string;
    ndviValues?: number[];
  };
}

// Génère les 15 dernières dates entre J-17 et J-3
function generateLast15Dates(): string[] {
  const dates = [];
  const today = new Date();

  for (let i = 17; i >= 3; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

// Convertit un NDVI (0-1) en couleur RGB du rouge au vert
function ndviToColor(value: number): string {
  const red = Math.round(255 * (1 - value));
  const green = Math.round(255 * value);
  return `rgb(${red},${green},0)`;
}

export default function NDVIResults({ data }: NDVIResultsProps) {
  const chartData =
    data.ndviValues?.map((value, index) => {
      const dates = generateLast15Dates();
      return {
        date: dates[index] || `J-${17 - index}`,
        value,
        color: ndviToColor(value),
      };
    }) || [];

  return (
    <div className="bg-white dark:bg-boxdark p-4 rounded-lg shadow-default">
      <h2 className="text-xl font-bold text-black dark:text-white mb-4">
        NDVI Analysis Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-stroke dark:border-strokedark rounded-lg p-4">
          <h3 className="font-semibold mb-3">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-1 dark:bg-meta-4 p-3 rounded text-center">
              <p className="text-2xl font-bold text-primary">{data.stats.mean.toFixed(3)}</p>
              <p className="text-sm text-gray-6 dark:text-gray-3">Mean</p>
            </div>
            <div className="bg-gray-1 dark:bg-meta-4 p-3 rounded text-center">
              <p className="text-2xl font-bold text-green-500">{data.stats.max.toFixed(3)}</p>
              <p className="text-sm text-gray-6 dark:text-gray-3">Maximum</p>
            </div>
            <div className="bg-gray-1 dark:bg-meta-4 p-3 rounded text-center">
              <p className="text-2xl font-bold text-red-500">{data.stats.min.toFixed(3)}</p>
              <p className="text-sm text-gray-6 dark:text-gray-3">Minimum</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-1 dark:bg-meta-4 rounded">
            <h4 className="font-medium mb-2">Interpretation</h4>
            <p>{data.interpretation}</p>
          </div>
        </div>

        <div className="border border-stroke dark:border-strokedark rounded-lg overflow-hidden">
          <div className="relative h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis domain={[0, Math.max(0.3, ...chartData.map(d => d.value))]} stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '8px',
                    }}
                    formatter={(value: number) => [value.toFixed(3), 'NDVI']}
                  />
                  <Bar dataKey="value" name="NDVI">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 mt-20">No NDVI data available</p>
            )}
          </div>
        </div>
      </div>

      {/* {data.imagePath && (
        <div className="mt-4">
          <h3 className="font-bold text-black dark:text-white mb-2">NDVI Map</h3>
          <img
            src={`/${data.imagePath}`}
            alt="Carte NDVI"
            className="max-w-full h-auto rounded border border-stroke dark:border-strokedark"
          />
        </div>
      )} */}

      <div className="mt-6 p-4 bg-gray-1 dark:bg-meta-4 rounded-lg">
        <h3 className="font-bold text-black dark:text-white mb-2">NDVI Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FF0000] rounded-sm"></div>
            <span className="text-sm">0.0-0.2 (Bare soil)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FFFF00] rounded-sm"></div>
            <span className="text-sm">0.2-0.5 (Low vegetation)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#00FF00] rounded-sm"></div>
            <span className="text-sm">0.5-1.0 (Dense vegetation)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
