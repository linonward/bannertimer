import type { ReactNode } from "react";
import type { Lang } from "./i18n";
import { countdownParts, formatCountdown, type Server } from "./time";

// Interface text for game pages, per language (docs/product.md §3.1: the whole page is
// translated). Page titles live in games.ts; banner and character names come from src/data
// untranslated.

/** What the answer paragraph under the H1 says (§5 module 5). Strings are already formatted. */
export type AnswerFacts = {
  shortName: string;
  current: { titles: string; count: number; version: string } | null;
  /** The countdown once the clock runs, else the end date in server time. */
  ends: { text: string; live: boolean };
  next: { titles: string; count: number; start: string; status: string } | null;
  nextVersion?: string;
};

export type Messages = {
  and: string;
  answer: (facts: AnswerFacts) => ReactNode;
  countdown: (ms: number) => string;
  units: [string, string, string, string];
  servers: Record<Server, string>;
  official: string;
  leaked: string;
  estimate: string;
  newTag: string;
  rerunTag: string;
  // Header
  gamesNav: string;
  server: string;
  serverCaps: string;
  language: string;
  // Page frame
  home: string;
  updated: (date: ReactNode) => ReactNode;
  scheduleEyebrow: string;
  scheduleTitle: (game: string) => string;
  archiveEyebrow: string;
  archiveTitle: (game: string) => string;
  archiveSub: string;
  faqEyebrow: string;
  faqTitle: (game: string) => string;
  otherGames: string;
  thisGame: string;
  archiveLink: (game: string) => string;
  faqLink: (game: string) => string;
  disclaimer: string;
  // FAQ (§6)
  faqNext: (game: string) => string;
  faqNextAnswer: (titles: string, count: number, start: string, status: string) => string;
  faqNextNone: string;
  faqEnd: string;
  faqEndAnswer: (ends: { name: string; at: string }[]) => string;
  faqEndNone: string;
  faqChange: string;
  faqChangeAnswer: (offsets: Record<Server, string>) => string;
  // Hero board
  liveNow: string;
  bannerCount: (n: number) => string;
  phaseShort: (version: string, phase: number) => string;
  phaseLine: (version: string, phase: number) => string;
  dayOf: (day: number, days: number) => string;
  noBannerLive: string;
  firstEndsIn: string;
  endsIn: string;
  endsServerTime: string;
  endsYourTime: string;
  yourTime: string;
  ends: string;
  nextHeading: (count: number, version: string, phase: number) => string;
  nextBanner: string;
  notAnnouncedCaps: string;
  nextLands: string;
  starts: string;
  source: string;
  checked: (date: string) => string;
  pickedInGame: string;
  // Ticker
  tickerNow: string;
  tickerEnds: (count: number) => string;
  tickerShortEnds: string;
  tickerNext: string;
  tickerNoNext: string;
  tickerShortNoNext: string;
  // Timetable
  phase: (n: number) => string;
  phaseNow: string;
  ended: (day: string) => string;
  runsInto: (phase: number, day: string) => string;
  expected: (day: string) => string;
  nextCaps: string;
  tba: string;
  timelineNoNext: string;
  // Archive
  filter: string;
  newestFirst: string;
  oldestFirst: string;
  columns: { version: string; phase: string; banner: string; dates: string; rerun: string };
  pickedInGameShort: string;
  showMore: (n: number) => string;
  noMatch: string;
  // Calendar subscribe (src/lib/calendar.ts)
  calendarAdd: string;
  calendarApple: string;
  calendarGoogle: string;
  calendarSubscribe: string;
  calendarDownload: string;
  calendarOnce: string;
  calendarNote: (server: string, offset: string) => string;
};

