import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Locale } from './locale';

interface MotionState {
  paused: boolean;
  reduced: boolean;
  toggle: () => void;
}

const MotionContext = createContext<MotionState | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [manualPause, setManualPause] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return <MotionContext.Provider value={{ paused: reduced || manualPause, reduced, toggle: () => setManualPause((value) => !value) }}>{children}</MotionContext.Provider>;
}

export function useMotion() {
  const context = useContext(MotionContext);
  if (!context) throw new Error('Motion controls must be rendered inside MotionProvider.');
  return context;
}

export function MotionControl({ locale }: { locale: Locale }) {
  const { paused, reduced, toggle } = useMotion();
  const label = reduced
    ? (locale === 'he' ? 'הפחתת תנועה פעילה במכשיר' : 'Device reduced motion enabled')
    : paused ? (locale === 'he' ? 'הפעלת תנועה' : 'Resume motion') : (locale === 'he' ? 'עצירת תנועה' : 'Pause motion');
  return <button className="motion-control" onClick={toggle} aria-pressed={paused} disabled={reduced} title={label}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">{paused ? <path d="m4 2 6 4-6 4Z" fill="currentColor" /> : <path d="M4 2v8m4-8v8" stroke="currentColor" strokeWidth="1.4" />}</svg>
    <span>{label}</span>
  </button>;
}
