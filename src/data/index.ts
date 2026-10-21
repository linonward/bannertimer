// The only source of banner data (docs/product.md §4). Add each new version file here;
// src/lib/banners.test.ts fails if a file in this folder is missing from the list.
import hsr45 from "./hsr/4.5.json";
import hsr46 from "./hsr/4.6.json";
import hsr47 from "./hsr/4.7.json";
import hsr48 from "./hsr/4.8.json";
import zzz32 from "./zzz/3.2.json";
import zzz33 from "./zzz/3.3.json";
import zzz34 from "./zzz/3.4.json";

export const versionFiles: unknown[] = [hsr45, hsr46, hsr47, hsr48, zzz32, zzz33, zzz34];
