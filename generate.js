import fs from "node:fs";

const VARIANTS = [
  {
    name: "pbean",
    target: "aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t",
    icon: "./icons/pbean.png",
  },
  {
    name: "vbean",
    target: "aHR0cHM6Ly93d3cudmVjdG9ycGVhLmNvbQ",
    icon: "./icons/vbean.png",
  },
];

const dirname = import.meta.dirname;

const generate = () => {
  for (const variant of VARIANTS) {
    const target = variant.target;
    const icon = variant.icon;
    const name = variant.name;
    const file = fs.readFileSync(`${dirname}/src/index.js`, "utf8");
    const newFile = file.replace("<<target>>", `${target}`);
    fs.rmSync(`${dirname}/out/${name}`, { recursive: true, force: true });
    fs.mkdirSync(`${dirname}/out/${name}`, { recursive: true });
    fs.writeFileSync(`${dirname}/out/${name}/index.js`, newFile);
    fs.writeFileSync(
      `${dirname}/out/${name}/package.json`,
      JSON.stringify(
        {
          main: "./index.js",
          name: name,
          product_string: name,
          inject_js_start: "./inject.js",
          "chromium-args": "--ozone-platform-hint=auto --enable-wayland-ime",
          version: "0.0.1",
          window: {
            icon: "./icon.png",
          },
        },
        null,
        2
      )
    );
    fs.copyFileSync(
      `${dirname}/src/inject.js`,
      `${dirname}/out/${name}/inject.js`
    );
    fs.copyFileSync(`${dirname}/${icon}`, `${dirname}/out/${name}/icon.png`);
  }
};

generate();
console.log("Generated!");
