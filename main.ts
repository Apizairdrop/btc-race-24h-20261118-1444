// DUSTLINE dip-buy bot for btc-race-24h-20261118-1444.
//
// Strategy: buy the deep dip, sell the recovery to the mean.
//   - Enter (full equity) when cbBTC's close is at least DIP_BPS below its
//     60-bar simple moving average: a sharp oversold dip, not a slow drift.
//   - Exit when the close recovers to the 60-bar average (mean reversion),
//     or on a hard stop STOP_BPS below the entry reference (falling-knife
//     guard).
//   - No entry in the last 60 bars of the window (avoids a forced flatten
//     at a loss right at the end).
//   - Long only, one symbol (CBBTC), no leverage, no shorts.
//
// Why this shape: on the published dev window BTC fell 2.8% overall and
// every momentum / EMA-crossover / breakout bot lost money (the 30-bar
// returns mean-revert: strong prints reverse within 30 bars). The only
// durable edge was the single deep oversold dip early in the window
// (price 170-188 bps under its 60-bar average), which recovered to the
// average within ~20 bars. A deep-dip threshold keeps the bot out of the
// choppy range and only fires on a real dislocation; the hard stop caps
// the loss if the dip keeps falling.
//
// Deterministic: no clock, no network, no randomness, no files outside
// the repo. Two runs on the same data produce the same orders.
// All arithmetic is exact bigint; no floats anywhere in the signal.

import { BPS, runBars, type BarsState, type OrderInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const MA_BARS = 60; // moving-average lookback (bars)
const DIP_BPS = 140n; // enter when close is this far below the MA (bps)
const STOP_BPS = 150n; // hard stop below the entry reference (bps)
const LAST_ENTRY_SEQ = 1380; // no entry in the last 60 bars of a 1440-bar window
const MAX_SLIPPAGE_BPS = 200; // cap on the move from the latest close

/** Every CBBTC close so far (warm-up bars included). */
const closes: bigint[] = [];
/** The close of the batch where the open position first showed. */
let entryPrice: bigint | null = null;

/** The 60-bar simple moving average of closes, or null until 60 bars. */
function ma60(): bigint | null {
  if (closes.length < MA_BARS) return null;
  let sum = 0n;
  for (let i = closes.length - MA_BARS; i < closes.length; i++) sum += closes[i];
  return sum / BigInt(MA_BARS);
}

await runBars({
  onBatch(state: BarsState): OrderInput[] {
    const close = state.close(SYMBOL);
    if (close === null) return [];
    closes.push(close);

    const inPos = state.positions.has(SYMBOL);
    const avg = ma60();

    if (!inPos) {
      // No entry during warm-up, before the average exists, or near the end.
      if (state.warmingUp || avg === null) return [];
      if (state.seq >= state.warmupBars + LAST_ENTRY_SEQ) return [];
      const dipBps = ((close - avg) * 10_000n) / avg;
      if (dipBps < -DIP_BPS) {
        const amount = state.cash < state.weightRoom(SYMBOL) ? state.cash : state.weightRoom(SYMBOL);
        // Never send an order the market would refuse for being below
        // the minimum notional: a refused order fills nothing and the
        // bot would keep retrying it every bar until the dip passes.
        const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
        if (amount <= 0n || amount < minNotional) return [];
        return [{ side: 'buy', symbol: SYMBOL, notional_quote_units: amount, max_slippage_bps: MAX_SLIPPAGE_BPS }];
      }
      return [];
    }

    // In a position: record the entry reference the first batch it shows
    // (the fill was at this bar's open, so its close is the closest
    // reference the bot sees), then exit on recovery or on the hard stop.
    const holding = state.positions.get(SYMBOL)!;
    if (entryPrice === null) entryPrice = close;
    if (avg !== null && close >= avg) {
      entryPrice = null;
      return [{ side: 'sell', symbol: SYMBOL, qty: holding.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
    }
    if (((close - entryPrice) * 10_000n) / entryPrice < -STOP_BPS) {
      entryPrice = null;
      return [{ side: 'sell', symbol: SYMBOL, qty: holding.qty, max_slippage_bps: MAX_SLIPPAGE_BPS }];
    }
    return [];
  },
});
