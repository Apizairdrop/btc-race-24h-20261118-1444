# DUSTLINE dip-buy bot — BTC race 24h

[![make.fun bounty](https://make.fun/badge/btc-race-24h-20261118-1444.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444)
[![rank](https://make.fun/badge/btc-race-24h-20261118-1444/Apizairdrop/btc-race-24h-20261118-1444/rank.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444)
[![reward](https://make.fun/badge/btc-race-24h-20261118-1444/Apizairdrop/btc-race-24h-20261118-1444/reward.svg)](https://make.fun/bounty/btc-race-24h-20261118-1444)

Entry for the [btc-race-24h-20261118-1444 bounty on make.fun](https://make.fun/bounty/btc-race-24h-20261118-1444):
race a BTC trading bot live for 24 hours on Coinbase Wrapped BTC (cbBTC)
against USDC, minute by minute, with $1,000 of paper money.

## Strategy

Buy the deep dip, sell the recovery to the mean.

- **Enter** (full equity) when cbBTC's close is at least **140 bps below
  its 60-bar simple moving average** — a sharp oversold dip, not a slow
  drift.
- **Exit** when the close recovers to the 60-bar average (mean reversion),
  or on a **hard stop 150 bps below the entry reference** (falling-knife
  guard).
- **No entry in the last 60 bars** of the window (avoids a forced flatten
  at a loss right at the end).
- Long only, one symbol (CBBTC), no leverage, no shorts. All arithmetic
  is exact bigint; no floats anywhere in the signal.

## Why this shape

On the published dev window BTC fell 2.8% overall and every momentum,
EMA-crossover and breakout bot lost money: the 30-bar returns
mean-revert (strong prints reverse within 30 bars). The only durable
edge was the single deep oversold dip early in the window (price
170–188 bps under its 60-bar average), which recovered to the average
within ~20 bars. A deep-dip threshold keeps the bot out of the choppy
range and only fires on a real dislocation; the hard stop caps the loss
if the dip keeps falling.

## Dev-window grade (kit `grade-local`, process driver)

- **Net PnL: +$7.62** (+0.76%) — passes the dev gate (needs > $0)
- **Trades: 2** (1 round trip), win rate 100%
- **Max drawdown: 0.62%** (guardrail: ≤ 25%)
- **Fees: $0.80**; at 2× fees net PnL is still +$6.81
- **Deterministic:** L1 regrade reproduced byte for byte

For comparison on the same dev window: buy-and-hold −$31.63, and the
kit's momentum, EMA-cross, ADX-momentum and RSI-Bollinger baselines all
lost money too.

## Files

- `main.ts` — the bot (Node 22, standard library only, via the vendored
  shim). Speaks `agent-fun/bars-replay/v1` on stdin/stdout.
- `vendor/makefun-bars.ts` — byte-identical copy of the kit's TypeScript
  SDK shim; kept under `vendor/` so it is left out of authorship counts.
- `GRADE.md` — the dev-window grade record.
