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
	let pointAPtr = ptr >> 2;
	let pointBPtr = pointAPtr + 1;
	let pointNameStrPtr = Module.HEAP32[pointBPtr + 1];
	console.log('point.a', Module.HEAP32[pointAPtr]);
	console.log('point.b', Module.HEAP32[pointBPtr]);
	console.log('point.name', Module.AsciiToString(pointNameStrPtr));
}

function structToObj(ptr) {
	let pointAPtr = Module._getPoint() >> 2;
	let pointBPtr = pointAPtr + 1;
	let pointNameStrPtr = Module.HEAP32[pointBPtr + 1];

	return {
		a: Module.HEAP32[pointAPtr],
		b: Module.HEAP32[pointBPtr],
        name: Module.AsciiToString(pointNameStrPtr)),
	}
}

function loadImgIntoMem(img) {
	return new Promise(resolve => {
		fetch(img)
			.then(r => r.arrayBuffer())
			.then(buff => {
				const imgUi8buff = new Uint8Array(buff, 0, buff.byteLength);
				Module.HEAPU8.set(imgUi8buff, 3000);
				resolve({ ptr: 3000, size: buff.byteLength, imgUi8buff });
			});
	});
}


function imgPtrToData(ptr, size) {
	const imgBuff = Module.HEAPU8.slice(ptr, size);
	return `data:image/jpg;base64,${btoa(String.fromCharCode(...imgBuff))}`;
}
