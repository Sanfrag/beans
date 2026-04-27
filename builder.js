import nwbuild from "nw-builder";
import { readFileSync } from "fs";

const [bean, platform, arch] = process.argv.slice(2);

// Read version from flake.nix
const flakeNix = readFileSync("flake.nix", "utf8");
const versionMatch = flakeNix.match(/^\s*version\s*=\s*"([^"]+)"/m);
const version = versionMatch ? versionMatch[1] : "0.0.0";
console.log(version);

nwbuild({
  mode: "build",
  flavor: "sdk",
  glob: false,
  cacheDir: `./cache`,
  srcDir: `./out/${bean}`,
  platform,
  arch,
  outDir: `./build/${bean}-${platform}-${arch}`,
  argv: process.argv.slice(5),
  app: {
    name: bean === 'vbean' ? atob("VmVjdG9ycGVh") : atob("UGhvdG9wZWE"),
    fileDescription: bean === 'vbean' ? atob("VmVjdG9yIGdyYXBoaWNzIGVkaXRvcg") : atob("UmFzdGVyIGdyYXBoaWNzIGVkaXRvcg"),
    icon: `./icons/512/${bean}.png`,
    LSApplicationCategoryType: "public.app-category.graphics-design",
    NSHumanReadableCopyright: "Public Domain",
    version,
  }
});
