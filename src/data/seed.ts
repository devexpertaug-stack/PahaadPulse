import { analyse, sentimentFromRating } from '../lib/analysis';
import type {
  Arrival,
  Bill,
  ChannelKey,
  OperationalTask,
  Review,
  ReviewSource,
  Room,
  StaffMember,
  WhatsAppComplaint,
} from '../types';

export const HOTEL_NAME = 'PahaadPulse Eco Resort – Auli';
export const TOTAL_ROOMS = 22;

/** nightly rate by room type (₹) */
export const RATES: Record<string, number> = {
  'Deluxe Valley Cottage': 6500,
  'Pine Wood Suite': 8200,
  'Garden Tent': 3800,
};
export const ROOM_TYPES = Object.keys(RATES);

/* ───────────────────────────── reviews ───────────────────────────── */

export interface RawReview {
  guest: string;
  source: ReviewSource;
  rating: number;
  date: string;
  text: string;
  room?: string;
  verified?: boolean;
  aiReply?: string;
  replied?: boolean;
}

const RAW_REVIEWS: RawReview[] = [
  // ── manual entries (match the first screens of the original app) ──
  { guest: 'Manual Entry', source: 'Manual', rating: 2, date: '13/10/2026', text: 'Food was great but staff was rude and heater broken.' },
  {
    guest: 'TEST_Guest',
    source: 'Manual',
    rating: 2,
    date: '13/10/2026',
    text: 'The wifi was terrible and the room was cold.',
    aiReply:
      'At PahaadPulse, we strive to offer the warmth of traditional Pahadi hospitality, and I am truly sorry that we fell short of your expectations during your stay. We understand that the mountain terrain can sometimes make digital connectivity a challenge, but we are actively working to improve our network stability for a more seamless experience. Regarding the chill in your room, we sincerely apologize for the discomfort and have since upgraded our heating arrangements to ensure every guest remains cozy during the crisp Himalayan nights. We hope you will give us another opportunity to host you and provide the true comfort and care our hills are known for.\n\nWarm regards,\nTeam PahaadPulse',
  },
  { guest: 'Test', source: 'Manual', rating: 3, date: '13/10/2026', text: 'The room was freezing and no hot water at night, but the pahadi food and mountain views were incredible.' },

  // ── Booking.com ──
  { guest: 'Ananya Mehta', source: 'Booking.com', rating: 5, date: '11/10/2026', room: 'Deluxe Valley Cottage', verified: true, text: 'Woke up to clouds floating below our balcony in Auli. The silence here is unreal after Delhi. Will come back every winter.' },
  { guest: 'Priya Nair', source: 'Booking.com', rating: 5, date: '06/10/2026', verified: true, text: 'Our guide for the Auli ropeway trip was fantastic, very knowledgeable about the local trails.' },
  { guest: 'Arjun Rawat', source: 'Booking.com', rating: 5, date: '28/09/2026', verified: true, text: 'The quietness and misty mountain views at sunrise made this trip unforgettable. Staff felt like family.' },
  { guest: 'Neha Kapoor', source: 'Booking.com', rating: 5, date: '25/09/2026', verified: true, text: 'Absolutely magical. The mist rolling over the valley, hot ginger tea on the balcony, and friendly staff who remembered our names.' },
  { guest: 'Tarun Malhotra', source: 'Booking.com', rating: 5, date: '16/09/2026', room: 'Deluxe Valley Cottage', verified: true, text: 'Lovely cottage with a fantastic view. The housekeeping team was attentive and the room was always spotless.' },
  { guest: 'Pooja Iyer', source: 'Booking.com', rating: 5, date: '03/09/2026', verified: true, text: 'Stayed for three nights, every morning the view was unreal. Staff, food and calm surroundings were all excellent.' },
  { guest: 'Lakshmi Pillai', source: 'Booking.com', rating: 3, date: '10/09/2026', verified: true, text: 'Lovely staff, however the room was slightly damp and the bathroom needs maintenance.' },
  { guest: 'Mohit Agarwal', source: 'Booking.com', rating: 2, date: '20/09/2026', room: 'Deluxe Valley Cottage', verified: true, text: 'Room smelled damp and the bed linen was not changed for two days. Housekeeping was careless.' },

  // ── Google ──
  { guest: 'Rohit Sharma', source: 'Google', rating: 4, date: '09/10/2026', room: 'Garden Tent', verified: true, text: 'Loved the organic Pahadi thali and the staff were genuinely warm. Only issue was patchy wifi in the garden tents.' },
  { guest: 'Meera Joshi', source: 'Google', rating: 5, date: '04/10/2026', verified: true, text: "Best pahadi food we have had in Uttarakhand. The chef's mandua roti and bhatt ki churkani were delicious." },
  { guest: 'Imran Qureshi', source: 'Google', rating: 4, date: '30/09/2026', verified: true, text: 'Quiet location with stunning views of Nanda Devi. Rooms were clean and comfortable, breakfast was tasty.' },
  { guest: 'Divya Menon', source: 'Google', rating: 5, date: '12/09/2026', room: 'Pine Wood Suite', verified: true, text: 'We loved the cosy rooms with heating that actually works. Warm blankets, a roaring heater and amazing hot water.' },
  { guest: 'Karan Mehta', source: 'Google', rating: 3, date: '04/10/2026', verified: true, text: 'Decent stay, room was clean but the wifi speed in the valley side rooms is very weak for work calls.' },
  { guest: 'Deepa Nair', source: 'Google', rating: 2, date: '27/09/2026', verified: true, text: 'Wifi barely worked and the front desk kept telling us it would be fixed by evening. Very disappointing for the price.' },
  { guest: 'Gaurav Chauhan', source: 'Google', rating: 2, date: '05/09/2026', verified: true, text: 'Waited over an hour for dinner and the food arrived cold. Service was slow and the staff seemed unbothered.' },

  // ── TripAdvisor ──
  { guest: 'Kavya Reddy', source: 'TripAdvisor', rating: 5, date: '01/10/2026', verified: true, text: 'The bonfire evenings and the local guides who took us to Chopta were the highlight. Warm hospitality throughout.' },
  { guest: 'Aditi Bhatt', source: 'TripAdvisor', rating: 5, date: '19/09/2026', verified: true, text: 'Peaceful and beautifully quiet. The organic vegetables from their own garden made every meal fresh and delicious.' },
  { guest: 'Harsh Vardhan', source: 'TripAdvisor', rating: 4, date: '08/09/2026', verified: true, text: 'Wonderful location and helpful front desk. Check-in was quick and they arranged a lovely early breakfast for our trek.' },
  { guest: 'Siddharth Rao', source: 'TripAdvisor', rating: 3, date: '15/09/2026', verified: true, text: 'Food and views are great but the heating was weak at night and the wifi dropped repeatedly.' },
  {
    guest: 'Vikram Singh',
    source: 'TripAdvisor',
    rating: 2,
    date: '08/10/2026',
    room: 'Pine Wood Suite',
    verified: true,
    replied: true,
    text: 'Geyser did not work for two days, had to shower with cold water in October. Front desk was slow to respond.',
    aiReply:
      'Dear Vikram, thank you for telling us about this — a cold shower in October is not the stay we want for any guest. Our maintenance lead has serviced the solar geyser in the Pine Wood Suites and we are reviewing how quickly our front desk escalates such issues. We would be glad to welcome you back and make it right.\n\nWarm regards,\nTeam PahaadPulse',
  },
  { guest: 'Sneha Kulkarni', source: 'TripAdvisor', rating: 1, date: '02/10/2026', room: 'Deluxe Valley Cottage', verified: true, text: 'Solar heating failed completely, freezing cold room, and no one came to fix it despite three calls.' },

  // ── Goibibo ──
  { guest: 'Sanjay Gupta', source: 'Goibibo', rating: 4, date: '03/10/2026', room: 'Pine Wood Suite', verified: true, text: 'Spotless rooms and a cosy fireplace. The sunrise view from the suite was beautiful, very peaceful stay.' },
  { guest: 'Rahul Verma', source: 'Goibibo', rating: 4, date: '22/09/2026', verified: true, text: 'Great value for an eco stay. Clean room, good food and the staff helped arrange a taxi to Joshimath quickly.' },
  { guest: 'Vivek Anand', source: 'Goibibo', rating: 4, date: '28/08/2026', verified: true, text: 'Good stay in the hills. Friendly staff, tasty food and a quiet, clean room. Would recommend.' },
  { guest: 'Ritu Saxena', source: 'Goibibo', rating: 1, date: '14/09/2026', verified: true, text: 'Cold shower every morning and the heater was broken. Staff were rude when we complained. Not worth it.' },
];

