import { useCallback } from 'react';
import { useApp } from './AppStore';
import { analyse, analyseCached, TOPICS } from '../lib/analysis';
import { buildReview, INCOMING_SAMPLES } from '../data/seed';
import { DEMO_TODAY, fmtDMY, nowStamp, uid } from '../lib/format';
import type {
  Department,
  OperationalTask,
  Review,
  ReviewSource,
  TopicKey,
  WhatsAppComplaint,
} from '../types';

const TASKS_LINK = { label: 'Open Hotel OS', to: '/app/hotelos' };

/** Cross-cutting actions that touch several parts of the state at once. */
export function useActions() {
  const { state, dispatch, say } = useApp();

  const raiseReviewTask = useCallback(
    (review: Review) => {
      if (state.tasks.some((t) => t.source === 'review' && t.refId === review.id)) {
        say('A task for this review already exists in Hotel OS', TASKS_LINK);
        return;
      }
      const a = analyseCached(review.text);
      const lead = a.primary && a.primary.polarity === 'negative' ? TOPICS[a.primary.topic].action : 'Follow up on guest feedback';
      const task: OperationalTask = {
        id: uid('t'),
        title: `${lead} — ${review.guestName}, ${review.source}`,
        priority: review.rating <= 2 ? 'High' : a.priority,
        department: a.department,
        source: 'review',
        refId: review.id,
      };
      dispatch({ type: 'task/add', task });
      say(`Task raised for ${task.department}`, TASKS_LINK);
    },
    [state.tasks, dispatch, say],
  );

  const raiseInsightTask = useCallback(
    (topic: TopicKey) => {
      if (state.tasks.some((t) => t.source === 'insight' && t.refId === topic && !t.done)) {
        say('This action is already on the Hotel OS task list', TASKS_LINK);
        return;
      }
      const meta = TOPICS[topic];
      const task: OperationalTask = {
        id: uid('t'),
        title: meta.action,
        priority: meta.risk >= 3000 ? 'High' : 'Medium',
        department: meta.department,
        source: 'insight',
        refId: topic,
      };
      dispatch({ type: 'task/add', task });
      say(`“${meta.short}” action added to Hotel OS — finish it to clear the revenue at risk`, TASKS_LINK);
    },
    [state.tasks, dispatch, say],
  );

  const addReview = useCallback(
    (input: { guest: string; source: ReviewSource; rating: number; text: string }) => {
      const review = buildReview(
        {
          guest: input.guest.trim() || 'Guest',
          source: input.source,
          rating: input.rating,
          date: fmtDMY(DEMO_TODAY),
          text: input.text.trim(),
        },
        uid('r'),
      );
      dispatch({ type: 'review/add', review });
      return review;
    },
    [dispatch],
  );

  /** Classify a WhatsApp message, file it, auto-assign the right department, and escalate if needed. */
  const logComplaint = useCallback(
    (input: { guest: string; room: string; message: string; channel: WhatsAppComplaint['channel'] }) => {
      const a = analyse(input.message);
      const load = (id: string) =>
        state.complaints.filter((c) => c.assigneeId === id && c.status !== 'resolved').length;
      const candidates = state.staff
        .filter((s) => s.department === a.department)
        .sort((x, y) => load(x.id) - load(y.id) || y.performanceScore - x.performanceScore);
      const assignee = candidates[0];

      const complaint: WhatsAppComplaint = {
        id: uid('c'),
        guestName: input.guest.trim() || 'Guest',
        room: input.room,
        timestamp: nowStamp(),
        message: input.message.trim(),
        category: a.category,
        department: a.department,
        // praise needs no follow-up
        status: a.category === 'positive' ? 'resolved' : assignee ? 'in_progress' : 'open',
        channel: input.channel,
        assigneeId: assignee?.id,
      };
      dispatch({ type: 'complaint/add', complaint });

      if (a.category === 'high_attention') {
        const lead = a.primary ? TOPICS[a.primary.topic].action : a.security ? 'Send security to the guest room' : 'Resolve urgent guest request';
        dispatch({
          type: 'task/add',
          task: {
            id: uid('t'),
            title: `${lead} — room ${input.room}`,
            priority: 'High',
            department: a.department,
            source: 'complaint',
            refId: complaint.id,
          },
        });
        say(
          state.autoEscalate
            ? `High attention · escalated to the GM and ${assignee ? assignee.name : a.department}`
            : `High attention · queued for ${a.department} (auto-escalation is off)`,
          { label: 'View tasks', to: '/app/hotelos' },
        );
      } else {
        say(
          a.category === 'positive'
            ? 'Positive message filed — nothing to fix'
            : `Filed as neutral · routed to ${a.department}${assignee ? ` (${assignee.name})` : ''}`,
        );
      }
      return complaint;
    },
    [state.complaints, state.staff, state.autoEscalate, dispatch, say],
  );

  const simulateIncoming = useCallback(() => {
    const sample = INCOMING_SAMPLES[state.nextIncoming % INCOMING_SAMPLES.length];
    const occupied = state.rooms.filter((r) => r.status === 'Occupied' && r.guest);
    const room = occupied.length ? occupied[(state.nextIncoming * 3 + 1) % occupied.length] : undefined;
    dispatch({ type: 'complaint/consumeSample' });
    return logComplaint({
      guest: room?.guest ?? 'In-house guest',
      room: room?.number ?? '—',
      message: sample.message,
      channel: sample.channel,
    });
  }, [state.nextIncoming, state.rooms, dispatch, logComplaint]);

  const raiseComplaintTask = useCallback(
    (c: WhatsAppComplaint) => {
      if (state.tasks.some((t) => t.source === 'complaint' && t.refId === c.id)) {
        say('A task for this complaint already exists', TASKS_LINK);
        return;
      }
      const a = analyseCached(c.message);
      const lead = a.primary ? TOPICS[a.primary.topic].action : 'Follow up with the guest';
      dispatch({
        type: 'task/add',
        task: {
          id: uid('t'),
          title: `${lead} — room ${c.room}`,
          priority: c.category === 'high_attention' ? 'High' : 'Medium',
          department: c.department as Department,
          source: 'complaint',
          refId: c.id,
        },
      });
      say(`Task raised for ${c.department}`, TASKS_LINK);
    },
    [state.tasks, dispatch, say],
  );

  return { raiseReviewTask, raiseInsightTask, addReview, logComplaint, simulateIncoming, raiseComplaintTask };
}
