import { describe, expect, it } from 'vitest';
import { createGame, load, loadingPlaces, move, overlaps, securedCount, truckCount, won, type Direction, type Game, type LevelId, type Scene } from './game';
import solutions from './test/solutions.json';

function validate(game: Game) {
  expect(game.garage.filter(p => p.kind === 'cash').length + game.queue.length + truckCount(game)).toBe(8);
  for (const scene of ['garage', 'truck'] as const) {
    const size = scene === 'garage' ? 6 : 4;
    game[scene].forEach((piece, i, all) => {
      expect(piece.x).toBeGreaterThanOrEqual(0); expect(piece.y).toBeGreaterThanOrEqual(0);
      expect(piece.x + piece.w).toBeLessThanOrEqual(size); expect(piece.y + piece.h).toBeLessThanOrEqual(size);
      for (const other of all.slice(i + 1)) expect(overlaps(piece, other)).toBe(false);
    });
  }
}

describe('Golden Garage játékszabályok', () => {
  it('sűrű, kilencautós pályával indul, és megőrzi a mozgási korlátokat', () => {
    const game = createGame();
    expect(game.garage.filter(p => p.kind === 'car')).toHaveLength(9);
    expect(game.garage.reduce((sum, p) => sum + p.w * p.h, 0)).toBe(26);
    expect(move(game, 'garage', 'lambo', 'right')).toBe(game);
    expect(move(game, 'garage', 'porsche', 'up')).toBe(game);
    const cash = { ...game.garage[0], x: 0, y: 0 };
    const obstacle = { ...game.garage.find(p => p.id === 'porsche')!, x: 1, y: 0 };
    const blocked = { ...game, garage: [cash, obstacle] };
    expect(move(blocked, 'garage', cash.id, 'left')).toBe(blocked);
    expect(move(blocked, 'garage', cash.id, 'right')).toBe(blocked);
    validate(game);
  });

  it('csak az egymezős kijáraton engedi ki a pénzt; autó nem vihető ki', () => {
    const game = createGame();
    for (const x of [0, 1, 3, 4, 5]) {
      const cash = { ...game.garage[0], x, y: 5 };
      const blocked = { ...game, garage: [cash] };
      expect(move(blocked, 'garage', cash.id, 'down')).toBe(blocked);
    }
    const cash = { ...game.garage[0], x: 2, y: 5 };
    const atExit = { ...game, garage: [cash] };
    const next = move(atExit, 'garage', cash.id, 'down');
    expect(next.garage).toHaveLength(0); expect(next.queue).toHaveLength(1); expect(next.moves).toBe(1);
    expect(game.queue).toHaveLength(0);
    const car = { ...game.garage.find(p => p.id === 'mercedes')!, x: 2, y: 4 };
    const carAtExit = { ...game, garage: [car] };
    expect(move(carAtExit, 'garage', car.id, 'down')).toBe(carAtExit);
  });

  it('csak szabad bejárati mezőre rakodik, választott mezőt sem írhat felül', () => {
    const start = createGame();
    expect(load(start)).toBe(start);
    const game = { ...start, queue: [start.garage[0], start.garage[1]] };
    expect(loadingPlaces(game)).toEqual([]); expect(load(game)).toBe(game);
    const space = move(game, 'truck', 'truck-3', 'right');
    expect(loadingPlaces(space)).toEqual([2]);
    expect(load(space, 1)).toBe(space); expect(load(space, 3)).toBe(space);
    const loaded = load(space, 2);
    expect(loaded.queue).toHaveLength(1); expect(truckCount(loaded)).toBe(4);
    expect(loaded.truck.find(p => p.id === game.queue[0].id)).toMatchObject({ x: 2, y: 3 });
    expect(load(loaded, 2)).toBe(loaded);
  });

  for (const level of ['hard', 'expert'] as LevelId[]) {
    it(`${level}: az öt raklap kijuttatható, majd mind a nyolc pénz a dokkokra rendezhető`, () => {
      let game = createGame(level);
      const step = (scene: Scene, id: string, path: Direction[]) => {
        for (const direction of path) {
          const next = move(game, scene, id, direction);
          expect(next, `${level}: ${id} → ${direction}`).not.toBe(game);
          game = next; validate(game);
        }
      };
      for (const [id, direction] of solutions[level]) step('garage', id, [direction as Direction]);
      expect(game.queue).toHaveLength(5); expect(won(game)).toBe(false);
      const order = game.queue.map(p => p.id);
      expect(load(game)).toBe(game);
      step('truck', 'truck-3', ['right', 'up', 'up', 'left', 'up', 'left', 'left']);
      step('truck', 'truck-2', ['right', 'right', 'up', 'up', 'left', 'up', 'left']);
      step('truck', 'truck-1', ['right', 'right', 'right', 'up', 'up', 'up', 'left']);
      expect(securedCount(game)).toBe(3);
      const tails: Direction[][] = [['up'], ['left', 'left', 'left'], ['left', 'left'], ['left'], []];
      for (let i = 0; i < 5; i++) {
        const next = load(game, 1); expect(next).not.toBe(game); game = next; validate(game);
        expect(won(game)).toBe(false); // A bejáratra felrakás még nem győzelem.
        step('truck', order[i], ['right', 'right', 'up', 'up', ...tails[i]]);
      }
      expect(truckCount(game)).toBe(8); expect(securedCount(game)).toBe(8); expect(won(game)).toBe(true);
    });
  }
});
