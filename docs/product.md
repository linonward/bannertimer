# bannertimer.com 产品规格 v1.0（定稿）

数据来源：2026-10-21 排名快照 + 关键词规划师 2026-09 口径。

## 1. 一句话定位

**抽卡游戏卡池倒计时与排期站。一款游戏一个页面，首屏直接回答「现在什么池、下个池还有几天」。**

不做攻略站（让给 prydwen.gg），不做版本号单点页（那是 gengamer 站群的做法，每 42 天改一次 title）。

**核心竞争逻辑**：目标词的前十里，多数是大站顺路占位的非定制内页，而不是定制页。所以胜负手是**页面完整度**，不是对抗 DR 73~99。这个判断决定了 §5 的六项模块每一项都不能砍。

## 2. 里程碑

| 阶段 | 交付物 | 验收 |
|---|---|---|
| **M1（第 1 周）** | `/hsr/` + `/zzz/` 主表页、六模块全、en 单语、sitemap、SSR | 上线即可被索引，首屏答案段在 HTML 源码里可见 |
| **M2（第 2 周）** | `/genshin/`、版本页自动生成器、`/zzz/3.4/` 上线 | `{game}/{version}` 可由数据自动产出，零手工 |
| **M3（第 3 周）** | vi / pt-BR / ko 三语言 + hreflang 互链 | 四语言 hreflang 完整、各自 canonical 指向自身 |
| **M4（第 4 周起）** | `/maintenance`、`/livestream`、GSC 埋点校准 | 上线两周用 §11 指标验收 |

**M1 只做两个站的原因**：`/hsr/` 的 `hsr banner schedule` KD **11.4** 是全部候选里最低的，`/zzz/` 的 `zzz banner countdown` KD **14.6** 次之，两个词的门槛都约 **20 个引用域**。先拿下最低门槛的词，验证模板成立，再复制到原神（KD 28.5~33.9）。

## 3. URL 与页面清单

| URL | 主目标词 | 月搜（美国） | KD | 阶段 |
|---|---|---:|---:|---|
| `/hsr/` | hsr banner schedule | 3,600 | **11.4** | M1 |
| `/hsr/`（同页协同） | hsr next banner | 2,900 | 20.2 | M1 |
| `/zzz/`（内嵌倒计时区块） | zzz banner countdown | 880 | **14.6** | M1 |
| `/zzz/3.4/` | zzz 3.4 banners | 未收录（真空期） | 20.4 | M2 |
| `/genshin/` | genshin next banner | **8,100** | 28.5 | M2 |
| `/genshin/`（同页协同） | genshin banner schedule | 5,400 | 33.9 | M2 |
| `/zzz/`（同页协同） | zzz upcoming banners | 4,400 | 30.4 | M1 |
| `/zzz/`（同页协同） | zzz next banner | 4,400 | 23.5 | M1 |
| `/zzz/`（同页协同） | zzz banner schedule | 2,900 | 22.5 | M1 |
| `/zzz/`（同页协同） | zzz current banner | 2,400 | 26.9 | M1 |
| `/{game}/maintenance/` | zzz maintenance countdown | 260 | **19.9** | M4 |
| `/{game}/livestream/` | zzz livestream | 880 | 40.5 | M4（最低优先） |
| `/{game}/{version}/` | 版本号词 | 见 §8 | — | 自动生成 |

**结构规则**

- **四个 banner 常青词共用一个 URL**（`/zzz/` 同时承载 upcoming / next / schedule / current，合计月搜 **14,100**）。不做四个薄页，那会让四个词都排不上去。
- **版本号页用 `/{game}/{version}/`，不用 `?v=3.4` 参数**（参数页会被合并或不收录）。
- **URL 里不带年份**（不要 `/hsr-4.6-banners-2026`），否则每 42 天报废一批。
- 首页 `/` 只做「三款当前卡池速览」的枢纽，**不争任何词**，防止和 `/hsr/` 自相竞争。
- 语言用子目录 `/vi/`、`/pt-br/`、`/ko/`，不用子域、不用参数。

## 4. 数据模型（唯一数据源）

所有页面（主表、版本页、维护页、倒计时）都必须从这一份结构化数据渲染，**不允许任何地方手工写卡池信息**。这是 §8 零成本生成的前提。

