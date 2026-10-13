import { buildReview, CHANNELS, SCRAPE_POOL } from '../data/seed';
import type { AppState } from '../store/state';
import { CREDIT_LIMIT } from '../store/state';
import { nowStamp, uid } from './format';
import { channelLabel } from './metrics';
import type { ChannelKey, Review } from '../types';

export interface ScrapePlan {
  /** console lines, played back one after another by the page */
  lines: string[];
  reviews: Review[];
  cursors: Partial<Record<ChannelKey, number>>;
  credits: number;
  keys: ChannelKey[];
  stamp: string;
}

const PER_CHANNEL = 2; // reviews "discovered" per channel per run
const COST_FULL = 20;
const COST_OPTIMISED = 8;

/** Works out what a sync would do against the current state. Pure apart from id/timestamp generation. */
export function planScrape(state: AppState): ScrapePlan {
  const lines: string[] = ['$ sync started — checking connected channels'];
  const reviews: Review[] = [];
  const cursors: Partial<Record<ChannelKey, number>> = {};
  const keys: ChannelKey[] = [];
  const cost = state.optimiseCredits ? COST_OPTIMISED : COST_FULL;
  let credits = 0;

  for (const ch of CHANNELS) {
    const label = channelLabel[ch];
    const st = state.channels[ch];
    if (!st.connected) {
      lines.push(`– ${label}: not connected, skipped`);
      continue;
    }
    if (!st.enabled) {
      lines.push(`– ${label}: scraping paused, skipped`);
      continue;
    }
    if (state.credits + credits + cost > CREDIT_LIMIT) {
      lines.push(`! ${label}: monthly credit limit reached, skipped`);
      continue;
    }
    lines.push(`$ Connecting to ${label}...`);
    const pool = SCRAPE_POOL[ch];
    const from = state.scrapeCursor[ch];
    const batch = pool.slice(from, from + PER_CHANNEL);
    cursors[ch] = from + batch.length;
    credits += cost;
    keys.push(ch);

    batch.forEach((raw) => reviews.push(buildReview(raw, uid('r'))));
    const known = state.reviews.filter((r) => r.source === ch).length;
    if (batch.length) {
      lines.push(`✓ ${label}: ${batch.length} new review${batch.length === 1 ? '' : 's'} found`);
      batch.forEach((b) => lines.push(`   + ${b.rating}★ ${b.guest} — “${b.text.slice(0, 48)}${b.text.length > 48 ? '…' : ''}”`));
    } else {
      lines.push(`✓ ${label}: up to date (${known} reviews indexed, 0 new)`);
    }
    if (state.optimiseCredits) lines.push(`⚡ ${label}: cache skipped ${known} unchanged reviews (${cost} credits)`);
  }

  if (keys.length === 0) {
    lines.push('! nothing to sync — connect and enable at least one channel');
  } else {
    lines.push(
      `✓ Sync complete — ${reviews.length} new review${reviews.length === 1 ? '' : 's'}, ${credits} credits used`,
    );
  }
  return { lines, reviews, cursors, credits, keys, stamp: nowStamp() };
}
