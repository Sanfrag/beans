// nullify some node
require = undefined;
process = undefined;

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

const __sio = String.prototype.indexOf;
String.prototype.indexOf = function (target) {
  if (this.length === 0 && target === ".") {
    window.self = __ws;
    return 1;
  }
  return __sio.apply(this, arguments);
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
  if (name === "src") {
    if (value.endsWith(__r("Y29kZS9zdG9yYWdlcy9wZWFkcml2ZVN0b3JhZ2UuaHRtbA"))) {
      value = `${window.__api}/${value}`;
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

const __st = () => {
  const head = document.head;
  if (head) {
    const style = document.createElement("style");
    style.textContent = __r(
      "LmNvbnRleHRwYW5lbC5jcF9saWdodCB7CiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFzZSk7CiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpOwp9Ci5jb250ZXh0cGFuZWwgaHIgewogIG9wYWNpdHk6IDAuNDsKICBiYWNrZ3JvdW5kOiB2YXIoLS10ZXh0LWNvbG9yKTsKfQouY29udGV4dHBhbmVsLmNwX2xpZ2h0IC5lbmFiOmhvdmVyIHsKICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIHZhcigtLWFscGhhRGFyaykpOwp9Ci5zdG9yYWdlIHsKICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iZy1wYW5lbCk7CiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpOwp9Ci5zdG9yYWdlIC5idG4gewogIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhc2UpOwp9Ci5zdG9yYWdlIC5idG4gc3ZnIHsKICBmaWxsOiB2YXIoLS10ZXh0LWNvbG9yKTsKfQouc3RvcmFnZSAuYWN0aXZlIHsKICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIHZhcigtLWFscGhhRGFyaykpOwp9Ci5zdG9yYWdlPmRpdj5kaXY6bGFzdC1jaGlsZCB7CiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFzZSkgIWltcG9ydGFudDsKfQouc3RvcmFnZSAuYmFyOmVtcHR5IHsKICBkaXNwbGF5OiBub25lOwp9"
    );
    head.append(style);
  } else {
    setTimeout(__st, 500);
  }
};
__st();
