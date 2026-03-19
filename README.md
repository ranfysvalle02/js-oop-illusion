# The OOP Illusion

**A few lines of JavaScript can keylog every page you visit. TypeScript's `private` and `readonly` won't stop it. This project explains why.**

---

## What This Is

A story about how 4 lines of JavaScript become a browser extension keylogger — and why the answer traces back to JavaScript's prototype-based runtime, where there are no real classes, no runtime encapsulation, and every object is mutable.

TypeScript adds safety at compile time. But `private`, `readonly`, and type annotations are erased before a single line executes in the browser. What remains is a prototype chain, and prototype chains are writable.

---

## Read the Post

**[`blog.md`](blog.md)** — the full story, from keylogger to prototype chain, with code at every step.

---

## Run the Demo

```bash
node demo.js
```

Proves that ES6 classes and old-school constructor functions are identical under the hood:
- `typeof UserClass === "function"` — a class is literally a function
- `user.hasOwnProperty("sayHello")` returns `false` — methods don't live on instances
- `Object.getPrototypeOf(user) === UserClass.prototype` — they live on the shared prototype

---

## Key Takeaways

1. **A keylogger is 4 lines of JS.** `addEventListener`, `sendBeacon`, done. No hack required — just the language working as designed.
2. **TypeScript compiles away.** `private`, `readonly`, and types are erased. The browser never sees them.
3. **Classes aren't real.** `class` is syntactic sugar over constructor functions and prototype objects.
4. **Prototypes are mutable.** Modifying `HTMLInputElement.prototype` affects every input on the page.
5. **The browser's security model exists because the language has none.** Same-origin policy, CSP, and extension permissions are platform guardrails compensating for JavaScript's openness.

---

## What's Inside

| File | Description |
|---|---|
| [`blog.md`](blog.md) | Full post — keylogger walkthrough, TypeScript erasure, prototype mutability |
| [`demo.js`](demo.js) | Runnable proof that classes are functions and methods live on prototypes |

## License

[MIT](LICENSE)
