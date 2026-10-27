import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createGame, levels, load, loadingPlaces, move, securedCount, truckCount, won, type Direction, type Game, type LevelId, type Piece, type Scene } from './game';
import { CarArt, PalletArt, RollsTruckArt } from './PieceArt';
import PortGame from './PortGame';
import StoryDialog from './StoryDialog';
import HelpDialog from './HelpDialog';
import GameDialog from './GameDialog';

const arrows: Record<Direction, string> = { up: '↑', left: '←', down: '↓', right: '→' };
const names: Record<Direction, string> = { up: 'Fel', left: 'Balra', down: 'Le', right: 'Jobbra' };
const badges: Record<string, string> = { porsche: '911', ferrari: 'F8', limousine: 'PHANTOM', lambo: 'AVENTADOR', aston: 'DB11', mercedes: 'G63', rolls: 'BENTAYGA', range: 'RANGE ROVER', maserati: 'MC20', 'porsche-truck': '911' };

export default function App() {
  const [history, setHistory] = useState<Game[]>(() => [createGame()]);
  const [scene, setScene] = useState<Scene>('garage');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('Öt raklapot kell kivinned. Az utat kilenc autó zárja el.');
  const [showHelp, setShowHelp] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(true);
  const [portSession, setPortSession] = useState<Piece[] | null>(null);
  const inPort = portSession !== null;
  const board = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const helpTrigger = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ x: number; y: number; id: string; pointerId: number; axis: 'horizontal' | 'vertical' | 'both' } | null>(null);
  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const preventBoardScroll = (event: TouchEvent) => { if (event.cancelable) event.preventDefault(); };
    element.addEventListener('touchstart', preventBoardScroll, { passive: false });
    element.addEventListener('touchmove', preventBoardScroll, { passive: false });
    return () => { element.removeEventListener('touchstart', preventBoardScroll); element.removeEventListener('touchmove', preventBoardScroll); };
  }, [inPort]);
  const game = history[history.length - 1];
  const active = game[scene].find((piece) => piece.id === selected);
  const available = loadingPlaces(game);
  const canLoad = game.queue.length > 0 && available.length > 0;
  const completed = won(game);
  const out = 5 - game.garage.filter((piece) => piece.kind === 'cash').length;
  const garageCleared = scene === 'garage' && out === 5 && !completed;
  const loadingInfo = !game.queue.length
    ? 'Előbb hozz ki egy raklapot a garázsból. A platón lévő hármat már átrendezheted.'
    : !available.length
      ? 'A két sárga rakodóhely foglalt. Mozgasd el róluk a raklapokat.'
      : 'Válaszd a sárga + jelet, majd told a raklapot az első két sor egyik jelölt helyére.';
  function commit(next: Game) { if (next !== game) setHistory((previous) => [...previous, next]); }
  function step(direction: Direction, id = selected) {
    if (!id) return;
    const next = move(game, scene, id, direction);
    if (next === game) { setMessage('Az út zárva. Előbb mozdíts el egy másik autót vagy raklapot.'); return; }
    if (next.queue.length > game.queue.length) { setMessage('Raklap a garázs előtt! Válts a Platós Rolls nézetre a felrakodáshoz.'); setSelected(null); }
    else setMessage(scene === 'truck' ? 'Rendezd mind a nyolc raklapot a plató első két sorába.' : 'Keress helyet a következő autónak. A kijárat csak egy mező széles.');
    commit(next);
  }
  function handleLoad(column?: number) {
    const next = load(game, column);
    if (next === game) { setMessage(loadingInfo); return; }
    commit(next); setSelected(game.queue[0].id);
    setMessage('Felrakva! Told a raklapot az első két sor egyik jelölt helyére.');
  }
  function switchScene(next: Scene) {
    gesture.current = null; setScene(next); setSelected(null);
    setMessage(next === 'truck' ? loadingInfo : 'Öt raklap, kilenc autó, egyetlen keskeny kijárat.');
  }
  function restart(nextLevel: LevelId = game.level) {
    gesture.current = null; setHistory([createGame(nextLevel)]); setScene('garage'); setSelected(null);
    setMessage('Új próbálkozás. Nyisd meg a kijáratot, majd rendezd el mind a nyolc raklapot.');
  }
  function startPort() {
    if (!won(game)) return;
    gesture.current = null;
    window.scrollTo(0, 0);
    setPortSession(game.truck.filter(piece => piece.kind === 'cash'));
  }
  function onKeyDown(event: KeyboardEvent) {
    if (storyOpen || showHelp || menuOpen || completed || garageCleared) return;
    const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (keys[event.key] && selected) { event.preventDefault(); step(keys[event.key]); }
  }
  if (portSession) return <PortGame cargo={portSession} campaignMoves={game.moves} />;
  const occupied = (x: number, y: number) => game.truck.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  return <div className={`game-shell focused-play ${completed ? 'is-complete' : ''}`} onKeyDown={onKeyDown} inert={storyOpen || showHelp || menuOpen || completed || garageCleared}>
    {storyOpen && <StoryDialog chapter="garage" returnFocus={menuTrigger.current} onClose={() => setStoryOpen(false)} />}
    {showHelp && <HelpDialog chapter="garage" returnFocus={helpTrigger.current} onClose={() => setShowHelp(false)} />}
    {menuOpen && <GameDialog title="Játékmenü" eyebrow="1. SZINT · GARÁZS ÉS PLATÓ" returnFocus={menuTrigger.current} onClose={() => setMenuOpen(false)}>
      <p>Hozd ki az öt raklapot, majd rendezd el mind a nyolcat a platón.</p>
      <div className="menu-actions"><button onClick={() => { setMenuOpen(false); setStoryOpen(true); }}>Történet</button><button onClick={() => { setMenuOpen(false); setShowHelp(true); }}>Játékszabályok</button></div>
      <fieldset className="difficulty-picker"><legend>Nehézség</legend><div className="level-buttons">{levels.map(item => <button key={item.id} aria-pressed={game.level === item.id} onClick={() => { restart(item.id as LevelId); setMenuOpen(false); }}>{item.id === 'hard' ? 'Nehéz' : 'Profi'}</button>)}</div><small>A nehézség módosításakor a szint újraindul.</small></fieldset>
      <button className="dialog-primary" data-primary onClick={() => setMenuOpen(false)}>Folytatás →</button>
    </GameDialog>}
    {garageCleared && <GameDialog title="A garázs kész!" eyebrow="MIND AZ ÖT RAKLAP KINT VAN" completion>
      <p>Következik a platós Rolls megrakása. Rendezd mind a nyolc raklapot a helyére!</p>
      <button className="dialog-primary" data-primary onClick={() => switchScene('truck')}>Tovább a rakodáshoz →</button>
    </GameDialog>}
    {completed && <GameDialog title="Ádám indulhat!" eyebrow="1. SZINT TELJESÍTVE" completion>
      <p>Mind a nyolc raklap a helyén. Irány a kikötő!</p><div className="completion-score">{game.moves}<small>lépés</small></div>
      <button className="dialog-primary" data-primary onClick={startPort}>Tovább a kikötőbe →</button>
    </GameDialog>}
    <header className="topbar"><div className="brand"><span className="brand-mark" aria-hidden="true">M<span>//</span></span><div><strong>MTCSY</strong><span>1. SZINT · {scene === 'garage' ? 'GARÁZS' : 'PLATÓS ROLLS'}</span></div></div><div className="play-progress" aria-label="Játékállás"><span title="Garázsból kijuttatva">{out}<small>/5</small></span><span title="A platón elrendezve">{securedCount(game)}<small>/8</small></span><strong title="Lépések">{game.moves.toString().padStart(2, '0')}</strong></div><div className="header-actions"><button ref={menuTrigger} className="story-replay" onClick={() => setMenuOpen(true)}>Menü</button><button ref={helpTrigger} className="icon-button" aria-label="Játékszabályok" aria-expanded={showHelp} onClick={() => setShowHelp(!showHelp)}>?</button></div></header>
    <main className="play-layout"><section className="mission-overview">
      <h1 className="sr-only">Luxusba zárt vagyon.</h1><p className="sr-only">1. szint · Garázs és plató</p>
      <div className="scene-tabs" role="group" aria-label="Helyszín"><button aria-pressed={scene === 'garage'} onClick={() => switchScene('garage')}>Garázs <small>9 AUTÓ</small></button><button aria-pressed={scene === 'truck'} onClick={() => switchScene('truck')}>Platós Rolls {game.queue.length > 0 && <b>{game.queue.length}</b>}</button></div>

      </section><section className="play-stage">
      <section className={`scene ${scene}`} aria-label={scene === 'garage' ? 'Garázs játéktér' : 'Platós Rolls játéktere'}>
        <div className="scene-label"><span>{scene === 'garage' ? 'PRIVÁT GARÁZS' : 'NYOLC JELÖLT RAKLAPHELY'}</span><span>{scene === 'garage' ? '↓ SZŰK KIJÁRAT' : '↓ RAKODÁS ALUL'}</span></div>
        {scene === 'truck' && <div className="truck-cab"><RollsTruckArt /></div>}
        <div ref={board} className={`board ${scene}`} role="group" aria-label={scene === 'garage' ? 'Garázs, 6 × 6 mező' : 'Plató, 4 × 4 mező'}>
          {scene === 'truck' && Array.from({ length: 8 }, (_, i) => ({ x: i % 4, y: Math.floor(i / 4) })).filter(p => !occupied(p.x, p.y)).map(p => <span key={`dock-${p.x}-${p.y}`} className="dock-cell" style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }} aria-hidden="true">◇<small>HELY</small></span>)}
          {scene === 'truck' && available.map(x => <button key={`load-${x}`} className="loading-cell" style={{ gridColumn: x + 1, gridRow: 4 }} disabled={!game.queue.length} aria-label={`Felrakás a ${x === 1 ? 'bal' : 'jobb'} oldali rakodóhelyre`} onPointerUp={() => handleLoad(x)} onClick={event => { if (event.detail === 0) handleLoad(x); }}><strong>+</strong><small>FELRAKÁS</small></button>)}
          {game[scene].map(piece => <button key={piece.id} className={`piece ${piece.kind} ${piece.color} ${piece.h > piece.w ? 'vertical' : ''} ${selected === piece.id ? 'selected' : ''} ${scene === 'truck' && piece.kind === 'cash' && piece.y === 3 && (piece.x === 1 || piece.x === 2) ? 'at-gate' : ''}`} style={{ gridColumn: `${piece.x + 1} / span ${piece.w}`, gridRow: `${piece.y + 1} / span ${piece.h}` }} aria-label={`${piece.label}, ${piece.y + 1}. sor, ${piece.x + 1}. oszlop`} aria-pressed={selected === piece.id} onClick={() => setSelected(piece.id)}
            onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; gesture.current = { x: event.clientX, y: event.clientY, id: piece.id, pointerId: event.pointerId, axis: piece.axis }; event.currentTarget.setPointerCapture?.(event.pointerId); setSelected(piece.id); }}
            onPointerMove={event => { if (gesture.current?.pointerId === event.pointerId && event.cancelable) event.preventDefault(); }}
            onPointerCancel={event => { if (gesture.current?.pointerId === event.pointerId) gesture.current = null; }}
            onLostPointerCapture={event => { if (gesture.current?.pointerId === event.pointerId) gesture.current = null; }}
            onPointerUp={event => { const start = gesture.current; if (!start || start.pointerId !== event.pointerId) return; gesture.current = null; const dx = event.clientX - start.x, dy = event.clientY - start.y; const horizontal = start.axis === 'horizontal' || (start.axis === 'both' && Math.abs(dx) > Math.abs(dy)); if (Math.abs(horizontal ? dx : dy) < 18) return; step(horizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), start.id); }}>
            {piece.kind === 'cash' ? <><PalletArt /><span className="pallet-number">{piece.id.startsWith('truck') ? `E${piece.id.split('-')[1]}` : `0${piece.id.split('-')[1]}`}</span></> : <><CarArt model={piece.id} color={piece.color} vertical={piece.h > piece.w} /><span className="model-badge">{badges[piece.id]}</span></>}
          </button>)}
        </div>
        <div className="gate"><span>▾</span>{scene === 'garage' ? 'KIJÁRAT' : 'RAKODÁS'}<span>▾</span></div>
      </section>
      <div className="queue-line"><span className="queue-icon" aria-hidden="true">▤</span><span><strong>{game.queue.length} raklap</strong> kint • <strong>{securedCount(game)} / 8</strong> elrendezve</span></div>
      </section><section className="mission-controls">
      {!completed && <>
      {scene === 'truck' && <section className={`loading-panel ${canLoad ? 'ready' : ''}`} aria-label="Felrakodás"><div className="loading-heading"><span className="incoming-art"><PalletArt /></span><div><strong>{game.queue.length ? `${game.queue.length} raklap vár felrakásra` : 'Platós Rolls'}</strong><small>{truckCount(game)} / 8 raklap a platón • {securedCount(game)} a helyén</small></div></div><p>{loadingInfo}</p><button className="load-button" disabled={!canLoad} aria-disabled={!canLoad} onClick={() => handleLoad()}>{canLoad ? 'Következő raklap felrakása' : game.queue.length ? 'Rakodóhelyek foglaltak' : 'Még nincs kint raklap'}<span>{canLoad ? '↑' : '○'}</span></button></section>}
      <section className="controls" aria-label="Mozgatás"><div className="selection"><span>KIVÁLASZTVA</span><strong>{active?.label ?? 'Válassz egy elemet'}</strong><small>{active ? active.kind === 'cash' ? 'Mozgatható négy irányban' : 'Csak hosszirányban mozog' : 'Húzd el, vagy használd a nyilakat'}</small></div><div className="dpad">{(['up', 'left', 'down', 'right'] as const).map(direction => <button key={direction} className={direction} aria-label={names[direction]} disabled={!active || move(game, scene, active.id, direction) === game} onClick={() => step(direction)}>{arrows[direction]}</button>)}</div></section>
      <p className="message" role="status">{message}</p><div className="bottom-actions"><button disabled={history.length < 2} onClick={() => { gesture.current = null; setHistory(previous => previous.slice(0, -1)); setMessage('Az utolsó lépést visszavontad.'); }}>↶ Visszavonás</button><button onClick={() => restart()}>↻ Újrakezdés</button></div></>}
    </section></main><footer>MTCSY <span>GOLDEN GARAGE • GONDOLKOZZ ELŐRE</span></footer>
  </div>;
}
