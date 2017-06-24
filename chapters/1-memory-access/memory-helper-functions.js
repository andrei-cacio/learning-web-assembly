/**
	Helper function for printing arrays of integers
*/
function printIntArr(ptr, size) {
   let intPtr = ptr >> 2;
   for (let i = intPtr; i < intPtr + size; i++) {
      console.log(Module.HEAP32[i]);
   }
}


/**
	Helper function for printing arrays of integers
*/
function ptrToStr(ptr, size) {
	let str = '';
	for (let i = ptr; i < ptr + size; i++) {
		str += String.fromCharCode(Module.HEAP8[i]);
	}

	return str;
}

function printPoint(ptr) {
	let pointAPtr = Module._getPoint() >> 2;
	let pointBPtr = pointAPtr + 1;
	let pointNameStrPtr = Module.HEAP32[pointBPtr + 1];
	console.log('point.a', Module.HEAP32[pointAPtr]);
	console.log('point.b', Module.HEAP32[pointBPtr]);
	console.log('point.name', ptrToStr(pointNameStrPtr, 5));
}

function structToObj(ptr) {
	let pointAPtr = Module._getPoint() >> 2;
	let pointBPtr = pointAPtr + 1;
	let pointNameStrPtr = Module.HEAP32[pointBPtr + 1];

	return {
		a: Module.HEAP32[pointAPtr],
		b: Module.HEAP32[pointBPtr],
        name: ptrToStr(pointNameStrPtr, 5),
	}
}