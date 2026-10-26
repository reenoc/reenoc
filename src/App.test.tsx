import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { createGame } from './game';
import solutions from './test/solutions.json';

describe('Golden Garage játékfelület', () => {
  it('mindig az első szintről indul, a régi gyakorlólink sem engedi átugrani', () => {
    window.history.replaceState(null, '', '/?stage=port');
    try {
      render(<App />);
      expect(screen.getByRole('dialog', { name: 'A nagy fuvar' })).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
      expect(screen.getByRole('heading', { name: 'Luxusba zárt vagyon.' })).toBeTruthy();
      expect(screen.getByText(/^1\. szint ·/)).toBeTruthy();
      expect(screen.queryByRole('button', { name: /Kikötő|kipróbálása/i })).toBeNull();
      expect(screen.queryByRole('group', { name: 'Kikötő, 8 × 10 mező' })).toBeNull();
    } finally { window.history.replaceState(null, '', '/'); }
  });

  it('a pályán kezdett érintés nem görgeti az oldalt, kívül szabad a görgetés', () => {
    render(<App />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    const board = screen.getByRole('group', { name: 'Garázs, 6 × 6 mező' });
    const car = screen.getByRole('button', { name: /^Ferrari F8,/ });
    expect(fireEvent.touchStart(car, { cancelable: true })).toBe(false);
    expect(fireEvent.touchMove(car, { cancelable: true })).toBe(false);
    expect(fireEvent.touchMove(board, { cancelable: true })).toBe(false);
    expect(fireEvent.touchMove(screen.getByRole('heading', { level: 1 }), { cancelable: true })).toBe(true);
  });

  it('billentyűzettel mozgat és visszavonja a lépést', async () => {
    const user = userEvent.setup(); render(<App />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    await user.click(screen.getByRole('button', { name: 'Lamborghini Aventador, 4. sor, 4. oszlop' }));
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Lamborghini Aventador, 3. sor, 4. oszlop' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Visszavonás/ }));
    expect(screen.getByRole('button', { name: 'Lamborghini Aventador, 4. sor, 4. oszlop' })).toBeTruthy();
  });

  it('elmagyarázza a foglalt bejáratot, majd a felszabadított mezőn egyszer rakodik', async () => {
    const user = userEvent.setup(); render(<App />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    const labels = Object.fromEntries(createGame().garage.map(p => [p.id, p.label]));
    let selected = '';
    for (const [id, direction] of solutions.expert.slice(0, 21)) {
      if (selected !== id) { await user.click(screen.getByRole('button', { name: new RegExp(`^${labels[id]},`) })); selected = id; }
      const keys: Record<string, string> = { up: '{ArrowUp}', down: '{ArrowDown}', left: '{ArrowLeft}', right: '{ArrowRight}' };
      await user.keyboard(keys[direction]);
    }
    await user.click(screen.getByRole('button', { name: /Platós Rolls/ }));
    expect(within(screen.getByRole('region', { name: 'Felrakodás' })).getByText(/A két sárga rakodóhely foglalt/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Rakodóhelyek foglaltak/ }).getAttribute('aria-disabled')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Eredeti pénz 3, 4. sor, 3. oszlop' }));
    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('button', { name: 'Felrakás a jobb oldali rakodóhelyre' }));
    expect(screen.getByRole('button', { name: 'Pénz 4, 4. sor, 3. oszlop' })).toBeTruthy();
    expect(screen.getByText('1 raklap vár felrakásra')).toBeTruthy();
  }, 20000);

  it('különböző nehéz pályák között vált, és újrakezdéskor megőrzi a választást', async () => {
    const user = userEvent.setup(); render(<App />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    await user.click(screen.getByRole('button', { name: /^Nehéz/ }));
    expect(screen.getByRole('button', { name: 'Pénz 1, 1. sor, 3. oszlop' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Újrakezdés/ }));
    expect(screen.getByRole('button', { name: /^Nehéz/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('button', { name: /^Pénz [1-5],/ })).toHaveLength(5);
  });
});
