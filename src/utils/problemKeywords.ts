export interface ProblemSuggestion {
  query: string;
  matchedCategory: string;
  title: string;
  serviceId?: string;
  suggestedAction: string;
}

export const PROBLEM_KEYWORD_MAP: Record<string, { category: string; title: string; defaultServiceId: string; description: string }> = {
  // Plumbing
  'leak': { category: 'plumbing', title: 'Pipe Leak & Faucet Dripping', defaultServiceId: 'srv_plumbing', description: 'Urgent leak detection & pipe sealing' },
  'pipe': { category: 'plumbing', title: 'Broken Pipe or Water Seepage', defaultServiceId: 'srv_plumbing', description: 'Emergency copper & PVC pipe repair' },
  'clog': { category: 'plumbing', title: 'Blocked Sink or Drain', defaultServiceId: 'srv_plumbing', description: 'Mechanical auger & hydro drain clearing' },
  'toilet': { category: 'plumbing', title: 'Running Toilet or Flush Issue', defaultServiceId: 'srv_plumbing', description: 'Flapper valve, wax ring, and tank fix' },
  'sink': { category: 'plumbing', title: 'Kitchen Sink Drainage Block', defaultServiceId: 'srv_plumbing', description: 'P-trap cleaning & disposal line check' },
  'drain': { category: 'plumbing', title: 'Slow Floor or Shower Drain', defaultServiceId: 'srv_plumbing', description: 'Debris extraction & line snaking' },
  'tap': { category: 'plumbing', title: 'Dripping Faucet Replacement', defaultServiceId: 'srv_plumbing', description: 'Washer & cartridge valve replacement' },
  
  // Electrical
  'fan': { category: 'electrical', title: 'Ceiling Fan Humming or Wobbling', defaultServiceId: 'srv_electrical', description: 'Capacitor, balance blade & motor fix' },
  'spark': { category: 'electrical', title: 'Sparking Outlet or Switch', defaultServiceId: 'srv_electrical', description: 'Circuit load check & immediate outlet replacement' },
  'breaker': { category: 'electrical', title: 'Tripping Circuit Breaker', defaultServiceId: 'srv_electrical', description: 'Short circuit isolation & fuse box diagnostic' },
  'light': { category: 'electrical', title: 'Flickering Lights or Fixture Swap', defaultServiceId: 'srv_electrical', description: 'Ballast, switch & wire connection inspection' },
  'switch': { category: 'electrical', title: 'Warm or Non-Working Wall Switch', defaultServiceId: 'srv_electrical', description: 'Smart switch or 3-way toggle replacement' },
  'power': { category: 'electrical', title: 'Partial Power Loss in Room', defaultServiceId: 'srv_electrical', description: 'GFCI reset & wire continuity diagnosis' },

  // Cleaning
  'clean': { category: 'cleaning', title: 'Whole Home Deep Clean', defaultServiceId: 'srv_cleaning', description: 'Hospital-grade sanitization & grout scrubbing' },
  'dirty': { category: 'cleaning', title: 'Intensive Kitchen & Bath Scrub', defaultServiceId: 'srv_cleaning', description: 'Grease extraction & tile descaling' },
  'dust': { category: 'cleaning', title: 'Post-Renovation Dust Removal', defaultServiceId: 'srv_cleaning', description: 'HEPA filtration & high-surface wiping' },
  'stain': { category: 'cleaning', title: 'Carpet or Hardwood Surface Spot Treatment', defaultServiceId: 'srv_cleaning', description: 'Eco-certified fabric and floor scrubbing' },
  'mold': { category: 'cleaning', title: 'Bathroom Tile Grout Mildew Treatment', defaultServiceId: 'srv_cleaning', description: 'Antimicrobial scrub & seal protection' },

  // AC Repair
  'ac': { category: 'ac_repair', title: 'AC Not Cooling or Blowing Warm', defaultServiceId: 'srv_ac_repair', description: 'Freon level test, coil wash & capacitor fix' },
  'cold': { category: 'ac_repair', title: 'Weak Airflow from AC Vents', defaultServiceId: 'srv_ac_repair', description: 'Blower fan & filter replacement' },
  'hot air': { category: 'ac_repair', title: 'AC Blowing Warm Air', defaultServiceId: 'srv_ac_repair', description: 'Compressor check & condenser fin clean' },
  'cooling': { category: 'ac_repair', title: 'Seasonal AC Maintenance Tune-Up', defaultServiceId: 'srv_ac_repair', description: 'Full efficiency inspection & coil wash' },
  'thermostat': { category: 'ac_repair', title: 'Thermostat Unresponsive or Blank', defaultServiceId: 'srv_ac_repair', description: 'Wiring calibration & digital thermostat repair' },

  // Pest Control
  'cockroach': { category: 'pest_control', title: 'Cockroach Extermination & Barrier', defaultServiceId: 'srv_pest_control', description: 'Eco-safe gel baiting & void micro-injection' },
  'ant': { category: 'pest_control', title: 'Sugar or Carpenter Ant Removal', defaultServiceId: 'srv_pest_control', description: 'Colony eradication & perimeter perimeter spray' },
  'bug': { category: 'pest_control', title: 'Indoor Pest Infestation Treatment', defaultServiceId: 'srv_pest_control', description: 'Comprehensive home shielding & entry sealing' },
  'termite': { category: 'pest_control', title: 'Wood Protection & Termite Inspection', defaultServiceId: 'srv_pest_control', description: 'Non-toxic barrier treatment' },
  'pest': { category: 'pest_control', title: 'General Pest Inspection & Defense', defaultServiceId: 'srv_pest_control', description: 'Quarterly eco-shield protection' },

  // Painting
  'paint': { category: 'painting', title: 'Room Wall Painting & Patching', defaultServiceId: 'srv_painting', description: 'Two coats premium latex & precision tape lines' },
  'peeling': { category: 'painting', title: 'Peeling Paint Scrape & Repair', defaultServiceId: 'srv_painting', description: 'Surface spackle, sanding & moisture primer' },
  'wall': { category: 'painting', title: 'Accent Wall or Interior Repaint', defaultServiceId: 'srv_painting', description: 'Designer color match & zero-drip application' },

  // Appliance Repair
  'fridge': { category: 'appliance_repair', title: 'Refrigerator Not Cooling / Making Noise', defaultServiceId: 'srv_appliance_repair', description: 'Compressor relay & evaporator fan fix' },
  'washer': { category: 'appliance_repair', title: 'Washing Machine Not Spinning or Draining', defaultServiceId: 'srv_appliance_repair', description: 'Drain pump & drive belt inspection' },
  'dryer': { category: 'appliance_repair', title: 'Dryer Not Heating or Rumbling', defaultServiceId: 'srv_appliance_repair', description: 'Thermal fuse & heating element replacement' },
  'dishwasher': { category: 'appliance_repair', title: 'Dishwasher Standing Water / Leaking', defaultServiceId: 'srv_appliance_repair', description: 'Impeller cleaning & door gasket replacement' },
  
  // Carpentry
  'door': { category: 'carpentry', title: 'Sticking Door or Misaligned Latch', defaultServiceId: 'srv_carpentry', description: 'Hinge adjustment & jamb plane trimming' },
  'cabinet': { category: 'carpentry', title: 'Sagging Cabinet Hinge or Drawer Slide', defaultServiceId: 'srv_carpentry', description: 'Soft-close upgrade & hardware realignment' },
  'shelf': { category: 'carpentry', title: 'Heavy Shelf or TV Wall Mounting', defaultServiceId: 'srv_carpentry', description: 'Stud-anchor secure installation' }
};

export function matchProblemKeyword(input: string) {
  const normalized = input.toLowerCase().trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  const matches: Array<{
    keyword: string;
    score: number;
    data: typeof PROBLEM_KEYWORD_MAP[string];
  }> = [];

  for (const [key, value] of Object.entries(PROBLEM_KEYWORD_MAP)) {
    let score = 0;
    if (normalized === key) {
      score += 100;
    } else if (normalized.includes(key)) {
      score += 50;
    } else if (words.some(w => key.includes(w) || w.includes(key))) {
      score += 25;
    }

    if (score > 0) {
      matches.push({ keyword: key, score, data: value });
    }
  }

  return matches.sort((a, b) => b.score - a.score).map(m => m.data);
}