const en: Messages = {
  and: "and",
  answer: ({ shortName, current, ends, next, nextVersion }) => (
    <>
      {current ? (
        <>
          The current {shortName} {current.count > 1 ? "banners are" : "banner is"} <strong>{current.titles}</strong>
          {current.count > 1 ? "; the first " : " and "}
          <strong className="tabular-nums">{ends.live ? `ends in ${ends.text}` : `ends on ${ends.text}`}</strong>.{" "}
        </>
      ) : (
        <>No {shortName} banner is live right now. </>
      )}
      {next ? (
        <>
          The next banner{next.count > 1 ? "s" : ""}, <strong>{next.titles}</strong>,{" "}
          {next.count > 1 ? "start" : "starts"} <strong>{next.start}</strong> — <strong>{next.status}</strong>.{" "}
        </>
      ) : (
        <>The next banner has not been announced yet. </>
      )}
      {/* §5 module 5: keep "banner schedule" and "upcoming banners" even before the next patch is announced. */}
      Below is the full {shortName} banner schedule
      {current && (
        <>
          {" "}
          for every phase of patch <strong>{current.version}</strong>
        </>
      )}
      {nextVersion ? (
        <>
          , plus upcoming banners for <strong>{nextVersion}</strong>
        </>
      ) : (
        ", plus upcoming banners as soon as the next patch is announced"
      )}
      .{" "}
      The banner countdown at the top of this page updates every second in your local time. Reruns, 4★ lineups and
      past phase dates are further down.
    </>
  ),
  countdown: formatCountdown,
  units: ["DAYS", "HOURS", "MIN", "SEC"],
  servers: { america: "America", europe: "Europe", asia: "Asia" },
  calendarAdd: "Add to calendar",
  calendarApple: "Apple Calendar · Outlook",
  calendarGoogle: "Google Calendar",
  calendarSubscribe: "Subscribe",
  calendarDownload: "Download .ics file",
  calendarOnce: "One-time import",
  calendarNote: (server, offset) => `${server} server · ${offset} · new banners appear automatically`,
  official: "Official",
  leaked: "Leaked — unconfirmed",
  estimate: "Estimate — not announced",
  newTag: "NEW",
  rerunTag: "RERUN",
  gamesNav: "Games",
  server: "Server",
  serverCaps: "SERVER",
  language: "Language",
  home: "Home",
  updated: (date) => <>Last updated {date} · Times shown in your timezone</>,
  scheduleEyebrow: "01 ── TIMETABLE",
  scheduleTitle: (game) => `Upcoming ${game} banners`,
  archiveEyebrow: "02 ── ARCHIVE",
  archiveTitle: (game) => `Past ${game} banners`,
  archiveSub: "One row per banner, newest first",
  faqEyebrow: "03 ── FAQ",
  faqTitle: (game) => `${game} banner questions`,
  otherGames: "Other games",
  thisGame: "This game",
  archiveLink: (game) => `${game} banner archive`,
  faqLink: (game) => `${game} banner FAQ`,
  disclaimer:
    "bannertimer is a fan-made schedule. Not affiliated with HoYoverse. Times are converted from official server time.",
  faqNext: (game) => `What is the next ${game} banner?`,
  faqNextAnswer: (titles, count, start, status) =>
    `${titles} ${count > 1 ? "start" : "starts"} ${start}. Status: ${status}.`,
  faqNextNone: "The next banner has not been announced yet.",
  faqEnd: "When does the current banner end?",
  faqEndAnswer: (ends) =>
    `${ends.map((e) => `${e.name} ends ${e.at}`).join(". ")}. The live countdown at the top of this page shows the time left.`,
  faqEndNone: "No banner is live right now. The countdown at the top of this page shows when the next one starts.",
  faqChange: "What time do banners change?",
  faqChangeAnswer: (o) =>
    `A new version's first banner opens for every server at the same moment, when update maintenance ends. Second-half banners open at 18:00 server time: ${o.america} on America, ${o.europe} on Europe and ${o.asia} on Asia. Pick your server at the top of the page to see the time in your own time zone.`,
  liveNow: "LIVE NOW",
  bannerCount: (n) => ` · ${n} BANNER${n > 1 ? "S" : ""}`,
  phaseShort: (v, p) => ` · v${v} PHASE ${p}`,
  phaseLine: (v, p) => `v${v} · PHASE ${p}`,
  dayOf: (day, days) => `DAY ${day} OF ${days}`,
  noBannerLive: "NO BANNER LIVE",
  firstEndsIn: "FIRST BANNER ENDS IN",
  endsIn: "BANNER ENDS IN",
  endsServerTime: "ENDS · SERVER TIME",
  endsYourTime: "ENDS · YOUR TIME",
  yourTime: "Your time",
  ends: "ENDS",
  nextHeading: (n, v, p) => `NEXT BANNER${n > 1 ? "S" : ""} · v${v} PHASE ${p}`,
  nextBanner: "NEXT BANNER",
  notAnnouncedCaps: "NOT ANNOUNCED YET",
  nextLands: "The next banners land here when HoYoverse posts the banner notice.",
  starts: "Starts",
  source: "Source:",
  checked: (date) => ` · checked ${date}`,
  pickedInGame: "Picked in game — no default lineup",
  tickerNow: "Now live",
  tickerEnds: (n) => (n > 1 ? "First ends" : "Ends"),
  tickerShortEnds: "Ends",
  tickerNext: "Next",
  tickerNoNext: "Next banner · Not announced yet",
  tickerShortNoNext: "Next · TBA",
  phase: (n) => `PHASE ${n}`,
  phaseNow: " · NOW",
  ended: (day) => `Ended ${day}`,
  runsInto: (phase, day) => `Runs into phase ${phase} · until ${day}`,
  expected: (day) => `Expected ${day} · estimate`,
  nextCaps: "NEXT",
  tba: "TBA",
  timelineNoNext:
    "Not announced yet. The next phases appear here when HoYoverse posts the banner notice or a reliable leak with a source lands.",
  filter: "Filter by character",
  newestFirst: "Newest first",
  oldestFirst: "Oldest first",
  columns: { version: "VERSION", phase: "PHASE", banner: "BANNER", dates: "DATES", rerun: "RERUN" },
  pickedInGameShort: "picked in game",
  showMore: (n) => `Show ${n} more banners`,
  noMatch: "No past banner features that character.",
};

