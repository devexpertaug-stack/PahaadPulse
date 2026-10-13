export type Sentiment = 'positive' | 'neutral' | 'negative';

export type ReviewSource = 'Booking.com' | 'Google' | 'TripAdvisor' | 'Goibibo' | 'Manual';

export interface Review {
  id: string;
  guestName: string;
  source: ReviewSource;
  rating: number; // 1-5
  date: string;
  text: string;
  sentiment: Sentiment;
  tags: string[];
  aiReply?: string;
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
}

export type StaffStatus = 'Top Performer' | 'Average' | 'Needs Coaching';

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: Department | 'Management';
  performanceScore: number; // 0-100
  tasksCompleted: number;
  positiveMentions: number;
  complaintsAgainst: number;
  trend: 'up' | 'down' | 'flat';
  status: StaffStatus;
}

export interface Room {
  number: string;
  type: string;
  status: 'Occupied' | 'Ready' | 'Cleaning' | 'Maintenance';
  guest?: string;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface OperationalTask {
  id: string;
  title: string;
  priority: TaskPriority;
  department: Department;
}

export interface BillItem {
  description: string;
  qty: number;
  rate: number;
}

export interface Bill {
  id: string;
  guestName: string;
  room: string;
  checkIn: string;
  checkOut: string;
  items: BillItem[];
  status: 'Paid' | 'Pending';
  createdAt: string;
}

export interface IssueCluster {
  label: string;
  volume: number;
  sentiment: Sentiment;
}
