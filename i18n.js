// The Serbian text of the page. The page does not load this file: tools/build-sr.mjs reads it and writes the Serbian
// page, sr/index.html, from index.html with these texts in. After editing this file or index.html, run
// `node tools/build-sr.mjs` and commit sr/index.html with them.
//
// English is the text in index.html and is written only there. A text is marked in index.html with its key:
//   data-i18n="key"             the whole content of the element (the Serbian text may hold markup)
//   data-i18n-text="key"        only the element's own text; an icon or a button beside it stays as it is
//   data-i18n-alt="key"         an attribute; the same for aria-label and content
// A mark with no entry here stays English on the Serbian page.
//
// What stays English in both languages: the labels of the app (Copy prompt, Notify agent, the status tags), because
// the app and its screenshots are in English, and the message for the agent, which has to match AGENT-INSTALL.md.

const SR = {
  title: "Asset Prompter: promptovi za slike i video od tvog agenta",
  description:
    "Besplatna lokalna aplikacija za Windows i Linux. Claude Code, Codex ili Cursor piše prompt, a ti sliku ili video praviš u alatu Midjourney ili Google Flow.",

  /* ---- link previews (og: and twitter: in the <head>) ---- */
  "og.locale": "sr_RS",
  "og.locale.alt": "en_US",
  "og.title": "Asset Prompter: tvoj agent piše prompt, ti praviš sliku",
  "og.description":
    "Besplatna lokalna aplikacija za Windows i Linux koja prenosi promptove i rezultate između tvog agenta za programiranje i generatora slika ili videa koji koristiš ručno.",
  "og.alt": "Asset Prompter: tvoj agent piše prompt, ti praviš sliku. Robot i osoba sa dve strane zajedničkog foldera.",

  /* ---- structured data: the features in the JSON-LD, in its order. No element on the page shows them. ---- */
  "ld.feature.1": "Tvoj agent za programiranje upisuje svaki prompt za sliku ili video u slot, sa podešavanjima",
  "ld.feature.2": "Ti generišeš ručno, u bilo kom alatu, i rezultat spuštaš na karticu slota",
  "ld.feature.3":
    "Radi sa alatima Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode i Antigravity, i sa svakim agentom koji radi sa fajlovima",
  "ld.feature.4": "Preseti za ChatGPT Images, Dreaminu, Google Flow, Grok Imagine, Leonardo.Ai, Lumu i Midjourney",
  "ld.feature.5": "Svaka verzija, svaki rezultat, zahtev za izmenu i pregled ostaju u folderu slota, kao obični fajlovi",
  "ld.feature.6": "Jednim klikom odobravaš rezultat i on postaje konačan; iz tog fajla agent izvozi veličine i formate koji mu trebaju",
  "ld.feature.7": "Svaki video klip pretvara u listove sa frejmovima i mapu pokreta, koje agent može da pročita",
  "ld.feature.8": "Radi na tvom računaru i sluša samo na 127.0.0.1, bez naloga i bez API ključa",

  /* ---- top bar ---- */
  skip: "Preskoči na sadržaj",
  "nav.label": "Sekcije",
  "nav.loop": "Kako radi",
  "nav.mcp": "Poređenje sa MCP-om",
  "nav.agent": "Za agenta",
  "nav.tradeoffs": "Kompromisi",
  "nav.questions": "Pitanja",
  "lang.label": "Jezik: SR",
  "star.label": "Zvezdica na GitHubu: Asset Prompter",
  star: 'Zvezdica<span class="bar-github-on"> na GitHubu</span>',
  install: "Instaliraj",

  /* ---- words used in several places ---- */
  you: "Ti",
  copy: "Kopiraj",
  copied: "Kopirano",
  "copy.byHand": "Označi i kopiraj",
  download: "Preuzmi ZIP",
  github: "Pogledaj na GitHubu",
  optional: "Opciono",

  /* ---- hero ---- */
  "hero.agent": "Tvoj agent",
  "hero.agents": "Agenti koji rade sa fajlovima na tvom računaru",
  "hero.anyAgent": "bilo koji agent koji radi sa fajlovima",
  "hero.h1":
    '<span class="line"><span class="who-agent">Tvoj agent</span> piše prompt.</span> <span class="line"><span class="who-you">Ti</span> praviš sliku.</span>',
  "hero.sub":
    "Asset Prompter je mala lokalna aplikacija koja prenosi promptove i rezultate između tvog agenta za programiranje i generatora slika ili videa koji koristiš ručno.",
  "ask.hero": "Nalepi ovo svom agentu da ga instalira",
  "fact.free": "Besplatno",
  "fact.local": "Radi na tvom računaru",
  "fact.os": "Windows i Linux",
  "fact.account": "Bez naloga, bez API ključa",
  "hero.alt": "Piksel-art: robot sa jedne strane stavlja list sa promptom u zajednički folder, a osoba sa druge stavlja gotovu sliku.",
  "hero.gen": "Tvoj generator",
  "hero.gens": "Generatori koje koristiš ručno",
  "hero.anyGen": "bilo koji alat u koji nalepiš prompt",
  "hero.fine":
    "Logotipi i nazivi pripadaju svojim vlasnicima. Asset Prompter je nezavisan projekat: nije povezan ni sa jednim od njih, niti ga iko od njih podržava.",

  /* ---- the loop ---- */
  "loop.h2": "Jedna slika, šest koraka",
  "loop.lead":
    'Agentovi koraci su <span class="who-agent">ljubičasti</span>, a tvoji <span class="who-you">boje senfa</span>. Koraci 4 i 5 nisu obavezni: odobri posle koraka 3 i slika je gotova.',
  "rail.label": "Folder slota",
  "file.slot": "čemu slika služi",
  "file.prompt": "prompt i podešavanja",
  "file.result": "tvoj rezultat",
  "file.feedback": "tvoj zahtev za izmenu",
  "file.review": "agentov odgovor",
  "file.next": "sledeći prompt",
  "file.results": "tri rezultata",
  "file.pick": "bira 2.png",
  "file.approved": "tvoje odobrenje",
  "file.final": "fajl koji agent koristi",
  "key.agent": "agent",
  "key.you": "ti",
  "key.app": "aplikacija",
  "who.agent": "Agent",
  "who.either": "Ti ili agent",
  "step.1": "korak 1 od 6",
  "step.2": "korak 2 od 6",
  "step.3": "korak 3 od 6",
  "step.4": "korak 4 od 6",
  "step.5": "korak 5 od 6",
  "step.6": "korak 6 od 6",

  "turn.1.h": "Agent piše prompt",
  "turn.1.p": "Pravi slot za sliku koja mu je potrebna, sa promptom i podešavanjima. Ti taj slot vidiš kao karticu.",
  "turn.1.alt":
    "Kartica slota u Asset Prompteru, sa oznakom „Needs generating”: prazno polje za prevlačenje, podešavanja koja treba izabrati i prompt sa dugmetom „Copy prompt”.",
  "turn.2.h": "Kopiraš prompt i generišeš",
  "turn.2.p": "Pritisni „Copy prompt”, nalepi prompt u Google Flow ili bilo koji drugi generator, pa tamo pritisni „Generate”.",
  "turn.2.alt":
    "Polje sa promptom na kartici, nakon pritiska na „Copy prompt”: podešavanja Image, 16:9 i Nano Banana Pro, prompt i dugme na kojem sada piše „Copied”.",
  "turn.3.h": "Ubacuješ sliku u slot",
  "turn.3.p": "Prevuci je na karticu ili pritisni Ctrl+V. Ako je već dobra, odmah je odobri i pređi na korak 6.",
  "turn.3.alt":
    "Ista kartica, sada sa tvojom slikom: trpezarija na svemirskoj stanici. Kartica nosi oznaku „Agent's turn” i dugmad „Approve v1” i „Request changes”.",
  "turn.4.h": "Javljaš agentu",
  "turn.4.p": "Pritisni „Notify agent”. Agent otvara tvoju sliku i proverava da li odgovara onome što je tražio.",
  "turn.4.alt": "Red iznad kartica: jedan slot pod „Agent's turn” i dugme „Notify agent” sa zelenom tačkom, što znači da agent sluša.",
  "turn.5.h": "Jedan od vas traži izmenu",
  "turn.5.p": "Napiši šta treba promeniti, ili agent kaže šta ne valja. On piše sledeći prompt, a ti generišeš ponovo.",
  "turn.5.alt":
    "Kartica sa tvojim zahtevom za izmenu upisanim ispod prompta: previše je hladno i prazno; separei neka budu od tople kože boje konjaka, dodati toplo plafonsko osvetljenje, a sunce neka izlazi nad horizontom.",
  "turn.6.h": "Odobravaš",
  "turn.6.p": "Jednim klikom slika postaje konačna. Agent dobija poruku da je slika koju je tražio spremna i koji fajl da koristi.",
  "turn.6.alt":
    "Kartica druge verzije, sa oznakom „Approved”: topla trpezarija sa izlaskom sunca, tri rezultata među kojima je označen tvoj izbor, agentov pregled i, skupljen ispod, tvoj raniji zahtev za izmenu.",

  /* ---- compared with MCP ---- */
  "mcp.h2": "Za tvog agenta, isti koraci kao sa MCP serverom",
  "mcp.lead": "Menja se samo drugi kraj. Tamo generišu serveri provajdera, ili ti.",
  "mcp.figure": "Agent prolazi ista četiri koraka, bilo da sliku generiše MCP server ili ti.",
  "lane.1": "traži",
  "lane.2": "čeka",
  "lane.3": "dobija fajl",
  "lane.4": "pokušava ponovo",
  "lane.server": "kada ga generator ima",
  "lane.you": "kada ga nema",
  "mcp.alt":
    "Piksel-art: osoba u zlatnom duksu sedi za svojim stolom i drži podignutu gotovu sliku. Robot je u monitoru i kroz ekran joj pruža list sa promptom.",
  "mcp.h3": "Za generatore čija pretplata ne uključuje MCP server",
  "mcp.noApi": "Bez javnog API-ja",
  "mcp.billed": "API se naplaćuje odvojeno od pretplate",
  "mcp.official": "Zvanični MCP server, pa ti ovo možda i ne treba",
  "mcp.fine":
    "Nazivi proizvoda pripadaju svojim vlasnicima. Asset Prompter je nezavisan projekat: nije povezan ni sa jednim od njih, niti ga iko od njih podržava. Pretplate i API-ji provereni su 2. oktobra 2026.",

  /* ---- the courier ---- */
  "why.h2": "Bez njega, kurir si ti",
  "why.lead": "Tvoj agent zna koje su mu slike potrebne, ali one nastaju u generatoru koji koristiš ručno. Zato sve prenosiš ti.",
  "why.1": "Kopiraš prompt iz četa, nalepiš ga u generator, preuzmeš rezultat, preimenuješ ga i prebaciš u repozitorijum.",
  "why.2": "Agent nikada ne vidi šta je ispalo, pa mu sliku prepričavaš rečima.",
  "why.3": "Tri kruga kasnije niko više ne zna koji je fajl bio onaj pravi, ni iz kog prompta je nastao.",
  "why.alt": "Piksel-art: osoba trči između oblačića iz četa i gomile slika dok papiri lete na sve strane, a robot čeka i ništa od toga ne vidi.",

  /* ---- for the agent ---- */
  "agent.h2": "Šta folder daje tvom agentu",
  "agent.lead": "Sve što generišeš stiže tamo gde agent može da pogleda.",
  "versions.alt":
    "Deo detalja odobrenog slota u aplikaciji: tri rezultata verzije 2 sa izabranim 2.png, agentova ocena „Agent approves, picks 2.png” i beleška o tome šta se promenilo u odnosu na verziju 1.",
  "versions.h": "Vidi svaku verziju",
  "versions.p":
    "Nova verzija nikada ne zamenjuje staru. Svaki rezultat, tvoj zahtev za izmenu i agentov pregled ostaju u folderu slota, gde agent može da ih pročita.",
  "variants.alt":
    "Varijante jedne odobrene slike, onako kako ih aplikacija prikazuje: WebP 1920 × 1080, JPG 1200 × 630 za kartice na društvenim mrežama i kvadratni isečak, svaka sa dugmetom „Copy image”.",
  "variants.h": "Pravi varijante konačne slike",
  "variants.p1": "Isečci, druge dimenzije, drugi formati i sitne izmene, napravljeni od odobrenog fajla. Bez novog generisanja.",
  "variants.p2": "Stoje na jednom mestu, uz konačnu sliku. U aplikaciji ih otvaraš sa njene pločice i svaku kopiraš jednim klikom.",
  "clip.h": "Proverava klip koji ne može da pusti",
  "clip.p": "Agent ne može da gleda video. Zato aplikacija svaki klip koji ubaciš pretvara u slike i brojeve koje agent može da pročita.",
  "clip.alt": "Klip sa vrha ove stranice: robot pruža list sa promptom ka zajedničkom folderu, a osoba iz njega vadi sliku.",
  "clip.caption": "<strong>Tvoj klip</strong>Osam sekundi, prevučen na karticu.",
  "frames.alt": "List sa frejmovima: četiri frejma tog klipa iz iste sekunde, u mreži dva puta dva.",
  "frames.caption": "<strong>Listovi sa frejmovima</strong>Po jedan za svaku sekundu, sa po četiri frejma. Agent ih čita redom.",
  "motion.alt": "Mapa pokreta tog klipa: prvi frejm, zatamnjen, na kojem su list, slika i iskra označeni crvenom bojom.",
  "motion.caption": "<strong>Mapa pokreta</strong>Crvenom bojom je označeno sve što se pomerilo tokom klipa.",

  /* ---- uses ---- */
  "uses.h2": "Čemu služi",
  "film.label": "Folder projekta",
  "film.script": "scenario, kadar po kadar",
  "film.waits": "čeka 02-handover",
  "film.h": "Filmovi, reklame i kratke scene",
  "film.p": "Cela scena iz jednog zadatka, sa istim likovima od prvog do poslednjeg frejma.",
  "film.1": "<strong>Scenario.</strong> Agent ga napiše i podeli na kadrove, u folderu projekta, gde možeš da ga pročitaš.",
  "film.2":
    "<strong>Likovi i stvari.</strong> Po jedan slot za svaki lik, predmet i mesto. Odobriš ih jednom, a svaki kadar ih uzima kao reference, pa isto lice i ista torba stižu u svaki frejm.",
  "film.3":
    "<strong>Kadrovi.</strong> Za svaki kadar jedna slika, pa klip koji od nje kreće. Slotovi su numerisani po redu kadrova, pa uvek znaš šta je sledeće za generisanje.",
  "use.1.alt": "Generisana fotografija restorana na svemirskoj stanici, sa Zemljom u prozorima.",
  "use.1.h": "Slike za sajt koji tvoj agent pravi",
  "use.1.p": "Naslovni baneri, fotografije za sekcije, pozadine. Agent zna gde koja ide i šta tamo treba da postigne, i to upisuje u slot.",
  "use.2.alt": "Generisana fotografija proizvoda: burger na tanjiru od škriljca.",
  "use.2.h": "Jedan proizvod na mnogo aseta",
  "use.2.p": "Prvo odobri glavnu sliku, a kasniji slotovi je uzimaju kao referencu. Slot koji zavisi od drugog čeka dok taj drugi ne bude odobren.",
  "use.3.alt": "Četiri frejma iz generisanog piksel-art klipa: robot predaje list folderu dok osoba iz njega vadi sliku.",
  "use.3.h": "Kratki klipovi od odobrenih slika",
  "use.3.p":
    "Video slot može da uzme odobrenu sliku kao početni frejm. Agent zatim proverava pokret sekundu po sekundu, kao i to da li klip može da se vrti u petlji.",
  "use.4.alt": "Ikona aplikacije Asset Prompter, velika.",
  "use.4.h": "Grafika za aplikaciju i brend",
  "use.4.p": "Ikone, prazna stanja, ilustracije. Kad neku odobriš, agent iz tog fajla izvozi veličine i formate koji mu trebaju.",

  /* ---- trade-offs ---- */
  "fit.h2": "Sam ne generiše ništa",
  "fit.lead": "Ti pritiskaš „Generate” u svom alatu, svaki put. Za serije koje se izvršavaju dok nisi tu, izaberi generator koji ima API ili MCP server.",
  "fit.alt": "Piksel-art: ljudska ruka pritiska veliko zlatno dugme, dok robot stoji pored i gleda.",
  "fit.yes": "Odgovara ti ako",
  "fit.yes.1": "Tvoj generator nema API, a želiš da agent vidi rezultate.",
  "fit.yes.2": "Već plaćaš pretplatu na generator i ne želiš još i račune za API.",
  "fit.yes.3": "Želiš poslednju reč. Ništa nije gotovo dok ti ne odobriš.",
  "fit.yes.4": "Želiš da sve bude na tvom računaru: obični fajlovi u folderu, bez naloga.",
  "fit.know": "Pre instalacije treba da znaš",
  "fit.know.1": "Uz aplikaciju stižu preseti za sedam generatora sa vrha stranice. Za drugi alat potreban je kratak preset fajl.",
  "fit.know.2": "Tvoj agent mora da radi sa fajlovima. Prozor za čet u pregledaču to ne može.",
  "fit.know.3": "Agent ne čuje. Provera zvuka u klipu je tvoj posao.",
  "fit.know.4": "Setup radi na Windowsu i Linuxu. Na macOS-u Bun instaliraš ručno.",

  /* ---- install ---- */
  "install.h2": "Dva načina za instalaciju",
  "install.lead": "U oba slučaja, ništa ne moraš da imaš unapred instalirano.",
  "way.agent": "Radi tvoj agent",
  "way.agent.h": "Nalepi jednu poruku",
  "way.agent.p": "Daj je agentu za programiranje koji može da izvršava komande, kao što je Claude Code.",
  "ask.install": "Poruka za tvog agenta",
  "way.agent.1": "Preuzima folder i pokreće setup.",
  "way.agent.2": "Proverava da li aplikacija radi.",
  "way.agent.3": "Javlja ti gde se aplikacija nalazi i kako da je pokreneš.",
  "way.you": "Radiš ti",
  "way.you.h": "Dva koraka ručno",
  "way.you.1": "Preuzmi folder",
  "way.you.1.p": "Preuzmi ZIP i raspakuj ga bilo gde, ili kloniraj repozitorijum.",
  "way.you.2": "Pokreni setup jednom",
  "way.you.2.p":
    "Na Windowsu dvaput klikni na <code>setup.bat</code>. Na Linuxu u tom folderu pokreni <code>sh setup.sh</code>. Setup instalira Bun, ffmpeg i pakete aplikacije, dodaje ikonu Asset Promptera i otvara aplikaciju.",
  "install.next":
    "<strong>Zatim, u aplikaciji:</strong> otvori projekat, pritisni „Copy agent instructions” i nalepi to u čet sa svojim agentom. Pri prvom pokretanju otvara se dvominutni tutorijal.",

  /* ---- questions ---- */
  "faq.h2": "Pre nego što probaš",
  "faq.1.q": "Sa kojim agentima radi?",
  "faq.1.a":
    "Sa svakim agentom koji može da čita i piše fajlove u folderu projekta i da prati pisano uputstvo. To uputstvo, HOW-TO-USE.md, aplikacija upisuje u svaki projekat. Ako agent ume i da pokrene komandu u pozadini i da se probudi kada se ona završi, budi ga „Notify agent”. Ako ne ume, u četu mu napišeš „gotovo”.",
  "faq.2.q": "Sa kojim generatorima?",
  "faq.2.a":
    "Sa svakim alatom u koji možeš da nalepiš prompt i iz kog dobijaš fajl. Preset govori agentu koje modele, režime, odnose stranica i trajanja alat nudi, a aplikacija te upozorava kada se rezultat ne poklapa. Uključeni su preseti za ChatGPT Images, Dreaminu, Google Flow, Grok Imagine, Leonardo.Ai, Lumu i Midjourney, a svaki slot može da koristi bilo koji od njih, pa jedan projekat može da kombinuje alate. Svaki preset je kratak tekstualni fajl koji možeš da kopiraš i prilagodiš drugom alatu.",
  "faq.3.q": "Moj generator ima MCP server. Da li mi ovo i dalje treba?",
  "faq.3.a":
    "Možda i ne. Nekoliko generatora sada nudi zvanični MCP server preko kog agent može da generiše u okviru tvoje pretplate, među njima Higgsfield, Ideogram, Krea i Runway. Asset Prompter i tu pomaže ako želiš da svaki rezultat lično biraš i odobravaš i da svaku verziju čuvaš u folderu, ili ako koristiš mogućnosti koje alat zadržava samo za svoju aplikaciju.",
  "faq.4.q": "Da li mi je agent uopšte potreban?",
  "faq.4.a": "Nije. Preko „New slot” promptove možeš da pišeš i bez agenta. I dalje dobijaš verzije, rezultate jedne pored drugih i policu sa odobrenim fajlovima.",
  "faq.5.q": "Da li išta napušta moj računar?",
  "faq.5.a":
    "Aplikacija sluša samo na 127.0.0.1, ne traži nalog i sve čuva u folderu tvog projekta. Dve stvari ipak izlaze: interfejs učitava fontove sa servisa Google Fonts, a sve što nalepiš u generator odlazi tom generatoru.",
  "faq.6.q": "Koliko košta?",
  "faq.6.a": "Ništa. Plaćaš svoj generator i svog agenta, kao i do sada.",
  "faq.7.q": "Mogu li da izmenim aset nakon što ga odobrim?",
  "faq.7.a": "Da. Ukloni odobrenje u „Details” da ponovo otvoriš slot, ili kloniraj slot da probaš drugi pravac, a original sačuvaš.",

  /* ---- closing, footer ---- */
  "closing.alt": "Piksel-art: zid galerije pun gotovih slika, a ispred njega stoje robot i osoba.",
  "closing.h2": "Daj svom agentu način da traži slike.",
  "closing.lead": "Preuzmi folder, pokreni setup, nalepi jednu poruku.",
  "foot.art": "Ilustracije su generisane ručno u alatu Google Flow, preko Asset Promptera.",
};
