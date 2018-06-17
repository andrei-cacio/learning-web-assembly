rustc +nightly --target wasm32-unknown-unknown -O main.rs
wasm-gc main.wasm main.wasm