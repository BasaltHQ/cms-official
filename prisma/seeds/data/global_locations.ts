export const globalLocationData = [
    // ==========================================
    // UNITED STATES (All 50 States + DC + PR)
    // Target: ~10 cities per state average = ~500+
    // ==========================================
    {
        country: "United States", code: "US", slug: "united-states", name: "United States",
        regions: [
            {
                name: "Alabama", slug: "alabama", cities: [
                    { name: "Birmingham", slug: "birmingham-al", population: 200733 }, { name: "Montgomery", slug: "montgomery-al", population: 198525 }, { name: "Huntsville", slug: "huntsville-al", population: 215006 }, { name: "Mobile", slug: "mobile-al", population: 187041 }, { name: "Tuscaloosa", slug: "tuscaloosa-al", population: 99600 },
                    { name: "Hoover", slug: "hoover-al", population: 85000 }, { name: "Dothan", slug: "dothan-al", population: 68000 }, { name: "Auburn", slug: "auburn-al", population: 66000 }, { name: "Decatur", slug: "decatur-al", population: 54000 }
                ]
            },
            {
                name: "Alaska", slug: "alaska", cities: [
                    { name: "Anchorage", slug: "anchorage-ak", population: 291247 }, { name: "Juneau", slug: "juneau-ak", population: 32255 }, { name: "Fairbanks", slug: "fairbanks-ak", population: 31535 }
                ]
            },
            {
                name: "Arizona", slug: "arizona", cities: [
                    { name: "Phoenix", slug: "phoenix-az", population: 1608139 }, { name: "Tucson", slug: "tucson-az", population: 542629 }, { name: "Mesa", slug: "mesa-az", population: 504258 }, { name: "Chandler", slug: "chandler-az", population: 275987 }, { name: "Scottsdale", slug: "scottsdale-az", population: 241361 },
                    { name: "Glendale", slug: "glendale-az", population: 248325 }, { name: "Gilbert", slug: "gilbert-az", population: 267918 }, { name: "Tempe", slug: "tempe-az", population: 185000 }, { name: "Peoria", slug: "peoria-az", population: 168000 }, { name: "Surprise", slug: "surprise-az", population: 138000 }
                ]
            },
            {
                name: "Arkansas", slug: "arkansas", cities: [
                    { name: "Little Rock", slug: "little-rock-ar", population: 202591 }, { name: "Fort Smith", slug: "fort-smith-ar", population: 89142 }, { name: "Fayetteville", slug: "fayetteville-ar", population: 93949 }, { name: "Springdale", slug: "springdale-ar", population: 81000 }, { name: "Jonesboro", slug: "jonesboro-ar", population: 78000 }
                ]
            },
            {
                name: "California", slug: "california", cities: [
                    { name: "Los Angeles", slug: "los-angeles-ca", population: 3898747 }, { name: "San Diego", slug: "san-diego-ca", population: 1386932 }, { name: "San Jose", slug: "san-jose-ca", population: 1013240 }, { name: "San Francisco", slug: "san-francisco-ca", population: 873965 }, { name: "Fresno", slug: "fresno-ca", population: 542107 },
                    { name: "Sacramento", slug: "sacramento-ca", population: 524943 }, { name: "Long Beach", slug: "long-beach-ca", population: 466742 }, { name: "Oakland", slug: "oakland-ca", population: 440646 }, { name: "Bakersfield", slug: "bakersfield-ca", population: 403455 }, { name: "Anaheim", slug: "anaheim-ca", population: 346824 },
                    { name: "Santa Ana", slug: "santa-ana-ca", population: 310227 }, { name: "Riverside", slug: "riverside-ca", population: 314998 }, { name: "Stockton", slug: "stockton-ca", population: 320804 }, { name: "Irvine", slug: "irvine-ca", population: 307670 }, { name: "Chula Vista", slug: "chula-vista-ca", population: 275487 },
                    { name: "Fremont", slug: "fremont-ca", population: 230504 }, { name: "San Bernardino", slug: "san-bernardino-ca", population: 222101 }, { name: "Modesto", slug: "modesto-ca", population: 218464 }, { name: "Fontana", slug: "fontana-ca", population: 208393 }, { name: "Santa Clarita", slug: "santa-clarita-ca", population: 228673 }
                ]
            },
            {
                name: "Colorado", slug: "colorado", cities: [
                    { name: "Denver", slug: "denver-co", population: 715522 }, { name: "Colorado Springs", slug: "colorado-springs-co", population: 478221 }, { name: "Aurora", slug: "aurora-co", population: 386261 }, { name: "Fort Collins", slug: "fort-collins-co", population: 169810 }, { name: "Lakewood", slug: "lakewood-co", population: 155984 },
                    { name: "Thornton", slug: "thornton-co", population: 141000 }, { name: "Arvada", slug: "arvada-co", population: 121000 }, { name: "Westminster", slug: "westminster-co", population: 113000 }, { name: "Pueblo", slug: "pueblo-co", population: 111000 }, { name: "Centennial", slug: "centennial-co", population: 110000 }
                ]
            },
            {
                name: "Connecticut", slug: "connecticut", cities: [
                    { name: "Bridgeport", slug: "bridgeport-ct", population: 148654 }, { name: "New Haven", slug: "new-haven-ct", population: 134023 }, { name: "Stamford", slug: "stamford-ct", population: 135470 }, { name: "Hartford", slug: "hartford-ct", population: 121054 }, { name: "Waterbury", slug: "waterbury-ct", population: 108000 }
                ]
            },
            {
                name: "Delaware", slug: "delaware", cities: [
                    { name: "Wilmington", slug: "wilmington-de", population: 70898 }, { name: "Dover", slug: "dover-de", population: 39403 }
                ]
            },
            {
                name: "District of Columbia", slug: "district-of-columbia", cities: [
                    { name: "Washington", slug: "washington-dc", population: 689545 }
                ]
            },
            {
                name: "Florida", slug: "florida", cities: [
                    { name: "Jacksonville", slug: "jacksonville-fl", population: 949611 }, { name: "Miami", slug: "miami-fl", population: 442241 }, { name: "Tampa", slug: "tampa-fl", population: 384959 }, { name: "Orlando", slug: "orlando-fl", population: 307573 }, { name: "St. Petersburg", slug: "st-petersburg-fl", population: 258308 },
                    { name: "Hialeah", slug: "hialeah-fl", population: 223109 }, { name: "Port St. Lucie", slug: "port-st-lucie-fl", population: 204851 }, { name: "Tallahassee", slug: "tallahassee-fl", population: 196169 }, { name: "Fort Lauderdale", slug: "fort-lauderdale-fl", population: 182760 }, { name: "Cape Coral", slug: "cape-coral-fl", population: 194016 },
                    { name: "Pembroke Pines", slug: "pembroke-pines-fl", population: 171000 }, { name: "Hollywood", slug: "hollywood-fl", population: 153000 }, { name: "Miramar", slug: "miramar-fl", population: 140000 }, { name: "Gainesville", slug: "gainesville-fl", population: 141000 }, { name: "Coral Springs", slug: "coral-springs-fl", population: 132000 }
                ]
            },
            {
                name: "Georgia", slug: "georgia", cities: [
                    { name: "Atlanta", slug: "atlanta-ga", population: 498715 }, { name: "Augusta", slug: "augusta-ga", population: 202081 }, { name: "Columbus", slug: "columbus-ga", population: 206922 }, { name: "Macon", slug: "macon-ga", population: 157346 }, { name: "Savannah", slug: "savannah-ga", population: 147780 },
                    { name: "Athens", slug: "athens-ga", population: 127000 }, { name: "Sandy Springs", slug: "sandy-springs-ga", population: 109000 }, { name: "Roswell", slug: "roswell-ga", population: 94000 }, { name: "Johns Creek", slug: "johns-creek-ga", population: 84000 }, { name: "Warner Robins", slug: "warner-robins-ga", population: 80000 }
                ]
            },
            {
                name: "Hawaii", slug: "hawaii", cities: [
                    { name: "Honolulu", slug: "honolulu-hi", population: 350964 }, { name: "Pearl City", slug: "pearl-city-hi", population: 47698 }, { name: "Hilo", slug: "hilo-hi", population: 43263 }, { name: "Kailua", slug: "kailua-hi", population: 38000 }
                ]
            },
            {
                name: "Idaho", slug: "idaho", cities: [
                    { name: "Boise", slug: "boise-id", population: 235684 }, { name: "Meridian", slug: "meridian-id", population: 114161 }, { name: "Nampa", slug: "nampa-id", population: 100200 }, { name: "Idaho Falls", slug: "idaho-falls-id", population: 64000 }
                ]
            },
            {
                name: "Illinois", slug: "illinois", cities: [
                    { name: "Chicago", slug: "chicago-il", population: 2746388 }, { name: "Aurora", slug: "aurora-il", population: 180542 }, { name: "Naperville", slug: "naperville-il", population: 149540 }, { name: "Joliet", slug: "joliet-il", population: 150362 }, { name: "Rockford", slug: "rockford-il", population: 148655 },
                    { name: "Springfield", slug: "springfield-il", population: 114394 }, { name: "Peoria", slug: "peoria-il", population: 113150 }, { name: "Elgin", slug: "elgin-il", population: 114797 }, { name: "Champaign", slug: "champaign-il", population: 88000 }, { name: "Waukegan", slug: "waukegan-il", population: 86000 }
                ]
            },
            {
                name: "Indiana", slug: "indiana", cities: [
                    { name: "Indianapolis", slug: "indianapolis-in", population: 887642 }, { name: "Fort Wayne", slug: "fort-wayne-in", population: 263886 }, { name: "Evansville", slug: "evansville-in", population: 118414 }, { name: "South Bend", slug: "south-bend-in", population: 103453 }, { name: "Carmel", slug: "carmel-in", population: 99000 },
                    { name: "Fishers", slug: "fishers-in", population: 98000 }
                ]
            },
            {
                name: "Iowa", slug: "iowa", cities: [
                    { name: "Des Moines", slug: "des-moines-ia", population: 214133 }, { name: "Cedar Rapids", slug: "cedar-rapids-ia", population: 137710 }, { name: "Davenport", slug: "davenport-ia", population: 101724 }, { name: "Sioux City", slug: "sioux-city-ia", population: 85000 }, { name: "Iowa City", slug: "iowa-city-ia", population: 74000 }
                ]
            },
            {
                name: "Kansas", slug: "kansas", cities: [
                    { name: "Wichita", slug: "wichita-ks", population: 397532 }, { name: "Overland Park", slug: "overland-park-ks", population: 197238 }, { name: "Kansas City", slug: "kansas-city-ks", population: 156607 }, { name: "Olathe", slug: "olathe-ks", population: 141290 }, { name: "Topeka", slug: "topeka-ks", population: 126587 }
                ]
            },
            {
                name: "Kentucky", slug: "kentucky", cities: [
                    { name: "Louisville", slug: "louisville-ky", population: 633045 }, { name: "Lexington", slug: "lexington-ky", population: 322570 }, { name: "Bowling Green", slug: "bowling-green-ky", population: 72294 }, { name: "Owensboro", slug: "owensboro-ky", population: 60000 }
                ]
            },
            {
                name: "Louisiana", slug: "louisiana", cities: [
                    { name: "New Orleans", slug: "new-orleans-la", population: 383997 }, { name: "Baton Rouge", slug: "baton-rouge-la", population: 227470 }, { name: "Shreveport", slug: "shreveport-la", population: 187593 }, { name: "Lafayette", slug: "lafayette-la", population: 121374 }, { name: "Lake Charles", slug: "lake-charles-la", population: 78000 }
                ]
            },
            {
                name: "Maine", slug: "maine", cities: [
                    { name: "Portland", slug: "portland-me", population: 68408 }, { name: "Lewiston", slug: "lewiston-me", population: 37121 }, { name: "Bangor", slug: "bangor-me", population: 31753 }
                ]
            },
            {
                name: "Maryland", slug: "maryland", cities: [
                    { name: "Baltimore", slug: "baltimore-md", population: 585708 }, { name: "Columbia", slug: "columbia-md", population: 104681 }, { name: "Germantown", slug: "germantown-md", population: 91249 }, { name: "Silver Spring", slug: "silver-spring-md", population: 81015 }, { name: "Waldorf", slug: "waldorf-md", population: 81000 }
                ]
            },
            {
                name: "Massachusetts", slug: "massachusetts", cities: [
                    { name: "Boston", slug: "boston-ma", population: 675647 }, { name: "Worcester", slug: "worcester-ma", population: 206518 }, { name: "Springfield", slug: "springfield-ma", population: 155929 }, { name: "Cambridge", slug: "cambridge-ma", population: 118403 }, { name: "Lowell", slug: "lowell-ma", population: 115554 },
                    { name: "Brockton", slug: "brockton-ma", population: 105000 }, { name: "Quincy", slug: "quincy-ma", population: 101000 }, { name: "Lynn", slug: "lynn-ma", population: 100000 }, { name: "New Bedford", slug: "new-bedford-ma", population: 100000 }
                ]
            },
            {
                name: "Michigan", slug: "michigan", cities: [
                    { name: "Detroit", slug: "detroit-mi", population: 639111 }, { name: "Grand Rapids", slug: "grand-rapids-mi", population: 198917 }, { name: "Warren", slug: "warren-mi", population: 139387 }, { name: "Sterling Heights", slug: "sterling-heights-mi", population: 134346 }, { name: "Ann Arbor", slug: "ann-arbor-mi", population: 123851 }, { name: "Lansing", slug: "lansing-mi", population: 118768 },
                    { name: "Dearborn", slug: "dearborn-mi", population: 109000 }, { name: "Clinton Township", slug: "clinton-township-mi", population: 100000 }
                ]
            },
            {
                name: "Minnesota", slug: "minnesota", cities: [
                    { name: "Minneapolis", slug: "minneapolis-mn", population: 429954 }, { name: "St. Paul", slug: "st-paul-mn", population: 311527 }, { name: "Rochester", slug: "rochester-mn", population: 121395 }, { name: "Duluth", slug: "duluth-mn", population: 86697 }, { name: "Bloomington", slug: "bloomington-mn", population: 89987 }
                ]
            },
            {
                name: "Mississippi", slug: "mississippi", cities: [
                    { name: "Jackson", slug: "jackson-ms", population: 153701 }, { name: "Gulfport", slug: "gulfport-ms", population: 72926 }, { name: "Southaven", slug: "southaven-ms", population: 54648 }
                ]
            },
            {
                name: "Missouri", slug: "missouri", cities: [
                    { name: "Kansas City", slug: "kansas-city-mo", population: 508090 }, { name: "St. Louis", slug: "st-louis-mo", population: 301578 }, { name: "Springfield", slug: "springfield-mo", population: 169176 }, { name: "Columbia", slug: "columbia-mo", population: 126254 }, { name: "Independence", slug: "independence-mo", population: 123011 }
                ]
            },
            {
                name: "Montana", slug: "montana", cities: [
                    { name: "Billings", slug: "billings-mt", population: 117116 }, { name: "Missoula", slug: "missoula-mt", population: 73489 }, { name: "Great Falls", slug: "great-falls-mt", population: 60442 }
                ]
            },
            {
                name: "Nebraska", slug: "nebraska", cities: [
                    { name: "Omaha", slug: "omaha-ne", population: 486051 }, { name: "Lincoln", slug: "lincoln-ne", population: 291082 }, { name: "Bellevue", slug: "bellevue-ne", population: 64176 }
                ]
            },
            {
                name: "Nevada", slug: "nevada", cities: [
                    { name: "Las Vegas", slug: "las-vegas-nv", population: 641903 }, { name: "Henderson", slug: "henderson-nv", population: 317610 }, { name: "Reno", slug: "reno-nv", population: 264165 }, { name: "North Las Vegas", slug: "north-las-vegas-nv", population: 262527 }, { name: "Sparks", slug: "sparks-nv", population: 108445 }
                ]
            },
            {
                name: "New Hampshire", slug: "new-hampshire", cities: [
                    { name: "Manchester", slug: "manchester-nh", population: 115644 }, { name: "Nashua", slug: "nashua-nh", population: 91322 }, { name: "Concord", slug: "concord-nh", population: 43976 }
                ]
            },
            {
                name: "New Jersey", slug: "new-jersey", cities: [
                    { name: "Newark", slug: "newark-nj", population: 311549 }, { name: "Jersey City", slug: "jersey-city-nj", population: 292449 }, { name: "Paterson", slug: "paterson-nj", population: 159732 }, { name: "Elizabeth", slug: "elizabeth-nj", population: 137298 }, { name: "Edison", slug: "edison-nj", population: 107588 },
                    { name: "Woodbridge", slug: "woodbridge-nj", population: 103000 }, { name: "Lakewood", slug: "lakewood-nj", population: 135000 }, { name: "Toms River", slug: "toms-river-nj", population: 95000 }, { name: "Hamilton", slug: "hamilton-nj", population: 92000 }
                ]
            },
            {
                name: "New Mexico", slug: "new-mexico", cities: [
                    { name: "Albuquerque", slug: "albuquerque-nm", population: 564559 }, { name: "Las Cruces", slug: "las-cruces-nm", population: 111385 }, { name: "Rio Rancho", slug: "rio-rancho-nm", population: 104046 }, { name: "Santa Fe", slug: "santa-fe-nm", population: 87505 }
                ]
            },
            {
                name: "New York", slug: "new-york", cities: [
                    { name: "New York City", slug: "new-york-city-ny", population: 8804190 }, { name: "Buffalo", slug: "buffalo-ny", population: 278349 }, { name: "Rochester", slug: "rochester-ny", population: 211328 }, { name: "Yonkers", slug: "yonkers-ny", population: 211569 }, { name: "Syracuse", slug: "syracuse-ny", population: 148620 }, { name: "Albany", slug: "albany-ny", population: 99224 }
                ]
            },
            {
                name: "North Carolina", slug: "north-carolina", cities: [
                    { name: "Charlotte", slug: "charlotte-nc", population: 874579 }, { name: "Raleigh", slug: "raleigh-nc", population: 467665 }, { name: "Greensboro", slug: "greensboro-nc", population: 299035 }, { name: "Durham", slug: "durham-nc", population: 283506 }, { name: "Winston-Salem", slug: "winston-salem-nc", population: 249545 }, { name: "Fayetteville", slug: "fayetteville-nc", population: 208501 }, { name: "Cary", slug: "cary-nc", population: 174721 }, { name: "Wilmington", slug: "wilmington-nc", population: 115451 },
                    { name: "High Point", slug: "high-point-nc", population: 112000 }, { name: "Concord", slug: "concord-nc", population: 96000 }
                ]
            },
            {
                name: "North Dakota", slug: "north-dakota", cities: [
                    { name: "Fargo", slug: "fargo-nd", population: 125990 }, { name: "Bismarck", slug: "bismarck-nd", population: 73622 }, { name: "Grand Forks", slug: "grand-forks-nd", population: 59166 }
                ]
            },
            {
                name: "Ohio", slug: "ohio", cities: [
                    { name: "Columbus", slug: "columbus-oh", population: 905748 }, { name: "Cleveland", slug: "cleveland-oh", population: 372624 }, { name: "Cincinnati", slug: "cincinnati-oh", population: 309317 }, { name: "Toledo", slug: "toledo-oh", population: 270871 }, { name: "Akron", slug: "akron-oh", population: 190469 }, { name: "Dayton", slug: "dayton-oh", population: 137644 }
                ]
            },
            {
                name: "Oklahoma", slug: "oklahoma", cities: [
                    { name: "Oklahoma City", slug: "oklahoma-city-ok", population: 681054 }, { name: "Tulsa", slug: "tulsa-ok", population: 413066 }, { name: "Norman", slug: "norman-ok", population: 128026 }, { name: "Broken Arrow", slug: "broken-arrow-ok", population: 113540 }, { name: "Edmond", slug: "edmond-ok", population: 94428 }, { name: "Lawton", slug: "lawton-ok", population: 90000 }
                ]
            },
            {
                name: "Oregon", slug: "oregon", cities: [
                    { name: "Portland", slug: "portland-or", population: 652503 }, { name: "Salem", slug: "salem-or", population: 175535 }, { name: "Eugene", slug: "eugene-or", population: 176654 }, { name: "Gresham", slug: "gresham-or", population: 114247 }, { name: "Hillsboro", slug: "hillsboro-or", population: 106447 },
                    { name: "Bend", slug: "bend-or", population: 100000 }
                ]
            },
            {
                name: "Pennsylvania", slug: "pennsylvania", cities: [
                    { name: "Philadelphia", slug: "philadelphia-pa", population: 1603797 }, { name: "Pittsburgh", slug: "pittsburgh-pa", population: 302971 }, { name: "Allentown", slug: "allentown-pa", population: 125845 }, { name: "Erie", slug: "erie-pa", population: 94831 }, { name: "Reading", slug: "reading-pa", population: 95112 },
                    { name: "Scranton", slug: "scranton-pa", population: 76000 }, { name: "Bethlehem", slug: "bethlehem-pa", population: 75000 }
                ]
            },
            {
                name: "Rhode Island", slug: "rhode-island", cities: [
                    { name: "Providence", slug: "providence-ri", population: 190934 }, { name: "Warwick", slug: "warwick-ri", population: 82672 }, { name: "Cranston", slug: "cranston-ri", population: 82934 }, { name: "Pawtucket", slug: "pawtucket-ri", population: 71000 }
                ]
            },
            {
                name: "South Carolina", slug: "south-carolina", cities: [
                    { name: "Charleston", slug: "charleston-sc", population: 150227 }, { name: "Columbia", slug: "columbia-sc", population: 137300 }, { name: "North Charleston", slug: "north-charleston-sc", population: 114852 }, { name: "Mount Pleasant", slug: "mount-pleasant-sc", population: 90801 }, { name: "Rock Hill", slug: "rock-hill-sc", population: 74372 },
                    { name: "Greenville", slug: "greenville-sc", population: 70000 }
                ]
            },
            {
                name: "South Dakota", slug: "south-dakota", cities: [
                    { name: "Sioux Falls", slug: "sioux-falls-sd", population: 192517 }, { name: "Rapid City", slug: "rapid-city-sd", population: 74703 }
                ]
            },
            {
                name: "Tennessee", slug: "tennessee", cities: [
                    { name: "Nashville", slug: "nashville-tn", population: 689447 }, { name: "Memphis", slug: "memphis-tn", population: 633104 }, { name: "Knoxville", slug: "knoxville-tn", population: 190740 }, { name: "Chattanooga", slug: "chattanooga-tn", population: 181099 }, { name: "Clarksville", slug: "clarksville-tn", population: 166722 }, { name: "Murfreesboro", slug: "murfreesboro-tn", population: 152769 },
                    { name: "Franklin", slug: "franklin-tn", population: 83000 }
                ]
            },
            {
                name: "Texas", slug: "texas", cities: [
                    { name: "Houston", slug: "houston-tx", population: 2304580 }, { name: "San Antonio", slug: "san-antonio-tx", population: 1434625 }, { name: "Dallas", slug: "dallas-tx", population: 1304379 }, { name: "Austin", slug: "austin-tx", population: 961855 }, { name: "Fort Worth", slug: "fort-worth-tx", population: 918915 }, { name: "El Paso", slug: "el-paso-tx", population: 678815 },
                    { name: "Arlington", slug: "arlington-tx", population: 394266 }, { name: "Corpus Christi", slug: "corpus-christi-tx", population: 317863 }, { name: "Plano", slug: "plano-tx", population: 285494 }, { name: "Laredo", slug: "laredo-tx", population: 255205 }, { name: "Lubbock", slug: "lubbock-tx", population: 257141 }, { name: "Garland", slug: "garland-tx", population: 246018 },
                    { name: "Irving", slug: "irving-tx", population: 256684 }, { name: "Amarillo", slug: "amarillo-tx", population: 200393 }, { name: "Grand Prairie", slug: "grand-prairie-tx", population: 196100 }, { name: "Brownsville", slug: "brownsville-tx", population: 186000 }, { name: "McKinney", slug: "mckinney-tx", population: 195000 }, { name: "Frisco", slug: "frisco-tx", population: 200000 }, { name: "Pasadena", slug: "pasadena-tx", population: 151000 }
                ]
            },
            {
                name: "Utah", slug: "utah", cities: [
                    { name: "Salt Lake City", slug: "salt-lake-city-ut", population: 199723 }, { name: "West Valley City", slug: "west-valley-city-ut", population: 140230 }, { name: "Provo", slug: "provo-ut", population: 115162 }, { name: "West Jordan", slug: "west-jordan-ut", population: 116961 }, { name: "Orem", slug: "orem-ut", population: 98000 }
                ]
            },
            {
                name: "Vermont", slug: "vermont", cities: [
                    { name: "Burlington", slug: "burlington-vt", population: 44743 }
                ]
            },
            {
                name: "Virginia", slug: "virginia", cities: [
                    { name: "Virginia Beach", slug: "virginia-beach-va", population: 459470 }, { name: "Norfolk", slug: "norfolk-va", population: 238005 }, { name: "Chesapeake", slug: "chesapeake-va", population: 249422 }, { name: "Richmond", slug: "richmond-va", population: 226610 }, { name: "Newport News", slug: "newport-news-va", population: 186247 }, { name: "Alexandria", slug: "alexandria-va", population: 159467 }, { name: "Hampton", slug: "hampton-va", population: 137148 },
                    { name: "Roanoke", slug: "roanoke-va", population: 100000 }, { name: "Portsmouth", slug: "portsmouth-va", population: 95000 }
                ]
            },
            {
                name: "Washington", slug: "washington", cities: [
                    { name: "Seattle", slug: "seattle-wa", population: 737015 }, { name: "Spokane", slug: "spokane-wa", population: 228989 }, { name: "Tacoma", slug: "tacoma-wa", population: 219346 }, { name: "Vancouver", slug: "vancouver-wa", population: 190915 }, { name: "Bellevue", slug: "bellevue-wa", population: 151854 }, { name: "Kent", slug: "kent-wa", population: 136588 },
                    { name: "Everett", slug: "everett-wa", population: 110000 }
                ]
            },
            {
                name: "West Virginia", slug: "west-virginia", cities: [
                    { name: "Charleston", slug: "charleston-wv", population: 46536 }, { name: "Huntington", slug: "huntington-wv", population: 46842 }
                ]
            },
            {
                name: "Wisconsin", slug: "wisconsin", cities: [
                    { name: "Milwaukee", slug: "milwaukee-wi", population: 577222 }, { name: "Madison", slug: "madison-wi", population: 269840 }, { name: "Green Bay", slug: "green-bay-wi", population: 107395 }, { name: "Kenosha", slug: "kenosha-wi", population: 99986 }, { name: "Racine", slug: "racine-wi", population: 77816 }
                ]
            },
            {
                name: "Wyoming", slug: "wyoming", cities: [
                    { name: "Cheyenne", slug: "cheyenne-wy", population: 65132 }, { name: "Casper", slug: "casper-wy", population: 59038 }
                ]
            },
            {
                name: "Puerto Rico", slug: "puerto-rico", cities: [
                    { name: "San Juan", slug: "san-juan-pr", population: 342259 }, { name: "Bayamón", slug: "bayamon-pr", population: 169269 }, { name: "Carolina", slug: "carolina-pr", population: 154815 }, { name: "Ponce", slug: "ponce-pr", population: 137000 }, { name: "Caguas", slug: "caguas-pr", population: 127000 }
                ]
            }
        ]
    },

    // ==========================================
    // INTERNATIONAL (Major Global Economies)
    // Target: ~5-10 major cities per country
    // ==========================================
    {
        country: "Canada", code: "CA", slug: "canada", name: "Canada",
        regions: [
            {
                name: "Ontario", slug: "ontario", cities: [
                    { name: "Toronto", slug: "toronto", population: 2731571 }, { name: "Ottawa", slug: "ottawa", population: 934243 }, { name: "Mississauga", slug: "mississauga", population: 721599 }, { name: "Brampton", slug: "brampton", population: 593000 }, { name: "Hamilton", slug: "hamilton", population: 536000 }
                ]
            },
            {
                name: "Quebec", slug: "quebec", cities: [
                    { name: "Montreal", native_name: "Montréal", slug: "montreal", population: 1704694 }, { name: "Quebec City", native_name: "Québec", slug: "quebec-city", population: 531902 }, { name: "Laval", slug: "laval", population: 422000 }
                ]
            },
            {
                name: "British Columbia", slug: "british-columbia", cities: [
                    { name: "Vancouver", slug: "vancouver", population: 631486 }, { name: "Surrey", slug: "surrey", population: 517887 }, { name: "Burnaby", slug: "burnaby", population: 232000 }
                ]
            },
            {
                name: "Alberta", slug: "alberta", cities: [
                    { name: "Calgary", slug: "calgary", population: 1239220 }, { name: "Edmonton", slug: "edmonton", population: 932546 }
                ]
            }
        ]
    },
    {
        country: "United Kingdom", code: "GB", slug: "united-kingdom", name: "United Kingdom",
        regions: [
            {
                name: "England", slug: "england", cities: [
                    { name: "London", slug: "london-uk", population: 8982000 }, { name: "Birmingham", slug: "birmingham-uk", population: 1141817 }, { name: "Manchester", slug: "manchester-uk", population: 553230 }, { name: "Liverpool", slug: "liverpool-uk", population: 498042 }, { name: "Leeds", slug: "leeds-uk", population: 793139 }, { name: "Bristol", slug: "bristol-uk", population: 467099 }, { name: "Sheffield", slug: "sheffield-uk", population: 584000 }, { name: "Newcastle", slug: "newcastle-uk", population: 300000 }
                ]
            },
            {
                name: "Scotland", slug: "scotland", cities: [
                    { name: "Edinburgh", slug: "edinburgh-uk", population: 527620 }, { name: "Glasgow", slug: "glasgow-uk", population: 633120 }
                ]
            },
            { name: "Wales", slug: "wales", cities: [{ name: "Cardiff", native_name: "Caerdydd", slug: "cardiff-uk", population: 362756 }] },
            { name: "Northern Ireland", slug: "northern-ireland", cities: [{ name: "Belfast", slug: "belfast-uk", population: 343000 }] }
        ]
    },
    {
        country: "Australia", code: "AU", slug: "australia", name: "Australia",
        regions: [
            { name: "New South Wales", slug: "new-south-wales", cities: [{ name: "Sydney", slug: "sydney", population: 5312000 }, { name: "Newcastle", slug: "newcastle-au", population: 322278 }] },
            { name: "Victoria", slug: "victoria", cities: [{ name: "Melbourne", slug: "melbourne", population: 5078000 }] },
            { name: "Queensland", slug: "queensland", cities: [{ name: "Brisbane", slug: "brisbane", population: 2280000 }, { name: "Gold Coast", slug: "gold-coast", population: 540559 }] },
            { name: "Western Australia", slug: "western-australia", cities: [{ name: "Perth", slug: "perth", population: 2059000 }] },
            { name: "South Australia", slug: "south-australia", cities: [{ name: "Adelaide", slug: "adelaide", population: 1306000 }] }
        ]
    },
    { // Simplified structure for other countries with less clear "Region" drilldown data easily available
        country: "Japan", code: "JP", slug: "japan", name: "Japan",
        regions: [
            { name: "Kanto", slug: "kanto", cities: [{ name: "Tokyo", native_name: "東京", slug: "tokyo", population: 13960000 }, { name: "Yokohama", native_name: "横浜", slug: "yokohama", population: 3725000 }, { name: "Kawasaki", native_name: "川崎", slug: "kawasaki", population: 1538000 }, { name: "Saitama", native_name: "さいたま", slug: "saitama", population: 1324000 }] },
            { name: "Kansai", slug: "kansai", cities: [{ name: "Osaka", native_name: "大阪", slug: "osaka", population: 2691000 }, { name: "Kyoto", native_name: "京都", slug: "kyoto", population: 1475000 }, { name: "Kobe", native_name: "神戸", slug: "kobe", population: 1525000 }] },
            { name: "Chubu", slug: "chubu", cities: [{ name: "Nagoya", native_name: "名古屋", slug: "nagoya", population: 2300000 }] },
            { name: "Kyushu", slug: "kyushu", cities: [{ name: "Fukuoka", native_name: "福岡", slug: "fukuoka", population: 1612000 }] },
            { name: "Hokkaido", slug: "hokkaido", cities: [{ name: "Sapporo", native_name: "札幌", slug: "sapporo", population: 1952000 }] }
        ]
    },
    {
        country: "Germany", code: "DE", slug: "germany", name: "Germany",
        regions: [
            { name: "Berlin", slug: "berlin-state", cities: [{ name: "Berlin", native_name: "Berlin", slug: "berlin", population: 3645000 }] },
            { name: "Bavaria", slug: "bavaria", cities: [{ name: "Munich", native_name: "München", slug: "munich", population: 1472000 }, { name: "Nuremberg", native_name: "Nürnberg", slug: "nuremberg", population: 518370 }] },
            { name: "North Rhine-Westphalia", slug: "nrw", cities: [{ name: "Cologne", native_name: "Köln", slug: "cologne", population: 1086000 }, { name: "Düsseldorf", native_name: "Düsseldorf", slug: "dusseldorf", population: 619294 }, { name: "Dortmund", slug: "dortmund", population: 587000 }, { name: "Essen", slug: "essen", population: 583000 }] },
            { name: "Hamburg", slug: "hamburg-state", cities: [{ name: "Hamburg", native_name: "Hamburg", slug: "hamburg", population: 1841000 }] },
            { name: "Hesse", slug: "hesse", cities: [{ name: "Frankfurt", native_name: "Frankfurt am Main", slug: "frankfurt", population: 753056 }] }
        ]
    },
    {
        country: "France", code: "FR", slug: "france", name: "France",
        regions: [
            { name: "Île-de-France", slug: "ile-de-france", cities: [{ name: "Paris", native_name: "Paris", slug: "paris", population: 2161000 }] },
            { name: "Auvergne-Rhône-Alpes", slug: "ara", cities: [{ name: "Lyon", native_name: "Lyon", slug: "lyon", population: 513275 }] },
            { name: "PACA", slug: "paca", cities: [{ name: "Marseille", native_name: "Marseille", slug: "marseille", population: 861635 }, { name: "Nice", native_name: "Nice", slug: "nice", population: 342522 }] },
            { name: "Occitanie", slug: "occitanie", cities: [{ name: "Toulouse", native_name: "Toulouse", slug: "toulouse", population: 471941 }] },
            { name: "Nouvelle-Aquitaine", slug: "nouvelle-aquitaine", cities: [{ name: "Bordeaux", native_name: "Bordeaux", slug: "bordeaux", population: 257000 }] }
        ]
    },
    {
        country: "Italy", code: "IT", slug: "italy", name: "Italy",
        regions: [
            { name: "Lazio", slug: "lazio", cities: [{ name: "Rome", native_name: "Roma", slug: "rome", population: 2873000 }] },
            { name: "Lombardy", slug: "lombardy", cities: [{ name: "Milan", native_name: "Milano", slug: "milan", population: 1352000 }] },
            { name: "Campania", slug: "campania", cities: [{ name: "Naples", native_name: "Napoli", slug: "naples", population: 966144 }] },
            { name: "Piedmont", slug: "piedmont", cities: [{ name: "Turin", native_name: "Torino", slug: "turin", population: 886837 }] },
            { name: "Tuscany", slug: "tuscany", cities: [{ name: "Florence", native_name: "Firenze", slug: "florence", population: 382000 }] }
        ]
    },
    {
        country: "Spain", code: "ES", slug: "spain", name: "Spain",
        regions: [
            { name: "Madrid", slug: "madrid-region", cities: [{ name: "Madrid", native_name: "Madrid", slug: "madrid", population: 3223000 }] },
            { name: "Catalonia", slug: "catalonia", cities: [{ name: "Barcelona", native_name: "Barcelona", slug: "barcelona", population: 1620000 }] },
            { name: "Valencia", slug: "valencia-region", cities: [{ name: "Valencia", native_name: "València", slug: "valencia", population: 791413 }] },
            { name: "Andalusia", slug: "andalusia", cities: [{ name: "Seville", native_name: "Sevilla", slug: "seville", population: 688000 }, { name: "Málaga", slug: "malaga", population: 571000 }] }
        ]
    },
    {
        country: "China", code: "CN", slug: "china", name: "China",
        regions: [
            {
                name: "Municipalities", slug: "municipalities-cn", cities: [
                    { name: "Shanghai", native_name: "上海", slug: "shanghai", population: 26320000 },
                    { name: "Beijing", native_name: "北京", slug: "beijing", population: 21540000 },
                    { name: "Chongqing", native_name: "重庆", slug: "chongqing", population: 30480000 },
                    { name: "Tianjin", native_name: "天津", slug: "tianjin", population: 13860000 }
                ]
            },
            {
                name: "Guangdong", slug: "guangdong", cities: [
                    { name: "Guangzhou", native_name: "广州", slug: "guangzhou", population: 18670000 },
                    { name: "Shenzhen", native_name: "深圳", slug: "shenzhen", population: 17560000 }
                ]
            }
        ]
    },
    {
        country: "India", code: "IN", slug: "india", name: "India",
        regions: [
            { name: "Maharashtra", slug: "maharashtra", cities: [{ name: "Mumbai", native_name: "मुंबई", slug: "mumbai", population: 12442373 }, { name: "Pune", slug: "pune", population: 3124458 }] },
            { name: "Delhi", slug: "delhi-nct", cities: [{ name: "New Delhi", native_name: "नई दिल्ली", slug: "new-delhi", population: 257803 }] },
            { name: "Karnataka", slug: "karnataka", cities: [{ name: "Bangalore", native_name: "ಬೆಂಗಳೂರು", slug: "bangalore", population: 8443675 }] },
            { name: "Telangana", slug: "telangana", cities: [{ name: "Hyderabad", native_name: "హైదరాబాద్", slug: "hyderabad", population: 6809970 }] },
            { name: "Tamil Nadu", slug: "tamil-nadu", cities: [{ name: "Chennai", native_name: "சென்னை", slug: "chennai", population: 7088000 }] },
            { name: "West Bengal", slug: "west-bengal", cities: [{ name: "Kolkata", native_name: "কলকাতা", slug: "kolkata", population: 4496694 }] }
        ]
    },
    {
        country: "Brazil", code: "BR", slug: "brazil", name: "Brazil",
        regions: [
            { name: "São Paulo", slug: "sao-paulo-state", cities: [{ name: "São Paulo", slug: "sao-paulo-br", population: 12330000 }, { name: "Campinas", slug: "campinas", population: 1213000 }] },
            { name: "Rio de Janeiro", slug: "rio-de-janeiro-state", cities: [{ name: "Rio de Janeiro", slug: "rio-de-janeiro-br", population: 6748000 }] },
            { name: "Distrito Federal", slug: "distrito-federal", cities: [{ name: "Brasília", slug: "brasilia", population: 3055000 }] },
            { name: "Bahia", slug: "bahia", cities: [{ name: "Salvador", slug: "salvador", population: 2886000 }] }
        ]
    },
    {
        country: "Mexico", code: "MX", slug: "mexico", name: "Mexico",
        regions: [{ name: "Mexico City", slug: "mexico-city", cities: [{ name: "Mexico City", native_name: "Ciudad de México", slug: "mexico-city-mx", population: 9209944 }] },
        { name: "Jalisco", slug: "jalisco", cities: [{ name: "Guadalajara", slug: "guadalajara", population: 1495000 }] },
        { name: "Nuevo León", slug: "nuevo-leon", cities: [{ name: "Monterrey", slug: "monterrey", population: 1135000 }] }]
    },
    {
        country: "South Korea", code: "KR", slug: "south-korea", name: "South Korea",
        regions: [{ name: "Seoul", slug: "seoul-cap", cities: [{ name: "Seoul", native_name: "서울", slug: "seoul", population: 9765000 }] },
        { name: "Busan", slug: "busan-city", cities: [{ name: "Busan", native_name: "부산", slug: "busan", population: 3412000 }] },
        { name: "Incheon", slug: "incheon-city", cities: [{ name: "Incheon", native_name: "인천", slug: "incheon", population: 2957000 }] }]
    },
    { country: "Russia", code: "RU", slug: "russia", name: "Russia", regions: [{ name: "Federal Cities", slug: "fed-cities", cities: [{ name: "Moscow", native_name: "Москва", slug: "moscow", population: 12506000 }, { name: "Saint Petersburg", native_name: "Санкт-Петербург", slug: "saint-petersburg", population: 5351000 }] }] },
    { country: "Turkey", code: "TR", slug: "turkey", name: "Turkey", regions: [{ name: "Istanbul", slug: "istanbul-reg", cities: [{ name: "Istanbul", native_name: "İstanbul", slug: "istanbul", population: 15460000 }] }, { name: "Ankara", slug: "ankara-reg", cities: [{ name: "Ankara", slug: "ankara", population: 5663000 }] }] },
    { country: "Indonesia", code: "ID", slug: "indonesia", name: "Indonesia", regions: [{ name: "Java", slug: "java", cities: [{ name: "Jakarta", slug: "jakarta", population: 10560000 }, { name: "Surabaya", slug: "surabaya", population: 2870000 }] }] },
    { country: "Saudi Arabia", code: "SA", slug: "saudi-arabia", name: "Saudi Arabia", regions: [{ name: "Riyadh", slug: "riyadh-reg", cities: [{ name: "Riyadh", native_name: "الرياض", slug: "riyadh-city", population: 7000000 }] }, { name: "Makkah", slug: "makkah-reg", cities: [{ name: "Jeddah", native_name: "جدة", slug: "jeddah", population: 3976000 }] }] },
    { country: "Netherlands", code: "NL", slug: "netherlands", name: "Netherlands", regions: [{ name: "North Holland", slug: "north-holland", cities: [{ name: "Amsterdam", slug: "amsterdam", population: 821752 }] }, { name: "South Holland", slug: "south-holland", cities: [{ name: "Rotterdam", slug: "rotterdam", population: 641326 }, { name: "The Hague", native_name: "Den Haag", slug: "the-hague", population: 537833 }] }] },
    { country: "Switzerland", code: "CH", slug: "switzerland", name: "Switzerland", regions: [{ name: "Zurich", slug: "zurich-canton", cities: [{ name: "Zurich", native_name: "Zürich", slug: "zurich", population: 415000 }] }, { name: "Geneva", slug: "geneva-canton", cities: [{ name: "Geneva", native_name: "Genève", slug: "geneva", population: 201000 }] }] },
    { country: "Sweden", code: "SE", slug: "sweden", name: "Sweden", regions: [{ name: "Stockholm", slug: "stockholm-county", cities: [{ name: "Stockholm", slug: "stockholm", population: 975000 }] }] },
    { country: "Poland", code: "PL", slug: "poland", name: "Poland", regions: [{ name: "Masovian", slug: "masovian", cities: [{ name: "Warsaw", native_name: "Warszawa", slug: "warsaw", population: 1790000 }] }] },
    { country: "Argentina", code: "AR", slug: "argentina", name: "Argentina", regions: [{ name: "Buenos Aires", slug: "buenos-aires-reg", cities: [{ name: "Buenos Aires", slug: "buenos-aires", population: 2890000 }] }] },
    { country: "South Africa", code: "ZA", slug: "south-africa", name: "South Africa", regions: [{ name: "Gauteng", slug: "gauteng", cities: [{ name: "Johannesburg", slug: "johannesburg", population: 5635000 }] }, { name: "Western Cape", slug: "western-cape", cities: [{ name: "Cape Town", slug: "cape-town", population: 4336000 }] }] },
    { country: "Egypt", code: "EG", slug: "egypt", name: "Egypt", regions: [{ name: "Cairo", slug: "cairo-gov", cities: [{ name: "Cairo", native_name: "القاهرة", slug: "cairo", population: 9840000 }] }] },
    { country: "Thailand", code: "TH", slug: "thailand", name: "Thailand", regions: [{ name: "Bangkok", slug: "bangkok-met", cities: [{ name: "Bangkok", native_name: "กรุงเทพมหานคร", slug: "bangkok", population: 10539000 }] }] },
    { country: "Vietnam", code: "VN", slug: "vietnam", name: "Vietnam", regions: [{ name: "Southeast", slug: "southeast-vn", cities: [{ name: "Ho Chi Minh City", native_name: "Thành phố Hồ Chí Minh", slug: "ho-chi-minh-city", population: 8993000 }] }, { name: "Red River Delta", slug: "red-river", cities: [{ name: "Hanoi", native_name: "Hà Nội", slug: "hanoi", population: 8053000 }] }] },
    { country: "Philippines", code: "PH", slug: "philippines", name: "Philippines", regions: [{ name: "Metro Manila", slug: "metro-manila", cities: [{ name: "Manila", slug: "manila", population: 1780000 }, { name: "Quezon City", slug: "quezon-city", population: 2936000 }] }] },
];
