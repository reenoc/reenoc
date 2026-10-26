import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import PortGame from './PortGame';

describe('Lapozható súgó', () => {
  it('játék közben lapozható, és bezáráskor ugyanahhoz a lépéshez tér vissza', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(screen.getByRole('button', { name: /Átugrás/ }));
    await user.click(screen.getByRole('button', { name: 'Lamborghini Aventador, 4. sor, 4. oszlop' }));
    await user.keyboard('{ArrowUp}');
    const help = screen.getByRole('button', { name: 'Játékszabályok' });
    await user.click(help);
    expect(screen.getByRole('dialog', { name: 'Szabadítsd ki az öt raklapot!' })).toBeTruthy();
    expect(document.querySelector('.game-shell')!.hasAttribute('inert')).toBe(true);
    await user.keyboard('{ArrowUp}');
    await user.click(screen.getByRole('button', { name: 'Következő tipp →' }));
    expect(screen.getByRole('dialog', { name: 'Egyetlen kijárat' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Következő tipp →' }));
    expect(screen.getByRole('dialog', { name: 'Rakodás a platós Rollsra' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Rendben, jöhet a játék!' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(help);
    expect(screen.getByRole('button', { name: 'Lamborghini Aventador, 3. sor, 4. oszlop' })).toBeTruthy();
  });

  it('a kikötőben is megállítja a vezérlést, és Escape-pel bezárható', async () => {
    const user = userEvent.setup(); render(<PortGame />);
    await user.click(screen.getByRole('button', { name: /Átugrás/ }));
    const help = screen.getByRole('button', { name: 'Kikötői szabályok' });
    await user.click(help);
    await user.keyboard('{ArrowUp}qe');
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Következő tipp →' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(help);
    expect(screen.getByRole('button', { name: 'Béka, üres, 10. sor, 6. oszlop' })).toBeTruthy();
    expect((screen.getByRole('button', { name: /Visszavonás/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