export function buildReview(raw: RawReview, id: string): Review {
  const a = analyse(raw.text);
  return {
    id,
    guestName: raw.guest,
    source: raw.source,
    rating: raw.rating,
    date: raw.date,
    text: raw.text,
    sentiment: sentimentFromRating(raw.rating),
    tags: a.tags,
    aiReply: raw.aiReply,
    replied: raw.replied,
    verified: raw.verified,
    roomType: raw.room,
  };
}

export const seedReviews: Review[] = RAW_REVIEWS.map((r, i) => buildReview(r, `r${i + 1}`));

/* ───────────────────────── scraper discovery pool ───────────────────────── */
/** reviews "found" the first times a channel is scraped */
export const SCRAPE_POOL: Record<ChannelKey, RawReview[]> = {
  'Booking.com': [
    { guest: 'Shreya Bose', source: 'Booking.com', rating: 2, date: '13/10/2026', verified: true, text: 'Hot water ran out every morning and the heater in our room was weak. Front desk promised a fix but nothing happened.' },
    { guest: 'Faisal Khan', source: 'Booking.com', rating: 3, date: '12/10/2026', verified: true, text: 'Beautiful views and friendly staff but the wifi was weak and the room felt damp.' },
  ],
  Google: [
    { guest: 'Aman Joshi', source: 'Google', rating: 5, date: '13/10/2026', verified: true, text: 'Peaceful, quiet and the mountain views are unreal. Staff were warm and the food was delicious.' },
    { guest: 'Ritika Das', source: 'Google', rating: 5, date: '12/10/2026', verified: true, text: 'Spotless cottage, cosy heater and fantastic breakfast. The team went out of their way to help us.' },
    { guest: 'Rakesh Tiwari', source: 'Google', rating: 2, date: '12/10/2026', verified: true, text: 'Waited forty minutes for check-in and the room was not ready. Service needs improvement.' },
  ],
  TripAdvisor: [
    { guest: 'Michael Brandt', source: 'TripAdvisor', rating: 4, date: '13/10/2026', verified: true, text: 'Lovely eco-lodge and great guides for the Valley of Flowers trek. Loved the organic dinner too. Wifi was patchy.' },
    { guest: 'Lena Fischer', source: 'TripAdvisor', rating: 5, date: '12/10/2026', verified: true, text: 'Magical stay in the mist. Everything from the pahadi food to the warm hosts was perfect.' },
  ],
  Goibibo: [
    { guest: 'Pankaj Rawat', source: 'Goibibo', rating: 1, date: '13/10/2026', verified: true, text: 'Rude reception staff and no one answered our calls when the geyser stopped working. Terrible experience.' },
  ],
};

