/** Recent IPO additions. Founding history is distinct from holding-company incorporation.
 * Geographic exceptions are explicit: an exchange location is never a country of origin.
 * Valuations are attached centrally from the dated public-company snapshot.
 */
const us = { country: 'United States', countryCode: 'US', region: 'US' };
const china = { country: 'China', countryCode: 'CN', region: 'CHINA' };
const greenfield = { originType: 'from_scratch', isFromScratch: true };

export const recentIposData = [
  {
    id: 'spcx', name: 'SpaceX', ticker: 'SPCX (NASDAQ / Nasdaq Texas)',
    foundingYear: 2002, ...us, ...greenfield, isTech: true, sector: 'Industrials & Energy',
    industry: 'Space Launch, Satellite Connectivity & AI', ipoYear: 2026, ipoDate: '2026-06-12',
    founders: 'Elon Musk', headquarters: 'Starbase, Texas, USA',
    originDetails: 'Founded as a new rocket company in 2002. The 2026 listed parent includes space, connectivity and AI businesses; its market cap is the consolidated group, not the rocket business alone.',
    citation: 'SpaceX IPO pricing release (11 June 2026), SEC filings and Stock Analysis company profile',
    citationUrl: 'https://ir.spacex.com/updates/releases-details/2026/Space-Exploration-Technologies-Corp--Announces-Pricing-of-Initial-Public-Offering/default.aspx'
  },
  {
    id: 'cbrs', name: 'Cerebras Systems', ticker: 'CBRS (NASDAQ)',
    foundingYear: 2015, foundingYearBasis: 'Business founding in 2015; legal incorporation in 2016',
    ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'Wafer-Scale AI Semiconductors',
    ipoYear: 2026, ipoDate: '2026-05-14', headquarters: 'Sunnyvale, California, USA',
    founders: 'Andrew Feldman, Gary Lauterbach, Michael James, Sean Lie, Jean-Philippe Fricker',
    originDetails: 'Founded as an independent AI hardware startup in 2015. The operating business predates the 2016 legal incorporation; age follows the business origin.',
    citation: 'Cerebras company profile and SEC registration filings (CIK 2021728)',
    citationUrl: 'https://www.sec.gov/edgar/browse/?CIK=2021728'
  },
  {
    id: 'zhipu', name: 'Z.ai (Zhipu AI)', ticker: '2513 (HKEX)',
    foundingYear: 2019, ...china, originType: 'spinoff', isFromScratch: false,
    isTech: true, sector: 'Technology', industry: 'Foundation Models & AI Infrastructure',
    ipoYear: 2026, ipoDate: '2026-01-08', headquarters: 'Beijing, China', founders: 'Jie Tang and Tsinghua research team',
    originDetails: 'Commercialized research from Tsinghua University in 2019. This screen treats an institutional research spinout as a spinoff, so the strict greenfield filter excludes it; it was not carved out of a listed corporation.',
    citation: 'Z.ai official company history and HKEX issuer 2513',
    citationUrl: 'https://www.zhipuai.cn/zh/about'
  },
  {
    id: 'minimax', name: 'MiniMax', ticker: '0100 (HKEX)',
    foundingYear: 2022, foundingYearBasis: 'Operational founding in early 2022, as described by MiniMax; predecessor incorporation in 2021',
    ...china, ...greenfield, isTech: true, sector: 'Technology', industry: 'Multimodal Foundation Models',
    ipoYear: 2026, ipoDate: '2026-01-09', headquarters: 'Shanghai, China', founders: 'Yan Junjie and founding team',
    originDetails: 'Independent Shanghai AI startup operationally founded in early 2022. Cayman holding-company domicile and Hong Kong listing do not change the operating origin.',
    citation: 'MiniMax official company history; SCMP listing-day report (9 January 2026)',
    citationUrl: 'https://www.minimax.io/'
  },
  {
    id: 'crwv', name: 'CoreWeave', ticker: 'CRWV (NASDAQ)',
    foundingYear: 2017, ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'AI Cloud Infrastructure',
    ipoYear: 2025, ipoDate: '2025-03-28', headquarters: 'Livingston, New Jersey, USA',
    founders: 'Michael Intrator, Brian Venturo, Brannin McBee',
    originDetails: 'Started as Atlantic Crypto in 2017 and pivoted its GPU infrastructure toward cloud computing and AI. A change of business model is not a corporate spinoff.',
    citation: 'CoreWeave IPO pricing release (27 March 2025) and company profile',
    citationUrl: 'https://investors.coreweave.com/news/news-details/2025/CoreWeave-Announces-Pricing-of-Initial-Public-Offering/default.aspx'
  },
  {
    id: 'crcl', name: 'Circle Internet Group', ticker: 'CRCL (NYSE)',
    foundingYear: 2013, ...us, ...greenfield, isTech: true, sector: 'Financials', industry: 'Stablecoins & Digital Payments Infrastructure',
    ipoYear: 2025, ipoDate: '2025-06-05', headquarters: 'New York, New York, USA', founders: 'Jeremy Allaire, Sean Neville',
    originDetails: 'Founded as an independent digital-finance company in 2013. The listed equity value is distinct from the supply or reserves of its USDC stablecoin.',
    citation: 'Circle SEC registration filings (CIK 1876042) and company profile',
    citationUrl: 'https://www.sec.gov/edgar/browse/?CIK=1876042'
  },
  {
    id: 'fig', name: 'Figma', ticker: 'FIG (NYSE)',
    foundingYear: 2012, ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'Collaborative Design Software',
    ipoYear: 2025, ipoDate: '2025-07-31', headquarters: 'San Francisco, California, USA', founders: 'Dylan Field, Evan Wallace',
    originDetails: 'Founded as a new software company in 2012. The proposed Adobe acquisition was terminated before completion; Figma subsequently listed independently.',
    citation: 'Figma SEC registration filings (CIK 1579878) and company profile',
    citationUrl: 'https://www.sec.gov/edgar/browse/?CIK=1579878'
  },
  {
    id: 'klar', name: 'Klarna', ticker: 'KLAR (NYSE)',
    foundingYear: 2005, ...greenfield, country: 'Sweden', countryCode: 'SE', region: 'EU',
    isTech: true, sector: 'Financials', industry: 'Digital Payments & Consumer Credit',
    ipoYear: 2025, ipoDate: '2025-09-10', headquarters: 'Stockholm, Sweden (principal operating offices); London, UK (registered parent)',
    geographyBasis: 'Swedish operating origin and principal facilities at IPO; London registered holding-company office is disclosed separately. NYSE is the listing venue.',
    founders: 'Sebastian Siemiatkowski, Niklas Adalberth, Victor Jacobsson',
    originDetails: 'Founded in Stockholm in 2005 as Kreditor. The UK holding-company reorganization before the US IPO does not reset the operating business founding date. Regional classification follows its Swedish operating origin, an explicit exception to a simple legal-parent domicile rule.',
    citation: 'Klarna final IPO prospectus (2025): registered office, principal facilities and predecessor history; IPO completion release',
    citationUrl: 'https://www.sec.gov/Archives/edgar/data/2003292/000200329225000052/klarnagroupplc424b4.htm'
  },
  {
    id: 'chym', name: 'Chime Financial', ticker: 'CHYM (NASDAQ)',
    foundingYear: 2012, ...us, ...greenfield, isTech: true, sector: 'Financials', industry: 'Consumer Financial Technology',
    ipoYear: 2025, ipoDate: '2025-06-12', headquarters: 'San Francisco, California, USA', founders: 'Chris Britt, Ryan King',
    originDetails: 'Founded in 2012 as 1Debit, later renamed Chime. The IPO issuer is a financial-technology company; partner banks are distinct entities.',
    citation: 'Chime IPO pricing release (11 June 2025) and company profile',
    citationUrl: 'https://investors.chime.com/news-releases/news-release-details/chime-announces-pricing-initial-public-offering'
  },
  {
    id: 'rddt', name: 'Reddit', ticker: 'RDDT (NYSE)',
    foundingYear: 2005, ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'Online Communities & Advertising',
    ipoYear: 2024, ipoDate: '2024-03-21', headquarters: 'San Francisco, California, USA', founders: 'Steve Huffman, Alexis Ohanian',
    originDetails: 'Started as an independent Y Combinator startup in 2005, acquired by Conde Nast in 2006 and reorganized as a separate Advance subsidiary in 2011. This screen classifies the original business genesis as greenfield, not the later separation as a new founding.',
    citation: 'Reddit IPO pricing release (20 March 2024), SEC prospectus and company history',
    citationUrl: 'https://investor.redditinc.com/news-events/news-releases/news-details/2024/Reddit-Announces-Pricing-of-Initial-Public-Offering/default.aspx'
  },
  {
    id: 'alab', name: 'Astera Labs', ticker: 'ALAB (NASDAQ)',
    foundingYear: 2017, ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'AI Data Centre Connectivity Semiconductors',
    ipoYear: 2024, ipoDate: '2024-03-20', headquarters: 'San Jose, California, USA', founders: 'Jitendra Mohan, Sanjay Gajendra, Casey Morrison',
    originDetails: 'Independent semiconductor startup incorporated in 2017, focused on connectivity for data centres and AI systems.',
    citation: 'Astera Labs IPO pricing release (19 March 2024) and company profile',
    citationUrl: 'https://www.asteralabs.com/news/astera-labs-announces-pricing-of-initial-public-offering/'
  },
  {
    id: 'rbrk', name: 'Rubrik', ticker: 'RBRK (NYSE)',
    foundingYear: 2014, foundingYearBasis: 'Operating-business founding in January 2014; legal incorporation in 2013',
    ...us, ...greenfield, isTech: true, sector: 'Technology', industry: 'Cybersecurity & Data Recovery',
    ipoYear: 2024, ipoDate: '2024-04-25', headquarters: 'Palo Alto, California, USA', founders: 'Bipul Sinha, Arvind Jain, Soham Mazumdar, Arvind Nithrakashyap',
    originDetails: 'Founded as an independent data-management startup in January 2014; the corporate entity was incorporated in 2013. Age follows the operating-business founding.',
    citation: 'Rubrik SEC registration filings (CIK 1943896), company profile and founding history',
    citationUrl: 'https://www.sec.gov/edgar/browse/?CIK=1943896'
  },
  {
    id: 'rpi', name: 'Raspberry Pi Holdings', ticker: 'RPI (LSE)',
    foundingYear: 2012, foundingYearBasis: 'Commercial company formed in 2012; charitable foundation established earlier',
    country: 'United Kingdom', countryCode: 'GB', region: 'EUROPE_NON_EU',
    originType: 'spinoff', isFromScratch: false, isTech: true, sector: 'Technology', industry: 'Embedded Computing Hardware',
    ipoYear: 2024, ipoDate: '2024-06-14', ipoDateBasis: 'Unconditional admission; conditional trading began 11 June 2024',
    headquarters: 'Cambridge, United Kingdom', founders: 'Eben Upton and Raspberry Pi team',
    originDetails: 'The 2012 commercial business originated within the Raspberry Pi Foundation ecosystem. Institutional carve-outs are excluded by this screen\'s strict greenfield setting. The charity itself is not listed.',
    citation: 'Raspberry Pi IPO announcement (11 June 2024) and admission prospectus',
    citationUrl: 'https://www.raspberrypi.com/news/raspberry-pi-ipo/'
  },
  {
    id: 'galderma', name: 'Galderma', ticker: 'GALD (SIX Swiss Exchange)',
    foundingYear: 1981, country: 'Switzerland', countryCode: 'CH', region: 'EUROPE_NON_EU',
    originType: 'joint_venture', isFromScratch: false, isTech: false, sector: 'Healthcare', industry: 'Dermatology & Pharmaceuticals',
    ipoYear: 2024, ipoDate: '2024-03-22', headquarters: 'Zug, Switzerland', founders: 'Nestle and L\'Oreal',
    originDetails: 'Established in 1981 as a joint venture between Nestle and L\'Oreal. Subsequent ownership changes and the 2024 IPO do not turn its corporate-parent origin into a greenfield founding.',
    citation: 'Galderma company history, SIX listing and company profile',
    citationUrl: 'https://www.galderma.com/glance'
  },
  {
    id: 'puig', name: 'Puig Brands', ticker: 'PUIG (BME Madrid)',
    foundingYear: 1914, country: 'Spain', countryCode: 'ES', region: 'EU', ...greenfield,
    isTech: false, sector: 'Consumer', industry: 'Beauty, Fragrance & Fashion',
    ipoYear: 2024, ipoDate: '2024-05-03', headquarters: 'Barcelona, Spain', founders: 'Antonio Puig Castello',
    originDetails: 'Family business established in Barcelona in 1914. Its 2024 IPO is recent, but the business itself is over a century old and does not qualify for the 50-year screen.',
    citation: 'Puig corporate history, CNMV IPO prospectus and company profile',
    citationUrl: 'https://www.puig.com/en/'
  },
  {
    id: 'verisure', name: 'Verisure', ticker: 'VSURE (Nasdaq Stockholm)',
    foundingYear: 1988, country: 'United Kingdom', countryCode: 'GB', region: 'EUROPE_NON_EU',
    geographyBasis: 'London-listed-parent headquarters; Swedish business origin and Stockholm listing disclosed separately',
    originType: 'spinoff', isFromScratch: false, isTech: false, sector: 'Industrials & Energy', industry: 'Monitored Security Services',
    ipoYear: 2025, ipoDate: '2025-10-08', headquarters: 'London, United Kingdom; business originated in Sweden', founders: 'Dick Seger / Securitas Direct',
    originDetails: 'Established as Securitas Direct within Securitas in 1988, subsequently separated and renamed Verisure. Corporate-parent origin is retained despite later private-equity ownership and the Stockholm IPO.',
    citation: 'Verisure IPO documents, corporate history and company profile',
    citationUrl: 'https://www.verisure.com/news/ipo'
  }
];
