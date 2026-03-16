// ==========================================
// PART 1: The Modern ES6 "Class" Way
// ==========================================
console.log("--- 1. ES6 Class ---");

class UserClass {
  constructor(name) {
    this.name = name; // Instance property
  }

  // This looks like a method inside a class...
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}

const user1 = new UserClass("Alice");
user1.sayHello();


// ==========================================
// PART 2: The Under-the-Hood Prototype Way
// ==========================================
console.log("\n--- 2. Prototype Equivalency ---");

// 1. The "class" is actually just a constructor function
function UserFunction(name) {
  this.name = name; // Instance property
}

// 2. The methods are manually attached to the function's prototype
UserFunction.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};

const user2 = new UserFunction("Bob");
user2.sayHello();


// ==========================================
// PART 3: The Proof
// ==========================================
console.log("\n--- 3. The Proof ---");

// Proof A: A class is literally just a function in JavaScript.
console.log("Is UserClass a function?", typeof UserClass === "function"); // true

// Proof B: Both instances get their properties from the constructor...
console.log("Does user1 own 'name'?", user1.hasOwnProperty("name")); // true
console.log("Does user2 own 'name'?", user2.hasOwnProperty("name")); // true

// Proof C: ...but NEITHER instance actually owns the sayHello method!
console.log("Does user1 own 'sayHello'?", user1.hasOwnProperty("sayHello")); // false
console.log("Does user2 own 'sayHello'?", user2.hasOwnProperty("sayHello")); // false

// Proof D: Instead, both delegate to their prototypes to find the method.
// We use Object.getPrototypeOf() to look up the prototype chain.
const user1Proto = Object.getPrototypeOf(user1);
const user2Proto = Object.getPrototypeOf(user2);

console.log("Is sayHello on user1's prototype?", user1Proto.hasOwnProperty("sayHello")); // true
console.log("Is sayHello on user2's prototype?", user2Proto.hasOwnProperty("sayHello")); // true

// Proof E: The ES6 class prototype is exactly the same concept as the function prototype.
console.log("Does user1 point to UserClass.prototype?", user1Proto === UserClass.prototype); // true
