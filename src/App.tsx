import { useRef, useState, type KeyboardEvent } from 'react';
import { createGame, load, move, truckCount, won, type Direction, type Game, type Scene } from './game';

const arrows: Record<Direction, string> = { up: '↑', left: '←', down: '↓', right: '→' };
const names: Record<Direction, string> = { up: 'Fel', left: 'Balra', down: 'Le', right: 'Jobbra' };

export default function App() {
  const [history, setHistory] = useState<Game[]>(() => [createGame()]);
  const [scene, setScene] = useState<Scene>('garage');
  const [selected, setSelected] = useState<string | null>('cash-2');
  const [message, setMessage] = useState('Válassz egy autót vagy raklapot, és mozgasd a nyilakkal.');
  const [showHelp, setShowHelp] = useState(false);
  const gesture = useRef<{ x: number; y: number; id: string } | null>(null);
  const game = history[history.length - 1];
  const active = game[scene].find((piece) => piece.id === selected);
  const completed = won(game);
  const out = 5 - game.garage.filter((piece) => piece.kind === 'cash').length;

  function commit(next: Game) {
    if (next !== game) setHistory((previous) => [...previous, next]);
  }
  function step(direction: Direction, id = selected) {
    if (!id) return;
    const next = move(game, scene, id, direction);
    if (next === game) { setMessage('Arra nincs szabad hely. Mozgass el egy másik járművet vagy raklapot.'); return; }
    if (next.queue.length > game.queue.length) {
      setMessage('Kint egy raklap! Válts a platóra, és rakodj fel.');
      setSelected(null);
    } else setMessage('Szabad az út. Jöhet a következő lépés.');
    commit(next);
  }
  function switchScene(next: Scene) {
    setScene(next); setSelected(null);
    setMessage(next === 'truck' ? 'Ádám vár. Szabadítsd fel a két rakodóhely egyikét a plató alján.' : 'Az öt pénzes raklapot az alsó kijáraton kell kihoznod.');
  }
  function restart() {
    setHistory([createGame()]); setScene('garage'); setSelected('cash-2');
    setMessage('Új próbálkozás. Mind az öt raklapra szükség lesz!');
  }
  function onKeyDown(event: KeyboardEvent) {
    const keys: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const direction = keys[event.key];
    if (direction && selected) { event.preventDefault(); step(direction); }
  }

  return (
    <div className="game-shell" onKeyDown={onKeyDown}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">M<span>//</span></span><div><strong>MTCSY</strong><span>A NAGY RAKODÁS</span></div></div>
        <button className="icon-button" aria-label="Játékszabályok" aria-expanded={showHelp} onClick={() => setShowHelp(!showHelp)}>?</button>
      </header>
      <main>
        <div className="level-line"><span className="level-tag">01. PÁLYA</span><span className="difficulty"><i /> ELSŐ FUVAR</span></div>
        <h1>Öt raklap. Egy kijárat.</h1>
        <p className="intro">Húzd az autókat és a raklapokat.<br />Ádám már vár a platóval.</p>
        {showHelp && <section className="help" aria-label="Játékszabályok">
          <h2>Hogyan játssz?</h2>
          <p>Koppints egy elemre, majd használd a nyilakat, a billentyűzet nyilait, vagy húzd az elemet egy irányba. Minden mozdulat egy mező.</p>
          <p>Az autók csak hosszirányban csúsznak. A pénz mind a négy irányba mozgatható. A garázs alsó, sárga kijáratán hozd ki mind az 5 raklapot.</p>
          <p>Válts a platóra: már ott van egy Porsche és 3 raklap. Rendezd át őket, majd a „Raklap felrakása” gombbal töltsd meg az alsó két rakodóhely egyikét. Összesen 8 pénzes raklapnak kell a platóra kerülnie.</p>
          <button className="text-button" onClick={() => setShowHelp(false)}>Értem, indulhat!</button>
        </section>}
        <div className="stats" aria-label="Játékállás">
          <div><span>KIHOZVA</span><strong>{out}<small>/5</small></strong></div>
          <div><span>A PLATÓN</span><strong>{truckCount(game)}<small>/8</small></strong></div>
          <div><span>LÉPÉSEK</span><strong>{game.moves.toString().padStart(2, '0')}</strong></div>
        </div>
        <div className="scene-tabs" role="group" aria-label="Helyszín">
          <button aria-pressed={scene === 'garage'} onClick={() => switchScene('garage')}><span>01</span> Garázs <small>6 × 6</small></button>
          <button aria-pressed={scene === 'truck'} onClick={() => switchScene('truck')}><span>02</span> Ádám platója {game.queue.length > 0 && <b>{game.queue.length}</b>}</button>
        </div>
        <section className={`scene ${scene}`} aria-label={scene === 'garage' ? 'Garázs játéktér' : 'Platós autó játéktér'}>
          <div className="scene-label"><span>{scene === 'garage' ? 'PRIVÁT GARÁZS' : 'ÁDÁM • KÉSZEN ÁLL'}</span><span>{scene === 'garage' ? '↓ KIJÁRAT ALUL' : '8 RAKLAP A CÉL'}</span></div>
          {scene === 'truck' && <div className="truck-cab" aria-hidden="true"><span>ÁDÁM</span><div className="windshield" /><span>🚚</span></div>}
          <div className={`board ${scene}`} role="group" aria-label={scene === 'garage' ? 'Garázs, 6 × 6 mező' : 'Plató, 4 × 4 mező'}>
            {game[scene].map((piece) => <button
              key={piece.id}
              className={`piece ${piece.kind} ${piece.color} ${piece.h > piece.w ? 'vertical' : ''} ${selected === piece.id ? 'selected' : ''}`}
              style={{ gridColumn: `${piece.x + 1} / span ${piece.w}`, gridRow: `${piece.y + 1} / span ${piece.h}` }}
              aria-label={`${piece.label}, ${piece.y + 1}. sor, ${piece.x + 1}. oszlop`}
              aria-pressed={selected === piece.id}
              onClick={() => setSelected(piece.id)}
              onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY, id: piece.id }; event.currentTarget.setPointerCapture?.(event.pointerId); setSelected(piece.id); }}
              onPointerCancel={() => { gesture.current = null; }}
              onPointerUp={(event) => {
                const start = gesture.current; gesture.current = null;
                if (!start) return;
                const dx = event.clientX - start.x, dy = event.clientY - start.y;
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
                step(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), start.id);
              }}
            >
              {piece.kind === 'cash' ? <><span className="banknotes" aria-hidden="true">$</span><span className="piece-label">{piece.id.startsWith('truck') ? 'PÉNZ' : `0${piece.id.split('-')[1]}`}</span></> : <><span className="car-window" aria-hidden="true" /><span className="piece-label">{piece.label}</span><span className="car-lights" aria-hidden="true" /></>}
            </button>)}
          </div>
          <div className="gate"><span>▾</span>{scene === 'garage' ? 'KIJÁRAT • 2 MEZŐ' : 'RAKODÓHELY • 2 MEZŐ'}<span>▾</span></div>
        </section>
        <div className="queue-line"><span className="queue-icon" aria-hidden="true">▤</span><span><strong>{game.queue.length} raklap</strong> vár a garázs előtt</span>{scene === 'garage' && game.queue.length > 0 && <button onClick={() => switchScene('truck')}>A platóhoz →</button>}</div>
        {scene === 'truck' && <button className="load-button" disabled={load(game) === game} onClick={() => { commit(load(game)); setMessage('Raklap a platón! Rendezd el, hogy a következőnek is legyen hely.'); }}>Raklap felrakása <span>↑</span></button>}
        {completed && <section className="success" role="status"><span aria-hidden="true">✦</span><h2>Megvan mind az öt!</h2><p>Mind a 8 pénzes raklap a platón, a Porsche mellett. Ádám indulhat!</p><button onClick={restart}>Új játék</button></section>}
        <section className="controls" aria-label="Mozgatás">
          <div className="selection"><span>KIVÁLASZTVA</span><strong>{active?.label ?? 'Koppints egy elemre'}</strong><small>{active ? (active.kind === 'cash' ? 'Négy irányban mozgatható' : 'Csak hosszirányban mozgatható') : 'Autó vagy pénzes raklap'}</small></div>
          <div className="dpad">{(['up', 'left', 'down', 'right'] as const).map((direction) => <button key={direction} className={direction} aria-label={names[direction]} disabled={!active || move(game, scene, active.id, direction) === game} onClick={() => step(direction)}>{arrows[direction]}</button>)}</div>
        </section>
        <p className="message" role="status">{message}</p>
        <div className="bottom-actions"><button disabled={history.length < 2} onClick={() => { setHistory((previous) => previous.slice(0, -1)); setMessage('Az utolsó lépést visszavontad.'); }}>↶ Visszavonás</button><button onClick={restart}>↻ Újrakezdés</button></div>
      </main>
      <footer>MTCSY <span>GONDOLKOZZ. MOZGASS. PAKOLJ.</span></footer>
    </div>
  );
}
