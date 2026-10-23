import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('MTCSY játékfelület', () => {
  it('egy kiválasztott raklapot billentyűzettel mozgat, és visszavonja a lépést', async () => {
    const user = userEvent.setup();
    render(<App />);
    const pallet = screen.getByRole('button', { name: 'Pénz 2, 1. sor, 3. oszlop' });
    await user.click(pallet);
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Pénz 2, 1. sor, 4. oszlop' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Visszavonás/ }));
    expect(screen.getByRole('button', { name: 'Pénz 2, 1. sor, 3. oszlop' })).toBeTruthy();
  });

  it('a platón Porsche és három eredeti raklap vár, az új játék visszaállítja a garázst', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Ádám platója/ }));
    expect(screen.getByRole('button', { name: 'Porsche, 3. sor, 1. oszlop' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Eredeti pénz/ })).toHaveLength(3);
    expect((screen.getByRole('button', { name: /Raklap felrakása/ }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: /Újrakezdés/ }));
    expect(screen.getAllByRole('button', { name: /^Pénz [1-5],/ })).toHaveLength(5);
  });
});
