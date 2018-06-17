# Learning Web Assembly

## [Chapter 1 - Memmory access](./chapters/1-memory-access)
Goals:
- how to access memory
- how to write to memory

Learning by doing:
- accessing an integer C fixed array from JavaScript
- accessing a C struct from JavaScript
- dynamically creating C structs from JavaScript

## [Chapter 2 - From JavaScript to WASM](./chapters/2-from-javascript-to-wasm)
Goals:
- learn to debug a wasm module
- learn to expose JS functions to wasm

## Notes:

### Working with WebAssembly's Memory in Rust
Coming from a high level language like JavaScript you can imagine my enthusiasm when I found out that I have to deal with memory management. Luckily I still have some knowledge on this subject back from college. Stashed up in my brain somewhere, just have to dig it up.
Despite JavaScript and other high level languages, the wasm binary only supports [four types](https://github.com/WebAssembly/design/blob/master/Semantics.md#types):

- **i32**: 32-bit integer
- **i64**: 64-bit integer
- **f32**: 32-bit floating point
- **f64**: 64-bit floating point

This means: no objects, no arrays, no strings nothing of that kind. 
For example - if we were to write a simple sum(a, b) function we would be able to read the output pretty easy because it is a i32 number. However, if we would like to return anything else things get interesting.

To further clarify what I am talking about, let's write a simple Rust function which returns a vector with numbers and then read that vector as an array in JavaScript:

```rust
#[no_mangle]
pub fn simple_arr() -> *mut i32 {
	let vec = Box::new([100, 200, 300, 400]);

	Box::into_raw(vec) as *mut i32
}

fn main() { }
```

Let's take thing step by step:

We used a Rust [macro](https://doc.rust-lang.org/book/first-edition/macros.html) called **#[no_mangle]**. This macro tells the Rust compiler not tomess with that functions name. Similar to Webpack's uglify, at compile time for optimization purposes, function names are modified. We do not want that because we need that name to call our function form the JavaScript layer.

Our function will return a i32 (8 bytes) numeric value which will represent a pointer. This pointer will indicate the location of our array. Like I said above, WASM has only four numeric types. We have to communicate only using those types.

####  Heap vs Stack
Maybe you've noticed that we wrapped our vector inside a Box. To understand why we need to explain a bit what is the difference between the heap and the stack.

When declaring variables in Rust, by default they are placed on the stack. The stack is flushed whenever those variables go out of scope: a function was executed, a loop block has finished etc. If we were to declare our array like so:

```rust
let vec = [100, 200, 300, 400];
```

It would have been garbage collected as soon as our function was executed. And our pointer would have pointed to a dead location.

To solve this issue, we will want to declare our array on the Heap. When we declare variables directly on the Heap we can share them among functions. However, with this gain we loose the garbage collection part. We will have to manually manage the memory.

For now, we will just focus on keeping our vector allocated so we can read it later on.
This is why we used the Box wrapper. To declare variables on the heap - Rust has a native entity called Box.
And finally we will return the Heap location of our vector. Basically we are leaking memory, however this is one of the way of exporting data threw WebAssembly.

#### Reading the vector in JavaScript with Typed Arrays

WebAssembly has a linear memory. This means that everything is allocated on a huge buffer.

That buffer is represented natively using JavaScript's ArrayBuffer. However this is a thin layer over a raw buffer of bytes. It is only a view representation of the bytes, you cannot directly manipulate the buffer. To actually work with these binary representation we will need another structure called Typed Arrays.

To more easily understand what Typed Arrays are, let's directly dive in into our vector example:

```rust
let vec = [100, 200, 300, 400];
```

Like I said above, WebAssembly doesn't have knowledge of vectors or other data structures. It only knows numbers. So that vector will be injected in a big byte buffer. To read that vector we will need it's location. We can call that location an index in that array. Or a more low level term: pointer.

Say our buffer has a 1024 length. This means that it contains 1024 bytes. And somewhere in that buffer we have our vector. Let's say that our vector starts at the offset: 0:

`[ 100, 200, 300, 400, 0, 0, 0, … ]`

However we are talking about raw bytes, so our buffer will look like this:

`[01100100, 11001000, 100101100, 011001000, 00000000, …]`

Now, to get integers out of this raw data we will need the help of Typed Arrays. These data structures come in different flavours. For our case, we will need the Uint32Array This is an unsigned 32 byte typed array. This means that we will expect chunks of 32 byte long positive values. And the code will look like this:

```javascript
const arr = new Uint32Array(rawBuffer, 0, 4);
```

This code takes a chunk of the buffer and it will represent the bytes in cells of 32 bytes of unsigned integer values. Which is exactly what we want. And to finish the transformation we can convert it into a normal JavaScript array:

```javascript
const typedArr = new Uint32Array(arrayBuffer, 0, 4);
const arr = [...typedArray];
// [100, 200, 300, 400]
```

So everything looks great, we can now work with raw bytes and read vectors from buffers. What's next? Let's see how we can obtain that byte buffer which represents our WASM module's linear memory so we can actually read our vector.

#### Compiling Rust code to WebAssembly

If we save that rust code into a .rs file and run the following commands:

```bash
rustc +nightly --target wasm32-unknown-unknown -O vector.rs
wasm-gc vector.wasm vector.wasm
python -m SimpleHTTPServer # Power up an inline HTTP server on port 80
```

We will end up with a **vector.wasm** binary file and a running HTTP web server (we need the http server so we can fetch our wasm binary). After that we will open **Firefox** (in Chrome we will encounter a friendly error which let's us know that we need to compile our WASM module inside a web worker, in Firefox however we do not have that constraint).

```javascript
fetch('memory-access.gc.wasm')
  .then(r => r.arrayBuffer())
  .then(arrayBuff => WebAssembly.instantiate(arrBuff, {}))
  .then(rustWasm => console.log(rustWasm));

// Object { module: WebAssembly.Module, instance: WebAssembly.Instance } 
```

So we now have two attributes: 
- [module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module) *(in short, it is the compiled code)*
- [instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance) *(in short, it is the executable)*

For now we will focus on the instance part. The instance contains everything we need to work with our compiled Rust module. To access our exposed Rust methods we can access them like so: `rustWasm.instance.exports.simple_arr()`

Our WASM module also exposes it's linear memory on the exports object. We can access it like so: `rustWasm.instance.exports.memory`

So putting it all together:

```javascript
fetch('memory-access.gc.wasm')
  .then(r => r.arrayBuffer())
  .then(arrayBuff => WebAssembly.instantiate(arrBuff, {}))
  .then(rustWasm => {
    const vecLocation = wasmRust.instance.exports.simple_arr();
    const vecTyped = new Uint32Array(wasmRust.instance.exports.memory.buffer, vecLocation, 4);
    const simpleVec = [...vecTyped]
    
    console.log(simpleVec)
    // [ 100, 200, 300, 400 ]
  });
```

## Bibliography

- [1] The Book - The Rust Programming Language: [Chapter 1](https://doc.rust-lang.org/book/first-edition/getting-started.html#writing-and-running-a-rust-program)
- [2] [Emscripten WebAssembly setup](http://kripken.github.io/emscripten-site/docs/compiling/WebAssembly.html#setup)
- [3] [Rust compile to WebAssembly](https://rust-lang-nursery.github.io/rust-wasm/setup.html)
- [4] [Hello World Rust compiled to WebAssembly](https://rust-lang-nursery.github.io/rust-wasm/hello-world.html)