/* ───────────────────────── WhatsApp complaints ───────────────────────── */

export const seedComplaints: WhatsAppComplaint[] = [
  { id: 'c1', guestName: 'Vikram Singh', room: '202', timestamp: '13/10/2026, 9:12 PM', message: 'Geyser not working since this morning, water is ice cold.', category: 'high_attention', department: 'Maintenance', status: 'in_progress', channel: 'WhatsApp Call', assigneeId: 's3' },
  { id: 'c2', guestName: 'Sneha Kulkarni', room: '101', timestamp: '13/10/2026, 8:40 PM', message: 'Called front desk thrice, no one picked up for extra blankets.', category: 'high_attention', department: 'Front Desk', status: 'open', channel: 'WhatsApp Call', assigneeId: 's5' },
  { id: 'c3', guestName: 'Ananya Mehta', room: '102', timestamp: '13/10/2026, 7:55 PM', message: 'Can we get an extra bonfire session tonight? Loved yesterday!', category: 'positive', department: 'Front Desk', status: 'resolved', channel: 'WhatsApp Text', assigneeId: 's2' },
  { id: 'c4', guestName: 'Karan Mehta', room: 'T-3', timestamp: '13/10/2026, 6:20 PM', message: 'Wifi keeps dropping during my work calls, need a fix soon.', category: 'neutral', department: 'Maintenance', status: 'open', channel: 'WhatsApp Text', assigneeId: 's3' },
  { id: 'c5', guestName: 'Rohit Sharma', room: 'T-4', timestamp: '13/10/2026, 5:02 PM', message: 'Room service was super quick, thank you for the lemon tea!', category: 'positive', department: 'Food & Beverage', status: 'resolved', channel: 'WhatsApp Text', assigneeId: 's4' },
  { id: 'c6', guestName: 'Priya Nair', room: '205', timestamp: '13/10/2026, 3:30 PM', message: 'Housekeeping missed our room today, towels not changed.', category: 'neutral', department: 'Housekeeping', status: 'in_progress', channel: 'WhatsApp Call', assigneeId: 's6' },
  { id: 'c7', guestName: 'Arjun Rawat', room: '204', timestamp: '13/10/2026, 1:15 PM', message: 'Found a wasp nest near the balcony, feeling unsafe, please help urgently.', category: 'high_attention', department: 'Security', status: 'open', channel: 'WhatsApp Call', assigneeId: 's7' },
];

