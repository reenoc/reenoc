import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export type StoryChapter = 'garage' | 'port' | 'ending';
const stories = {
  garage: {
    number: '01', location: 'PRIVÁT GARÁZS · 23:47', title: 'A nagy fuvar', subtitle: 'Minden jó terv egy szűk kijáratnál kezdődik.', start: 'Induljon a játék →',
    pages: [
      { speaker: 'MESÉLŐ', text: 'A város már elcsendesedett. A garázs mélyén kilenc luxusautó csillan a lámpafényben. Közöttük öt aranyozott raklapnyi pénz vár arra, hogy végre útnak induljon.' },
      { speaker: 'ÁDÁM', text: 'A platóval itt várok a kapu előtt. A Porsche és három raklap már fent van. A másik öt még odabent… Csak egy keskeny kijáratunk van. Rád bízom a sorrendet.' },
      { speaker: 'ÁDÁM', text: 'Hozd ki mind az ötöt, aztán találj helyet a platón mind a nyolc raklapnak. Az autók nem fordulnak el maguktól. Gondolkozz előre: a következő állomás a kikötő, a rakomány úti célja pedig Dubaj.' },
    ],
  },
  port: {
    number: '02', location: 'KONTÉNERTERMINÁL · 04:12', title: 'Két oldal titka', subtitle: 'A legnehezebb rész még a rakparton vár.', start: 'Jöhet a kirakodás →',
    pages: [
      { speaker: 'MESÉLŐ', text: 'A plató begurul a daruk árnyékába. Nyolc aranyraklap, egy Porsche és egy hosszú éjszaka van mögöttetek. A távolban felbúg egy hajókürt. A dubaji járat rakodásra vár.' },
      { speaker: 'ÁDÁM', text: 'Megérkeztünk. Ott a konténer, itt a béka. De nézd meg jól a raklapokat: csak két szemközti oldalon van villanyílás. Hiába férsz mellé, ha rossz oldalról közelítesz.' },
      { speaker: 'ÁDÁM', text: 'A béka emelt raklappal csak előre-hátra gurul. A kanyarhoz szabad sarok kell. Néha előbb le kell tenned a pénzt, hogy másik oldalról férj hozzá. Mind a nyolcat pakold a konténerbe, aztán hozd ki a békát is. A hajó ránk vár.' },
    ],
  },
  ending: {
    number: '03', location: 'NYÍLT VÍZ · NAPKELTE', title: 'Irány Dubaj', subtitle: 'Nyolc raklap. Egy lezárt konténer. Sikeres fuvar.', start: 'Fuvar teljesítve ✓',
    pages: [
      { speaker: 'MESÉLŐ', text: 'A konténer ajtaja bezárul. A daru lassan a fedélzetre emeli a rakományt. Mind a nyolc aranyraklap a helyén van. Az első napsugarak már a kikötő vizén csillannak.' },
      { speaker: 'ÁDÁM', text: 'Szép munka. A garázsban még alig volt helyünk… most pedig minden a helyére került. A hajó elindult Dubaj felé. Ezt a fuvart nélküled nem oldottuk volna meg.' },
      { speaker: 'MESÉLŐ', text: 'A hajó lassan eltűnik a horizonton. A rakpart újra elcsendesedik. Ádám zsebre teszi a kulcsot, és elmosolyodik. Egy fuvar véget ért. Vajon hová vezet majd a következő?' },
    ],
  },
} satisfies Record<StoryChapter, { number: string; location: string; title: string; subtitle: string; start: string; pages: { speaker: string; text: string }[] }>;

function AdamPortrait({ narrator }: { narrator: boolean }) {
  return <svg viewBox="0 0 32 36" className="story-portrait" shapeRendering="crispEdges" aria-hidden="true">
    <path fill="#183536" d="M0 0H32V36H0Z" />
    {narrator ? <><path fill="#debb6b" d="M7 7H25V27H7ZM5 9H7V29H25V27H27V31H5Z" /><path fill="#304839" d="M11 12H22V14H11ZM11 17H22V19H11ZM11 22H19V24H11Z" /></> : <>
      <path fill="#b09157" d="M9 5H23V8H26V17H6V8H9Z" /><path fill="#e1bd88" d="M9 10H23V13H25V20H22V24H10V21H7V14H9Z" />
      <path fill="#283337" d="M7 5H24V8H26V12H22V10H11V13H7ZM10 22H13V24H20V21H23V25H20V27H12V25H10Z" />
      <path fill="#1b292c" d="M11 14H14V17H11ZM19 14H22V17H19Z" /><path fill="#bf885e" d="M16 16H18V20H15V18H16Z" />
      <path fill="#547870" d="M7 27H12V25H20V27H25V30H29V36H3V30H7Z" /><path fill="#b9c3a0" d="M12 27H15V32H17V27H20V36H12Z" />
    </>}
  </svg>;
}