```json
{
  "game": "hsr",
  "gameName": "Honkai: Star Rail",
  "version": "4.7",
  "phases": [
    {
      "phase": 1,
      "bannerName": "…",
      "featured5": [{ "name": "…", "isNew": true }],
      "featured4": ["…", "…"],
      "isRerun": false,
      "start": { "utc": "2026-10-21T03:00:00Z" },
      "end": { "serverLocal": "2026-11-11T17:59:00" },
      "status": "official",
      "sourceUrl": "…",
      "sourceCheckedAt": "2026-10-20"
    }
  ],
  "serverResetUTC": "…",
  "lastUpdated": "2026-10-21T11:41:00Z"
}
```

**字段规则**

- `start` / `end` 只有两种形态（2026-10-21 定，见 §14 第 1 条）：
  - `{ "utc": "…Z" }`：全球同一时刻，如版本维护结束后的上半池开池。
  - `{ "serverLocal": "…" }`：每个服务器在各自本地时间的这一刻，如下半池 18:00 开池。不带时区后缀。
- 服务器时区固定、无夏令时：美服 UTC-5、欧服 UTC+1、亚服 UTC+8（港澳台服同亚服）。
- 展示层把时间换算为用户本地时区，并显示所选服务器的时间。默认服务器是美服（M1 只做 en，目标市场是美国）；用户可切换，选择存在浏览器本地。
- `status` 只有两个值：`official`（官方已确认）、`leaked`（爆料未确认）。**不允许出现第三种或空值。**
- `leaked` 必须带 `sourceUrl` + `sourceCheckedAt`，页面上灰底显示。
- `sourceCheckedAt` 是数据可信度的证据，**每次人工核对都要更新**。

## 5. 六项模块（含验收标准）

每一项都有验收线，不接受「包含了」这种描述。

### 模块 1 — 当前卡池（首屏）

- 卡池名、5★ 名单（标「新角色」）、剩余时间
- 倒计时**精确到秒**，目标时间由 `end` 按所选服务器换算
- 同时显示用户本地时区与服务器标准时区
- **验收**：从打开页面到看见「下个卡池是 X，还有 N 天 N 时」**零点击、不浮动、不闪烁**

### 模块 2 — 下一个卡池

- 开池时间 + 状态标签（`Official` 绿 / `Leaked — unconfirmed` 灰）
- 爆料显示来源与核对日期
- **验收**：状态标签在视觉上一眼可分辨。三个词盘面上的占位者要么只给已确认的（信息少），要么把爆料和官方混在一起（不可信）。这是唯一的信任优势，不能丢。

### 模块 3 — 排期时间轴

- 横向时间轴，覆盖**未来 2~3 个版本**
- 每个节点：版本号、开池日、5★/4★ 名单、状态标签
- **验收**：纯 CSS/HTML 渲染，**不允许用图片**（图片里的名字不会被索引）

### 模块 4 — 历史卡池归档

- 表：版本 | 日期区间 | 上半/下半 | 5★ | 4★ | 是否复刻
- 可按角色名筛选、可按版本倒序
- 每行链到 `/{game}/{version}/`
- **验收**：归档表是站内互链的枢纽，必须向下链接到版本页

⚠️ **不要为 `genshin banner history` 单独优化**（KD 41.2，前 9 席 6 席是定制页）。归档是配套模块，不是主攻方向。

### 模块 5 — 首屏直接答案段

H1 正下方 60~120 词纯文本，**服务端渲染进首轮 HTML**，倒计时数字由 JS 更新但句子本身必须在源码里。

把 `next banner`、`banner schedule`、`upcoming banners`、`banner countdown` 四种说法各自然用一次。这是让一页同时争四个同意图词的核心手段，不是堆砌关键词。

**为什么这一段决定成败**：现有占位者的行为数据都在垫底——lootbar.gg **人均停留 13 秒**、timesaver.gg 40 秒 / 跳出 75% / 1.5 页、mmoexp.com 86 秒 / 65%、ldshop.gg 87 秒 / 61%。用户点进来立刻走，是因为它们在当页没把答案讲清楚。

### 模块 6 — 一页一款游戏

- 不混排三款。混排则三个词都排不上去。
- 每页底部固定链到另两款主表 + 本游戏归档
- **验收**：`/hsr/` 页面内不出现 genshin / zzz 的卡池表内容（只在导航互为链接）

## 6. TDK / H1 / 首屏文案（四语言）

### `/hsr/`（主词 hsr banner schedule + 副 hsr next banner）

**EN**

- Title（50 字符）：`HSR Banner Schedule & Next Banner — Live Countdown`
- Meta（150 字符）：`Live HSR banner schedule with a real-time countdown. Current banner, next banner start time, upcoming banners and full rerun history — updated hourly.`
- H1：`HSR Banner Schedule & Countdown`
- 小字：`Last updated {date} · Times shown in your timezone`
- 首屏答案段：

