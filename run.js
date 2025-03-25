import nwbuild from "nw-builder";

console.log(process.argv.slice(3));

nwbuild({
  mode: "run",
  flavor: "sdk",
  glob: false,
  srcDir: `./out/${process.argv[2]}`,
  argv: process.argv.slice(3),
});
