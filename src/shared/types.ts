export interface ChainInfo {
  id: string;
  name: string;
  iconUrl: string | null;
}

export interface AddressPortfolio {
  totalValue: number;
  change24h: {
    absolute: number;
    relative: number;
  };
  positionsChainsDistribution: Record<string, number>;
}

export type PositionType = "wallet" | "deposit" | "loan" | "locked" | "staked" | "reward" | "investment";

export interface PositionAsset {
  id: string;
  name: string;
  symbol: string;
  iconUrl: string | null;
  verified: boolean;
}

export interface Position {
  id: string;
  name: string;
  type: PositionType;
  value: number | null;
  quantity: number;
  price: number | null;
  relativeChange24h: number;
  chainId: string;
  dappId: string | null;
  asset: PositionAsset;
}

export type AggregatedPosition = Position & {
  chainIds: string[];
};

export interface SearchAsset {
  id: string;
  name: string;
  symbol: string;
  iconUrl: string | null;
  price: number | null;
  relativeChange1d: number | null;
  marketCap: number | null;
}

export interface SearchWallet {
  address: string;
  name: string | null;
  iconUrl: string | null;
}
