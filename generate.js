import fs from "node:fs";

const VARIANTS = [
  {
    name: "pbean",
    target: "aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t",
    ci: "WzEsMSwxLDEsMSwxLDEsMSxbMSwxLDAsMSwxXV0",
    icon: "./icons/512/pbean.png",
  },
  {
    name: "vbean",
    target: "aHR0cHM6Ly93d3cudmVjdG9ycGVhLmNvbQ",
    ci: "WzEsMSwxLDEsMSxbMSwxLDBdXQ",
    icon: "./icons/512/vbean.png",
  },
];

const dirname = import.meta.dirname;

const generate = () => {
  for (const variant of VARIANTS) {
    const target = variant.target;
    const icon = variant.icon;
    const name = variant.name;
    fs.rmSync(`${dirname}/out/${name}`, { recursive: true, force: true });
    fs.mkdirSync(`${dirname}/out/${name}`, { recursive: true });

    const file = fs.readFileSync(`${dirname}/src/index.js`, "utf-8");
    const newFile = file
      .replace("<<target>>", `${target}`)
      .replace("<<ci>>", `${variant.ci}`);
    fs.writeFileSync(`${dirname}/out/${name}/index.js`, newFile);
    fs.writeFileSync(
      `${dirname}/out/${name}/package.json`,
      JSON.stringify(
        {
          main: "./index.js",
          name: name,
          product_string: name,
          inject_js_start: "./page.js",
          "chromium-args":
            "--ozone-platform-hint=auto --enable-wayland-ime --disable-web-security",
          version: "0.0.2",
          "node-remote": [atob(target)],
          dom_storage_quota: 4095,
          window: {
            icon: "./icon.png",
          },
        },
        null,
        2
      )
    );
    fs.copyFileSync(`${dirname}/src/page.js`, `${dirname}/out/${name}/page.js`);
    fs.copyFileSync(`${dirname}/${icon}`, `${dirname}/out/${name}/icon.png`);
  }
};

generate();
console.log("Generated!");
