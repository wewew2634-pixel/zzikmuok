/**
 * Analytics event tracking for P1 Banner & Guideline
 */

export interface BannerShowPayload {
  id: string;
  kind: string;
  place: string;
}

export interface BannerClickPayload {
  id: string;
  label: string;
}

export const Analytics = {
  banner_show: (payload: BannerShowPayload) => {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'banner_show', {
        event_category: 'engagement',
        event_label: payload.id,
        banner_kind: payload.kind,
        banner_place: payload.place
      });
    }
    console.log('[Analytics] banner_show', payload);
  },
  
  banner_click: (payload: BannerClickPayload) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'banner_click', {
        event_category: 'engagement',
        event_label: payload.id,
        button_label: payload.label
      });
    }
    console.log('[Analytics] banner_click', payload);
  },
  
  guideline_open: (origin: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'guideline_open', {
        event_category: 'engagement',
        event_label: origin
      });
    }
    console.log('[Analytics] guideline_open', {origin});
  },
  
  guideline_ack: (origin: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'guideline_ack', {
        event_category: 'engagement',
        event_label: origin
      });
    }
    console.log('[Analytics] guideline_ack', {origin});
  },
};