> The current HSR banner is **{CURRENT_BANNER}** and ends in **{DD:HH:MM:SS}**. The next banner, **{NEXT_BANNER}**, starts **{DATE}** — **{CONFIRMATION_LABEL}**. Below is the full HSR banner schedule for every phase of patch **{VERSION}**, plus upcoming banners for **{NEXT_VERSION}**. The banner countdown at the top of this page updates every second in your local time. Reruns, 4★ lineups and past phase dates are further down.

**VI**

- Title：`Lịch Banner HSR & Banner Tiếp Theo — Đếm Ngược Trực Tiếp`
- H1：`Lịch Banner HSR — Đếm Ngược Trực Tiếp`
- 首屏：

> Banner hiện tại của HSR là **{CURRENT_BANNER}**, còn **{DD:HH:MM:SS}**. Banner tiếp theo, **{NEXT_BANNER}**, mở ngày **{DATE}** — **{CONFIRMATION_LABEL}**. Dưới đây là lịch banner đầy đủ cho từng phase của phiên bản **{VERSION}**, cùng các banner sắp tới của **{NEXT_VERSION}**.

**PT-BR**

- Title：`Cronograma de Banners do HSR & Próximo Banner — Ao Vivo`
- H1：`Cronograma de Banners do HSR — Contagem ao Vivo`
- 首屏：

> O banner atual do HSR é **{CURRENT_BANNER}** e termina em **{DD:HH:MM:SS}**. O próximo banner, **{NEXT_BANNER}**, começa em **{DATE}** — **{CONFIRMATION_LABEL}**. Abaixo está o cronograma completo de banners de cada fase da versão **{VERSION}**.

**KO**

- Title：`HSR 배너 일정 & 다음 배너 — 실시간 카운트다운`
- H1：`HSR 배너 일정 — 실시간 카운트다운`
- 首屏：

> 현재 HSR 배너는 **{CURRENT_BANNER}**이며 **{DD:HH:MM:SS}** 후 종료됩니다. 다음 배너 **{NEXT_BANNER}**는 **{DATE}**에 시작됩니다 — **{CONFIRMATION_LABEL}**.

**Title 规则**：≤60 字符；Title 与 H1 **不得完全相同**（谷歌会判定其一冗余）；H1 用主词自然语序。

**FAQ（配 FAQPage schema）**

| 问题 | 答案骨架 |
|---|---|
| What is the next HSR banner? | {NEXT_BANNER}，{DATE} {TIME} ({TZ}) 开启。状态：{CONFIRMATION_LABEL} |
| When does the current banner end? | {CURRENT_BANNER} 于 {DATE} {TIME} 结束，页面顶部有实时倒计时 |
| What time do banners change? | {TIME} server time ({TZ})，换算你本地是 {LOCAL_EQUIV} |
| Is {CHARACTER} getting a rerun? | {答案} · 来源 {sourceUrl}（{date}） |

**韩语待验证**：韩国玩家口语常用「픽업」而不只是「배너」。M3 上线前先测两个词的量再定标题用词，不要直接照英文直译。

### 6.1 `/zzz/`（主词 zzz banner countdown + 同页 next / upcoming / schedule / current）

2026-10-21 按 `/hsr/` 结构补写，只有 EN（M1 只做 en）。

- Title（50 字符）：`ZZZ Banner Countdown & Next Banner — Live Schedule`
- Meta：`Live ZZZ banner countdown to the second. Current banner, next banner start time, upcoming banners and the full banner schedule — updated hourly.`
- H1：`ZZZ Banner Countdown & Schedule`
- 首屏答案段：

> The current ZZZ banner is **{CURRENT_BANNER}** and ends in **{DD:HH:MM:SS}**. The next banner, **{NEXT_BANNER}**, starts **{DATE}** — **{CONFIRMATION_LABEL}**. Below is the full ZZZ banner schedule for every phase of patch **{VERSION}**, plus upcoming banners for **{NEXT_VERSION}**. The banner countdown at the top of this page updates every second in your local time. Reruns, 4★ lineups and past phase dates are further down.

FAQ 同 `/hsr/`，把 HSR 换成 ZZZ。

## 7. 技术实现要求

