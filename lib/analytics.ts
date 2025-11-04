import { supabase } from './supabase/client';

export async function trackContentView(contentId: string, userId?: string) {
  try {
    if (typeof window === 'undefined') return;

    console.log('Tracking view:', {
      content_id: contentId,
      session_id: getSessionId(),
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
