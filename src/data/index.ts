// The only source of banner data (docs/product.md §4). Add each new version file here;
// src/lib/banners.test.ts fails if a file in this folder is missing from the list.
import hsr44 from "./hsr/4.4.json";
import hsr45 from "./hsr/4.5.json";
import hsr46 from "./hsr/4.6.json";
import zzz31 from "./zzz/3.1.json";
import zzz32 from "./zzz/3.2.json";
import zzz33 from "./zzz/3.3.json";

export const versionFiles: unknown[] = [hsr44, hsr45, hsr46, zzz31, zzz32, zzz33];
