
// reserve space for the HGR1 screen buffer
#define CFGFILE apple2-hgr.cfg
#pragma data-name(push,"HGR")
#pragma data-name(pop)

/*
Test of the LZG decompression library
with a hires graphics image.
*/

#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>
#include <conio.h>
#include <string.h>
#include <apple2.h>
#include <peekpoke.h>

//#link "lzg.c"
#include "lzg.h"

// type aliases for byte/signed byte/unsigned 16-bit
typedef unsigned char byte;
typedef signed char sbyte;
typedef unsigned short word;

// peeks, pokes, and strobes
#define STROBE(addr)       __asm__ ("sta %w", addr)

const unsigned char BITMAP_DATA_LZG[];

/// GRAPHICS FUNCTIONS

// clear screen and set graphics mode
void clrscr() {
  STROBE(0xc052); // turn off mixed-mode
  STROBE(0xc054); // page 1
  STROBE(0xc057); // hi-res
  STROBE(0xc050); // set graphics mode
  memset((byte*)0x2000, 0, 0x2000); // clear page 1
}

int main (void)
{
  clrscr();
  lzg_decode_vram(BITMAP_DATA_LZG, (unsigned char*)0x2000, (unsigned char*)0x4000);
  printf("\nHello! Press a key to reboot...\n");
  cgetc();
  return EXIT_SUCCESS;
}


// COMPRESSED BITMAP DATA

