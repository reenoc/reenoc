import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StoryDialog from './StoryDialog';
import App from './App';
import PortGame from './PortGame';
import solution from './test/port-solution.json';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Retró történet', () => {
  it('betűnként ír, koppintásra befejezi a mondatot, és három oldalon végigvezet', () => {
    vi.useFakeTimers();
    const close = vi.fn(); render(<StoryDialog chapter="garage" onClose={close} />);
    const next = screen.getByRole('button', { name: 'Tovább →' });
    expect(document.activeElement).toBe(next);
    expect(document.body.style.overflow).toBe('hidden');
    act(() => { vi.advanceTimersByTime(64); });
    const typed = document.querySelector('.story-typed')!;
    expect(typed.textContent!.length).toBeGreaterThan(1);
    expect(typed.textContent!.length).toBeLessThan(20);
    fireEvent.click(screen.getByRole('button', { name: 'Teljes szöveg megjelenítése' }));
    expect(typed.textContent).toContain('öt aranyozott raklapnyi pénz');
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(next);
    expect(screen.getByLabelText('2. oldal, összesen 3')).toBeTruthy();
    expect(screen.getByText('ÁDÁM', { selector: 'strong' })).toBeTruthy();
    fireEvent.click(next); fireEvent.click(next);
    expect(screen.getByLabelText('3. oldal, összesen 3')).toBeTruthy();
    fireEvent.click(next);
    fireEvent.click(screen.getByRole('button', { name: 'Induljon a játék →' }));
    expect(close).toHaveBeenCalledOnce();
  });

  it('csökkentett mozgásnál azonnal mutatja a szöveget, és a fókuszt a párbeszédablakban tartja', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    const user = userEvent.setup(), close = vi.fn();
    render(<StoryDialog chapter="port" onClose={close} />);
    expect(document.querySelector('.story-typed')!.textContent).toContain('dubaji járat');
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Átugrás/ }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Tovább →' }));
    await user.keyboard('{Escape}');
    expect(close).toHaveBeenCalledOnce();
  });

  it('újraolvasható, közben nem mozog az autó és bezáráskor visszaadja a fókuszt', async () => {
    const user = userEvent.setup(); render(<App />);
    expect(screen.getByRole('dialog', { name: 'A nagy fuvar' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Átugrás/ }));
    await user.click(screen.getByRole('button', { name: 'Lamborghini Aventador, 4. sor, 4. oszlop' }));
    await user.keyboard('{ArrowUp}');
    const replay = screen.getByRole('button', { name: 'Menü' });
    await user.click(replay);
    await user.click(screen.getByRole('button', { name: 'Történet' }));
    expect(document.querySelector('.game-shell')!.hasAttribute('inert')).toBe(true);
    await user.keyboard('{ArrowUp}{ArrowDown}');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(replay);
    expect(screen.getByRole('button', { name: 'Lamborghini Aventador, 3. sor, 4. oszlop' })).toBeTruthy();
    expect(within(screen.getByLabelText('Játékállás')).getByText('01')).toBeTruthy();
  });

  it('csak a konténer tényleges feladása után meséli el a hajó indulását', () => {
    render(<PortGame />);
    fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
    const board = screen.getByRole('group', { name: 'Kikötő, 8 × 10 mező' });
    const lift = screen.getByRole('button', { name: '↑ Raklap emelése' });
    const turns = { left: screen.getByRole('button', { name: 'Fordítás balra' }), right: screen.getByRole('button', { name: 'Fordítás jobbra' }) };
    const pallets = screen.getAllByRole('button', { name: /^Raklap [1-8],/ });
    function action(a: (string | number)[]) {
      if (a[0] === 'move') fireEvent.keyDown(board, { key: keys[a[1] as number] });
      else if (a[0] === 'turn') fireEvent.click(turns[a[1] as 'left' | 'right']);
      else fireEvent.click(lift);
    }
    for (const group of solution.groups) {
      fireEvent.click(pallets[group.index]);
      group.actions.forEach(action);
    }
    expect(screen.queryByRole('dialog')).toBeNull();
    solution.exit.forEach(action);
    const completed = screen.getByRole('dialog', { name: 'Kirakodás kész!' });
    const next = screen.getByRole('button', { name: 'Tovább: indulás Dubajba →' });
    expect(document.activeElement).toBe(next);
    expect(document.querySelector('.game-shell')!.hasAttribute('inert')).toBe(true);
    const score = completed.querySelector('.completion-score')!.textContent;
    fireEvent.keyDown(next, { key: 'Escape' });
    fireEvent.keyDown(board, { key: 'ArrowUp' });
    expect(screen.getByRole('dialog', { name: 'Kirakodás kész!' })).toBe(completed);
    expect(completed.querySelector('.completion-score')!.textContent).toBe(score);
    fireEvent.click(next);
    expect(screen.getByRole('dialog', { name: 'Irány Dubaj' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    expect(screen.getByRole('heading', { name: 'Úton Dubajba!' })).toBeTruthy();
    expect(screen.getByText('Mindkét szint teljesítve. A nagy fuvar vége.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Vissza|újrakezdés/i })).toBeNull();
    fireEvent.keyDown(document.querySelector('.game-shell')!, { key: 'ArrowDown' });
    expect(screen.getByRole('heading', { name: 'Úton Dubajba!' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Történet' }));
    expect(screen.getByRole('dialog', { name: 'Irány Dubaj' })).toBeTruthy();
  }, 20000);
});
