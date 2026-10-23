import { describe, expect, it } from 'vitest';
import { createGame, load, move, overlaps, truckCount, won, type Direction, type Game, type Scene } from './game';

describe('MTCSY játékszabályok', () => {
  it('nem enged ütközést, pályán kívüli mozgást vagy keresztirányú autómozgást', () => {
    const game = createGame();
    expect(move(game, 'garage', 'cash-1', 'left')).toBe(game);
    expect(move(game, 'garage', 'cash-2', 'down')).toBe(game);
    expect(move(game, 'garage', 'lambo', 'up')).toBe(game);
    expect(move(game, 'garage', 'ferrari', 'left')).toBe(game);
    expect(load(game)).toBe(game);
    expect(won(game)).toBe(false);
  });

  it('csak a kijáraton engedi ki a pénzt, a garázsból autót nem lehet kivinni', () => {
    const game = createGame();
    const pallet = { ...game.garage[0], x: 1, y: 5 };
    const blocked = { ...game, garage: [pallet] };
    expect(move(blocked, 'garage', pallet.id, 'down')).toBe(blocked);
    const atExit = { ...game, garage: [{ ...pallet, x: 2 }] };
    const next = move(atExit, 'garage', pallet.id, 'down');
    expect(next.garage).toHaveLength(0);
    expect(next.queue).toHaveLength(1);
    expect(next.moves).toBe(1);
    expect(game.queue).toHaveLength(0);
    const car = { ...game.garage.find((piece) => piece.id === 'mercedes')!, x: 2, y: 4 };
    const carAtExit = { ...game, garage: [car] };
    expect(move(carAtExit, 'garage', car.id, 'down')).toBe(carAtExit);
  });

  it('a teljes kezdőpálya megoldható, mind a nyolc raklap felrakható ütközés nélkül', () => {
    let game = createGame();
    function validate(current: Game) {
      expect(current.garage.filter((p) => p.kind === 'cash').length + current.queue.length + truckCount(current)).toBe(8);
      for (const scene of ['garage', 'truck'] as const) {
        const size = scene === 'garage' ? 6 : 4;
        current[scene].forEach((piece, i, all) => {
          expect(piece.x).toBeGreaterThanOrEqual(0); expect(piece.y).toBeGreaterThanOrEqual(0);
          expect(piece.x + piece.w).toBeLessThanOrEqual(size); expect(piece.y + piece.h).toBeLessThanOrEqual(size);
          for (const other of all.slice(i + 1)) expect(overlaps(piece, other)).toBe(false);
        });
      }
    }
    const step = (scene: Scene, id: string, path: Direction[]) => {
      for (const direction of path) {
        const next = move(game, scene, id, direction);
        expect(next, `${id} → ${direction}`).not.toBe(game);
        game = next; validate(game);
      }
    };
    const repeat = (direction: Direction, count: number) => Array<Direction>(count).fill(direction);
    step('garage', 'aston', ['right']);
    step('garage', 'mercedes', ['up', 'up']);
    step('garage', 'lambo', ['left']);
    step('garage', 'porsche-garage', ['left', 'left']);
    step('garage', 'cash-2', ['right', ...repeat('down', 6)]);
    step('garage', 'cash-3', ['left', ...repeat('down', 6)]);
    step('garage', 'cash-1', [...repeat('right', 3), ...repeat('down', 6)]);
    step('garage', 'cash-4', ['right', 'right', 'down', 'down', 'down']);
    step('garage', 'cash-5', ['up', 'up', 'left', 'left', ...repeat('down', 5)]);
    expect(game.queue).toHaveLength(5);
    expect(load(game)).toBe(game); // Az eredeti raklapok foglalják a rakodóhelyeket.
    step('truck', 'truck-3', ['right', 'up', 'up', 'left', 'up', 'left', 'left']);
    step('truck', 'truck-2', ['right', 'right', 'up', 'up', 'left', 'up', 'left']);
    step('truck', 'truck-1', ['right', 'right', 'right', 'up', 'up', 'up', 'left']);
    const destinations: Direction[][] = [['up'], ['left', 'left', 'left'], ['left', 'left'], ['left'], []];
    for (const tail of destinations) {
      const id = game.queue[0].id;
      const next = load(game);
      expect(next).not.toBe(game); game = next; validate(game);
      step('truck', id, ['right', 'right', 'up', 'up', ...tail]);
    }
    expect(truckCount(game)).toBe(8);
    expect(won(game)).toBe(true);
  });
});
