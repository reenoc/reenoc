export type Scene = 'garage' | 'truck';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Piece = {
  id: string;
  label: string;
  kind: 'cash' | 'car';
  axis: 'horizontal' | 'vertical' | 'both';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};
export type Game = { garage: Piece[]; truck: Piece[]; queue: Piece[]; moves: number };
export const vectors: Record<Direction, readonly [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};
const cash = (id: string, label: string, x: number, y: number): Piece =>
  ({ id, label, x, y, w: 1, h: 1, axis: 'both', kind: 'cash', color: 'money' });
const car = (id: string, label: string, x: number, y: number, w: number, h: number, color: string): Piece =>
  ({ id, label, x, y, w, h, axis: w > h ? 'horizontal' : 'vertical', kind: 'car', color });

export function createGame(): Game {
  return {
    garage: [
      cash('cash-1', 'Pénz 1', 0, 0), cash('cash-2', 'Pénz 2', 2, 0),
      cash('cash-3', 'Pénz 3', 4, 0), cash('cash-4', 'Pénz 4', 1, 3),
      cash('cash-5', 'Pénz 5', 5, 3),
      car('lambo', 'Lamborghini', 1, 4, 3, 1, 'orange'),
      car('ferrari', 'Ferrari', 4, 2, 1, 3, 'red'),
      car('aston', 'Aston Martin', 0, 2, 2, 1, 'teal'),
      car('mercedes', 'Mercedes G', 0, 4, 1, 2, 'silver'),
      car('porsche-garage', 'Porsche', 2, 1, 2, 1, 'blue'),
    ],
    truck: [
      car('porsche-truck', 'Porsche', 0, 2, 3, 1, 'blue'),
      cash('truck-1', 'Eredeti pénz 1', 0, 3),
      cash('truck-2', 'Eredeti pénz 2', 1, 3),
      cash('truck-3', 'Eredeti pénz 3', 2, 3),
    ],
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
  if (scene === 'garage' && piece.kind === 'cash' && next.y === 6 && (next.x === 2 || next.x === 3)) {
    return { ...game, garage: game.garage.filter((item) => item.id !== id), queue: [...game.queue, piece], moves: game.moves + 1 };
  }
  const size = scene === 'garage' ? 6 : 4;
  if (next.x < 0 || next.y < 0 || next.x + next.w > size || next.y + next.h > size) return game;
  if (game[scene].some((other) => other.id !== id && overlaps(next, other))) return game;
  return { ...game, [scene]: game[scene].map((item) => item.id === id ? next : item), moves: game.moves + 1 };
}

export function load(game: Game): Game {
  if (!game.queue.length) return game;
  for (const x of [1, 2]) {
    const incoming = { ...game.queue[0], x, y: 3 };
    if (!game.truck.some((piece) => overlaps(incoming, piece))) {
      return { ...game, truck: [...game.truck, incoming], queue: game.queue.slice(1), moves: game.moves + 1 };
    }
  }
  return game;
}

export const truckCount = (game: Game) => game.truck.filter((piece) => piece.kind === 'cash').length;
export const won = (game: Game) => truckCount(game) === 8 && game.queue.length === 0 && !game.garage.some((piece) => piece.kind === 'cash');
