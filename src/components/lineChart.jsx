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
  const regionKeys = Object.keys(rawPovertyData);
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
  return (
    
    <div className="grid grid-cols-4 gap-6 w-full">
      {/*MENU FILTER */}
      <div className="col-span-1 bg-slate-800 p-4 rounded-xl flex flex-col gap-4">
        {/* START YEAR SLIDER*/}
        <div className='flex justify-between text-xs text-slate-400'>
          <span>Start Year: <strong className='text-slate-400'>{startYear}</strong></span>
        </div>
        <input
          type='range'
          min={minYear}
          max={endYear}   //stops as it touches selected end year
          value={startYear}
          onChange={(e) => setStartYear(Number(e.target.value))}
          className="w-full cursor-pointer"
        />  
        {/* END YEAR SLIDER*/}
        <div className='flex justify-between text-xs text-slate-400'>
          <span>End Year: <strong className='text-slate-400'>{endYear}</strong></span>
        </div>
        <input
          type='range'
          min={startYear} //stops as it touches selected start year
          max={maxYear}
          value={endYear}
          onChange={(e) => setEndYear(Number(e.target.value))}
          className="w-full cursor-pointer"
        />  
      </div>
      

      {/* Line Chart */}
      <div className="col-span-3 h-[450px] bg-slate-900 p-4 rounded-xl">
        <ResponsiveContainer width='100%' height='100%'>
          <RechartsLineChart data={filteredData} margin={{top:20, right:30, left:0, bottom:10}}>
            <CartesianGrid strokeDasharray="3,3" stroke="#334155"/>
            <XAxis dataKey="year" stroke="#94a3b8"/>
            <YAxis stroke="#94a3b8" unit='%'/>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }} />
            <Legend
              wrapperStyle={{ paddingTop: '15px' }}
              formatter={(value) => (
                <span className="text-slate-300 text-sm font-medium">
                {REGION_CONFIG[value]?.name || value}
                </span>
              )}
            />

            {regionKeys.map((key) => (
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
