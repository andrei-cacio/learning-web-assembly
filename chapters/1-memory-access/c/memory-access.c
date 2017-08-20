#include <emscripten.h>
#include <stdlib.h>

int arr[10] = {1, 2, 3, 4, 5};

EMSCRIPTEN_KEEPALIVE
int sum(int a, int b) {
	return a + b;
}

EMSCRIPTEN_KEEPALIVE
int* getOffset() {
	return &arr[0];
}

typedef struct {
	int x;
	int y;
	char *name;
} Point;


EMSCRIPTEN_KEEPALIVE
Point* getPoint() {
	Point *p = malloc(sizeof(Point));
	p->x = 88323;
	p->y = 20;
	p->name = "hello";

	return p;
}

EMSCRIPTEN_KEEPALIVE
char* inverseImg(char* img, int size) {
	int i;
	for (i = 0; i < size; i++) {
		img[i] = 255 - img[i];
	}

	return img;
}

EMSCRIPTEN_KEEPALIVE
Point* createPoint(int x, int y, char* name) {
	Point *p = malloc(sizeof(Point));
	p->x = x;
	p->y = y;
	p->name = name;

	return p;
}


int main() {
   // intentionally left empty
}
