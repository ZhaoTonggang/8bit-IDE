
#include <string.h>

typedef unsigned char byte;
typedef signed char sbyte;
typedef unsigned short word;

__sfr __at (0x6) watchdog_strobe;

byte __at (0x2400) vidmem[224][32]; // 256x224x1 video memory

void main();
// start routine @ 0x0
// set stack pointer
void start() {
__asm
	LD      SP,#0x2400
        DI
__endasm;
	main();
}

/// GRAPHICS FUNCTIONS

void clrscr() {
  memset(vidmem, 0, sizeof(vidmem));
}

inline void xor_pixel(byte x, byte y) {
  byte* dest = &vidmem[x][y>>3];
  *dest ^= 0x1 << (y&7);
}

void draw_vline(byte x, byte y1, byte y2) {
  byte yb1 = y1/8;
  byte yb2 = y2/8;
  byte* dest = &vidmem[x][yb1];
  signed char nbytes = yb2 - yb1;
  *dest++ ^= 0xff << (y1&7);
  if (nbytes > 0) {
    while (--nbytes > 0) {
      *dest++ ^= 0xff;
    }
    *dest ^= 0xff >> (~y2&7);
  } else {
    *--dest ^= 0xff << ((y2+1)&7);
  }
}

#define LOCHAR 0x20
#define HICHAR 0x5e

