import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CarArt, PalletArt } from './PieceArt';
import { type Direction, type Piece } from './game';
import StoryDialog, { type StoryChapter } from './StoryDialog';
import { CLOCKWISE, PORT_HEIGHT, PORT_WIDTH, canLift, createPort, dispatchPort, entrySides, isContainer, isPortFloor, isPortGoal, liftPort, lowerPort, movePort, portDocked, portReady, turnPort, walkPort, type PortState } from './port';

const arrows: Record<Direction, string> = { up: '↑', right: '→', down: '↓', left: '←' };
const names: Record<Direction, string> = { up: 'Fel', right: 'Jobbra', down: 'Le', left: 'Balra' };
export function JackArt({ facing, loaded }: { facing: Direction; loaded: boolean }) {
  return <svg className="jack-art" viewBox="0 0 100 100" aria-hidden="true"><g transform={`rotate(${CLOCKWISE.indexOf(facing) * 90} 50 50)`}>
    <path d="M28 48 V5 Q28 1 35 1 H39 V51 M61 51 V1 H65 Q72 1 72 5 V48" fill={loaded ? '#ffe79a' : '#e3b649'} stroke="#624717" strokeWidth="2" />
    <path d="M30 7 H37 M63 7 H70 M29 17 H38 M62 17 H71" stroke="#fff4b8" strokeWidth="2" />
    <path d="M25 45 Q50 33 75 45 L69 67 Q50 78 31 67 Z" fill="#dca32f" stroke="#624717" strokeWidth="2" />
    <rect x="26" y="47" width="9" height="14" rx="3" fill="#1a272b" /><rect x="65" y="47" width="9" height="14" rx="3" fill="#1a272b" />
    <ellipse cx="50" cy="57" rx="13" ry="12" fill="#f4d373" stroke="#8a641e" strokeWidth="3" />
    <path d="M50 59 V82" stroke="#111e25" strokeWidth="7" /><path d="M34 80 Q50 73 66 80 V92 Q50 97 34 92 Z" fill="none" stroke="#12202a" strokeWidth="7" /><path d="M39 80 Q50 77 61 80" fill="none" stroke="#a6b6ba" strokeWidth="2" />
  </g></svg>;
}
function ShipArt() {
  return <svg viewBox="0 0 320 110" className="ship-art" aria-hidden="true"><path d="M13 71 H306 L278 98 H51 Z" fill="#194956" stroke="#6db1bd" strokeWidth="2" /><path d="M25 101 Q55 94 85 101 T145 101 T205 101 T265 101 T315 101" fill="none" stroke="#7dd1d9" strokeWidth="2" /><path d="M236 27 H271 V71 H231 Z" fill="#e8dcc2" /><path d="M246 11 H253 V30" stroke="#cab381" strokeWidth="5" /><path d="M242 34 H266 V43 H242 Z" fill="#305b68" /><path d="M19 47 H68 V70 H19 Z M72 47 H121 V70 H72 Z M125 47 H174 V70 H125 Z M178 47 H226 V70 H178 Z" fill="#b18e44" stroke="#f1cf77" /><path d="M45 22 H94 V44 H45 Z M98 22 H147 V44 H98 Z M151 22 H200 V44 H151 Z" fill="#55877c" stroke="#a7c4a2" /><text x="137" y="88" fill="#f4df9d" textAnchor="middle" fontSize="9" letterSpacing="3">DUBAI BOUND</text></svg>;
}

