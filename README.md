# The OOP Illusion

**Why JavaScript's `class` keyword is a lie, TypeScript can't save you at runtime, and this is exactly why the web is so hackable.**

---

## What This Project Is

This repository is a concise exploration of a truth most JavaScript and TypeScript developers eventually stumble into: **JS does not have real classes.** The `class` keyword is syntactic sugar over a prototype-based object system, and TypeScript's type safety disappears the moment your code runs.

Understanding this isn't academic — it's the key to understanding why browser extensions can rewrite any webpage, why monkey-patching is trivially easy, and why the entire web platform is the most extensible (and most exploitable) runtime ever built.

## What's Inside

| File | Description |
|---|---|
| [`blog.md`](blog.md) | Full blog post — the deep dive with code examples and real-world implications |
| [`demo.js`](demo.js) | Runnable proof that ES6 classes and prototype functions are identical under the hood |

## Run the Demo

```bash
node demo.js
```

You'll see proof that:
- A `class` is just a `function`
- Methods don't live on instances — they live on the prototype
- ES6 class instances use the exact same prototype mechanism as old-school constructor functions

## Key Takeaways

1. **Classes are syntactic sugar.** `class` compiles to a constructor function + prototype object. There are no blueprints.
2. **Objects inherit from objects.** The prototype chain is just a linked list of objects, not a class hierarchy.
3. **TypeScript is a compile-time bouncer.** `private`, `readonly`, and type checks vanish at runtime. The JS engine never sees them.
4. **Structural typing means shape over identity.** Any object with the right properties satisfies a type — no `instanceof` required.
5. **This is why the web is hackable.** Every browser API, DOM node, and page object is a mutable JS object. Extensions and scripts can intercept, wrap, or replace anything.

## Read the Full Post

Head to **[`blog.md`](blog.md)** for the complete write-up, including code examples, the TypeScript purist dilemma, and why this prototype-based design is the architectural reason the web is so extensible.

## License

[MIT](LICENSE)
