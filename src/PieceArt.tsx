import { memo, useId } from 'react';

const paints: Record<string, [string, string, string]> = {
  red: ['#fa6370', '#c92238', '#610e1e'], blue: ['#b7d8ff', '#548ac4', '#1b3a64'],
  orange: ['#ffe1a0', '#ee981e', '#98500b'], teal: ['#9be2cc', '#398b7d', '#153f39'],
  silver: ['#f0f3f5', '#a6aeb3', '#414b51'], black: ['#a0a2a8', '#454a54', '#171e27'],
  gold: ['#fff0c5', '#c6aa6c', '#70552c'], white: ['#ffffff', '#e1e5e7', '#677782'],
};

export const RollsTruckArt = memo(function RollsTruckArt() {
  const id = useId().replace(/:/g, '');
  return <svg className="rolls-truck-art" viewBox="0 0 340 100" role="img" aria-label="Ádám platós Rolls-Royce-a">
    <defs><linearGradient id={`${id}-body`} x2="0" y2="1"><stop stopColor="#d9c9ad" /><stop offset=".35" stopColor="#796976" /><stop offset=".7" stopColor="#49364c" /><stop offset="1" stopColor="#201f2a" /></linearGradient><linearGradient id={`${id}-chrome`}><stop stopColor="#76828c" /><stop offset=".45" stopColor="#f6efe0" /><stop offset=".6" stopColor="#aab6bc" /><stop offset="1" stopColor="#e5e6dc" /></linearGradient></defs>
    <ellipse cx="170" cy="88" rx="147" ry="9" fill="#0008" />
    <rect x="32" y="54" width="27" height="39" rx="8" fill="#10181d" /><rect x="281" y="54" width="27" height="39" rx="8" fill="#10181d" />
    <path d="M38 58L57 37L76 9Q170 -3 264 9L283 37L302 58V83Q170 96 38 83Z" fill={`url(#${id}-body)`} stroke="#b8b09e" strokeWidth="2" />
    <path d="M83 12Q170 4 257 12L273 35Q170 27 67 35Z" fill="#193039" stroke="#d8d4c2" strokeWidth="3" /><path d="M105 15Q170 9 236 15" fill="none" stroke="#9ebfc3" strokeWidth="2" />
    <path d="M69 39Q170 29 271 39L288 59Q170 48 52 59Z" fill="#c5b69b" stroke="#e9ddc1" /><path d="M170 34V54" stroke="#746763" />
    <rect x="119" y="54" width="102" height="34" rx="2" fill={`url(#${id}-chrome)`} stroke="#e9ecdf" strokeWidth="2" />
    <rect x="126" y="59" width="88" height="24" fill="#202a30" />{Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${129 + i * 6} 59V83`} stroke="#d7dedb" strokeWidth="2" />)}
    <path d="M117 53H223L215 48H125Z" fill="#f0e6d1" /><path d="M170 49V40M170 41L162 35L169 37L173 31L176 36L171 43" fill="none" stroke="#eee7d2" strokeWidth="2" />
    <path d="M54 59H104V74H54ZM236 59H286V74H236Z" fill="#e5f3e7" stroke="#a4b9bc" strokeWidth="3" /><path d="M59 64H98M242 64H281" stroke="#adcecd" strokeWidth="3" />
    <path d="M45 81H113M227 81H295" stroke={`url(#${id}-chrome)`} strokeWidth="5" />
    <rect x="159" y="50" width="22" height="12" rx="1" fill="#e1d8c3" stroke="#9b9b92" /><text x="170" y="59" textAnchor="middle" fill="#333747" fontFamily="Georgia,serif" fontWeight="bold" fontSize="9">RR</text>
    <text x="170" y="96" textAnchor="middle" fill="#e4d0a2" fontSize="6" letterSpacing="2">ROLLS-ROYCE · ÁDÁM EGYEDI PLATÓSA</text>
  </svg>;
});

export const CarArt = memo(function CarArt({ model, color, vertical }: { model: string; color: string; vertical: boolean }) {
  const id = useId().replace(/:/g, '');
  const [light, mid, dark] = paints[color] ?? paints.blue;
  const boxy = /mercedes|range|rolls|limousine/.test(model);
  const wedge = /lambo|mclaren/.test(model);
  const porsche = /porsche/.test(model);
  const body = boxy
    ? 'M25 15 Q17 15 17 25 V63 Q17 73 28 73 H192 Q204 73 204 61 V27 Q204 15 192 15 Z'
    : wedge
      ? 'M24 20 L68 11 L168 14 L207 27 L214 40 L207 65 L161 75 L62 76 L22 65 L12 44 Z'
      : porsche
        ? 'M22 23 C37 10 69 9 106 13 L162 15 Q197 13 211 31 Q221 44 211 57 Q198 76 162 73 L104 76 Q44 81 22 64 Q8 48 22 23 Z'
        : 'M25 21 Q55 9 92 12 L162 15 Q201 16 212 33 L215 44 L210 59 Q199 73 163 73 L90 77 Q49 79 25 66 Q8 47 25 21 Z';
  return <svg className="vehicle-art" viewBox={vertical ? '0 0 88 220' : '0 0 220 88'} aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={light} /><stop offset=".2" stopColor={mid} /><stop offset=".5" stopColor={light} /><stop offset=".7" stopColor={mid} /><stop offset="1" stopColor={dark} /></linearGradient>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b8dce6" /><stop offset=".25" stopColor="#294353" /><stop offset=".7" stopColor="#101f2c" /><stop offset="1" stopColor="#769baf" /></linearGradient>
      <linearGradient id={`${id}-hood`}><stop stopColor={mid} /><stop offset=".55" stopColor={light} /><stop offset="1" stopColor={mid} /></linearGradient>
    </defs>
    <g transform={vertical ? 'translate(88 0) rotate(90)' : undefined}>
      <path d={body} fill="#000" opacity=".4" transform="translate(1 5)" />
      {[53, 160].map(x => <g key={x}><rect x={x} y="8" width="29" height="15" rx="4" fill="#080c10" /><rect x={x + 2} y="9" width="25" height="3" rx="1" fill="#353a3e" /><rect x={x} y="65" width="29" height="15" rx="4" fill="#080c10" /><rect x={x + 2} y="76" width="25" height="2" fill="#555c60" /></g>)}
      <path d={body} fill={`url(#${id}-paint)`} stroke={dark} strokeWidth="2" />
      <path d="M38 20 Q103 10 174 21 M36 69 Q107 79 177 68" fill="none" stroke={light} strokeWidth="1.4" opacity=".8" />
      <path d={boxy ? 'M66 22 H142 L154 31 V58 L143 67 H65 L57 59 V31 Z' : 'M69 21 Q102 16 131 22 L153 32 L155 55 L134 65 Q101 73 69 66 L49 56 L48 32 Z'} fill={dark} stroke={light} strokeWidth="1" />
      <path d={boxy ? 'M138 24 L149 32 V56 L138 65 L130 60 V29 Z' : 'M133 24 L149 33 L150 54 L134 64 L125 58 V29 Z'} fill={`url(#${id}-glass)`} stroke="#18303a" />
      <path d={boxy ? 'M66 25 H81 V63 H66 L61 56 V32 Z' : 'M69 24 L82 28 L78 59 L68 64 L54 55 L53 34 Z'} fill={`url(#${id}-glass)`} />
      <path d={boxy ? 'M84 24 H126 V64 H84 Z' : 'M87 25 Q105 22 123 27 V61 Q103 67 84 62 Z'} fill={`url(#${id}-hood)`} stroke={light} strokeWidth=".8" />
      {boxy && <><path d="M87 28 H122 M87 60 H122 M96 25 V63" stroke={dark} strokeWidth="1.4" opacity=".65" /><rect x="20" y="31" width="9" height="26" rx="2" fill="#172128" stroke={light} /></>}
      <path d="M156 26 Q180 24 199 32 L200 56 Q177 65 156 61" fill="none" stroke={dark} opacity=".65" />
      <path d="M166 29 L192 32 M166 59 L192 56" stroke={light} strokeWidth="1" opacity=".7" />
      <path d="M83 19 L128 20 M83 69 L128 68" stroke={dark} strokeWidth="2" /><path d="M101 19 H111 M101 69 H111" stroke="#e5e8e1" strokeWidth="2.5" />
      <path d="M129 16 L140 9 L145 12 L141 22 M129 72 L140 79 L145 76 L141 66" fill={mid} stroke={dark} />
      {wedge && <><path d="M24 26 L44 22 M24 62 L44 66 M157 28 L166 32 M157 60 L166 56" stroke="#142129" strokeWidth="4" /><path d="M23 18 V70" stroke="#172128" strokeWidth="5" /></>}
      {porsche ? <><ellipse cx="198" cy="29" rx="9" ry="5" fill="#eef6e8" stroke="#71909e" /><ellipse cx="198" cy="59" rx="9" ry="5" fill="#eef6e8" stroke="#71909e" /></> : <><path d={wedge ? 'M197 23 L207 31 L197 33' : 'M194 23 L204 28 L204 33 L194 31'} fill="#f1fcf6" /><path d={wedge ? 'M197 65 L207 57 L197 55' : 'M194 65 L204 60 L204 55 L194 57'} fill="#f1fcf6" /></>}
      <path d="M28 23 V31 M28 57 V65" stroke="#ff3349" strokeWidth="4" /><path d="M208 36 V51" stroke="#1d2930" strokeWidth="3" />
      <path d="M41 19 Q102 9 181 22" fill="none" stroke="#fff" strokeWidth="2" opacity=".45" />
    </g>
  </svg>;
});

export const PalletArt = memo(function PalletArt() {
  const id = useId().replace(/:/g, '');
  return <svg className="pallet-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs><linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3ac" /><stop offset=".25" stopColor="#e5be46" /><stop offset=".5" stopColor="#fff2b7" /><stop offset=".75" stopColor="#bd8421" /><stop offset="1" stopColor="#f3ce59" /></linearGradient><linearGradient id={`${id}-cash`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c8dba7" /><stop offset="1" stopColor="#6b9163" /></linearGradient></defs>
    <ellipse cx="50" cy="86" rx="40" ry="7" fill="#000" opacity=".3" />
    <path d="M8 65 L78 59 L94 70 L24 80 Z" fill={`url(#${id}-gold)`} stroke="#b17c1d" />
    <path d="M8 65 V79 L24 91 V80 Z M24 80 L94 70 V83 L24 93 Z" fill="#ba8126" stroke="#f0ca64" />
    <path d="M30 82 V91 M48 79 V88 M68 77 V85 M87 73 V82" stroke="#4a381b" strokeWidth="7" /><path d="M25 89 L94 80" stroke="#ffe8a0" strokeWidth="3" />
    {[{ x: 12, y: 35 }, { x: 44, y: 31 }, { x: 26, y: 12 }].map(({ x, y }) => <g key={x} transform={`translate(${x} ${y})`}><path d="M0 9 L30 5 L41 12 V34 L10 39 L0 32 Z" fill="#5c7950" stroke="#294830" /><path d="M1 14 L11 21 L40 17 M1 20 L11 27 L40 23 M1 26 L11 33 L40 29" fill="none" stroke="#c1c998" strokeWidth="1.5" /><path d="M0 9 L30 5 L41 12 L10 17 Z" fill={`url(#${id}-cash)`} stroke="#deebbe" /><path d="M11 8 L21 7 L32 14 V35 L22 37 V16 Z" fill="#f7e5ad" /><path d="M3 10 L10 14 M30 8 L36 11" stroke="#315939" strokeWidth="1.5" /></g>)}
    <path d="M10 66 L24 74 L90 66 M11 65 L11 75" fill="none" stroke="#fff5c7" strokeWidth="2" />
  </svg>;
});
