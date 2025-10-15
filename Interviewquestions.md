# Technical Interview Questions

## Table of Contents

- [React Questions](#react-questions)
- [Python Questions](#python-questions)
- [Java Questions](#java-questions)
- [C# Questions](#c-questions)
- [Swift Questions](#swift-questions)
- [Rust Questions](#rust-questions)
- [Go Questions](#go-questions)
- [Kotlin Questions](#kotlin-questions)
- [TypeScript Questions](#typescript-questions)
- [Node.js Questions](#nodejs-questions)
- [Next.js Questions](#nextjs-questions)
- [NestJS Questions](#nestjs-questions)

---

## React Questions

### Core React

1. **Why should we not update the state directly?**
   - Direct state mutation doesn't trigger re-render. Always use setState() or state setters to ensure React detects changes and updates UI.

2. **What is the purpose of callback function as an argument of setState()?**
   - Callback executes after state is updated and component re-renders. Useful for performing actions that depend on new state.

3. **How to bind methods or event handlers in JSX callbacks?**
   - Use arrow functions in class property, bind in constructor, or use arrow functions inline (creates new function each render).

4. **How to pass a parameter to an event handler or callback?**
   - Use arrow function: `onClick={() => this.handleClick(id)}` or bind with parameter: `onClick={this.handleClick.bind(this, id)}`.

5. **What is the use of refs?**
   - Refs provide direct access to DOM elements or React components, useful for managing focus, text selection, or triggering animations.

6. **How to create refs?**
   - Use `React.createRef()` in class components or `useRef()` hook in functional components.

7. **What are forward refs?**
   - Technique to automatically pass ref through a component to one of its children, useful for reusable component libraries.

8. **Which is preferred option with in callback refs and findDOMNode()?**
   - Callback refs are preferred. findDOMNode() is deprecated as it breaks abstraction and doesn't work with functional components.

9. **Why are String Refs legacy?**
   - String refs have issues with composition, don't work well with static analysis, and force React to track currently executing component.

10. **What are the different phases of component lifecycle?**
    - Mounting, Updating, Unmounting, and Error Handling phases.

11. **What are the lifecycle methods of React?**
    - Mounting: constructor, getDerivedStateFromProps, render, componentDidMount
    - Updating: getDerivedStateFromProps, shouldComponentUpdate, render, getSnapshotBeforeUpdate, componentDidUpdate
    - Unmounting: componentWillUnmount
    - Error: componentDidCatch, getDerivedStateFromError

12. **What is context?**
    - Context provides a way to pass data through component tree without passing props manually at every level.

13. **What is the purpose of using super constructor with props argument?**
    - Allows access to this.props in constructor. Without it, this.props is undefined in constructor.

14. **How to set state with a dynamic key name?**
    - Use computed property names: `setState({ [dynamicKey]: value })`.

15. **What are error boundaries in React v16?**
    - Components that catch JavaScript errors in child component tree, log errors, and display fallback UI instead of crashing.

---

## Python Questions

1. **What is Python?**
   - High-level, interpreted, dynamically-typed programming language with emphasis on code readability and simplicity.

2. **What are the key features of Python?**
   - Easy to learn, interpreted, object-oriented, dynamically typed, extensive libraries, cross-platform, free and open source.

3. **What is PEP 8?**
   - Python Enhancement Proposal 8 - official style guide for Python code covering naming conventions, indentation, and formatting.

4. **What is the difference between list and tuple?**
   - Lists are mutable (can be modified), tuples are immutable. Lists use [], tuples use (). Tuples are faster and can be used as dictionary keys.

5. **What are Python decorators?**
   - Functions that modify the behavior of another function. They allow adding functionality to existing code without modifying it.

6. **What is the difference between deep copy and shallow copy?**
   - Shallow copy creates new object but references same nested objects. Deep copy creates new object and recursively copies all nested objects.

7. **What are *args and **kwargs?**
   - *args allows passing variable number of positional arguments. **kwargs allows passing variable number of keyword arguments.

8. **What is the difference between == and is?**
   - == checks value equality. is checks identity (whether objects are same in memory).

9. **What are list comprehensions?**
   - Concise way to create lists: `[x**2 for x in range(10)]`. Can include conditions and nested loops.

10. **What is the Global Interpreter Lock (GIL)?**
    - Mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously.

11. **What are generators in Python?**
    - Functions that use yield to return iterator. They generate values on-the-fly and don't store entire sequence in memory.

12. **What is the difference between @staticmethod and @classmethod?**
    - @staticmethod doesn't receive implicit first argument. @classmethod receives class as implicit first argument (cls).

13. **What are Python's built-in data types?**
    - Numeric: int, float, complex. Sequence: list, tuple, range. Text: str. Mapping: dict. Set: set, frozenset. Boolean: bool. Binary: bytes, bytearray.

14. **What is monkey patching?**
    - Dynamically modifying a class or module at runtime. Used for testing or extending third-party code.

15. **What are metaclasses?**
    - Classes that create classes. They define how classes behave and are created.

16. **What is the difference between .py and .pyc files?**
    - .py files contain source code. .pyc files are compiled bytecode, created automatically for faster loading.

17. **What are Python namespaces?**
    - Container holding mapping from names to objects. Types: local, enclosing, global, built-in (LEGB rule).

18. **What is the difference between remove(), del and pop()?**
    - remove() removes first matching value. del removes by index. pop() removes by index and returns value.

19. **What are lambda functions?**
    - Anonymous functions defined with lambda keyword: `lambda x: x**2`. Limited to single expression.

20. **What is the difference between range() and xrange()?**
    - In Python 2, range() returns list, xrange() returns iterator. In Python 3, range() acts like xrange() (returns range object).

21. **What are Python's memory management techniques?**
    - Reference counting, garbage collection for cyclic references, memory pools for small objects.

22. **What is __init__.py?**
    - File that makes directory a Python package. Can be empty or contain initialization code.

23. **What are context managers?**
    - Objects that define runtime context using with statement. Implement __enter__ and __exit__ methods.

24. **What is the difference between append() and extend()?**
    - append() adds single element to list. extend() adds multiple elements from iterable.

25. **What are Python's mutable and immutable types?**
    - Mutable: list, dict, set, bytearray. Immutable: int, float, str, tuple, frozenset, bytes.

26. **What is pickling and unpickling?**
    - Pickling: serializing Python objects to byte stream. Unpickling: deserializing byte stream to Python objects.

27. **What are Python's built-in exceptions?**
    - ValueError, TypeError, KeyError, IndexError, AttributeError, IOError, ZeroDivisionError, etc.

28. **What is the difference between threading and multiprocessing?**
    - Threading: multiple threads in same process, limited by GIL. Multiprocessing: separate processes, true parallelism, higher overhead.

29. **What are Python iterators?**
    - Objects implementing __iter__() and __next__() methods. Used to iterate over sequences.

30. **What is the difference between sort() and sorted()?**
    - sort() modifies list in-place, returns None. sorted() returns new sorted list, works on any iterable.

---

## Java Questions

1. **What is Java?**
   - Object-oriented, platform-independent programming language that runs on JVM (Java Virtual Machine).

2. **What is JVM, JRE, and JDK?**
   - JVM: executes Java bytecode. JRE: runtime environment including JVM and libraries. JDK: development kit including JRE and development tools.

3. **What is the difference between JDK, JRE, and JVM?**
   - JDK = JRE + Development Tools. JRE = JVM + Libraries. JVM executes bytecode.

4. **What are access modifiers in Java?**
   - public: accessible everywhere. protected: same package and subclasses. default: same package only. private: same class only.

5. **What is the difference between == and equals()?**
   - == compares references (memory addresses). equals() compares object content/values.

6. **What is method overloading vs method overriding?**
   - Overloading: same name, different parameters, compile-time. Overriding: same signature in subclass, runtime polymorphism.

7. **What is the difference between abstract class and interface?**
   - Abstract class: partial implementation, single inheritance, any access modifiers. Interface: contract only, multiple inheritance, public by default.

8. **What is final keyword in Java?**
   - final variable: constant. final method: cannot override. final class: cannot inherit.

9. **What is static keyword in Java?**
   - Belongs to class rather than instance. Can be applied to variables, methods, blocks, and nested classes.

10. **What is the difference between String, StringBuilder, and StringBuffer?**
    - String: immutable. StringBuilder: mutable, not thread-safe, faster. StringBuffer: mutable, thread-safe, synchronized.

11. **What is exception handling in Java?**
    - Mechanism to handle runtime errors using try-catch-finally blocks. Maintains normal flow of application.

12. **What is the difference between checked and unchecked exceptions?**
    - Checked: compile-time checked, must handle (IOException). Unchecked: runtime, not required to handle (NullPointerException).

13. **What are Java Collections?**
    - Framework providing classes and interfaces for storing and manipulating groups of objects: List, Set, Map, Queue.

14. **What is the difference between ArrayList and LinkedList?**
    - ArrayList: dynamic array, fast random access, slow insertion/deletion. LinkedList: doubly-linked list, slow access, fast insertion/deletion.

15. **What is the difference between HashMap and Hashtable?**
    - HashMap: not synchronized, allows null key/values, faster. Hashtable: synchronized, no nulls, legacy class.

16. **What are generics in Java?**
    - Parameterized types providing compile-time type safety and eliminating need for type casting.

17. **What is the difference between Comparable and Comparator?**
    - Comparable: natural ordering, single method compareTo(), modify class. Comparator: custom ordering, compare() method, separate class.

18. **What is multithreading in Java?**
    - Concurrent execution of multiple threads. Achieved by extending Thread class or implementing Runnable interface.

19. **What is synchronization in Java?**
    - Controlling access of multiple threads to shared resource using synchronized keyword to prevent thread interference.

20. **What are lambda expressions in Java 8?**
    - Anonymous functions enabling functional programming: `(parameters) -> expression`. Used with functional interfaces.

21. **What is Stream API in Java 8?**
    - Functional approach to process collections using operations like filter, map, reduce without modifying source.

22. **What is the difference between fail-fast and fail-safe iterators?**
    - Fail-fast: throws ConcurrentModificationException if collection modified. Fail-safe: work on clone, no exception.

23. **What is autoboxing and unboxing?**
    - Autoboxing: automatic conversion from primitive to wrapper class. Unboxing: wrapper to primitive.

24. **What is the diamond problem in Java?**
    - Ambiguity arising from multiple inheritance. Java solves using interfaces and default methods with explicit override.

25. **What are annotations in Java?**
    - Metadata providing information about program. Examples: @Override, @Deprecated, @SuppressWarnings.

26. **What is reflection in Java?**
    - Ability to inspect and modify runtime behavior of applications, classes, methods, and fields.

27. **What is serialization in Java?**
    - Converting object state to byte stream for persistence or network transmission. Use Serializable interface.

28. **What is the difference between transient and volatile?**
    - transient: field not serialized. volatile: field visible to all threads, prevents caching.

29. **What is garbage collection in Java?**
    - Automatic memory management that identifies and removes unused objects to free memory.

30. **What are design patterns in Java?**
    - Reusable solutions to common problems: Singleton, Factory, Builder, Observer, Strategy, etc.

---

## C# Questions

1. **What is C#?**
   - Object-oriented, type-safe programming language for .NET framework, developed by Microsoft.

2. **What is .NET Framework?**
   - Software framework including CLR (Common Language Runtime) and FCL (Framework Class Library) for building applications.

3. **What is the difference between .NET Framework and .NET Core?**
   - .NET Framework: Windows only, legacy. .NET Core: cross-platform, modular, open-source, modern.

4. **What are value types and reference types?**
   - Value types: stored on stack, contain data (int, struct). Reference types: stored on heap, contain reference (class, string).

5. **What is boxing and unboxing?**
   - Boxing: converting value type to object. Unboxing: extracting value type from object. Both have performance cost.

6. **What is the difference between class and struct?**
   - Class: reference type, heap, supports inheritance. Struct: value type, stack, no inheritance, better for small data.

7. **What are access modifiers in C#?**
   - public, private, protected, internal, protected internal, private protected.

8. **What is method overloading vs method overriding?**
   - Overloading: same name, different parameters. Overriding: redefining base class method using virtual/override keywords.

9. **What is the difference between abstract class and interface?**
   - Abstract class: partial implementation, single inheritance, can have fields. Interface: contract only, multiple implementation, no fields (C# 8+ allows default implementation).

10. **What are sealed classes?**
    - Classes that cannot be inherited. Use sealed keyword to prevent inheritance.

11. **What is the difference between String and StringBuilder?**
    - String: immutable, creates new object on modification. StringBuilder: mutable, modifies same object, better performance.

12. **What are delegates in C#?**
    - Type-safe function pointers holding reference to methods. Foundation for events.

13. **What are events in C#?**
    - Mechanism enabling class to notify other classes when something of interest occurs. Built on delegates.

14. **What is LINQ?**
    - Language Integrated Query - unified syntax for querying data from different sources (collections, databases, XML).

15. **What are generics in C#?**
    - Type parameters providing type safety and code reusability without boxing/unboxing overhead.

16. **What is the difference between ref and out parameters?**
    - ref: parameter must be initialized before passing. out: parameter doesn't need initialization, must be assigned in method.

17. **What are nullable types?**
    - Value types that can hold null using ? syntax: `int? nullable = null`.

18. **What is async/await in C#?**
    - Pattern for asynchronous programming. async marks method, await suspends execution until task completes.

19. **What is the difference between Task and Thread?**
    - Task: higher-level abstraction, better for async operations, uses thread pool. Thread: lower-level, more control, higher overhead.

20. **What are extension methods?**
    - Static methods appearing as instance methods on existing types without modifying them.

21. **What is dependency injection?**
    - Design pattern providing dependencies to object from outside rather than creating them internally.

22. **What is the difference between IEnumerable and IQueryable?**
    - IEnumerable: in-memory collection, LINQ to Objects. IQueryable: remote data source, LINQ to SQL, deferred execution.

23. **What are lambda expressions in C#?**
    - Anonymous functions using => operator: `x => x * 2`. Used with delegates and LINQ.

24. **What is garbage collection in C#?**
    - Automatic memory management in .NET, works in generations (0, 1, 2) for efficiency.

25. **What is the difference between Dispose and Finalize?**
    - Dispose: manual cleanup via IDisposable, deterministic. Finalize: automatic cleanup by GC, non-deterministic.

26. **What is the using statement?**
    - Ensures IDisposable objects are disposed properly, equivalent to try-finally block calling Dispose.

27. **What are properties in C#?**
    - Members providing flexible mechanism to read, write, or compute values with get/set accessors.

28. **What is the difference between == and Equals()?**
    - ==: reference equality (can be overloaded). Equals(): value equality (can be overridden).

29. **What are indexers in C#?**
    - Allow objects to be indexed like arrays using [] syntax with get/set accessors.

30. **What is reflection in C#?**
    - Ability to inspect metadata and dynamically invoke methods, access properties at runtime.

---

## Swift Questions

1. **What is Swift?**
   - Modern, type-safe programming language for iOS, macOS, watchOS, and tvOS development, developed by Apple.

2. **What are the key features of Swift?**
   - Type safety, optionals, protocol-oriented, memory management with ARC, modern syntax, fast performance.

3. **What are optionals in Swift?**
   - Type that can hold either a value or nil. Declared with ? (optional) or ! (implicitly unwrapped).

4. **What is optional binding?**
   - Safe way to check and unwrap optionals using if let or guard let: `if let value = optional { }`.

5. **What is optional chaining?**
   - Process of querying optional values using ?: `person?.address?.street`. Returns nil if any step is nil.

6. **What is the difference between let and var?**
   - let: constant, value cannot change. var: variable, value can change.

7. **What are closures in Swift?**
   - Self-contained blocks of functionality (like lambdas): `{ (parameters) -> ReturnType in statements }`.

8. **What is the difference between class and struct?**
   - Class: reference type, inheritance, heap allocation. Struct: value type, no inheritance, stack allocation, preferred in Swift.

9. **What are protocols in Swift?**
   - Blueprint defining methods, properties, and requirements. Similar to interfaces in other languages.

10. **What is protocol-oriented programming?**
    - Swift paradigm favoring protocols and protocol extensions over class inheritance for code reuse.

11. **What are extensions in Swift?**
    - Add functionality to existing types without modifying original source code.

12. **What is the difference between weak and unowned?**
    - weak: optional, becomes nil when referenced object deallocated. unowned: non-optional, assumes reference always valid.

13. **What is ARC in Swift?**
    - Automatic Reference Counting - memory management tracking and managing app's memory automatically.

14. **What are retain cycles?**
    - Strong reference cycles preventing ARC from deallocating objects. Fixed using weak or unowned references.

15. **What are generics in Swift?**
    - Write flexible, reusable functions and types that work with any type: `func swap<T>(_ a: inout T, _ b: inout T)`.

16. **What is the difference between map, flatMap, and compactMap?**
    - map: transforms elements. flatMap: transforms and flattens nested arrays. compactMap: transforms and removes nil values.

17. **What are access control levels in Swift?**
    - open, public, internal (default), fileprivate, private.

18. **What is @escaping closure?**
    - Closure that outlives the function it's passed to. Must be marked @escaping when stored or used asynchronously.

19. **What is defer in Swift?**
    - Executes code just before leaving current scope, regardless of how scope is exited.

20. **What are higher-order functions?**
    - Functions taking other functions as parameters or returning functions: map, filter, reduce.

21. **What is lazy initialization?**
    - Property calculated only when first accessed using lazy keyword. Useful for expensive computations.

22. **What is the difference between == and ===?**
    - ==: value equality (Equatable protocol). ===: reference equality (same instance in memory).

23. **What are property observers?**
    - willSet and didSet - code executed before/after property value changes.

24. **What is a computed property?**
    - Property that doesn't store value but provides getter and optional setter: `var fullName: String { get { } set { } }`.

25. **What are trailing closures?**
    - Syntax sugar for passing closure as last parameter outside parentheses: `array.map { $0 * 2 }`.

26. **What is guard statement?**
    - Early exit statement transferring control out of scope if condition not met: `guard let value = optional else { return }`.

27. **What are associated types in protocols?**
    - Placeholder types in protocol definitions, specified by conforming type: `associatedtype Item`.

28. **What is the difference between Array and NSArray?**
    - Array: Swift native, value type, type-safe. NSArray: Objective-C, reference type, holds Any objects.

29. **What are throws and rethrows?**
    - throws: function can throw errors. rethrows: function throws only if closure parameter throws.

30. **What is Codable in Swift?**
    - Type alias for Encodable and Decodable protocols, enabling easy JSON encoding/decoding.

---

## Rust Questions

1. **What is Rust?**
   - Systems programming language focusing on safety, speed, and concurrency without garbage collector.

2. **What are Rust's key features?**
   - Memory safety, zero-cost abstractions, ownership system, no data races, excellent performance, modern tooling.

3. **What is ownership in Rust?**
   - Core feature ensuring memory safety. Each value has owner, only one owner at time, value dropped when owner goes out of scope.

4. **What are the three rules of ownership?**
   - Each value has owner. Only one owner at a time. Value dropped when owner goes out of scope.

5. **What is borrowing in Rust?**
   - Referencing value without taking ownership. Can have multiple immutable references or one mutable reference.

6. **What is the difference between & and &mut?**
   - &: immutable reference, multiple allowed. &mut: mutable reference, only one allowed at a time.

7. **What are lifetimes in Rust?**
   - Scope for which reference is valid. Compiler uses lifetime annotations to ensure references always valid.

8. **What is the borrow checker?**
   - Compiler component ensuring references are always valid and memory safety rules are followed.

9. **What is the difference between String and &str?**
   - String: owned, growable, heap-allocated. &str: borrowed, immutable, string slice, can reference String or literals.

10. **What are traits in Rust?**
    - Define shared behavior (similar to interfaces). Types implement traits to provide specific functionality.

11. **What is the difference between Copy and Clone traits?**
    - Copy: implicit, cheap bitwise copy for stack-only data. Clone: explicit, can be expensive, works with heap data.

12. **What are enums in Rust?**
    - Type with multiple variants, can hold different types of data. More powerful than C-style enums.

13. **What is pattern matching?**
    - Using match expression to handle different enum variants or values exhaustively and safely.

14. **What is Option<T>?**
    - Enum representing value that might be absent: Some(T) or None. Replaces null in other languages.

15. **What is Result<T, E>?**
    - Enum for error handling: Ok(T) for success, Err(E) for error. Forces explicit error handling.

16. **What is the ? operator?**
    - Shorthand for propagating errors. Returns error if Result is Err, unwraps Ok value otherwise.

17. **What are smart pointers in Rust?**
    - Data structures acting like pointers with additional metadata: Box<T>, Rc<T>, Arc<T>, RefCell<T>.

18. **What is the difference between Box, Rc, and Arc?**
    - Box: single owner, heap allocation. Rc: multiple owners, not thread-safe. Arc: multiple owners, thread-safe (atomic).

19. **What is interior mutability?**
    - Pattern allowing mutation of data with immutable references using types like RefCell<T> and Mutex<T>.

20. **What are closures in Rust?**
    - Anonymous functions capturing environment variables: `|x| x + 1`. Can be Fn, FnMut, or FnOnce.

21. **What is the difference between Fn, FnMut, and FnOnce?**
    - Fn: borrows immutably. FnMut: borrows mutably. FnOnce: takes ownership, can only be called once.

22. **What are generics in Rust?**
    - Parameterized types providing code reuse while maintaining type safety: `fn largest<T>(list: &[T]) -> T`.

23. **What is const vs static?**
    - const: inlined at compile time, no fixed address. static: single memory location, has fixed address, can be mutable with unsafe.

24. **What are macros in Rust?**
    - Metaprogramming feature for code generation: declarative (macro_rules!) and procedural macros.

25. **What is unsafe Rust?**
    - Superset allowing raw pointers, calling unsafe functions, accessing mutable statics, implementing unsafe traits.

26. **What is the difference between Vec and [T]?**
    - Vec: owned, growable array on heap. [T]: slice, borrowed view into contiguous sequence.

27. **What are modules in Rust?**
    - Code organization system controlling privacy and scope using mod keyword.

28. **What is cargo?**
    - Rust's build system and package manager handling dependencies, compilation, testing, documentation.

29. **What is the difference between panic! and Result?**
    - panic!: unrecoverable error, terminates program. Result: recoverable error, allows handling with match or ?.

30. **What are iterators in Rust?**
    - Pattern for processing sequence of elements lazily using methods like map, filter, collect.

---

## Go Questions

1. **What is Go?**
   - Statically typed, compiled language designed at Google emphasizing simplicity, concurrency, and performance.

2. **What are Go's key features?**
   - Simple syntax, fast compilation, goroutines for concurrency, garbage collection, static typing, built-in testing.

3. **What are goroutines?**
   - Lightweight threads managed by Go runtime, started with go keyword. Much cheaper than OS threads.

4. **What are channels?**
   - Typed conduits for communication between goroutines: `ch := make(chan int)`. Send/receive using <- operator.

5. **What is the difference between buffered and unbuffered channels?**
   - Unbuffered: blocks until sender and receiver ready. Buffered: has capacity, blocks only when full/empty.

6. **What is select statement?**
   - Waits on multiple channel operations, executes first ready case. Similar to switch for channels.

7. **What is the difference between := and =?**
   - :=: short variable declaration, declares and initializes. =: assignment to existing variable.

8. **What are defer, panic, and recover?**
   - defer: postpones function execution until surrounding function returns. panic: stops normal execution. recover: regains control after panic.

9. **What is the difference between pointers and values?**
   - Pointers: store memory address, use * and &. Values: store actual data. Methods can have value or pointer receivers.

10. **What are interfaces in Go?**
    - Define behavior as set of method signatures. Types implicitly implement interfaces if they have required methods.

11. **What is the empty interface?**
    - interface{} (or any in Go 1.18+): has no methods, can hold values of any type. Similar to Object in other languages.

12. **What is type assertion?**
    - Extract underlying concrete value from interface: `value, ok := i.(Type)`.

13. **What are methods in Go?**
    - Functions with special receiver argument appearing between func keyword and method name.

14. **What is the difference between value and pointer receivers?**
    - Value receiver: operates on copy. Pointer receiver: can modify original value, more efficient for large structs.

15. **What are packages in Go?**
    - Way to organize and reuse code. Every Go program made of packages, starting with package main.

16. **What is init() function?**
    - Special function called automatically before main(), used for initialization. Each file can have multiple init functions.

17. **What are arrays and slices?**
    - Arrays: fixed size, value type. Slices: dynamic size, reference to array, more flexible and commonly used.

18. **How do you append to a slice?**
    - Use built-in append function: `slice = append(slice, elements...)`. May allocate new array if capacity exceeded.

19. **What is make vs new?**
    - make: initializes slices, maps, channels, returns initialized value. new: allocates zeroed storage, returns pointer.

20. **What are maps in Go?**
    - Built-in hash table/dictionary: `m := make(map[string]int)`. Keys must be comparable types.

21. **What is range in Go?**
    - Iterate over slices, arrays, maps, strings, channels: `for i, v := range slice { }`.

22. **What are variadic functions?**
    - Functions accepting variable number of arguments using ...: `func sum(nums ...int) int`.

23. **What is the blank identifier?**
    - _: discards values when you don't need them: `_, err := someFunction()`.

24. **What are closures in Go?**
    - Anonymous functions that can reference variables from surrounding scope.

25. **What is context package?**
    - Carries deadlines, cancellation signals, and request-scoped values across API boundaries and goroutines.

26. **What is the difference between sync.Mutex and sync.RWMutex?**
    - Mutex: exclusive lock. RWMutex: allows multiple readers or single writer.

27. **What are struct tags?**
    - Metadata attached to struct fields used by packages like json: `json:"name,omitempty"`.

28. **What is composition over inheritance?**
    - Go has no inheritance. Use embedding to compose types: struct can embed another struct to reuse fields/methods.

29. **What is go mod?**
    - Dependency management system using go.mod and go.sum files to track module dependencies.

30. **What are the differences between Go and other languages?**
    - No classes, implicit interfaces, multiple return values, goroutines, no exceptions (uses errors), fast compilation.

---

## Kotlin Questions

1. **What is Kotlin?**
   - Modern, statically-typed programming language running on JVM, designed by JetBrains, official language for Android.

2. **What are Kotlin's key features?**
   - Null safety, concise syntax, interoperability with Java, coroutines, data classes, extension functions.

3. **What is null safety in Kotlin?**
   - Type system distinguishes nullable (?) and non-nullable types, eliminating most null pointer exceptions.

4. **What is the difference between val and var?**
   - val: immutable (read-only), assigned once. var: mutable, value can change.

5. **What are data classes?**
   - Classes holding data, automatically generate equals(), hashCode(), toString(), copy(): `data class User(val name: String)`.

6. **What are extension functions?**
   - Add functions to existing classes without modifying them: `fun String.addExclamation() = this + "!"`.

7. **What is the difference between == and ===?**
   - ==: structural equality (calls equals()). ===: referential equality (same object).

8. **What are coroutines in Kotlin?**
   - Lightweight concurrency framework for asynchronous programming without blocking threads.

9. **What is the difference between launch and async?**
   - launch: fire-and-forget, returns Job.