echo "Compiling C to WebAssembly using emcc ...";
emcc -O3 memory-access.c -s WASM=1 -o build.html
echo "[done]";
echo "You can now open build.html in your browser"
