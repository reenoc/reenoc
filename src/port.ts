import { vectors, type Direction, type Piece } from './game';

export const PORT_WIDTH = 8;
export const PORT_HEIGHT = 10;
export const CLOCKWISE: Direction[] = ['up', 'right', 'down', 'left'];
export type PortPallet = { id: string; label: string; number: number; x: number; y: number; entry: 'horizontal' | 'vertical' };
export type PortState = { pallets: PortPallet[]; jack: { x: number; y: number; facing: Direction }; carrying: string | null; moves: number; dispatched: boolean };
export const PORT_WALLS: readonly (readonly [number, number])[] = [
  [3, 0], [3, 1], [3, 2], [3, 3], [4, 3], [7, 3],
  [0, 5], [1, 5], [2, 5], [3, 5], [0, 8], [1, 8], [2, 8],
];
export const PORT_GOALS = Array.from({ length: 8 }, (_, i) => ({ x: 4 + i % 4, y: Math.floor(i / 4) }));
export function isPortFloor(x: number, y: number) {
  return x >= 0 && x < PORT_WIDTH && y >= 0 && y < PORT_HEIGHT && !PORT_WALLS.some(([wx, wy]) => x === wx && y === wy);
}
export const isContainer = (x: number, y: number) => x >= 4 && x < 8 && y >= 0 && y < 4;
export const isPortGoal = (x: number, y: number) => PORT_GOALS.some(p => p.x === x && p.y === y);
export function createPort(cargo?: readonly Pick<Piece, 'id' | 'label' | 'x' | 'y'>[]): PortState {
  const items = cargo ? [...cargo].sort((a, b) => a.y - b.y || a.x - b.x) : Array.from({ length: 8 }, (_, i) => ({ id: `port-${i + 1}`, label: `Aranyraklap ${i + 1}`, x: i % 4, y: Math.floor(i / 4) }));
  if (items.length !== 8 || new Set(items.map(p => p.id)).size !== 8) throw new Error('A kikötői fuvarhoz nyolc különböző raklap kell.');
  return {
    pallets: items.map((p, i) => ({ id: p.id, label: p.label, number: i + 1, x: i % 4, y: 6 + Math.floor(i / 4), entry: (i % 4 + Math.floor(i / 4)) % 2 === 0 ? 'vertical' : 'horizontal' })),
    jack: { x: 5, y: 9, facing: 'up' }, carrying: null, moves: 0, dispatched: false,
  };
}
export function clearPortCell(state: PortState, x: number, y: number, except?: string) {
  return isPortFloor(x, y) && !state.pallets.some(p => p.id !== except && p.x === x && p.y === y);
}
export function entrySides(pallet: PortPallet) {
  return pallet.entry === 'horizontal'
    ? [{ x: pallet.x - 1, y: pallet.y }, { x: pallet.x + 1, y: pallet.y }]
    : [{ x: pallet.x, y: pallet.y - 1 }, { x: pallet.x, y: pallet.y + 1 }];
}
export function canLift(state: PortState, id: string) {
  const pallet = state.pallets.find(p => p.id === id);
  return !state.dispatched && !state.carrying && !!pallet && entrySides(pallet).some(p => p.x === state.jack.x && p.y === state.jack.y);
}
export function liftPort(state: PortState, id: string): PortState {
  if (!canLift(state, id)) return state;
  const p = state.pallets.find(p => p.id === id)!;
  const facing = CLOCKWISE.find(d => { const [dx, dy] = vectors[d]; return state.jack.x + dx === p.x && state.jack.y + dy === p.y; })!;
  return { ...state, jack: { ...state.jack, facing }, carrying: id, moves: state.moves + 1 };
}
export function lowerPort(state: PortState): PortState {
  if (!state.carrying || state.dispatched) return state;
  return { ...state, carrying: null, moves: state.moves + 1 };
}
export function movePort(state: PortState, direction: Direction): PortState {
  if (state.dispatched) return state;
  const [dx, dy] = vectors[direction];
  const jx = state.jack.x + dx, jy = state.jack.y + dy;
  if (!clearPortCell(state, jx, jy, state.carrying ?? undefined)) return state;
  if (!state.carrying) return { ...state, jack: { x: jx, y: jy, facing: direction }, moves: state.moves + 1 };
  const facing = vectors[state.jack.facing];
  if (dx * facing[1] !== dy * facing[0]) return state;
  const pallet = state.pallets.find(p => p.id === state.carrying)!;
  const px = pallet.x + dx, py = pallet.y + dy;
  if (!clearPortCell(state, px, py, pallet.id)) return state;
  return { ...state, jack: { ...state.jack, x: jx, y: jy }, pallets: state.pallets.map(p => p.id === pallet.id ? { ...p, x: px, y: py } : p), moves: state.moves + 1 };
}
export function turnPort(state: PortState, turn: 'left' | 'right'): PortState {
  if (state.dispatched) return state;
  const facing = CLOCKWISE[(CLOCKWISE.indexOf(state.jack.facing) + (turn === 'left' ? 3 : 1)) % 4];
  if (!state.carrying) return { ...state, jack: { ...state.jack, facing }, moves: state.moves + 1 };
  const pallet = state.pallets.find(p => p.id === state.carrying)!;
  const [dx, dy] = vectors[facing];
  const x = state.jack.x + dx, y = state.jack.y + dy;
  // Both the destination and the swept diagonal must fit: no turning through a wall or cargo.
  if (!clearPortCell(state, x, y, pallet.id) || !clearPortCell(state, pallet.x + dx, pallet.y + dy, pallet.id)) return state;
  const entry = dx === 0 ? 'vertical' : 'horizontal';
  return { ...state, jack: { ...state.jack, facing }, pallets: state.pallets.map(p => p.id === pallet.id ? { ...p, x, y, entry } : p), moves: state.moves + 1 };
}
export function walkPort(state: PortState, x: number, y: number): PortState {
  if (state.dispatched || !clearPortCell(state, x, y, state.carrying ?? undefined)) return state;
  if (state.carrying) {
    const direction = CLOCKWISE.find(d => { const [dx, dy] = vectors[d]; return state.jack.x + dx === x && state.jack.y + dy === y; });
    return direction ? movePort(state, direction) : state;
  }
  const start = state.jack.y * PORT_WIDTH + state.jack.x, goal = y * PORT_WIDTH + x;
  if (start === goal) return state;
  const queue = [start], seen = new Set([start]);
  const routes = new Map<number, { distance: number; facing: Direction }>();
  for (let i = 0; i < queue.length; i++) {
    const at = queue[i];
    for (const direction of CLOCKWISE) {
      const [dx, dy] = vectors[direction], nx = at % PORT_WIDTH + dx, ny = Math.floor(at / PORT_WIDTH) + dy;
      const next = ny * PORT_WIDTH + nx;
      if (!clearPortCell(state, nx, ny) || seen.has(next)) continue;
      const distance = (routes.get(at)?.distance ?? 0) + 1;
      if (next === goal) return { ...state, jack: { x, y, facing: direction }, moves: state.moves + distance };
      seen.add(next); routes.set(next, { distance, facing: direction }); queue.push(next);
    }
  }
  return state;
}
export const portDocked = (state: PortState) => state.pallets.filter(p => p.id !== state.carrying && isPortGoal(p.x, p.y)).length;
export const portReady = (state: PortState) => state.pallets.length === 8 && portDocked(state) === 8 && !state.carrying && !isContainer(state.jack.x, state.jack.y);
export function dispatchPort(state: PortState): PortState {
  return portReady(state) && !state.dispatched ? { ...state, dispatched: true, moves: state.moves + 1 } : state;
}
