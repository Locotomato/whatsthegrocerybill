/**
 * Top cities per state for Grocery Price pages.
 * ~400 city pages total — high search volume, almost no competition on clean fast pages.
 *
 * Price adjustments (cents) relative to state average:
 *   Urban/coastal: typically +5 to +25 cents above state avg
 *   Rural/inland: typically -5 to -15 cents below state avg
 *   These are realistic estimates — actual prices vary by station
 */

export interface CityData {
  name: string          // Display name, e.g. "Los Angeles"
  slug: string          // URL slug, e.g. "los-angeles"
  adjustment: number    // Cents relative to state avg (can be + or -)
  population: number    // For ranking / meta description
  county?: string       // County for additional context
}

export interface StateCity {
  stateName: string
  stateAbbr: string
  cities: CityData[]
}

export const STATE_CITIES: Record<string, CityData[]> = {
  alabama: [
    { name: 'Birmingham',  slug: 'birmingham',  adjustment: 2,   population: 212237 },
    { name: 'Montgomery',  slug: 'montgomery',  adjustment: 0,   population: 199029 },
    { name: 'Huntsville',  slug: 'huntsville',  adjustment: 1,   population: 215006 },
    { name: 'Mobile',      slug: 'mobile',      adjustment: 1,   population: 187041 },
    { name: 'Tuscaloosa',  slug: 'tuscaloosa',  adjustment: -1,  population: 101080 },
    { name: 'Hoover',      slug: 'hoover',      adjustment: 0,   population: 92606  },
  ],
  alaska: [
    { name: 'Anchorage',   slug: 'anchorage',   adjustment: 0,   population: 291247 },
    { name: 'Fairbanks',   slug: 'fairbanks',   adjustment: 15,  population: 32827  },
    { name: 'Juneau',      slug: 'juneau',      adjustment: 20,  population: 32255  },
    { name: 'Sitka',       slug: 'sitka',       adjustment: 25,  population: 8493   },
    { name: 'Ketchikan',   slug: 'ketchikan',   adjustment: 22,  population: 8192   },
  ],
  arizona: [
    { name: 'Phoenix',     slug: 'phoenix',     adjustment: 0,   population: 1608139 },
    { name: 'Tucson',      slug: 'tucson',      adjustment: -2,  population: 542629  },
    { name: 'Mesa',        slug: 'mesa',        adjustment: 0,   population: 504258  },
    { name: 'Chandler',    slug: 'chandler',    adjustment: 2,   population: 261165  },
    { name: 'Scottsdale',  slug: 'scottsdale',  adjustment: 5,   population: 258069  },
    { name: 'Gilbert',     slug: 'gilbert',     adjustment: 1,   population: 267918  },
    { name: 'Tempe',       slug: 'tempe',       adjustment: 2,   population: 192364  },
    { name: 'Flagstaff',   slug: 'flagstaff',   adjustment: 8,   population: 75038   },
  ],
  arkansas: [
    { name: 'Little Rock', slug: 'little-rock', adjustment: 1,   population: 202591 },
    { name: 'Fort Smith',  slug: 'fort-smith',  adjustment: -2,  population: 89142  },
    { name: 'Fayetteville',slug: 'fayetteville',adjustment: 1,   population: 99683  },
    { name: 'Springdale',  slug: 'springdale',  adjustment: 0,   population: 89045  },
    { name: 'Jonesboro',   slug: 'jonesboro',   adjustment: -1,  population: 78576  },
  ],
  california: [
    { name: 'Los Angeles',  slug: 'los-angeles',  adjustment: 20,  population: 3898747 },
    { name: 'San Diego',    slug: 'san-diego',    adjustment: 15,  population: 1386932 },
    { name: 'San Jose',     slug: 'san-jose',     adjustment: 18,  population: 1013240 },
    { name: 'San Francisco',slug: 'san-francisco',adjustment: 30,  population: 873965  },
    { name: 'Fresno',       slug: 'fresno',       adjustment: 5,   population: 542107  },
    { name: 'Sacramento',   slug: 'sacramento',   adjustment: 8,   population: 524943  },
    { name: 'Long Beach',   slug: 'long-beach',   adjustment: 18,  population: 466742  },
    { name: 'Oakland',      slug: 'oakland',      adjustment: 22,  population: 440981  },
  ],
  colorado: [
    { name: 'Denver',       slug: 'denver',       adjustment: 2,   population: 715522  },
    { name: 'Colorado Springs', slug: 'colorado-springs', adjustment: -1, population: 478961 },
    { name: 'Aurora',       slug: 'aurora',       adjustment: 1,   population: 379289  },
    { name: 'Fort Collins', slug: 'fort-collins', adjustment: 0,   population: 164000  },
    { name: 'Lakewood',     slug: 'lakewood',     adjustment: 1,   population: 155984  },
    { name: 'Boulder',      slug: 'boulder',      adjustment: 5,   population: 105112  },
  ],
  connecticut: [
    { name: 'Bridgeport',  slug: 'bridgeport',  adjustment: 3,   population: 148654 },
    { name: 'New Haven',   slug: 'new-haven',   adjustment: 2,   population: 130250 },
    { name: 'Hartford',    slug: 'hartford',    adjustment: 2,   population: 121054 },
    { name: 'Stamford',    slug: 'stamford',    adjustment: 8,   population: 135470 },
    { name: 'Waterbury',   slug: 'waterbury',   adjustment: 1,   population: 114403 },
  ],
  delaware: [
    { name: 'Wilmington',  slug: 'wilmington',  adjustment: 2,   population: 70898 },
    { name: 'Dover',       slug: 'dover',       adjustment: 0,   population: 39403 },
    { name: 'Newark',      slug: 'newark',      adjustment: 1,   population: 33398 },
  ],
  florida: [
    { name: 'Jacksonville',slug: 'jacksonville',adjustment: -2,  population: 949611 },
    { name: 'Miami',       slug: 'miami',       adjustment: 5,   population: 454279 },
    { name: 'Tampa',       slug: 'tampa',       adjustment: 2,   population: 399700 },
    { name: 'Orlando',     slug: 'orlando',     adjustment: 3,   population: 309154 },
    { name: 'St. Petersburg', slug: 'st-petersburg', adjustment: 2, population: 261256 },
    { name: 'Hialeah',     slug: 'hialeah',     adjustment: 3,   population: 233339 },
    { name: 'Fort Lauderdale', slug: 'fort-lauderdale', adjustment: 4, population: 182760 },
    { name: 'Tallahassee', slug: 'tallahassee', adjustment: 0,   population: 196169 },
  ],
  georgia: [
    { name: 'Atlanta',     slug: 'atlanta',     adjustment: 3,   population: 498715 },
    { name: 'Augusta',     slug: 'augusta',     adjustment: -1,  population: 202081 },
    { name: 'Columbus',    slug: 'columbus',    adjustment: -1,  population: 194058 },
    { name: 'Macon',       slug: 'macon',       adjustment: -2,  population: 157346 },
    { name: 'Savannah',    slug: 'savannah',    adjustment: 2,   population: 147780 },
    { name: 'Athens',      slug: 'athens',      adjustment: 1,   population: 127315 },
  ],
  hawaii: [
    { name: 'Honolulu',    slug: 'honolulu',    adjustment: -5,  population: 350964 },
    { name: 'Pearl City',  slug: 'pearl-city',  adjustment: -8,  population: 48303  },
    { name: 'Hilo',        slug: 'hilo',        adjustment: 10,  population: 44186  },
    { name: 'Kailua',      slug: 'kailua',      adjustment: 5,   population: 38216  },
  ],
  idaho: [
    { name: 'Boise',       slug: 'boise',       adjustment: 0,   population: 237446 },
    { name: 'Meridian',    slug: 'meridian',    adjustment: 0,   population: 124498 },
    { name: 'Nampa',       slug: 'nampa',       adjustment: -2,  population: 114206 },
    { name: 'Idaho Falls', slug: 'idaho-falls', adjustment: -3,  population: 64818  },
    { name: 'Pocatello',   slug: 'pocatello',   adjustment: -4,  population: 56485  },
  ],
  illinois: [
    { name: 'Chicago',     slug: 'chicago',     adjustment: 18,  population: 2696555 },
    { name: 'Aurora',      slug: 'aurora',      adjustment: 5,   population: 180542  },
    { name: 'Joliet',      slug: 'joliet',      adjustment: 4,   population: 150362  },
    { name: 'Naperville',  slug: 'naperville',  adjustment: 6,   population: 149540  },
    { name: 'Rockford',    slug: 'rockford',    adjustment: 0,   population: 148655  },
    { name: 'Springfield', slug: 'springfield', adjustment: -2,  population: 116250  },
    { name: 'Peoria',      slug: 'peoria',      adjustment: -3,  population: 113150  },
  ],
  indiana: [
    { name: 'Indianapolis',slug: 'indianapolis',adjustment: 0,   population: 887642 },
    { name: 'Fort Wayne',  slug: 'fort-wayne',  adjustment: -2,  population: 270402 },
    { name: 'Evansville',  slug: 'evansville',  adjustment: -3,  population: 117979 },
    { name: 'South Bend',  slug: 'south-bend',  adjustment: -1,  population: 103453 },
    { name: 'Carmel',      slug: 'carmel',      adjustment: 2,   population: 101068 },
  ],
  iowa: [
    { name: 'Des Moines',  slug: 'des-moines',  adjustment: 1,   population: 214133 },
    { name: 'Cedar Rapids',slug: 'cedar-rapids',adjustment: 0,   population: 137710 },
    { name: 'Davenport',   slug: 'davenport',   adjustment: 0,   population: 101724 },
    { name: 'Sioux City',  slug: 'sioux-city',  adjustment: -1,  population: 85797  },
    { name: 'Iowa City',   slug: 'iowa-city',   adjustment: 1,   population: 74220  },
  ],
  kansas: [
    { name: 'Wichita',     slug: 'wichita',     adjustment: 0,   population: 397532 },
    { name: 'Overland Park',slug: 'overland-park',adjustment: 2, population: 197238 },
    { name: 'Kansas City', slug: 'kansas-city', adjustment: 1,   population: 156607 },
    { name: 'Topeka',      slug: 'topeka',      adjustment: -1,  population: 125310 },
    { name: 'Olathe',      slug: 'olathe',      adjustment: 1,   population: 141290 },
  ],
  kentucky: [
    { name: 'Louisville',  slug: 'louisville',  adjustment: 2,   population: 633045 },
    { name: 'Lexington',   slug: 'lexington',   adjustment: 1,   population: 323780 },
    { name: 'Bowling Green',slug: 'bowling-green',adjustment: -2, population: 72294 },
    { name: 'Owensboro',   slug: 'owensboro',   adjustment: -3,  population: 59735  },
    { name: 'Covington',   slug: 'covington',   adjustment: 3,   population: 40640  },
  ],
  louisiana: [
    { name: 'New Orleans', slug: 'new-orleans', adjustment: 3,   population: 369749 },
    { name: 'Baton Rouge', slug: 'baton-rouge', adjustment: 0,   population: 225374 },
    { name: 'Shreveport',  slug: 'shreveport',  adjustment: -2,  population: 187593 },
    { name: 'Metairie',    slug: 'metairie',    adjustment: 2,   population: 143927 },
    { name: 'Lafayette',   slug: 'lafayette',   adjustment: -1,  population: 121374 },
  ],
  maine: [
    { name: 'Portland',    slug: 'portland',    adjustment: 3,   population: 68408 },
    { name: 'Lewiston',    slug: 'lewiston',    adjustment: 0,   population: 36592 },
    { name: 'Bangor',      slug: 'bangor',      adjustment: -2,  population: 32029 },
    { name: 'South Portland', slug: 'south-portland', adjustment: 2, population: 26122 },
  ],
  maryland: [
    { name: 'Baltimore',   slug: 'baltimore',   adjustment: 5,   population: 585708 },
    { name: 'Frederick',   slug: 'frederick',   adjustment: 2,   population: 80527  },
    { name: 'Rockville',   slug: 'rockville',   adjustment: 7,   population: 68774  },
    { name: 'Gaithersburg',slug: 'gaithersburg',adjustment: 6,   population: 69021  },
    { name: 'Bowie',       slug: 'bowie',       adjustment: 4,   population: 60843  },
    { name: 'Annapolis',   slug: 'annapolis',   adjustment: 5,   population: 40812  },
  ],
  massachusetts: [
    { name: 'Boston',      slug: 'boston',      adjustment: 8,   population: 675647 },
    { name: 'Worcester',   slug: 'worcester',   adjustment: 3,   population: 185428 },
    { name: 'Springfield', slug: 'springfield', adjustment: 2,   population: 155929 },
    { name: 'Cambridge',   slug: 'cambridge',   adjustment: 10,  population: 118977 },
    { name: 'Lowell',      slug: 'lowell',      adjustment: 2,   population: 115554 },
    { name: 'Newton',      slug: 'newton',      adjustment: 9,   population: 88923  },
  ],
  michigan: [
    { name: 'Detroit',     slug: 'detroit',     adjustment: 5,   population: 639111 },
    { name: 'Grand Rapids',slug: 'grand-rapids',adjustment: 0,   population: 198917 },
    { name: 'Warren',      slug: 'warren',      adjustment: 2,   population: 136764 },
    { name: 'Sterling Heights', slug: 'sterling-heights', adjustment: 2, population: 134346 },
    { name: 'Ann Arbor',   slug: 'ann-arbor',   adjustment: 4,   population: 123851 },
    { name: 'Lansing',     slug: 'lansing',     adjustment: 0,   population: 112644 },
  ],
  minnesota: [
    { name: 'Minneapolis', slug: 'minneapolis', adjustment: 3,   population: 429606 },
    { name: 'Saint Paul',  slug: 'saint-paul',  adjustment: 2,   population: 307695 },
    { name: 'Rochester',   slug: 'rochester',   adjustment: 0,   population: 121395 },
    { name: 'Duluth',      slug: 'duluth',      adjustment: -1,  population: 90872  },
    { name: 'Bloomington', slug: 'bloomington', adjustment: 2,   population: 89987  },
  ],
  mississippi: [
    { name: 'Jackson',     slug: 'jackson',     adjustment: 0,   population: 153701 },
    { name: 'Gulfport',    slug: 'gulfport',    adjustment: 1,   population: 72926  },
    { name: 'Southaven',   slug: 'southaven',   adjustment: -1,  population: 55994  },
    { name: 'Hattiesburg', slug: 'hattiesburg', adjustment: -1,  population: 47514  },
    { name: 'Biloxi',      slug: 'biloxi',      adjustment: 2,   population: 46318  },
  ],
  missouri: [
    { name: 'Kansas City', slug: 'kansas-city', adjustment: 2,   population: 508090 },
    { name: 'St. Louis',   slug: 'st-louis',    adjustment: 3,   population: 293310 },
    { name: 'Springfield', slug: 'springfield', adjustment: -2,  population: 169176 },
    { name: 'Columbia',    slug: 'columbia',    adjustment: 0,   population: 126254 },
    { name: 'Independence',slug: 'independence',adjustment: 1,   population: 117270 },
  ],
  montana: [
    { name: 'Billings',    slug: 'billings',    adjustment: 0,   population: 119616 },
    { name: 'Missoula',    slug: 'missoula',    adjustment: 2,   population: 73489  },
    { name: 'Great Falls', slug: 'great-falls', adjustment: -2,  population: 58505  },
    { name: 'Bozeman',     slug: 'bozeman',     adjustment: 5,   population: 53293  },
  ],
  nebraska: [
    { name: 'Omaha',       slug: 'omaha',       adjustment: 2,   population: 486051 },
    { name: 'Lincoln',     slug: 'lincoln',     adjustment: 0,   population: 295222 },
    { name: 'Bellevue',    slug: 'bellevue',    adjustment: 1,   population: 64176  },
    { name: 'Grand Island',slug: 'grand-island',adjustment: -2,  population: 52560  },
  ],
  nevada: [
    { name: 'Las Vegas',   slug: 'las-vegas',   adjustment: 0,   population: 641903 },
    { name: 'Henderson',   slug: 'henderson',   adjustment: 1,   population: 320189 },
    { name: 'Reno',        slug: 'reno',        adjustment: -5,  population: 264165 },
    { name: 'North Las Vegas', slug: 'north-las-vegas', adjustment: -2, population: 262527 },
    { name: 'Sparks',      slug: 'sparks',      adjustment: -4,  population: 108445 },
  ],
  'new-hampshire': [
    { name: 'Manchester',  slug: 'manchester',  adjustment: 0,   population: 115644 },
    { name: 'Nashua',      slug: 'nashua',      adjustment: 1,   population: 91322  },
    { name: 'Concord',     slug: 'concord',     adjustment: -1,  population: 44400  },
    { name: 'Dover',       slug: 'dover',       adjustment: 0,   population: 32741  },
  ],
  'new-jersey': [
    { name: 'Newark',      slug: 'newark',      adjustment: 3,   population: 311549 },
    { name: 'Jersey City', slug: 'jersey-city', adjustment: 4,   population: 292449 },
    { name: 'Paterson',    slug: 'paterson',    adjustment: 2,   population: 159732 },
    { name: 'Elizabeth',   slug: 'elizabeth',   adjustment: 2,   population: 137298 },
    { name: 'Trenton',     slug: 'trenton',     adjustment: 1,   population: 90871  },
    { name: 'Edison',      slug: 'edison',      adjustment: 3,   population: 107694 },
  ],
  'new-mexico': [
    { name: 'Albuquerque', slug: 'albuquerque', adjustment: 0,   population: 564559 },
    { name: 'Las Cruces',  slug: 'las-cruces',  adjustment: -2,  population: 114079 },
    { name: 'Rio Rancho',  slug: 'rio-rancho',  adjustment: -1,  population: 104046 },
    { name: 'Santa Fe',    slug: 'santa-fe',    adjustment: 5,   population: 89823  },
    { name: 'Roswell',     slug: 'roswell',     adjustment: -3,  population: 48422  },
  ],
  'new-york': [
    { name: 'New York City',slug: 'new-york-city',adjustment: 20, population: 8335897 },
    { name: 'Buffalo',     slug: 'buffalo',     adjustment: -2,  population: 278349  },
    { name: 'Rochester',   slug: 'rochester',   adjustment: -3,  population: 211328  },
    { name: 'Yonkers',     slug: 'yonkers',     adjustment: 10,  population: 211569  },
    { name: 'Syracuse',    slug: 'syracuse',    adjustment: -2,  population: 146303  },
    { name: 'Albany',      slug: 'albany',      adjustment: 0,   population: 99224   },
  ],
  'north-carolina': [
    { name: 'Charlotte',   slug: 'charlotte',   adjustment: 2,   population: 879709 },
    { name: 'Raleigh',     slug: 'raleigh',     adjustment: 2,   population: 467665 },
    { name: 'Greensboro',  slug: 'greensboro',  adjustment: 0,   population: 299035 },
    { name: 'Durham',      slug: 'durham',      adjustment: 1,   population: 278993 },
    { name: 'Winston-Salem',slug: 'winston-salem',adjustment: -1, population: 249545 },
    { name: 'Fayetteville',slug: 'fayetteville',adjustment: -2,  population: 211657 },
  ],
  'north-dakota': [
    { name: 'Fargo',       slug: 'fargo',       adjustment: 0,   population: 125990 },
    { name: 'Bismarck',    slug: 'bismarck',    adjustment: -1,  population: 73622  },
    { name: 'Grand Forks', slug: 'grand-forks', adjustment: -1,  population: 59166  },
    { name: 'Minot',       slug: 'minot',       adjustment: -2,  population: 48377  },
  ],
  ohio: [
    { name: 'Columbus',    slug: 'columbus',    adjustment: 0,   population: 905748 },
    { name: 'Cleveland',   slug: 'cleveland',   adjustment: 1,   population: 367991 },
    { name: 'Cincinnati',  slug: 'cincinnati',  adjustment: 2,   population: 309317 },
    { name: 'Toledo',      slug: 'toledo',      adjustment: 0,   population: 270871 },
    { name: 'Akron',       slug: 'akron',       adjustment: 1,   population: 188124 },
    { name: 'Dayton',      slug: 'dayton',      adjustment: -1,  population: 137644 },
  ],
  oklahoma: [
    { name: 'Oklahoma City',slug: 'oklahoma-city',adjustment: 0,  population: 681054 },
    { name: 'Tulsa',       slug: 'tulsa',       adjustment: 0,   population: 413066 },
    { name: 'Norman',      slug: 'norman',      adjustment: -1,  population: 128026 },
    { name: 'Broken Arrow',slug: 'broken-arrow',adjustment: -1,  population: 117069 },
    { name: 'Edmond',      slug: 'edmond',      adjustment: 2,   population: 94428  },
  ],
  oregon: [
    { name: 'Portland',    slug: 'portland',    adjustment: 3,   population: 641162 },
    { name: 'Salem',       slug: 'salem',       adjustment: 0,   population: 175535 },
    { name: 'Eugene',      slug: 'eugene',      adjustment: 0,   population: 176654 },
    { name: 'Gresham',     slug: 'gresham',     adjustment: 1,   population: 113103 },
    { name: 'Hillsboro',   slug: 'hillsboro',   adjustment: 2,   population: 106447 },
    { name: 'Bend',        slug: 'bend',        adjustment: 5,   population: 102059 },
  ],
  pennsylvania: [
    { name: 'Philadelphia',slug: 'philadelphia',adjustment: 5,   population: 1603797 },
    { name: 'Pittsburgh',  slug: 'pittsburgh',  adjustment: 2,   population: 302971  },
    { name: 'Allentown',   slug: 'allentown',   adjustment: 2,   population: 125845  },
    { name: 'Erie',        slug: 'erie',        adjustment: -1,  population: 94831   },
    { name: 'Reading',     slug: 'reading',     adjustment: 1,   population: 94699   },
    { name: 'Harrisburg',  slug: 'harrisburg',  adjustment: 0,   population: 50099   },
  ],
  'rhode-island': [
    { name: 'Providence',  slug: 'providence',  adjustment: 2,   population: 190934 },
    { name: 'Cranston',    slug: 'cranston',    adjustment: 1,   population: 81798  },
    { name: 'Warwick',     slug: 'warwick',     adjustment: 1,   population: 82672  },
    { name: 'Pawtucket',   slug: 'pawtucket',   adjustment: 1,   population: 75604  },
  ],
  'south-carolina': [
    { name: 'Columbia',    slug: 'columbia',    adjustment: 0,   population: 136632 },
    { name: 'Charleston',  slug: 'charleston',  adjustment: 3,   population: 150227 },
    { name: 'North Charleston', slug: 'north-charleston', adjustment: 1, population: 114852 },
    { name: 'Mount Pleasant', slug: 'mount-pleasant', adjustment: 5, population: 92398 },
    { name: 'Rock Hill',   slug: 'rock-hill',   adjustment: -1,  population: 74372  },
    { name: 'Greenville',  slug: 'greenville',  adjustment: 0,   population: 70467  },
  ],
  'south-dakota': [
    { name: 'Sioux Falls', slug: 'sioux-falls', adjustment: 0,   population: 196267 },
    { name: 'Rapid City',  slug: 'rapid-city',  adjustment: -1,  population: 80505  },
    { name: 'Aberdeen',    slug: 'aberdeen',    adjustment: -3,  population: 28495  },
  ],
  tennessee: [
    { name: 'Nashville',   slug: 'nashville',   adjustment: 2,   population: 715884 },
    { name: 'Memphis',     slug: 'memphis',     adjustment: 0,   population: 621082 },
    { name: 'Knoxville',   slug: 'knoxville',   adjustment: -1,  population: 190740 },
    { name: 'Chattanooga', slug: 'chattanooga', adjustment: -1,  population: 181099 },
    { name: 'Clarksville', slug: 'clarksville', adjustment: -2,  population: 166722 },
  ],
  texas: [
    { name: 'Houston',     slug: 'houston',     adjustment: 0,   population: 2304580 },
    { name: 'San Antonio', slug: 'san-antonio', adjustment: -1,  population: 1434625 },
    { name: 'Dallas',      slug: 'dallas',      adjustment: 2,   population: 1304379 },
    { name: 'Austin',      slug: 'austin',      adjustment: 3,   population: 978908  },
    { name: 'Fort Worth',  slug: 'fort-worth',  adjustment: 1,   population: 918915  },
    { name: 'El Paso',     slug: 'el-paso',     adjustment: -2,  population: 678815  },
    { name: 'Arlington',   slug: 'arlington',   adjustment: 1,   population: 394266  },
    { name: 'Corpus Christi',slug: 'corpus-christi',adjustment: -2, population: 317773 },
  ],
  utah: [
    { name: 'Salt Lake City',slug: 'salt-lake-city',adjustment: 0, population: 200591 },
    { name: 'West Valley City',slug: 'west-valley-city',adjustment: -1, population: 140230 },
    { name: 'Provo',       slug: 'provo',       adjustment: -1,  population: 115264 },
    { name: 'West Jordan', slug: 'west-jordan', adjustment: -1,  population: 116961 },
    { name: 'Orem',        slug: 'orem',        adjustment: -2,  population: 98129  },
    { name: 'Sandy',       slug: 'sandy',       adjustment: 0,   population: 96904  },
  ],
  vermont: [
    { name: 'Burlington',  slug: 'burlington',  adjustment: 2,   population: 44743 },
    { name: 'South Burlington',slug: 'south-burlington',adjustment: 2, population: 20292 },
    { name: 'Rutland',     slug: 'rutland',     adjustment: -2,  population: 15807 },
    { name: 'Barre',       slug: 'barre',       adjustment: -3,  population: 9052  },
  ],
  virginia: [
    { name: 'Virginia Beach',slug: 'virginia-beach',adjustment: 0, population: 459470 },
    { name: 'Norfolk',     slug: 'norfolk',     adjustment: 1,   population: 238005 },
    { name: 'Chesapeake',  slug: 'chesapeake',  adjustment: 0,   population: 249422 },
    { name: 'Richmond',    slug: 'richmond',    adjustment: 2,   population: 226610 },
    { name: 'Newport News',slug: 'newport-news',adjustment: 0,   population: 179225 },
    { name: 'Alexandria',  slug: 'alexandria',  adjustment: 8,   population: 160035 },
    { name: 'Arlington',   slug: 'arlington',   adjustment: 9,   population: 238643 },
  ],
  washington: [
    { name: 'Seattle',     slug: 'seattle',     adjustment: 8,   population: 749256 },
    { name: 'Spokane',     slug: 'spokane',     adjustment: -5,  population: 228989 },
    { name: 'Tacoma',      slug: 'tacoma',      adjustment: 2,   population: 219346 },
    { name: 'Vancouver',   slug: 'vancouver',   adjustment: 0,   population: 190915 },
    { name: 'Bellevue',    slug: 'bellevue',    adjustment: 10,  population: 151854 },
    { name: 'Kirkland',    slug: 'kirkland',    adjustment: 8,   population: 92175  },
    { name: 'Renton',      slug: 'renton',      adjustment: 3,   population: 106785 },
  ],
  'west-virginia': [
    { name: 'Charleston',  slug: 'charleston',  adjustment: 0,   population: 48864 },
    { name: 'Huntington',  slug: 'huntington',  adjustment: -1,  population: 42478 },
    { name: 'Morgantown',  slug: 'morgantown',  adjustment: 1,   population: 31073 },
    { name: 'Parkersburg', slug: 'parkersburg', adjustment: -2,  population: 29959 },
  ],
  wisconsin: [
    { name: 'Milwaukee',   slug: 'milwaukee',   adjustment: 3,   population: 577222 },
    { name: 'Madison',     slug: 'madison',     adjustment: 2,   population: 269840 },
    { name: 'Green Bay',   slug: 'green-bay',   adjustment: -1,  population: 107395 },
    { name: 'Kenosha',     slug: 'kenosha',     adjustment: 1,   population: 100150 },
    { name: 'Racine',      slug: 'racine',      adjustment: 1,   population: 77816  },
  ],
  wyoming: [
    { name: 'Cheyenne',    slug: 'cheyenne',    adjustment: 0,   population: 64235 },
    { name: 'Casper',      slug: 'casper',      adjustment: -1,  population: 59324 },
    { name: 'Laramie',     slug: 'laramie',     adjustment: 0,   population: 32158 },
    { name: 'Gillette',    slug: 'gillette',    adjustment: -3,  population: 32857 },
  ],
}

// Helper: get all state slugs that have city data
export function getStatesWithCities(): string[] {
  return Object.keys(STATE_CITIES)
}

// Helper: get cities for a state slug
export function getCitiesForState(stateSlug: string): CityData[] {
  return STATE_CITIES[stateSlug] ?? []
}

// Helper: total city count
export function getTotalCityCount(): number {
  return Object.values(STATE_CITIES).reduce((acc, cities) => acc + cities.length, 0)
}
