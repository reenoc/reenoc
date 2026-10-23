# MTCSY — Golden Garage

Mobilra tervezett, magyar nyelvű logikai webjáték React, TypeScript és Vite használatával.

[Játék megnyitása telefonon](https://reenoc.github.io/reenoc/)

## Két kihívás

A **Nehéz** és **Profi** pálya különböző, szűk garázselrendezést ad: kilenc luxusautó és öt aranyozott pénzes raklap foglal el 26 mezőt a 36-ból. Alapból a Profi pálya indul.
Mindkettő megoldhatóságát teljes, tesztben visszajátszott lépéssor igazolja. A kezdő kijárat megnyitása több autó átrendezését igényli.

## Szabályok és felrakodás

- A garázs 6 × 6, a plató 4 × 4 mezős.
- Az autók csak hosszirányban, a pénzes raklapok mind a négy irányba mozgathatók. Egy mozdulat egy mező.
- A garázs alján csak a harmadik oszlopban van kijárat. Autót nem lehet kivinni.
- A platón már egy Porsche és három eredeti raklap áll. A garázsból kijuttatott öt raklap kint várakozik.
- A plató alsó sorának két középső mezője a rakodóhely. Előbb mozgasd el az ezeket foglaló raklapokat.
- Koppints a szabad, sárga **+ FELRAKÁS** mezőre, vagy használd a felrakodási panel gombját. A foglalt bejárat okát a panel mindig kiírja.
- A győzelemhez **mind a nyolc pénzes raklapot a plató első két sorának aranyszegélyes dokkjaira kell rendezni**. A bejáraton álló raklap még nem számít késznek.
- Kezelés: koppintás és iránygombok, érintéses húzás, vagy a billentyűzet nyilai. Az autóknál a ferde húzás is a jármű hosszának irányát követi.
- Visszavonás, újrakezdés és pályaválasztás elérhető. A játékállás frissítéskor újraindul.

A játéktér lefogja az érintéses görgetést; az oldalt a pályán kívül lehet görgetni. Az autók és a pénzkötegekkel rakott, aranyozott raklapok helyi SVG-grafikák, külső képszolgáltatás nélkül.

## Fejlesztés

Node.js 24 szükséges (ellenőrzött verzió: 24.19.0, lásd `.node-version`), npm 11-gyel. Nincs adatbázis, API-kulcs vagy futásidejű külső szolgáltatás.

```sh
cd /workspace/reenoc
npm ci
npm run dev
```

A fejlesztői szerver az 5173-as portot használja, foglalt portnál hibával áll le. Az npm írható gyorsítótára az ignorált `.cache/npm` könyvtár.
Más gépen a parancsokat az ottani projektkönyvtárból futtasd.

```sh
npm run check
```

Lefuttatja a teszteket, a TypeScript típusellenőrzést és a produkciós buildet. A tesztek mindkét pályát a teljes garázs- és platómegoldásig ellenőrzik, ütközésvizsgálattal és a raklapok számának megőrzésével.
A felülettesztek a foglalt rakodóhely visszajelzését, a tényleges felrakodást, a visszavonást, a pályaváltást és a görgetés megakadályozását is ellenőrzik.

```sh
npm run preview
```

A build a `dist/` könyvtárba kerül, az előnézet a 4173-as portot használja. A GitHub Pages `/reenoc/` alatti változatához:

```sh
npm run build -- --base=./
```

A `dist/` statikus kimenetét a `gh-pages` ág gyökerére kell publikálni, `.nojekyll` fájllal. A forráskód `main` ágra feltöltése önmagában nem frissíti az élő játékot.

## Szerkezet

- `src/game.ts`: mozgás, ütközések, felrakodás és dokkolási győzelmi feltétel.
- `src/levels.json`: a két pálya kiinduló elrendezése.
- `src/PieceArt.tsx`: fémes luxusautók és aranyozott raklapok SVG-grafikái.
- `src/App.tsx`: felület, érintéses kezelés és rakodómezők.
- `src/game.test.ts`, `src/App.test.tsx`: játékszabályok és felülettesztek.
- `src/test/solutions.json`: a tesztekhez használt ellenőrzött megoldási lépéssorok; a játékcsomag nem importálja.

Telepítéskor használd az `npm ci` parancsot; a függőségeket a lockfile rögzíti. Titkokat ne helyezz a forráskódba. A Vite `VITE_` változói a böngésző számára nyilvánosak.