| 项 | 要求 | 为什么 |
|---|---|---|
| 渲染 | 卡池数据**必须 SSR 进 HTML**（首轮抓取源码里就有当前卡池文字），倒计时数字可 JS 更新 | 纯 CSR 空壳页等于放弃收录 |
| 时间存储 | 全部存 UTC，展示层双时区 | 三款游戏服务器时区不同，硬编码必然出错 |
| 时区显示 | 用户本地时区 + 所选服务器时区（美服 UTC-5 / 欧服 UTC+1 / 亚服 UTC+8，见 §4） | 用户搜「几点换池」就是要这个 |
| 更新时间 | 每页显示 `Last updated`，数据变动自动刷新 | 卡池站的核心竞争力是「新」 |
| 抓取 | **不要对搜索引擎 UA 做拦截** | 实测多个竞品「拒绝工具抓取、无法体检」 |
| Sitemap | 按游戏分 sitemap，`lastmod` 用真实内容变动时间 | 版本页上线即提交 |
| 性能 | 首屏关键路径不含第三方脚本；广告位**固定高度**占位 | 防 CLS，卖点就是体验 |
| 移动优先 | 卡池表手机竖屏必须可读 | 大量用户在手机上查「还有几天」 |
| 结构化数据 | `FAQPage` + `BreadcrumbList`；**不要给倒计时标 `Event` / `SpecialAnnouncement`** | 谷歌对后者无稳定富结果支持 |

## 8. 版本页自动生成规则

- **输入**：§4 数据模型里每个 `version` 记录
- **输出**：`/{game}/{version}/` — 该版本卡池详情 + 上下版本导航 + 未上线时的倒计时
- **Title**：`{Game} {Version} Banners — Characters, Countdown & Release Date`。`{Game}` 用简称 `Genshin` / `HSR` / `ZZZ`（2026-10-21 定，见 §14 第 4 条）
- **互链**：每页链回主表，主表链到已上线的版本页

**为什么必须自动生成**——版本号词是单峰后归零：

| 词 | 峰值 | 当前 | 跌幅 |
|---|---:|---:|---:|
| genshin 6.5 banners | 14,800（2026-03） | 110 | **-99.3%** |
| genshin 6.7 banners | 12,100（2026-06） | 210 | -98.3% |
| hsr 4.3 banners | 9,900（2026-05） | 140 | **-98.6%** |
| zzz 2.8 banners | 4,400（2026-04） | 70 | -98.4% |

手工做一个版本页 1~2 个月就作废，只有零边际成本才值得做。**优先生成窗口期内的两个**：`zzz 3.4 banners`（KD 20.4，前十无倒计时站、无官方站，第 7 名 zzz.163.moe 是 DR 0 小站）、`hsr 4.7 banners`（从 hsr 4.6 的 2026-09 峰值推断）。

## 9. 42 天运营日历（每轮只改三处）

| 时点 | 动作 | 改动 |
|---|---|---|
| 上线日（约每 42 天） | 当前池 → 下一个，新版本页上线 | ① 版本号（title+H1）② 卡池名单 ③ 时间戳 |
| 上线前约 12 天（前瞻直播） | 生成下个版本页，状态标 `leaked` | 生成新页 |
| 上线当日 | 维护窗口，`/maintenance/` 进流量高峰 | `zzz maintenance countdown` 的曲线是 320→10→320 反复跳动，只在这天有价值 |

竞品 gengamer 用 **DR 2** 靠这个机制拿下 257 个词（128 个在前三），但它的体验分只有 **27/100**、停留 42 秒、跳出 62%。把它做成流程化 + 页面质量高，就是差异化。

## 10. 变现位

- **AdSense**：首屏不放（用首屏换行为数据），放历史归档表下方 + 页脚上方
- **代充 affiliate**（Eldorado 类）：已验证路径——updatecountdown.info（DR 0、14 个月）靠 `genshin banner countdown` 1,730/月做到 **9,145 月访问**
- **出价信号**：`zzz next banner` 顶部出价 **$10.57**、`zzz upcoming banners` **$11.53**——代充广告主在抢，这类流量商业价值高
- 所有广告位固定高度，不要把 CLS 拉起来

## 11. 埋点与上线验收（两周看这几项）

| 指标 | 目标 | 垫底参照 |
|---|---|---|
| 平均停留 | **> 90 秒** | lootbar 13 秒、timesaver 40 秒、mmoexp 86 秒、ldshop 87 秒 |
| 跳出率 | **< 60%** | timesaver 75%、mmoexp 65%、ldshop 61% |
| 人均页数 | **> 2.5** | lootbar 1.4、timesaver 1.5、mmoexp 1.9 |
| 首屏答案 | 零点击可见 | — |
| 四语言 hreflang | 全部互通 | bannerhistory.app 靠这层起量 |

