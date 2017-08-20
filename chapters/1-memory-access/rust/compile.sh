echo "Compiling Rust to WebAssembly using rustc ...";
rustc --target=wasm32-unknown-emscripten memory-access.rs -o index.html
echo "[done]";
echo "You can now open build.html in your browser"
