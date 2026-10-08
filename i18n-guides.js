// The Serbian text of the guides. Like i18n.js, no page loads this file: tools/build-sr.mjs reads both and writes each
// guide's Serbian copy, sr/guides/<x>/index.html, from guides/<x>/index.html with these texts in. After editing this
// file or a guide, run `node tools/build-sr.mjs` and commit the sr/ pages with them.
//
// The marks are those of i18n.js (data-i18n, data-i18n-text, data-i18n-alt, -aria-label, -content). The texts a guide
// shares with the home page (the bar, the closing, the alts of the pictures, the slot folder) are in i18n.js; the
// guides' own keys start with "g." and are here, one block per page. A key is in one of the two files, never both.
//
// The addresses in these texts are the English page's (/, /#loop, /guides/...): the build points them at /sr/.
// What stays English, with lang="en": the words quoted from a vendor's page or from the app (they are its own words),
// the app's labels in „…” (as in i18n.js), and what goes into a prompt.
// A date is written <time></time>: the build takes it from the English page's <time datetime> and says it in Serbian.

const SR = {
  /* ---- shared by the guides ---- */
  "g.nav.label": "Sajt",
  "g.crumbs.label": "Putanja",
  "g.crumbs.home": "Asset Prompter",
  "g.updated": "Ažurirano <time></time>",
  "g.byline":
    'Piše <a href="https://github.com/Djordje1998" target="_blank" rel="noopener author">Đorđe Novaković</a>, autor Asset Promptera · Ažurirano <time></time>',

  /* ---- /guides/: the list ---- */
  "g.hub.title": "Asset Prompter vodiči: agenti, alati za slike i video",
  "g.hub.description":
    "Kako su nastale slike ovog sajta, koji generatori slika i videa imaju API ili MCP server i kako slike stižu u projekat agenta za programiranje.",
  "g.hub.h1": "Vodiči",
  "g.hub.lead": "Beleške autora Asset Promptera, svaka sa datumom i izvorima.",
  "g.hub.made.h": "Kako su nastale slike na ovom sajtu",
  "g.hub.made.p":
    "Slotovi iza ilustracija i klipova ovog sajta, kako agent proverava klip koji ne može da gleda i kako su odobreni fajlovi postali ovi koje vidiš.",
  "g.hub.api.h": "Koji generatori slika i videa imaju API ili MCP server",
  "g.hub.api.p":
    "Tabela sa datumom, za dvanaest generatora i pet agenata za programiranje: ko ima javni API, ko ima zvanični MCP server i kako se koji naplaćuje pored tvoje pretplate.",
  "g.hub.ways.h": "Pet načina da generisane slike i video stignu u projekat tvog agenta za programiranje",
  "g.hub.ways.p":
    "Ugrađeni alati, MCP serveri, plaćeni API, kopiranje i lepljenje ili zajednički folder: ko u kom slučaju pritiska „Generate”, koliko to košta i kada ti Asset Prompter ne treba.",

  /* ---- /guides/how-this-site-was-made/ ---- */
  "g.made.title": "Kako su ilustracije sajta napravljene u alatu Google Flow",
  "g.made.description":
    "Pravi fajlovi iza slika ovog sajta: slotovi Asset Promptera, ilustracije generisane u alatu Google Flow, listovi sa frejmovima i mapa pokreta klipa, izvoz.",
  "g.made.crumb": "Kako je nastao ovaj sajt",
  "g.made.h1": "Kako su nastale slike na ovom sajtu",
  "g.made.lead":
    "Piše u podnožju: ilustracije su generisane ručno u alatu Google Flow, preko Asset Promptera. Evo slotova, fajlova i koraka iza njih.",
  "g.made.1.h": "Jedan projekat, slot za svaki aset",
  "g.made.1.p1":
    'Svaka ilustracija i svaki klip u folderu <code>assets/art/</code> ovog sajta nastali su u jednom projektu Asset Promptera, <code>asset-prompter-landing</code>. Svaki je tražen kao <strong>slot</strong>, folder za jedan aset. Svaki od tih fajlova nosi ime slota svoje slike: <code>&lt;slot&gt;.webp</code> za sliku, <code>&lt;slot&gt;.mp4</code> za klip koji počinje njome. Ilustracije su generisane ručno u alatu Google Flow. Dve generisane fotografije u delu <a href="/#uses">„Čemu služi”</a> na početnoj stranici su rezultati iz projekta <code>orbital-eats</code>, iz kog potiču snimci ekrana aplikacije.',
  "g.made.t.caption": "Slotovi iza fajlova na početnoj stranici i gde su ti fajlovi. Dimenzije su izmerene na fajlovima 8. oktobra 2026.",
  "g.made.t.slot": "Slot",
  "g.made.t.kind": "Vrsta",
  "g.made.t.where": "Gde je na početnoj stranici",
  "g.made.t.file": "Fajl na sajtu",
  "g.made.t.1.kind": "Slika",
  "g.made.t.1.where": "Vrh stranice, kao slika pre nego što krene njen klip",
  "g.made.t.2.kind": "Video slot: klip sa vrha stranice",
  "g.made.t.2.where":
    'Vrh stranice i <a href="/#agent">„Proverava klip koji ne može da pusti”</a>, sa listom sa frejmovima 003 i mapom pokreta njegove verzije 2',
  "g.made.t.2.file":
    "<code>assets/art/loop-relay.mp4</code> i <code>loop-relay-av1.mp4</code>; <code>assets/demo/clip-loop-relay-frames.webp</code>, 1280 × 720; <code>clip-loop-relay-motion.webp</code>, 640 × 360",
  "g.made.t.3.kind": "Slika",
  "g.made.t.3.where": '<a href="/#mcp">„Za tvog agenta, isti koraci kao sa MCP serverom”</a>',
  "g.made.t.4.kind": "Slika",
  "g.made.t.4.where": '<a href="/#why">„Bez njega, kurir si ti”</a>',
  "g.made.t.5.kind": "Slika",
  "g.made.t.5.where": '<a href="/#tradeoffs">„Sam ne generiše ništa”</a>',
  "g.made.t.6.kind": "Slika i klip koji počinje njome (njegov video slot ovde nije zabeležen)",
  "g.made.t.6.where": "Završna sekcija, „Daj svom agentu način da traži slike.”",
  "g.made.t.6.file": "<code>assets/art/gallery-full.webp</code>, 1280 × 714; <code>gallery-full.mp4</code> i <code>gallery-full-av1.mp4</code>",
  "g.made.1.p2":
    "Na stranici su prvo bili slotovi, pa tek onda slike. Dok fajl slota ne postoji, stranica na mestu koje će on zauzeti crta isprekidani okvir sa imenom slota i opisom onoga što slika treba da prikaže, pod istom oznakom „Needs generating” koju aplikacija stavlja na karticu koja čeka na tebe:",
  "g.made.missing.hint":
    "osoba trči između oblačića iz četa i gomile slika dok papiri lete na sve strane, a robot čeka i ništa od toga ne vidi.",
  "g.made.missing.caption":
    "Ono što početna stranica prikazuje na mestu slike pre nego što njen fajl postoji: kôd same stranice, ne snimak ekrana.",
  "g.made.2.h": "Krug kroz koji slika prolazi",
  "g.made.2.p1":
    'Slot je folder u kojem se agent i ti smenjujete. <a href="/#loop">Šest koraka na početnoj stranici</a> pokazuju jednu sliku kroz ceo krug; ovde je ko piše koji fajl, onako kako folder opisuje <a href="https://github.com/Djordje1998/asset-prompter/blob/master/README.md#the-folder" target="_blank" rel="noopener">README</a> aplikacije:',
  "g.made.2.list":
    "<li>Agent piše <code>slot.md</code>, čemu aset služi, i <code>v1.md</code>: prompt, sa podešavanjima ispred njega (<code>tool</code>, <code>type</code>, <code>model</code>, <code>mode</code>, <code>aspect_ratio</code>, <code>duration</code>, <code>inputs</code>).</li>\n" +
    "              <li>Ti kopiraš prompt u generator, tamo pritisneš „Generate” i rezultat prevučeš na karticu slota. On završava u <code>v1/</code>.</li>\n" +
    "              <li>Agent otvara rezultat i piše <code>v1.review.md</code>, sa <code>verdict: approve</code> ili <code>verdict: revise</code>.</li>\n" +
    "              <li>Ako nešto treba promeniti, ti pišeš <code>v1.feedback.md</code>, ili agent sam odluči da menja, i agent piše <code>v2.md</code>.</li>\n" +
    "              <li>Ti odobravaš. Time nastaje <code>APPROVED</code>, a aplikacija kopira rezultat u <code>final.png</code> (ili <code>final.mp4</code>), fajl koji agent koristi.</li>",
  "g.made.tree.slot": "čemu aset služi",
  "g.made.tree.results": "tvoji rezultati",
  "g.made.tree.review": "agentov pregled",
  "g.made.tree.exports": "agentove varijante",
  "g.made.2.flow.h": "Šta Google Flow traži od prompta",
  "g.made.2.flow.p":
    'Agent generator upoznaje iz njegovog preseta. <a href="https://github.com/Djordje1998/asset-prompter/blob/master/presets/google-flow.md" target="_blank" rel="noopener">Preset za Google Flow</a> u Asset Prompteru (proveren 6. oktobra 2026.) mu, između ostalog, kaže:',
  "g.made.2.flow.list":
    '<li>Flow nema negativni prompt ni seed, pa ono što treba izostaviti ide u sam prompt (<span lang="en">„no people, no text”</span>).</li>\n' +
    "              <li>Video samo iz prompta je režim <code>frames</code> bez početnog frejma.</li>\n" +
    '              <li>Video stiže sa generisanim zvukom, a Flow nema prekidač za zvuk po klipu: opiši zvuk u promptu ili napiši <span lang="en">„no sound”</span>.</li>\n' +
    "              <li>Svaki nalog dobija 50 kredita dnevno; Veo 3.1 Lite košta 10 po generisanju, a Quality 100.</li>",
  "g.made.2.p2":
    "Za klip koji kreće od slike, uputstvo aplikacije za agenta kaže da se koriste dva slota: slika, pa video slot čiji je ulaz <code>start_frame</code> postavljen na <code>slot: &lt;slot slike&gt;</code>. Aplikacija video slot drži na čekanju dok slika ne bude odobrena, pa se ništa ne generiše iz nacrta.",
  "g.made.3.h": "Kako agent proverava klip koji ne može da gleda",
  "g.made.3.p1":
    'Agent ne može da gleda video. Zato za svaki klip koji prevučeš na karticu aplikacija pokreće ffmpeg (Setup ga instalira na Windowsu i Linuxu) i pretvara ga u slike i brojeve koje agent može da pročita (<a href="https://github.com/Djordje1998/asset-prompter/blob/master/src/server/analysis.ts" target="_blank" rel="noopener">src/server/analysis.ts</a>):',
  "g.made.3.list":
    "<li><strong>Listovi sa frejmovima</strong>: četiri frejma u sekundi, na 250 ms jedan od drugog, u mreži 2 × 2, svaki frejm 640 px po dužoj strani, pa je list ovog klipa 1280 × 720. Po jedan list za svaku sekundu, pa osmosekundni klip ispod ima osam listova, od <code>001.jpg</code> do <code>008.jpg</code>, koji se čitaju sleva nadesno, odozgo nadole.</li>\n" +
    "              <li><strong><code>first-last.jpg</code></strong>: prvi i poslednji frejm jedan pored drugog, da se vidi da li se kraj klipa u petlji spaja sa njegovim početkom.</li>\n" +
    "              <li><strong><code>motion.jpg</code></strong>, mapa pokreta: crvenom bojom je označeno ono što se promenilo tokom klipa, preko zatamnjenog prvog frejma.</li>\n" +
    "              <li>Za svaku sekundu, koliko se slika pomerila u odnosu na prvi frejm i na prethodni, u procentima, u <code>info.md</code>.</li>",
  "g.made.3.p2":
    "Evo klipa sa vrha početne stranice, uz list sa frejmovima 003 i mapu pokreta slota <code>loop-relay-clip</code>, verzija 2. Klip na sajtu traje osam sekundi, 1280 × 720, 24 frejma u sekundi, bez zvučnog zapisa. Pokreni ga da ga pogledaš.",
  "g.made.clip.alt": "Klip sa vrha početne stranice: robot pruža list sa promptom ka zajedničkom folderu, a osoba iz njega vadi sliku.",
  "g.made.3.p3":
    'Ono što slike ne mogu da prenesu je zvuk. Kao što početna stranica kaže među <a href="/#tradeoffs">kompromisima</a>: agent ne čuje, a provera zvuka u klipu je tvoj posao.',
  "g.made.4.h": "Od odobrenog fajla do ovog sajta",
  "g.made.4.p1": "Kada je slot bio odobren, njegov konačni fajl je u četiri koraka stigao u repozitorijum ovog sajta:",
  "g.made.4.list":
    "<li>Odobri slot u Asset Prompteru.</li>\n" +
    "              <li>Pretvori njegov <code>final.png</code> u <code>assets/art/&lt;slot&gt;.webp</code>. Širina od oko 1400 px je sasvim dovoljna; fajlovi ovde su široki 1280 i 960 px.</li>\n" +
    "              <li>Za klip, sačuvaj <code>final.mp4</code> kao <code>assets/art/&lt;slot&gt;.mp4</code>, bez zvuka.</li>\n" +
    "              <li>Napravi AV1 kopiju klipa i zadrži je samo ako svaki njen frejm ima SSIM od najmanje 0,995 u odnosu na H.264 frejm:</li>",
  "g.made.4.p2":
    'AV1 kopije imaju otprilike upola manje bajtova: <code>loop-relay</code> ima 365 KiB naspram 776 KiB u H.264, a <code>gallery-full</code> 245 KiB naspram 536 KiB. Najniži SSIM jednog frejma u ta dva klipa bio je 0,9956. Početna stranica uzima AV1 fajl samo tamo gde pregledač na pitanje da li ga pušta odgovori <span lang="en">„probably”</span> i uz to, gde to može da utvrdi, kaže da AV1 dekodira hardverski, ili uopšte ne pušta H.264; inače, ili ako AV1 fajl javi grešku, uzima H.264 fajl.',
  "g.made.4.exports.h": "Dimenzije i isečci nastaju iz odobrenog fajla",
  "g.made.4.p3":
    "Folder <code>exports/</code> u slotu sadrži ono što agent napravi od konačnog fajla: isečke, druge dimenzije, druge formate i sitne izmene, bez novog generisanja. Aplikacija ih prikazuje pored konačne slike, svaku sa dugmetom „Copy image”. Dijalog ispod je iz slota <code>hero-space-diner</code> u projektu <code>orbital-eats</code>, iz kog potiču snimci ekrana aplikacije na početnoj stranici, a ne iz projekta ovog sajta.",
  "g.made.4.caption": "Varijante jedne odobrene slike: WebP 1920 × 1080, JPG 1200 × 630 za kartice na društvenim mrežama i kvadratni isečak.",
  "g.made.5.h": "Jedna revizija, onako kako je aplikacija prikazuje",
  "g.made.5.p1":
    "Snimci ekrana aplikacije na početnoj stranici potiču iz tog projekta, iz slota <code>observation-dining-room</code>. U samom projektu taj slot još čeka odobrenje; snimci prikazuju pripremljenu kopiju. Kako se čita sa kartica, njegova revizija je tekla ovako:",
  "g.made.5.list":
    '<li><code>slot.md</code>: <q lang="en">Atmospheric photograph for the \'About Our Dining Experience\' section of the website. It must show the spacious seating area and the realistic observation lounge overlooking outer space.</q></li>\n' +
    '              <li>Verzija 1: Image, 16:9, Nano Banana Pro, prompt od 374 znaka koji počinje sa <q lang="en">Eye-level wide photograph of the main observation dining hall in an orbital restaurant.</q></li>\n' +
    '              <li>Zahtev za izmenu na verziji 1: <q lang="en">Too cold and empty. Make the booths warm cognac leather, add warm ceiling lights, and let the sun rise over the horizon.</q></li>\n' +
    '              <li>Verzija 2, prompt od 637 znakova. Agentova beleška: <q lang="en">Changed in v2: Warm cognac booths, warm ceiling light strips and a sunrise over the horizon; v1 was cold and empty.</q></li>\n' +
    '              <li>Tri rezultata za verziju 2 i agentova ocena <q lang="en">Agent approves, picks 2.png</q>, slika od 1376&nbsp;×&nbsp;768.</li>',
  "g.made.5.caption":
    "Odobrena verzija 2: tri rezultata sa izabranim 2.png, agentov pregled i, skupljen ispod, zahtev za izmenu na verziji 1.",
  "g.made.6.h": "Šta je bilo potrebno, a šta aplikacija nije radila",
  "g.made.6.p1":
    'Svaka ilustracija je generisana ručno: neko je nalepio prompt u Google Flow i tamo pritisnuo „Generate”. Asset Prompter sam ne generiše ništa. Flow nema javni API (vidi <a href="/guides/image-generators-api-mcp/">koji generatori imaju API ili MCP server</a>), pa agent u njemu ne može da pritisne „Generate”; ono što je folder dao agentu bili su rezultati, da ih vidi, pregleda i traži ponovo.',
  "g.made.6.p2":
    'Za serije koje se izvršavaju dok nisi tu, izaberi generator koji ima API ili MCP server. Ostali načini, i kada koji odgovara, opisani su u vodiču <a href="/guides/get-images-into-coding-agent-project/">pet načina da slike stignu u projekat tvog agenta za programiranje</a>.',

  /* ---- /guides/image-generators-api-mcp/ ---- */
  "g.api.title": "Generatori slika i videa sa API-jem ili MCP serverom (2026)",
  "g.api.description":
    "Koji generatori slika i videa imaju javni API ili zvanični MCP server i šta to znači za Claude Code, Codex ili Cursor. Provereno 8. oktobra 2026.",
  "g.api.crumb": "Generatori sa API-jem ili MCP-om",
  "g.api.h1": "Koji generatori slika i videa imaju API ili MCP server",
  "g.api.lead":
    "Agent za programiranje može da pritisne „Generate” samo tamo gde mu generator otvori pristup: preko API-ja ili MCP servera. Evo koji to rade, koliko to košta i izvor za svaki, provereno 8. oktobra 2026.",
  "g.api.short.h": "Kratak odgovor",
  "g.api.short.1":
    "<strong>Midjourney i Google Flow nemaju javni API.</strong> Pravila servisa Midjourney zabranjuju njegovu automatizaciju; modeli koje Flow koristi, Veo i Nano Banana, dostupni su u Gemini API-ju kompanije Google, koji se naplaćuje odvojeno od Google AI pretplate.",
  "g.api.short.2":
    "<strong>ChatGPT Images, Grok Imagine, Leonardo.Ai i Luma imaju API</strong>, koji se, gde proizvođač to navodi, naplaćuje odvojeno od pretplate na aplikaciju. Leonardo ima i MCP server, a Lumina GitHub organizacija ima jedan; oba rade preko te API naplate.",
  "g.api.short.3":
    "<strong>Higgsfield, Ideogram, Krea, Kling i Runway imaju zvanične MCP servere</strong> na koje se prijavljuješ svojim nalogom; Ideogram i Runway kažu da korišćenje preko MCP-a troši istu pretplatu ili kredite kao i njihova aplikacija.",
  "g.api.table.h": "Sedam generatora za koje Asset Prompter ima presete",
  "g.api.table.p":
    '<a href="/#questions">Preseti stižu</a> uz aplikaciju za ovih sedam. „Nije pronađeno” znači da izjava samog proizvođača nije pronađena ni u jednom smeru, a ne da ta stvar ne postoji.',
  "g.api.a.caption": "Sedam generatora sa presetima, provereno 8. oktobra 2026. Pretplate i API-ji se često menjaju; svaki red navodi svoje izvore.",
  "g.api.a.h0": "Generator",
  "g.api.a.h1": "Javni API",
  "g.api.a.h2": "Naplata API-ja",
  "g.api.a.h3": "Zvanični MCP server",
  "g.api.a.h4": "Izvori",
  "g.api.a.1.1":
    '<span class="tag t-approved"><svg class="icon" width="12" height="12" aria-hidden="true"><use href="#i-check" /></svg>Da</span> API za generisanje slika kompanije OpenAI.',
  "g.api.a.1.2":
    'Naplaćuje se odvojeno. Centar za pomoć kompanije OpenAI navodi API među onim što ChatGPT Plus ne uključuje: <q lang="en">API usage is separate and billed independently.</q>',
  "g.api.a.1.3": '<span class="tag t-review">Nije pronađeno</span> OpenAI-jev nije pronađen.',
  "g.api.a.1.4":
    '<span class="src"><a href="https://developers.openai.com/api/docs/guides/image-generation" target="_blank" rel="noopener">OpenAI: generisanje slika</a>; <a href="https://help.openai.com/en/articles/6950777" target="_blank" rel="noopener">OpenAI pomoć: ChatGPT Plus</a>; <a href="https://help.openai.com/en/articles/9039756" target="_blank" rel="noopener">naplata</a></span>',
  "g.api.a.2.1":
    '<span class="tag t-generate">Ne</span> Njegove smernice za zajednicu: <q lang="en">Midjourney does not provide an API, nor provide third-party apps or scripts, and automating interactions with Midjourney service is strictly prohibited</q>, uz retke izuzetke koje izričito odobri.',
  "g.api.a.2.2": "Nema API-ja koji bi se naplaćivao.",
  "g.api.a.2.3":
    '<span class="tag t-generate">Ne</span> Nezvanični „Midjourney API” i MCP omotači trećih strana upravljaju tvojim nalogom automatizovano, što njegovi uslovi korišćenja zabranjuju.',
  "g.api.a.2.4":
    '<span class="src"><a href="https://docs.midjourney.com/hc/en-us/articles/32013696484109-Community-Guidelines" target="_blank" rel="noopener">Midjourney: smernice za zajednicu</a>; <a href="https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service" target="_blank" rel="noopener">uslovi korišćenja</a></span>',
  "g.api.a.3.1":
    '<span class="tag t-generate">Ne</span> Sam Flow nema API. Njegovi modeli, Veo 3.1 za video i Nano Banana za slike, dostupni su u Gemini API-ju kompanije Google i na platformi Vertex AI.',
  "g.api.a.3.2":
    "Naplaćuje se odvojeno. Google: pogodnosti Google AI pretplate važe u veb-aplikaciji AI Studio; korišćenje Gemini API-ja sa API ključem naplaćuje se posebno.",
  "g.api.a.3.3":
    '<span class="tag t-review">Nije pronađeno</span> Za Flow nije pronađen. Googleov spisak MCP servera navodi Genmedia, <q lang="en">including Imagen and Veo models</q>; README samog Genmedia navodi Gemini Image i Veo, Imagen označava kao zastareo i kaže <q lang="en">This is not an officially supported Google product.</q>',
  "g.api.a.3.4":
    '<span class="src"><a href="https://ai.google.dev/gemini-api/docs/veo" target="_blank" rel="noopener">Gemini API: Veo</a>; <a href="https://ai.google.dev/gemini-api/docs/google-ai-plans" target="_blank" rel="noopener">Google AI pretplate</a>; <a href="https://github.com/google/mcp" target="_blank" rel="noopener">google/mcp</a>; <a href="https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia" target="_blank" rel="noopener">Genmedia README</a></span>',
  "g.api.a.4.1":
    '<span class="tag t-review">Odvojeno</span> Za samu aplikaciju Dreamina nije pronađen. BytePlus prodaje njene modele kao API na platformi ModelArk: <q lang="en">Dreamina Seedance 2.0 is now available through ModelArk on BytePlus, giving businesses and developers API access</q>, a ModelArk-ov API za generisanje slika ima modele Seedream.',
  "g.api.a.4.2":
    'ModelArk je poseban BytePlus nalog, sa svojim API ključevima i naplatom.',
  "g.api.a.4.3": '<span class="tag t-review">Nije pronađeno</span>',
  "g.api.a.4.4":
    '<span class="src"><a href="https://www.byteplus.com/en/blog/dreamina-seedance2-0" target="_blank" rel="noopener">BytePlus: Dreamina Seedance 2.0</a>; <a href="https://docs.byteplus.com/en/docs/ModelArk/1541523" target="_blank" rel="noopener">ModelArk: API za generisanje slika</a></span>',
  "g.api.a.5.1":
    '<span class="tag t-approved"><svg class="icon" width="12" height="12" aria-hidden="true"><use href="#i-check" /></svg>Da</span> API kompanije xAI nudi generisanje slika i videa modelom Grok Imagine.',
  "g.api.a.5.2":
    "Preko xAI konzole za programere. Da li Grok pretplata pokriva ikakvo korišćenje API-ja: nije pronađeno na stranicama kompanije xAI.",
  "g.api.a.5.3": '<span class="tag t-review">Nije pronađeno</span> xAI-jev nije pronađen; pronađeni su samo serveri zajednice.',
  "g.api.a.5.4":
    '<span class="src"><a href="https://docs.x.ai/developers/model-capabilities/video/generation" target="_blank" rel="noopener">xAI dokumentacija: generisanje videa</a>; <a href="https://x.ai/news/grok-imagine-api" target="_blank" rel="noopener">xAI: Grok Imagine API</a></span>',
  "g.api.a.6.1":
    '<span class="tag t-approved"><svg class="icon" width="12" height="12" aria-hidden="true"><use href="#i-check" /></svg>Da</span> Leonardo.Ai API.',
  "g.api.a.6.2": 'Naplaćuje se odvojeno. Njegov vodič za početak: <q lang="en">API access is separate from free or web app subscriptions.</q>',
  "g.api.a.6.3":
    '<span class="tag t-approved"><svg class="icon" width="12" height="12" aria-hidden="true"><use href="#i-check" /></svg>Da</span> Leonardo.Ai MCP server. Potrebni su mu API ključ i API pretplata, pa radi preko naplate API-ja, a ne veb-pretplate.',
  "g.api.a.6.4":
    '<span class="src"><a href="https://docs.leonardo.ai/docs/getting-started" target="_blank" rel="noopener">Leonardo: prvi koraci</a>; <a href="https://docs.leonardo.ai/docs/connect-to-leonardoai-mcp" target="_blank" rel="noopener">Leonardo: MCP server</a></span>',
  "g.api.a.7.1":
    '<span class="tag t-approved"><svg class="icon" width="12" height="12" aria-hidden="true"><use href="#i-check" /></svg>Da</span> Luma API.',
  "g.api.a.7.2":
    'Naplaćuje se odvojeno. Luma: <q lang="en">Dream Machine subscriptions and API are separate—credits do not transfer between them.</q>',
  "g.api.a.7.3":
    '<span class="tag t-review">U Luminom GitHubu</span> <code>luma-api-mcp</code>, u Luminoj GitHub organizaciji; njegov README ne kaže da je zvaničan. Podešava se API ključem sa Lumine stranice za API ključeve, pa radi preko API kredita. Njegov README navodi modele za slike <code>photon-1</code> i <code>photon-flash-1</code> i modele za video <code>ray-2</code>, <code>ray-flash-2</code> i <code>ray-1-6</code>, a ne modele Ray3 iz Luminog preseta u aplikaciji.',
  "g.api.a.7.4":
    '<span class="src"><a href="https://lumalabs.ai/learning-hub/dream-machine-credit-system" target="_blank" rel="noopener">Luma: sistem kredita</a>; <a href="https://github.com/lumalabs/luma-api-mcp" target="_blank" rel="noopener">lumalabs/luma-api-mcp</a></span>',
  "g.api.b.h": "Generatori sa zvaničnim MCP serverom na tvom nalogu",
  "g.api.b.p":
    'Sa njima agent može sam da generiše, uglavnom u okviru onoga što već plaćaš (vidi svaki red). Početna stranica navodi Higgsfield, Kling i Runway u <a href="/#mcp">„Za tvog agenta, isti koraci kao sa MCP serverom”</a>, a Higgsfield, Ideogram, Krea i Runway u <a href="/#questions">„Pre nego što probaš”</a>.',
  "g.api.b.caption": "Zvanični MCP serveri na koje se prijavljuješ, provereno 8. oktobra 2026.",
  "g.api.b.h0": "Generator",
  "g.api.b.h1": "MCP server",
  "g.api.b.h2": "Šta troši",
  "g.api.b.h3": "Izvori",
  "g.api.b.1.1":
    "<code>https://mcp.higgsfield.ai/mcp</code>, dodat u Claude kao prilagođeni konektor; prijavljuješ se svojim Higgsfield nalogom, bez API ključa.",
  "g.api.b.1.2": "Plaćenu Higgsfield pretplatu i njene kredite.",
  "g.api.b.1.3":
    '<span class="src"><a href="https://higgsfield.ai/creator-hub/help-center/mcp-cli/how-do-i-connect-higgsfield-to-claude" target="_blank" rel="noopener">Higgsfield centar za pomoć</a></span>',
  "g.api.b.2.1": "<code>https://mcp.ideogram.ai/mcp</code>; prijavljuješ se svojim Ideogram nalogom (OAuth), bez API ključa.",
  "g.api.b.2.2": "Tvoju pretplatu. Ideogram kaže da korišćenje preko MCP-a troši istu pretplatu kao njegova veb aplikacija, bez posebne naplate.",
  "g.api.b.2.3": '<span class="src"><a href="https://ideogram.ai/features/mcp/" target="_blank" rel="noopener">Ideogram MCP</a></span>',
  "g.api.b.3.1": "<code>https://api.krea.ai/mcp</code>; prijavljuješ se svojim Krea nalogom (OAuth) ili koristiš API token.",
  "g.api.b.3.2":
    "Uz prijavu: računske jedinice (compute units) radnog prostora koji izabereš, kao i aplikacija. Sa tokenom: API stanje radnog prostora u dolarima, koje je odvojeno.",
  "g.api.b.3.3":
    '<span class="src"><a href="https://www.krea.ai/docs/developers/mcp" target="_blank" rel="noopener">Krea: MCP</a>; <a href="https://www.krea.ai/docs/developers/api-keys-and-billing" target="_blank" rel="noopener">Krea: API ključevi i naplata</a></span>',
  "g.api.b.4.1":
    "Kling AI dodatak za Claude Code: udaljeni MCP na <code>https://kling.ai/mcp/plugin</code>; prijavljuješ se (OAuth), bez API ključa.",
  "g.api.b.4.2": "Kredite; README ne kaže da li su to krediti aplikacije ili API-ja.",
  "g.api.b.4.3":
    '<span class="src"><a href="https://github.com/klingai-tech/claude-plugin" target="_blank" rel="noopener">klingai-tech/claude-plugin</a></span>',
  "g.api.b.5.1": "Runway MCP, za Claude, ChatGPT, Cursor i druge agente; prijavljuješ se svojim Runway nalogom, bez API ključa.",
  "g.api.b.5.2":
    'Tvoju pretplatu. Runway: <q lang="en">MCP uses your Runway credits, just like the Runway app</q>, a modeli koje dobijaš zavise od pretplate.',
  "g.api.b.5.3":
    '<span class="src"><a href="https://runway.com/mcp" target="_blank" rel="noopener">Runway MCP</a>; <a href="https://help.runwayml.com/hc/en-us/articles/51931843164691" target="_blank" rel="noopener">Runway centar za pomoć</a></span>',
  "g.api.c.h": "Generisanje slika ugrađeno u agente za programiranje",
  "g.api.c.p": "Nekim agentima za sliku uopšte ne treba generator, sve dok je njihov model dovoljno dobar za nju.",
  "g.api.c.caption": "Generisanje slika u agentima za programiranje, provereno 8. oktobra 2026.",
  "g.api.c.h0": "Agent",
  "g.api.c.h1": "Šta ima",
  "g.api.c.h2": "Koliko košta",
  "g.api.c.h3": "Izvori",
  "g.api.c.1.1":
    'Ugrađeni alat <code>image_gen</code>. Njegov skill za slike: <q lang="en">Does not require <code>OPENAI_API_KEY</code>.</q> Slike čuva u <code>$CODEX_HOME/generated_images/</code>, a skill kaže agentu da ono što projekat koristi kopira u radni prostor.',
  "g.api.c.1.2":
    'Codex limiti ChatGPT pretplate, koje potezi sa slikama troše <q lang="en">3-5x faster on average</q>; nije dostupno na pretplati Free. Sa API ključem, cene API-ja.',
  "g.api.c.1.3":
    '<span class="src"><a href="https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/imagegen/SKILL.md" target="_blank" rel="noopener">Codex imagegen skill</a>; <a href="https://developers.openai.com/codex/pricing" target="_blank" rel="noopener">Codex cene</a></span>',
  "g.api.c.2.1":
    'Od verzije 2.4 agent može da generiše slike, modelom Nano Banana Pro; podrazumevano se čuvaju u folderu <code>assets/</code> projekta (<q lang="en">saved to your project\'s assets/ folder by default</q>).',
  "g.api.c.2.2": "Nije navedeno u listi izmena.",
  "g.api.c.2.3":
    '<span class="src"><a href="https://cursor.com/changelog/2-4" target="_blank" rel="noopener">Cursor 2.4: lista izmena</a></span>',
  "g.api.c.3.1":
    'Agent sam odlučuje kada da upotrebi model za generisanje slika (<q lang="en">The Agent has the ability to decide when to use an image generation model when it deems appropriate</q>), na primer za maketu novog front-enda.',
  "g.api.c.3.2": "Nije pronađeno.",
  "g.api.c.3.3":
    '<span class="src"><a href="https://antigravity.google/blog/nano-banana-pro" target="_blank" rel="noopener">Antigravity blog</a></span>',
  "g.api.c.4.1":
    "Proširenje <code>nanobanana</code>, koje sadrži MCP server; podrazumevani model mu je Nano Banana 2 (<code>gemini-3.1-flash-image-preview</code>).",
  "g.api.c.4.2": "Potreban mu je Gemini API ključ, dakle naplata Gemini API-ja.",
  "g.api.c.4.3":
    '<span class="src"><a href="https://github.com/gemini-cli-extensions/nanobanana" target="_blank" rel="noopener">gemini-cli-extensions/nanobanana</a></span>',
  "g.api.c.5.1":
    'Nema sopstveno generisanje slika. Centar za pomoć kompanije Anthropic: <q lang="en">Claude doesn’t generate photos or illustrations the way image-generation tools do.</q> Može da nacrta dijagrame i grafikone u HTML-u i SVG-u i da pregleda slike koje mu daš.',
  "g.api.c.5.2": "Nema šta da se naplati.",
  "g.api.c.5.3":
    '<span class="src"><a href="https://support.claude.com/en/articles/9002504-can-claude-produce-images" target="_blank" rel="noopener">Claude centar za pomoć</a></span>',
  "g.api.means.h": "Šta to znači za tvog agenta za programiranje",
  "g.api.means.1.h": "Generator ima zvanični MCP server u okviru tvoje pretplate",
  "g.api.means.1.p":
    "Higgsfield, Ideogram i Runway, i Krea kada se prijaviš: agent može sam da generiše. I na MCP server Kling se prijavljuješ svojim nalogom; čije kredite troši, aplikacije ili API-ja, nije navedeno. Asset Prompter je tu opcion. Kako kaže odgovor na početnoj stranici, i dalje pomaže ako želiš da svaki rezultat lično biraš i odobravaš i da svaku verziju čuvaš u folderu, ili ako koristiš mogućnosti koje alat zadržava samo za svoju aplikaciju.",
  "g.api.means.2.h": "Ima API koji se naplaćuje odvojeno od pretplate",
  "g.api.means.2.p":
    "ChatGPT Images, Gemini API (Veo, Nano Banana), Leonardo.Ai i Luma: agent može da generiše preko skripte ili MCP servera sa API ključem, a ti plaćaš svako generisanje, pored pretplate koju možda već imaš. I Grok Imagine ima API; da li Grok pretplata pokriva išta od toga, stranice kompanije xAI ne kažu.",
  "g.api.means.3.h": "Nema API",
  "g.api.means.3.p":
    'Midjourney i Google Flow: agent ne može da pritisne „Generate”. Automatizovanje veb-aplikacije krši uslove korišćenja servisa Midjourney. Ostaje da promptove i fajlove prenosiš ručno, ili preko zajedničkog foldera kao što je onaj u Asset Prompteru; vodič <a href="/guides/get-images-into-coding-agent-project/">pet načina da slike stignu u projekat tvog agenta</a> ih poredi, a <a href="/guides/how-this-site-was-made/">kako su nastale slike ovog sajta</a> pokazuje folder sa alatom Flow.',
  "g.api.how.h": "Kako je ovo provereno",
  "g.api.how.p1":
    "Svaki red je proveren 8. oktobra 2026. u dokumentaciji, centru za pomoć ili GitHub repozitorijumu samog proizvođača, koji su navedeni u redu. GitHub repozitorijumi i Anthropicov centar za pomoć pročitani su na samoj stranici; sajtovi ostalih proizvođača nisu se otvarali odande gde je ovaj vodič pisan, pa su njihove reči pročitane u kopiji iste stranice kod pretraživača. Gde izjava samog proizvođača nije pronađena, ćelija to i kaže. Cene su izostavljene: menjaju se češće od ove stranice.",
  "g.api.how.p2":
    'Nazivi proizvoda pripadaju svojim vlasnicima. Asset Prompter je nezavisan projekat: nije povezan ni sa jednim od njih, niti ga iko od njih podržava. Vidiš grešku? <a href="https://github.com/Djordje1998/asset-prompter/issues" target="_blank" rel="noopener">Prijavi je na GitHubu</a>.',
  "g.api.log.h": "Šta se promenilo",
  "g.api.log.list": "<li><time></time>: prva verzija.</li>",

  /* ---- /guides/get-images-into-coding-agent-project/ ---- */
  "g.ways.title": "5 načina da AI slike stignu u projekat agenta",
  "g.ways.description":
    "Ugrađeni alati, MCP serveri, plaćeni API, kopiranje ili zajednički folder: koliko šta košta, ko pritiska „Generate” i kada ti Asset Prompter ne treba.",
  "g.ways.crumb": "Slike u projekat agenta",
  "g.ways.h1": "Pet načina da generisane slike i video stignu u projekat tvog agenta za programiranje",
  "g.ways.lead":
    "Claude Code, Codex i Cursor znaju koje slike su projektu potrebne. Kako fajlovi stižu tamo zavisi od tvog generatora. Evo pet načina, pošteno upoređenih.",
  "g.ways.short.h": "Kratak odgovor",
  "g.ways.short.p":
    'Ako tvoj agent ima ugrađen alat za slike i njegov model je dovoljno dobar, koristi njega; Claude Code nema svoj. Ako tvoj generator ima zvanični MCP server u okviru tvoje pretplate, poveži ga. Ako ima samo API, možeš da ga plaćaš po slici. Ako nema ništa od toga, kao Midjourney i Google Flow, fajlove prenosiš ti: ručno ili preko zajedničkog foldera kao što je onaj u Asset Prompteru. Načini ispod idu od onog koji od tebe traži najmanje posla do onog koji traži najviše; činjenice iza svakog su u <a href="/guides/image-generators-api-mcp/">tabeli generatora i agenata</a>, proverenoj 8. oktobra 2026.',
  "g.ways.1.h": "1. Agentov sopstveni alat za slike",
  "g.ways.1.p":
    'Codex ima ugrađeni alat <code>image_gen</code>, Cursorov agent generiše slike od verzije 2.4, agent u Antigravityju sam odlučuje kada da pozove model za slike, a Gemini CLI ima proširenje <code>nanobanana</code>. Claude Code nema sopstveno generisanje slika: <a href="https://support.claude.com/en/articles/9002504-can-claude-produce-images" target="_blank" rel="noopener">centar za pomoć kompanije Anthropic</a> kaže <q lang="en">Claude doesn’t generate photos or illustrations the way image-generation tools do.</q>',
  "g.ways.facts.1": "Ko pritiska „Generate”",
  "g.ways.facts.2": "Šta plaćaš dodatno",
  "g.ways.facts.3": "Šta agent vidi",
  "g.ways.facts.4": "Gde stoje verzije",
  "g.ways.facts.5": "Izaberi ovo kada",
  "g.ways.1.1": "Agent.",
  "g.ways.1.2":
    "Na Codexu ništa pored ChatGPT Plus, Pro ili Business pretplate dok se ne potroše njeni Codex limiti: potezi sa slikama ih troše brže od ostalih poteza, a posle toga generisanje slika troši kredite. Generisanje slika nije dostupno na besplatnoj pretplati. Proširenju za Gemini CLI treba Gemini API ključ, dakle naplata API-ja. Cursor i Antigravity to ne navode.",
  "g.ways.1.3": "Sliku koju je napravio.",
  "g.ways.1.4":
    "Tamo gde ih alat čuva. Cursor ih podrazumevano čuva u folderu <code>assets/</code> projekta. Codex ih drži u <code>$CODEX_HOME/generated_images/</code>, a njegov skill za slike kaže agentu da ono što projekat koristi kopira u projekat, kao nov fajl, na primer <code>hero-v2.png</code>, a ne preko starog.",
  "g.ways.1.5": "Agentov model je dovoljno dobar za tu sliku, a ne treba ti određeni generator.",
  "g.ways.2.h": "2. MCP server generatora",
  "g.ways.2.p":
    "Higgsfield, Ideogram, Krea, Kling i Runway imaju MCP servere na koje se prijavljuješ svojim nalogom; Leonardo.Ai ima server koji radi preko svog API-ja, a Lumina GitHub organizacija ima jedan koji radi preko Luminog.",
  "g.ways.2.1": "Agent.",
  "g.ways.2.2":
    "Higgsfield, Ideogram i Runway troše tvoju pretplatu ili njene kredite, a Krea računske jedinice tvog radnog prostora kada se prijaviš. Serverima za Leonardo i Lumu treba API ključ i troše API kredite.",
  "g.ways.2.3": "Ono što server vrati.",
  "g.ways.2.4": "Tamo gde ih server ili agent sačuva.",
  "g.ways.2.5": "Želiš serije koje se izvršavaju dok nisi tu. Kako kaže početna stranica: za njih izaberi generator koji ima API ili MCP server.",
  "g.ways.3.h": "3. Plaćanje API-ja",
  "g.ways.3.p":
    "API za slike kompanije OpenAI, Gemini API kompanije Google (Nano Banana za slike, Veo za video), Grok Imagine kompanije xAI, Leonardo.Ai i Luma: agent piše skriptu za API i pokreće je.",
  "g.ways.3.1": "Agent, preko skripte.",
  "g.ways.3.2":
    "Svako generisanje, naplaćeno odvojeno od pretplate na aplikaciju koju već plaćaš. Za Grok Imagine stranice kompanije xAI ne kažu da li Grok pretplata pokriva išta od toga.",
  "g.ways.3.3": "Fajlove koje skripta sačuva.",
  "g.ways.3.4": "Tamo gde ih skripta sačuva; traži folder projekta, sa novim imenom za svaku verziju.",
  "g.ways.3.5": "Želiš postupak koji možeš ponovo da pokreneš, više dimenzija odjednom ili serije. API ključ drži van repozitorijuma.",
  "g.ways.4.h": "4. Ručno kopiranje i lepljenje",
  "g.ways.4.p": "Bilo koji generator: prompt nosiš iz četa u generator, a fajl nazad u projekat.",
  "g.ways.4.1": "Ti.",
  "g.ways.4.2": "Ništa.",
  "g.ways.4.3": "Ništa, osim ako mu priložiš fajl ili ga opišeš.",
  "g.ways.4.4": "Tamo gde ih sačuvaš.",
  "g.ways.4.5": "Treba ti jedna ili dve slike, jednom. Tada je ovo sasvim u redu i ništa drugo ti ne treba.",
  "g.ways.4.more": 'Posle nekoliko slika, sve ide onako kako to crta početna stranica, u <a href="/#why">„Bez njega, kurir si ti”</a>:',
  "g.ways.5.h": "5. Zajednički folder: Asset Prompter",
  "g.ways.5.p":
    "Mala lokalna aplikacija koja prenosi promptove i rezultate između agenta i bilo kog generatora koji koristiš ručno, uključujući Midjourney i Google Flow. Radi sa svakim agentom koji može da čita i piše fajlove u folderu projekta.",
  "g.ways.5.1": "Ti, svaki put, u svom generatoru.",
  "g.ways.5.2": "Ništa: aplikacija je besplatna, pod MIT licencom. Plaćaš svoj generator i svog agenta, kao i do sada.",
  "g.ways.5.3":
    "Svaki rezultat. Svaki pregleda, a klip čita kroz listove sa frejmovima i mapu pokreta, koje pravi ffmpeg; Setup ga instalira na Windowsu i Linuxu.",
  "g.ways.5.4": "U folderu slota, kao obični fajlovi: svaka verzija, rezultat, zahtev za izmenu i pregled. Tvoje odobrenje je konačno.",
  "g.ways.5.5": "Tvoj generator nema API ili želiš poslednju reč o svakoj slici.",
  "g.ways.5.more":
    'Setup radi na Windowsu i Linuxu; na macOS-u Bun instaliraš ručno. <a href="/#loop">Šest koraka na početnoj stranici</a> pokazuju jednu sliku kroz ceo krug.',
  "g.ways.result.alt":
    "Kartica slota sa tvojom slikom: trpezarija na svemirskoj stanici. Kartica nosi oznaku „Agent's turn” i dugmad „Approve v1” i „Request changes”.",
  "g.ways.5.caption": "Kartica slota kada na nju prevučeš svoj rezultat: sada je red na agenta.",
  "g.ways.cmp.h": "Uporedo",
  "g.ways.cmp.p": "„Zavisi” znači da to zavisi od alata ili od onoga što tražiš od agenta.",
  "g.ways.cmp.caption": "Pet načina, upoređenih po činjenicama iz tabele generatora, proverenih 8. oktobra 2026.",
  "g.ways.cmp.h0": "Način",
  "g.ways.cmp.h1": "Ko pritiska „Generate”",
  "g.ways.cmp.h2": "Dodatni trošak",
  "g.ways.cmp.h3": "Radi dok nisi tu",
  "g.ways.cmp.h4": "Agent vidi rezultat",
  "g.ways.cmp.h5": "Verzije sačuvane kao fajlovi",
  "g.ways.cmp.h6": "Radi sa alatima Midjourney i Flow",
  "g.ways.cmp.1": "Agentov sopstveni alat",
  "g.ways.cmp.1.1": "Agent",
  "g.ways.cmp.1.2": "Zavisi od agenta",
  "g.ways.cmp.1.3": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.1.4": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.1.5": '<span class="tag t-review">Zavisi</span>',
  "g.ways.cmp.1.6": '<span class="tag t-generate">Ne</span>',
  "g.ways.cmp.2": "MCP server generatora",
  "g.ways.cmp.2.1": "Agent",
  "g.ways.cmp.2.2": "Tvoja pretplata ili API krediti",
  "g.ways.cmp.2.3": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.2.4": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.2.5": '<span class="tag t-review">Zavisi</span>',
  "g.ways.cmp.2.6": '<span class="tag t-generate">Ne</span>',
  "g.ways.cmp.3": "API",
  "g.ways.cmp.3.1": "Agent",
  "g.ways.cmp.3.2": "Svako generisanje",
  "g.ways.cmp.3.3": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.3.4": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.3.5": '<span class="tag t-review">Zavisi</span>',
  "g.ways.cmp.3.6": '<span class="tag t-generate">Ne</span>',
  "g.ways.cmp.4": "Ručno",
  "g.ways.cmp.4.1": "Ti",
  "g.ways.cmp.4.2": "Ništa",
  "g.ways.cmp.4.3": '<span class="tag t-generate">Ne</span>',
  "g.ways.cmp.4.4": "Samo ono što mu pokažeš",
  "g.ways.cmp.4.5": "Samo ono što sačuvaš",
  "g.ways.cmp.4.6": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.5": "Asset Prompter",
  "g.ways.cmp.5.1": "Ti",
  "g.ways.cmp.5.2": "Ništa",
  "g.ways.cmp.5.3": '<span class="tag t-generate">Ne</span>',
  "g.ways.cmp.5.4": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.5.5": '<span class="tag t-approved">Da</span>',
  "g.ways.cmp.5.6": '<span class="tag t-approved">Da</span>',
  "g.ways.note.h": "A upravljanje veb-aplikacijom koja nema API?",
  "g.ways.note.p":
    'Neki alati trećih strana upravljaju veb-stranicom servisa Midjourney umesto agenta. To radi dok ne prestane: uslovi korišćenja servisa Midjourney zabranjuju automatizovan pristup, a alat koji klikće kroz veb-stranicu prestaje da radi kad god se stranica promeni. Izvori su u <a href="/guides/image-generators-api-mcp/">tabeli generatora</a>.',
  "g.ways.need.h": "Kada ti Asset Prompter ne treba, a kada pomaže",
  "g.ways.need.p": "Sam ne generiše ništa. Ti pritiskaš „Generate” u svom alatu, svaki put, pa nije rešenje za svaki slučaj.",
  "g.ways.need.no": "Ne treba ti ako",
  "g.ways.need.no.1":
    "Agentov sopstveni alat za slike ili MCP server generatora u okviru tvoje pretplate obavlja posao, a ne smeta ti da agent bira rezultate.",
  "g.ways.need.no.2": "Trebaju ti serije koje se izvršavaju dok nisi tu.",
  "g.ways.need.no.3": "Treba ti jedna ili dve slike, jednom.",
  "g.ways.need.no.4": "Radiš u prozoru za čet u pregledaču, a ne sa agentom koji radi sa fajlovima: aplikaciji treba agent koji to ume.",
  "g.ways.need.no.5": "Radiš na macOS-u i ne želiš da Bun instaliraš ručno.",
  "g.ways.need.yes.5":
    "Želiš da agent proverava tvoje video klipove, kroz listove sa frejmovima i mapu pokreta (uz ffmpeg, koji Setup instalira).",
  "g.ways.next":
    'Dalje: <a href="/guides/how-this-site-was-made/">kako su uz njega nastale slike ovog sajta</a>, korak po korak, i <a href="/#install">dva načina da ga instaliraš</a>.',
};
