/**
 * Destination Intelligence Service
 * Provides factual, destination-specific transportation metadata, authentic attractions,
 * and traditional cuisine intelligence to prevent AI hallucinations (e.g., no metro in Manali).
 */

export interface DestinationProfile {
  name: string;
  aliases: string[];
  region: string;
  country: string;
  isHillStation?: boolean;
  isIsland?: boolean;
  hasMetro: boolean;
  hasLocalTrain: boolean;
  hasAirport: boolean;
  nearestAirport?: string;
  nearestRailhead?: string;
  practicalTransport: string;
  unsupportedTransport: string[];
  authenticAttractions: string[];
  authenticCuisines: string[];
  dayAdviceGuidelines: string;
}

const DESTINATION_PROFILES: DestinationProfile[] = [
  {
    name: 'Manali',
    aliases: ['manali', 'kullu manali', 'himachal pradesh'],
    region: 'Himachal Pradesh',
    country: 'India',
    isHillStation: true,
    hasMetro: false,
    hasLocalTrain: false,
    hasAirport: false,
    nearestAirport: 'Bhuntar Airport (KUU, 50 km away, subject to weather and limited flights)',
    nearestRailhead: 'Chandigarh Railway Station (CDG, 310 km) or Ambala Cantt, followed by scenic 8-hour highway road journey',
    practicalTransport:
      'Volvo luxury overnight buses from Delhi/Chandigarh, HRTC state buses, local private taxis (4x4 required for snow/Rohtang), auto-rickshaws for short town trips, and walking across Mall Road and Old Manali. There are NO trains, NO metro, and NO express rail tickets originating in Manali.',
    unsupportedTransport: [
      'Metro',
      'Local train',
      'Express train tickets from Manali',
      'Subway',
      'Tram',
      'Bullet train',
      'Monorail',
      'Commuter rail',
    ],
    authenticAttractions: [
      'Hadimba Devi Temple (ancient wooden pagoda temple in cedar forest)',
      'Manu Temple in Old Manali',
      'Old Manali village and riverside cafes',
      'Mall Road and Tibetan Monastery',
      'Vashisht Temple, natural sulfur hot springs, and stone architecture',
      'Jogini Waterfall trek',
      'Solang Valley (adventure sports, paragliding, and zorbing)',
      'Atal Tunnel (Rohtang) gateway to Lahaul Valley',
      'Sissu village and waterfall in Lahaul Valley',
      'Naggar Castle and Roerich Art Gallery',
      'Beas River viewpoints and Nature Park',
      'Gulaba viewpoint on Rohtang road',
    ],
    authenticCuisines: [
      'Himachali Siddu (steamed wheat flour bread stuffed with poppy seeds/walnuts served with ghee)',
      'Traditional Himachali Dham (festive thali with madra, khatta, and mah ki dal)',
      'Madra (slow-cooked chickpea curry prepared with spiced yogurt)',
      'Babru (Himachali puffed bread stuffed with black gram paste)',
      'Fresh Himalayan river trout fish prepared with local mountain herbs',
      'Tudkiya Bhat (Himachali spiced rice pilaf with lentils and potatoes)',
      'Bhey (crispy spiced lotus stem snack)',
      'Aktori (traditional buckwheat festival cake)',
    ],
    dayAdviceGuidelines:
      'Wear comfortable sturdy walking shoes with good traction. Carry layered warm clothing (heavy jackets in winter, fleece/cardigan in summer). Weather changes rapidly in the mountains; always carry a rain poncho/windcheater. Confirm your return Volvo bus or taxi booking in advance.',
  },
  {
    name: 'Delhi',
    aliases: ['delhi', 'new delhi', 'ncr'],
    region: 'National Capital Territory',
    country: 'India',
    hasMetro: true,
    hasLocalTrain: true,
    hasAirport: true,
    nearestAirport: 'Indira Gandhi International Airport (DEL)',
    nearestRailhead: 'New Delhi Railway Station (NDLS), Hazrat Nizamuddin (NZM), Delhi Junction (DLI)',
    practicalTransport:
      'Delhi Metro (extensive, air-conditioned, and efficient), app cabs (Uber, Ola, BluSmart), auto-rickshaws (insist on meter or negotiate upfront), DTC electric buses, and Indian Railways.',
    unsupportedTransport: ['Ferry', 'Rental scooters on highways', 'Gondola', 'Tram'],
    authenticAttractions: [
      'Qutub Minar and Mehrauli Archaeological Park',
      'Humayun\'s Tomb (UNESCO World Heritage Persian garden tomb)',
      'Red Fort (Lal Qila) in Old Delhi',
      'Chandni Chowk and historic Jama Masjid',
      'India Gate and Kartavya Path',
      'Lotus Temple (Bahai House of Worship)',
      'Akshardham Temple complex',
      'Lodhi Art District and Lodhi Gardens',
      'National Museum and National Gallery of Modern Art',
    ],
    authenticCuisines: [
      'Old Delhi parathas at Paranthe Wali Gali',
      'Classic Butter Chicken with garlic butter naan',
      'Purani Dilli Mughlai Seekh Kebabs and Biryani',
      'Chole Bhature with pickled amla',
      'Delhi street chaat (Gol Gappe, Dahi Bhalla, Papdi Chaat)',
      'Kulfi Falooda and Jalebi Rabri',
    ],
    dayAdviceGuidelines:
      'Use the Delhi Metro to bypass heavy road congestion. Keep cash in small denominations for auto-rickshaws and street vendors. Stay well-hydrated, especially between April and June.',
  },
  {
    name: 'Mumbai',
    aliases: ['mumbai', 'bombay'],
    region: 'Maharashtra',
    country: 'India',
    hasMetro: true,
    hasLocalTrain: true,
    hasAirport: true,
    nearestAirport: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
    nearestRailhead: 'Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai Central (MMCT)',
    practicalTransport:
      'Mumbai Suburban Railway ("Local Trains" - Western, Central, Harbour lines; avoid peak hours 8-11am & 6-9pm), Mumbai Metro, Kaali-Peeli metered black-and-yellow taxis, auto-rickshaws (suburbs only north of Bandra/Sion), and BEST buses.',
    unsupportedTransport: ['Auto-rickshaws in South Mumbai (Colaba, Nariman Point, Marine Drive)'],
    authenticAttractions: [
      'Gateway of India and heritage Taj Mahal Palace Hotel',
      'Marine Drive promenade (Queen\'s Necklace sunset walk)',
      'Chhatrapati Shivaji Maharaj Terminus (UNESCO Victorian Gothic architecture)',
      'Elephanta Caves (island ferry from Gateway of India)',
      'Colaba Causeway street shopping and heritage cafes',
      'Bandra Bandstand, Mount Mary Church, and heritage villages',
      'Dadar Flower Market and Shivaji Park',
      'Juhu Beach street food and sunset walk',
    ],
    authenticCuisines: [
      'Mumbai Vada Pav with spicy garlic chutney',
      'Pav Bhaji at Sardar or Cannon Pav Bhaji',
      'Authentic Malvani/Koli seafood thali (Bombil fry, Surmai, Prawn curry)',
      'Irani cafe Bun Maska, Keema Pav, and Irani Chai',
      'Bhel Puri and Sev Puri at Chowpatty Beach',
    ],
    dayAdviceGuidelines:
      'Do not board local trains during rush hours with heavy luggage. South Mumbai does not allow auto-rickshaws, only metered taxis. Carry an umbrella and waterproof footwear during monsoon (June-September).',
  },
  {
    name: 'Jaipur',
    aliases: ['jaipur', 'pink city', 'rajasthan'],
    region: 'Rajasthan',
    country: 'India',
    hasMetro: true,
    hasLocalTrain: false,
    hasAirport: true,
    nearestAirport: 'Jaipur International Airport (JAI)',
    nearestRailhead: 'Jaipur Junction (JP)',
    practicalTransport:
      'Jaipur Metro (Mansarovar to Badi Chaupar through walled city), auto-rickshaws, e-rickshaws inside the pink city bazaars, app-based cabs, and pre-booked private taxis for fort excursions.',
    unsupportedTransport: ['Suburban local trains', 'Ferry', 'Bullet train'],
    authenticAttractions: [
      'Amber Fort (Amer Fort) and Sheesh Mahal',
      'Hawa Mahal (Palace of Winds)',
      'City Palace Jaipur and Jantar Mantar observatory',
      'Nahargarh Fort sunset view over Pink City',
      'Jal Mahal (Water Palace)',
      'Albert Hall Museum',
      'Johari Bazaar and Bapu Bazaar handicrafts',
      'Galta Ji (Monkey Temple)',
    ],
    authenticCuisines: [
      'Dal Baati Churma with garlic chutney and desi ghee',
      'Laal Maas (traditional fiery Rajasthani mutton curry)',
      'Pyaaz Kachori and Mirchi Vada at Rawat Mishtan Bhandar',
      'Ghevar (traditional honeycomb sweet cake)',
      'Ker Sangri (desert bean and berry delicacy)',
      'Lassi at Lassiwala on MI Road',
    ],
    dayAdviceGuidelines:
      'Wear slip-on shoes with socks as shoes must be removed at temples and palace sanctums. Visit Amber and Nahargarh Forts in the morning to avoid midday sun. Bargain politely in walled city bazaars.',
  },
  {
    name: 'Goa',
    aliases: ['goa', 'panaji', 'north goa', 'south goa'],
    region: 'Goa',
    country: 'India',
    hasMetro: false,
    hasLocalTrain: false,
    hasAirport: true,
    nearestAirport: 'Dabolim Airport (GOI) or Manohar International Airport Mopa (GOX)',
    nearestRailhead: 'Madgaon Junction (MAO) or Thivim (THVM)',
    practicalTransport:
      'Rental two-wheelers (Honda Activa/geared bikes), self-drive cars, GoaMiles app taxis, local private taxis, and Kadamba state buses. There is NO metro or intra-beach commuter rail.',
    unsupportedTransport: ['Metro', 'Local train commuter between beaches', 'Tram', 'Subway'],
    authenticAttractions: [
      'Fort Aguada and lighthouse overlooking Arabian Sea',
      'Basilica of Bom Jesus and Se Cathedral in Old Goa',
      'Fontainhas Latin Quarter heritage walk in Panaji',
      'Dudhsagar Waterfalls (jeep safari)',
      'Chapora Fort (Dil Chahta Hai viewpoint)',
      'Anjuna flea market and Vagator cliff viewpoints',
      'Palolem Beach and Butterfly Beach boat trip in South Goa',
      'Divar Island ferry and spice plantation tour',
    ],
    authenticCuisines: [
      'Goan Fish Curry Thali with red rice and kismoor',
      'Traditional Pork or Chicken Vindaloo with crusty Goan Poi bread',
      'Chicken Xacuti cooked with roasted coconut gravy',
      'Prawn Balchão and Butter Garlic Crab',
      'Bebinca (multi-layered Goan coconut milk pudding)',
      'Fresh Feni cocktail and tender coconut water',
    ],
    dayAdviceGuidelines:
      'Always wear a helmet when riding rental scooters (strictly enforced by traffic police). Keep an international or valid Indian driving license handy. Apply reef-safe sunscreen and carry plenty of water.',
  },
  {
    name: 'Rishikesh',
    aliases: ['rishikesh', 'rishikesh uttarakhand', 'tapovan'],
    region: 'Uttarakhand',
    country: 'India',
    isHillStation: true,
    hasMetro: false,
    hasLocalTrain: false,
    hasAirport: false,
    nearestAirport: 'Dehradun Jolly Grant Airport (DED, 25 km away)',
    nearestRailhead: 'Yog Nagari Rishikesh (YNRK) or Haridwar Junction (HW, 25 km away)',
    practicalTransport:
      'Shared Vikram auto-rickshaws, rental scooters, walking across pedestrian suspension bridges (Janki Jhula / Ram Jhula), private cabs, and rafting transport jeeps. There is NO metro and NO local suburban train.',
    unsupportedTransport: ['Metro', 'Subway', 'Local train commuter', 'Tram'],
    authenticAttractions: [
      'Triveni Ghat Evening Maha Ganga Aarti with brass lamps',
      'The Beatles Ashram (Chaurasi Kutia) in Rajaji Tiger Reserve',
      'Ram Jhula and Janki Jhula suspension bridges',
      'Neer Garh Waterfall nature hike',
      'Shivpuri white water river rafting and cliff jumping',
      'Parmarth Niketan Ashram and spiritual garden',
      'Kunjapuri Devi Temple sunrise view of Himalayan peaks',
      'Vashishta Gufa meditation cave along the Ganges',
    ],
    authenticCuisines: [
      'Authentic Garhwali Thali (Chainsoo, Kafuli, Jhangore ki Kheer)',
      'Aloo ke Gutke with mountain coriander and pahadi red chili',
      'Ayurvedic sattvic multi-grain thali',
      'Fresh herbal teas and organic sourdough bakery in Tapovan',
      'Freshly prepared hot jalebi and rabri by the river ghats',
    ],
    dayAdviceGuidelines:
      'Rishikesh is an ancient holy city where alcohol and non-vegetarian food are strictly prohibited by law. Dress modestly covering shoulders and knees when visiting ashrams and ghats. Keep footwear secure near monkeys on footbridges.',
  },
  {
    name: 'Haridwar',
    aliases: ['haridwar', 'hardwar', 'kankhal'],
    region: 'Uttarakhand',
    country: 'India',
    isHillStation: false,
    hasMetro: false,
    hasLocalTrain: false,
    hasAirport: false,
    nearestAirport: 'Dehradun Jolly Grant Airport (DED, 38 km away)',
    nearestRailhead: 'Haridwar Junction (HW) - major railway terminal with direct connectivity to Delhi/Mumbai/Kolkata',
    practicalTransport:
      'Auto-rickshaws, e-rickshaws (banned on Upper Road near Har Ki Pauri during Aarti hours; walk required), cycle rickshaws, ropeway aerial tramways (Udankhatola for Mansa Devi & Chandi Devi), and pre-booked private taxis. There is NO metro.',
    unsupportedTransport: ['Metro', 'Subway', 'Commuter bullet train', 'Tram'],
    authenticAttractions: [
      'Har Ki Pauri & Brahma Kund Evening Maha Ganga Aarti',
      'Mansa Devi Temple atop Bilwa Parvat via Udankhatola ropeway',
      'Chandi Devi Temple on Neel Parvat summit',
      'Maya Devi Temple (ancient Shaktipeeth)',
      'Daksha Prajapati Temple Complex and Sati Kund in historic Kankhal',
      'Rajaji Tiger Reserve wildlife jeep safari at Chilla gate',
      'Shantikunj Ashram and Himalayan medicinal botanical gardens',
      'Pawan Dham glass mosaic temple',
    ],
    authenticCuisines: [
      'Mathura Wale Pracheen Poori Sabzi with pumpkin pickle on Upper Road',
      'Freshly prepared hot Malpua and Rabri at Har Ki Pauri ghats',
      'Kachori with spicy aloo jhol at Prakash Lok',
      'Chhole Bhature with pickled amla and sweet lassi in earthen kulhads',
      'Pure desi ghee Badam Milk and hot Jalebi',
    ],
    dayAdviceGuidelines:
      'Vehicles are strictly restricted around Har Ki Pauri; wear comfortable slip-on walking sandals. Reach Har Ki Pauri at least 45 minutes before sunset to secure seating for the evening Ganga Aarti. Strictly vegetarian food and no alcohol in the holy city.',
  },
];

