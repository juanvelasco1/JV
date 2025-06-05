import type { StockData } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const FINNHUB_API_KEY = 'd10dutpr01qlsac8gtm0d10dutpr01qlsac8gtmg'; // User provided API key
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export async function fetchStockPrices(symbols: string[]): Promise<StockData[]> {
  if (!symbols || symbols.length === 0) {
    return [];
  }

  const results: StockData[] = [];

  for (const symbol of symbols) {
    try {
      const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`);
      if (!response.ok) {
        console.error(`Finnhub API error for /quote ${symbol}: ${response.status} ${await response.text()}`);
        results.push({
          symbol: symbol.toUpperCase(),
          currentPrice: 0,
          changePercent: 0,
        });
      } else {
        const data = await response.json();
        results.push({
          symbol: symbol.toUpperCase(),
          currentPrice: data.c ?? 0,
          changePercent: data.dp ?? 0,
        });
      }
    } catch (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      results.push({
        symbol: symbol.toUpperCase(),
        currentPrice: 0,
        changePercent: 0,
      });
    }

    // Esperar 1 segundo entre peticiones
    await delay(3000);
  }

  return results;
}

export async function searchStockSymbol(query: string): Promise<{ symbol: string; name: string }[]> {
  if (!query) return [];
  try {
    const response = await fetch(`${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`);
    if (!response.ok) {
      console.error(`Finnhub API error for /search: ${response.status} ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    // Finnhub /search returns: { count, result: [{ description, displaySymbol, symbol, type }] }
    if (data.result && Array.isArray(data.result)) {
      return data.result
        .filter((item: any) => item.symbol && item.description) // Ensure essential fields exist
        .map((item: any) => ({
          symbol: item.symbol,
          name: item.description,
        }))
        .slice(0, 10); // Limit results
    }
    return [];
  } catch (error) {
    console.error(`Error searching stock symbol for query "${query}":`, error);
    return [];
  }
}

export async function getStockDetails(symbol: string): Promise<StockData | null> {
  if (!symbol) return null;
  const upperSymbol = symbol.toUpperCase();
  try {
    // Fetch profile for company name
    const profilePromise = fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`);
    // Fetch quote for price data
    const quotePromise = fetch(`${FINNHUB_BASE_URL}/quote?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`);

    const [profileResponse, quoteResponse] = await Promise.all([profilePromise, quotePromise]);

    let companyName = 'N/A';
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      companyName = profileData.name || 'N/A';
    } else {
      console.warn(`Finnhub API error for /stock/profile2 ${upperSymbol}: ${profileResponse.status} ${await profileResponse.text()}`);
    }

    if (!quoteResponse.ok) {
      console.error(`Finnhub API error for /quote ${upperSymbol} in getStockDetails: ${quoteResponse.status} ${await quoteResponse.text()}`);
      // Return with profile data if quote fails but profile succeeded, or null if both fail.
      return companyName !== 'N/A' ? {
        symbol: upperSymbol,
        currentPrice: 0,
        changePercent: 0,
        companyName: companyName,
      } : null;
    }
    const quoteData = await quoteResponse.json();

    return {
      symbol: upperSymbol,
      currentPrice: quoteData.c ?? 0,
      changePercent: quoteData.dp ?? 0,
      companyName: companyName,
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${upperSymbol}:`, error);
    return null;
  }
}
