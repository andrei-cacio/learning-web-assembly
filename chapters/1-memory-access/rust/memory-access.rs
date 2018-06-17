#[no_mangle]
pub fn simple_arr() -> *mut i32 {
	let vec = Box::new([100, 200, 300, 400]);

	Box::into_raw(vec) as *mut i32
}

#[no_mangle]
pub extern fn get_offset() -> *mut i32 {
	let vec = &mut [1, 2, 3, 4];

	return vec.as_mut_ptr();
}

#[no_mangle]
pub extern fn sum(a: i32, b: i32) -> i32 {
	a + b
}

fn main() {
	// Intentionally left empty
}