/** messages used by the "simulate incoming WhatsApp" button */
export const INCOMING_SAMPLES: Array<{ message: string; channel: 'WhatsApp Call' | 'WhatsApp Text' }> = [
  { message: 'There is no hot water in the bathroom since last night, it is freezing. Please send someone immediately.', channel: 'WhatsApp Call' },
  { message: 'The wifi is very slow in our room, cannot join my meeting.', channel: 'WhatsApp Text' },
  { message: 'Thank you for the lovely sunrise tea on the terrace, the staff were wonderful!', channel: 'WhatsApp Text' },
  { message: 'Our room smells damp and the bed linen was not changed today.', channel: 'WhatsApp Call' },
  { message: 'Called the front desk three times, nobody picked up. We need extra blankets.', channel: 'WhatsApp Call' },
  { message: 'Dinner was served cold and we waited an hour. Very disappointing.', channel: 'WhatsApp Text' },
  { message: 'I think there is a snake near the tent entrance, I feel unsafe, please come now!', channel: 'WhatsApp Call' },
];

/* ──────────────────────────────── staff ──────────────────────────────── */

export const seedStaff: StaffMember[] = [
  {
    id: 's1', name: 'Deepak Bisht', initials: 'DB', role: 'Senior Housekeeper', department: 'Housekeeping',
    performanceScore: 94, tasksCompleted: 58, positiveMentions: 12, complaintsAgainst: 0, trend: 'up',
    weekly: [88, 89, 91, 90, 92, 93, 94],
    feedback: [
      { sentiment: 'positive', text: 'The housekeeping team was attentive and the room was always spotless.', source: 'Booking.com · Tarun M.' },
      { sentiment: 'positive', text: 'Clean room, towels replaced without asking.', source: 'WhatsApp · Room 105' },
    ],
  },
  {
    id: 's2', name: 'Meena Rautela', initials: 'MR', role: 'Front Desk Executive', department: 'Front Desk',
    performanceScore: 88, tasksCompleted: 41, positiveMentions: 9, complaintsAgainst: 1, trend: 'up',
    weekly: [80, 82, 84, 85, 87, 86, 88],
    feedback: [
      { sentiment: 'positive', text: 'Helpful front desk. Check-in was quick and they arranged an early breakfast.', source: 'TripAdvisor · Harsh V.' },
      { sentiment: 'positive', text: 'Arranged the extra bonfire session within minutes.', source: 'WhatsApp · Room 102' },
    ],
  },
  {
    id: 's3', name: 'Suresh Panwar', initials: 'SP', role: 'Maintenance Lead', department: 'Maintenance',
    performanceScore: 52, tasksCompleted: 19, positiveMentions: 1, complaintsAgainst: 6, trend: 'down',
    weekly: [70, 66, 64, 60, 58, 55, 52],
    feedback: [
      { sentiment: 'negative', text: 'Solar heating failed completely and no one came to fix it despite three calls.', source: 'TripAdvisor · Sneha K.' },
      { sentiment: 'negative', text: 'Geyser did not work for two days.', source: 'TripAdvisor · Vikram S.' },
      { sentiment: 'negative', text: 'Wifi keeps dropping during my work calls, need a fix soon.', source: 'WhatsApp · Room T-3' },
    ],
  },
  {
    id: 's4', name: 'Kavita Negi', initials: 'KN', role: 'Chef de Cuisine', department: 'Food & Beverage',
    performanceScore: 91, tasksCompleted: 36, positiveMentions: 15, complaintsAgainst: 0, trend: 'up',
    weekly: [86, 88, 87, 89, 90, 90, 91],
    feedback: [
      { sentiment: 'positive', text: "The chef's mandua roti and bhatt ki churkani were delicious.", source: 'Google · Meera J.' },
      { sentiment: 'positive', text: 'Room service was super quick, thank you for the lemon tea!', source: 'WhatsApp · Room T-4' },
    ],
  },
  {
    id: 's5', name: 'Ravi Chauhan', initials: 'RC', role: 'Front Desk Executive', department: 'Front Desk',
    performanceScore: 61, tasksCompleted: 24, positiveMentions: 2, complaintsAgainst: 4, trend: 'down',
    weekly: [74, 72, 70, 68, 66, 63, 61],
    feedback: [
      { sentiment: 'negative', text: 'Called front desk thrice, no one picked up for extra blankets.', source: 'WhatsApp · Room 101' },
      { sentiment: 'negative', text: 'Front desk was slow to respond.', source: 'TripAdvisor · Vikram S.' },
    ],
  },
  {
    id: 's6', name: 'Anita Thapliyal', initials: 'AT', role: 'Housekeeping Staff', department: 'Housekeeping',
    performanceScore: 76, tasksCompleted: 44, positiveMentions: 5, complaintsAgainst: 2, trend: 'flat',
    weekly: [75, 77, 74, 76, 75, 77, 76],
    feedback: [
      { sentiment: 'negative', text: 'Bed linen was not changed for two days.', source: 'Booking.com · Mohit A.' },
      { sentiment: 'neutral', text: 'Housekeeping missed our room today, towels not changed.', source: 'WhatsApp · Room 205' },
    ],
  },
  {
    id: 's7', name: 'Mohan Rana', initials: 'MR', role: 'Security Guard', department: 'Security',
    performanceScore: 83, tasksCompleted: 30, positiveMentions: 4, complaintsAgainst: 1, trend: 'up',
    weekly: [78, 79, 80, 81, 82, 82, 83],
    feedback: [
      { sentiment: 'neutral', text: 'Found a wasp nest near the balcony, please help urgently.', source: 'WhatsApp · Room 204' },
      { sentiment: 'positive', text: 'Felt safe walking back to the tents at night.', source: 'Google · Imran Q.' },
    ],
  },
];

