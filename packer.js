import fs from "node:fs";

const files = ["recent.html", "style.css"];

for (const file of files) {
  const content = fs.readFileSync(`tools/${file}`, "utf-8");
  fs.writeFileSync(`src/${file}`, btoa(content));
}
