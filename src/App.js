import React, { useState, useEffect } from "react";
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
  Thermometer,
  Droplets,
  Sun,
  Calendar,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import "./App.css";

export default function SensorDashboard() {
  const [summary, setSummary] = useState(null);
  const [all, setAll] = useState(null);
  const [monthYear, setMonthYear] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const API_URL = "http://localhost:3001/api/sensor";

  const fetchData = async () => {
    try {
      setLoading(true);

      const summaryRes = await fetch(`${API_URL}/summary`);
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const allRes = await fetch(`${API_URL}/all`);
      const allData = await allRes.json();
      setAll(allData);

      const monthRes = await fetch(`${API_URL}/month-year-max`);
      const monthData = await monthRes.json();
      setMonthYear(monthData);

      const latestRes = await fetch(`${API_URL}/latest`);
      const latestReading = await latestRes.json();
      setLatestData(latestReading);

      const chartRes = await fetch(`${API_URL}/data?limit=20`);
      const chartDataRes = await chartRes.json();
      setChartData(chartDataRes.data.reverse());

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, title, value, unit, color }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>
            {value !== null && value !== undefined ? value.toFixed(2) : "--"}
            <span className="text-lg ml-1">{unit}</span>
          </p>
        </div>
        <Icon size={48} style={{ color }} className="opacity-20" />
      </div>
    </div>
  );

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-xl">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              UTS IoT Rizki Saepul Aziz 152023146
            </h1>
            <p className="text-gray-600">
              Monitoring Sensor dari API Backend yang di berikan data dari MQTT
            </p>
          </div>
          <button
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>

        {/* Last Update */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-sm text-gray-600">
            Diupdate terakhir pada :{" "}
            <span className="font-semibold">{lastUpdate.toLocaleString()}</span>
          </p>
        </div>

        {latestData && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp /> Data Terbaru
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Thermometer}
                title="Temperatur"
                value={latestData.suhu}
                unit="°C"
                color="#ef4444"
              />
              <StatCard
                icon={Droplets}
                title="Kelembaban"
                value={latestData.humidity}
                unit="%"
                color="#3b82f6"
              />
              <StatCard
                icon={Sun}
                title="Intensitas Cahaya"
                value={latestData.lux}
                unit="lux"
                color="#f59e0b"
              />
            </div>
          </div>
        )}

        {summary && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Statistik Temperatur
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm font-medium">Maksimum</p>
                <p className="text-3xl font-bold text-red-500 mt-2">
                  {summary.suhumax?.toFixed(2)} °C
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm font-medium">Minimum</p>
                <p className="text-3xl font-bold text-blue-500 mt-2">
                  {summary.suhumin?.toFixed(2)} °C
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm font-medium">Rata-rata</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {summary.suhurata?.toFixed(2)} °C
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Grafik Sensor
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(time) => new Date(time).toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="suhu"
                stroke="#ef4444"
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                name="Humidity (%)"
              />
              <Line
                type="monotone"
                dataKey="lux"
                stroke="#f59e0b"
                name="Light (lux)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {all && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              Data Sensor
            </h2>

            <div class="relative overflow-x-auto">
              <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3">
                      No
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Suhu
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Kelembaban
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Intensitas Cahaya
                    </th>
                    <th scope="col" class="px-6 py-3">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {all.length > 0 ? (
                    all.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">{item.suhu?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {item.humidity?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">{item.lux?.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-gray-500 italic"
                      >
                        Tidak ada data sensor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {monthYear && monthYear.month_year_max && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar /> Maksimum Tahun
            </h2>
            <div className="flex gap-4">
              {monthYear.month_year_max.map((item, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg px-6 py-3">
                  <p className="text-blue-700 font-semibold text-lg">
                    {item.month_year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