/* ───────────────────────────── rooms & arrivals ───────────────────────────── */

const COTTAGE = 'Deluxe Valley Cottage';
const SUITE = 'Pine Wood Suite';
const TENT = 'Garden Tent';

export const seedRooms: Room[] = [
  { number: '101', type: COTTAGE, status: 'Occupied', guest: 'Sneha Kulkarni' },
  { number: '102', type: COTTAGE, status: 'Occupied', guest: 'Ananya Mehta' },
  { number: '103', type: COTTAGE, status: 'Occupied', guest: 'Rohan Desai' },
  { number: '104', type: COTTAGE, status: 'Ready' },
  { number: '105', type: COTTAGE, status: 'Occupied', guest: 'Priyanka Sharma' },
  { number: '106', type: COTTAGE, status: 'Occupied', guest: 'Amit Kulshreshtha' },
  { number: '107', type: COTTAGE, status: 'Occupied', guest: 'Nisha Thakur' },
  { number: '108', type: COTTAGE, status: 'Occupied', guest: 'Kunal Joshi' },
  { number: '201', type: SUITE, status: 'Cleaning' },
  { number: '202', type: SUITE, status: 'Occupied', guest: 'Vikram Singh' },
  { number: '203', type: SUITE, status: 'Occupied', guest: 'Meera Joshi' },
  { number: '204', type: SUITE, status: 'Occupied', guest: 'Arjun Rawat' },
  { number: '205', type: SUITE, status: 'Occupied', guest: 'Priya Nair' },
  { number: '206', type: SUITE, status: 'Occupied', guest: 'Sanjay Gupta' },
  { number: 'T-1', type: TENT, status: 'Occupied', guest: 'S. Laurent' },
  { number: 'T-2', type: TENT, status: 'Maintenance' },
  { number: 'T-3', type: TENT, status: 'Occupied', guest: 'Karan Mehta' },
  { number: 'T-4', type: TENT, status: 'Occupied', guest: 'Rohit Sharma' },
  { number: 'T-5', type: TENT, status: 'Ready' },
  { number: 'T-6', type: TENT, status: 'Occupied', guest: 'Neha Kapoor' },
  { number: 'T-7', type: TENT, status: 'Occupied', guest: 'Harsh Vardhan' },
  { number: 'T-8', type: TENT, status: 'Occupied', guest: 'Divya Menon' },
];