function SceneArt({ chapter }: { chapter: StoryChapter }) {
  return <svg viewBox="0 0 384 176" className="story-scene" shapeRendering="crispEdges" aria-hidden="true">
    <path fill="#0d1c29" d="M0 0H384V176H0Z" />
    <path fill="#d9d2a3" d="M24 17H26V19H24ZM79 29H81V31H79ZM157 13H159V15H157ZM270 24H272V26H270ZM339 12H341V14H339Z" />
    <path fill="#142d38" d="M0 66H18V46H39V68H57V37H83V72H107V51H133V67H155V40H173V75H201V55H229V70H253V44H278V76H303V54H327V73H352V45H377V77H384V137H0Z" />
    {chapter === 'garage' ? <>
      <path fill="#d4c88c" d="M318 22H336V40H318Z" /><path fill="#314842" d="M15 69H257V151H15Z" /><path fill="#607062" d="M9 65H263V74H9ZM25 80H247V84H25Z" />
      <path fill="#101f20" d="M27 85H245V151H27Z" /><path fill="#23372e" d="M31 88H241V92H31ZM31 97H241V101H31Z" />
      <path fill="#ffe1a0" d="M35 79H57V82H35ZM213 79H235V82H213Z" /><path fill="#45594a" d="M38 133H74V116H99V123H109V145H34V137H38Z" /><path fill="#c59d56" d="M41 132H66V136H41ZM78 120H94V129H78Z" />
      <path fill="#a9654c" d="M124 124H135V114H176V124H190V143H119V130H124Z" /><path fill="#74a4a1" d="M140 117H170V126H140Z" /><path fill="#e4c65e" d="M203 108H230V133H203ZM198 135H235V141H198Z" /><path stroke="#8d6c36" strokeWidth="3" d="M207 115H227M207 121H227M214 108V133" />
      <path fill="#b5a375" d="M276 128H331V109H352L368 129V148H276Z" /><path fill="#43666b" d="M336 114H348L359 129H336Z" /><path fill="#d3ae59" d="M280 111H293V127H280ZM296 111H309V127H296ZM312 111H325V127H312Z" />
      <path fill="#080f15" d="M130 137H145V151H130ZM167 137H182V151H167ZM288 140H303V155H288ZM345 140H360V155H345Z" />
    </> : chapter === 'port' ? <>
      <path stroke="#567b7d" strokeWidth="5" fill="none" d="M22 141V48H149L52 76V141M149 48V101M273 136V30H372L301 57V136M372 30V85" />
      <path fill="#38594d" d="M165 93H299V144H165Z" /><path fill="#172e29" d="M176 100H232V144H176Z" /><path stroke="#739079" strokeWidth="3" d="M242 99V140M251 99V140M260 99V140M269 99V140M278 99V140M287 99V140" />
      <path fill="#dab764" d="M54 116H85V142H54ZM91 116H122V142H91ZM60 88H91V113H60Z" /><path stroke="#886837" strokeWidth="3" d="M57 126H82M94 126H119M64 99H87" />
      <path fill="#d5ad4d" d="M129 142H153V147H129ZM133 137H143V142H133Z" /><path fill="none" stroke="#a0b2a6" strokeWidth="3" d="M137 139V116H148V127H137" />
      <path fill="#b0a17a" d="M16 136H44V150H16Z" />
    </> : <>
      <path fill="#dbbd7a" d="M299 46H323V70H299Z" /><path fill="#527c7a" d="M0 127H384V176H0Z" /><path fill="#a5a98a" d="M0 138H77V141H0ZM294 144H384V147H294Z" />
      <path fill="#234850" d="M58 111H342L320 141H92Z" /><path fill="#81a5a0" d="M65 115H338V119H65Z" />
      <path fill="#b58d50" d="M89 88H133V109H89ZM137 88H181V109H137ZM185 88H229V109H185Z" /><path fill="#547b65" d="M112 63H156V85H112ZM160 63H204V85H160Z" />
      <path fill="#c7c6a0" d="M258 73H298V109H258ZM269 58H292V74H269Z" /><path fill="#315963" d="M265 80H290V89H265Z" /><path fill="#ad8858" d="M277 44H283V58H277Z" />
      <path fill="#8cacac" d="M67 149H127V152H67ZM166 155H242V158H166ZM282 147H338V150H282Z" />
    </>}
    {chapter !== 'ending' && <><path fill="#26372f" d="M0 151H384V176H0Z" /><path fill="#9b8b52" d="M0 153H384V156H0Z" /><path fill="#58604a" d="M18 166H69V168H18ZM110 166H161V168H110ZM202 166H253V168H202ZM294 166H345V168H294Z" /></>}
  </svg>;
}

