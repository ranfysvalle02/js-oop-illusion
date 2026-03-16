# prototype-based-programming

# The OOP Illusion: Why TypeScript Purists Need to Understand JavaScript Prototypes

If you come from a classical Object-Oriented Programming (OOP) background like Java or C#, opening a modern TypeScript file feels like coming home. You see the `class` keyword. You see `private` modifiers, `extends`, and `implements`. You build beautifully structured, strictly typed architectures. 

You feel safe. 

But there is a matrix-level truth hiding just beneath the surface of your code: **TypeScript is just JavaScript.** And JavaScript does not have traditional classes. 

Under the hood, your beautiful classical architecture is running on a highly dynamic, prototype-based engine. Here is why that matters, and why ignoring it will eventually bite you in production.

---

## The Syntactic Sugar Coating

In 2015, JavaScript introduced the `class` keyword. It was a massive win for developer ergonomics, but it was purely **syntactic sugar**. 

When you write a `class` in JavaScript (or TypeScript), the engine isn't creating a strict blueprint. It is creating a traditional JavaScript constructor function and attaching methods to that function's underlying prototype object. 

Objects in JS don't inherit from classes; **objects inherit from other objects**. If an object doesn't have a property you are looking for, it simply climbs up the invisible "prototype chain" until it finds an object that does.

## The TypeScript Purist Dilemma

TypeScript is an incredible tool, but it only exists at *compile time*. It is like a strict bouncer standing outside a nightclub. It checks IDs, enforces the dress code, and keeps the riff-raff out. But once your code gets inside the club (runtime), the bouncer disappears, and the wild rules of the JavaScript prototype engine take over.

Here is where classical OOP purists get tripped up:

### 1. The Illusion of Runtime Safety
TypeScript cannot protect your objects at runtime. Because JavaScript is dynamic, any piece of code can inject, delete, or alter properties on an object or its prototype while the app is running. Your strictly typed `readonly` properties? At runtime, they are just standard, mutable JavaScript properties.

### 2. Structural Typing (Duck Typing)
In a nominal language like Java, a `Car` and a `Dog` are fundamentally different, even if they both have a `run()` method. You cannot pass a `Dog` to a function expecting a `Car`. 

Because JavaScript is just a collection of dynamic objects, TypeScript uses **Structural Typing**. If it walks like a duck and quacks like a duck, TypeScript lets it in.

```typescript
class Car {
  run() { console.log("Vroom!"); }
}

function startEngine(vehicle: Car) {
  vehicle.run();
}

// A TS Purist's nightmare: 
// Passing a plain object literal into a class-typed function!
const notACar = { run: () => console.log("Wait, I'm just an object!") };

startEngine(notACar); // TypeScript says: "Looks good to me!" ✅
