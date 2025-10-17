'use client';
import React, {createContext, useContext, useMemo, useState, useCallback} from 'react';
import clsx from 'clsx';

export type BannerKind = 'info'|'success'|'warning'|'error'|'progress';
export type BannerBtn = {label: string; onClick: () => void; variant?: 'primary'|'ghost'};
export type Banner = {
  id: string; kind: BannerKind; title: string; body?: string;
  sticky?: boolean; ttlMs?: number; actions?: BannerBtn[];
};

type Ctx = {
  list: Banner[];
  push: (b: Banner) => void;
  replace: (b: Banner) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};
const BannerCtx = createContext<Ctx | null>(null);

export function useBanner() {
  const ctx = useContext(BannerCtx);
  if (!ctx) throw new Error('useBanner must be used inside <BannerProvider/>');
  return ctx;
}

export function BannerProvider({children}:{children: React.ReactNode}) {
  const [list, setList] = useState<Banner[]>([]);

  const dismiss = useCallback((id: string) => setList(x => x.filter(b => b.id !== id)), []);
  const clear   = useCallback(() => setList([]), []);
  const push    = useCallback((b: Banner) => {
    setList(x => x.some(it => it.id === b.id) ? x : [...x, b]);
    if (b.ttlMs && !b.sticky) setTimeout(() => dismiss(b.id), b.ttlMs);
  }, [dismiss]);
  const replace = useCallback((b: Banner) => setList(x => [b, ...x.filter(it => it.id !== b.id)]), []);

  const value = useMemo<Ctx>(() => ({list, push, replace, dismiss, clear}), [list, push, replace, dismiss, clear]);

  return (
    <BannerCtx.Provider value={value}>
      <div aria-live="polite" className="sticky top-0 z-50">
        {list.slice(0,1).map(b => (  // 한 번에 1개만 노출(스팸 방지)
          <div key={b.id} role="region" aria-label="알림 배너"
               className={clsx(
                 'mx-auto max-w-xl rounded-2xl p-4 mt-2 shadow-lg border',
                 b.kind==='success'  && 'bg-emerald-900/40 border-emerald-700 text-emerald-50',
                 b.kind==='info'     && 'bg-sky-900/40 border-sky-700 text-sky-50',
                 b.kind==='warning'  && 'bg-amber-900/40 border-amber-700 text-amber-50',
                 b.kind==='error'    && 'bg-rose-900/40 border-rose-700 text-rose-50',
                 b.kind==='progress' && 'bg-neutral-800/70 border-neutral-700 text-neutral-100'
               )}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{b.title}</p>
                {b.body && <p className="text-xs opacity-80 mt-0.5">{b.body}</p>}
                {b.kind==='progress' && <div className="mt-2 h-1.5 bg-neutral-700 rounded-full">
                  <div className="h-1.5 bg-orange-400 rounded-full animate-pulse" style={{width:'66%'}}/>
                </div>}
                {b.actions?.length ? (
                  <div className="mt-3 flex gap-2">
                    {b.actions.map((a,i)=>(
                      <button key={i}
                        className={clsx('h-9 px-3 rounded-xl text-sm',
                          a.variant==='ghost' ? 'bg-transparent border border-current/30'
                                              : 'bg-orange-500 text-white')}
                        onClick={a.onClick}>{a.label}</button>
                    ))}
                  </div>
                ):null}
              </div>
              {!b.sticky && (
                <button aria-label="배너 닫기"
                        className="opacity-70 hover:opacity-100"
                        onClick={() => dismiss(b.id)}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {children}
    </BannerCtx.Provider>
  );
}
