# The OOP Illusion: Why TypeScript Purists Need to Understand JavaScript Prototypes

If you come from a classical Object-Oriented Programming (OOP) background like Java or C#, opening a modern TypeScript file feels like coming home. You see the `class` keyword. You see `private` modifiers, `extends`, and `implements`. You build beautifully structured, strictly typed architectures.

You feel safe.

But there is a matrix-level truth hiding just beneath the surface of your code: **TypeScript is just JavaScript.** And JavaScript does not have traditional classes.

Under the hood, your beautiful classical architecture is running on a highly dynamic, prototype-based engine. Here is why that matters, why ignoring it will eventually bite you in production, and why this design choice is the reason the entire web is so hackable.

---

## The Syntactic Sugar Coating

In 2015, JavaScript introduced the `class` keyword. It was a massive win for developer ergonomics, but it was purely **syntactic sugar**.

When you write a `class` in JavaScript (or TypeScript), the engine isn't creating a strict blueprint. It is creating a traditional JavaScript constructor function and attaching methods to that function's underlying prototype object.

Objects in JS don't inherit from classes; **objects inherit from other objects**. If an object doesn't have a property you are looking for, it simply climbs up the invisible "prototype chain" until it finds an object that does.

### Proof: A Class Is Just a Function

Run this yourself (`node demo.js` in this repo):

```javascript
class UserClass {
  constructor(name) {
    this.name = name;
  }
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

// Under the hood, the engine created something equivalent to:
function UserFunction(name) {
  this.name = name;
}
UserFunction.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};
```

Now inspect them:

```javascript
typeof UserClass === "function"  // true — a "class" is literally a function

const user1 = new UserClass("Alice");
user1.hasOwnProperty("sayHello")  // false — the method is NOT on the instance

const proto = Object.getPrototypeOf(user1);
proto.hasOwnProperty("sayHello")  // true — it lives on the prototype object
proto === UserClass.prototype     // true — same prototype mechanism as functions
```

There is no class. There is no blueprint. There is a function, a prototype object, and a chain of delegation.

---

## The TypeScript Purist Dilemma

TypeScript is an incredible tool, but it only exists at *compile time*. It is like a strict bouncer standing outside a nightclub. It checks IDs, enforces the dress code, and keeps the riff-raff out. But once your code gets inside the club (runtime), the bouncer disappears, and the wild rules of the JavaScript prototype engine take over.

Here is where classical OOP purists get tripped up.

### Pitfall 1: The Illusion of Runtime Safety

TypeScript cannot protect your objects at runtime. Because JavaScript is dynamic, any piece of code can inject, delete, or alter properties on an object or its prototype while the app is running. Your strictly typed `readonly` properties? At runtime, they are just standard, mutable JavaScript properties.

```typescript
class Config {
  readonly apiUrl: string = "https://api.example.com";
}

const config = new Config();

// TypeScript screams at you here. But at runtime...
(config as any).apiUrl = "https://evil.com";  // Works perfectly fine.
```

TypeScript prevented nothing. The JS engine doesn't know what `readonly` means. It was erased during compilation.

### Pitfall 2: Structural Typing (Duck Typing)

In a nominal language like Java, a `Car` and a `Dog` are fundamentally different, even if they both have a `run()` method. You cannot pass a `Dog` to a function expecting a `Car`.

Because JavaScript is just a collection of dynamic objects, TypeScript uses **Structural Typing**. If it walks like a duck and quacks like a duck, TypeScript lets it in.

```typescript
class Car {
  run() { console.log("Vroom!"); }
}

function startEngine(vehicle: Car) {
  vehicle.run();
}

// A plain object literal, not an instance of Car at all.
const notACar = { run: () => console.log("Wait, I'm just an object!") };

startEngine(notACar);  // TypeScript says: "Looks good to me!"
```

There is no identity check. No `instanceof` gate. If the shape matches, it passes. This is not a bug — it is a direct consequence of JavaScript's prototype-based, object-centric design. TypeScript's type system is *modeling* how JS actually works, not imposing classical OOP rules on top of it.

---

## Why This Makes the Web Hackable

This is where things get really interesting. The same properties that surprise classical OOP developers are the architectural foundation for why browser extensions, userscripts, and developer tools can modify literally anything on a webpage.

### Everything Is a Mutable Object

Every browser API you interact with — `window`, `document`, `fetch`, `console`, `XMLHttpRequest` — is a property on a mutable object, with methods living on mutable prototypes. There are no sealed classes. No final methods. No runtime access modifiers.

That means any script running in the same context can reach in and change things:

```javascript
// An extension intercepts every fetch request on any webpage
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log("Intercepted:", args[0]);
  return originalFetch.apply(this, args);
};
```

This is called **monkey-patching**, and it works because `window.fetch` is just a property on a mutable object. There is no `final` keyword, no sealed class, no runtime access control stopping you.

### The Prototype Chain Is Writable

It gets deeper. Because methods live on prototypes (not on instances, as our demo proves), modifying a prototype affects *every* instance — past, present, and future.

```javascript
// Override setAttribute on EVERY HTML element in the page
const original = HTMLElement.prototype.setAttribute;
HTMLElement.prototype.setAttribute = function(name, value) {
  if (name === "hidden") {
    console.log("Something is trying to hide:", this.tagName);
  }
  return original.call(this, name, value);
};
```

One line of prototype mutation, and you've intercepted a fundamental DOM operation across the entire page. Ad blockers, accessibility tools, and content modifiers all use this technique.

### Shape Over Identity Means Easy Substitution

Because JavaScript (and TypeScript) care about *shape*, not *identity*, you can substitute any object that has the right methods. The original code never notices.

```javascript
// Replace the browser's geolocation API with a fake one
navigator.geolocation.getCurrentPosition = function(success) {
  success({
    coords: { latitude: 0, longitude: 0, accuracy: 1 }
  });
};
```

No class hierarchy to satisfy. No interface contract enforced at runtime. If the shape matches, the substitution works.

### Real-World Consequences

| Capability | Exploited Property |
|---|---|
| Ad blockers intercepting network requests | Monkey-patching `fetch` and `XMLHttpRequest.prototype` |
| Userscripts modifying page behavior | No runtime encapsulation, writable prototype chain |
| DevTools live-editing anything | The entire runtime is a mutable object graph |
| Browser extensions injecting UI | DOM nodes are just objects with writable prototypes |
| Polyfills adding missing features | Prototype augmentation (e.g. `Array.prototype.at = ...`) |
| Malicious extensions stealing data | The same properties, used adversarially |

The browser's security model — same-origin policy, Content Security Policy, extension permissions — exists largely *because* the language itself provides almost no encapsulation at runtime. The guardrails are in the platform, not the language.

---

## The Takeaway

JavaScript's prototype model is not a flaw. It is a deliberate design decision that prioritizes flexibility and composition over rigid hierarchies. It is why a 10-line browser extension can reshape an entire web application. It is why the web is the most extensible application platform ever built.

But if you treat JavaScript like Java — if you assume `class` means "sealed blueprint" and `private` means "truly inaccessible" — you are building on assumptions the runtime does not share.

**Know your runtime.** The bouncer goes home at compile time. What happens after that is between you and the prototype chain.
