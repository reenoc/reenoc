import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createGame, getLevel, levels, load, loadingPlaces, move, securedCount, truckCount, won, type Direction, type Game, type LevelId, type Piece, type Scene } from './game';
import { CarArt, PalletArt } from './PieceArt';
import PortGame from './PortGame';

const arrows: Record<Direction, string> = { up: '↑', left: '←', down: '↓', right: '→' };
const names: Record<Direction, string> = { up: 'Fel', left: 'Balra', down: 'Le', right: 'Jobbra' };
const badges: Record<string, string> = { porsche: '911', ferrari: 'F8', limousine: 'PHANTOM', lambo: 'AVENTADOR', aston: 'DB11', mercedes: 'G63', rolls: 'BENTAYGA', range: 'RANGE ROVER', maserati: 'MC20', 'porsche-truck': '911' };

export default function App() {
  const [history, setHistory] = useState<Game[]>(() => [createGame()]);
  const [scene, setScene] = useState<Scene>('garage');
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('Kilenc autó zárja el az utat. Előbb nyisd meg a szűk kijáratot.');
  const [showHelp, setShowHelp] = useState(false);
  const [portSession, setPortSession] = useState<{ cargo?: Piece[]; practice: boolean } | null>(() => new URLSearchParams(window.location.search).get('stage') === 'port' ? { practice: true } : null);
  const inPort = portSession !== null;
  const board = useRef<HTMLDivElement>(null);
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
  const level = getLevel(game.level);
  const active = game[scene].find((piece) => piece.id === selected);
  const available = loadingPlaces(game);
  const canLoad = game.queue.length > 0 && available.length > 0;
  const completed = won(game);
  const out = 5 - game.garage.filter((piece) => piece.kind === 'cash').length;
  const loadingInfo = !game.queue.length
    ? 'Előbb hozz ki egy raklapot a garázsból. A három eredeti raklapot már most átrendezheted.'
    : !available.length
      ? 'A két sárga rakodóhely foglalt. Mozgasd el róluk a pénzt, majd koppints a szabad + mezőre.'
      : 'Koppints egy sárga + mezőre vagy a Felrakás gombra. Utána told a raklapot az első két sor egyik szabad dokkjára.';
  function commit(next: Game) { if (next !== game) setHistory((previous) => [...previous, next]); }
  function step(direction: Direction, id = selected) {
    if (!id) return;
    const next = move(game, scene, id, direction);
    if (next === game) { setMessage('Az út zárva. Előbb mozdíts el egy másik autót vagy raklapot.'); return; }
    if (next.queue.length > game.queue.length) { setMessage('Aranyraklap kint! A Rakodás gombbal jutsz Ádám platójához.'); setSelected(null); }
    else setMessage(scene === 'truck' ? 'A cél: mind a nyolc raklap az első két sor aranyszegélyes dokkján.' : 'Keress helyet a következő autónak. A kijárat csak egy mező széles.');
    commit(next);
  }
  function handleLoad(column?: number) {
    const next = load(game, column);
    if (next === game) { setMessage(loadingInfo); return; }
    commit(next); setSelected(game.queue[0].id);
    setMessage('Felrakva! Ezt a raklapot is vidd az első két sor egyik aranyszegélyes dokkjára.');
  }
  function switchScene(next: Scene) {
    gesture.current = null; setScene(next); setSelected(null);
    setMessage(next === 'truck' ? loadingInfo : 'Öt raklap, kilenc autó, egyetlen keskeny kijárat.');
  }
  function restart(nextLevel: LevelId = game.level) {
    gesture.current = null; setHistory([createGame(nextLevel)]); setScene('garage'); setSelected(null);
    setMessage('Új próbálkozás. Nyisd meg a kijáratot, majd rendezd el mind a nyolc raklapot.');
  }
  function onKeyDown(event: KeyboardEvent) {
    const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (keys[event.key] && selected) { event.preventDefault(); step(keys[event.key]); }
  }
  if (portSession) return <PortGame cargo={portSession.cargo} practice={portSession.practice} campaignMoves={game.moves} onBack={() => setPortSession(null)} />;
  const occupied = (x: number, y: number) => game.truck.some(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  return <div className="game-shell" onKeyDown={onKeyDown}>
    <header className="topbar"><div className="brand"><span className="brand-mark" aria-hidden="true">M<span>//</span></span><div><strong>MTCSY</strong><span>GOLDEN GARAGE</span></div></div><button className="icon-button" aria-label="Játékszabályok" aria-expanded={showHelp} onClick={() => setShowHelp(!showHelp)}>?</button></header>
    <main>
      <div className="level-line"><span className="level-tag">{level.name}</span><span className="difficulty"><i /><i /><i /> {game.level === 'expert' ? 'PROFI' : 'NEHÉZ'}</span></div>
      <h1>Luxusba zárt vagyon.</h1>
      <p className="intro">Öt aranyraklapot ki. Nyolcat biztonságba.</p><div className="campaign-route">01 Garázs és plató <span>→</span> 02 Kikötő <span>→</span> Dubaj</div>
      <div className="level-buttons" role="group" aria-label="Nehézségi szint">{levels.map(item => <button key={item.id} aria-pressed={game.level === item.id} onClick={() => restart(item.id as LevelId)}>{item.id === 'hard' ? '01 / Nehéz' : '02 / Profi'}<small>{item.title}</small></button>)}</div>
      {showHelp && <section className="help" aria-label="Játékszabályok"><h2>A nagy rakodás</h2><p>Koppints egy autóra vagy raklapra, majd húzd, vagy használd a nyilakat. Egy mozdulat egy mező. Az autók csak hosszirányban, a pénz négy irányban mozgatható.</p><p>Az öt aranyozott pénzes raklapot a garázs alsó, egymezős kijáratán kell kivinni. Kilenc autó torlaszolja az utat.</p><p>A platón már egy Porsche és három raklap vár. A két alsó, sárga bejárati mezőt szabadítsd fel. A garázs előtt váró raklapot a szabad + mezőre koppintva rakodhatod fel.</p><p>A fuvar csak akkor kész, ha mind a nyolc pénzes raklap az első két sor aranyszegélyes dokkjában áll. A bejáraton hagyott raklap még nincs biztonságban.</p><button className="text-button" onClick={() => setShowHelp(false)}>Értem, indulhat!</button></section>}
      <div className="stats" aria-label="Játékállás"><div><span>KIHOZVA</span><strong>{out}<small>/5</small></strong></div><div><span>LEPARKOLVA</span><strong>{securedCount(game)}<small>/8</small></strong></div><div><span>LÉPÉSEK</span><strong>{game.moves.toString().padStart(2, '0')}</strong></div></div>
      <div className="scene-tabs" role="group" aria-label="Helyszín"><button aria-pressed={scene === 'garage'} onClick={() => switchScene('garage')}><span>01</span> Garázs <small>9 AUTÓ</small></button><button aria-pressed={scene === 'truck'} onClick={() => switchScene('truck')}><span>02</span> Ádám platója {game.queue.length > 0 && <b>{game.queue.length}</b>}</button></div>
      {scene === 'garage' && game.queue.length > 0 && <button className="queue-notice" onClick={() => switchScene('truck')}><span><strong>{game.queue.length} aranyraklap</strong> vár a garázs előtt</span><b>Rakodás →</b></button>}
      {scene === 'truck' && <section className={`loading-panel ${canLoad ? 'ready' : ''}`} aria-label="Felrakodás"><div className="loading-heading"><span className="incoming-art"><PalletArt /></span><div><strong>{game.queue.length ? `${game.queue.length} raklap vár felrakásra` : 'Ádám platója'}</strong><small>{truckCount(game)} / 8 raklap a platón • {securedCount(game)} a dokkokban</small></div></div><p>{loadingInfo}</p><button className="load-button" disabled={!canLoad} aria-disabled={!canLoad} onClick={() => handleLoad()}>{canLoad ? 'Következő raklap felrakása' : game.queue.length ? 'Rakodóhelyek foglaltak' : 'Még nincs kint raklap'}<span>{canLoad ? '↑' : '○'}</span></button></section>}
      <section className={`scene ${scene}`} aria-label={scene === 'garage' ? 'Garázs játéktér' : 'Platós autó játéktér'}>
        <div className="scene-label"><span>{scene === 'garage' ? 'PRIVÁT GARÁZS' : 'ARANYSZEGÉLYES DOKKOK: 8 HELY'}</span><span>{scene === 'garage' ? '↓ SZŰK KIJÁRAT' : '↓ RAKODÁS ALUL'}</span></div>
        {scene === 'truck' && <div className="truck-cab" aria-hidden="true"><span>ÁDÁM</span><div className="windshield" /><span>V8</span></div>}
        <div ref={board} className={`board ${scene}`} role="group" aria-label={scene === 'garage' ? 'Garázs, 6 × 6 mező' : 'Plató, 4 × 4 mező'}>
          {scene === 'truck' && Array.from({ length: 8 }, (_, i) => ({ x: i % 4, y: Math.floor(i / 4) })).filter(p => !occupied(p.x, p.y)).map(p => <span key={`dock-${p.x}-${p.y}`} className="dock-cell" style={{ gridColumn: p.x + 1, gridRow: p.y + 1 }} aria-hidden="true">◇<small>DOKK</small></span>)}
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
      <div className="queue-line"><span className="queue-icon" aria-hidden="true">▤</span><span><strong>{game.queue.length} raklap</strong> kint • <strong>{securedCount(game)} / 8</strong> a végső helyén</span></div>
      {completed && <section className="success" role="status"><span aria-hidden="true">✦</span><h2>Ádám indulhat!</h2><p>Öt raklap kimentve, mind a nyolc biztonságban a Porsche előtt. {game.moves} lépésből oldottad meg.</p><button onClick={() => { if (won(game)) setPortSession({ cargo: game.truck.filter(p => p.kind === 'cash'), practice: false }); }}>Következő pálya: Kikötő →</button></section>}
      <section className="controls" aria-label="Mozgatás"><div className="selection"><span>KIVÁLASZTVA</span><strong>{active?.label ?? 'Válassz egy elemet'}</strong><small>{active ? active.kind === 'cash' ? 'Mozgatható négy irányban' : 'Csak hosszirányban mozog' : 'Húzd vagy használd a nyilakat'}</small></div><div className="dpad">{(['up', 'left', 'down', 'right'] as const).map(direction => <button key={direction} className={direction} aria-label={names[direction]} disabled={!active || move(game, scene, active.id, direction) === game} onClick={() => step(direction)}>{arrows[direction]}</button>)}</div></section>
      <p className="message" role="status">{message}</p><div className="bottom-actions"><button disabled={history.length < 2} onClick={() => { gesture.current = null; setHistory(previous => previous.slice(0, -1)); setMessage('Az utolsó lépést visszavontad.'); }}>↶ Visszavonás</button><button onClick={() => restart()}>↻ Újrakezdés</button></div>
      <button className="port-practice-button" onClick={() => setPortSession({ practice: true })}>Új pálya kipróbálása: Kikötő →</button>
    </main><footer>MTCSY <span>GOLDEN GARAGE • GONDOLKOZZ ELŐRE</span></footer>
  </div>;
}