export class DestinationIntelligenceService {
  /**
   * Resolve a destination profile by city/destination string.
   */
  public getProfile(destinationInput: string): DestinationProfile | null {
    if (!destinationInput) return null;
    const lower = destinationInput.toLowerCase().trim();

    for (const profile of DESTINATION_PROFILES) {
      if (
        profile.aliases.some((alias) => lower.includes(alias)) ||
        lower.includes(profile.name.toLowerCase())
      ) {
        return profile;
      }
    }

    return null;
  }

  /**
   * Produce comprehensive prompt constraints and context for the AI.
   */
  public getPromptTransportContext(destinationInput: string): string {
    const profile = this.getProfile(destinationInput);

    if (profile) {
      const unsupportedList = profile.unsupportedTransport.join(', ');
      const attractionsList = profile.authenticAttractions.slice(0, 8).join('\n  * ');
      const cuisineList = profile.authenticCuisines.slice(0, 6).join('\n  * ');

      return `DESTINATION TRANSPORT & GEOGRAPHY RULES FOR ${profile.name.toUpperCase()}:
- Destination Category: ${profile.isHillStation ? 'Himalayan Hill Station / Mountain Valley' : 'Urban / Regional Destination'}
- Available Practical Transport: ${profile.practicalTransport}
- STRICTLY FORBIDDEN TRANSPORT (DO NOT USE UNDER ANY CIRCUMSTANCE): ${unsupportedList}
${!profile.hasMetro ? `- There is NO METRO in ${profile.name}. Never mention metro or subway in activities or transit!` : ''}
${!profile.hasLocalTrain ? `- There are NO LOCAL OR COMMUTER TRAINS in ${profile.name}. Never mention trains or express train tickets for local transit!` : ''}
${profile.nearestAirport ? `- Airport Reality: ${profile.nearestAirport}` : ''}
${profile.nearestRailhead ? `- Rail Reality: ${profile.nearestRailhead}` : ''}
- Verified Authentic Attractions in ${profile.name} (Pick from these real landmarks):
  * ${attractionsList}
- Authentic Regional Food & Specialties in ${profile.name} (Reference these genuine dishes):
  * ${cuisineList}
- Destination Day Advice Rule: ${profile.dayAdviceGuidelines} (Advice MUST reflect genuine mountain/local weather and realistic transport, NEVER generic train advice).`;
    }

    // Generic heuristic for unindexed destinations
    const lower = destinationInput.toLowerCase();
    const isHillStation =
      lower.includes('manali') ||
      lower.includes('shimla') ||
      lower.includes('dharamshala') ||
      lower.includes('kullu') ||
      lower.includes('mussorie') ||
      lower.includes('nainital') ||
      lower.includes('ooty') ||
      lower.includes('kodaikanal') ||
      lower.includes('leh') ||
      lower.includes('ladakh') ||
      lower.includes('gangtok') ||
      lower.includes('darjeeling');

    if (isHillStation) {
      return `DESTINATION TRANSPORT RULES FOR MOUNTAIN/HILL DESTINATION (${destinationInput}):
- This is a mountain/hill station. Road travel (taxis, Volvo buses, private cabs, walking) is the ONLY practical transport mode.
- STRICTLY FORBIDDEN: Do NOT recommend Metro, Subways, Local Trains, or local rail tickets.
- Day advice must address mountain weather, walking shoes, warm clothes, and advance road vehicle booking.`;
    }

    return `DESTINATION TRANSPORT RULES FOR ${destinationInput}:
- Only recommend transportation systems that actually exist in ${destinationInput}. If unsure whether a metro or commuter rail exists, default to walking, metered taxis, and buses.`;
  }

