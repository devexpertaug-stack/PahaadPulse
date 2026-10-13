import type { ComplaintCategory, Department, Sentiment, TaskPriority, TopicKey } from '../types';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Topic catalogue — one entry per "issue cluster" shown in Insights          */
/* ────────────────────────────────────────────────────────────────────────── */

export type RiskGroup = 'Heating' | 'Wi-Fi' | 'Service';

export interface TopicMeta {
  key: TopicKey;
  /** cluster label shown in Insights */
  label: string;
  short: string;
  /** department that owns the fix */
  department: Department;
  /** demo model: ₹ of future bookings at risk per unresolved negative mention (review or open complaint) */
  risk: number;
  group: RiskGroup;
  posTag: string;
  negTag: string;
  /** default Hotel OS task when the topic is a problem */
  action: string;
}

export const TOPICS: Record<TopicKey, TopicMeta> = {
  view: {
    key: 'view',
    label: 'Misty Mountain View & Quietness',
    short: 'Mountain view',
    department: 'Front Desk',
    risk: 1000,
    group: 'Service',
    posTag: '#mountainview',
    negTag: '#noise',
    action: 'Address noise and disturbance near guest rooms',
  },
  food: {
    key: 'food',
    label: 'Local Organic Food & Pahadi Tea',
    short: 'Food & tea',
    department: 'Food & Beverage',
    risk: 1200,
    group: 'Service',
    posTag: '#goodfood',
    negTag: '#foodquality',
    action: 'Review kitchen quality and serving temperature',
  },
  heating: {
    key: 'heating',
    label: 'Hot Water & Solar Heating',
    short: 'Heating & hot water',
    department: 'Maintenance',
    risk: 4500,
    group: 'Heating',
    posTag: '#cozyrooms',
    negTag: '#heating',
    action: 'Service solar geyser and room heaters',
  },
  staff: {
    key: 'staff',
    label: 'Warm Staff & Local Guides',
    short: 'Staff & guides',
    department: 'Front Desk',
    risk: 1300,
    group: 'Service',
    posTag: '#warmstaff',
    negTag: '#rudestaff',
    action: 'Run a hospitality refresher with front-line staff',
  },
  service: {
    key: 'service',
    label: 'Front Desk Responsiveness',
    short: 'Front desk',
    department: 'Front Desk',
    risk: 1400,
    group: 'Service',
    posTag: '#quickservice',
    negTag: '#slowservice',
    action: 'Review front-desk response times and call pick-up',
  },
  wifi: {
    key: 'wifi',
    label: 'Wi-Fi Speed in Valley',
    short: 'Wi-Fi',
    department: 'Maintenance',
    risk: 3000,
    group: 'Wi-Fi',
    posTag: '#goodwifi',
    negTag: '#wifi',
    action: 'Add Wi-Fi access points to the valley-side rooms',
  },
  rooms: {
    key: 'rooms',
    label: 'Room Comfort & Cleanliness',
    short: 'Rooms',
    department: 'Housekeeping',
    risk: 1400,
    group: 'Service',
    posTag: '#cleanrooms',
    negTag: '#roomcomfort',
    action: 'Deep-clean and inspect the affected rooms',
  },
};

export const TOPIC_KEYS = Object.keys(TOPICS) as TopicKey[];

/** when one clause hits several topics equally, the earlier one wins */
const TOPIC_PRIORITY: TopicKey[] = ['heating', 'wifi', 'food', 'rooms', 'service', 'staff', 'view'];

