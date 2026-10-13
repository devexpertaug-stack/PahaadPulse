export type Sentiment = 'positive' | 'neutral' | 'negative';

export type ReviewSource = 'Booking.com' | 'Google' | 'TripAdvisor' | 'Goibibo' | 'Manual';

export type TopicKey = 'heating' | 'wifi' | 'staff' | 'service' | 'food' | 'view' | 'rooms';

export interface Review {
  id: string;
  guestName: string;
  source: ReviewSource;
  rating: number; // 1-5
  date: string; // dd/mm/yyyy
  text: string;
  sentiment: Sentiment;
  tags: string[];
  aiReply?: string;
  /** reply has been posted back to the channel */
  replied?: boolean;
  verified?: boolean;
  roomType?: string;
}

export type ComplaintCategory = 'positive' | 'neutral' | 'high_attention';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';
export type Department = 'Housekeeping' | 'Front Desk' | 'Food & Beverage' | 'Maintenance' | 'Security';

export interface WhatsAppComplaint {
  id: string;
  guestName: string;
  room: string;
  timestamp: string;
  message: string;
  category: ComplaintCategory;
  department: Department;
  status: ComplaintStatus;
  channel: 'WhatsApp Call' | 'WhatsApp Text';
  assigneeId?: string;
}

export type StaffStatus = 'Top Performer' | 'Average' | 'Needs Coaching';

export interface StaffFeedback {
  sentiment: Sentiment;
  text: string;
  source: string;
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: Department;
  performanceScore: number; // 0-100
  tasksCompleted: number;
  positiveMentions: number;
  complaintsAgainst: number;
  trend: 'up' | 'down' | 'flat';
  /** last 7 weekly scores, oldest first */
  weekly: number[];
  feedback: StaffFeedback[];
  coaching?: boolean;
  starOfWeek?: boolean;
}

export type RoomStatus = 'Occupied' | 'Ready' | 'Cleaning' | 'Maintenance';

export interface Room {
  number: string;
  type: string;
  status: RoomStatus;
  guest?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface OperationalTask {
  id: string;
  title: string;
  priority: TaskPriority;
  department: Department;
  done?: boolean;
  source?: 'manual' | 'review' | 'complaint' | 'room' | 'insight';
  /** id of the review / complaint / room (or topic key for insights) that raised the task */
  refId?: string;
}

export interface BillItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Bill {
  id: string;
  invoiceNo: string;
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
  items: BillItem[];
  /** GST percentage applied on the subtotal */
  gstRate: number;
  status: 'Paid' | 'Pending';
  createdAt: string;
}

export interface Arrival {
  id: string;
  guest: string;
  roomType: string;
  nights: number;
  pax: number;
  checkedIn?: boolean;
  /** room the guest is checked into */
  room?: string;
}

export type ChannelKey = 'Booking.com' | 'Google' | 'TripAdvisor' | 'Goibibo';

export interface ChannelState {
  connected: boolean;
  enabled: boolean;
  /** dd/mm/yyyy, h:mm AM — last successful sync */
  lastSync?: string;
}
