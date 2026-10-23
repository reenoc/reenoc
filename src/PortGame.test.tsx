import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PortGame from './PortGame';

describe('Kikötői felület', () => {
  it('rossz oldalon nem emel; helyes oldalon felveszi, kihúzza és elfordítja a raklapot', async () => {
    const user = userEvent.setup(); render(<PortGame practice onBack={vi.fn()} />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    expect((screen.getByRole('button', { name: '↑ Raklap emelése' }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: /^Raklap 8,/ }));
    await user.click(screen.getByRole('button', { name: 'Béka ide: 8. sor, 5. oszlop' }));
    expect((screen.getByRole('button', { name: '↑ Raklap emelése' }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: /^Raklap 4,/ }));
    await user.click(screen.getByRole('button', { name: 'Béka ide: 7. sor, 5. oszlop' }));
    await user.click(screen.getByRole('button', { name: '↑ Raklap emelése' }));
    expect((screen.getByRole('button', { name: 'Béka fel' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Fordítás balra' }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Béka jobbra' }));
    await user.click(screen.getByRole('button', { name: 'Fordítás jobbra' }));
    await user.click(screen.getByRole('button', { name: '↓ Raklap letétele' }));
    expect(screen.getByRole('button', { name: 'Raklap 4, felső és alsó villanyílás, 6. sor, 6. oszlop' })).toBeTruthy();
  });

  it('az érintést a játéktér kezeli, az újrakezdés visszaállítja a nyolc raklapot', async () => {
    const user = userEvent.setup(); render(<PortGame practice onBack={vi.fn()} />); fireEvent.click(screen.getByRole('button', { name: /Átugrás/ }));
    const board = screen.getByRole('group', { name: 'Kikötő, 8 × 10 mező' });
    expect(fireEvent.touchMove(board, { cancelable: true })).toBe(false);
    expect(fireEvent.touchMove(screen.getByRole('heading', { level: 1 }), { cancelable: true })).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Béka ide: 7. sor, 5. oszlop' }));
    await user.click(screen.getByRole('button', { name: /Kikötő újrakezdése/ }));
    expect(screen.getByRole('button', { name: 'Béka, üres, 10. sor, 6. oszlop' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Raklap [1-8],/ })).toHaveLength(8);
  });
});