const byte font8x8[HICHAR-LOCHAR+1][8] = {/*{w:8,h:8,bpp:1,count:63,xform:"rotate(-90deg)"}*/
{ 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00 }, { 0x00,0x00,0x00,0x79,0x79,0x00,0x00,0x00 }, { 0x00,0x70,0x70,0x00,0x00,0x70,0x70,0x00 }, { 0x14,0x7f,0x7f,0x14,0x14,0x7f,0x7f,0x14 }, { 0x00,0x12,0x3a,0x6b,0x6b,0x2e,0x24,0x00 }, { 0x00,0x63,0x66,0x0c,0x18,0x33,0x63,0x00 }, { 0x00,0x26,0x7f,0x59,0x59,0x77,0x27,0x05 }, { 0x00,0x00,0x00,0x10,0x30,0x60,0x40,0x00 }, { 0x00,0x00,0x1c,0x3e,0x63,0x41,0x00,0x00 }, { 0x00,0x00,0x41,0x63,0x3e,0x1c,0x00,0x00 }, { 0x08,0x2a,0x3e,0x1c,0x1c,0x3e,0x2a,0x08 }, { 0x00,0x08,0x08,0x3e,0x3e,0x08,0x08,0x00 }, { 0x00,0x00,0x00,0x03,0x03,0x00,0x00,0x00 }, { 0x00,0x08,0x08,0x08,0x08,0x08,0x08,0x00 }, { 0x00,0x00,0x00,0x03,0x03,0x00,0x00,0x00 }, { 0x00,0x01,0x03,0x06,0x0c,0x18,0x30,0x20 }, { 0x00,0x3e,0x7f,0x49,0x51,0x7f,0x3e,0x00 }, { 0x00,0x01,0x11,0x7f,0x7f,0x01,0x01,0x00 }, { 0x00,0x23,0x67,0x45,0x49,0x79,0x31,0x00 }, { 0x00,0x22,0x63,0x49,0x49,0x7f,0x36,0x00 }, { 0x00,0x0c,0x0c,0x14,0x34,0x7f,0x7f,0x04 }, { 0x00,0x72,0x73,0x51,0x51,0x5f,0x4e,0x00 }, { 0x00,0x3e,0x7f,0x49,0x49,0x6f,0x26,0x00 }, { 0x00,0x60,0x60,0x4f,0x5f,0x70,0x60,0x00 }, { 0x00,0x36,0x7f,0x49,0x49,0x7f,0x36,0x00 }, { 0x00,0x32,0x7b,0x49,0x49,0x7f,0x3e,0x00 }, { 0x00,0x00,0x00,0x12,0x12,0x00,0x00,0x00 }, { 0x00,0x00,0x00,0x13,0x13,0x00,0x00,0x00 }, { 0x00,0x08,0x1c,0x36,0x63,0x41,0x41,0x00 }, { 0x00,0x14,0x14,0x14,0x14,0x14,0x14,0x00 }, { 0x00,0x41,0x41,0x63,0x36,0x1c,0x08,0x00 }, { 0x00,0x20,0x60,0x45,0x4d,0x78,0x30,0x00 }, { 0x00,0x3e,0x7f,0x41,0x59,0x79,0x3a,0x00 }, { 0x00,0x1f,0x3f,0x68,0x68,0x3f,0x1f,0x00 }, { 0x00,0x7f,0x7f,0x49,0x49,0x7f,0x36,0x00 }, { 0x00,0x3e,0x7f,0x41,0x41,0x63,0x22,0x00 }, { 0x00,0x7f,0x7f,0x41,0x63,0x3e,0x1c,0x00 }, { 0x00,0x7f,0x7f,0x49,0x49,0x41,0x41,0x00 }, { 0x00,0x7f,0x7f,0x48,0x48,0x40,0x40,0x00 }, { 0x00,0x3e,0x7f,0x41,0x49,0x6f,0x2e,0x00 }, { 0x00,0x7f,0x7f,0x08,0x08,0x7f,0x7f,0x00 }, { 0x00,0x00,0x41,0x7f,0x7f,0x41,0x00,0x00 }, { 0x00,0x02,0x03,0x41,0x7f,0x7e,0x40,0x00 }, { 0x00,0x7f,0x7f,0x1c,0x36,0x63,0x41,0x00 }, { 0x00,0x7f,0x7f,0x01,0x01,0x01,0x01,0x00 }, { 0x00,0x7f,0x7f,0x30,0x18,0x30,0x7f,0x7f }, { 0x00,0x7f,0x7f,0x38,0x1c,0x7f,0x7f,0x00 }, { 0x00,0x3e,0x7f,0x41,0x41,0x7f,0x3e,0x00 }, { 0x00,0x7f,0x7f,0x48,0x48,0x78,0x30,0x00 }, { 0x00,0x3c,0x7e,0x42,0x43,0x7f,0x3d,0x00 }, { 0x00,0x7f,0x7f,0x4c,0x4e,0x7b,0x31,0x00 }, { 0x00,0x32,0x7b,0x49,0x49,0x6f,0x26,0x00 }, { 0x00,0x40,0x40,0x7f,0x7f,0x40,0x40,0x00 }, { 0x00,0x7e,0x7f,0x01,0x01,0x7f,0x7e,0x00 }, { 0x00,0x7c,0x7e,0x03,0x03,0x7e,0x7c,0x00 }, { 0x00,0x7f,0x7f,0x06,0x0c,0x06,0x7f,0x7f }, { 0x00,0x63,0x77,0x1c,0x1c,0x77,0x63,0x00 }, { 0x00,0x70,0x78,0x0f,0x0f,0x78,0x70,0x00 }, { 0x00,0x43,0x47,0x4d,0x59,0x71,0x61,0x00 }, { 0x00,0x00,0x7f,0x7f,0x41,0x41,0x00,0x00 }, { 0x00,0x20,0x30,0x18,0x0c,0x06,0x03,0x01 }, { 0x00,0x00,0x41,0x41,0x7f,0x7f,0x00,0x00 }, { 0x00,0x08,0x18,0x3f,0x3f,0x18,0x08,0x00 }
};

void draw_char(char ch, byte x, byte y) {
  byte i;
  const byte* src = &font8x8[(ch-LOCHAR)][0];
  byte* dest = &vidmem[x*8][y];
  for (i=0; i<8; i++) {
    *dest = *src;
    dest += 32;
    src += 1;
  }
}

void draw_string(const char* str, byte x, byte y) {
  do {
    byte ch = *str++;
    if (!ch) break;
    draw_char(ch, x, y);
    x++;
  } while (1);
}

////

void draw_font() {
  byte i=LOCHAR;
  do {
    draw_char(i, i&15, 31-(i>>4));
    draw_vline(i, i, i*2);
    xor_pixel(i*15, i);
  } while (++i != HICHAR);
}

void main() {
  clrscr();
  draw_font();
  draw_string("HELLO WORLD", 0, 0);
  while (1) watchdog_strobe = 0;
}