  /**
   * Sanitizes AI-generated text for transport hallucinations.
   */
  public sanitizeTransportString(text: string, destinationInput: string): string {
    if (!text) return text;
    const profile = this.getProfile(destinationInput);

    let sanitized = text;

    if (profile && !profile.hasMetro) {
      sanitized = sanitized.replace(/metro\s*(\/|\+|&)?\s*/gi, 'Cab / ');
      sanitized = sanitized.replace(/\s*(\/|\+|&)?\s*metro/gi, ' / Local Taxi');
      sanitized = sanitized.replace(/\bmetro\b/gi, 'Local Taxi');
      sanitized = sanitized.replace(/\bsubway\b/gi, 'Local Taxi');
    }

    if (profile && !profile.hasLocalTrain) {
      sanitized = sanitized.replace(/express train tickets?/gi, 'Volvo bus or private taxi');
      sanitized = sanitized.replace(/local train\s*(\/|\+|&)?\s*/gi, 'Taxi / ');
      sanitized = sanitized.replace(/\s*(\/|\+|&)?\s*local train/gi, ' / Taxi');
      sanitized = sanitized.replace(/\btrain\b/gi, 'Road Transport');
    }

    return sanitized.trim();
  }
}

export const destinationIntelligenceService = new DestinationIntelligenceService();

