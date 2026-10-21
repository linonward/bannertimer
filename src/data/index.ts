// The only source of banner data (docs/product.md §4). Add each new version file here;
// src/lib/banners.test.ts fails if a file in this folder is missing from the list.
import genshin68 from "./genshin/6.8.json";
import genshin70 from "./genshin/7.0.json";
import genshin71 from "./genshin/7.1.json";
import genshin72 from "./genshin/7.2.json";
import hsr44 from "./hsr/4.4.json";
import hsr45 from "./hsr/4.5.json";
import hsr46 from "./hsr/4.6.json";
import hsr47 from "./hsr/4.7.json";
import zzz31 from "./zzz/3.1.json";
import zzz32 from "./zzz/3.2.json";
import zzz33 from "./zzz/3.3.json";
import zzz34 from "./zzz/3.4.json";

export const versionFiles: unknown[] = [genshin68, genshin70, genshin71, genshin72, hsr44, hsr45, hsr46, hsr47, zzz31, zzz32, zzz33, zzz34];