const TOPIC_PATTERNS: Record<TopicKey, RegExp> = {
  heating:
    /\b(heat(?:er|ers|ing)?|geysers?|hot water|warm water|cold water|cold shower|solar|freezing|freeze|chilly|chill|cold|radiators?|blowers?)\b/,
  wifi: /\b(wi-?fi|internet|network|signal|connectivity|bandwidth|router|connection)\b/,
  food: /\b(food|thali|meals?|breakfast|lunch|dinner|chai|tea|coffee|chefs?|kitchen|menu|dish(?:es)?|taste|tasty|delicious|rotis?|dal|rajma|mandua|churkani|organic|vegetables?|buffet|cuisine|pahadi)\b/,
  rooms:
    /\b(rooms?|bed|bedding|linen|bathrooms?|washrooms?|toilets?|towels?|clean|cleanliness|spotless|damp|smell(?:s|ed|y)?|musty|housekeeping|fireplace)\b/,
  service:
    /\b(front desk|reception|check-?in|check-?out|response|respond|room service|waited|waiting|wait|delays?|delayed|calls?|called|no one|nobody|picked up|service)\b/,
  staff:
    /\b(staff|guides?|hosts?|team|hospitality|owner|manager|behaviou?r|people|driver|porter|waiter|family)\b/,
  view: /\b(views?|mountains?|mist|misty|sunrise|sunset|silence|quiet|quietness|peaceful|calm|scenery|scenic|setting|nature|clouds|himalaya(?:n|s)?|nanda devi|stars|location)\b/,
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Lexicons                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const POSITIVE = new Set(
  (
    'great amazing incredible fantastic wonderful excellent delicious tasty beautiful beautifully stunning lovely perfect superb ' +
    'awesome magical unreal unforgettable peaceful cosy cozy comfortable clean spotless neat friendly warm helpful attentive ' +
    'knowledgeable genuine genuinely quick quickly fast prompt good nice best loved love loves enjoyed enjoy recommended recommend ' +
    'worth fresh calm quiet decent polite courteous brilliant charming welcoming hospitable memorable highlight value generous ' +
    'smooth efficient responsive happy delighted pleasant relaxing roaring thanks'
  ).split(' '),
);

const NEGATIVE = new Set(
  (
    'terrible horrible awful worst bad poor rude broken broke cold freezing dirty filthy slow weak patchy disappointing disappointed ' +
    'unhelpful noisy noise smelled smelly smell musty damp leak leaks leaking failed fail ignored delay delayed overpriced expensive ' +
    'unacceptable unsafe careless unbothered waited late stale bland worse useless dropping dropped barely hardly lacking lack ' +
    'issue issues problem problems complained complaint complaints unresponsive uncomfortable cramped mouldy moldy insects cockroach ' +
    'dusty stained lukewarm inconsistent waste regret avoid nightmare hassle missed forgot forgotten wasp'
  ).split(' '),
);

const NEGATORS = new Set(['not', 'no', 'never', 'without', 'nor']);

const NEG_PHRASES: RegExp[] = [
  /\b(?:not|never|barely|hardly|stopped)\s+(?:\w+\s+){0,2}?work(?:s|ed|ing)?\b/g,
  /\bno\s+(?:\w+\s+)?(?:hot water|water|heating|heater|wifi|wi-fi|signal|network|internet|power|electricity|geyser)\b/g,
  /\bnot\s+(?:\w+\s+)?(?:changed|cleaned|replaced|delivered|served|fixed|available|provided|arrived|responded|answered|picked|updated|ready)\b/g,
  /\b(?:no one|nobody|noone)\b/g,
  /\bneed(?:s|ed)?\s+(?:a\s+)?(?:fix|fixing|repair|repairing|attention|help|maintenance|cleaning)\b/g,
  /\b(?:please|pls)\s+(?:fix|help|check|come)\b/g,
  /\bout of order\b/g,
  /\bno response\b/g,
];

const POS_PHRASES: RegExp[] = [
  /\b(?:come|coming|go|going)\s+back\b/g,
  /\b(?:will|would)\s+(?:definitely\s+)?(?:visit|return|stay)\s+again\b/g,
  /\bthank(?:s| you)\b/g,
  /\b(?:actually|properly|perfectly|reliably)\s+work(?:s|ed|ing)?\b/g,
  /\bworks?\s+(?:well|perfectly|great)\b/g,
  /\bfeel(?:s)?\s+like\s+family\b/g,
  /\bfelt\s+like\s+family\b/g,
  /\bremembered our names\b/g,
  /\bwent out of their way\b/g,
];

const URGENT_PHRASES: Array<[RegExp, number]> = [
  [/\b(?:urgent|urgently|immediately|asap|emergency|right now|help)\b/g, 2],
  [/\b(?:no|without)\s+(?:hot water|water|heating|heater|power|electricity)\b/g, 2],
  [/\b(?:leak|leaking|flood|flooding|stuck|short circuit)\b/g, 2],
  [/\b(?:thrice|three times|many times|several times|again and again|multiple times)\b/g, 2],
  [/\b(?:no one|nobody)\s+(?:picked|came|answered|responded|showed)/g, 2],
  [/\b(?:no response|not responding|ignored)\b/g, 2],
  [/\b(?:since (?:this )?morning|since yesterday|two days|for days|all night)\b/g, 1],
];

const SECURITY_RE =
  /\b(wasp|wasps|snake|monkey|monkeys|thief|theft|stolen|locked out|unsafe|safety|fire|smoke|intruder|leopard|bear|ambulance|doctor|sick|injured|injury|bleeding)\b/;

/* ────────────────────────────────────────────────────────────────────────── */
/*  Engine                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

export interface TopicHit {
  topic: TopicKey;
  polarity: Sentiment;
  score: number;
  tag: string;
}

export interface Analysis {
  sentiment: Sentiment;
  hits: TopicHit[];
  tags: string[];
  /** most significant problem (or strongest praise when there are no problems) */
  primary?: TopicHit;
  security: boolean;
  urgency: number;
  polarityScore: number;
  department: Department;
  priority: TaskPriority;
  category: ComplaintCategory;
  /** ₹ of future bookings at risk from the negative topics found (demo model) */
  impact: number;
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/can['’]t/g, 'can not')
    .replace(/won['’]t/g, 'will not')
    .replace(/(\w+)n['’]t\b/g, '$1 not')
    .replace(/['’]s\b/g, '')
    .replace(/[“”"]/g, '');
}

/**
 * Remove phrases that would trigger the wrong topic:
 *  - "dinner was served cold" / "tea was cold" is about the food, not the heating
 *  - "my work calls" / "video calls" are not guests phoning the front desk
 */
function stripColdFood(clause: string): string {
  return clause
    .replace(/\b(food|dinner|lunch|breakfast|meals?|tea|chai|coffee)\s+(?:\w+\s+){0,2}?cold\b/g, '$1')
    .replace(/\bcold\s+(?:food|tea|chai|dinner|meal|coffee|breakfast)\b/g, 'food')
    .replace(/\b(?:work|video|conference|business|zoom|meeting|phone|office)\s+calls?\b/g, 'meeting');
}

function countMatches(s: string, patterns: RegExp[]): { count: number; rest: string } {
  let count = 0;
  let rest = s;
  for (const re of patterns) {
    const m = rest.match(new RegExp(re.source, 'g'));
    if (m) {
      count += m.length;
      rest = rest.replace(new RegExp(re.source, 'g'), ' ');
    }
  }
  return { count, rest };
}

function clausePolarity(clause: string): number {
  const neg = countMatches(clause, NEG_PHRASES);
  const pos = countMatches(neg.rest, POS_PHRASES);
  let score = pos.count - neg.count;

  const tokens = pos.rest.match(/[a-z]+(?:-[a-z]+)*/g) ?? [];
  tokens.forEach((tok, i) => {
    const isPos = POSITIVE.has(tok);
    const isNeg = NEGATIVE.has(tok);
    if (!isPos && !isNeg) return;
    const negated = tokens.slice(Math.max(0, i - 3), i).some((t) => NEGATORS.has(t));
    const base = isPos ? 1 : -1;
    score += negated ? -base : base;
  });
  return score;
}

function refineTag(topic: TopicKey, polarity: Sentiment, text: string): string {
  const meta = TOPICS[topic];
  if (polarity === 'positive') return meta.posTag;
  if (polarity === 'negative') {
    if (topic === 'heating') {
      if (/\b(heater|heaters)\b/.test(text) && /\b(broken|broke|not work|failed|weak)\b/.test(text)) return '#brokenheater';
      if (/\b(hot water|geyser|shower|water)\b/.test(text)) return '#hotwater';
    }
    return meta.negTag;
  }
  return meta.posTag;
}

const sign = (n: number): Sentiment => (n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral');

export function analyse(rawText: string): Analysis {
  const text = normalise(rawText);
  const clauses = text
    .split(/[.;!?\n]+|\bbut\b|\bhowever\b|\balthough\b|\bthough\b|\byet\b|\bwhereas\b/)
    .map((c) => c.trim())
    .filter(Boolean);

  const topicScore: Partial<Record<TopicKey, number>> = {};
  const topicMentions: Partial<Record<TopicKey, number>> = {};
  let overall = 0;

  const perClause = clauses.map((raw) => {
    const clause = stripColdFood(raw);
    const polarity = clausePolarity(clause);
    overall += polarity;
    const topics = TOPIC_KEYS.filter((k) => TOPIC_PATTERNS[k].test(clause));
    return { clause, polarity, topics };
  });

  for (const { polarity, topics } of perClause) {
    for (const t of topics) {
      topicScore[t] = (topicScore[t] ?? 0) + polarity;
      topicMentions[t] = (topicMentions[t] ?? 0) + 1;
    }
  }

  const hits: TopicHit[] = TOPIC_KEYS.filter((k) => topicMentions[k])
    .map((k) => {
      let score = topicScore[k] ?? 0;
      // a topic mentioned without any polarity word borrows the tone of the whole review
      if (score === 0 && overall !== 0) score = Math.sign(overall) * 0.5;
      const polarity = sign(score);
      return { topic: k, polarity, score, tag: refineTag(k, polarity, text) };
    })
    .filter((h) => h.polarity !== 'neutral')
    .sort(
      (a, b) =>
        Math.abs(b.score) - Math.abs(a.score) || TOPIC_PRIORITY.indexOf(a.topic) - TOPIC_PRIORITY.indexOf(b.topic),
    );

  const P = hits.filter((h) => h.polarity === 'positive').length;
  const N = hits.filter((h) => h.polarity === 'negative').length;
  let sentiment: Sentiment;
  if (P === 0 && N === 0) sentiment = sign(overall);
  else sentiment = N > P ? 'negative' : P > N ? 'positive' : 'neutral';

  const negHits = hits.filter((h) => h.polarity === 'negative');
  const primary = negHits[0] ?? hits[0];

  // urgency (used for WhatsApp triage and task priority)
  const security = SECURITY_RE.test(text);
  let urgency = security ? 3 : 0;
  if (overall < 0 || negHits.length > 0) {
    for (const [re, weight] of URGENT_PHRASES) {
      if (new RegExp(re.source).test(text)) urgency += weight;
    }
    if (negHits.some((h) => h.topic === 'heating') && /\bnot work/.test(text)) urgency += 2;
  }

  const impact = negHits.reduce((s, h) => s + TOPICS[h.topic].risk, 0);

  let department: Department = 'Front Desk';
  if (security) department = 'Security';
  else if (primary) department = TOPICS[primary.topic].department;

  const category: ComplaintCategory =
    urgency >= 2 || overall <= -3 ? 'high_attention' : sentiment === 'positive' && overall >= 0 ? 'positive' : 'neutral';

  const priority: TaskPriority =
    category === 'high_attention' || impact >= 4500 ? 'High' : sentiment === 'negative' ? 'Medium' : 'Low';

  return {
    sentiment,
    hits,
    tags: Array.from(new Set(hits.map((h) => h.tag))),
    primary,
    security,
    urgency,
    polarityScore: overall,
    department,
    priority,
    category,
    impact,
  };
}

/** star rating → sentiment, used whenever a rating is known */
export const sentimentFromRating = (rating: number): Sentiment =>
  rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

/** sensible default star rating for a piece of text with no rating */
export const ratingFromSentiment = (s: Sentiment): number => (s === 'positive' ? 5 : s === 'neutral' ? 3 : 2);

/** analysis is pure, so identical text can safely be memoised (reviews are re-analysed on every render of a page) */
const cache = new Map<string, Analysis>();
export function analyseCached(text: string): Analysis {
  let hit = cache.get(text);
  if (!hit) {
    hit = analyse(text);
    if (cache.size > 500) cache.clear();
    cache.set(text, hit);
  }
  return hit;
}
