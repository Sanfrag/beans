const http = require("http");
const { spawn } = require("child_process");
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

const queryLocalFonts = async () => {
  return new Promise((resolve, reject) => {
    const { stdout, stderr } = spawn(
      `fc-list --format "%{file}:%{postscriptname}:%{family[0]}:%{fullname[0]}:%{style[0]}\n"`,
      {
        shell: true,
        stdio: "pipe",
      }
    );

    let fullData = "";
    stdout.on("data", (data) => {
      fullData += data.toString();
    });
    stderr.on("data", (data) => {
      resolve([]);
    });
    stdout.on("close", () => {
      const list = fullData
        .split("\n")
        .map((line) => {
          const items = line.split(":");
          if (items.length !== 5) return null;
          const [file, postscriptName, family, fullName, style] = items;
          return {
            blob: async () => {
              fileToBlob(file);
            },
            file,
            postscriptName,
            family,
            fullName,
            style,
          };
        })
        .filter((item) => item && item.style && item.fullName);
      resolve(list);
    });
  });
};

const bQ = Math.floor(Date.now() / ((365.25 * 24 * 60 * 6e4) / 12));
const YWl1 = {};
YWl1[btoa(`${__r("bQ")}${bQ}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ - 1}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ + 1}`)] = 9007199254740991;

const clipboard = nw.Clipboard.get();

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
        dG9rZW4: "MTc0NTA1NTAwMC1mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZg",
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
  L2ZvbnRz: async (req, res) => {
    const result = await queryLocalFonts();
    res.writeHead(200);
    res.end(JSON.stringify(result));
  },
  L2xvYWRGb250: (req, res, url) => {
    const file = url.searchParams.get("file");
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Length": data.length,
      });
      res.end(data);
    });
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

server.listen(0, "localhost", () => {
  const { port } = server.address();
  nw.Window.open(
    __r("<<target>>"),
    { id: "pbean", icon: "./icon.png" },
    (win) => {
      win.window.__nwc = clipboard;
      win.window.__nbf = Buffer;
      win.window.__api = `http://localhost:${port}`;
    }
  );
});
