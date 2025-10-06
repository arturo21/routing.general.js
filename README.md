<p align="center">
  <h1 align="center">🧭 routing.general.js</h1>
  <p align="center">Sistema de enrutamiento SPA modular, extensible y trazable para aplicaciones web modernas</p>
</p>

---

## ✨ Características destacadas

| 🔧 Funcionalidad               | ✅ Descripción |
|-------------------------------|----------------|
| 🔁 Navegación SPA              | Controla rutas sin recargar la página |
| 🧠 Enrutamiento con parámetros | Extrae valores dinámicos como `/user/:id` |
| 🔐 Protección de rutas         | Usa plugins para validar acceso o estado |
| 🧪 Ciclo de vida por ruta      | Ejecuta `enter`, `exit`, `to` en cada transición |
| ⚡️ Montaje de componentes      | Integra con `reactv` o cualquier sistema de UI |
| 📡 Enrutamiento hash o pushState | Compatible con `#ruta` y `history.pushState` |
| 🧬 Plugins personalizados      | Intercepta rutas con lógica externa (auth, preload, etc.) |
| 🧠 Trazabilidad y eventos      | Escucha `route:enter`, `route:exit`, `route:change` |
| 🧪 Modo de prueba              | Simula navegación sin afectar el DOM |
| 🔍 Soporte para query strings  | Extrae parámetros como `?id=123&sort=asc` |

---

## 🧩 Funciones disponibles

```js
routing.map(path)           // Define una nueva ruta
routing.root(path)          // Establece ruta raíz
routing.rescue(fn)          // Ruta de rescate para 404
routing.go(path)            // Navegación programática
routing.back()              // Regresa a la ruta anterior
routing.listen()            // Inicia el sistema de enrutamiento
routing.dispatch(path)      // Fuerza navegación a una ruta
routing.testMode(true)      // Activa modo de prueba
routing.usePlugin(name, fn) // Registra plugin global
routing.on(event, fn)       // Escucha eventos personalizados
routing.emit(event, data)   // Emite eventos personalizados
routing.debug()             // Muestra estado actual en consola
```

## 🚀 Cómo empezar

### 1. Instala o incluye la librería

Puedes incluirla directamente en tu HTML:

```html
<script src="routing.general.js"></script>

```

O importarla como módulo ES en tu proyecto:
```js
import { Routing } from './routing.general.js';
```

# 📦 Changelog — routing.general.js

Historial de versiones y mejoras aplicadas.

---

## [2.1.0] — 2025-10-06

### ✨ Nuevas características

- Reescrita completamente en ES6 con `class`, `static`, `let/const`, `arrow functions`
- Soporte para navegación programática: `go(path)`, `back()`
- Soporte para parámetros dinámicos y `queryString`
- Sistema de eventos personalizados: `route:enter`, `route:exit`, `route:change`
- Modo de prueba (`testMode`) para simular navegación sin afectar el DOM
- Registro de historial interno con timestamps (`historyLog`)
- Método `debug()` para inspección visual del estado actual
- Plugin system para interceptores, guards, loaders
- Rescate automático con `rescue(fn)` para rutas no definidas
- Preparada para integración con `reactv` y componentes visuales

### 🧠 Mejoras internas

- Refactorización completa del sistema de rutas (`Route`) y partición de rutas dinámicas
- Mejora en la trazabilidad de parámetros y eventos
- Compatibilidad con `pushState` y `hashchange`
- Separación clara entre lógica de enrutamiento y ejecución de componentes
- Preparación para export como módulo ES (`export class Routing`)

---

## [2.0.0] — 2025-10-04

### ✨ Nuevas características

- Integración inicial de Virtual DOM en `reactv`
- Compatibilidad con JSX y renderizado declarativo
- Montaje de componentes por ruta
- Eventos de ciclo de vida por ruta (`enter`, `exit`, `to`)
- Sistema de rescate para rutas no definidas

---

## [1.0.0] — 2025-10-01

### 🛠️ Versión inicial

- Sistema de enrutamiento SPA con rutas definidas
- Soporte para `enter`, `exit`, `to` por ruta
- Enrutamiento por hash (`#`) y `pushState`
- Ciclo de vida básico por ruta
- Mapeo de rutas y parámetros dinámicos

## 🧪 Ejemplos de uso

### 1. Definir rutas

```js
routing.map("/home").to(() => {
  console.log("Bienvenido a Home");
});

routing.map("/user/:id").enter(() => {
  console.log("Entrando a perfil");
}).to(params => {
  console.log("ID de usuario:", params.id);
});

routing.map("/logout").exit(() => {
  console.log("Saliendo de sesión");
}).to(() => {
  console.log("Sesión cerrada");
});
```

### 2. Protección de rutas
```js
routing.usePlugin("authGuard", route => {
  if (route.path === "/admin" && !user.isLoggedIn()) {
    alert("Acceso denegado");
    routing.go("/login");
    return false;
  }
});
```

### 3. Navegación programática
```js
routing.go("/home");     // Navega a /home
routing.back();          // Regresa a la ruta anterior
```

### 4. Escuchar eventos
```js
routing.on("route:enter", route => {
  console.log("Entrando a:", route.path);
});

routing.on("route:exit", route => {
  console.log("Saliendo de:", route.path);
});

routing.on("route:change", ({ from, to }) => {
  console.log(`Cambio de ${from} a ${to}`);
});
```

### 5. Modo de prueba
```js
routing.testMode(true);         // Activa modo silencioso
routing.dispatch("/fake");      // Simula navegación sin modificar el DOM
routing.testMode(false);        // Reactiva navegación real
```