// docs/product.md §6 (VI). "phase", "banner" and "rerun" stay as Vietnamese players write them.
const vi: Messages = {
  and: "và",
  answer: ({ shortName, current, ends, next, nextVersion }) => (
    <>
      {current ? (
        <>
          {current.count > 1 ? `Các banner hiện tại của ${shortName} là` : `Banner hiện tại của ${shortName} là`}{" "}
          <strong>{current.titles}</strong>
          {current.count > 1 ? "; banner đầu tiên " : ", "}
          <strong className="tabular-nums">{ends.live ? `kết thúc sau ${ends.text}` : `kết thúc vào ${ends.text}`}</strong>
          .{" "}
        </>
      ) : (
        <>Hiện không có banner {shortName} nào đang mở. </>
      )}
      {next ? (
        <>
          {next.count > 1 ? "Các banner tiếp theo" : "Banner tiếp theo"}, <strong>{next.titles}</strong>, mở vào{" "}
          <strong>{next.start}</strong> — <strong>{next.status}</strong>.{" "}
        </>
      ) : (
        <>Banner tiếp theo chưa được công bố. </>
      )}
      Dưới đây là lịch banner {shortName} đầy đủ
      {current && (
        <>
          {" "}
          cho từng phase của phiên bản <strong>{current.version}</strong>
        </>
      )}
      {nextVersion ? (
        <>
          , cùng các banner sắp tới của <strong>{nextVersion}</strong>
        </>
      ) : (
        ", cùng các banner sắp tới ngay khi phiên bản tiếp theo được công bố"
      )}
      .{" "}
      Đồng hồ đếm ngược banner ở đầu trang cập nhật từng giây theo giờ địa phương của bạn. Các lần rerun, đội hình 4★
      và ngày của các phase trước nằm ở phía dưới.
    </>
  ),
  countdown: (ms) => {
    const [d, h, m, s] = countdownParts(ms);
    return `${Number(d)} ngày ${h}:${m}:${s}`;
  },
  units: ["NGÀY", "GIỜ", "PHÚT", "GIÂY"],
  servers: { america: "Mỹ", europe: "Châu Âu", asia: "Châu Á" },
  calendarAdd: "Thêm vào lịch",
  calendarApple: "Apple Calendar · Outlook",
  calendarGoogle: "Google Calendar",
  calendarSubscribe: "Đăng ký",
  calendarDownload: "Tải tệp .ics",
  calendarOnce: "Nhập một lần",
  calendarNote: (server, offset) => `Máy chủ ${server} · ${offset} · banner mới tự động xuất hiện`,
  official: "Chính thức",
  leaked: "Rò rỉ — chưa xác nhận",
  estimate: "Ước tính — chưa công bố",
  newTag: "MỚI",
  rerunTag: "RERUN",
  gamesNav: "Trò chơi",
  server: "Máy chủ",
  serverCaps: "MÁY CHỦ",
  language: "Ngôn ngữ",
  home: "Trang chủ",
  updated: (date) => <>Cập nhật lần cuối {date} · Giờ hiển thị theo múi giờ của bạn</>,
  scheduleEyebrow: "01 ── LỊCH",
  scheduleTitle: (game) => `Banner ${game} sắp tới`,
  archiveEyebrow: "02 ── LƯU TRỮ",
  archiveTitle: (game) => `Banner ${game} đã qua`,
  archiveSub: "Mỗi dòng một banner, mới nhất trước",
  faqEyebrow: "03 ── HỎI ĐÁP",
  faqTitle: (game) => `Câu hỏi về banner ${game}`,
  otherGames: "Game khác",
  thisGame: "Game này",
  archiveLink: (game) => `Lưu trữ banner ${game}`,
  faqLink: (game) => `Hỏi đáp banner ${game}`,
  disclaimer:
    "bannertimer là lịch banner do người hâm mộ làm, không liên kết với HoYoverse. Giờ được quy đổi từ giờ máy chủ chính thức.",
  faqNext: (game) => `Banner tiếp theo của ${game} là gì?`,
  faqNextAnswer: (titles, _count, start, status) => `${titles} mở vào ${start}. Trạng thái: ${status}.`,
  faqNextNone: "Banner tiếp theo chưa được công bố.",
  faqEnd: "Khi nào banner hiện tại kết thúc?",
  faqEndAnswer: (ends) =>
    `${ends.map((e) => `${e.name} kết thúc vào ${e.at}`).join(". ")}. Đồng hồ đếm ngược ở đầu trang cho biết thời gian còn lại.`,
  faqEndNone:
    "Hiện không có banner nào đang mở. Đồng hồ đếm ngược ở đầu trang cho biết khi nào banner tiếp theo mở.",
  faqChange: "Banner đổi lúc mấy giờ?",
  faqChangeAnswer: (o) =>
    `Banner đầu tiên của phiên bản mới mở cùng lúc trên mọi máy chủ, khi bảo trì cập nhật kết thúc. Banner nửa sau mở lúc 18:00 giờ máy chủ: ${o.america} ở máy chủ Mỹ, ${o.europe} ở máy chủ Châu Âu và ${o.asia} ở máy chủ Châu Á. Chọn máy chủ ở đầu trang để xem giờ theo múi giờ của bạn.`,
  liveNow: "ĐANG MỞ",
  bannerCount: (n) => ` · ${n} BANNER`,
  phaseShort: (v, p) => ` · v${v} PHASE ${p}`,
  phaseLine: (v, p) => `v${v} · PHASE ${p}`,
  dayOf: (day, days) => `NGÀY ${day}/${days}`,
  noBannerLive: "KHÔNG CÓ BANNER ĐANG MỞ",
  firstEndsIn: "BANNER ĐẦU TIÊN KẾT THÚC SAU",
  endsIn: "BANNER KẾT THÚC SAU",
  endsServerTime: "KẾT THÚC · GIỜ MÁY CHỦ",
  endsYourTime: "KẾT THÚC · GIỜ CỦA BẠN",
  yourTime: "Giờ của bạn",
  ends: "KẾT THÚC",
  nextHeading: (_n, v, p) => `BANNER TIẾP THEO · v${v} PHASE ${p}`,
  nextBanner: "BANNER TIẾP THEO",
  notAnnouncedCaps: "CHƯA CÔNG BỐ",
  nextLands: "Banner tiếp theo sẽ hiện ở đây khi HoYoverse đăng thông báo banner.",
  starts: "Mở",
  source: "Nguồn:",
  checked: (date) => ` · kiểm tra ${date}`,
  pickedInGame: "Tự chọn trong game — không có đội hình mặc định",
  tickerNow: "Đang mở",
  tickerEnds: (n) => (n > 1 ? "Banner đầu kết thúc" : "Kết thúc"),
  tickerShortEnds: "Kết thúc",
  tickerNext: "Tiếp theo",
  tickerNoNext: "Banner tiếp theo · Chưa công bố",
  tickerShortNoNext: "Tiếp theo · TBA",
  phase: (n) => `PHASE ${n}`,
  phaseNow: " · HIỆN TẠI",
  ended: (day) => `Đã kết thúc ${day}`,
  runsInto: (phase, day) => `Kéo dài sang phase ${phase} · đến ${day}`,
  expected: (day) => `Dự kiến ${day} · ước tính`,
  nextCaps: "TIẾP",
  tba: "TBA",
  timelineNoNext:
    "Chưa công bố. Các phase tiếp theo sẽ hiện ở đây khi HoYoverse đăng thông báo banner hoặc có tin rò rỉ đáng tin kèm nguồn.",
  filter: "Lọc theo nhân vật",
  newestFirst: "Mới nhất trước",
  oldestFirst: "Cũ nhất trước",
  columns: { version: "PHIÊN BẢN", phase: "PHASE", banner: "BANNER", dates: "NGÀY", rerun: "RERUN" },
  pickedInGameShort: "tự chọn trong game",
  showMore: (n) => `Xem thêm ${n} banner`,
  noMatch: "Không có banner nào trước đây có nhân vật này.",
};

