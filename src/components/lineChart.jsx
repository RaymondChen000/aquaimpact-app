import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import rawPovertyData from '../data/povertyHistory.json'; 
import { data } from 'autoprefixer';

//config 
const REGION_CONFIG = {
  WLD: { name: 'World', color: '#3b82f6' },
  SSF: { name: 'Sub-Saharan Africa', color: '#ef4444' },
  LCN: { name: 'Latin America', color: '#10b981' },
  SAS: { name: 'South Asia', color: '#f59e0b' },
  EAS: { name: 'East Asia & Pacific', color: '#8b5cf6' },
  ECS: { name: 'Europe & Central Asia', color: '#ec4899' },
  MEA: { name: 'Middle East & N. Africa', color: '#06b6d4'}
};

//transform data helper func
function transformPovertyData(data){
  if(!data) return [];
  const yearMap = {};
  Object.entries(data).forEach(([regionKey, records]) => {
    records.forEach(({year, value}) => {
      if(!yearMap[year]) yearMap[year] = {year};
      yearMap[year][regionKey] = value;
    });
  });

  return Object.values(yearMap).sort((a,b) => a.year - b.year);
}

export default function PovertyLineChart(){

  const regionKeys = useMemo(() => Object.keys(rawPovertyData), []);
  const [selectedRegions, setSelectedRegions] = useState(regionKeys);
  const fullChartData = useMemo(() => transformPovertyData(rawPovertyData), []);

  const availableYears = useMemo(() => {
    return fullChartData.map((d) => d.year);
  }, [fullChartData]);

  const [startYear, setStartYear] = useState(availableYears[0] || 2015);
  const [endYear, setEndYear] = useState(availableYears[availableYears.length -1] || 2024);
  const [viewMode, setViewMode] = useState('combined');

  const filteredData = useMemo(() => {
    return fullChartData.filter((d) => d.year >= startYear && d.year <= endYear);
  }, [fullChartData, startYear, endYear]);

  const minYear = 2015;
  const maxYear = 2024;

  // toggle region func
  const handleToggleRegion = (regionCode) => {
    setSelectedRegions((prevSelected) => {
      if (prevSelected.includes(regionCode)){
        return prevSelected.filter((code) => code !==regionCode);
      }
      return [...prevSelected, regionCode];
    });
  };

  // download data csv
  const handleDownloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const activeKeys = ['year', ...selectedRegions];

    const headerRow = activeKeys
      .map((key) => {
        if (key === 'year') return 'Year';
        return `"${REGION_CONFIG[key]?.name || key}"`;
      })
      .join(',');

    const dataRows = filteredData.map((row) => {
      return activeKeys
        .map((key) => {
          const val = row[key];
          return val !== undefined && val !== null ? val : '';
        })
        .join(',');
    });

    const csvContent = [headerRow, ...dataRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Poverty_Data_${startYear}-${endYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-6 gap-6 w-full">
      {/*MENU FILTER */}      
      <div className="col-span-2 bg-slate-800 p-4 rounded-xl flex flex-col gap-4">
        <h3 className="text-white text-lg font-semibold flex justify-center items-center">Filter</h3>
        <span>Range: <strong className='text-white text-sm'>{startYear}-{endYear}</strong></span>
        {/*SLIDER*/}
        <div className="grid w-full items-center">
          <div className="col-start-1 row-start-1 w-full h-1.5 bg-white/80 rounded-full" />
          <input
            type='range'
            min={minYear}
            max={maxYear}  
            value={startYear}
            className="col-start-1 row-start-1 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto z-30"          onChange={(e) => {
              const newValue = Number(e.target.value);
              if(newValue<=endYear){
                setStartYear(newValue);
              }
            }}
          />  
          <input
            type='range'
            min={minYear} 
            max={maxYear}
            value={endYear}
            className="col-start-1 row-start-1 w-full appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto z-40"
            onChange={(e) => {
              const newValue = Number(e.target.value);
              if(newValue>=startYear){
                setEndYear(newValue);
              }
            }}
          />  
        </div>
        {/*Checkbox*/}
        <div className='flex flex-wrap gap-x-4 gap-y-2 mb-4'>
          {Object.entries(REGION_CONFIG).map(([code, config]) =>(
            <div key = {code} className="flex items-center mb-4">
              <input 
                id={"checkbox-${code}"} 
                type="checkbox" 
                value={code} 
                checked={selectedRegions.includes(code)}
                className="w-4 h-4 rounded cursor-pointer"
                onChange={()=> handleToggleRegion(code)}
                />
              <label className="select-none ms-2 text-sm font-medium">{code}</label>
            </div>
          ))}
        </div>

        {/* BUTTON FOR DOWNLOAD */}
        <button
          onClick={handleDownloadCSV}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4">
          {/* Download / Table Icon */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Data (CSV)
        </button>

      </div>
      {/* Line Chart */}
      <div className="col-span-4 h-[450px] bg-slate-900 p-4 rounded-xl">
        <ResponsiveContainer width='100%' height='100%'>
          <RechartsLineChart data={filteredData} margin={{top:20, right:30, left:0, bottom:10}}>
            <CartesianGrid strokeDasharray="3,3" stroke="#334155"/>
            <XAxis dataKey="year" stroke="#94a3b8"/>
            <YAxis stroke="#94a3b8" unit='%'/>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
            <Legend
              wrapperStyle={{ paddingTop: '15px' }}
              formatter={(value) =>{
                let displayName = value;
                if (REGION_CONFIG[value] && REGION_CONFIG[value.name]){
                  displayName = REGION_CONFIG[value].name;
                }
                return(
                  <span className='text-slate-300 text-sm font-medium'>
                    {displayName}
                  </span>
                );
              }}
            />

            {selectedRegions.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={REGION_CONFIG[key]?.name || key}
                stroke={REGION_CONFIG[key]?.color || '#cbd5e1'}
                strokeWidth={2}
                connectNulls={true}
              />
            ))}

          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
