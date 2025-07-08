const http = require("http");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { spawn } = require("child_process");

const __r = (d) => {
  if (typeof d === "string") return atob(d);
  if (typeof d !== "object") return d;
  if (d instanceof Array) return d.map((e) => __r(e));
  const o = {};
  for (const k in d) o[__r(k)] = __r(d[k]);
  return o;
};
const __e = (d) => {
  if (typeof d === "string") return btoa(d);
  if (typeof d !== "object") return d;
  if (d instanceof Array) return d.map((e) => __e(e));
  const o = {};
  for (const k in d) o[__e(k)] = __e(d[k]);
  return o;
};
const __s = (d) => JSON.stringify(__r(d));

const bQ = Math.floor(Date.now() / ((365.25 * 24 * 60 * 6e4) / 12));
const YWl1 = {};
YWl1[btoa(`${__r("bQ")}${bQ}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ - 1}`)] = 9007199254740991;
YWl1[btoa(`${__r("bQ")}${bQ + 1}`)] = 9007199254740991;

try {
  nw.global.__style = __r(
    fs.readFileSync(path.join(__dirname, "style.css"), "utf-8")
  );
} catch {}

const STOR_FILE = path.join(nw.App.dataPath, "Store.json");
let __stor = {};
try {
  if (fs.existsSync(STOR_FILE)) {
    __stor = JSON.parse(fs.readFileSync(STOR_FILE, "utf-8"));
  }
} catch {}

const __storI = {
  getItem: (k) => __stor[k],
  setItem: (k, v) => {
    __stor[k] = v.toString();
    fs.writeFileSync(STOR_FILE, JSON.stringify(__stor));
  },
};

nw.global.__stor = __storI;
nw.global.__defineGetter__("localStorage", () => nw.global.__stor);

const readFormUrlencoded = async (req) => {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const result = {};
      for (const [key, value] of params) {
        result[key] = value;
      }
      resolve(result);
    });
  });
};

const CACHE_DIR = path.join(nw.App.dataPath, "ThumbnailCacheStore");
const MAX_CACHE_FILES = 150;
const KEEP_CACHE_FILES = 50;
const CACHE_EXPIRY_DAYS = 7;

const ensureCacheDir = () => {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log(`Created cache directory: ${CACHE_DIR}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to create cache directory: ${CACHE_DIR}`, error);
    return false;
  }
};

ensureCacheDir();

const thumbnailQueue = [];
let isProcessingQueue = false;
let queueIdCounter = 0;

const getFileHash = (filePath) => {
  return crypto.createHash("sha256").update(filePath).digest("hex");
};

