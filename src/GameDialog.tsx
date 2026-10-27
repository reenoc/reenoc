import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export default function GameDialog({ title, eyebrow, children, onClose, returnFocus, completion = false }: {
  title: string; eyebrow?: string; children: ReactNode; onClose?: () => void;
  returnFocus?: HTMLElement | null; completion?: boolean;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = dialog.current?.querySelector<HTMLButtonElement>('[data-primary]') ?? dialog.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    target?.focus({ preventScroll: true });
    return () => { queueMicrotask(() => {
      if (!document.querySelector('[aria-modal="true"]') && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    }); };
  }, [returnFocus]);
  function handleKey(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Escape' && onClose) { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return createPortal(<div className="game-dialog-backdrop"><div ref={dialog} className={`game-dialog ${completion ? 'completion-dialog' : 'menu-dialog'}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={handleKey}>
    {onClose && <button className="dialog-close" aria-label="Menü bezárása" onClick={onClose}>✕</button>}
    {eyebrow && <span className="dialog-eyebrow">{eyebrow}</span>}
    {completion && <span className="completion-symbol" aria-hidden="true">✦</span>}
    <h2 id={titleId}>{title}</h2>
    {children}
  </div></div>, document.body);
}
