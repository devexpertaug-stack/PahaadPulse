import { analyseCached } from './analysis';
import type { Review, TopicKey } from '../types';

/* A tiny, deterministic "AI" reply writer. It reads the same analysis as the rest of the
   app, so the reply always talks about what the guest actually raised.
   `variant` rotates the phrasing so "Regenerate" gives a different draft. */

const FIX: Record<TopicKey, string> = {
  heating:
    'our maintenance lead is servicing the solar geysers and room heaters, and every room is being checked before the cold nights',
  wifi: 'we are adding Wi-Fi access points on the valley side so the connection stays steady, even for work calls',
  food: 'we have shared this with our kitchen so every meal reaches your table fresh and hot',
  rooms: 'our housekeeping lead is re-inspecting the rooms and the linen routine personally',
  service: 'we are reviewing how quickly the front desk answers calls and requests, so no one is left waiting',
  staff: 'we have spoken with the team, because warm and respectful hospitality is what we stand for',
  view: 'we are looking at how to keep the property as calm and quiet as the mountains around it',
};

const PRAISE: Record<TopicKey, string> = {
  view: 'We are delighted that the misty mountain views and the quiet gave you the break you came for',
  food: 'Our kitchen will be thrilled to hear you enjoyed the organic Pahadi food and tea',
  staff: 'Your kind words about our team and local guides mean a great deal — we will pass them on today',
  heating: 'We are glad the rooms kept you warm and cosy through the Himalayan nights',
  service: 'We are happy the front desk could look after you so promptly',
  wifi: 'We are pleased the Wi-Fi kept up with you',
  rooms: 'It is lovely to hear your room felt clean and comfortable',
};

const TOPIC_NOUN: Record<TopicKey, string> = {
  heating: 'the heating and hot water',
  wifi: 'the Wi-Fi',
  food: 'the food',
  rooms: 'the room',
  service: 'the front-desk service',
  staff: 'the behaviour of our staff',
  view: 'the noise',
};

const LIKED: Record<TopicKey, string> = {
  heating: 'the warmth of the rooms',
  wifi: 'the Wi-Fi',
  food: 'the food',
  rooms: 'the room',
  service: 'the quick service',
  staff: 'our team',
  view: 'the mountain views',
};

const GENERIC_NAMES = /^(manual entry|test|test_guest|guest|anonymous)$/i;

function greeting(name: string): string {
  if (!name || GENERIC_NAMES.test(name.trim())) return 'Dear Guest,';
  return `Dear ${name.trim().split(/\s+/)[0]},`;
}

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length];

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function draftReply(review: Review, variant = 0): string {
  const a = analyseCached(review.text);
  const neg = a.hits.filter((h) => h.polarity === 'negative').map((h) => h.topic);
  const pos = a.hits.filter((h) => h.polarity === 'positive').map((h) => h.topic);
  const parts: string[] = [greeting(review.guestName)];

  if (review.sentiment === 'negative' || (neg.length > 0 && review.rating <= 3)) {
    parts.push(
      pick(
        [
          `Thank you for telling us about your stay, and we are truly sorry we fell short of the Pahadi hospitality we promise.`,
          `We are sorry your stay did not live up to expectations — thank you for taking the time to let us know.`,
          `Thank you for your honest feedback. We are sorry about the discomfort you experienced during your time with us.`,
        ],
        variant,
      ),
    );
    if (neg.length) {
      const fixes = neg.slice(0, 2).map((t) => FIX[t]);
      const nouns = neg.slice(0, 2).map((t) => TOPIC_NOUN[t]);
      parts.push(
        `Regarding ${joinList(nouns)}: ${fixes
          .map((f, i) => (i === 0 ? f : `and ${f}`))
          .join(', ')}.`,
      );
    }
    if (pos.length) parts.push(`We are glad you enjoyed ${LIKED[pos[0]]}, and we want the rest of your stay to match it.`);
    parts.push(
      pick(
        [
          'We would be grateful for the chance to host you again and make it right.',
          'We hope you will give us another opportunity to show you the comfort and care our hills are known for.',
          'Please write to us directly if there is anything more we can do — we would love to welcome you back.',
        ],
        variant,
      ),
    );
  } else if (review.sentiment === 'neutral' || neg.length > 0) {
    parts.push(
      pick(
        [
          'Thank you for sharing such balanced feedback about your stay with us.',
          'We appreciate you taking the time to review PahaadPulse, both the good and the not-so-good.',
          'Thank you for staying with us — your detailed notes help us improve.',
        ],
        variant,
      ),
    );
    if (pos.length) parts.push(`${PRAISE[pos[0]]}.`);
    if (neg.length) parts.push(`On ${joinList(neg.slice(0, 2).map((t) => TOPIC_NOUN[t]))}, ${FIX[neg[0]]}.`);
    parts.push(
      pick(
        [
          'We hope to welcome you back for an even better Himalayan stay.',
          'We look forward to hosting you again soon.',
          'We would love to show you the improvements on your next visit.',
        ],
        variant,
      ),
    );
  } else {
    parts.push(
      pick(
        [
          'Thank you so much for such a wonderful review — it made our whole team smile.',
          'What a lovely note to read. Thank you for choosing to stay with us in the hills!',
          'Thank you for the kind words and for sharing your experience with future guests.',
        ],
        variant,
      ),
    );
    parts.push(...pos.slice(0, 2).map((t) => `${PRAISE[t]}.`));
    parts.push(
      pick(
        [
          'The mountains will be waiting whenever you wish to return.',
          'We would love to host you again, perhaps for the winter snow.',
          'Come back soon — your room with a view will be ready.',
        ],
        variant,
      ),
    );
  }

  return `${parts.join(' ').replace(/\.\./g, '.')}\n\nWarm regards,\nTeam PahaadPulse`;
}