export default function PortGame({ cargo, campaignMoves = 0 }: { cargo?: Piece[]; campaignMoves?: number }) {
  const [history, setHistory] = useState<PortState[]>(() => [createPort(cargo)]);
  const [selected, setSelected] = useState(() => createPort(cargo).pallets[3].id);
  const [message, setMessage] = useState('Az üres békával koppints egy szabad mezőre. A raklapot csak a jelölt két oldal felől emelheted.');
  const [help, setHelp] = useState(false);
  const [story, setStory] = useState<StoryChapter | null>('port');
  const board = useRef<HTMLDivElement>(null);
  const storyTrigger = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ x: number; y: number; pointer: number } | null>(null);
  const state = history[history.length - 1];
  const active = state.pallets.find(p => p.id === (state.carrying ?? selected));
  const docked = portDocked(state), ready = portReady(state);
  const sides = active && !state.carrying ? entrySides(active) : [];
  useEffect(() => {
    const element = board.current; if (!element) return;
    const prevent = (event: TouchEvent) => { if (event.cancelable) event.preventDefault(); };
    element.addEventListener('touchstart', prevent, { passive: false }); element.addEventListener('touchmove', prevent, { passive: false });
    return () => { element.removeEventListener('touchstart', prevent); element.removeEventListener('touchmove', prevent); };
  }, []);
  function commit(next: PortState, success: string, failure: string) {
    if (next === state) { setMessage(failure); return; }
    setHistory(previous => next.dispatched ? [next] : [...previous, next]); setMessage(success);
    if (next.dispatched && !state.dispatched) setStory('ending');
  }
  function step(direction: Direction) {
    commit(movePort(state, direction), state.carrying ? 'A béka és a raklap együtt mozog. Fordulni csak szabad sarokban lehet.' : 'Keresd meg a raklap jelölt villanyílását.', state.carrying ? 'Az emelt raklap csak előre vagy hátra haladhat. Oldalirányhoz előbb fordítsd a békát.' : 'Ezt az utat fal, autó vagy raklap zárja el.');
  }
  function turn(direction: 'left' | 'right') { commit(turnPort(state, direction), 'Elfordult a béka. A raklap villanyílásai vele fordulnak.', 'Nincs elég hely a fordulóhoz: a raklap új helyének és a köztes saroknak is szabadnak kell lennie.'); }
  function handleLift() {
    if (state.carrying) { commit(lowerPort(state), 'Raklap letéve. Most az üres békával körbejárhatod és másik használható oldalról is felveheted.', 'Nincs emelt raklap.'); return; }
    if (!active) return;
    commit(liftPort(state, active.id), 'Felemelve! Előre-hátra gurulhatsz; kanyarodni csak szabad 2 × 2 helyen lehet.', 'Erről a helyről nem tudsz alányúlni. A békával állj a sárgával jelölt két villanyílás egyikéhez.');
  }
  function inspect(id: string) {
    if (state.dispatched) return;
    if (state.carrying) { setMessage('Előbb tedd le az emelt raklapot, mielőtt másikat választasz.'); return; }
    setSelected(id); const p = state.pallets.find(p => p.id === id)!;
    setMessage(p.entry === 'horizontal' ? 'Ennek a raklapnak balról és jobbról van villanyílása. Felülről és alulról zárt.' : 'Ennek a raklapnak felül és alul van villanyílása. Balról és jobbról zárt.');
  }
  function onKeyDown(event: KeyboardEvent) {
    if (story || state.dispatched) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };
    if (keys[event.key]) { event.preventDefault(); step(keys[event.key]); }
    else if (event.key.toLowerCase() === 'q') { event.preventDefault(); turn('left'); }
    else if (event.key.toLowerCase() === 'e') { event.preventDefault(); turn('right'); }
  }
  function reset() { const fresh = createPort(cargo); gesture.current = null; setHistory([fresh]); setSelected(fresh.pallets[3].id); setMessage('Új kirakodás. A sorrend és a szabadon hagyott fordulók döntik el, sikerül-e.'); }
  return <div className="game-shell port-shell" onKeyDown={onKeyDown} inert={story !== null}>
    {story && <StoryDialog key={story} chapter={story} returnFocus={storyTrigger.current} onClose={() => setStory(null)} />}
    <header className="topbar"><div className="brand"><span className="brand-mark" aria-hidden="true">M<span>//</span></span><div><strong>MTCSY</strong><span>PORT OF GOLD</span></div></div><div className="header-actions"><button ref={storyTrigger} className="story-replay" onClick={() => setStory(state.dispatched ? 'ending' : 'port')}>Történet</button><button className="icon-button" aria-label="Kikötői szabályok" aria-expanded={help} onClick={() => setHelp(!help)}>?</button></div></header>
    <main>
      <div className="port-route"><span>01 Garázs ✓</span><b>→</b><strong>02 Kikötő</strong><b>→</b><span>Dubaj</span></div>
      <div className="level-line"><span className="level-tag">2. SZINT / KIKÖTŐ</span><span className="difficulty"><i /><i /><i /> KÉT OLDAL</span></div>
      <h1>Irány Dubaj.</h1><p className="intro">2. szint · Nyolc aranyraklap. Egy béka. Két villanyílás.</p>
      <div className="port-brief"><strong>Csak két oldalról férsz alá.</strong><p>Emeld a jelölt oldalról. Forduláshoz hagyj szabad sarkot.</p></div>
      {help && <section className="help"><h2>Hogyan pakolj ki?</h2><p>Üres béka: koppints egy elérhető szabad mezőre, és odagurul. A nyilakkal vagy a béka húzásával egy mezőt léphetsz.</p><p>A raklap szélén két sárga villanyílás látszik. A békával ezek egyikéhez kell állnod, majd az Emelés gombra koppintanod. A másik két oldalról nem emelhető.</p><p>Felemelt raklappal csak előre-hátra mozoghatsz. A két fordítógomb 90 fokot kanyarít: a célmező és a köztes sarok is legyen szabad. A villanyílások a raklappal együtt fordulnak.</p><p>Bárhol leteheted a pénzt, így átmenetileg félre is állíthatod. A hajóhoz mind a nyolc raklapot a konténer arany célmezőire kell tenned, majd az üres békát is ki kell hoznod.</p><p>Billentyűzet: nyilak a haladáshoz, Q / E a két forduláshoz. A visszavonás minden mozdulatot, emelést és letételt visszaléptet.</p><button className="text-button" onClick={() => setHelp(false)}>Indulhat a kirakodás</button></section>}
      <div className="stats" aria-label="Kikötői játékállás"><div><span>KONTÉNERBEN</span><strong>{docked}<small>/8</small></strong></div><div><span>BÉKA</span><strong className="jack-status">{state.carrying ? 'EMELVE' : 'ÜRES'}</strong></div><div><span>LÉPÉSEK</span><strong>{state.moves.toString().padStart(2, '0')}</strong></div></div>
      <div className="port-destination"><span>ADAM LOGISTICS</span><strong>DXB / DUBAI</strong><span>8 GOLD PALLETS</span></div>
      <div className="port-board" ref={board} role="group" aria-label="Kikötő, 8 × 10 mező">
        {Array.from({ length: PORT_WIDTH * PORT_HEIGHT }, (_, i) => ({ x: i % PORT_WIDTH, y: Math.floor(i / PORT_WIDTH) })).map(({ x, y }) => {
          const floor = isPortFloor(x, y), p = state.pallets.find(p => p.x === x && p.y === y), jackHere = state.jack.x === x && state.jack.y === y;
          const entry = sides.some(s => s.x === x && s.y === y);
          return floor && !p && !jackHere
            ? <button key={iKey(x, y)} className={`port-floor ${isContainer(x, y) ? 'container-floor' : ''} ${isPortGoal(x, y) ? 'port-goal' : ''} ${x < 4 && y >= 6 ? 'truck-floor' : ''} ${entry ? 'entry-cell' : ''}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} tabIndex={-1} aria-label={`Béka ide: ${y + 1}. sor, ${x + 1}. oszlop`} disabled={state.dispatched} onPointerUp={event => { if (event.button === 0) commit(walkPort(state, x, y), 'A béka a kiválasztott helyre gurult.', 'Ide most nincs szabad út. Emelt raklappal a nyilakat és a fordítógombokat használd.'); }} onClick={event => { if (event.detail === 0) commit(walkPort(state, x, y), 'A béka a kiválasztott helyre gurult.', 'Ide most nincs szabad út.'); }}>{isPortGoal(x, y) ? <span aria-hidden="true">◇</span> : entry ? <span aria-hidden="true">⌁</span> : null}</button>
            : <span key={iKey(x, y)} className={`port-ground ${!floor ? (x === 3 && y < 4 || y === 3 ? 'container-wall' : 'port-obstacle') : ''} ${isContainer(x, y) && floor ? 'container-floor' : ''} ${isPortGoal(x, y) ? 'port-goal' : ''} ${x < 4 && y >= 6 && floor ? 'truck-floor' : ''}`} style={{ gridColumn: x + 1, gridRow: y + 1 }} aria-hidden="true" />;
        })}
        <span className="port-truck-front" aria-hidden="true">ÁDÁM · PLATÓ</span>
        <span className="port-porsche" aria-hidden="true"><CarArt model="porsche-truck" color="blue" vertical={false} /></span>
        {state.pallets.map(p => <button key={p.id} data-pallet-number={p.number} className={`port-pallet ${active?.id === p.id ? 'selected' : ''} ${state.carrying === p.id ? 'carried' : ''}`} data-entry={p.entry} style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }} aria-label={`Raklap ${p.number}, ${p.entry === 'horizontal' ? 'bal és jobb' : 'felső és alsó'} villanyílás, ${p.y + 1}. sor, ${p.x + 1}. oszlop`} aria-pressed={active?.id === p.id} disabled={state.dispatched} onPointerUp={event => { if (event.button === 0) inspect(p.id); }} onClick={event => { if (event.detail === 0) inspect(p.id); }}><PalletArt /><b className="port-pallet-number">{p.number.toString().padStart(2, '0')}</b><span className="fork-face first" aria-hidden="true" /><span className="fork-face second" aria-hidden="true" /></button>)}
        <button className={`port-jack ${state.carrying ? 'loaded' : ''}`} style={{ gridColumn: state.jack.x + 1, gridRow: state.jack.y + 1 }} aria-label={`Béka, ${state.carrying ? 'emelt raklappal' : 'üres'}, ${state.jack.y + 1}. sor, ${state.jack.x + 1}. oszlop`} disabled={state.dispatched}
          onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; gesture.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId }; event.currentTarget.setPointerCapture?.(event.pointerId); }}
          onPointerCancel={() => { gesture.current = null; }} onLostPointerCapture={() => { gesture.current = null; }}
          onPointerUp={event => { const start = gesture.current; gesture.current = null; if (!start || start.pointer !== event.pointerId) return; const dx = event.clientX - start.x, dy = event.clientY - start.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return; step(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up'); }}><JackArt facing={state.jack.facing} loaded={!!state.carrying} /></button>
      </div>
      <div className="port-legend"><span><i className="entry-key" /> Két villanyílás</span><span><i className="goal-key" /> Konténer célmező</span><span>↑ KONTÉNER · PLATÓ ↓</span></div>
      {!state.dispatched && <><section className="port-controls" aria-label="Béka vezérlése"><div className="port-selection"><span>{state.carrying ? 'EMELT RAKLAP' : 'KIVÁLASZTVA'}</span><strong>{active ? `Aranyraklap ${active.number.toString().padStart(2, '0')}` : 'Válassz raklapot'}</strong><small>{active ? active.entry === 'horizontal' ? '↔ Balról / jobbról emelhető' : '↕ Felülről / alulról emelhető' : 'Két jelölt oldala van'}</small><button className="port-lift" disabled={!state.carrying && (!active || !canLift(state, active.id))} onClick={handleLift}>{state.carrying ? '↓ Raklap letétele' : '↑ Raklap emelése'}</button></div><div className="dpad port-dpad">{(['up', 'left', 'down', 'right'] as const).map(d => <button key={d} className={d} aria-label={`Béka ${names[d].toLowerCase()}`} disabled={movePort(state, d) === state} onClick={() => step(d)}>{arrows[d]}</button>)}</div></section><div className="port-steering"><button disabled={turnPort(state, 'left') === state} onClick={() => turn('left')} aria-label="Fordítás balra">↶ Fordítás</button><p>Emelve csak előre-hátra.<br />A kanyarhoz szabad sarok kell.</p><button disabled={turnPort(state, 'right') === state} onClick={() => turn('right')} aria-label="Fordítás jobbra">Fordítás ↷</button></div><p className="message" role="status">{docked === 8 && !ready ? 'Minden raklap a helyén. Most az üres békát is hozd ki a konténerből!' : message}</p></>}
      {docked === 8 && !state.dispatched && <section className="port-ready"><h2>{ready ? 'Lezárható a konténer.' : 'A rakomány bent van.'}</h2><p>{ready ? 'Mind a nyolc raklap letéve, a béka kint. A hajó készen áll a dubaji útra.' : 'Előbb tedd le a raklapot, és hozd ki a békát az ajtón.'}</p><button disabled={!ready} onClick={() => commit(dispatchPort(state), 'A konténer lezárva. Indulás Dubajba!', 'Előbb fejezd be a rakodást.')}>Konténer lezárása · Indulás Dubajba →</button></section>}
      {state.dispatched && <section className="success port-success" role="status"><ShipArt /><h2>Úton Dubajba!</h2><p>Mind a nyolc aranyraklap a lezárt konténerben. A kirakodást {state.moves - 1} lépésből oldottad meg.{` A teljes fuvar ${campaignMoves + state.moves} lépés volt.`}</p><p><strong>Mindkét szint teljesítve. A nagy fuvar vége.</strong></p></section>}
      {!state.dispatched && <div className="bottom-actions"><button disabled={history.length < 2} onClick={() => { gesture.current = null; setHistory(previous => previous.slice(0, -1)); setMessage('Az utolsó mozdulatot visszavontad.'); }}>↶ Visszavonás</button><button onClick={reset}>↻ Kikötő újrakezdése</button></div>}
    </main><footer>MTCSY <span>PORT OF GOLD · NEXT STOP DUBAI</span></footer>
  </div>;
}
const iKey = (x: number, y: number) => `${x}:${y}`;
