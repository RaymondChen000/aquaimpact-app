import PovertyLineChart from "./components/lineChart.jsx"

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold text-blue-400">
        AQUAIMPACT
      </h1>
      <p className="mt-3 text-slate-300 text-lg">
        Water & SDG Metrics Dashboard
      </p>

      <h2 className="text-2xl font-bold mt-16 mb-4">
        Poverty Chart
      </h2>
      <PovertyLineChart></PovertyLineChart>

    </div>
  )
}

export default App