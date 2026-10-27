import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

const guides = {
  garage: [
    { title: 'Szabadítsd ki az öt raklapot!', text: 'Válassz egy autót vagy raklapot, majd húzd el, vagy használd a nyilakat. Egy lépés egy mező. Az autók csak hosszirányban, a raklapok mind a négy irányba mozgathatók.' },
    { title: 'Egyetlen kijárat', text: 'A garázs alsó kijárata egy mező széles. Itt hozd ki mind az öt pénzes raklapot. A Garázs és a Platós Rolls gombbal az első szint két helyszíne között válthatsz.' },
    { title: 'Rakodás a platós Rollsra', text: 'A platón már egy Porsche és három raklap áll. Szabadítsd fel a két alsó, sárga rakodómező egyikét, majd válaszd a + jelet. Mind a nyolc raklapnak az első két sor jelölt helyein kell állnia.' },
  ],
  port: [
    { title: 'Két oldalról emelhető', text: 'Válassz egy raklapot. Kattints vagy koppints az egyik sárgával jelölt villanyílás melletti szabad mezőre: az üres béka odagurul. Innen az Emelés gombbal veheted fel. A másik két oldal zárt.' },
    { title: 'Hagyj helyet a forduláshoz!', text: 'Az emelt raklap csak előre-hátra mozgatható. A fordítógombokkal 90 fokot kanyarodhatsz, ha a célmező és a köztes sarok is szabad. A raklapot bárhol leteheted, majd újra megközelítheted.' },
    { title: 'Irány a konténer!', text: 'Mind a nyolc raklapot tedd a konténer jelölt helyeire, majd hozd ki az üres békát is. Ekkor indíthatod a hajót. Billentyűzet: nyilak a haladáshoz, Q és E a forduláshoz.' },
  ],
};

export default function HelpDialog({ chapter, onClose, returnFocus }: { chapter: keyof typeof guides; onClose: () => void; returnFocus: HTMLElement | null }) {
  const [page, setPage] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const dismiss = useRef<HTMLButtonElement>(null);
  const title = useId();
  const tips = guides[chapter];
  useEffect(() => {
    dismiss.current?.focus({ preventScroll: true });
    return () => { queueMicrotask(() => { if (!document.querySelector('[aria-modal="true"]') && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); }); };
  }, [returnFocus]);
  function onKeyDown(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    if (!buttons?.length) return;
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return createPortal(<div className="help-backdrop"><div ref={dialog} className="help-window" role="dialog" aria-modal="true" aria-labelledby={title} onKeyDown={onKeyDown}>
    <div className="help-topline"><span>JÁTÉKSZABÁLYOK · {page + 1} / {tips.length}</span><button ref={dismiss} aria-label="Súgó bezárása" onClick={onClose}>✕</button></div>
    <div className="help-copy" aria-live="polite"><span className="help-symbol" aria-hidden="true">{chapter === 'garage' ? '◇' : '↔'}</span><h2 id={title}>{tips[page].title}</h2><p>{tips[page].text}</p></div>
    <div className="help-navigation"><button disabled={page === 0} onClick={() => setPage(value => value - 1)}>← Előző tipp</button><button onClick={() => { if (page === tips.length - 1) onClose(); else setPage(value => value + 1); }}>{page === tips.length - 1 ? 'Rendben, jöhet a játék!' : 'Következő tipp →'}</button></div>
  </div></div>, document.body);
}
