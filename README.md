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
- Az első pálya teljesítéséhez **mind a nyolc pénzes raklapot a plató első két sorának aranyszegélyes dokkjaira kell rendezni**. A bejáraton álló raklap még nem számít késznek.
- Kezelés: koppintás és iránygombok, érintéses húzás, vagy a billentyűzet nyilai. Az autóknál a ferde húzás is a jármű hosszának irányát követi.
- Visszavonás, újrakezdés és pályaválasztás elérhető. A játékállás frissítéskor újraindul.

A játéktér lefogja az érintéses görgetést; az oldalt a pályán kívül lehet görgetni. Az autók és a pénzkötegekkel rakott, aranyozott raklapok helyi SVG-grafikák, külső képszolgáltatás nélkül.

## Második pálya: kikötő és Dubaj

A sikeres platórakodás után a **Következő pálya: Kikötő** gomb a nyolc tényleges raklapot továbbviszi a kikötőbe. Az új feladat külön is elindítható a garázs alján lévő gyakorlógombbal, vagy a [kikötői gyakorlólinkkel](https://reenoc.github.io/reenoc/?stage=port). A gyakorlás nem jelöli teljesítettnek a garázst.

- A béka egy mezőt foglal, az emelt raklap közvetlenül előtte helyezkedik el.
- Minden raklapnak **két szemközti villanyílása** van, sárga jelöléssel. Csak ezek felől lehet emelni; a másik két oldal zárt.
- Üresen a béka egy szabad mezőre koppintva útvonalat keres, vagy a nyilakkal és érintéses húzással léptethető.
- Felemelt raklappal csak előre-hátra haladhat. A két fordítógomb 90 fokot kanyarít, és a raklappal együtt a villanyílások is elfordulnak.
- A fordulás célmezője **és a bejárt sarokmező** is legyen szabad. A raklap nem fordítható keresztül másik pénzen, falon vagy a Porschén.
- A pénz átmenetileg bárhol letehető, és később másik használható oldalról is felvehető.
- A konténernek kétmezős ajtaja és nyolc kijelölt célmezője van. A raklapokkal nem szabad elzárni a később szükséges megközelítést és fordulóhelyet.
- Mind a nyolc raklap letétele után az **üres békát is ki kell hozni** a konténerből. Csak ekkor zárható le a konténer és indítható a Dubajba tartó hajó.
- Billentyűzet: nyilak a haladáshoz, Q / E a forduláshoz. Visszavonás és a kikötő külön újrakezdése is elérhető.

A `src/test/port-solution.json` 176 lépéses, ütközések és kétoldali megközelítés szempontjából is ellenőrzött megoldást tartalmaz. Nem minimumlépésszám, és a játékcsomag nem importálja.

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

- `src/StoryDialog.tsx`: eredeti magyar történet három retró jelenettel (garázs, kikötő, hajóindulás), pixelgrafikával és betűnkénti kiírással. Koppintással gyorsítható, átugorható, a fejléc Történet gombjával újraolvasható. Csökkentett mozgásnál a teljes szöveg azonnal látszik; a párbeszédablak alatt a játék nem vezérelhető.
- `src/game.ts`: mozgás, ütközések, felrakodás és dokkolási győzelmi feltétel.
- `src/levels.json`: a két pálya kiinduló elrendezése.
- `src/PieceArt.tsx`: fémes luxusautók és aranyozott raklapok SVG-grafikái.
- `src/App.tsx`: garázs, érintéses kezelés, rakodómezők és kampányátmenet.
- `src/port.ts`, `src/PortGame.tsx`: béka, kétoldali emelés, fordulási geometria és konténeres pálya.
- `src/port.test.ts`, `src/PortGame.test.tsx`: teljes kirakodási megoldás és kikötői felülettesztek.
- `src/game.test.ts`, `src/App.test.tsx`: játékszabályok és felülettesztek.
- `src/test/solutions.json`: a tesztekhez használt ellenőrzött megoldási lépéssorok; a játékcsomag nem importálja.

Telepítéskor használd az `npm ci` parancsot; a függőségeket a lockfile rögzíti. Titkokat ne helyezz a forráskódba. A Vite `VITE_` változói a böngésző számára nyilvánosak.
