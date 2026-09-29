import { List, Color, Icon, Image, ActionPanel, Action } from "@raycast/api";
import capitalize from "lodash/capitalize";
import { useMemo, useState } from "react";
import type { AggregatedPosition, ChainInfo, Position } from "../shared/types";
import {
  DEFAULT_DAPP_ID,
  getFullPositionsValue,
  getPositionBalance,
  getPositionValue,
  groupPositionsByDapp,
  groupPositionsByToken,
  sortPositionGroupsByTotalValue,
} from "../shared/utils";
import { ALL_CHAINS } from "../shared/constants";
import { useWalletIdentity } from "../shared/useWalletIdentity";
import { useChains, getChainInfo } from "../shared/useChains";
import { ChainsSelector } from "../components/NetworkSelect";
import { AddressLine } from "../components/AddressLine";
import { useWalletPositions } from "../shared/useWalletPositions";
import { useWalletPortfolio } from "../shared/useWalletPortfolio";
import { ApiErrorGate } from "./ApiKeyGate";

function PositionsGroup({
  positions,
  protocol,
  address,
  chainsById,
}: {
  positions: Position[];
  protocol: string;
  address: string;
  chainsById: Record<string, ChainInfo>;
}) {
  const fullValue = useMemo(() => getFullPositionsValue(positions), [positions]);
  const sortedPositions = useMemo(
    () =>
      (protocol === DEFAULT_DAPP_ID ? groupPositionsByToken(positions) : positions).sort(
        (a, b) => getPositionValue(b) - getPositionValue(a),
      ) as (Position | AggregatedPosition)[],
    [positions, protocol],
  );

  return (
    <List.Section title={capitalize(protocol)} subtitle={`$${fullValue.toFixed(2)}`}>
      {sortedPositions.map((item) => {
        const relativeChange = item.relativeChange24h || 0;
        const absoluteChange = Math.abs(((relativeChange / 100) * getPositionValue(item)) / (1 + relativeChange / 100));
        const chain = getChainInfo(chainsById, item.chainId);
        return (
          <List.Item
            key={item.id}
            title={item.asset.name}
            icon={{ source: item.asset.iconUrl || Icon.Circle, mask: Image.Mask.Circle }}
            subtitle={item.type !== "wallet" ? item.type : undefined}
            accessories={[
              {
                icon: Icon.Coins,
                text: {
                  value: `${getPositionBalance(item).toFixed(2)} ${item.asset.symbol}`,
                },
              },
              { text: { value: `$${Number(item.value ?? 0).toFixed(2)}`, color: Color.PrimaryText } },
              {
                text: {
                  value: item.value
                    ? `${relativeChange.toFixed()}% ($${Math.abs(absoluteChange || 0).toFixed(2)})`
                    : "0% ($0.00)",
                  color: !absoluteChange ? Color.SecondaryText : relativeChange > 0 ? Color.Green : Color.Red,
                },
              },
              "chainIds" in item && item.chainIds.length > 1
                ? {
                    icon: {
                      source: Icon.PieChart,
                      mask: Image.Mask.RoundedRectangle,
                    },
                    tooltip: item.chainIds.map((id) => getChainInfo(chainsById, id).name).join(),
                  }
                : {
                    icon: {
                      source: chain.iconUrl || Icon.ComputerChip,
                      mask: Image.Mask.RoundedRectangle,
                    },
                    tooltip: chain.name,
                  },
            ]}
            actions={
              <ActionPanel title="Actions">
                <Action.OpenInBrowser
                  url={`https://app.zerion.io/tokens/${item.asset.id}?address=${address}`}
                  title="Open in Zerion Web App"
                  icon={Icon.Globe}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List.Section>
  );
}

export function AddressView({ addressOrDomain }: { addressOrDomain: string }) {
  const [chainFilter, setChainFilter] = useState(ALL_CHAINS);
  const { address, identity, isLoading } = useWalletIdentity(addressOrDomain);
  const { chainsById, isLoading: chainsAreLoading, error: chainsError } = useChains();
  const { portfolio, isLoading: portfolioIsLoading, error: portfolioError } = useWalletPortfolio({ address });
  const {
    positions,
    isLoading: positionsAreLoading,
    error: positionsError,
  } = useWalletPositions({ address, chain: chainFilter });

  const groupedPositions = useMemo(() => {
    if (!positions) {
      return {};
    }
    return groupPositionsByDapp(positions);
  }, [positions]);

  const chains = useMemo(() => {
    if (!portfolio) {
      return [];
    }
    return Object.keys(portfolio.positionsChainsDistribution)
      .sort((a, b) => portfolio.positionsChainsDistribution[b] - portfolio.positionsChainsDistribution[a])
      .map((id) => getChainInfo(chainsById, id));
  }, [portfolio, chainsById]);

  const sortedDappFrames = useMemo(() => sortPositionGroupsByTotalValue(groupedPositions), [groupedPositions]);

  const errorGate = ApiErrorGate({ error: portfolioError || positionsError || chainsError });
  if (errorGate) {
    return errorGate;
  }

  return (
    <List
      searchBarPlaceholder="Filter Tokens"
      isLoading={isLoading || positionsAreLoading || portfolioIsLoading || chainsAreLoading}
      searchBarAccessory={<ChainsSelector chains={chains} onChange={setChainFilter} />}
    >
      <AddressLine address={address || ""} identity={identity} onChangeSavedStatus={() => null} />
      {sortedDappFrames.map(([protocol, positions]) =>
        positions ? (
          <PositionsGroup
            key={protocol}
            address={address || ""}
            positions={positions}
            protocol={protocol}
            chainsById={chainsById}
          />
        ) : null,
      )}
    </List>
  );
}
