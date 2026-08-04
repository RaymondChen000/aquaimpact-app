import fs from 'node:fs';

const regions = [
  'WLD', // World
  'SSF', // Sub-Saharan Africa
  'LCN', // Latin America & Caribbean
  'SAS', // South Asia
  'EAS', // East Asia & Pacific
  'ECS', // Europe & Central Asia
  'MEA'  // Middle East & North Africa
];
const indicator = 'SI.POV.DDAY';

async function fetchRegionPoverty(regionCode){
    console.log(`Fetching ${regionCode}`);

    const url = `https://api.worldbank.org/v2/country/${regionCode}/indicator/${indicator}?date=2015:2024&format=json&per_page=1000`;
    try{
        const response = await fetch(url);
        if(!response.ok) return [];
        
        const [metadata, records] = await response.json();
        if (!Array.isArray(records)) return [];

        //transform the data
        //filter out years where value is null and then turn into clean obj with year and value properties, it is then sorted
        const history = records
            .filter(entry=> entry?.value!=null)
            .map(entry=> ({
                year: parseInt(entry.date, 10),
                value: parseFloat(entry.value.toFixed(1))
            }))
            .sort((a,b) => a.year - b.year);
        return history;

    }catch(error){
        return [];
    }
}

async function main(){
    const povertyHistoryMap = {};
    //go through each region to get the data
    for(const code of regions){
        try{
            povertyHistoryMap[code] = await fetchRegionPoverty(code);
            console.log(`✅ Fetched ${code}`);
        }catch(error){
            console.error(`❌ Failed to fetch ${code}:`, error.message);
            povertyHistoryMap[code] = []; //lets rest of regions to go on
        }
    }    
    //save to json file
    fs.mkdirSync('src/data', { recursive: true });
    fs.writeFileSync('src/data/povertyHistory.json', JSON.stringify(povertyHistoryMap, null, 2));
    console.log('✅ Successfully written to src/data/povertyHistory.json');
}

main();
