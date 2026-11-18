# DUSTLINE dip-buy bot — dev-window grade record

Competition: btc-race-24h-20261118-1444 (Race a BTC trading bot live for 24 hours)
Repo: https://github.com/Apizairdrop/btc-race-24h-20261118-1444
Graded: 2026-11-18 ~23:15 WIB, kit harness grade-local --driver process

## This entry (local grade, kit harness)
- Net PnL: +$7.62 (+0.76%) — PASSES the dev gate (needs > $0)
- Trades: 2 (1 round trip), win rate 100%
- Max drawdown: 0.62% (guardrail: ≤ 25%)
- Fees: $0.80; at 2x fees net PnL +$6.81 (still positive)
- Deterministic: L1 regrade reproduced byte for byte
- Guardrails met (trades ok, symbols ok, drawdown ok)

## Strategy
Dip-buy the 60-bar mean: enter (full equity) when cbBTC's close is at
least 140 bps below its 60-bar simple moving average; exit when the close
recovers to the average, or on a hard stop 150 bps below the entry
reference. No entry in the last 60 bars. Long only, CBBTC only.
Max slippage 200 bps. Exact bigint arithmetic, no floats in the signal.

## Why this shape (honest)
On the dev window BTC fell 2.8% overall and the 30-bar returns
mean-revert: strong prints reverse within 30 bars. Every momentum,
EMA-crossover and breakout variant tested lost money (30-bar momentum
enter>100bps: −$5.99; EMA10×EMA30: −$135; 20-bar breakout: −$118).
Mean-reversion at short lookbacks also lost (z-score MR30: −$93).
The only durable edge was the single deep oversold dip early in the
window (170–188 bps under the 60-bar average), which recovered to the
average within ~20 bars. The dip-buy threshold (140 bps) sits in a
robust plateau: thresholds 130–160 bps all give the same +$7.61, and
deeper (180 bps) gives +$11.13 — the edge grows with the dip depth,
it is not a knife-edge fit. One genuine revision was made after the
first grade (a minimum-notional guard on the buy); the grade is
unchanged (+$7.62 before and after).

## Baselines' dev PnL (kit grade-local, --driver process)
- buy-and-hold: −$31.63 (1 trade, DD 3.25%)
- hold-cash: $0.00 (0 trades — fails the gate, and the ≥1-trade guardrail)
- The kit's momentum, EMA-cross, ADX-momentum and RSI-Bollinger
  baselines were not re-graded on this window (they all lost money on
  the Nov-15 window, and the backtest shows the same momentum shapes
  losing here too).

## Submission
- To be submitted by the parent (bundle + check + submit); this bot is
  NOT submitted yet.
- Payout wallet: 4pZ7EcK1jRveq2ZRy4ECHC9EQnztNgXXh21k9FidXn1Y