// docs/product.md §6 (PT-BR). "banner" and "rerun" stay as Brazilian players write them.
const ptBr: Messages = {
  and: "e",
  answer: ({ shortName, current, ends, next, nextVersion }) => (
    <>
      {current ? (
        <>
          {current.count > 1 ? `Os banners atuais do ${shortName} são` : `O banner atual do ${shortName} é`}{" "}
          <strong>{current.titles}</strong>
          {current.count > 1 ? "; o primeiro " : " e "}
          <strong className="tabular-nums">termina em {ends.text}</strong>.{" "}
        </>
      ) : (
        <>Nenhum banner do {shortName} está ativo agora. </>
      )}
      {next ? (
        <>
          {/* The plural keeps "próximo banner", one of the four §6 phrases. */}
          {next.count > 1 ? (
            <>
              O próximo banner traz <strong>{next.titles}</strong>, a partir de <strong>{next.start}</strong>
            </>
          ) : (
            <>
              O próximo banner, <strong>{next.titles}</strong>, começa em <strong>{next.start}</strong>
            </>
          )}{" "}
          — <strong>{next.status}</strong>.{" "}
        </>
      ) : (
        <>O próximo banner ainda não foi anunciado. </>
      )}
      Abaixo está o cronograma de banners do {shortName} completo
      {current && (
        <>
          , com cada fase da versão <strong>{current.version}</strong>
        </>
      )}
      {nextVersion ? (
        <>
          , além dos próximos banners da <strong>{nextVersion}</strong>
        </>
      ) : (
        ", além dos próximos banners assim que a próxima versão for anunciada"
      )}
      .{" "}
      A contagem regressiva do banner no topo da página atualiza a cada segundo no seu horário local. Reruns, a lista
      de 4★ e as datas das fases anteriores estão mais abaixo.
    </>
  ),
  countdown: formatCountdown,
  units: ["DIAS", "HORAS", "MIN", "SEG"],
  servers: { america: "América", europe: "Europa", asia: "Ásia" },
  calendarAdd: "Adicionar ao calendário",
  calendarApple: "Apple Calendar · Outlook",
  calendarGoogle: "Google Agenda",
  calendarSubscribe: "Assinar",
  calendarDownload: "Baixar arquivo .ics",
  calendarOnce: "Importação única",
  calendarNote: (server, offset) => `Servidor ${server} · ${offset} · novos banners aparecem automaticamente`,
  official: "Oficial",
  leaked: "Vazamento — não confirmado",
  estimate: "Estimativa — não anunciada",
  newTag: "NOVO",
  rerunTag: "RERUN",
  gamesNav: "Jogos",
  server: "Servidor",
  serverCaps: "SERVIDOR",
  language: "Idioma",
  home: "Início",
  updated: (date) => <>Atualizado em {date} · Horários no seu fuso horário</>,
  scheduleEyebrow: "01 ── CRONOGRAMA",
  scheduleTitle: (game) => `Próximos banners do ${game}`,
  archiveEyebrow: "02 ── ARQUIVO",
  archiveTitle: (game) => `Banners anteriores do ${game}`,
  archiveSub: "Uma linha por banner, mais recentes primeiro",
  faqEyebrow: "03 ── PERGUNTAS",
  faqTitle: (game) => `Perguntas sobre banners do ${game}`,
  otherGames: "Outros jogos",
  thisGame: "Este jogo",
  archiveLink: (game) => `Arquivo de banners do ${game}`,
  faqLink: (game) => `Perguntas sobre banners do ${game}`,
  disclaimer:
    "bannertimer é um cronograma feito por fãs, sem vínculo com a HoYoverse. Os horários são convertidos do horário oficial do servidor.",
  faqNext: (game) => `Qual é o próximo banner do ${game}?`,
  faqNextAnswer: (titles, count, start, status) =>
    `${titles} ${count > 1 ? "começam" : "começa"} em ${start}. Status: ${status}.`,
  faqNextNone: "O próximo banner ainda não foi anunciado.",
  faqEnd: "Quando termina o banner atual?",
  faqEndAnswer: (ends) =>
    `${ends.map((e) => `${e.name} termina em ${e.at}`).join(". ")}. A contagem regressiva no topo da página mostra o tempo restante.`,
  faqEndNone:
    "Nenhum banner está ativo agora. A contagem regressiva no topo da página mostra quando o próximo começa.",
  faqChange: "Que horas os banners mudam?",
  faqChangeAnswer: (o) =>
    `O primeiro banner de uma nova versão abre em todos os servidores ao mesmo tempo, quando a manutenção da atualização termina. Os banners da segunda metade abrem às 18:00 no horário do servidor: ${o.america} na América, ${o.europe} na Europa e ${o.asia} na Ásia. Escolha seu servidor no topo da página para ver o horário no seu fuso.`,
  liveNow: "AO VIVO",
  bannerCount: (n) => ` · ${n} BANNER${n > 1 ? "S" : ""}`,
  phaseShort: (v, p) => ` · v${v} FASE ${p}`,
  phaseLine: (v, p) => `v${v} · FASE ${p}`,
  dayOf: (day, days) => `DIA ${day} DE ${days}`,
  noBannerLive: "NENHUM BANNER ATIVO",
  firstEndsIn: "O PRIMEIRO BANNER TERMINA EM",
  endsIn: "O BANNER TERMINA EM",
  endsServerTime: "TERMINA · HORÁRIO DO SERVIDOR",
  endsYourTime: "TERMINA · SEU HORÁRIO",
  yourTime: "Seu horário",
  ends: "TERMINA",
  nextHeading: (n, v, p) => `${n > 1 ? "PRÓXIMOS BANNERS" : "PRÓXIMO BANNER"} · v${v} FASE ${p}`,
  nextBanner: "PRÓXIMO BANNER",
  notAnnouncedCaps: "AINDA NÃO ANUNCIADO",
  nextLands: "Os próximos banners aparecem aqui quando a HoYoverse publicar o anúncio dos banners.",
  starts: "Começa",
  source: "Fonte:",
  checked: (date) => ` · verificado em ${date}`,
  pickedInGame: "Escolhido no jogo — sem lista padrão",
  tickerNow: "Ao vivo",
  tickerEnds: (n) => (n > 1 ? "O primeiro termina" : "Termina"),
  tickerShortEnds: "Termina",
  tickerNext: "Próximo",
  tickerNoNext: "Próximo banner · Ainda não anunciado",
  tickerShortNoNext: "Próximo · TBA",
  phase: (n) => `FASE ${n}`,
  phaseNow: " · AGORA",
  ended: (day) => `Terminou em ${day}`,
  runsInto: (phase, day) => `Continua na fase ${phase} · até ${day}`,
  expected: (day) => `Previsto para ${day} · estimativa`,
  nextCaps: "PRÓXIMO",
  tba: "TBA",
  timelineNoNext:
    "Ainda não anunciado. As próximas fases aparecem aqui quando a HoYoverse publicar o anúncio dos banners ou surgir um vazamento confiável com fonte.",
  filter: "Filtrar por personagem",
  newestFirst: "Mais recentes primeiro",
  oldestFirst: "Mais antigos primeiro",
  columns: { version: "VERSÃO", phase: "FASE", banner: "BANNER", dates: "DATAS", rerun: "RERUN" },
  pickedInGameShort: "escolhido no jogo",
  showMore: (n) => `Mostrar mais ${n} banners`,
  noMatch: "Nenhum banner anterior tem esse personagem.",
};

const MESSAGES: Record<Lang, Messages> = { en, vi, "pt-br": ptBr };

export function messages(lang: Lang): Messages {
  return MESSAGES[lang];
}
