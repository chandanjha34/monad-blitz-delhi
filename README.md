# Proof Go

Proof Go is a Monad testnet social identity app where users mint identity cards, share QR profiles, meet nearby people, and collect profiles on-chain.

## What It Does

- Email login with Privy embedded wallets
- Identity card minting with profile metadata
- QR-based profile sharing and scan flow
- Collection flow with fee + collect transaction tracking
- Wallet station with testnet faucet request and tx explorer links
- Pokemon-style proximity networking map with waves and encounters
- Leaderboard + collection stats

## Live Services

- Backend (Indexer/API): https://proof-go.onrender.com
- Frontend: deploy on Vercel (or run locally)

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Privy embedded wallets (`@privy-io/react-auth`)
- Ethers v6
- Supabase (optional primary persistence)
- Express indexer backend (`backend/server.mjs`)
- Tailwind CSS + Framer Motion + Leaflet

## Project Structure

- `src/app/*`: frontend pages and Next API routes
- `src/components/*`: UI components (nav, map, wallet panel, cards)
- `src/lib/*`: chain helpers, API clients, wallet/fee logic, storage/personality utilities
- `backend/server.mjs`: standalone Express indexer API + chain sync loop
- `contracts/*`: Solidity contracts

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root.

Minimum useful keys:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_INDEXER_URL=http://localhost:4001

MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_MONAD_CHAIN_ID=10143

NEXT_PUBLIC_IDENTITY_NFT_ADDRESS=<your_identity_nft>
NEXT_PUBLIC_COLLECTION_REGISTRY_ADDRESS=<your_collection_registry>

NEXT_PUBLIC_PRIVY_APP_ID=<your_privy_app_id>

MINTER_PRIVATE_KEY=<server_signer_private_key>
FAUCET_PRIVATE_KEY=<faucet_signer_private_key>
```

Optional:

```env
NEXT_PUBLIC_COLLECTION_FEE_MON=0.002
NEXT_PUBLIC_COLLECTION_FEE_RECIPIENT=0x000000000000000000000000000000000000dEaD
NEXT_PUBLIC_MONAD_TX_EXPLORER_BASE=https://testnet.monadexplorer.com/tx/
NEXT_PUBLIC_MONAD_FAUCET_URL=https://faucet.monad.xyz

SUPABASE_URL=<...>
SUPABASE_SERVICE_ROLE_KEY=<...>
NEXT_PUBLIC_SUPABASE_URL=<...>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<...>
```

### 3. Run app + backend together

```bash
npm run dev
```

This starts:

- web app on `http://localhost:3000`
- indexer backend on `http://localhost:4001`

### 4. Production build check

```bash
npm run build
```

## Backend Endpoints

From Next API (frontend server):

- `POST /api/faucet`
- `POST /api/collect`
- `POST /api/identity/mint`

From Express indexer (backend server):

- `GET /health`
- `GET /stats`
- `GET /leaderboard`
- `GET /profiles/:tokenId`
- `GET /profiles/by-owner/:ownerAddress`
- `POST /profiles`
- `POST /collect`
- `GET /collections/:collectorAddress`

## Deployment Notes

- Frontend can run on Vercel.
- Backend can run on Render.
- If `NEXT_PUBLIC_INDEXER_URL` is missing, frontend falls back to:
	- `https://proof-go.onrender.com`

## Common Issues

- Faucet request hangs:
	- Ensure frontend server is running (Next API route handles `/api/faucet`).
	- Check `FAUCET_PRIVATE_KEY` format (`0x` + 64 hex chars).
- Collection succeeds but not visible:
	- Ensure same Privy wallet address is used.
	- Confirm indexer URL points to active backend.
- Monad chain/Privy limitations:
	- App includes assisted fee mode fallback if direct embedded-wallet Monad signing is unsupported.

## Scripts

Root:

- `npm run dev` - web + backend indexer
- `npm run dev:web` - web only
- `npm run dev:indexer` - indexer only
- `npm run build` - Next production build
- `npm run start` - Next production server

Backend folder:

- `npm run dev` - `node server.mjs`
- `npm run start` - `node server.mjs`

## Submission

Fork target used for submission:

- https://github.com/chandanjha34/monad-blitz-delhi
