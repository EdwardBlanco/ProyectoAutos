// Catálogo maestro y enums para gestión vehicular

export const MARCAS_VEHICULOS = [
  'Audi',
  'BMW',
  'BYD',
  'Changan',
  'Chery',
  'Chevrolet',
  'Citroën',
  'Dodge',
  'Fiat',
  'Ford',
  'Great Wall',
  'Honda',
  'Hyundai',
  'JAC',
  'Jeep',
  'Kia',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Peugeot',
  'Ram',
  'Renault',
  'Seat',
  'Subaru',
  'Suzuki',
  'Toyota',
  'Volkswagen',
  'Volvo'
];

export const MODELOS_POR_MARCA = {
  'Chevrolet': ['Onix', 'Spark', 'Aveo', 'Sail', 'Tracker', 'Captiva', 'D-Max', 'Cruze', 'Sonic', 'Cobalt', 'Trailblazer', 'Equinox', 'Camaro', 'Luv'],
  'Toyota': ['Corolla', 'Hilux', 'RAV4', 'Prado', 'Fortuner', 'Yaris', 'Corolla Cross', '4Runner', 'Land Cruiser', 'Etios', 'Camry', 'Prius'],
  'Renault': ['Sandero', 'Duster', 'Logan', 'Stepway', 'Kwid', 'Koleos', 'Captur', 'Kangoo', 'Clio', 'Oroch', 'Megane', 'Symbol'],
  'Mazda': ['Mazda 2', 'Mazda 3', 'Mazda 6', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'BT-50', 'MX-5', 'CX-3'],
  'Nissan': ['Versa', 'Sentra', 'Frontier', 'March', 'Kicks', 'X-Trail', 'Qashqai', 'Pathfinder', 'Tiida', 'Navara', 'Murano'],
  'Kia': ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Seltos', 'Sorento', 'Soluto', 'Sonet', 'Soul', 'Carnival'],
  'Hyundai': ['Grand i10', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'Venue', 'HB20', 'Kona', 'H-1 / Staria'],
  'Ford': ['Fiesta', 'Focus', 'EcoSport', 'Escape', 'Explorer', 'Ranger', 'F-150', 'Bronco', 'Edge', 'Fusion', 'Mustang'],
  'Volkswagen': ['Gol', 'Polo', 'Golf', 'Jetta', 'Virtus', 'T-Cross', 'Taos', 'Tiguan', 'Amarok', 'Saveiro', 'Fox', 'Voyage'],
  'Honda': ['Civic', 'CR-V', 'HR-V', 'City', 'Fit', 'Accord', 'WR-V', 'Pilot'],
  'Suzuki': ['Swift', 'Vitara', 'Grand Vitara', 'Jimny', 'Baleno', 'S-Cross', 'Alto', 'Celerio', 'Dzire', 'Ertiga', 'Ignis'],
  'Mitsubishi': ['L200', 'Sportero', 'Montero', 'Outlander', 'ASX', 'Mirage', 'Eclipse Cross', 'Nativa'],
  'Fiat': ['Uno', 'Palio', 'Strada', 'Cronos', 'Argo', 'Toro', 'Mobi', 'Fiorino', 'Pulse', 'Fastback'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Commander'],
  'Peugeot': ['206', '207', '208', '2008', '301', '308', '3008', '5008', 'Partner', 'Expert'],
  'Citroën': ['C3', 'C4', 'C4 Cactus', 'C-Elysée', 'Berlingo', 'Jumpy', 'C5 Aircross'],
  'BMW': ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'GLA', 'GLB', 'GLC', 'GLE', 'Sprinter', 'Vito'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8'],
  'Subaru': ['Impreza', 'XV', 'Crosstrek', 'Forester', 'Outback', 'Legacy', 'WRX'],
  'BYD': ['Dolphin', 'Yuan Plus', 'Song Plus', 'Seal', 'Han', 'Tang', 'Qin Plus'],
  'JAC': ['S2', 'S3', 'S4', 'T6', 'T8', 'Sunray', 'JS4'],
  'Chery': ['Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5'],
  'Great Wall': ['Poer', 'Wingle 5', 'Wingle 7', 'Haval H6', 'Haval Jolion', 'Haval Dargo'],
  'Changan': ['CS15', 'CS35 Plus', 'CS55 Plus', 'Alsvin', 'Hunter'],
  'Ram': ['700', '1000', '1500', '2500'],
  'Seat': ['Ibiza', 'León', 'Arona', 'Ateca', 'Tarraco'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'V40']
};

export const TIPOS_VEHICULO = [
  'Automóvil / Sedán',
  'Hatchback',
  'Camioneta / SUV',
  'Pick-up',
  'Furgoneta / Utilitario',
  'Camión liviano',
  'Motocicleta'
];

export const COMBUSTIBLES = [
  'Gasolina',
  'Diésel',
  'Híbrido',
  'Eléctrico',
  'Gas (GLP / GNC)'
];

export const TRANSMISIONES = [
  'Mecánica / Manual',
  'Automática',
  'CVT',
  'Secuencial'
];

/**
 * Obtiene la lista de marcas ordenadas alfabéticamente
 */
export function getMarcas() {
  return [...MARCAS_VEHICULOS].sort((a, b) => a.localeCompare(b));
}

/**
 * Obtiene modelos sugeridos para una marca dada
 */
export function getModelosPorMarca(marca) {
  if (!marca) return [];
  const found = Object.keys(MODELOS_POR_MARCA).find(
    k => k.toLowerCase() === marca.trim().toLowerCase()
  );
  return found ? [...MODELOS_POR_MARCA[found]].sort((a, b) => a.localeCompare(b)) : [];
}
