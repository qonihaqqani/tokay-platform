// Mock weather service for free deployment
// Simulates weather data for Malaysian locations

const malaysianLocations = {
  'kuala lumpur': { lat: 3.1390, lng: 101.6869, state: 'Wilayah Persekutuan' },
  'penang': { lat: 5.4164, lng: 100.3327, state: 'Pulau Pinang' },
  'johor bahru': { lat: 1.4927, lng: 103.7414, state: 'Johor' },
  'kelantan': { lat: 6.1255, lng: 102.2381, state: 'Kelantan' },
  'terengganu': { lat: 5.3135, lng: 103.1380, state: 'Terengganu' },
  'sabah': { lat: 5.9804, lng: 116.0753, state: 'Sabah' },
  'sarawak': { lat: 1.5533, lng: 110.3592, state: 'Sarawak' },
  'perak': { lat: 4.5975, lng: 101.0901, state: 'Perak' },
  'selangor': { lat: 3.0733, lng: 101.5183, state: 'Selangor' },
  'melaka': { lat: 2.2075, lng: 102.2515, state: 'Melaka' }
};

const weatherConditions = [
  { condition: 'Cerah', icon: 'sunny', risk: 'low' },
  { condition: 'Sebahagian Berawan', icon: 'partly-cloudy', risk: 'low' },
  { condition: 'Berawan', icon: 'cloudy', risk: 'medium' },
  { condition: 'Hujan Rehat', icon: 'light-rain', risk: 'medium' },
  { condition: 'Hujan Lebat', icon: 'heavy-rain', risk: 'high' },
  { condition: 'Ribut Petir', icon: 'thunderstorm', risk: 'critical' }
];