export const seedArrivals: Arrival[] = [
  { id: 'a1', guest: 'Rohan Desai', roomType: COTTAGE, nights: 2, pax: 2, checkedIn: true, room: '103' },
  { id: 'a2', guest: 'Priyanka Sharma', roomType: COTTAGE, nights: 3, pax: 2, checkedIn: true, room: '105' },
  { id: 'a3', guest: 'Nisha Thakur', roomType: COTTAGE, nights: 2, pax: 2, checkedIn: true, room: '107' },
  { id: 'a4', guest: 'Harsh Vardhan', roomType: TENT, nights: 2, pax: 2, checkedIn: true, room: 'T-7' },
  { id: 'a5', guest: 'Aarav Khanna', roomType: COTTAGE, nights: 2, pax: 2 },
  { id: 'a6', guest: 'Ishita Roy', roomType: TENT, nights: 3, pax: 2 },
  { id: 'a7', guest: 'The Bansal Family', roomType: SUITE, nights: 2, pax: 4 },
];

/* ───────────────────────────── tasks & bills ───────────────────────────── */

export const seedTasks: OperationalTask[] = [
  { id: 't1', title: 'Solar geyser servicing — Pine Wood Suite 202', priority: 'High', department: 'Maintenance', source: 'complaint', refId: 'c1' },
  { id: 't2', title: 'Deep-clean Pine Wood Suite 201 after checkout', priority: 'Medium', department: 'Housekeeping', source: 'room', refId: '201' },
  { id: 't3', title: 'Prep organic Pahadi thali — 24 guests tonight', priority: 'Medium', department: 'Food & Beverage', source: 'manual' },
  { id: 't4', title: 'Remove wasp nest near the balcony, room 204', priority: 'High', department: 'Security', source: 'complaint', refId: 'c7' },
];

export const seedBills: Bill[] = [
  {
    id: 'b1', invoiceNo: 'INV-2610-0001', guestName: 'Ananya Mehta', room: '102',
    checkIn: '09/10/2026', checkOut: '13/10/2026', gstRate: 12, status: 'Pending', createdAt: '13/10/2026',
    items: [
      { description: 'Deluxe Valley Cottage — 4 nights', qty: 4, rate: 6500 },
      { description: 'Breakfast buffet', qty: 4, rate: 450 },
      { description: 'Bonfire session', qty: 1, rate: 1200 },
    ],
  },
  {
    id: 'b2', invoiceNo: 'INV-2610-0002', guestName: 'Vikram Singh', room: '202',
    checkIn: '10/10/2026', checkOut: '12/10/2026', gstRate: 18, status: 'Paid', createdAt: '12/10/2026',
    items: [
      { description: 'Pine Wood Suite — 2 nights', qty: 2, rate: 8200 },
      { description: 'Airport transfer', qty: 1, rate: 1800 },
    ],
  },
];

/** one-tap line items in the billing form */
export const QUICK_ITEMS: Array<{ description: string; rate: number }> = [
  { description: 'Breakfast buffet', rate: 450 },
  { description: 'Pahadi thali dinner', rate: 650 },
  { description: 'Bonfire session', rate: 1200 },
  { description: 'Trek guide (half day)', rate: 1500 },
  { description: 'Laundry', rate: 300 },
  { description: 'Airport transfer', rate: 1800 },
];

export const CHANNELS: ChannelKey[] = ['Booking.com', 'Google', 'TripAdvisor', 'Goibibo'];
