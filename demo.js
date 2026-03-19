// ==========================================
// PART 1: The Modern ES6 "Class" Way
// ==========================================
console.log("=== Part 1: ES6 Class ===\n");

class UserClass {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

const user1 = new UserClass("Alice");
user1.sayHello();


// ==========================================
// PART 2: The Under-the-Hood Prototype Way
// ==========================================
console.log("\n=== Part 2: Prototype Equivalency ===\n");

function UserFunction(name) {
  this.name = name;
}

UserFunction.prototype.sayHello = function () {
  console.log(`Hello, my name is ${this.name}`);
};

const user2 = new UserFunction("Bob");
user2.sayHello();


// ==========================================
// PART 3: The Proof — Classes Are Functions
// ==========================================
console.log("\n=== Part 3: The Proof ===\n");

console.log("typeof UserClass:", typeof UserClass);
console.log("user1 owns 'name':", user1.hasOwnProperty("name"));
console.log("user1 owns 'sayHello':", user1.hasOwnProperty("sayHello"));

const user1Proto = Object.getPrototypeOf(user1);
console.log("sayHello on prototype:", user1Proto.hasOwnProperty("sayHello"));
console.log("proto === UserClass.prototype:", user1Proto === UserClass.prototype);

console.log("\nVerdict: A class is a function. Methods live on the prototype, not the instance.");


// ==========================================
// PART 4: Prototype Mutation — One Change Hits Everything
// ==========================================
console.log("\n=== Part 4: Prototype Mutation ===\n");

class Greeter {
  greet() {
    return "Hello!";
  }
}

const a = new Greeter();
const b = new Greeter();
console.log("Before mutation:");
console.log("  a.greet():", a.greet());
console.log("  b.greet():", b.greet());

// Mutate the prototype — affects ALL instances, even ones that already exist
Greeter.prototype.greet = function () {
  return "INTERCEPTED";
};

console.log("After mutating Greeter.prototype.greet:");
console.log("  a.greet():", a.greet());
console.log("  b.greet():", b.greet());

const c = new Greeter();
console.log("  new Greeter().greet():", c.greet());

console.log("\nVerdict: Prototype mutation is retroactive. Every instance delegates to the same object.");


// ==========================================
// PART 5: Property Interception — The Keylogger Trick
// ==========================================
console.log("\n=== Part 5: Property Interception ===\n");

// Simulate what a keylogger does to HTMLInputElement.prototype.value
// by intercepting a property setter on a class prototype.

class InputField {
  constructor() {
    this._value = "";
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = v;
  }
}

const field = new InputField();

// Intercept the setter — exactly how an extension hijacks input fields
const original = Object.getOwnPropertyDescriptor(InputField.prototype, "value");
const captured = [];

Object.defineProperty(InputField.prototype, "value", {
  set(v) {
    captured.push(v);
    original.set.call(this, v);
  },
  get() {
    return original.get.call(this);
  },
});

field.value = "hunter2";
field.value = "my-secret-password";

console.log("Field value (looks normal):", field.value);
console.log("Silently captured:", captured);

console.log("\nVerdict: Object.defineProperty on a prototype intercepts every instance. No hack needed — just the language.");


// ==========================================
// PART 6: Shape Over Identity — No instanceof Required
// ==========================================
console.log("\n=== Part 6: Shape Over Identity ===\n");

class AuthService {
  authenticate(user, pass) {
    return user === "admin" && pass === "secret";
  }
}

function login(service, user, pass) {
  if (service.authenticate(user, pass)) {
    console.log(`  [${user}] Access granted`);
  } else {
    console.log(`  [${user}] Access denied`);
  }
}

const realService = new AuthService();
console.log("Real service:");
login(realService, "admin", "secret");

// A plain object with the same shape — no class, no inheritance, no instanceof
const fakeService = {
  authenticate(user, pass) {
    console.log(`  [INTERCEPTED] user="${user}" pass="${pass}"`);
    return true;
  },
};

console.log("Fake service (same shape, captures credentials):");
login(fakeService, "admin", "secret");
console.log("  instanceof AuthService:", fakeService instanceof AuthService);

console.log("\nVerdict: JS checks shape, not identity. A plain object substitutes for a class instance.");


// ==========================================
// PART 7: Putting It All Together
// ==========================================
console.log("\n=== Part 7: Summary ===\n");
console.log("1. Classes are functions. Methods live on prototypes.");
console.log("2. Prototypes are mutable. One change affects every instance.");
console.log("3. Property setters can be silently intercepted on any prototype.");
console.log("4. Objects are matched by shape, not class identity.");
console.log("5. TypeScript erases private/readonly/types before any of this runs.");
console.log("\nThis is why a few lines of JS can keylog an entire page.");
