extern {
	fn log_nr(nr: i32);
}

#[no_mangle]
pub extern "C" fn log_lop() {
	for x in 0..10 {
		unsafe {
			log_nr(x);
		}
	}
}

fn main() {}