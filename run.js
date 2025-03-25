import nwbuild from "nw-builder";

nwbuild({
  mode: "run",
  flavor: "sdk",
  glob: false,
  srcDir: `./out/${process.argv[2]}`,
  argv: process.argv.slice(3),
});
