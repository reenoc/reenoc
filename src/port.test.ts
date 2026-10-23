import { describe, expect, it } from 'vitest';
import { createPort, clearPortCell, isContainer, isPortFloor, liftPort, lowerPort, movePort, turnPort, walkPort, portDocked, portReady, dispatchPort, CLOCKWISE, type PortState } from './port';
import { createGame } from './game';
import solution from './test/port-solution.json';

function validate(state: PortState) {
  expect(state.pallets).toHaveLength(8);
  expect(new Set(state.pallets.map(p => p.id)).size).toBe(8);
  expect(new Set(state.pallets.map(p => `${p.x},${p.y}`)).size).toBe(8);
  expect(clearPortCell(state, state.jack.x, state.jack.y)).toBe(true);
  state.pallets.forEach(p => expect(isPortFloor(p.x, p.y)).toBe(true));
  if (state.carrying) {
    const p = state.pallets.find(p => p.id === state.carrying)!;
    const [dx, dy] = ({ up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] })[state.jack.facing];
    expect([p.x, p.y]).toEqual([state.jack.x + dx, state.jack.y + dy]);
    expect(p.entry).toBe(dx === 0 ? 'vertical' : 'horizontal');
  }
}

describe('Kikötő: kétoldali villanyílás és raklapmozgató', () => {
  it('a kampány nyolc raklapjának azonosságát megőrzi a kikötőben', () => {
    const start = createGame();
    const cargo = [...start.garage.filter(p => p.kind === 'cash'), ...start.truck.filter(p => p.kind === 'cash')];
    const port = createPort(cargo);
    expect(port.pallets.map(p => p.id).sort()).toEqual(cargo.map(p => p.id).sort());
    validate(port);
    expect(() => createPort(cargo.slice(0, 7))).toThrow();
  });

  it('ugyanazt a raklapot csak a két villanyílás felől lehet felvenni', () => {
    const base = createPort();
    const pallet = { ...base.pallets[0], x: 5, y: 6, entry: 'horizontal' as const };
    const others = base.pallets.slice(1).filter(p => !(p.x === 5 && p.y === 6));
    for (const [x, y] of [[4, 6], [6, 6]]) {
      const state = { ...base, pallets: [pallet, ...others], jack: { x, y, facing: 'up' as const } };
      expect(liftPort(state, pallet.id).carrying).toBe(pallet.id);
    }
    for (const [x, y] of [[5, 5], [5, 7]]) {
      const state = { ...base, pallets: [pallet, ...others], jack: { x, y, facing: 'up' as const } };
      expect(liftPort(state, pallet.id)).toBe(state);
    }
  });

  it('az emelt raklap nem csúsztatható oldalra; a forduló söpört sarka sem lehet foglalt', () => {
    const base = createPort();
    const state = { ...base, pallets: [{ ...base.pallets[0], x: 4, y: 6, entry: 'horizontal' as const }], jack: { x: 5, y: 6, facing: 'left' as const }, carrying: base.pallets[0].id };
    expect(movePort(state, 'up')).toBe(state);
    expect(movePort(state, 'right').pallets[0].x).toBe(5);
    const blocked = { ...state, pallets: [...state.pallets, { ...base.pallets[1], x: 4, y: 7 }] };
    // Célmező (5,7) szabad, de a fordulás íve a (4,7) raklapba ütközne.
    expect(turnPort(blocked, 'left')).toBe(blocked);
    const turned = turnPort(state, 'left');
    expect(turned.pallets[0]).toMatchObject({ x: 5, y: 7, entry: 'vertical' });
    expect(lowerPort(turned).carrying).toBe(null);
  });

  it('az üres béka útvonalat keres; nem teleportálhat raklapon vagy falon át', () => {
    const state = createPort();
    expect(walkPort(state, 3, 5)).toBe(state);
    expect(walkPort(state, 0, 6)).toBe(state);
    const walked = walkPort(state, 7, 9);
    expect(walked.jack).toMatchObject({ x: 7, y: 9 });
    expect(walked.moves).toBe(2);
  });

  it('a teljes fuvar megoldható, a béka kijön a konténerből, és csak ezután indulhat a hajó', () => {
    let state = createPort(); validate(state);
    for (const group of solution.groups) {
      const id = state.pallets[group.index].id;
      for (const action of group.actions) {
        let next: PortState;
        if (action[0] === 'move') next = movePort(state, CLOCKWISE[Number(action[1])]);
        else if (action[0] === 'turn') next = turnPort(state, action[1] as 'left' | 'right');
        else if (action[0] === 'lift') next = liftPort(state, id);
        else next = lowerPort(state);
        expect(next, `${id}: ${action.join(' ')}`).not.toBe(state);
        state = next; validate(state);
      }
    }
    expect(portDocked(state)).toBe(8);
    expect(isContainer(state.jack.x, state.jack.y)).toBe(true);
    expect(portReady(state)).toBe(false);
    expect(dispatchPort(state)).toBe(state);
    for (const action of solution.exit) state = movePort(state, CLOCKWISE[Number(action[1])]);
    expect(state.moves).toBe(solution.total_actions);
    expect(portReady(state)).toBe(true);
    state = dispatchPort(state);
    expect(state.dispatched).toBe(true);
    expect(movePort(state, 'down')).toBe(state);
  });
});
