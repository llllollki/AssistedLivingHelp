export type LaunchMarket = {
  slug: string;
  name: string;
  hospitalAnchor: string;
  summary: string;
  cities: string[];
};

export const launchMarkets: LaunchMarket[] = [
  {
    slug: "temecula-valley",
    name: "Temecula Valley",
    hospitalAnchor: "Temecula Valley Hospital",
    summary: "Support for families exploring assisted living near Temecula and nearby communities.",
    cities: ["Temecula", "Murrieta", "Winchester", "French Valley"]
  },
  {
    slug: "inland-valley",
    name: "Inland Valley",
    hospitalAnchor: "Inland Valley Hospital",
    summary: "Guided matching support for Inland Valley and nearby assisted living communities.",
    cities: ["Wildomar", "Lake Elsinore", "Murrieta", "Menifee"]
  },
  {
    slug: "rancho-springs",
    name: "Rancho Springs",
    hospitalAnchor: "Rancho Springs Hospital",
    summary: "Local family support for assisted living search around Rancho Springs service areas.",
    cities: ["Murrieta", "Temecula", "Menifee", "Wildomar"]
  },
  {
    slug: "murrieta-loma-linda",
    name: "Murrieta Loma Linda",
    hospitalAnchor: "Loma Linda University Medical Center - Murrieta",
    summary: "Concierge support for families evaluating care options around Murrieta.",
    cities: ["Murrieta", "Temecula", "Menifee", "Wildomar"]
  },
  {
    slug: "menifee-global",
    name: "Menifee Global",
    hospitalAnchor: "Menifee Global Medical Center",
    summary: "Local assisted living help for Menifee-area families and referring partners.",
    cities: ["Menifee", "Sun City", "Perris", "Murrieta"]
  }
];

export function getMarketBySlug(slug: string): LaunchMarket | undefined {
  return launchMarkets.find((market) => market.slug === slug);
}
