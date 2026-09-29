import { useMemo } from "react";
import { useFetch } from "@raycast/utils";
import { API_URL, getApiHeaders, parseApiResponse, type ApiPosition } from "./api";
import type { Position } from "./types";
import { ALL_CHAINS } from "./constants";

export function mapPosition(position: ApiPosition): Position {
  const { attributes, relationships } = position;
  return {
    id: position.id,
    name: attributes.name,
    type: attributes.position_type ?? "wallet",
    value: attributes.value,
    quantity: attributes.quantity.float,
    price: attributes.price,
    relativeChange24h: attributes.changes?.percent_1d ?? 0,
    chainId: relationships.chain.data.id,
    dappId: relationships.dapp?.data.id ?? null,
    asset: {
      id: relationships.fungible.data.id,
      name: attributes.fungible_info.name,
      symbol: attributes.fungible_info.symbol,
      iconUrl: attributes.fungible_info.icon?.url ?? null,
      verified: attributes.fungible_info.flags.verified,
    },
  };
}

async function parsePositions(response: Response): Promise<Position[]> {
  const result = await parseApiResponse<{ data: ApiPosition[] }>(response);
  return result.data.map(mapPosition);
}

export function useWalletPositions({ address, chain }: { address?: string; chain?: string }) {
  const chainFilter = chain && chain !== ALL_CHAINS ? `&filter[chain_ids]=${encodeURIComponent(chain)}` : "";
  const {
    data: positions,
    isLoading,
    error,
  } = useFetch<Position[]>(
    `${API_URL}wallets/${address}/positions/?currency=usd&filter[positions]=no_filter&sort=-value${chainFilter}`,
    useMemo(
      () => ({
        headers: getApiHeaders(),
        parseResponse: parsePositions,
        execute: Boolean(address),
        onError: (error: Error) => {
          console.error(error);
        },
      }),
      [address, chainFilter],
    ),
  );

  return { positions, isLoading: Boolean(address) && isLoading, error };
}