const floodProneAreas = [
  'kelantan', 'terengganu', 'pahang', 'johor', 'perak', 'selangor'
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateFloodRisk(location, weatherCondition, rainfall) {
  let baseRisk = 0;
  
  // Location-based risk
  if (floodProneAreas.some(area => location.toLowerCase().includes(area))) {
    baseRisk += 30;
  }
  
  // Weather-based risk
  switch (weatherCondition.risk) {
    case 'critical': baseRisk += 50; break;
    case 'high': baseRisk += 35; break;
    case 'medium': baseRisk += 20; break;
    case 'low': baseRisk += 5; break;
  }
  
  // Rainfall impact
  if (rainfall > 60) baseRisk += 25;
  else if (rainfall > 30) baseRisk += 15;
  else if (rainfall > 10) baseRisk += 5;
  
  // Monsoon season (November to March)
  const month = new Date().getMonth();
  if (month >= 10 || month <= 2) {
    baseRisk += 15;
  }
  
  return Math.min(baseRisk, 100);
}

function getWeatherAdvice(floodRisk, weatherCondition) {
  const advice = [];
  
  if (floodRisk > 70) {
    advice.push('⚠️ AMARAN BANJIR: Sila bersiap sedia untuk evakuasi');
    advice.push('Pindahkan barang-barang penting ke tempat tinggi');
    advice.push('Pastikan telefon bimbit dicas penuh');
  } else if (floodRisk > 40) {
    advice.push('🌧️ Berwaspada: Risiko banjir sederhana');
    advice.push('Pantau berita dan isyarat banjir');
    advice.push('Sediakan beg kecemasan');
  }
  
  if (weatherCondition.condition.includes('Hujan Lebat') || weatherCondition.condition.includes('Ribut')) {
    advice.push('🌩️ Elakkan aktiviti luar');
    advice.push('Jangan parking kenderaan di kawasan rendah');
  }
  
  if (advice.length === 0) {
    advice.push('☀️ Cuaca elok, sesuai untuk aktiviti perniagaan');
  }
  
  return advice;
}

exports.getMockWeatherData = async (location) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const locationKey = location.toLowerCase();
  const locationInfo = Object.keys(malaysianLocations).find(key => 
    locationKey.includes(key) || key.includes(locationKey)
  ) || 'kuala lumpur';
  
  const weatherCondition = getRandomElement(weatherConditions);
  const temperature = 25 + Math.random() * 10; // 25-35°C typical for Malaysia
  const humidity = 65 + Math.random() * 30; // 65-95% typical
  const rainfall = Math.random() * 100; // 0-100mm
  const windSpeed = 5 + Math.random() * 25; // 5-30 km/h
  
  const floodRisk = calculateFloodRisk(locationInfo, weatherCondition, rainfall);
  const advice = getWeatherAdvice(floodRisk, weatherCondition);
  
  return {
    location: {
      name: locationInfo.charAt(0).toUpperCase() + locationInfo.slice(1),
      ...malaysianLocations[locationInfo]
    },
    current: {
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      rainfall: Math.round(rainfall * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      condition: weatherCondition.condition,
      icon: weatherCondition.icon,
      visibility: 5 + Math.random() * 10, // 5-15 km
      uvIndex: Math.round(1 + Math.random() * 10), // 1-11
      pressure: 1008 + Math.random() * 8 // 1008-1016 hPa
    },
    risk: {
      flood: {
        level: floodRisk,
        status: floodRisk > 70 ? 'critical' : floodRisk > 40 ? 'high' : floodRisk > 20 ? 'medium' : 'low',
        percentage: Math.round(floodRisk)
      },
      overall: {
        level: floodRisk > 50 ? floodRisk : Math.max(floodRisk, 20),
        status: floodRisk > 70 ? 'critical' : floodRisk > 40 ? 'high' : floodRisk > 20 ? 'medium' : 'low'
      }
    },
    alerts: floodRisk > 40 ? [{
      type: 'weather',
      severity: floodRisk > 70 ? 'critical' : 'warning',
      title: floodRisk > 70 ? 'Amaran Banjir' : 'Amaran Cuaca Buruk',
      message: floodRisk > 70 
        ? `Risiko banjir tinggi di ${locationInfo}. Sila ambil langkah berjaga-jaga.`
        : `Cuaca buruk dijangka di ${locationInfo}. Berwaspada.`,
      timestamp: new Date().toISOString()
    }] : [],
    advice: advice,
    forecast: Array.from({ length: 5 }, (_, i) => {
      const futureCondition = getRandomElement(weatherConditions);
      const futureTemp = temperature + (Math.random() - 0.5) * 5;
      const futureRain = Math.random() * 80;
      
      return {
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        condition: futureCondition.condition,
        icon: futureCondition.icon,
        temperature: {
          min: Math.round((futureTemp - 3) * 10) / 10,
          max: Math.round((futureTemp + 3) * 10) / 10
        },
        rainfall: Math.round(futureRain * 10) / 10,
        floodRisk: Math.round(calculateFloodRisk(locationInfo, futureCondition, futureRain))
      };
    }),
    lastUpdated: new Date().toISOString(),
    source: 'Tokay Weather Service (Mock)',
    disclaimer: 'Ini adalah data simulasi untuk tujuan demonstrasi. Sila rujuk MET Malaysia untuk data sebenar.'
  };
};

exports.getFloodProneAreas = () => {
  return floodProneAreas.map(area => ({
    name: area.charAt(0).toUpperCase() + area.slice(1),
    state: malaysianLocations[area]?.state || 'Unknown',
    riskLevel: 'high',
    reasons: [
      'Berhampiran sungai',
      'Sejarah banjir',
      'Kawasan rendah',
      'Musim monsun timur laut'
    ]
  }));
};

exports.getHistoricalFloodData = async (location) => {
  // Simulate historical flood data
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  return years.map(year => ({
    year,
    floodEvents: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
    maxWaterLevel: Math.random() > 0.5 ? Math.round(Math.random() * 5 + 1) : 0, // meters
    affectedAreas: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : 0,
    economicLoss: Math.random() > 0.5 ? Math.round(Math.random() * 1000000 + 100000) : 0 // RM
  }));
};