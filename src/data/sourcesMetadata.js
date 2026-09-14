/**
 * Authoritative Sources & Data Lineage Metadata
 * Cites the Draghi Report (2024), Andrew McAfee's MIT Sloan research,
 * regulatory filings (SEC EDGAR, Euronext, LSE, HKEX, TWSE), and macroeconomic datasets.
 */

export const sourcesMetadata = {
  title: "Public From-Scratch Market Cap & Innovation Dynamics",
  subtitle: "Comparative Global Analysis Across Regional Cohorts, Ages & Corporate Lineages",
  
  primaryInspiration: {
    author: "Andrew McAfee",
    affiliation: "Principal Research Scientist at the MIT Sloan School of Management; Co-founder, MIT Initiative on the Digital Economy",
    publication: "The Geek Way (Substack & Book), December 2024",
    tweetReference: "Delian Asparouhov (@zebulgar), Founders Fund Partner: 'Crazy how the EU is just a rounding error when it comes to large companies that were founded in the last 50 years. It\\'s a museum as a continent and a museum as a stock market...'",
    originalCriteria: {
      marketCapFloor: "$10B+ USD (assessed at late 2024 valuations)",
      ageLimit: "Less than 50 years old (founded in 1974 or later)",
      originCriteria: "'From-scratch' companies only (excluding corporate spinoffs, acquisitions, or joint ventures of pre-existing firms)",
      sectorDistinction: "Green = High-Tech (Software, Internet, Semiconductors, Hardware); Blue = Other industries (Healthcare, Retail, Finance, Energy)",
      geography: "HQ at time of IPO"
    }
  },

  landmarkReport: {
    title: "The Future of European Competitiveness ('The Draghi Report')",
    author: "Mario Draghi, former President of the European Central Bank and former Prime Minister of Italy",
    publisher: "European Commission",
    publishedDate: "September 9, 2024",
    officialUrl: "https://commission.europa.eu/topics/strengthening-european-competitiveness/eu-competitiveness-looking-ahead_en",
    keyQuote: "There is no EU company with a market capitalisation over EUR 100bn that has been set up from scratch in the last fifty years, while all six US companies with valuations above EUR 1 trillion were created during this period.",
    coreThemes: [
      "The Innovation Gap: European venture capital remains fragmented, underfunded, and unable to finance companies through late-stage growth rounds.",
      "The Grandfather Economy: European stock indices are dominated by corporate entities founded in the 19th or early 20th centuries.",
      "Regulatory Friction: Complex cross-border regulatory compliance across 27 member states creates scaling friction that US and Chinese firms do not encounter.",
      "The 'From-Scratch' Nuance: While Europe created champions like ASML ($290B), it began as a joint venture with Philips (1891), and SAP ($250B) was founded in 1972 (52 years old in 2024)."
    ]
  },

  methodologyLineage: {
    pipelineSteps: [
      {
        step: 1,
        name: "Universe Ingestion",
        description: "Screened publicly listed global equities with market valuations exceeding $10 Billion USD across major stock exchanges (NYSE, NASDAQ, Euronext, Deutsche Börse, LSE, HKEX, TWSE, KRX, TSE, B3, TSX)."
      },
      {
        step: 2,
        name: "Corporate Entity Lineage Resolution",
        description: "Verified incorporation dates against original regulatory filings (SEC Form S-1 / 10-K, EU Prospectuses, Company House filings). Classified each entity into 'from-scratch' (greenfield startups) vs 'spinoff' (carved out from an existing parent) vs 'joint venture' vs 'merger'."
      },
      {
        step: 3,
        name: "Industry Sector Normalization",
        description: "Classified into High-Tech (Semiconductors, Systems Software, Cloud, Internet Platforms, Consumer Tech) vs Other (Biopharma, Retail, Finance, Energy, Industrials) following standard GICS/McAfee taxonomy."
      },
      {
        step: 4,
        name: "Dynamic Multi-Market Regional Allocation",
        description: "Mapped companies to their primary originating economic bloc: United States (US), European Union (EU-27), Europe Non-EU (UK/Switzerland/Norway), China, Asia ex-China (Taiwan, South Korea, Japan, India, Singapore), and Rest of World (Canada, Latin America, Australia, Middle East)."
      }
    ],

    contestedClassifications: [
      {
        company: "ASML Holding",
        verdict: "Joint Venture (Not strictly from-scratch)",
        explanation: "Founded in 1984 as a 50/50 joint venture between electronics giant Philips (founded 1891) and ASM International (founded 1968). Although it achieved unmatched global technological supremacy in EUV photolithography, strict economic screens classify it as non-independent at inception."
      },
      {
        company: "SAP SE",
        verdict: "From-Scratch, but >50 years old",
        explanation: "Founded in April 1972 in Weinheim, Germany by five former IBM engineers. In 2024, SAP reached 52 years of age. A strict 50-year filter eliminates Europe's largest enterprise software company, while an age slider set to 52+ immediately recovers it."
      },
      {
        company: "TSMC",
        verdict: "Government / Philips Joint Venture",
        explanation: "Founded in 1987 by Dr. Morris Chang in Hsinchu, Taiwan with critical capital and technology transfer from the Taiwan Executive Yuan Development Fund (48.3%) and Philips Electronics (27.5%)."
      },
      {
        company: "ARM Holdings",
        verdict: "UK HQ / Acorn-Apple Joint Venture",
        explanation: "Founded in Cambridge, UK in 1990 as Advanced RISC Machines, a JV between Acorn Computers, Apple, and VLSI. Following Brexit, ARM is located in Europe but outside the European Union (EU-27)."
      },
      {
        company: "AbbVie",
        verdict: "Spinoff",
        explanation: "Carved out from Abbott Laboratories (founded 1888) in 2013. Despite huge market valuation ($320B+), it inherits a century-old pharmaceutical research pipeline."
      }
    ]
  },

  authoritativeSources: [
    {
      name: "European Commission - Competitiveness & Innovation",
      type: "Official Policy Report",
      citation: "Draghi, M. (2024). 'The future of European competitiveness - A competitiveness strategy for Europe.' European Commission, Brussels.",
      url: "https://commission.europa.eu"
    },
    {
      name: "MIT Sloan School of Management",
      type: "Academic Research & Publications",
      citation: "McAfee, A. (2023). 'The Geek Way: The Radical Mindset that Drives Extraordinary Results.' Little, Brown and Company.",
      url: "https://mitsloan.mit.edu"
    },
    {
      name: "U.S. Securities and Exchange Commission (EDGAR)",
      type: "Statutory Financial Filings",
      citation: "SEC EDGAR Database: Forms 10-K, 20-F, S-1, F-1, and 10-Q for corporate incorporation dates and capitalization data.",
      url: "https://www.sec.gov/edgar"
    },
    {
      name: "CompaniesMarketCap & World Federation of Exchanges",
      type: "Market Data Aggregation",
      citation: "Real-time and normalized market capitalization metrics across global equity bourses (2024-2025).",
      url: "https://companiesmarketcap.com"
    }
  ]
};
