const http = require("http");
const path = require("path");
const fs = require("fs");

const __r = (d) => {
  if (typeof d === "string") return atob(d);
  if (typeof d !== "object") return d;
  if (d instanceof Array) return d.map((e) => __r(e));
  const o = {};
  for (const k in d) o[__r(k)] = __r(d[k]);
  return o;
};
const __s = (d) => JSON.stringify(__r(d));

const bQ = Math.floor(Date.now() / ((365.25 * 24 * 60 * 6e4) / 12));
const YWl1 = {};
YWl1[btoa(`${__r("bQ")}${bQ}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ - 1}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ + 1}`)] = 9007199254740991;

const clipboard = nw.Clipboard.get();

try {
  nw.global.__style = __r(
    fs.readFileSync(path.join(__dirname, "style.css"), "utf-8")
  );
} catch {}

/** @type {Record<string, (req: http.IncomingMessage, res: http.ServerResponse, url: URL) => void>} */
const END_POINTS = {
  "L3BhcGkvcmVjb3JkX25ldy5waHA=": (req, res) => {
    res.writeHead(200);
    res.end(
      __s({
        dXNlcg: {
          aWQ: 1,
          bmFtZQ: "UmVkYWN0IEVk",
          ZW1haWw: "cmVkYWN0QGVkLm5hbWU",
          cG1udHM: [[8640000000000, 100000000, 1, 0, "SU5WQUxJRA"]],
          aW5UZWFtcw: [],
          d2FudFRvSm9pbg: {},
        },
        c3B1YmxpYw: true,
        dG9rZW4: btoa(
          Math.floor(Date.now() / 1000 + 31556926) +
            atob("LWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm")
        ),
        cmVjb3Jk: { Z2xvYmFscw: {}, YWNj: { YWl1 } },
      })
    );
  },
  L3BhcGkvbG9naW4ucGhw: (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(200);
    res.end(
      __r(
        "PGh0bWw+PGhlYWQ+PHNjcmlwdD48L3NjcmlwdD48L2hlYWQ+PGJvZHk+TG9nZ2luZyBpbi4uLjwvYm9keT48L2h0bWw+"
      )
    );
  },
  L3BhcGkvZG9tcy5qc29u: (req, res) => {
    res.writeHead(200);
    res.end(
      __s({
        Lg: 9007199254740991,
      })
    );
  },
  "L2V2ZW50LnBocA==": (req, res) => {
    res.writeHead(200);
    res.end();
  },
  "L2RldmljZVN0b3JhZ2UuaHRtbA==": (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(200);

    let content = "";
    try {
      content = __r(
        fs.readFileSync(path.join(__dirname, "recent.html"), "utf-8")
      );
    } catch {}
    res.end(content);
  },
  L3BlYWRyaXZlU3RvcmFnZS5odG1s: (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(200);

    let content = "";
    try {
      content = __r(
        fs.readFileSync(path.join(__dirname, "recent.html"), "utf-8")
      );
    } catch {}
    res.end(content);
  },
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Content-Type", "application/json");

  const url = new URL(`http://internal${req.url}`);
  const handler = END_POINTS[btoa(url.pathname)];
  if (handler) {
    handler(req, res, url);
    return;
  }

  res.writeHead(404);
  res.end();
});

const __ci = {
  ZW52aXJvbm1lbnQ: {
    bWVudXM: JSON.parse(atob("<<ci>>")),
  },
};

const __it = {};

const dirbasename = "/" + path.basename(__dirname);

