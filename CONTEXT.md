# Zerion Raycast Extension

Raycast commands for looking up wallets, tokens and market data through the public Zerion API.

## Language

**Wallet Overview**:
The screen for one wallet, opened via "View Wallet" or by selecting a wallet in My Wallets. Shows the portfolio line (which opens Performance), Recent Activity, and positions grouped by dapp.
_Avoid_: Address view, wallet page

**Performance**:
The screen for one wallet's value over time: the total value, the change over the selected Period, and a line chart of that Period. Opened from a wallet's portfolio line.
_Avoid_: Portfolio chart, balance history

**Period**:
The time range a Performance chart covers, ending now: 1H, 1D, 1W, 1M, 1Y or Max. 1D unless the user picks another.
_Avoid_: Timeframe, range, interval

**Recent Activity**:
The short preview (latest 2, non-trash) of a wallet's History shown on the Wallet Overview, ending with an entry that opens the full History.

**History**:
The full, paginated list of a wallet's on-chain activity, newest first.
_Avoid_: Transactions list, activity feed

**Transaction**:
One on-chain transaction as seen from the wallet's perspective; the unit of a History row. Has an operation type (send, trade, deposit…), a status (confirmed, failed, pending), a chain, and a fee.
_Avoid_: Action (the web app's term for a possibly multi-transaction group)

**Act**:
One logical step inside a Transaction (e.g. an approve and a trade in the same transaction).

**Transfer**:
A movement of an asset (token or NFT) into or out of the wallet within an Act, with a direction: in, out, or self.

**Approval**:
A spending permission granted (or revoked) for an asset within an Act.

## Relationships

- A **Wallet Overview** shows one **Recent Activity** preview, which links to that wallet's **History**
- A wallet's portfolio line opens that wallet's **Performance**
- A **Performance** screen shows exactly one **Period** at a time
- **Recent Activity** and **History** follow the Wallet Overview's chain filter; neither ever shows trash Transactions
- **History** lists **Transactions**; a **Transaction** has one or more **Acts**; each **Act** has zero or more **Transfers** and **Approvals**