**追赶目标是 prydwen.gg 这一档**：停留 230 秒、跳出 38%、人均 3.8 页、体验分 94~100。它在 `hsr banner schedule` 上是标题命中、真正为词定制的页——**这是唯一需要正面赢的对手，其余都是靠域名权重顺路占位**（第 9 名甚至是 reddit 帖、第 4 名是 DR 0 的 4 个月新站）。

## 12. 明确不做

- ❌ 不做 `zzz upcoming characters`（KD 34.6 看似容易，实际门槛约 **246** 个引用域 vs P0 词的 20 个；需求是爆料前瞻，与工具站能力错位；月搜一年跌 58%）
- ❌ 不做 `genshin banner history` 作主打词（KD 41.2，6/9 席定制页）
- ❌ 不做 `zzz livestream` 第一期（KD 40.5，6/9 席定制页，红海）
- ❌ 不做 `genshin 7.0 banners`（从 12,100 跌到 1,000 + 5/9 席定制页）
- ❌ 不为任何单个版本词单独投内容成本
- ❌ 不做多游戏混排页
- ❌ 不追求 EMD 红利（`banner timer` 这个词只有 10/月，域名是纯品牌名）

## 13. 口径与已知缺口

1. **「未收录」≠ 没量**：`zzz 3.4 banners`、`hsr 4.7 banners` 处在规划师真空期（每月初才放上个月数据，10-01 至今的词全查不到）。判断依据是**盘面空着**，不是搜索量。
2. **`zzz banner countdown` 数据只到 2026-08**，「+29%」是 2026-06~08 区间，最后一格空着是没更新到，不是没量。
3. **vi / pt-BR / ko 三组语言搜索量一次都没实测**。间接证据只有 bannerhistory.app 的地区结构（越南 14.6%、巴西 9.2%、韩国 9%、美国仅 13.2%）。所以 **M3 先做结构（hreflang + 首屏答案段），翻译内容按实测结果排先后**，不要在没测过的语言上先投翻译成本。
4. **`hsr 4.7 banners` 的量目前是推断，无实测**——趋势里这几个长尾词太稀疏（连月搜 3,600 的 `hsr banner schedule` 在 90 天全球趋势里都显示 0），确认要等 11 月初规划师放出 10 月数据。

## 14. 待定问题

开发前要拍板的问题。未决的项不开工。

（暂无未决项。）

### 已决（2026-10-21）

1. **多服务器开池时间**。原神、星铁的上半池随版本维护结束同时开（全球同一时刻）；下半池按各服务器本地时间开，三个时刻相差最多 13 小时。原 §4 每个 phase 只有一个 `startUTC` / `endUTC`，表达不了这一点，且缺欧服。决定：`start` / `end` 改为 `utc` 或 `serverLocal` 两种形态，三服时区固定，默认显示美服，用户可切换。已写入 §4、§7。
2. **预渲染与「零闪烁」**。预渲染 HTML 里的剩余时间在构建时就过期。决定：
   - 源码里的答案段写结束的绝对日期时间（默认服务器时间），JS 再换成倒计时。倒计时区块宽度固定，替换文字不引起布局位移。
   - 页面内嵌本游戏全部卡池数据。打开页面时如果构建时的「当前卡池」已结束，前端按内嵌数据切到正确的卡池。
   - 部署后用定时任务每小时重新构建一次，对应 Meta 里的 updated hourly。定时任务在部署切片里做，不在 M1 页面切片里。
3. **样例数据**。开发阶段用样例数据，角色名写成 `Sample …`，`sourceUrl` 指向 `https://example.com/`。上线前全部替换为官方公告值。
4. **版本页 Title 超长**。§8 模板套用全名时超过 60 字符（`Genshin Impact 6.3 Banners — Characters, Countdown & Release Date` 为 65 字符）。决定：`{Game}` 用简称。已写入 §8。
5. **M1 归档表的版本页链接**。§5 模块 4 要求每行链到版本页，但版本页 M2 才有。决定：M1 归档行先不出链接；M2 版本页上线后自动出链接。不出指向 404 的链接。
6. **`/zzz/` 文案**。§6 只给了 `/hsr/` 的文案。`/zzz/` 按同一结构写，主词换成 `zzz banner countdown`（见 §6.1）。

## 数据存疑的地方

- 原稿 §2 写「用 §12 指标验收」、§4 写「§9 零成本生成」，对照内容应为 §11、§8，本文已改正。
- 原稿 §6 写 EN Meta 为 155 字符，实测 150 字符。
