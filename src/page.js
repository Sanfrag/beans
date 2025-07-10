// nullify some node
require = undefined;
process = undefined;

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

if (window.location.hostname !== "localhost" && typeof nw !== "undefined") {
  window.__lf = nw.global.__lf;
  window.__it = nw.global.__it;
  window.__api = nw.global.__api;

  window.__defineGetter__("localStorage", () => nw.global.__stor);
  navigator.__defineGetter__("onLine", () => true);

  function decodeRecentFilename(filename) {
    const parts = filename.split("\u2003");
    if (parts.length != 2) return filename;
    const path = parts[1].replace(/\u2CC6/g, "/");
    return path;
  }

  const __r = (d) => {
    if (typeof d === "string") return atob(d);
    if (typeof d !== "object") return d;
    if (d instanceof Array) return d.map((e) => __r(e));
    const o = {};
    for (const k in d) o[__r(k)] = __r(d[k]);
    return o;
  };

  const __s = (d) => JSON.stringify(__r(d));

  const __ws = window.self;
  window.self = new Proxy(
    {},
    {
      get: (_, prop) => {
        return __ws[prop];
      },
      set: (_, prop, value) => {
        __ws[prop] = value;
      },
    }
  );

  document.__defineGetter__("referrer", () => "https://sanfrag.local");

  const Navigator_Permissions_Query = navigator.permissions.query;
  navigator.permissions.query = async function (args) {
    if (args.name === "clipboard-read") {
      args.state = "granted";
      return args;
    }
    Navigator_Permissions_Query.apply(this, arguments);
  };

  let ud = window.localStorage.getItem(__r("X3BwcA"));

  try {
    ud = JSON.parse(ud);
  } catch {}

  if (!ud) {
    ud = __r({
      Y2FwU2hvd24: "ZmFsc2U",
      X2x0b29scw: "MA",
      MF91aWQ: "MQ",
      MF90b2tlbg: btoa(
        Math.floor(Date.now() / 1000 + 31556926) +
          __r("LWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm")
      ),
      MF9wcm92aWRlcg: "Mg",
      MF9zdGF0ZUxvY2Fs: "eyJnbG9iYWxzIjp7fSwiYWNjIjp7fX0",
    });
  } else {
    ud[__r("MF90b2tlbg")] =
      Math.floor(Date.now() / 1000 + 31556926) +
      __r("LWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm");
  }

  window.localStorage.setItem(__r("X3BwcA"), JSON.stringify(ud));

  const mockHandle = (file) => {
    return {
      name: file.name,
      getFile: async () => {
        return file;
      },
      createWritable: () => {
        return new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(file.path, {
            encoding: "binary",
          });
          stream.on("error", (err) => {
            reject(err);
            alert(err.message);
          });
          stream.on("open", () => {
            resolve({
              write: (data) => stream.write(Buffer.from(data)),
              close: () => {
                stream.end(), stream.close();
              },
            });
          });
        });
      },
    };
  };

  window.showSaveFilePicker = async function (options) {
    const input = document.createElement("input");
    input.type = "file";
    input.nwworkingdir =
      nw.global.localStorage.getItem("__dialogPath") || undefined;
    input.nwsaveas = path.basename(decodeRecentFilename(options.suggestedName));
    input.accept = options.types
      .flatMap((t) => Object.values(t.accept).flat())
      .join(",");
    input.click();

    return new Promise((resolve, reject) => {
      input.addEventListener("cancel", () => {
        reject(new Error("User cancelled file selection"));
      });

      input.addEventListener("change", () => {
        if (input.files.length === 0) {
          reject(new Error("User cancelled file selection"));
          return;
        }

        nw.global.recordRecent(input.files[0].path);
        const fakeFileHandle = mockHandle(input.files[0]);
        resolve(fakeFileHandle);
      });
    });
  };

  window.showOpenFilePicker = async function (options) {
    const input = document.createElement("input");
    input.type = "file";
    input.nwworkingdir =
      nw.global.localStorage.getItem("__dialogPath") || undefined;
    input.multiple = options.multiple;
    input.click();

    return new Promise((resolve, reject) => {
      input.addEventListener("cancel", () => {
        reject(new Error("User cancelled file selection"));
      });

      input.addEventListener("change", () => {
        if (input.files.length === 0) {
          reject(new Error("User cancelled file selection"));
          return;
        }

        const handles = [];
        for (const file of input.files) {
          nw.global.recordRecent(file.path);
          handles.push(mockHandle(file));
        }
        resolve(handles);
      });
    });
  };

  const XMLHttpRequest_Open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (_, url) {
    if (
      url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL2NvZGUvc3RvcmFnZXM"))
    ) {
      url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
    }
    if (url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL3BhcGk"))) {
      url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
    }
    if (url.startsWith(__r("Ly93d3cucGhvdG9wZWEuY29tL3BhcGkv"))) {
      url = url.replace(__r("Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
    }
    if (url.startsWith(__r("L3BhcGkv"))) {
      url = window.__api + url;
    }
    if (url.startsWith(__r("cGFwaS8"))) {
      url = window.__api + "/" + url;
    }
    return XMLHttpRequest_Open.apply(this, arguments);
  };

  const boot = () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: __s({
          cHJtcw:
            "cGFwaV9sb2dnZWRfaW4sMSwxNzQ1MDU1MDAwLWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmLDI",
        }),
      })
    );
  };

  const Window_Open = window.open;
  window.open = function (url, ...args) {
    if (url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL3BhcGk"))) {
      url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
      const win = Window_Open.apply(this, [url, ...args]);
      setTimeout(boot, 1000);
      return win;
    }
    return Window_Open.apply(this, arguments);
  };

  const HTMLIFrameElement_SetAttribute =
    HTMLIFrameElement.prototype.setAttribute;
  HTMLIFrameElement.prototype.setAttribute = function (name, value) {
    if (name === "src") {
      if (value.endsWith(__r("cGVhZHJpdmVTdG9yYWdlLmh0bWw"))) {
        value = `${window.__api}/${__r("cGVhZHJpdmVTdG9yYWdlLmh0bWw")}`;
        return HTMLIFrameElement_SetAttribute.apply(this, [name, value]);
      }
      if (value.endsWith(__r("ZGV2aWNlU3RvcmFnZS5odG1s"))) {
        value = `${window.__api}/${__r("ZGV2aWNlU3RvcmFnZS5odG1s")}`;
        return HTMLIFrameElement_SetAttribute.apply(this, [name, value]);
      }
    }
    return HTMLIFrameElement_SetAttribute.apply(this, arguments);
  };

  const __wael = window.addEventListener;
  window.addEventListener = function (type) {
    if (type === "beforeinstallprompt") return;
    return __wael.apply(this, arguments);
  };

  let __cop;

  /** @type {typeof import("fs")} */
  const fs = nw.require("fs");
  /** @type {typeof import("path")} */
  const path = nw.require("path");

  const _dael = HTMLDivElement.prototype.addEventListener;
  HTMLDivElement.prototype.addEventListener = function (type, listener) {
    if (this.className == "body" && type === "drop") {
      __cop = (filePath) => {
        nw.global.recordRecent(filePath);

        const file = new File(filePath, path.basename(filePath));
        listener({
          dataTransfer: {
            getData: () => "",
            files: [file],
            items: [
              {
                getAsFileSystemHandle: async () => mockHandle(file),
              },
            ],
          },
          stopPropagation: () => {},
          preventDefault: () => {},
          currentTarget: {
            className: "fake",
          },
        });
      };

      if (__lf) {
        for (const filePath of __lf) {
          __cop(filePath);
        }
        __lf.splice(0, __lf.length);
      }

      if (__it) {
        __it.__cop = __cop;
      }

      function listenerWrapper() {
        const result = listener.apply(this, arguments);
        // find the file and record it as recent
        const file = arguments[0].dataTransfer.files[0];
        if (file) {
          nw.global.recordRecent(file.path);
        }
        return result;
      }

      return _dael.apply(this, [type, listenerWrapper]);
    }
    return _dael.apply(this, arguments);
  };

  const __st = () => {
    const head = document.head;
    if (head) {
      const style = document.createElement("style");
      style.textContent = nw.global.__style;
      head.append(style);
    } else {
      setTimeout(__st, 500);
    }
  };
  __st();

  window.__defineGetter__("parent", function s() {
    if (
      s.caller &&
      s.caller.toString().indexOf("window.parent.postMessage") != -1
    ) {
      return {
        postMessage: (data) => {
          if (data == "done") {
            window.self = window.top;
          }
        },
      };
    } else {
      return window;
    }
  });
}
