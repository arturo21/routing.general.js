class Route {
  constructor(path) {
    this.path = path;
    this.action = null;
    this.doEnter = [];
    this.doExit = null;
    this.params = {};
    Routing.routes.defined[path] = this;
  }

  to(fn) {
    this.action = fn;
    return this;
  }

  enter(fns) {
    if (Array.isArray(fns)) {
      this.doEnter.push(...fns);
    } else {
      this.doEnter.push(fns);
    }
    return this;
  }

  exit(fn) {
    this.doExit = fn;
    return this;
  }

  partition() {
    const parts = [];
    const options = [];
    const re = /\(([^}]+?)\)/g;
    let text;
    while ((text = re.exec(this.path))) {
      parts.push(text[1]);
    }
    options.push(this.path.split("(")[0]);
    for (const part of parts) {
      options.push(options[options.length - 1] + part);
    }
    return options;
  }

  run() {
    let halt = false;
    for (const fn of this.doEnter) {
      const result = fn.call(this);
      if (result === false) {
        halt = true;
        break;
      }
    }
    if (!halt && typeof this.action === "function") {
      this.action(this.params);
    }
  }
}

class Routing {
  static version = "2.1.0";
  static routes = {
    current: null,
    previous: null,
    root: null,
    rescue: null,
    defined: {}
  };
  static plugins = {};
  static events = {};
  static silent = false;
  static historyLog = [];

  static history = {
    initial: {},
    supported: !!(window.history && window.history.pushState),
    fallback: false,

    pushState(state, title, path) {
      if (this.supported) {
        if (Routing.dispatch(path)) {
          history.pushState(state, title, path);
        }
      } else if (this.fallback) {
        window.location.hash = "#" + path;
      }
    },

    popState(event) {
      const initialPop = !this.initial.popped && location.href === this.initial.URL;
      this.initial.popped = true;
      if (initialPop) return;
      Routing.dispatch(document.location.pathname);
    },

    listen(fallback = false) {
      this.fallback = fallback;
      this.initial.popped = "state" in window.history;
      this.initial.URL = location.href;

      if (this.supported) {
        window.onpopstate = this.popState.bind(this);
      } else if (this.fallback) {
        for (const [route, obj] of Object.entries(Routing.routes.defined)) {
          if (!route.startsWith("#")) {
            Routing.routes.defined["#" + route] = { ...obj, path: "#" + route };
          }
        }
        Routing.listen();
      }
    }
  };

  static getVersion() {
    return this.version;
  }

  static map(path) {
    return this.routes.defined[path] || new Route(path);
  }

  static root(path) {
    this.routes.root = path;
  }

  static rescue(fn) {
    this.routes.rescue = fn;
  }

  static usePlugin(name, fn) {
    this.plugins[name] = fn;
  }

  static emit(event, data) {
    (this.events[event] || []).forEach(fn => fn(data));
  }

  static on(event, fn) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(fn);
  }

  static go(path) {
    this.history.pushState({}, "", path);
  }

  static back() {
    window.history.back();
  }

  static match(path, parameterize = false) {
    const url = new URL(path, window.location.origin);
    const pathname = url.pathname;
    const searchParams = Object.fromEntries(url.searchParams.entries());

    try {
      for (const routeKey in this.routes.defined) {
        const route = this.routes.defined[routeKey];
        const options = route.partition();
        for (const slice of options) {
          let compare = pathname;
          const params = { ...searchParams };

          if (slice.includes(":")) {
            const sliceParts = slice.split("/");
            const compareParts = compare.split("/");

            for (let i = 0; i < sliceParts.length; i++) {
              if (sliceParts[i].startsWith(":") && compareParts[i]) {
                const key = sliceParts[i].replace(":", "");
                params[key] = compareParts[i];
                compare = compare.replace(compareParts[i], sliceParts[i]);
              }
            }
          }

          if (slice === compare) {
            if (parameterize) route.params = params;
            return route;
          }
        }
      }
    } catch (e) {
      const name = e?.constructor?.name;
      if (name !== "TypeError") {
        console.error(e);
      } else {
        console.warn("EXCEPCIÓN: Esta no es una ruta definida");
      }
    }
    return null;
  }

  static dispatch(path) {
    if (this.silent) return false;
    if (this.routes.current === path) return;

    this.routes.previous = this.routes.current;
    this.routes.current = path;

    const matched = this.match(path, true);
    const previous = this.match(this.routes.previous);

    this.emit("route:change", { from: this.routes.previous, to: path });
    this.historyLog.push({ from: this.routes.previous, to: path, time: Date.now() });

    if (previous?.doExit) {
      this.emit("route:exit", previous);
      previous.doExit();
    }

    if (matched) {
      this.emit("route:enter", matched);
      for (const plugin of Object.values(this.plugins)) {
        const result = plugin(matched);
        if (result === false) return false;
      }
      matched.run();
      return true;
    } else if (this.routes.rescue) {
      this.routes.rescue();
    }
  }

  static listen() {
    const fn = () => this.dispatch(location.hash || location.pathname);

    if (!location.hash && this.routes.root) {
      location.hash = this.routes.root;
    }

    if ("onhashchange" in window && (!document.documentMode || document.documentMode >= 8)) {
      window.onhashchange = fn;
    } else {
      setInterval(fn, 50);
    }

    if (location.hash || location.pathname) {
      this.dispatch(location.hash || location.pathname);
    }
  }

  static testMode(enable = true) {
    this.silent = enable;
  }

  static debug() {
    console.table({
      version: this.version,
      current: this.routes.current,
      previous: this.routes.previous,
      definedRoutes: Object.keys(this.routes.defined),
      plugins: Object.keys(this.plugins),
      historyLog: this.historyLog
    });
  }
}

window.routing = Routing;