const openHandler = (args) => {
  try {
    const files = args.flatMap((args) => {
      let cur = "";
      let phrase = false;
      let escape = false;
      const parts = [];
      for (const char of args) {
        if (escape) {
          if (char == '"') cur += char;
          else cur += "\\" + char;
          escape = false;
        } else if (char === "\\") {
          escape = true;
        } else if (char === " ") {
          if (phrase) {
            cur += char;
          } else {
            parts.push(cur);
            cur = "";
          }
        } else if (char === '"') {
          phrase = !phrase;
        } else {
          cur += char;
        }
      }
      parts.push(cur);
      return parts.filter(
        (part) =>
          !part.startsWith("-") &&
          part != "nw" &&
          !part.endsWith("/nw") &&
          !part.endsWith(dirbasename)
      );
    });

    for (const arg of files) {
      // check if arg is a file
      if (!fs.existsSync(arg)) continue;
      process.stdout.write("Opening File: ");
      process.stdout.write(arg);
      process.stdout.write("\n");

      process.stdout.write("Type: ");
      process.stdout.write(typeof __it);
      process.stdout.write("\n");

      process.stdout.write("Type: ");
      process.stdout.write(typeof __it.__cop);
      process.stdout.write("\n");

      if (__it.__cop) __it.__cop(arg);
    }
  } catch (e) {
    process.stdout.write("Open error: ");
    process.stdout.write(e.toString());
    process.stdout.write("\n");
  }
};

nw.App.onOpen.addListener((args) => {
  openHandler(args.filter((arg) => !arg.startsWith("--")));
});

nw.global.recordRecent = (filePath) => {
  if (filePath.indexOf("\u2CC6") !== -1 || filePath.indexOf("\u2003") !== -1)
    return;

  const ALLOWED = [
    ".psd",
    ".ai",
    ".indd",
    ".xcf",
    ".sketch",
    ".xd",
    ".fig",
    ".kri",
    ".clip",
    ".sai",
    ".pxd",
    ".pxz",
    ".cdr",
    ".ufo",
    ".afphoto",
    ".gvdesign",
    ".svg",
    ".eps",
    ".pdf",
    ".pdn",
    ".wmf",
    ".emf",
    ".png",
    ".apng",
    ".jpg",
    ".gif",
    ".webp",
    ".ico",
    ".icns",
    ".bmp",
    ".avif",
    ".heic",
    ".jxl",
    ".ppm",
    ".pgm",
    ".pbm",
    ".tiff",
    ".dds",
    ".iff",
    ".exr",
    ".hdr",
    ".anim",
    ".tga",
    ".dng",
    ".nef",
    ".cr2",
    ".cr3",
    ".arw",
    ".rw2",
    ".raf",
    ".orf",
    ".gpr",
    ".3fr",
    ".fff",
    ".gif",
    ".apng",
    ".mp4",
    ".webm",
    ".mkv",
  ];
  const pathLower = filePath.toLowerCase();
  if (!ALLOWED.some((ext) => pathLower.endsWith(ext))) return;

  let recent = nw.global.localStorage.getItem("recentFiles");
  try {
    recent = JSON.parse(recent);
  } catch {
    recent = [];
  }

  if (!Array.isArray(recent)) {
    recent = [];
  }

  recent = recent.filter((p) => p !== filePath);

  if (recent.length >= 50) {
    recent = recent.slice(0, 49);
  }

  recent.unshift(filePath);

  nw.global.localStorage.setItem("recentFiles", JSON.stringify(recent));
};

const __lf = [];

try {
  if (nw.App.argv) {
    for (const arg of nw.App.argv) {
      // check if arg is a file
      if (!fs.existsSync(arg)) continue;
      process.stdout.write("Opening File: ");
      process.stdout.write(arg);
      process.stdout.write("\n");
      __lf.push(arg);
    }
  }
} catch (e) {
  process.stdout.write("Launch error: ");
  process.stdout.write(e.toString());
  process.stdout.write("\n");
}

nw.global.__nwc = clipboard;
nw.global.__nbf = Buffer;
nw.global.__lf = __lf;
nw.global.__it = __it;

server.listen(0, "localhost", () => {
  const { port } = server.address();
  nw.global.__api = `http://localhost:${port}`;

  nw.Window.open(__r("<<target>>") + "#" + encodeURIComponent(__s(__ci)), {
    id: "pbean",
    icon: "./icon.png",
  });
});