const unsigned char BITMAP_DATA_LZG[] = {
// skip first 16 bytes (header)
//0x4C, 0x5A, 0x47, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x15, 0x64, 0xFF, 0xDA, 0x9A, 0xA9, 0x01, 
0x09, 0x0A, 0x0B, 0x0D, 0x7F, 0x7F, 0x0D, 0x10, 0xAB, 0xD5, 0xAA, 0x0D, 0x21, 0xAE, 0xF7, 0x0A, 
0x0A, 0x0C, 0xFB, 0xDD, 0xAF, 0xDF, 0xAB, 0x91, 0xA2, 0x0B, 0x92, 0x0D, 0x21, 0x0B, 0x94, 0xEE, 
0xFF, 0xBE, 0xFF, 0xFF, 0xFD, 0xBF, 0xF7, 0xBB, 0xF5, 0xBA, 0x86, 0x00, 0x00, 0x40, 0x19, 0x0B, 
0x4C, 0x0B, 0x96, 0xDD, 0xBB, 0xD7, 0x0A, 0x05, 0x20, 0xD5, 0xAA, 0x95, 0x82, 0xC5, 0x88, 0x80, 
0x00, 0x0D, 0x07, 0x80, 0xC0, 0x00, 0x00, 0xA0, 0xE6, 0x7C, 0x7F, 0x0A, 0x06, 0x08, 0x0A, 0x0C, 
0x72, 0xFF, 0xFD, 0xFF, 0xDD, 0xEF, 0x0B, 0xB0, 0xCE, 0x91, 0xA3, 0xC5, 0xA8, 0x0D, 0xE1, 0xBA, 
0x0A, 0x05, 0x7E, 0xBB, 0xDD, 0xBB, 0xF7, 0xAA, 0x0A, 0x08, 0x4E, 0xD5, 0xFB, 0xFF, 0xC3, 0xDF, 
0xCF, 0xC7, 0xFF, 0xF7, 0xFE, 0xF7, 0xE6, 0xF7, 0xBF, 0x81, 0x0A, 0x03, 0x52, 0xD9, 0xBB, 0xFF, 
0x0A, 0x05, 0x78, 0x0D, 0x28, 0xC4, 0xAA, 0xC5, 0x8A, 0x91, 0xA2, 0xC4, 0x0A, 0x08, 0x78, 0x00, 
0x1E, 0x82, 0x80, 0xA0, 0x8C, 0x7F, 0x0A, 0x13, 0x78, 0xEF, 0xFF, 0xF3, 0xFD, 0xBE, 0xDD, 0xAA, 
0xD5, 0x0A, 0x02, 0xF8, 0x8A, 0x91, 0xA0, 0xD4, 0xAA, 0x0B, 0x32, 0x8A, 0xD4, 0xAA, 0xD5, 0x0B, 
0x54, 0xAE, 0xD7, 0xAE, 0xF5, 0x0A, 0x0A, 0x52, 0xBA, 0xFF, 0x0B, 0x4E, 0xFF, 0xF7, 0xEE, 0xFD, 
0x0A, 0x06, 0xC4, 0x80, 0xF1, 0xEC, 0xFD, 0x0A, 0x09, 0x78, 0xF4, 0xBA, 0xFF, 0xEE, 0x9D, 0xA6, 
0x91, 0xAA, 0xD1, 0x88, 0x0B, 0x3E, 0x88, 0x84, 0x82, 0x0A, 0x03, 0xFC, 0x7C, 0x7F, 0x7F, 0x1F, 
0x0D, 0xC1, 0x7E, 0x0A, 0x14, 0x78, 0x3F, 0x76, 0x6C, 0x19, 0xBB, 0xF6, 0xEA, 0x0B, 0x76, 0xC4, 
0x0C, 0x11, 0xA0, 0x80, 0x82, 0xC4, 0x88, 0x0D, 0x21, 0xA0, 0x94, 0xE2, 0x0A, 0x02, 0xD0, 0xDD, 
0x0D, 0x21, 0x0B, 0x52, 0xC5, 0xA2, 0xC5, 0xAA, 0xD5, 0xA8, 0xC5, 0x8A, 0xF1, 0x0B, 0xEC, 0xBE, 
0xF3, 0xEF, 0x0A, 0x03, 0x52, 0x80, 0xC0, 0xCC, 0xD9, 0xBB, 0xDE, 0xFB, 0xFF, 0xAA, 0xD5, 0xA2, 
0x91, 0x8A, 0xD5, 0xA2, 0xD7, 0xAB, 0xF7, 0xBF, 0xF7, 0xAE, 0x9C, 0xA2, 0xC4, 0x88, 0x91, 0xA3, 
0xC4, 0xA0, 0x84, 0x80, 0x91, 0xA2, 0x80, 0xA0, 0xFD, 0x0B, 0xA9, 0x17, 0xB2, 0x80, 0xF8, 0xFF, 
0x0A, 0x10, 0x78, 0x7E, 0x77, 0x4F, 0x1D, 0x3B, 0x64, 0xEC, 0xD4, 0xA3, 0xC4, 0xAA, 0xD5, 0xA8, 
0xD5, 0xAA, 0x95, 0x8A, 0x91, 0x88, 0x91, 0x80, 0x90, 0xA8, 0x95, 0xA2, 0x90, 0x88, 0xC4, 0xA0, 
0xD4, 0x0A, 0x09, 0x78, 0x0D, 0x26, 0x95, 0xBA, 0xF7, 0xBC, 0xDF, 0xFF, 0xFD, 0x3F, 0x06, 0x0B, 
0xBF, 0x00, 0xA0, 0xE6, 0xEC, 0xDC, 0xB3, 0xF3, 0xEE, 0xFF, 0x7F, 0x7F, 0xBB, 0xD7, 0xBB, 0xF7, 
0xEE, 0xDD, 0xEF, 0xDD, 0xAE, 0xC7, 0xA2, 0xD5, 0xA2, 0xC4, 0x22, 0x10, 0x08, 0x11, 0xA0, 0x84, 
0x82, 0x80, 0xA0, 0xC1, 0x88, 0x91, 0xFA, 0x0B, 0x16, 0xFF, 0x85, 0x80, 0xF9, 0x0A, 0x02, 0x68, 
0x0A, 0x0A, 0x78, 0xFB, 0xFF, 0x7F, 0x77, 0xCF, 0xB7, 0x78, 0x11, 0x23, 0x44, 0x8C, 0x91, 0xA2, 
0xC5, 0xE2, 0xFD, 0xFF, 0xC7, 0x7F, 0x7F, 0xEF, 0xDD, 0xBB, 0x87, 0x88, 0x85, 0xA2, 0x0B, 0x32, 
0x80, 0x90, 0x88, 0xF5, 0x7F, 0x7F, 0xAA, 0x0A, 0x24, 0x76, 0xD7, 0xBA, 0x0A, 0x06, 0x7E, 0xC4, 
0x88, 0xE1, 0xDB, 0xFF, 0x9F, 0xFF, 0x0A, 0x47, 0x50, 0x9C, 0xCB, 0xCD, 0x33, 0x66, 0xCE, 0xFF, 
0xFB, 0xF7, 0xAE, 0xD7, 0xBB, 0xDD, 0xFE, 0xF7, 0xBB, 0x9D, 0xAA, 0xC5, 0xA0, 0xD4, 0xAE, 0xC4, 
0x08, 0x11, 0x02, 0x01, 0x02, 0x00, 0xA2, 0x90, 0x80, 0xC4, 0x88, 0xD5, 0xE8, 0xFF, 0x7F, 0x7F, 
0xAF, 0x80, 0x7C, 0x0A, 0x03, 0xE8, 0x0A, 0x08, 0x78, 0xBF, 0xDF, 0xFF, 0xFD, 0x7B, 0x7D, 0xCE, 
0xE5, 0xB2, 0xC6, 0xA3, 0x90, 0x88, 0xC5, 0x88, 0xFF, 0xFF, 0xDF, 0xEC, 0x81, 0x4C, 0x79, 0xFF, 
0xF7, 0xFB, 0x9D, 0xBB, 0x95, 0xA2, 0x90, 0x82, 0xC0, 0xE6, 0xD9, 0x0A, 0x46, 0xD0, 0xBB, 0xD7, 
0xBA, 0xF7, 0x0A, 0x05, 0x76, 0x94, 0xA2, 0x91, 0xA2, 0x84, 0xEC, 0xFF, 0x3F, 0x0A, 0x48, 0x50, 
0x60, 0xC8, 0x99, 0xA3, 0xE4, 0xE6, 0xFF, 0xEE, 0xFD, 0xF8, 0xDF, 0xBB, 0xFF, 0xBE, 0xC4, 0xCE, 
0x91, 0xE3, 0xC5, 0x88, 0xC5, 0xA8, 0xC4, 0xA0, 0xC0, 0x00, 0x41, 0x80, 0x0A, 0x03, 0xBE, 0x8A, 
0xD5, 0x88, 0xD5, 0xFE, 0x9F, 0x70, 0x0A, 0x25, 0x68, 0x0A, 0x06, 0x2F, 0xFF, 0xFD, 0xFB, 0xF7, 
0xBB, 0xF7, 0xB8, 0x90, 0xA2, 0xC5, 0xAA, 0xD4, 0x88, 0xD1, 0x88, 0x91, 0xFB, 0xDD, 0x7F, 0x7F, 
0xC3, 0xFD, 0xA6, 0xFE, 0xBF, 0xF7, 0x7F, 0x7F, 0xAB, 0x91, 0x82, 0xC1, 0xF8, 0x99, 0xB8, 0xDE, 
0x0A, 0x04, 0x78, 0xFB, 0xDD, 0xBF, 0xF7, 0xAE, 0x0A, 0x28, 0x78, 0xD1, 0xA8, 0xC4, 0x00, 0x78, 
0x0A, 0x44, 0x4E, 0x0D, 0x04, 0x82, 0x91, 0xA2, 0xE4, 0x4C, 0x7F, 0xFB, 0xDF, 0xFF, 0xFD, 0xEE, 
0xDD, 0xAE, 0xD7, 0x8E, 0xDD, 0x88, 0xD1, 0xA8, 0x96, 0xA2, 0x84, 0x08, 0x04, 0x02, 0x00, 0x02, 
0x40, 0x0A, 0x42, 0x40, 0x80, 0xC4, 0xA8, 0xD5, 0xF2, 0x0A, 0x43, 0xAE, 0x0A, 0x2E, 0x78, 0x0D, 
0x0C, 0xFF, 0xF7, 0x0A, 0x43, 0xE2, 0x0D, 0x61, 0xFE, 0x0A, 0x07, 0x26, 0x7F, 0x7F, 0xEF, 0xF7, 
0xBE, 0xF7, 0x8A, 0x0A, 0x63, 0x8A, 0x0D, 0x23, 0xDD, 0x8B, 0xFF, 0xFF, 0xDF, 0xFB, 0xFD, 0x73, 
0x7F, 0xFB, 0x0D, 0xE1, 0xEF, 0x9D, 0xFB, 0x81, 0x0A, 0x22, 0xFA, 0x0A, 0x22, 0xF6, 0x0B, 0xD8, 
0xEE, 0x0A, 0x0A, 0xA0, 0x94, 0xA2, 0x0A, 0x09, 0x9E, 0x0D, 0x02, 0x80, 0x99, 0x73, 0x0A, 0x17, 
0x78, 0xBF, 0xE7, 0xBA, 0x0B, 0xB0, 0xA2, 0xC6, 0x88, 0x91, 0x0B, 0xB8, 0xDD, 0x0B, 0xD0, 0xEE, 
0xF5, 0xEE, 0x0A, 0x4B, 0x78, 0xFE, 0xDF, 0x7F, 0x1F, 0x7F, 0x7F, 0xBB, 0xFF, 0xFF, 0xDF, 0xF9, 
0xDD, 0xAF, 0x0A, 0x44, 0xFA, 0xFC, 0x0A, 0x6B, 0x78, 0x0D, 0x25, 0x88, 0x95, 0x88, 0xC4, 0x88, 
0x91, 0x0A, 0x28, 0x20, 0x40, 0x1F, 0x00, 0x00, 0xC0, 0xF1, 0x0A, 0x14, 0xF8, 0x7B, 0x59, 0xEF, 
0xE7, 0xBB, 0x0A, 0x05, 0x30, 0xA8, 0xC4, 0x80, 0xD1, 0xA2, 0x81, 0x8A, 0x91, 0xA2, 0xD0, 0xA8, 
0x0A, 0x23, 0x00, 0xBA, 0x0A, 0x6B, 0xF6, 0x8A, 0x95, 0xEE, 0x0A, 0x63, 0x46, 0xFF, 0x9D, 0x4F, 
0x79, 0xFF, 0xDF, 0x0A, 0x45, 0xFA, 0xC0, 0xBB, 0xF6, 0xEF, 0xFF, 0x0A, 0x07, 0x70, 0xDD, 0xEF, 
0xFD, 0xBB, 0xD7, 0xC8, 0xF1, 0xB8, 0xC4, 0xA2, 0xC4, 0x88, 0x90, 0xA2, 0x90, 0x0A, 0x84, 0xFC, 
0x0B, 0x2B, 0x1F, 0x88, 0x81, 0x88, 0xFC, 0x0A, 0x14, 0x78, 0x4F, 0x59, 0xEE, 0xF7, 0xCC, 0xC1, 
0x0A, 0x03, 0x7A, 0x90, 0x02, 0x04, 0x0A, 0x63, 0xAE, 0xC4, 0x82, 0x90, 0x82, 0xC1, 0xA8, 0xFF, 
0x7F, 0x7F, 0x0A, 0x29, 0xF2, 0xD5, 0xAA, 0x94, 0xAA, 0x95, 0xA2, 0xC4, 0x7F, 0x7F, 0x0A, 0x02, 
0x90, 0xFB, 0xFD, 0xBE, 0x0A, 0x04, 0xF6, 0x91, 0xB3, 0xF7, 0xEE, 0xFD, 0xBE, 0xFF, 0xA2, 0x94, 
0x8A, 0xC5, 0xAA, 0xC4, 0xE8, 0xDD, 0xEE, 0xDD, 0xFB, 0x95, 0xBB, 0xC1, 0x88, 0x91, 0xA2, 0x84, 
0x88, 0x91, 0x82, 0x91, 0x80, 0xC4, 0x88, 0x91, 0x0A, 0x65, 0xF8, 0x07, 0x88, 0x81, 0x78, 0x0A, 
0x33, 0xF8, 0x3E, 0x76, 0xC8, 0x99, 0x9B, 0xF1, 0x88, 0xD5, 0x8A, 0x0A, 0xA2, 0xDE, 0xC5, 0x88, 
0x84, 0xA2, 0x84, 0x80, 0x84, 0xA2, 0x0D, 0xE1, 0x80, 0x81, 0x82, 0xF1, 0x7F, 0x7F, 0x0A, 0xAA, 
0x74, 0xAA, 0xD5, 0x8A, 0xD5, 0xA8, 0x91, 0xE2, 0x0A, 0x63, 0xC0, 0x3F, 0x60, 0x0A, 0x25, 0x50, 
0x19, 0x9B, 0xF7, 0xEE, 0xDC, 0xB9, 0xFE, 0x7F, 0x7F, 0xFE, 0xDD, 0xEE, 0xDD, 0xBB, 0xF7, 0x0D, 
0x21, 0x9D, 0xEA, 0xD5, 0x88, 0x91, 0x08, 0x01, 0x22, 0x04, 0x82, 0x91, 0xA0, 0xC0, 0x80, 0x84, 
0xA2, 0xC4, 0x0A, 0x62, 0xF8, 0x7F, 0x05, 0x00, 0x0A, 0x02, 0x77, 0x0A, 0x0B, 0x78, 0xFE, 0xFF, 
0x6F, 0x7F, 0x7B, 0x79, 0x32, 0x4C, 0x48, 0x19, 0x82, 0xC4, 0x88, 0xD5, 0xB8, 0xFF, 0xAF, 0x90, 
0x70, 0x7F, 0xBF, 0xF7, 0xEE, 0xD1, 0xA2, 0xD0, 0x88, 0x91, 0xA0, 0x80, 0x82, 0xC1, 0xA0, 0xF0, 
0x0A, 0x4F, 0x50, 0x95, 0xA2, 0x91, 0xA2, 0xE0, 0xE6, 0xFF, 0xEF, 0x9F, 0x0A, 0xC8, 0x50, 0xAC, 
0xE6, 0x4C, 0x19, 0xB3, 0xFF, 0xFF, 0xDD, 0xFB, 0xDD, 0xEF, 0xF7, 0xEE, 0xDD, 0xEE, 0xF1, 0x8C, 
0x95, 0x8A, 0xD1, 0xA3, 0x90, 0xA0, 0xC4, 0x08, 0x44, 0x20, 0x0B, 0x16, 0x88, 0x90, 0xA2, 0x94, 
0xAA, 0xFF, 0x7F, 0x7F, 0x0F, 0x00, 0x0A, 0x44, 0xCE, 0x0A, 0x08, 0x78, 0xFF, 0xFD, 0xEB, 0x9D, 
0x0F, 0x67, 0x4B, 0x19, 0x8E, 0x99, 0x8C, 0xC7, 0xA8, 0x94, 0xEA, 0xFD, 0x7F, 0x1F, 0xBE, 0x80, 
0xB0, 0xFC, 0xFF, 0xDD, 0xEF, 0x9F, 0xAB, 0x91, 0x82, 0x81, 0x80, 0xF0, 0xBB, 0xB7, 0x0B, 0x6A, 
0x0A, 0x42, 0x82, 0xEE, 0xD5, 0xEE, 0xDD, 0xAB, 0x0A, 0x25, 0x00, 0x8A, 0xC5, 0x88, 0x91, 0x98, 
0xFF, 0x0A, 0x24, 0x74, 0x0D, 0x02, 0x80, 0x90, 0xB2, 0xE4, 0xC8, 0x99, 0x9B, 0xFE, 0xFB, 0xD7, 
0xEE, 0xF7, 0xEF, 0xF7, 0xEE, 0xF1, 0xBA, 0xE4, 0xBA, 0x94, 0xA2, 0x90, 0xA2, 0x91, 0x0E, 0x11, 
0x08, 0x04, 0x22, 0x10, 0x88, 0x81, 0x80, 0xC0, 0xA8, 0xD4, 0xA2, 0xD5, 0x7F, 0x07, 0x0A, 0x6E, 
0xF8, 0xBF, 0xFF, 0xFF, 0xDF, 0xEE, 0x9D, 0xA2, 0xC1, 0x0A, 0xA2, 0x6C, 0xA2, 0xC5, 0xE8, 0xCD, 
0x0A, 0x82, 0x96, 0x8F, 0xF7, 0x88, 0xF9, 0x7F, 0x7F, 0xFE, 0xDF, 0xFB, 0x85, 0xA0, 0x90, 0xCE, 
0x81, 0x43, 0x79, 0x0A, 0x64, 0xF8, 0xAE, 0xF7, 0xEF, 0xDF, 0x0A, 0xE4, 0x92, 0x0D, 0x22, 0xA2, 
0xC5, 0xA2, 0x90, 0x00, 0x0A, 0x25, 0x74, 0x0A, 0x46, 0x78, 0x88, 0x96, 0x73, 0x7F, 0xFE, 0xF7, 
0xBF, 0xFF, 0xBB, 0xC7, 0xBB, 0xDD, 0xB8, 0xC7, 0xA0, 0xC4, 0xE2, 0xC1, 0x88, 0x81, 0x02, 0x41, 
0x20, 0x00, 0x00, 0x10, 0x80, 0x91, 0xA2, 0x81, 0x82, 0x90, 0xA2, 0xD5, 0xEC, 0x0A, 0x7C, 0xF8, 
0xEF, 0xDD, 0x0A, 0x03, 0x5E, 0x0D, 0xA1, 0xEA, 0x0A, 0x65, 0x74, 0x0D, 0x04, 0xFB, 0xFD, 0xAE, 
0xD4, 0x0A, 0x27, 0xFA, 0xF5, 0xE6, 0xFC, 0x7F, 0x79, 0xBE, 0xDF, 0xFF, 0xFD, 0x0A, 0x02, 0x68, 
0xEE, 0xF5, 0xAE, 0x80, 0x00, 0x00, 0xC0, 0xD9, 0xF9, 0x0A, 0xF0, 0x78, 0xC5, 0xAA, 0xC5, 0xA2, 
0xC0, 0x88, 0x0A, 0xE3, 0x98, 0x0A, 0x26, 0x20, 0x0B, 0x22, 0xC1, 0x0A, 0xF6, 0xF8, 0x7F, 0x7F, 
0xFB, 0x0A, 0x04, 0x76, 0xD5, 0x88, 0x99, 0xA6, 0xC5, 0x0B, 0x82, 0xF5, 0x0A, 0x24, 0xA8, 0xBE, 
0xDF, 0xBB, 0xD7, 0x0A, 0x08, 0xF6, 0xAA, 0xD5, 0xBB, 0xFF, 0x7F, 0x67, 0x0A, 0x82, 0xA4, 0xBE, 
0xFF, 0xCE, 0xFF, 0x0F, 0x0A, 0x04, 0x52, 0xF0, 0xBB, 0xF3, 0x0A, 0x70, 0xF8, 0xA2, 0xD4, 0xA2, 
0x90, 0xA2, 0xC4, 0x09, 0x08, 0x00, 0x7A, 0x70, 0x1F, 0x00, 0x00, 0x30, 0x70, 0x0A, 0x13, 0xF8, 
0x1F, 0x7F, 0x7D, 0x3B, 0x66, 0xEE, 0x0A, 0x64, 0xE0, 0x84, 0xA2, 0x80, 0x80, 0xD0, 0xA8, 0x84, 
0xA0, 0xC4, 0x88, 0x90, 0x82, 0xC5, 0x0A, 0x02, 0x7A, 0xAE, 0x09, 0x03, 0x00, 0x0E, 0x0D, 0x23, 
0x0A, 0x03, 0xFE, 0x8A, 0xE7, 0x7F, 0x7F, 0xEF, 0xFF, 0xBB, 0xFF, 0x3F, 0x7E, 0x0A, 0xE3, 0xCA, 
0x0D, 0x01, 0x88, 0xF1, 0xCE, 0xCD, 0x0A, 0x09, 0x78, 0xF7, 0xEE, 0xF7, 0xEE, 0xDD, 0xB2, 0x8C, 
0xA2, 0x95, 0x8A, 0x91, 0xA2, 0xC0, 0x88, 0xC1, 0x0B, 0x9B, 0x60, 0x0A, 0x02, 0x5E, 0xB2, 0x80, 
0x80, 0x0A, 0xF1, 0x78, 0x0D, 0x01, 0x7D, 0x3E, 0x7F, 0xFF, 0xC7, 0xB3, 0xF6, 0x0A, 0x62, 0xE2, 
0x8A, 0xC5, 0x00, 0x01, 0x82, 0x81, 0xA0, 0xC4, 0x88, 0x95, 0x82, 0xC0, 0x88, 0x91, 0x8A, 0x0A, 
0x92, 0xD0, 0xF1, 0x0A, 0xE2, 0xBE, 0x7F, 0x79, 0xCF, 0xDF, 0xB9, 0x0A, 0x64, 0xF8, 0xE4, 0xEC, 
0x99, 0xBB, 0xF7, 0xEF, 0xFE, 0x88, 0xD5, 0xA2, 0xD1, 0xAA, 0x91, 0xBA, 0xD7, 0xBB, 0xF7, 0xBE, 
0xC7, 0xC8, 0x85, 0xA2, 0xC4, 0x22, 0x44, 0x0B, 0x3E, 0xC4, 0x80, 0x91, 0xA2, 0x84, 0x80, 0xF5, 
0x0A, 0x64, 0xF8, 0x00, 0x0A, 0x43, 0xFA, 0x0A, 0x0D, 0x78, 0x5F, 0x3F, 0x1F, 0x7B, 0x07, 0x32, 
0x47, 0xA0, 0xC6, 0xA2, 0xDC, 0xA2, 0xC5, 0xE8, 0xDD, 0xAB, 0x95, 0xA2, 0x0A, 0x82, 0x2A, 0x90, 
0x88, 0x95, 0xA2, 0x80, 0x82, 0x90, 0x88, 0xF4, 0x7F, 0x7F, 0x0A, 0xA4, 0x8E, 0x0D, 0x27, 0x95, 
0xAA, 0xC5, 0x88, 0xDD, 0xFD, 0xDF, 0xEF, 0xFD, 0xAF, 0x90, 0x0A, 0x05, 0x41, 0x66, 0xEC, 0xDD, 
0xB9, 0xE7, 0x0A, 0xA2, 0xFA, 0xEF, 0xF5, 0xAE, 0x0A, 0xE2, 0xF8, 0xFD, 0xEE, 0xF5, 0xB8, 0x0A, 
0xE2, 0xF8, 0x04, 0x00, 0x11, 0x88, 0xC4, 0x0A, 0xC2, 0x96, 0x88, 0x91, 0xEA, 0x0B, 0x16, 0x7F, 
0x01, 0x00, 0x7E, 0x0A, 0x4F, 0x78, 0x77, 0x7B, 0x7F, 0x36, 0x46, 0x39, 0x10, 0x32, 0x44, 0x88, 
0x91, 0xA2, 0x91, 0xEE, 0xFF, 0x8F, 0xC1, 0x40, 0x7F, 0xFB, 0xFD, 0xBB, 0x9F, 0x8A, 0xC5, 0xA2, 
0xC4, 0x80, 0xC0, 0x80, 0x90, 0x0A, 0x83, 0x78, 0x0A, 0x24, 0xEE, 0x0A, 0x47, 0x50, 0x88, 0xC5, 
0x88, 0xE1, 0x0B, 0x32, 0x0A, 0x25, 0x74, 0x0A, 0xE2, 0xF8, 0xB2, 0x99, 0x33, 0x66, 0xEE, 0xFE, 
0xBF, 0xF7, 0xAE, 0xF7, 0xBA, 0xD7, 0xFB, 0xF7, 0xBB, 0x9C, 0xA2, 0xC5, 0x22, 0x54, 0x8A, 0xC1, 
0x22, 0x14, 0x22, 0x00, 0x88, 0x91, 0x88, 0x80, 0xA0, 0x90, 0x82, 0xD5, 0xAA, 0xFD, 0x0A, 0x62, 
0xF8, 0x0A, 0x4E, 0xF8, 0xEF, 0xDF, 0xBB, 0xF7, 0xEE, 0x99, 0xBB, 0xC4, 0x88, 0xC7, 0xC3, 0x91, 
0xA2, 0xD1, 0xBA, 0xFF, 0x7F, 0x7F, 0x4C, 0x01, 0xB8, 0xF9, 0xEF, 0xFF, 0x7F, 0x1F, 0x8E, 0x0A, 
0x82, 0xF6, 0xF4, 0xBC, 0x0A, 0xE5, 0x78, 0xAA, 0xF7, 0xBB, 0xF7, 0x0A, 0xA7, 0xFE, 0xD4, 0x0A, 
0xA2, 0x52, 0xE0, 0xDF, 0x99, 0x0A, 0x68, 0xF8, 0xC0, 0x8C, 0x91, 0xB2, 0xE4, 0xE6, 0xFF, 0xFE, 
0xDD, 0xFB, 0xFF, 0xFB, 0xDF, 0xB3, 0xDC, 0x8B, 0xD5, 0x8B, 0xC1, 0x88, 0xC5, 0x88, 0xC5, 0x20, 
0x44, 0x00, 0x10, 0x00, 0x61, 0xA0, 0x0B, 0x20, 0xA2, 0xD1, 0xAA, 0xD4, 0xFA, 0x87, 0x09, 0x04, 
0x00, 0x76, 0x0A, 0x08, 0x78, 0xEF, 0xFD, 0xBF, 0xF7, 0xA2, 0xD7, 0x8B, 0xC5, 0x0A, 0xA2, 0x6C, 
0xAA, 0x94, 0xA2, 0xF7, 0xBF, 0xFF, 0x7F, 0x7F, 0xBB, 0x98, 0x0A, 0xE2, 0xA0, 0xFB, 0xF7, 0xAE, 
0x95, 0x80, 0xC4, 0x33, 0x00, 0xAC, 0xF6, 0x0A, 0x83, 0x78, 0xF5, 0xBA, 0xFD, 0xFF, 0xFD, 0x09, 
0x03, 0x02, 0x14, 0x0D, 0x24, 0x94, 0x8A, 0x85, 0x82, 0xC0, 0x81, 0x0A, 0xE9, 0x52, 0x88, 0x90, 
0xA0, 0xD8, 0x4C, 0x7F, 0xFF, 0x0A, 0xE2, 0xF8, 0x95, 0xEE, 0xD5, 0x8E, 0x91, 0x82, 0xD1, 0x88, 
0x94, 0xA2, 0x84, 0x20, 0x10, 0x08, 0x40, 0x0B, 0x14, 0x0A, 0x22, 0xFC, 0xC1, 0xA8, 0xF5, 0x0A, 
0xA3, 0x7A, 0x0A, 0x79, 0xF8, 0xFF, 0xF7, 0x7F, 0x7F, 0xBF, 0x09, 0x04, 0x00, 0xDC, 0xF7, 0xAE, 
0x0D, 0x61, 0x0A, 0x02, 0x86, 0x0D, 0x04, 0xFB, 0xF7, 0xEE, 0xDD, 0xAB, 0x0A, 0xE4, 0x8A, 0x0D, 
0x22, 0xDD, 0xFB, 0xF7, 0xFF, 0xD9, 0xF9, 0xFD, 0xBE, 0xFF, 0xFF, 0xFD, 0x0A, 0x22, 0x38, 0x33, 
0x0A, 0x02, 0xFA, 0xB6, 0x0A, 0xE8, 0xF8, 0x0A, 0x49, 0x20, 0x95, 0x8A, 0xC5, 0xA2, 0x84, 0x0A, 
0xEC, 0xF8, 0xA0, 0x86, 0x0A, 0x98, 0x78, 0xEF, 0xC7, 0x0B, 0xF2, 0xA2, 0x86, 0xB8, 0x94, 0xA2, 
0x0B, 0x78, 0x09, 0x05, 0x03, 0x62, 0x0A, 0xA2, 0x74, 0xAA, 0xD7, 0x09, 0x06, 0x04, 0x78, 0xA8, 
0xD5, 0x0A, 0x02, 0x64, 0xFF, 0xDF, 0xEF, 0xFD, 0xEF, 0xDC, 0xF3, 0xF7, 0x8B, 0x0A, 0x03, 0xFE, 
0x88, 0xCC, 0xCF, 0xFD, 0xFB, 0x0A, 0xE7, 0x78, 0x0D, 0x22, 0xBB, 0xD7, 0xAA, 0xD5, 0x8A, 0x91, 
0x8A, 0x81, 0x88, 0x91, 0x09, 0x08, 0x00, 0x7A, 0xFE, 0x9F, 0x03, 0x00, 0x88, 0xE6, 0x0A, 0x13, 
0x78, 0x77, 0x4F, 0x5F, 0xBE, 0xFC, 0xAC, 0x09, 0x04, 0x00, 0x5E, 0xD1, 0x88, 0x84, 0x80, 0xC0, 
0x88, 0x81, 0x80, 0x90, 0x82, 0xC5, 0xA8, 0xD4, 0x0A, 0x22, 0x2E, 0x09, 0x07, 0x02, 0x70, 0x0D, 
0x25, 0x8A, 0xFC, 0xFE, 0xFF, 0xFF, 0xDF, 0x7F, 0x79, 0xFB, 0xF9, 0xFB, 0x0A, 0xC5, 0x7C, 0xB0, 
0xE4, 0xBB, 0xF7, 0x0A, 0x08, 0x78, 0xEA, 0xDD, 0xFB, 0xFD, 0xBB, 0xF6, 0x88, 0xD1, 0x88, 0xD9, 
0xA0, 0x84, 0x88, 0x90, 0xA2, 0x84, 0x0A, 0x03, 0x7A, 0x0A, 0x83, 0x5E, 0x0C, 0x0D, 0xE3, 0x0A, 
0x10, 0x78, 0x3F, 0x7F, 0x6F, 0x79, 0xBB, 0x9E, 0xCF, 0xD1, 0x0B, 0xB8, 0x84, 0x22, 0x00, 0x0A, 
0x02, 0x76, 0x09, 0x03, 0x00, 0x34, 0xC4, 0xA8, 0xFD, 0x7F, 0x7F, 0x0A, 0x29, 0xF2, 0x0D, 0x22, 
0x91, 0xA2, 0x94, 0x0A, 0x42, 0x1C, 0x7F, 0x67, 0x7F, 0x67, 0x8E, 0x0A, 0xA3, 0x56, 0xC0, 0x91, 
0x9B, 0xF7, 0xEE, 0xD9, 0xBB, 0xFF, 0x09, 0x03, 0x03, 0x9E, 0xD4, 0xEE, 0x0A, 0xE3, 0xF8, 0xA2, 
0xC6, 0x88, 0x91, 0xA2, 0xC4, 0xC8, 0x91, 0xA2, 0x90, 0x80, 0xC0, 0x88, 0x91, 0xA0, 0xD4, 0x0A, 
0x23, 0xDA, 0x97, 0x80, 0xC0, 0x0A, 0x42, 0x7C, 0x0A, 0x0C, 0x78, 0xFE, 0xFF, 0x7B, 0x79, 0x36, 
0x67, 0x43, 0x31, 0x8C, 0xF5, 0xA8, 0xD5, 0xAA, 0x94, 0xEE, 0xF7, 0xEE, 0xC5, 0x0B, 0x32, 0xC0, 
0x88, 0xC0, 0xA0, 0xC4, 0x88, 0x81, 0xA0, 0x84, 0x82, 0xD1, 0x0A, 0x23, 0xD0, 0x09, 0x08, 0x00, 
0xFA, 0xC5, 0x0D, 0x21, 0x91, 0xA2, 0xF1, 0xFC, 0xFD, 0x7F, 0x7F, 0x8F, 0x0A, 0x25, 0xD4, 0xA0, 
0x9C, 0xBB, 0xF3, 0xCE, 0xDD, 0x9B, 0xFF, 0xFF, 0xF7, 0xBB, 0xD7, 0xFB, 0x0A, 0xE2, 0xF8, 0xDF, 
0xBB, 0xC7, 0xA3, 0xD5, 0x88, 0x91, 0x32, 0x10, 0x08, 0x44, 0x80, 0x90, 0x82, 0x80, 0x0A, 0x02, 
0xC0, 0x0A, 0x64, 0xF8, 0x0A, 0x82, 0xF6, 0x0A, 0x0C, 0x78, 0xEE, 0xDD, 0x3F, 0x1F, 0x4F, 0x37, 
0x0C, 0x47, 0x0C, 0x19, 0xB2, 0xC4, 0xA8, 0xC4, 0xFB, 0xFF, 0xE3, 0x9D, 0x8B, 0xFF, 0xFF, 0xF7, 
0xEE, 0xDD, 0xA8, 0x94, 0x82, 0x91, 0x88, 0x90, 0xA0, 0xC0, 0x88, 0xFC, 0x0A, 0x45, 0x50, 0xF5, 
0xEE, 0xDD, 0x09, 0x05, 0x01, 0x00, 0xD1, 0xA2, 0x94, 0xA2, 0xF0, 0x7F, 0x7F, 0xFB, 0x87, 0x0A, 
0x68, 0x78, 0xCC, 0xF1, 0xCC, 0xD9, 0x99, 0xFF, 0xEF, 0x9D, 0xBB, 0xDD, 0xEF, 0xFD, 0xBE, 0xDF, 
0x8E, 0xE7, 0x88, 0x97, 0x8E, 0xD1, 0xA8, 0x84, 0x08, 0x19, 0x00, 0x04, 0x82, 0x84, 0x82, 0x81, 
0x82, 0xC1, 0x88, 0xD5, 0xA2, 0xFD, 0x7F, 0x7F, 0x03, 0x0A, 0xA2, 0x7C, 0x0A, 0xED, 0xF8, 0xEE, 
0xDD, 0x62, 0x65, 0xA6, 0xD1, 0xA3, 0x90, 0x88, 0xC4, 0x88, 0xC5, 0xEE, 0xFF, 0x0A, 0xE2, 0xF8, 
0x4C, 0x79, 0xFF, 0xDF, 0xEF, 0xF7, 0xA3, 0x94, 0xA2, 0xC0, 0x80, 0xD9, 0x4F, 0x0A, 0xE5, 0x78, 
0x0A, 0x02, 0x76, 0xAB, 0x0A, 0x07, 0xFE, 0xA2, 0xC4, 0x88, 0x81, 0xB0, 0x0A, 0xC5, 0x72, 0x0A, 
0xC4, 0xD0, 0xA3, 0xE4, 0x88, 0xD9, 0x99, 0xFF, 0xFB, 0xF7, 0xBE, 0xFF, 0xEF, 0xDD, 0x8C, 0xF7, 
0xE6, 0xF1, 0xB8, 0x94, 0xA2, 0x94, 0xA2, 0xE4, 0x08, 0x10, 0x00, 0x41, 0x20, 0x10, 0x82, 0x91, 
0x80, 0xC0, 0x88, 0xC5, 0xA2, 0xD5, 0xFE, 0x81, 0x0A, 0x6E, 0x78, 0xBF, 0xDF, 0xFB, 0xDD, 0xBB, 
0x0B, 0x22, 0x0A, 0x02, 0xCC, 0xA8, 0xD1, 0x88, 0xD9, 0xFB, 0xFF, 0x7F, 0x7F, 0xBF, 0xC4, 0x70, 
0x7F, 0xBF, 0xF7, 0xFF, 0xDF, 0xBB, 0xD1, 0xA2, 0xB4, 0x8E, 0x80, 0xB2, 0x09, 0x03, 0x01, 0x60, 
0xAA, 0xD5, 0xEA, 0xF7, 0xEE, 0xDF, 0x0A, 0x87, 0xF8, 0x0B, 0x66, 0x90, 0x80, 0xA0, 0x0A, 0x6A, 
0x4E, 0x80, 0x81, 0x82, 0xE7, 0x7C, 0x7F, 0xFE, 0xF7, 0xEF, 0xDF, 0xBB, 0xC7, 0xBB, 0x97, 0xE3, 
0xC5, 0xA8, 0xC4, 0x0A, 0xE2, 0x72, 0x08, 0x04, 0x02, 0x00, 0x08, 0x00, 0x80, 0x91, 0xA2, 0x91, 
0x82, 0xC4, 0xA2, 0xD5, 0x0A, 0x02, 0x56, 0x0A, 0xFB, 0xF8, 0x7F, 0xEB, 0xFD, 0xEF, 0x0A, 0x43, 
0xE2, 0xBA, 0x0A, 0xE3, 0x80, 0x09, 0x04, 0x02, 0xDE, 0x0D, 0x02, 0xFF, 0xDD, 0xEF, 0xF7, 0x0A, 
0xA9, 0xFC, 0xF5, 0xBE, 0xC8, 0x7F, 0x7F, 0xBE, 0xFF, 0xEF, 0xFF, 0x7C, 0x7F, 0xFB, 0xF7, 0xEF, 
0xDD, 0x03, 0x09, 0x16, 0x07, 0x78, 0xD4, 0x8A, 0xD5, 0xA8, 0x91, 0x0A, 0xEA, 0xF8, 0x00, 0x18, 
0x00, 0x00, 0xC0, 0xB1, 0x0A, 0xF7, 0xF8, 0x77, 0xBE, 0x0A, 0xE5, 0xF8, 0xC8, 0xF1, 0x8C, 0xD5, 
0x8A, 0xD1, 0x0A, 0x62, 0xE2, 0xEA, 0x0A, 0x03, 0x7C, 0x09, 0x0C, 0x07, 0xF6, 0xAA, 0xD5, 0xFB, 
0x0B, 0x0E, 0x7C, 0x79, 0x3F, 0x7E, 0x9B, 0xFF, 0x7F, 0x7F, 0x0A, 0x02, 0x76, 0x0A, 0xE2, 0xF8, 
0xBC, 0x0A, 0x0C, 0x78, 0xF5, 0xEF, 0xDD, 0xAB, 0xD5, 0xA8, 0xC4, 0xA8, 0xC4, 0xA0, 0x0A, 0xE8, 
0xF8, 0x60, 0x0A, 0xC2, 0x2A, 0x30, 0x78, 0x0A, 0xF4, 0x78, 0x3F, 0x67, 0x4E, 0x77, 0xB3, 0x0A, 
0x03, 0x5E, 0x8A, 0xC1, 0xA0, 0xF0, 0x08, 0x04, 0xA2, 0x84, 0x80, 0xC5, 0x88, 0x90, 0xA2, 0xD1, 
0x0A, 0xE4, 0xF8, 0x0A, 0x25, 0x74, 0xC5, 0x0D, 0xA4, 0xA8, 0xF7, 0xEF, 0xDF, 0x7F, 0x7F, 0xFB, 
0xFF, 0x4F, 0x7F, 0xE6, 0x9D, 0x09, 0x04, 0x04, 0x56, 0x88, 0x91, 0xEF, 0xFD, 0xFE, 0x0A, 0x67, 
0xF8, 0xBA, 0xF7, 0xFE, 0xF7, 0xCE, 0x91, 0xA2, 0xE4, 0xB8, 0xC4, 0xA2, 0x90, 0xA2, 0xC0, 0x0A, 
0xC2, 0x7A, 0x0A, 0xE4, 0x70, 0x7F, 0x17, 0xB2, 0xC0, 0x40, 0x0A, 0x33, 0x78, 0x6F, 0x77, 0x7F, 
0x7D, 0xE6, 0xF7, 0xA2, 0xC4, 0x0A, 0x03, 0x60, 0xD1, 0x88, 0xE7, 0x80, 0x84, 0x80, 0xD1, 0x88, 
0xD1, 0x80, 0x0A, 0xE2, 0xB4, 0xF4, 0x09, 0x09, 0x03, 0xF8, 0x09, 0x04, 0x01, 0x7C, 0xD4, 0x88, 
0xD1, 0x0A, 0x62, 0x76, 0xFF, 0xF7, 0xFB, 0xF9, 0x0C, 0x0A, 0x64, 0x78, 0xE6, 0xEE, 0xDD, 0xBB, 
0xF7, 0xFE, 0xFF, 0xEE, 0x0A, 0xA2, 0xA0, 0xD5, 0xBB, 0xF7, 0xBA, 0x0D, 0xE1, 0xBB, 0x91, 0x0A, 
0x82, 0x38, 0x82, 0xC4, 0x88, 0xC1, 0x0A, 0x82, 0x42, 0x80, 0x09, 0x03, 0x08, 0xC0, 0x7F, 0x07, 
0x80, 0x90, 0x0A, 0x32, 0xF8, 0x3E, 0x76, 0x7C, 0x19, 0x23, 0x44, 0xE2, 0x91, 0xA2, 0xD4, 0x8A, 
0xC5, 0xFB, 0xFF, 0xBF, 0xF7, 0xA6, 0xC4, 0x88, 0x84, 0x80, 0x94, 0x8A, 0x91, 0x82, 0x80, 0x88, 
0xC0, 0xA0, 0xF4, 0x7F, 0x7F, 0xAA, 0xD7, 0x0A, 0x8C, 0x7A, 0x8A, 0xC5, 0x88, 0xDD, 0xBF, 0xFB, 
0xBF, 0xFF, 0x0A, 0xA4, 0x74, 0x00, 0x00, 0x40, 0x61, 0xCC, 0x9D, 0xB3, 0xF3, 0xE6, 0xFD, 0x7F, 
0x7F, 0xEE, 0xFD, 0xAE, 0xF7, 0xEE, 0xFD, 0xEB, 0xF7, 0xEE, 0x9D, 0x8A, 0xD7, 0x0A, 0x62, 0x1E, 
0x20, 0x10, 0x08, 0x00, 0x88, 0x80, 0xA0, 0xC4, 0x88, 0xD5, 0x0A, 0x62, 0xF8, 0x3F, 0x00, 0x0A, 
0x02, 0xF6, 0x09, 0x0E, 0x07, 0xF8, 0x7E, 0x47, 0x73, 0x45, 0x33, 0x30, 0x60, 0x41, 0x80, 0xC1, 
0xA2, 0xD4, 0x7F, 0x7F, 0xBE, 0xE6, 0x0C, 0x7E, 0xFF, 0xFD, 0xFF, 0xF7, 0x82, 0xD1, 0x88, 0x0A, 
0x62, 0xB2, 0xC5, 0xA2, 0xF8, 0x0A, 0x25, 0xD0, 0xD7, 0xBB, 0x0A, 0x86, 0x7C, 0xC5, 0x88, 0x91, 
0x88, 0xE1, 0xFE, 0xFF, 0x7F, 0x07, 0x0A, 0x47, 0xF6, 0x84, 0xB3, 0xC4, 0xB3, 0xE4, 0xEE, 0xFE, 
0xEF, 0xC5, 0xEE, 0xF7, 0xBE, 0xF7, 0xFB, 0xF5, 0xBA, 0x94, 0xA2, 0xF4, 0xA0, 0xC4, 0x8A, 0x91, 
0x22, 0x44, 0x00, 0x41, 0x08, 0x01, 0x80, 0x84, 0x88, 0x84, 0xA2, 0xD4, 0xAA, 0xF5, 0x7F, 0x7F, 
0x03, 0x09, 0x03, 0x04, 0x76, 0x0A, 0x08, 0x78, 0xFF, 0xF7, 0xBF, 0xFF, 0xBB, 0xF7, 0xAE, 0xC5, 
0xB9, 0x94, 0x8A, 0xE5, 0xA2, 0xC4, 0xA2, 0xD4, 0xBB, 0x09, 0x03, 0x07, 0xF8, 0xBC, 0xFC, 0xBF, 
0xFF, 0xFE, 0xFF, 0x8E, 0xC1, 0x88, 0x84, 0x80, 0xB7, 0xA2, 0xFE, 0x0A, 0x65, 0xF8, 0xDD, 0xBA, 
0x0A, 0xE2, 0x0C, 0x0A, 0xC5, 0x18, 0xA8, 0x95, 0xA2, 0x84, 0x40, 0x1F, 0x0A, 0x69, 0xF8, 0xC0, 
0x88, 0x91, 0xA2, 0xE4, 0xE6, 0xFE, 0xFE, 0xDD, 0xFF, 0xDF, 0xFB, 0xF7, 0xB2, 0xD5, 0xA3, 0xDC, 
0x8E, 0x91, 0x8A, 0xD1, 0x88, 0x91, 0x22, 0x04, 0x02, 0x10, 0x00, 0x04, 0x88, 0x84, 0x82, 0x80, 
0xA0, 0xD4, 0xAA, 0xD1, 0xBA, 0xE0, 0x0A, 0x6E, 0x78, 0xFB, 0xF7, 0xEF, 0xF5, 0xAE, 0xD7, 0x88, 
0xD5, 0x09, 0x03, 0x07, 0x52, 0x94, 0xAA, 0xF7, 0x0A, 0x42, 0x1C, 0xFF, 0xB3, 0x0D, 0xA3, 0xFD, 
0xEF, 0x95, 0x88, 0xCD, 0xA3, 0x80, 0xC8, 0xE5, 0x0A, 0xE5, 0xF8, 0xDD, 0x0A, 0xE2, 0x7C, 0x0A, 
0xA8, 0x7C, 0xA2, 0x09, 0x0B, 0x0B, 0x50, 0x00, 0x00, 0xA0, 0xC0, 0xA0, 0x98, 0x73, 0x0B, 0x2E, 
0xFF, 0xFD, 0xCE, 0xF5, 0xAE, 0xD5, 0xBA, 0x94, 0xA2, 0x94, 0x8A, 0x91, 0xA2, 0x80, 0x02, 0x41, 
0x00, 0x00, 0x02, 0x00, 0xA0, 0xC4, 0x88, 0xC4, 0x88, 0x81, 0x8A, 0xD5, 0xF6, 0x0A, 0x7B, 0xF8, 
0x0A, 0xE2, 0x4A, 0xBF, 0xF7, 0x0A, 0x44, 0xE0, 0xEA, 0xE5, 0xB8, 0x09, 0x09, 0x0B, 0x76, 0x7F, 
0x7F, 0x0A, 0x42, 0x50, 0xBB, 0xDD, 0x0A, 0xE6, 0x78, 0xAA, 0xDD, 0xEF, 0xFF, 0x7F, 0x7F, 0xEF, 
0xF7, 0xFE, 0xDF, 0xFB, 0xFD, 0xFF, 0xFD, 0xFB, 0xB7, 0x0A, 0x03, 0xFA, 0xB6, 0xEE, 0xFE, 0x0A, 
0x6D, 0xF8, 0xC5, 0x88, 0xD5, 0xAA, 0xD4, 0xA2, 0xC4, 0xA0, 0x0A, 0xEB, 0xF8, 0x03, 0x00, 0x80, 
0xC4, 0x0A, 0x17, 0x78, 0xF7, 0xFB, 0xF5, 0x0A, 0x44, 0xE2, 0xA2, 0x8C, 0xA0, 0xD1, 0xAA, 0xC4, 
0xAA, 0x95, 0xA2, 0x09, 0x03, 0x01, 0xAE, 0x0A, 0xC2, 0x1C, 0x0A, 0x02, 0x90, 0x09, 0x07, 0x08, 
0x78, 0xD5, 0xEE, 0xFF, 0xFB, 0xF7, 0xB8, 0xDF, 0x4F, 0x7F, 0xEF, 0xFF, 0xFB, 0xFF, 0x0A, 0x64, 
0xF8, 0xA0, 0xCC, 0x0A, 0x82, 0x0C, 0x0A, 0x29, 0x18, 0x0A, 0x22, 0xD0, 0xD5, 0xA2, 0x91, 0xA2, 
0x84, 0x82, 0x81, 0xA0, 0x0A, 0x26, 0x22, 0x78, 0x0A, 0x62, 0xF8, 0x88, 0xE4, 0x0A, 0x14, 0x78, 
0x6F, 0x59, 0xB3, 0x97, 0xEB, 0x0B, 0xF6, 0x84, 0x88, 0x80, 0x20, 0x00, 0x88, 0xD1, 0x8A, 0x90, 
0x82, 0xC0, 0x88, 0xC5, 0x0A, 0xE2, 0xF8, 0x09, 0x0E, 0x0A, 0xF6, 0xE2, 0xF9, 0x73, 0x0A, 0x82, 
0xF2, 0xF7, 0xF3, 0xDF, 0x99, 0x0A, 0xE5, 0xF8, 0xA2, 0xE4, 0xBE, 0xF7, 0xEF, 0xFF, 0xAA, 0xD5, 
0x0A, 0x24, 0x1C, 0xEE, 0xDD, 0xFB, 0xDD, 0xA3, 0xE5, 0x8A, 0x91, 0xA2, 0xB1, 0x8A, 0xC5, 0x88, 
0x81, 0xA2, 0xC4, 0x80, 0x81, 0x80, 0x0A, 0x23, 0x44, 0xFF, 0x97, 0x8C, 0x84, 0xE0, 0x09, 0x12, 
0x03, 0xF8, 0x77, 0xBB, 0xE6, 0x4E, 0x67, 0x6F, 0x77, 0xC8, 0x0A, 0xE4, 0xF8, 0xC4, 0xA2, 0x98, 
0x00, 0x01, 0x00, 0x00, 0xA2, 0xC4, 0x82, 0x90, 0x80, 0xC4, 0x88, 0xF1, 0x7F, 0x7F, 0x0A, 0x05, 
0x90, 0x0A, 0xE8, 0x7A, 0x94, 0xB2, 0xFB, 0x7F, 0x7F, 0xFE, 0xDF, 0xBF, 0x87, 0x0A, 0x04, 0xF6, 
0x40, 0x19, 0xBB, 0xF6, 0xEE, 0xDC, 0x0A, 0x22, 0x06, 0xBB, 0xF7, 0xEE, 0xDD, 0xEB, 0xDD, 0xAB, 
0xDD, 0xBB, 0xC7, 0x8E, 0x0A, 0xE2, 0xBE, 0x90, 0xA0, 0x98, 0xA0, 0x84, 0x82, 0x81, 0x88, 0x91, 
0xA0, 0xC4, 0x0A, 0x43, 0x4E, 0x85, 0x0A, 0x04, 0x6C, 0x0A, 0x0D, 0x78, 0x5F, 0x7F, 0x7D, 0x0E, 
0x67, 0x48, 0x11, 0xA0, 0xDC, 0x88, 0x95, 0xAA, 0xF1, 0xFE, 0xFF, 0x0A, 0xC2, 0x74, 0xAA, 0x80, 
0x80, 0xC1, 0xA8, 0xC4, 0x88, 0x80, 0x80, 0x90, 0x0A, 0xE5, 0xF8, 0x0D, 0x2C, 0x91, 0xA2, 0xFC, 
0x0A, 0x82, 0x7A, 0x0A, 0x04, 0x76, 0x00, 0x00, 0x80, 0x96, 0xB3, 0xF3, 0xCE, 0x9D, 0xBB, 0xFE, 
0x0A, 0xE2, 0xF8, 0xBB, 0xDD, 0xBB, 0xF7, 0xBE, 0xDF, 0xBB, 0xC7, 0xAC, 0xF5, 0x08, 0x11, 0x22, 
0x44, 0x00, 0x01, 0xA2, 0xC0, 0xA0, 0x80, 0x80, 0x81, 0xA2, 0x09, 0x03, 0x03, 0xF8, 0x3F, 0x00, 
0x0A, 0x02, 0xF6, 0x0A, 0xEB, 0x78, 0xF7, 0xBE, 0xF7, 0x3F, 0x77, 0x6C, 0x79, 0x0C, 0x47, 0x38, 
0x18, 0x8E, 0x90, 0x8A, 0xF1, 0xFE, 0xFF, 0xF8, 0x81, 0x33, 0x78, 0xFF, 0xF7, 0xEF, 0xDD, 0xAB, 
0xC4, 0xA0, 0x90, 0xA0, 0x80, 0xAA, 0xF4, 0x88, 0x0A, 0x25, 0xD0, 0xEA, 0xFD, 0x0A, 0xE3, 0x7A, 
0x0D, 0x22, 0x95, 0xAA, 0xC4, 0xA0, 0xC0, 0xF9, 0xFF, 0x73, 0x01, 0x0A, 0x67, 0x78, 0xF0, 0x8C, 
0x99, 0x8C, 0x99, 0xB3, 0xFF, 0xBB, 0xE7, 0xBB, 0xDF, 0xFB, 0x0B, 0x20, 0xEB, 0xF1, 0x88, 0xC7, 
0x83, 0xD1, 0xA8, 0xC4, 0x08, 0x11, 0x02, 0x10, 0x20, 0x00, 0x82, 0x80, 0xA0, 0x90, 0x88, 0xD5, 
0x0A, 0x72, 0xF8, 0x09, 0x04, 0x02, 0xD2, 0xB9, 0xE6, 0x88, 0xD1, 0xAA, 0x96, 0x82, 0x91, 0x8A, 
0xF1, 0xEE, 0xFF, 0x7F, 0x7F, 0xB8, 0x96, 0xB3, 0xF9, 0xFF, 0xF7, 0x7F, 0x79, 0xAA, 0x85, 0x82, 
0xC1, 0xE0, 0xD9, 0xC9, 0x0A, 0x23, 0xB0, 0x0A, 0x24, 0xCC, 0x0A, 0x28, 0xF8, 0x0A, 0x62, 0xD4, 
0x80, 0xF6, 0x0A, 0x06, 0xF6, 0x0D, 0x02, 0xA2, 0xC4, 0x88, 0xD9, 0x66, 0x7F, 0xBF, 0x0B, 0x38, 
0xBF, 0x9D, 0xCE, 0xDD, 0xC8, 0xD5, 0xA3, 0xC4, 0xA8, 0xC4, 0xA8, 0x84, 0x08, 0x10, 0x00, 0x40, 
0x08, 0x00, 0x82, 0x91, 0x88, 0x81, 0x82, 0x91, 0xAA, 0xD5, 0x8E, 0xF8, 0x0A, 0x6E, 0x78, 0xBE, 
0xFF, 0xFE, 0xD5, 0xBA, 0x9D, 0xA2, 0xC4, 0x0A, 0xA4, 0x4C, 0x0A, 0xC4, 0xE4, 0x0D, 0x02, 0x0A, 
0x82, 0x78, 0xBE, 0xC7, 0xE8, 0xF1, 0x00, 0x00, 0xB0, 0xDE, 0x09, 0x04, 0x07, 0x50, 0xAE, 0xF7, 
0xBE, 0xFF, 0x09, 0x09, 0x0F, 0x50, 0x0A, 0xA3, 0x94, 0x09, 0x0C, 0x03, 0x50, 0x88, 0xC7, 0xEC, 
0xFF, 0xFF, 0xFD, 0xFB, 0xF7, 0xBA, 0xD7, 0xBB, 0xDD, 0x8E, 0xC5, 0x88, 0xD1, 0xA0, 0xC4, 0x88, 
0x91, 0x0A, 0x02, 0x78, 0x00, 0x0A, 0xE4, 0xF8, 0x90, 0xA8, 0x95, 0x0A, 0xFB, 0xF8, 0x0D, 0x01, 
0xFE, 0xF7, 0xEE, 0xFF, 0xEE, 0xD5, 0x0A, 0xA3, 0xE2, 0x98, 0xAF, 0x0A, 0xE4, 0x60, 0x0A, 0x05, 
0x2A, 0xBB, 0xDF, 0xAB, 0x09, 0x0A, 0x0C, 0x76, 0xD4, 0x73, 0x0B, 0x0C, 0xBF, 0xDE, 0xFB, 0xFF, 
0x0A, 0x42, 0x4C, 0xEF, 0x09, 0x03, 0x01, 0x7E, 0x80, 0xCC, 0xB3, 0x0A, 0xEF, 0xF8, 0xA2, 0xD4, 
0xAA, 0xD5, 0x88, 0x95, 0xA2, 0x91, 0x0A, 0x09, 0x9D, 0x60, 0x00, 0x00, 0xA0, 0x98, 0x0A, 0x77, 
0xF8, 0xED, 0x0A, 0x26, 0xDA, 0x8A, 0x90, 0x82, 0xD4, 0x0A, 0xE2, 0xF8, 0x0A, 0x24, 0xAE, 0x7F, 
0x7F, 0xBB, 0xD7, 0x09, 0x09, 0x0C, 0x4C, 0x0D, 0x21, 0xBA, 0xDF, 0x43, 0x1F, 0x3F, 0x7E, 0x7C, 
0x7F, 0xFE, 0x9D, 0x4F, 0x7F, 0x0A, 0xE5, 0x78, 0xF0, 0xE6, 0x0A, 0x63, 0x78, 0x0D, 0x25, 0x91, 
0xBA, 0xF7, 0xEF, 0xDD, 0xEB, 0xDD, 0xAA, 0xC4, 0x88, 0x91, 0x0A, 0x82, 0xF4, 0x0A, 0x05, 0x67, 
0x09, 0x03, 0x07, 0xA6, 0x80, 0xF9, 0x0A, 0x14, 0x78, 0x3F, 0x37, 0x4E, 0x1D, 0xB2, 0x0A, 0x23, 
0xDC, 0x8A, 0x0A, 0x03, 0xAA, 0xA0, 0xC4, 0xAA, 0xC4, 0x8A, 0x84, 0x0A, 0x44, 0xB0, 0x09, 0x0D, 
0x0A, 0xF8, 0xC5, 0xAA, 0x9C, 0x09, 0x05, 0x08, 0x90, 0xB7, 0xEE, 0x0A, 0x83, 0xD6, 0x80, 0xC0, 
0xC8, 0x91, 0xFB, 0xD9, 0xFB, 0xFF, 0x0A, 0x86, 0x9C, 0xBB, 0xF7, 0xBE, 0xF7, 0xB8, 0x96, 0xA2, 
0xC4, 0xC8, 0xC1, 0xA3, 0x84, 0xA2, 0x84, 0x88, 0x91, 0xA2, 0x80, 0x0A, 0x44, 0xF0, 0x7F, 0x17, 
0x33, 0x09, 0x03, 0x07, 0xFF, 0x0A, 0x0E, 0x78, 0x2F, 0x7E, 0x6F, 0x59, 0x3B, 0x7E, 0xAE, 0x94, 
0x0A, 0x22, 0x2A, 0x0D, 0x22, 0x88, 0x81, 0x80, 0x81, 0x80, 0xC4, 0x88, 0x95, 0x82, 0x84, 0x82, 
0x0A, 0xE3, 0xF8, 0x09, 0x0A, 0x08, 0xF4, 0x0A, 0x02, 0x98, 0xA2, 0xC5, 0xF8, 0xFD, 0xEF, 0xDF, 
0xFF, 0xF7, 0x09, 0x06, 0x06, 0xFA, 0xA0, 0xE6, 0xE6, 0xDD, 0x9B, 0xF7, 0xBE, 0xFE, 0x0A, 0xA2, 
0xBC, 0xBB, 0xF7, 0xAE, 0xF7, 0xEE, 0xF5, 0xAE, 0xF1, 0xB8, 0x94, 0xA2, 0xC4, 0x22, 0x44, 0x88, 
0xC1, 0xA0, 0x91, 0x0A, 0x42, 0x96, 0x80, 0x09, 0x03, 0x00, 0xC0, 0x7F, 0x07, 0x80, 0xE4, 0x0A, 
0x33, 0xF8, 0x59, 0x33, 0x16, 0x32, 0x44, 0x82, 0x94, 0xA2, 0xC1, 0x0A, 0x02, 0x66, 0xFB, 0xFF, 
0xCE, 0x9D, 0x8E, 0x85, 0x80, 0x95, 0xA2, 0x90, 0x82, 0x80, 0xA0, 0x80, 0x88, 0x0A, 0xE3, 0xF8, 
0x0A, 0x2C, 0xD2, 0x8A, 0xC5, 0x88, 0xF1, 0xBC, 0xFF, 0x3F, 0x7E, 0x0A, 0x67, 0xF8, 0xD8, 0xEC, 
0x9C, 0x33, 0x66, 0xCE, 0xFF, 0xBF, 0xFF, 0xAE, 0xDD, 0xEE, 0xF5, 0xEE, 0xFF, 0xEB, 0xF5, 0xAE, 
0x95, 0xA2, 0xD6, 0xA2, 0xC4, 0x88, 0x91, 0x22, 0x44, 0x80, 0x81, 0x82, 0x84, 0xA0, 0x84, 0x88, 
0xC5, 0x0A, 0x64, 0xF8, 0x09, 0x04, 0x0A, 0xFA, 0x0A, 0x69, 0xF8, 0xFD, 0xFB, 0xDD, 0x4E, 0x79, 
0x38, 0x06, 0xA3, 0x98, 0x06, 0x47, 0xA0, 0xC4, 0xA8, 0xDC, 0xFF, 0xDF, 0xEF, 0x84, 0xAC, 0xFC, 
0x0B, 0x0E, 0xFD, 0x88, 0x91, 0x82, 0xC1, 0x80, 0xC0, 0xCC, 0x9D, 0xAE, 0x0A, 0xC3, 0x50, 0xBA, 
0x0A, 0xE2, 0xF8, 0x0A, 0x06, 0x7E, 0xC5, 0x82, 0x91, 0x82, 0x81, 0xEE, 0xFF, 0xFE, 0x09, 0x09, 
0x02, 0x52, 0xB2, 0xC6, 0xE3, 0xE4, 0xCE, 0xFF, 0xEF, 0xF1, 0xEE, 0xFD, 0xBE, 0xFF, 0xBB, 0xE7, 
0xAE, 0x87, 0xA2, 0xF4, 0x88, 0xC4, 0xA2, 0x91, 0x22, 0x44, 0x20, 0x44, 0x00, 0x04, 0x80, 0x90, 
0x80, 0xD1, 0xA8, 0x09, 0x03, 0x11, 0xC2, 0x09, 0x04, 0x08, 0x76, 0x0A, 0xE9, 0xF8, 0xFD, 0xFE, 
0xDF, 0xBB, 0x97, 0xCE, 0x91, 0xA6, 0xD4, 0x8A, 0xC5, 0xA8, 0xC5, 0xA8, 0x9C, 0x0A, 0x42, 0xE8, 
0xE6, 0xED, 0x0A, 0x02, 0x6A, 0xBF, 0xDF, 0xAB, 0x90, 0xA2, 0x90, 0xC8, 0xB7, 0x30, 0x0B, 0xAA, 
0xAA, 0xD5, 0xBA, 0xDD, 0xBA, 0x09, 0x09, 0x0A, 0x7A, 0xA2, 0xC4, 0xA2, 0x84, 0x80, 0xFC, 0x09, 
0x06, 0x00, 0xF6, 0x09, 0x04, 0x07, 0xF8, 0xA2, 0xE4, 0xE6, 0xFF, 0xFF, 0xF7, 0x0A, 0xE2, 0xCA, 
0xB8, 0xD7, 0xB2, 0xD7, 0x88, 0xD1, 0xA2, 0x91, 0x22, 0x11, 0x00, 0x0A, 0xE2, 0x78, 0x40, 0x88, 
0xC4, 0xA0, 0x80, 0xA0, 0xC4, 0xAA, 0xC5, 0x82, 0x09, 0x03, 0x00, 0x44, 0x0A, 0x0A, 0x78, 0xEF, 
0xDD, 0xBB, 0xD7, 0xEB, 0xC1, 0x8A, 0x0A, 0x05, 0x4E, 0xA8, 0xF5, 0x0A, 0x82, 0xF0, 0x0B, 0x58, 
0xEF, 0xF8, 0xFF, 0xDF, 0xEB, 0xD1, 0xBA, 0x9E, 0x82, 0x80, 0xC8, 0xB1, 0x0A, 0xE3, 0xF8, 0xD7, 
0xAA, 0xD5, 0xEB, 0xDD, 0xBB, 0x09, 0x06, 0x10, 0x78, 0x09, 0x03, 0x0F, 0xF8, 0x0A, 0xEC, 0xF8, 
0x00, 0x00, 0x80, 0x9C, 0x73, 0x7F, 0xBF, 0xFF, 0xBE, 0xD7, 0xE3, 0xF1, 0xAE, 0xC7, 0xA3, 0xD4, 
0xA2, 0xC4, 0x82, 0x91, 0xA2, 0xC4, 0x32, 0x04, 0x00, 0x00, 0x08, 0x00, 0x80, 0x09, 0x04, 0x12, 
0x42, 0xFC, 0x0A, 0x05, 0xF5, 0x09, 0x19, 0x03, 0xF8, 0xBB, 0xF7, 0xBB, 0xD7, 0x0A, 0x62, 0xE0, 
0xBA, 0xE4, 0x09, 0x04, 0x03, 0xE6, 0x0A, 0xA2, 0x08, 0x0A, 0x85, 0x12, 0xDD, 0xAB, 0x95, 0x0A, 
0x07, 0x76, 0xF4, 0xCE, 0xFF, 0xCB, 0xFF, 0xAF, 0xB6, 0xFE, 0xDD, 0xF9, 0xFF, 0xFB, 0xDF, 0xFB, 
0x0A, 0x23, 0x7E, 0x80, 0xF6, 0xEC, 0x0A, 0x6F, 0xF8, 0xAA, 0xD1, 0xA8, 0xD1, 0xA2, 0xC4, 0x0A, 
0x64, 0x46, 0x09, 0x08, 0x03, 0xF8, 0x40, 0x61, 0xFE, 0x09, 0x07, 0x11, 0xB0, 0x0A, 0x6B, 0xF6, 
0xDF, 0x0A, 0xC2, 0x36, 0x0A, 0xE5, 0xF8, 0xC0, 0x8C, 0xC4, 0x0A, 0x62, 0xB4, 0x82, 0x0B, 0x04, 
0x0B, 0x54, 0xEE, 0xD5, 0xAB, 0x09, 0x04, 0x0B, 0x7A, 0x0A, 0x05, 0x7C, 0xE2, 0xFF, 0xFF, 0xF7, 
0x7F, 0x7F, 0xEF, 0xFF, 0x73, 0x1F, 0xBF, 0x0A, 0x05, 0x44, 0xA0, 0xE4, 0xBB, 0xFF, 0x09, 0x09, 
0x07, 0xF8, 0xD1, 0xEE, 0xFD, 0xBB, 0xF7, 0x98, 0xC4, 0x8B, 0x91, 0xA2, 0xC4, 0x80, 0x91, 0x82, 
0x09, 0x04, 0x0B, 0x78, 0x00, 0x40, 0x09, 0x03, 0x07, 0x78, 0xB2, 0xF8, 0x0A, 0x15, 0xF8, 0x19, 
0xB2, 0xE7, 0x8C, 0xC7, 0xAC, 0x0B, 0x36, 0xA2, 0x84, 0x22, 0x06, 0x80, 0x91, 0x80, 0xD1, 0x82, 
0x91, 0xA2, 0x90, 0x88, 0xC5, 0xE8, 0x0A, 0x0E, 0xD0, 0xC5, 0xAA, 0xD4, 0xA2, 0x94, 0xFC, 0xF7, 
0x0A, 0x02, 0xAA, 0xF9, 0xCD, 0x9B, 0x93, 0x0A, 0xE6, 0xF8, 0xEE, 0xF7, 0xBF, 0xFF, 0xEA, 0xD5, 
0xAA, 0x0A, 0xA2, 0xC4, 0xF5, 0xEE, 0xDD, 0xFB, 0xD5, 0xEB, 0xC1, 0x8C, 0x91, 0xA2, 0xC4, 0x8C, 
0x91, 0x0A, 0xE2, 0x74, 0x88, 0x84, 0xA0, 0x0A, 0x24, 0x42, 0x07, 0x4C, 0x01, 0x0A, 0x42, 0xFA, 
0x0A, 0x0E, 0x78, 0x73, 0x5F, 0x3B, 0x66, 0xCE, 0xE5, 0xB3, 0xE3, 0x88, 0x0A, 0x44, 0xDA, 0xC5, 
0xA2, 0x80, 0xA2, 0x84, 0x20, 0x00, 0xAA, 0xD5, 0x88, 0xC1, 0xA0, 0x80, 0x09, 0x03, 0x12, 0xF8, 
0x0A, 0x2C, 0x50, 0xD4, 0xAA, 0xD1, 0x8C, 0x09, 0x03, 0x11, 0x78, 0x7F, 0x61, 0x0A, 0x05, 0xD2, 
0x19, 0xBB, 0xB7, 0xEE, 0xCD, 0x0A, 0x42, 0xB6, 0xFF, 0xFD, 0x09, 0x03, 0x0F, 0x78, 0xD7, 0xEB, 
0x9D, 0xAA, 0xC5, 0x09, 0x03, 0x0F, 0x78, 0x44, 0x0A, 0x23, 0xF6, 0x90, 0x09, 0x07, 0x0F, 0x78, 
0x0A, 0x82, 0x77, 0x0A, 0x0D, 0x78, 0x7B, 0x7D, 0x3F, 0x77, 0x0C, 0x59, 0x0C, 0x11, 0xB3, 0xC6, 
0xA8, 0xD4, 0xA8, 0x0B, 0x1E, 0xBF, 0xFF, 0xBB, 0xF7, 0xB2, 0x91, 0xA2, 0xD0, 0x88, 0xC1, 0x0A, 
0x82, 0x7E, 0xA0, 0xF0, 0x09, 0x0F, 0x08, 0x78, 0xC5, 0xA2, 0x91, 0xA2, 0xCC, 0xEF, 0xFF, 0xEF, 
0x0A, 0x27, 0xC0, 0x80, 0xE1, 0xB2, 0xF3, 0xCC, 0xD9, 0xB9, 0xFE, 0xEF, 0xF5, 0xEB, 0xF5, 0xAE, 
0xD7, 0xFB, 0xDD, 0xBE, 0xD7, 0xA9, 0xD7, 0x88, 0xF1, 0x88, 0x91, 0xA2, 0xC4, 0x08, 0x10, 0x20, 
0x00, 0x88, 0x80, 0x80, 0x91, 0x09, 0x04, 0x0F, 0x78, 0x2F, 0x09, 0x04, 0x0F, 0xF7, 0x0A, 0x0B, 
0x78, 0xBE, 0xF7, 0x33, 0x16, 0x66, 0x11, 0x4C, 0x41, 0x08, 0x64, 0x0B, 0x1E, 0xF5, 0x7F, 0x7F, 
0x3C, 0x00, 0xB0, 0xF9, 0xBF, 0xDF, 0xEF, 0xF7, 0xA2, 0xC4, 0x88, 0x84, 0x88, 0x90, 0xBB, 0xE7, 
0x0A, 0xE2, 0x4C, 0x09, 0x06, 0x07, 0xF8, 0x0A, 0x43, 0x8E, 0xD7, 0x0A, 0x43, 0xF6, 0xC0, 0x9F, 
0x09, 0x09, 0x13, 0x78, 0x80, 0x90, 0xA3, 0x90, 0x98, 0xD9, 0xB9, 0xFE, 0xBB, 0xDF, 0xB3, 0xF7, 
0xEF, 0xDD, 0xEE, 0x91, 0xBB, 0xDC, 0x8C, 0x91, 0xA2, 0x90, 0x0A, 0xE2, 0x9E, 0x00, 0x10, 0x08, 
0x19, 0x88, 0xC0, 0x80, 0xC4, 0xA2, 0xD1, 0xA2, 0xD5, 0x7F, 0x5F, 0x09, 0x04, 0x04, 0x76, 0x0A, 
0x08, 0x78, 0xBF, 0xF7, 0xEF, 0xFD, 0xEE, 0xF5, 0xA3, 0xE4, 0x88, 0x95, 0xEA, 0xD1, 0xA2, 0x94, 
0xA2, 0xF7, 0xBF, 0xF6, 0x7F, 0x7F, 0xF3, 0xF7, 0x9B, 0xFC, 0x7F, 0x67, 0x7F, 0x7F, 0x8E, 0xC5, 
0x88, 0x84, 0xB2, 0x87, 0xC6, 0x0A, 0xE3, 0x8C, 0x0A, 0xE2, 0x78, 0x0A, 0xC6, 0x94, 0x0D, 0x22, 
0x8A, 0x95, 0x8A, 0x91, 0x00, 0x66, 0x0A, 0xEA, 0xF8, 0xA0, 0xE0, 0x88, 0x99, 0x9B, 0xFF, 0xEF, 
0xFF, 0xFE, 0xFF, 0xBB, 0x97, 0xEB, 0xF5, 0xE8, 0x91, 0xA2, 0xC4, 0x8A, 0xC5, 0x88, 0x91, 0x22, 
0x0A, 0xE2, 0x78, 0x04, 0x80, 0x91, 0x82, 0x81, 0x80, 0x91, 0xAA, 0xD5, 0x0A, 0x06, 0x76, 0x0A, 
0x0A, 0x78, 0xEE, 0xF7, 0xBA, 0xD4, 0xA8, 0xDC, 0x0A, 0x05, 0x50, 0xE4, 0x7F, 0x61, 0x0A, 0x64, 
0x02, 0x0D, 0xA2, 0xBE, 0xD7, 0xCC, 0xDD, 0x0A, 0xA2, 0xD2, 0x0A, 0x22, 0xCE, 0x0A, 0x22, 0x78, 
0xBA, 0x09, 0x0B, 0x03, 0xF8, 0xA0, 0x91, 0xA2, 0x09, 0x06, 0x0D, 0x74, 0x0D, 0x05, 0xC0, 0x91, 
0xFE, 0xFF, 0xFF, 0xDD, 0xFF, 0x9D, 0x8E, 0xDD, 0xAB, 0xD5, 0x88, 0xD7, 0x0A, 0x22, 0x74, 0x22, 
0x44, 0x88, 0x91, 0x02, 0x00, 0x02, 0x00, 0xA0, 0x90, 0xA2, 0x94, 0xA2, 0x80, 0x8A, 0x0A, 0xE3, 
0x42, 0x0A, 0x0C, 0x78, 
};

