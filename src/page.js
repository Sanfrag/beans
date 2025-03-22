const __r = (d) => {
  if (typeof d === "string") return atob(d);
  if (typeof d !== "object") return d;
  if (d instanceof Array) return d.map((e) => __r(e));
  const o = {};
  for (const k in d) o[__r(k)] = __r(d[k]);
  return o;
};
const __s = (d) => JSON.stringify(__r(d));
const __utb = (uri) => {
  const data = uri.split(",");
  const mime = data[0].split(":")[1].split(";")[0];
  return new Blob([window.__nbf.from(data[1], "base64")], { type: mime });
};

// fake queryLocalFonts
window.queryLocalFonts = async () => {
  const fonts = new URL(`${window.__api}/fonts`);
  const response = await fetch(fonts);
  const data = await response.json();

  return data.map((item) => {
    item.blob = async () => {
      const query = new URL(
        `${window.__api}/loadFont?file=${encodeURIComponent(item.file)}`
      );
      const response = await fetch(query);
      return new Blob([await response.arrayBuffer()], {
        type: response.headers.get("Content-Type"),
      });
    };
    return item;
  });
};

// fake navigator.clipboard.read via nw.Clipboard

const clipboardTypes = {
  png: 0,
  jpeg: 1,
  text: 2,
  html: 3,
};

navigator.clipboard.read = async () => {
  /** @type {NWJS_Helpers.clip} */
  const clip = window.__nwc;
  const types = clip.readAvailableTypes();
  return types
    .sort((a, b) => clipboardTypes[a] - clipboardTypes[b])
    .map((type) => {
      if (type === "png")
        return new ClipboardItem({ "image/png": __utb(clip.get("png")) });
      else if (type === "jpeg")
        return new ClipboardItem({ "image/jpeg": __utb(clip.get("jpeg")) });
      else if (type === "text")
        return new ClipboardItem({ "text/plain": clip.get("text") });
      else if (type === "html")
        return new ClipboardItem({ "text/html": clip.get("html") });
    })
    .filter((item) => item);
};

const Navigator_Permissions_Query = navigator.permissions.query;
navigator.permissions.query = async function (args) {
  if (args.name === "clipboard-read") {
    args.state = "granted";
    return args;
  }
  Navigator_Permissions_Query.apply(this, arguments);
};

if (!window.localStorage.getItem(__r("X3BwcA"))) {
  window.localStorage.setItem(
    __r("X3BwcA"),
    __r(
      "eyJjYXBTaG93biI6ImZhbHNlIiwiX2x0b29scyI6IjAiLCIwX3VpZCI6IjEiLCIwX3Rva2VuIjoiMTc0NTA1NTAwMC1mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZiIsIjBfcHJvdmlkZXIiOiIyIiwiMF9zdGF0ZUxvY2FsIjoie1wiZ2xvYmFsc1wiOnt9LFwiYWNjXCI6e1wiYWl1MVwiOntcIm02NjJcIjo5MDA3MTk5MjU0NzQwOTkxLFwibTY2MVwiOjkwMDcxOTkyNTQ3NDA5OTEsXCJtNjYzXCI6OTAwNzE5OTI1NDc0MDk5MX19fSJ9"
    )
  );
}

const XMLHttpRequest_Open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (_, url) {
  if (
    url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL2NvZGUvc3RvcmFnZXM"))
  )
    url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);

  if (url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL3BhcGk"))) {
    url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
  }
  return XMLHttpRequest_Open.apply(this, arguments);
};

const Window_Open = window.open;
window.open = function (url, ...args) {
  if (url.startsWith(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29tL3BhcGk"))) {
    url = url.replace(__r("aHR0cHM6Ly93d3cucGhvdG9wZWEuY29t"), window.__api);
    const win = Window_Open.apply(this, [url, ...args]);
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: __s({
            cHJtcw:
              "cGFwaV9sb2dnZWRfaW4sMSwxNzQ1MDU1MDAwLWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmLDI",
          }),
        })
      );
    }, 1000);
    return win;
  }
  return Window_Open.apply(this, arguments);
};

const HTMLIFrameElement_SetAttribute = HTMLIFrameElement.prototype.setAttribute;
HTMLIFrameElement.prototype.setAttribute = function (name, value) {
  if (
    name === "src" &&
    value.endsWith(__r("Y29kZS9zdG9yYWdlcy9wZWFkcml2ZVN0b3JhZ2UuaHRtbA"))
  ) {
    value = `${window.__api}/${value}`;
    HTMLIFrameElement_SetAttribute.apply(this, [name, value]);
  }
  return HTMLIFrameElement_SetAttribute.apply(this, arguments);
};
