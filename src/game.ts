import layouts from './levels.json';

export type Scene = 'garage' | 'truck';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type LevelId = 'hard' | 'expert';
export type Piece = { id: string; label: string; kind: 'cash' | 'car'; axis: 'horizontal' | 'vertical' | 'both'; x: number; y: number; w: number; h: number; color: string };
export type Game = { level: LevelId; garage: Piece[]; truck: Piece[]; queue: Piece[]; moves: number };
export const ENTRY_COLUMNS = [1, 2] as const;
export const EXIT_COLUMN = 2;
export const vectors: Record<Direction, readonly [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const levels = layouts;
export const getLevel = (id: LevelId) => layouts.find((level) => level.id === id)!;
const models: Record<string, [string, string]> = {
  porsche: ['Porsche 911', 'blue'], ferrari: ['Ferrari F8', 'red'], limousine: ['Rolls-Royce Phantom', 'gold'],
  lambo: ['Lamborghini Aventador', 'orange'], aston: ['Aston Martin DB11', 'teal'], mercedes: ['Mercedes-AMG G63', 'silver'],
  rolls: ['Bentley Bentayga', 'black'], range: ['Range Rover', 'white'], maserati: ['Maserati MC20', 'red'],
};
const cash = (id: string, label: string, x: number, y: number): Piece => ({ id, label, x, y, w: 1, h: 1, axis: 'both', kind: 'cash', color: 'money' });
const car = (id: string, label: string, x: number, y: number, w: number, h: number, color: string): Piece => ({ id, label, x, y, w, h, axis: w > h ? 'horizontal' : 'vertical', kind: 'car', color });
export function createGame(level: LevelId = 'expert'): Game {
  const layout = getLevel(level);
  return {
    level,
    garage: [
      ...layout.cash.map((position, i) => cash(`cash-${i + 1}`, `Pénz ${i + 1}`, position % 6, Math.floor(position / 6))),
      ...layout.cars.map((spec) => { const [label, color] = models[spec.id]; return car(spec.id, label, spec.position % 6, Math.floor(spec.position / 6), spec.w, spec.h, color); }),
    ],
    truck: [car('porsche-truck', 'Porsche 911', 0, 2, 3, 1, 'blue'), cash('truck-1', 'Eredeti pénz 1', 0, 3), cash('truck-2', 'Eredeti pénz 2', 1, 3), cash('truck-3', 'Eredeti pénz 3', 2, 3)],
    queue: [], moves: 0,
  };
}
export function overlaps(a: Piece, b: Piece): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function move(game: Game, scene: Scene, id: string, direction: Direction): Game {
  const piece = game[scene].find((item) => item.id === id);
  if (!piece) return game;
  const [dx, dy] = vectors[direction];
  if ((dx && piece.axis === 'vertical') || (dy && piece.axis === 'horizontal')) return game;
  const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
  if (scene === 'garage' && piece.kind === 'cash' && next.y === 6 && next.x === EXIT_COLUMN) {
    return { ...game, garage: game.garage.filter((item) => item.id !== id), queue: [...game.queue, piece], moves: game.moves + 1 };
  }
  const size = scene === 'garage' ? 6 : 4;
  if (next.x < 0 || next.y < 0 || next.x + next.w > size || next.y + next.h > size) return game;
  if (game[scene].some((other) => other.id !== id && overlaps(next, other))) return game;
  return { ...game, [scene]: game[scene].map((item) => item.id === id ? next : item), moves: game.moves + 1 };
}
export function loadingPlaces(game: Game): number[] {
  return ENTRY_COLUMNS.filter((x) => !game.truck.some((piece) => x >= piece.x && x < piece.x + piece.w && 3 >= piece.y && 3 < piece.y + piece.h));
}
export function load(game: Game, column?: number): Game {
  if (!game.queue.length) return game;
  const available = loadingPlaces(game);
  const x = column === undefined ? available[0] : (available.includes(column) ? column : undefined);
  if (x === undefined) return game;
  return { ...game, truck: [...game.truck, { ...game.queue[0], x, y: 3 }], queue: game.queue.slice(1), moves: game.moves + 1 };
}
export const truckCount = (game: Game) => game.truck.filter((piece) => piece.kind === 'cash').length;
export const securedCount = (game: Game) => game.truck.filter((piece) => piece.kind === 'cash' && piece.y < 2).length;
export const won = (game: Game) => securedCount(game) === 8 && game.queue.length === 0 && !game.garage.some((piece) => piece.kind === 'cash');