export default function StoryDialog({ chapter, onClose, returnFocus }: { chapter: StoryChapter; onClose: () => void; returnFocus?: HTMLElement | null }) {
  const story = stories[chapter];
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const titleId = useId(), textId = useId();
  const line = story.pages[page];
  const finished = visible >= line.text.length;
  const last = page === story.pages.length - 1;
  useEffect(() => {
    const previousFocus = returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nextButton.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      queueMicrotask(() => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); });
    };
  }, [returnFocus]);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setVisible(line.text.length); return; }
    setVisible(0);
    const timer = window.setInterval(() => setVisible(count => {
      const next = Math.min(count + 2, line.text.length);
      if (next === line.text.length) window.clearInterval(timer);
      return next;
    }), 32);
    return () => window.clearInterval(timer);
  }, [line.text]);
  function advance() {
    if (!finished) { setVisible(line.text.length); return; }
    if (last) close.current(); else setPage(value => value + 1);
  }
  function handleKey(event: KeyboardEvent) {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); close.current(); }
    if (event.key === 'Tab') {
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      const first = buttons[0], lastButton = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); lastButton.focus(); }
      else if (!event.shiftKey && document.activeElement === lastButton) { event.preventDefault(); first.focus(); }
    }
  }
  return createPortal(<div className={`story-backdrop story-${chapter}`}>
    <div ref={dialog} className="story-window" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={textId} onKeyDown={handleKey}>
      <div className="story-topline"><span>MTCSY <b>/</b> STORY MODE</span><button className="story-skip" onClick={onClose}>Átugrás <span aria-hidden="true">»</span></button></div>
      <div className="story-art"><SceneArt chapter={chapter} /><span className="story-location">{story.location}</span><span className="story-rec" aria-hidden="true">● {chapter === 'ending' ? 'COMPLETE' : 'PLAY'}</span></div>
      <div className="story-heading"><span className="story-chapter">{chapter === 'ending' ? 'EPILÓGUS' : `${story.number}. FEJEZET`}</span><h2 id={titleId}>{story.title}<span aria-hidden="true">_</span></h2><p>{story.subtitle}</p></div>
      <div className="story-dialogue">
        <div className="story-speaker"><AdamPortrait narrator={line.speaker !== 'ÁDÁM'} /><div><span>{line.speaker === 'ÁDÁM' ? 'A SOFŐR' : 'MTCSY KRÓNIKÁK'}</span><strong>{line.speaker}</strong></div><span className="story-signal" aria-hidden="true">▂▄▆</span></div>
        <button className="story-copy" onClick={advance} aria-label={finished ? 'Történet folytatása' : 'Teljes szöveg megjelenítése'}>
          <span id={textId} className="sr-only" aria-live="polite" aria-atomic="true">{line.speaker}: {line.text}</span>
          <span className="story-text-space" aria-hidden="true">{line.text}</span><span className="story-typed" aria-hidden="true">{line.text.slice(0, visible)}<span className="story-cursor">▌</span></span>
        </button>
      </div>
      <div className="story-navigation"><span className="story-page" aria-label={`${page + 1}. oldal, összesen ${story.pages.length}`}><span aria-hidden="true">{story.pages.map((_, index) => <i key={index} className={index <= page ? 'read' : ''} />)}</span>0{page + 1} / 0{story.pages.length}</span><button ref={nextButton} className="story-next" onClick={advance}>{last && finished ? story.start : 'Tovább →'}</button></div>
      <p className="story-hint">{finished ? 'EGY JÓ LÉPÉS MINDENT MEGVÁLTOZTAT.' : 'KOPPINTS A SZÖVEG GYORSÍTÁSÁHOZ.'}</p>
    </div>
  </div>, document.body);
}
