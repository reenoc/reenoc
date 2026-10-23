# MTCSY — A nagy rakodás

Mobilra tervezett, magyar nyelvű logikai webjáték React, TypeScript és Vite használatával.

## A játék

Öt pénzes raklapot kell kijuttatni egy luxusautókkal teli garázsból, majd felpakolni Ádám platós autójára.
A platón már áll egy Porsche és három raklap: a cél mind a nyolc pénzes raklap elhelyezése.

- A garázs 6 × 6, a plató 4 × 4 mezős.
- Az autók csak a hosszuk irányában, a raklapok mind a négy irányban mozoghatnak.
- Egy mozdulat egy mező; az elemek nem fedhetik egymást, és nem hagyhatják el a pályát.
- A garázs alsó két középső mezőjén lehet kivinni a pénzt.
- A kint váró raklapok a plató alsó két középső mezőjének egyikére tölthetők fel, ha az szabad.
- Kezelés: koppintás és iránygombok, érintéses húzás, vagy billentyűzet nyilai.
- Visszavonás és újrakezdés elérhető. A győzelemhez minden pénzes raklapnak a platón kell lennie.

Ez egy játszható első pálya. A játékállás jelenleg a böngésző memóriájában él, oldalfrissítéskor újraindul.

## Fejlesztés

Node.js 24 szükséges (ellenőrzött verzió: 24.19.0, lásd `.node-version`), npm 11-gyel.
Nem szükséges adatbázis, API-kulcs vagy környezeti változó.

```sh
cd /workspace/reenoc
npm ci
npm run dev
```

A fejlesztői szerver az 5173-as portot használja. Foglalt portnál hibával áll le.
Az npm gyorsítótára a helyi `.cache/npm` mappába kerül, így írható felhasználói home nélkül is működik.
Más gépen a parancsokat az ottani projektkönyvtárból futtasd.

## Ellenőrzés és build

```sh
npm run check
```

Ez lefuttatja a Vitest teszteket, a TypeScript típusellenőrzést és a produkciós buildet.
Külön is futtatható: `npm test`, `npm run typecheck`, `npm run build`.
A tesztek ellenőrzik az ütközéseket, a mozgási szabályokat, a kijáratot, a felrakodást,
a teljes pálya megoldhatóságát és a felület alapvető interakcióit.

```sh
npm run preview
```

A build a `dist/` könyvtárba kerül, a helyi előnézet a 4173-as portot használja.
Éles kiszolgáláshoz a `dist/` tartalmát statikus tárhelyen kell publikálni.
A játék nem használ külső képeket, betűkészleteket vagy futásidejű szolgáltatásokat.

## Szerkezet

- `src/game.ts`: pálya, ütközésvizsgálat, mozgatás, felrakodás és győzelmi feltétel.
- `src/App.tsx`: játékfelület, érintéses és billentyűzetes kezelés, visszavonás.
- `src/styles.css`: mobilra tervezett megjelenés, CSS-sel rajzolt autók és raklapok.
- `src/game.test.ts`: szabályok és teljes megoldási lépéssor.
- `src/App.test.tsx`: felület, visszavonás, helyszínváltás és újrakezdés.

A függőségeket a `package-lock.json` rögzíti; telepítéskor használd az `npm ci` parancsot.
Titkokat ne helyezz a forráskódba. A Vite `VITE_` változói a böngésző számára nyilvánosak.