const getCacheMetadata = () => {
  try {
    const data = nw.global.localStorage.getItem("thumbnailCache");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveCacheMetadata = (metadata) => {
  try {
    nw.global.localStorage.setItem("thumbnailCache", JSON.stringify(metadata));
  } catch (e) {
    console.error("Failed to save cache metadata:", e);
  }
};

const updateAccessTime = (fileHash) => {
  const metadata = getCacheMetadata();
  if (metadata[fileHash]) {
    metadata[fileHash].accessTime = Date.now();
    saveCacheMetadata(metadata);
  }
};

const isGenerationFailed = (fileStat, fileHash) => {
  try {
    const metadata = getCacheMetadata();
    const cacheInfo = metadata[fileHash];
    if (!cacheInfo || !cacheInfo.failed) return false;

    return cacheInfo.modifiedTime === fileStat.mtime.getTime();
  } catch {
    return false;
  }
};

const markGenerationFailed = (filePath, fileHash, fileStat) => {
  try {
    const metadata = getCacheMetadata();
    metadata[fileHash] = {
      modifiedTime: fileStat.mtime.getTime(),
      accessTime: Date.now(),
      filePath: filePath,
      failed: true,
      failedAt: Date.now(),
    };
    saveCacheMetadata(metadata);
  } catch (e) {
    console.error("Failed to mark generation failure:", e);
  }
};

const isCacheValid = (fileStat, fileHash) => {
  try {
    const cachePath = path.join(CACHE_DIR, `${fileHash}.png`);
    if (!fs.existsSync(cachePath)) return false;

    const metadata = getCacheMetadata();
    const cacheInfo = metadata[fileHash];
    if (!cacheInfo) return false;

    return cacheInfo.modifiedTime === fileStat.mtime.getTime();
  } catch {
    return false;
  }
};

const videoExtensions = [
  ".mp4",
  ".webm",
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".m4v",
  ".3gp",
  ".ogv",
];

const imageMagickSupported = [
  ".psd",
  ".ai",
  ".xcf",
  ".svg",
  ".eps",
  ".pdf",
  ".wmf",
  ".emf",
  ".png",
  ".apng",
  ".jpg",
  ".jpeg",
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
  ".tif",
  ".dds",
  ".iff",
  ".exr",
  ".hdr",
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
];

nw.global.__thumbExts = [...videoExtensions, ...imageMagickSupported];

const generateThumbnail = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ensureCacheDir()) {
      reject(new Error("Failed to create cache directory"));
      return;
    }

    const pathLower = inputPath.toLowerCase();
    const isVideo = videoExtensions.some((ext) => pathLower.endsWith(ext));
    const isImageMagickSupported = imageMagickSupported.some((ext) =>
      pathLower.endsWith(ext)
    );

    if (!isVideo && !isImageMagickSupported) {
      reject(
        new Error(
          `Unsupported file format: ${path.extname(
            inputPath
          )}. Only video files and ImageMagick-supported formats are allowed.`
        )
      );
      return;
    }

    if (isVideo) {
      const ffmpegPath = process.env.BEANS_FFMPEG || "ffmpeg";
      const ffmpeg = spawn(ffmpegPath, [
        "-i",
        inputPath,
        "-vframes",
        "1",
        "-vf",
        "scale=256:256:force_original_aspect_ratio=decrease,pad=256:256:(ow-iw)/2:(oh-ih)/2:color=black@0",
        "-y",
        outputPath,
      ]);

      let stderrOutput = "";

      ffmpeg.stderr.on("data", (data) => {
        stderrOutput += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error(`FFmpeg failed for file: ${inputPath}`);
          console.error(`FFmpeg stderr: ${stderrOutput}`);
          reject(
            new Error(
              `FFmpeg failed with code ${code}. File: ${inputPath}. Error: ${stderrOutput.slice(
                -200
              )}`
            )
          );
        }
      });

      ffmpeg.on("error", (err) => {
        console.error(`FFmpeg spawn error for file: ${inputPath}`, err);
        reject(err);
      });

      ffmpeg.stdout.on("data", () => {});
    } else {
      const isIcoFile =
        pathLower.endsWith(".ico") || pathLower.endsWith(".icns");
      let inputSpec;

      if (isIcoFile) {
        inputSpec = `${inputPath}[-1]`;
      } else {
        inputSpec = `${inputPath}[0]`;
      }

      const magickPath = process.env.BEANS_MAGICK || "magick";
      const magick = spawn(magickPath, [
        inputSpec,
        "-flatten",
        "-thumbnail",
        "256x256",
        "-background",
        "transparent",
        "-gravity",
        "center",
        "-extent",
        "256x256",
        outputPath,
      ]);

      magick.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ImageMagick failed with code ${code}`));
        }
      });

      magick.on("error", (err) => {
        reject(err);
      });
    }
  });
};

const processQueue = async () => {
  if (isProcessingQueue || thumbnailQueue.length === 0) return;

  isProcessingQueue = true;

  while (thumbnailQueue.length > 0) {
    const queueItem = thumbnailQueue.shift();
    const { filePath, fileHash, resolve, reject, aborted } = queueItem;

    if (aborted) {
      continue;
    }

    try {
      const cachePath = path.join(CACHE_DIR, `${fileHash}.png`);
      await generateThumbnail(filePath, cachePath);

      if (queueItem.aborted) {
        continue;
      }

      if (fs.existsSync(cachePath)) {
        const fileStat = fs.statSync(filePath);
        const metadata = getCacheMetadata();
        metadata[fileHash] = {
          modifiedTime: fileStat.mtime.getTime(),
          accessTime: Date.now(),
          filePath: filePath,
          failed: false,
        };
        saveCacheMetadata(metadata);
        resolve(cachePath);
      } else {
        const fileStat = fs.statSync(filePath);
        markGenerationFailed(filePath, fileHash, fileStat);
        reject(new Error("Can not find cache file"));
      }
    } catch (error) {
      if (!queueItem.aborted) {
        try {
          const fileStat = fs.statSync(filePath);
          markGenerationFailed(filePath, fileHash, fileStat);
        } catch (statError) {
          console.error(
            "Failed to get file stat for failure marking:",
            statError
          );
        }
        reject(error);
      }
    }
  }

  isProcessingQueue = false;
};

const queueThumbnailGeneration = (filePath, fileHash, abortSignal = null) => {
  return new Promise((resolve, reject) => {
    const queueId = ++queueIdCounter;
    const queueItem = {
      id: queueId,
      filePath,
      fileHash,
      resolve,
      reject,
      aborted: false,
    };

    if (abortSignal) {
      const onAbort = () => {
        queueItem.aborted = true;
        const index = thumbnailQueue.findIndex((item) => item.id === queueId);
        if (index !== -1) {
          thumbnailQueue.splice(index, 1);
          reject(new Error("Request aborted"));
        }
      };

      if (abortSignal.aborted) {
        onAbort();
        return;
      }

      abortSignal.addEventListener("abort", onAbort);
    }

    thumbnailQueue.push(queueItem);
    processQueue();
  });
};

const cleanupCache = async () => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    const metadata = getCacheMetadata();
    const now = Date.now();
    const weekInMs = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    for (const fileHash in metadata) {
      const cacheInfo = metadata[fileHash];
      if (cacheInfo.failed && now - cacheInfo.accessTime > weekInMs) {
        delete metadata[fileHash];
      }
    }

    const validFiles = [];
    for (const file of files) {
      if (!file.endsWith(".png")) continue;

      const fileHash = file.replace(".png", "");
      const cacheInfo = metadata[fileHash];

      if (!cacheInfo || now - cacheInfo.accessTime > weekInMs) {
        try {
          fs.unlinkSync(path.join(CACHE_DIR, file));
          if (cacheInfo) {
            delete metadata[fileHash];
          }
        } catch (e) {
          console.error("Failed to delete cache file:", e);
        }
      } else if (!cacheInfo.failed) {
        validFiles.push({ file, accessTime: cacheInfo.accessTime });
      }
    }

    if (validFiles.length > MAX_CACHE_FILES) {
      validFiles.sort((a, b) => a.accessTime - b.accessTime);
      const filesToRemove = validFiles.slice(
        0,
        validFiles.length - KEEP_CACHE_FILES
      );

      for (const { file } of filesToRemove) {
        try {
          fs.unlinkSync(path.join(CACHE_DIR, file));
          const fileHash = file.replace(".png", "");
          delete metadata[fileHash];
        } catch (e) {
          console.error("Failed to delete cache file:", e);
        }
      }
    }

    saveCacheMetadata(metadata);
  } catch (e) {
    console.error("Cache cleanup failed:", e);
  }
};

// Check if cleanup is needed (12 hours since last cleanup)
const shouldRunCleanup = () => {
  try {
    const lastCleanup = nw.global.localStorage.getItem("lastCacheCleanup");
    if (!lastCleanup) return true;

    const lastCleanupTime = parseInt(lastCleanup, 10);
    const now = Date.now();
    const twelveHoursInMs = 12 * 60 * 60 * 1000; // 12 hours

    return now - lastCleanupTime >= twelveHoursInMs;
  } catch (e) {
    console.error("Error checking cleanup timestamp:", e);
    return true; // Default to running cleanup if there's an error
  }
};

// Run cleanup and update timestamp
const runCleanupIfNeeded = async () => {
  if (shouldRunCleanup()) {
    try {
      await cleanupCache();
      nw.global.localStorage.setItem("lastCacheCleanup", Date.now().toString());
    } catch (e) {
      console.error("Error during cleanup:", e);
    }
  }
};

// Initial cleanup on startup
runCleanupIfNeeded();

const streamFile = (filePath, res) => {
  return new Promise((resolve, reject) => {
    try {
      if (res.destroyed || (res.headersSent && res.writableEnded)) {
        resolve();
        return;
      }

      const stream = fs.createReadStream(filePath);

      stream.on("error", (err) => {
        console.error("Stream read error:", err);
        if (!res.destroyed && !res.writableEnded) {
          res.end();
        }
        reject(err);
      });

      res.on("error", (err) => {
        console.error("Response error:", err);
        stream.destroy();
        reject(err);
      });

      res.on("close", () => {
        stream.destroy();
        resolve();
      });

      stream.on("end", () => {
        resolve();
      });

      stream.pipe(res);
    } catch (err) {
      console.error("StreamFile error:", err);
      if (!res.destroyed && !res.writableEnded) {
        res.end();
      }
      reject(err);
    }
  });
};

/** @type {Record<string, (req: http.IncomingMessage, res: http.ServerResponse, url: URL) => void>} */
const END_POINTS = {
  "L3BhcGkvcmVjb3JkX25ldy5waHA=": async (req, res) => {
    const body = await readFormUrlencoded(req);

    res.writeHead(200);
    if (+body[__r("cmVhZA")]) {
      let savedata = nw.global.localStorage.getItem("__savedata") || "{}";
      try {
        savedata = JSON.parse(savedata);
      } catch {
        savedata = {};
      }

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
          cmVjb3Jk: {
            Z2xvYmFscw: __e(savedata),
            YWNj: { YWl1 },
          },
        })
      );
    } else {
      const record = body[__r("cmVjb3Jk")];
      if (record) {
        try {
          const data = JSON.parse(record);
          if (data[__r("Z2xvYmFscw")]) {
            nw.global.localStorage.setItem(
              "__savedata",
              JSON.stringify(data[__r("Z2xvYmFscw")])
            );
          }
        } catch {}
      }
      res.end(
        __s({
          dG9rZW4: btoa(
            Math.floor(Date.now() / 1000 + 31556926) +
              atob("LWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm")
          ),
        })
      );
    }
  },
  L3BhcGkvbG9naW4ucGhw: async (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.writeHead(200);
    res.end(
      __r(
        "PGh0bWw+PGhlYWQ+PHNjcmlwdD48L3MagickNjcmlwdD48L2hlYWQ+PGJvZHk+TG9nZ2luZyBpbi4uLjwvYm9keT48L2h0bWw+"
      )
    );
  },
  L3BhcGkvZG9tcy5qc29u: async (req, res) => {
    res.writeHead(200);
    res.end(
      __s({
        Lg: 9007199254740991,
      })
    );
  },
  L3BhcGkvZXZlbnQucGhw: async (req, res) => {
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
  L3BlYWRyaXZlU3RvcmFnZS5odG1s: async (req, res) => {
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
  "L3RodW1icw==": async (req, res, url) => {
    // Check if cache cleanup is needed (12 hours since last cleanup)
    runCleanupIfNeeded();

    const filePath = url.searchParams.get("f");
    if (!filePath) {
      res.writeHead(404);
      res.end();
      return;
    }

    const abortController = new AbortController();

    req.on("close", () => {
      abortController.abort();
    });

    req.on("aborted", () => {
      abortController.abort();
    });

    if (abortController.signal.aborted) {
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end();
      return;
    }

    const fileStat = fs.statSync(filePath);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Last-Modified", fileStat.mtime.toUTCString());

    const ifModifiedSince = req.headers["if-modified-since"];
    if (ifModifiedSince) {
      const lastModified = fileStat.mtime.toUTCString();
      if (ifModifiedSince === lastModified) {
        res.writeHead(304);
        res.end();
        return;
      }
    }

    try {
      const fileHash = getFileHash(filePath);
      const cachePath = path.join(CACHE_DIR, `${fileHash}.png`);

      if (isCacheValid(fileStat, fileHash)) {
        updateAccessTime(fileHash);
        res.writeHead(200);

        try {
          await streamFile(cachePath, res);
        } catch (streamError) {
          console.error("Error streaming cached file:", streamError);
          if (!res.headersSent) {
            res.writeHead(500);
            res.end();
          }
        }
        return;
      }

      if (isGenerationFailed(fileStat, fileHash)) {
        console.log(
          "Generation previously failed for this file, serving fallback"
        );
        updateAccessTime(fileHash);
        res.writeHead(200);

        try {
          await streamFile(path.join(__dirname, "icon.png"), res);
        } catch (fallbackError) {
          console.error("Fallback streaming failed:", fallbackError);
          if (!res.headersSent) {
            res.writeHead(500);
            res.end();
          }
        }
        return;
      }

      if (abortController.signal.aborted) {
        return;
      }

      try {
        const generatedCachePath = await queueThumbnailGeneration(
          filePath,
          fileHash,
          abortController.signal
        );

        if (abortController.signal.aborted) {
          return;
        }

        updateAccessTime(fileHash);
        res.writeHead(200);

        try {
          await streamFile(generatedCachePath, res);
        } catch (streamError) {
          console.error("Error streaming generated file:", streamError);
          if (!res.headersSent) {
            res.writeHead(500);
            res.end();
          }
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("Thumbnail generation failed:", error);
        if (!res.headersSent) {
          res.writeHead(200);
          try {
            await streamFile(path.join(__dirname, "icon.png"), res);
          } catch (fallbackError) {
            console.error("Fallback streaming failed:", fallbackError);
            res.end();
          }
        }
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      console.error("Thumbnail handler error:", error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end();
      }
    }
  },
};

const server = http.createServer(async (req, res) => {
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

  recent = recent.filter((p) => p.path !== filePath);

  if (recent.length >= 50) {
    recent = recent.slice(0, 49);
  }

  recent.unshift({ path: filePath, time: Math.floor(Date.now() / 1000) });
  nw.global.localStorage.setItem("__dialogPath", path.dirname(filePath));
  nw.global.localStorage.setItem("recentFiles", JSON.stringify(recent));
};

const __lf = [];

try {
  if (nw.App.argv) {
    for (const arg of nw.App.argv) {
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
