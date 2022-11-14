"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleII = void 0;
const MOS6502_1 = require("../common/cpu/MOS6502");
const devices_1 = require("../common/devices");
const emu_1 = require("../common/emu"); // TODO
const util_1 = require("../common/util");
// TODO: read prodos/ca65 header?
const VM_BASE = 0x803; // where to JMP after pr#6
const LOAD_BASE = VM_BASE;
const PGM_BASE = VM_BASE;
const HDR_SIZE = PGM_BASE - LOAD_BASE;
class AppleII extends devices_1.BasicScanlineMachine {
    constructor() {
        super();
        // approx: http://www.cs.columbia.edu/~sedwards/apple2fpga/
        this.cpuFrequency = 1022727;
        this.sampleRate = this.cpuFrequency;
        this.cpuCyclesPerLine = 65;
        this.cpuCyclesPerFrame = this.cpuCyclesPerLine * 262;
        this.canvasWidth = 280;
        this.numVisibleScanlines = 192;
        this.numTotalScanlines = 262;
        this.defaultROMSize = 0xbf00 - 0x803; // TODO
        this.ram = new Uint8Array(0x13000); // 64K + 16K LC RAM - 4K hardware + 12K ROM
        this.cpu = new MOS6502_1.MOS6502();
        this.grdirty = new Array(0xc000 >> 7);
        this.grparams = { dirty: this.grdirty, grswitch: GR_TXMODE, mem: this.ram };
        this.kbdlatch = 0;
        this.soundstate = 0;
        // language card switches
        this.auxRAMselected = false;
        this.auxRAMbank = 1;
        this.writeinhibit = true;
        // value to add when reading & writing each of these banks
        // bank 1 is E000-FFFF, bank 2 is D000-DFFF
        this.bank2rdoffset = 0;
        this.bank2wroffset = 0;
        // disk II
        this.slots = new Array(8);
        // fake disk drive that loads program into RAM
        this.fakeDrive = {
            readROM: (a) => {
                var pc = this.cpu.getPC();
                if (pc >= 0xC600 && pc < 0xC700) {
                    // We're reading code to EXECUTE.
                    // Load the built program directly into memory, and "read"
                    // a JMP directly to it.
                    //console.log(`fakeDrive (EXEC): ${a.toString(16)}`);
                    switch (a) {
                        // JMP VM_BASE
                        case 0:
                            // SHOULD load program into RAM here, but have to do it
                            // below instead.
                            return 0;
                        case 1: return VM_BASE & 0xff;
                        case 2: return (VM_BASE >> 8) & 0xff;
                        default: return 0;
                    }
                }
                else {
                    // We're reading code, but not executing it.
                    // This is probably the Monitor routine to identify whether
                    // this slot is a Disk ][ drive, so... give it what it wants.
                    //console.log(`fakeDrive (NOEX): ${a.toString(16)}`);
                    switch (a) {
                        case 0:
                            // Actually, if we get here, we probably ARE being
                            // executed. For some reason, the instruction at $C600
                            // gets read for execution, BEFORE the PC gets set to
                            // the correct location. So we handle loading the program
                            // into RAM and returning the JMP here, instead of above
                            // where it would otherwise belong.
                            if (this.rom) {
                                console.log(`Loading program into Apple ][ RAM at \$${PGM_BASE.toString(16)}`);
                                this.ram.set(this.rom.slice(HDR_SIZE), PGM_BASE);
                            }
                            return 0x4c; // JMP
                        case 1: return 0x20;
                        case 3: return 0x00;
                        case 5: return 0x03;
                        case 7: return 0x3c;
                        default: return 0;
                    }
                }
            },
            readConst: (a) => {
                return 0;
            },
            read: (a) => { return this.floatbus(); },
            write: (a, v) => { }
        };
        this.loadBIOS(new util_1.lzgmini().decode((0, util_1.stringToByteArray)(atob(APPLEIIGO_LZG))));
        this.connectCPUMemoryBus(this);
        // This line is inappropriate for real ROMs, but was there for
        // the APPLE][GO ROM, so keeping it only in the constructor, for
        // that special case (in case it really is important for this
        // address to be an RTS).
        this.bios[0xD39A - (0x10000 - this.bios.length)] = 0x60; // $d39a = RTS
    }
    saveState() {
        // TODO: automagic
        return {
            c: this.cpu.saveState(),
            ram: this.ram.slice(),
            kbdlatch: this.kbdlatch,
            soundstate: this.soundstate,
            grswitch: this.grparams.grswitch,
            auxRAMselected: this.auxRAMselected,
            auxRAMbank: this.auxRAMbank,
            writeinhibit: this.writeinhibit,
            slots: this.slots.map((slot) => { return slot && slot['saveState'] && slot['saveState'](); }),
            inputs: null
        };
    }
    loadState(s) {
        this.cpu.loadState(s.c);
        this.ram.set(s.ram);
        this.kbdlatch = s.kbdlatch;
        this.soundstate = s.soundstate;
        this.grparams.grswitch = s.grswitch;
        this.auxRAMselected = s.auxRAMselected;
        this.auxRAMbank = s.auxRAMbank;
        this.writeinhibit = s.writeinhibit;
        this.setupLanguageCardConstants();
        for (var i = 0; i < this.slots.length; i++)
            if (this.slots[i] && this.slots[i]['loadState'])
                this.slots[i]['loadState'](s.slots[i]);
        this.ap2disp.invalidate(); // repaint entire screen
    }
    saveControlsState() {
        return { inputs: null, kbdlatch: this.kbdlatch };
    }
    loadControlsState(s) {
        this.kbdlatch = s.kbdlatch;
    }
    loadBIOS(data, title) {
        if (data.length != 0x3000) {
            console.log(`apple2 loadBIOS !!!WARNING!!!: BIOS wants length 0x3000, but BIOS '${title}' has length 0x${data.length.toString(16)}`);
            console.log("will load BIOS to end of memory anyway...");
        }
        this.bios = Uint8Array.from(data);
        this.ram.set(this.bios, 0x10000 - this.bios.length);
        this.ram[0xbf00] = 0x4c; // fake DOS detect for C
        this.ram[0xbf6f] = 0x01; // fake DOS detect for C
    }
    loadROM(data) {
        if (data.length == 35 * 16 * 256) { // is it a disk image?
            var diskii = new DiskII(this, data);
            this.slots[6] = diskii;
        }
        else { // it's a binary, use a fake drive
            super.loadROM(data);
            this.slots[6] = this.fakeDrive;
        }
    }
    reset() {
        super.reset();
        this.auxRAMselected = false;
        this.auxRAMbank = 1;
        this.writeinhibit = true;
        this.ram.fill(0, 0x300, 0x400); // Clear soft-reset vector
        // (force hard reset)
        this.skipboot();
    }
    skipboot() {
        // execute until $c600 boot
        for (var i = 0; i < 2000000; i++) {
            this.cpu.advanceClock();
            if ((this.cpu.getPC() >> 8) == 0xc6)
                break;
        }
        // get out of $c600 boot
        for (var i = 0; i < 2000000; i++) {
            this.cpu.advanceClock();
            if ((this.cpu.getPC() >> 8) < 0xc6)
                break;
        }
    }
    readConst(address) {
        if (address < 0xc000) {
            return this.ram[address];
        }
        else if (address >= 0xd000) {
            if (!this.auxRAMselected)
                return this.bios[address - (0x10000 - this.bios.length)];
            else if (address >= 0xe000)
                return this.ram[address];
            else
                return this.ram[address + this.bank2rdoffset];
        }
        else if (address >= 0xc100 && address < 0xc800) {
            var slot = (address >> 8) & 7;
            return (this.slots[slot] && this.slots[slot].readConst(address & 0xff)) | 0;
        }
        else {
            return 0;
        }
    }
    read(address) {
        address &= 0xffff;
        if (address < 0xc000 || address >= 0xd000) {
            return this.readConst(address);
        }
        else if (address < 0xc100) {
            var slot = (address >> 4) & 0x0f;
            switch (slot) {
                case 0:
                    return this.kbdlatch;
                case 1:
                    this.kbdlatch &= 0x7f;
                    break;
                case 3:
                    this.soundstate = this.soundstate ^ 1;
                    break;
                case 5:
                    if ((address & 0x0f) < 8) {
                        // graphics
                        if ((address & 1) != 0)
                            this.grparams.grswitch |= 1 << ((address >> 1) & 0x07);
                        else
                            this.grparams.grswitch &= ~(1 << ((address >> 1) & 0x07));
                    }
                    break;
                case 6:
                    // tapein, joystick, buttons
                    switch (address & 7) {
                        // buttons (off)
                        case 1:
                        case 2:
                        case 3:
                            return this.floatbus() & 0x7f;
                        // joystick
                        case 4:
                        case 5:
                            return this.floatbus() | 0x80;
                        default:
                            return this.floatbus();
                    }
                case 7:
                    // joy reset
                    if (address == 0xc070)
                        return this.floatbus() | 0x80;
                case 8:
                    return this.doLanguageCardIO(address);
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                    return (this.slots[slot - 8] && this.slots[slot - 8].read(address & 0xf)) | 0;
            }
        }
        else if (address >= 0xc100 && address < 0xc800) {
            var slot = (address >> 8) & 7;
            return (this.slots[slot] && this.slots[slot].readROM(address & 0xff)) | 0;
        }
        return this.floatbus();
    }
    write(address, val) {
        address &= 0xffff;
        val &= 0xff;
        if (address < 0xc000) {
            this.ram[address] = val;
            this.grdirty[address >> 7] = 1;
        }
        else if (address < 0xc080) {
            this.read(address); // strobe address, discard result
        }
        else if (address < 0xc100) {
            var slot = (address >> 4) & 0x0f;
            this.slots[slot - 8] && this.slots[slot - 8].write(address & 0xf, val);
        }
        else if (address >= 0xd000 && !this.writeinhibit) {
            if (address >= 0xe000)
                this.ram[address] = val;
            else
                this.ram[address + this.bank2wroffset] = val;
        }
    }
    // http://www.deater.net/weave/vmwprod/megademo/vapor_lock.html
    // https://retrocomputing.stackexchange.com/questions/14012/what-is-dram-refresh-and-why-is-the-weird-apple-ii-video-memory-layout-affected
    // http://www.apple-iigs.info/doc/fichiers/TheappleIIcircuitdescription1.pdf
    // http://rich12345.tripod.com/aiivideo/softalk.html
    // https://github.com/MiSTer-devel/Apple-II_MiSTer/blob/master/rtl/timing_generator.vhd
    floatbus() {
        var fcyc = this.frameCycles;
        var yline = Math.floor(fcyc / 65);
        var xcyc = Math.floor(fcyc % 65);
        var addr = this.ap2disp.getAddressForScanline(yline);
        return this.readConst(addr + xcyc);
    }
    connectVideo(pixels) {
        super.connectVideo(pixels);
        this.ap2disp = this.pixels && new Apple2Display(this.pixels, this.grparams);
    }
    startScanline() {
    }
    drawScanline() {
        // TODO: draw scanline via ap2disp
    }
    advanceFrame(trap) {
        var clocks = super.advanceFrame(trap);
        this.ap2disp && this.ap2disp.updateScreen();
        return clocks;
    }
    advanceCPU() {
        this.audio.feedSample(this.soundstate, 1);
        return super.advanceCPU();
    }
    setKeyInput(key, code, flags) {
        if (flags & emu_1.KeyFlags.KeyDown) {
            code = 0;
            switch (key) {
                case 16:
                case 17:
                case 18:
                    break; // ignore shift/ctrl/etc
                case 8:
                    code = 8; // left
                    if (flags & emu_1.KeyFlags.Shift) {
                        // (possibly) soft reset
                        this.cpu.reset();
                        return;
                    }
                    break;
                case 13:
                    code = 13;
                    break; // return
                case 27:
                    code = 27;
                    break; // escape
                case 37:
                    code = 8;
                    break; // left
                case 39:
                    code = 21;
                    break; // right
                case 38:
                    code = 11;
                    break; // up
                case 40:
                    code = 10;
                    break; // down
                default:
                    code = key;
                    // convert to uppercase for Apple ][
                    if (code >= 0x61 && code <= 0x7a)
                        code -= 32;
                    if (code >= 32) {
                        if (code >= 65 && code < 65 + 26) {
                            if (flags & emu_1.KeyFlags.Ctrl)
                                code -= 64; // ctrl
                        }
                    }
            }
            if (code) {
                this.kbdlatch = (code | 0x80) & 0xff;
            }
        }
    }
    doLanguageCardIO(address) {
        switch (address & 0x0f) {
            // Select aux RAM bank 2, write protected.
            case 0x0:
            case 0x4:
                this.auxRAMselected = true;
                this.auxRAMbank = 2;
                this.writeinhibit = true;
                break;
            // Select ROM, write enable aux RAM bank 2.
            case 0x1:
            case 0x5:
                this.auxRAMselected = false;
                this.auxRAMbank = 2;
                this.writeinhibit = false;
                break;
            // Select ROM, write protect aux RAM (either bank).
            case 0x2:
            case 0x6:
            case 0xA:
            case 0xE:
                this.auxRAMselected = false;
                this.writeinhibit = true;
                break;
            // Select aux RAM bank 2, write enabled.
            case 0x3:
            case 0x7:
                this.auxRAMselected = true;
                this.auxRAMbank = 2;
                this.writeinhibit = false;
                break;
            // Select aux RAM bank 1, write protected.
            case 0x8:
            case 0xC:
                this.auxRAMselected = true;
                this.auxRAMbank = 1;
                this.writeinhibit = true;
                break;
            // Select ROM, write enable aux RAM bank 1.
            case 0x9:
            case 0xD:
                this.auxRAMselected = false;
                this.auxRAMbank = 1;
                this.writeinhibit = false;
                break;
            // Select aux RAM bank 1, write enabled.
            case 0xB:
            case 0xF:
                this.auxRAMselected = true;
                this.auxRAMbank = 1;
                this.writeinhibit = false;
                break;
        }
        this.setupLanguageCardConstants();
        return this.floatbus();
    }
    setupLanguageCardConstants() {
        // reset language card constants
        if (this.auxRAMbank == 2)
            this.bank2rdoffset = -0x1000; // map 0xd000-0xdfff -> 0xc000-0xcfff
        else
            this.bank2rdoffset = 0x3000; // map 0xd000-0xdfff -> 0x10000-0x10fff
        if (this.auxRAMbank == 2)
            this.bank2wroffset = -0x1000; // map 0xd000-0xdfff -> 0xc000-0xcfff
        else
            this.bank2wroffset = 0x3000; // map 0xd000-0xdfff -> 0x10000-0x10fff
    }
    getDebugCategories() {
        return ['CPU', 'Stack', 'I/O', 'Disk'];
    }
    getDebugInfo(category, state) {
        switch (category) {
            case 'I/O': return "AUX RAM Bank:   " + state.auxRAMbank +
                "\nAUX RAM Select: " + state.auxRAMselected +
                "\nAUX RAM Write:  " + !state.writeinhibit +
                "\n\nGR Switches: " + (0, util_1.printFlags)(state.grswitch, ["Graphics", "Mixed", "Page2", "Hires"], false) +
                "\n";
            case 'Disk': return (this.slots[6] && this.slots[6]['toLongString'] && this.slots[6]['toLongString']()) || "\n";
        }
    }
}
exports.AppleII = AppleII;
const GR_TXMODE = 1;
const GR_MIXMODE = 2;
const GR_PAGE1 = 4;
const GR_HIRES = 8;
var Apple2Display = function (pixels, apple) {
    var XSIZE = 280;
    var YSIZE = 192;
    var PIXELON = 0xffffffff;
    var PIXELOFF = 0xff000000;
    var oldgrmode = -1;
    var textbuf = new Array(40 * 24);
    const flashInterval = 500;
    // https://mrob.com/pub/xapple2/colors.html
    const loresColor = [
        (0, util_1.RGBA)(0, 0, 0),
        (0, util_1.RGBA)(227, 30, 96),
        (0, util_1.RGBA)(96, 78, 189),
        (0, util_1.RGBA)(255, 68, 253),
        (0, util_1.RGBA)(0, 163, 96),
        (0, util_1.RGBA)(156, 156, 156),
        (0, util_1.RGBA)(20, 207, 253),
        (0, util_1.RGBA)(208, 195, 255),
        (0, util_1.RGBA)(96, 114, 3),
        (0, util_1.RGBA)(255, 106, 60),
        (0, util_1.RGBA)(156, 156, 156),
        (0, util_1.RGBA)(255, 160, 208),
        (0, util_1.RGBA)(20, 245, 60),
        (0, util_1.RGBA)(208, 221, 141),
        (0, util_1.RGBA)(114, 255, 208),
        (0, util_1.RGBA)(255, 255, 255)
    ];
    const text_lut = [
        0x000, 0x080, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380,
        0x028, 0x0a8, 0x128, 0x1a8, 0x228, 0x2a8, 0x328, 0x3a8,
        0x050, 0x0d0, 0x150, 0x1d0, 0x250, 0x2d0, 0x350, 0x3d0
    ];
    const hires_lut = [
        0x0000, 0x0400, 0x0800, 0x0c00, 0x1000, 0x1400, 0x1800, 0x1c00,
        0x0080, 0x0480, 0x0880, 0x0c80, 0x1080, 0x1480, 0x1880, 0x1c80,
        0x0100, 0x0500, 0x0900, 0x0d00, 0x1100, 0x1500, 0x1900, 0x1d00,
        0x0180, 0x0580, 0x0980, 0x0d80, 0x1180, 0x1580, 0x1980, 0x1d80,
        0x0200, 0x0600, 0x0a00, 0x0e00, 0x1200, 0x1600, 0x1a00, 0x1e00,
        0x0280, 0x0680, 0x0a80, 0x0e80, 0x1280, 0x1680, 0x1a80, 0x1e80,
        0x0300, 0x0700, 0x0b00, 0x0f00, 0x1300, 0x1700, 0x1b00, 0x1f00,
        0x0380, 0x0780, 0x0b80, 0x0f80, 0x1380, 0x1780, 0x1b80, 0x1f80,
        0x0028, 0x0428, 0x0828, 0x0c28, 0x1028, 0x1428, 0x1828, 0x1c28,
        0x00a8, 0x04a8, 0x08a8, 0x0ca8, 0x10a8, 0x14a8, 0x18a8, 0x1ca8,
        0x0128, 0x0528, 0x0928, 0x0d28, 0x1128, 0x1528, 0x1928, 0x1d28,
        0x01a8, 0x05a8, 0x09a8, 0x0da8, 0x11a8, 0x15a8, 0x19a8, 0x1da8,
        0x0228, 0x0628, 0x0a28, 0x0e28, 0x1228, 0x1628, 0x1a28, 0x1e28,
        0x02a8, 0x06a8, 0x0aa8, 0x0ea8, 0x12a8, 0x16a8, 0x1aa8, 0x1ea8,
        0x0328, 0x0728, 0x0b28, 0x0f28, 0x1328, 0x1728, 0x1b28, 0x1f28,
        0x03a8, 0x07a8, 0x0ba8, 0x0fa8, 0x13a8, 0x17a8, 0x1ba8, 0x1fa8,
        0x0050, 0x0450, 0x0850, 0x0c50, 0x1050, 0x1450, 0x1850, 0x1c50,
        0x00d0, 0x04d0, 0x08d0, 0x0cd0, 0x10d0, 0x14d0, 0x18d0, 0x1cd0,
        0x0150, 0x0550, 0x0950, 0x0d50, 0x1150, 0x1550, 0x1950, 0x1d50,
        0x01d0, 0x05d0, 0x09d0, 0x0dd0, 0x11d0, 0x15d0, 0x19d0, 0x1dd0,
        0x0250, 0x0650, 0x0a50, 0x0e50, 0x1250, 0x1650, 0x1a50, 0x1e50,
        0x02d0, 0x06d0, 0x0ad0, 0x0ed0, 0x12d0, 0x16d0, 0x1ad0, 0x1ed0,
        0x0350, 0x0750, 0x0b50, 0x0f50, 0x1350, 0x1750, 0x1b50, 0x1f50,
        0x03d0, 0x07d0, 0x0bd0, 0x0fd0, 0x13d0, 0x17d0, 0x1bd0, 0x1fd0,
        // just for floating bus, y >= 192
        0x0078, 0x0478, 0x0878, 0x0c78, 0x1078, 0x1478, 0x1878, 0x1c78,
        0x00f8, 0x04f8, 0x08f8, 0x0cf8, 0x10f8, 0x14f8, 0x18f8, 0x1cf8,
        0x0178, 0x0578, 0x0978, 0x0d78, 0x1178, 0x1578, 0x1978, 0x1d78,
        0x01f8, 0x05f8, 0x09f8, 0x0df8, 0x11f8, 0x15f8, 0x19f8, 0x1df8,
        0x0278, 0x0678, 0x0a78, 0x0e78, 0x1278, 0x1678, 0x1a78, 0x1e78,
        0x02f8, 0x06f8, 0x0af8, 0x0ef8, 0x12f8, 0x16f8, 0x1af8, 0x1ef8,
        0x0378, 0x0778, 0x0b78, 0x0f78, 0x1378, 0x1778, 0x1b78, 0x1f78,
        0x03f8, 0x07f8, 0x0bf8, 0x0ff8, 0x13f8, 0x17f8, 0x1bf8, 0x1ff8,
        0x0000, 0x0400, 0x0800, 0x0c00, 0x1000, 0x1400,
    ];
    var colors_lut;
    /**
      * This function makes the color lookup table for hires mode.
      * We make a table of 1024 * 2 * 7 entries.
      * Why? Because we assume each color byte has 10 bits
      * (8 real bits + 1 on each side) and we need different colors
      * for odd and even addresses (2) and each byte displays 7 pixels.
      */
    {
        colors_lut = new Array(256 * 4 * 2 * 7);
        var i, j;
        var c1, c2, c3 = 15;
        var base = 0;
        // go thru odd and even
        for (j = 0; j < 2; j++) {
            // go thru 1024 values
            for (var b1 = 0; b1 < 1024; b1++) {
                // see if the hi bit is set
                if ((b1 & 0x80) == 0) {
                    c1 = 3;
                    c2 = 12; // purple & green
                }
                else {
                    c1 = 6;
                    c2 = 9; // blue & orange
                }
                // make a value consisting of:
                // the 8th bit, then bits 0-7, then the 9th bit
                var b = ((b1 & 0x100) >> 8) | ((b1 & 0x7f) << 1) |
                    ((b1 & 0x200) >> 1);
                // go through each pixel
                for (i = 0; i < 7; i++) {
                    var c;
                    // is this pixel lit?
                    if (((2 << i) & b) != 0) {
                        // are there pixels lit on both sides of this one?
                        if (((7 << i) & b) == (7 << i))
                            // yes, make it white
                            c = 15;
                        else
                            // no, choose color based on odd/even byte
                            // and odd/even pixel column
                            c = ((((j ^ i) & 1) == 0) ? c1 : c2);
                    }
                    else {
                        // are there pixels lit in the previous & next
                        // column but none in this?
                        if (((5 << i) & b) == (5 << i))
                            // color this pixel
                            c = ((((j ^ i) & 1) != 0) ? c1 : c2);
                        else
                            c = 0;
                    }
                    colors_lut[base] = loresColor[c];
                    base++;
                }
            }
        }
    }
    function drawLoresChar(x, y, b) {
        var i, base, adr, c;
        base = (y << 3) * XSIZE + x * 7; //(x<<2) + (x<<1) + x
        c = loresColor[b & 0x0f];
        for (i = 0; i < 4; i++) {
            pixels[base] =
                pixels[base + 1] =
                    pixels[base + 2] =
                        pixels[base + 3] =
                            pixels[base + 4] =
                                pixels[base + 5] =
                                    pixels[base + 6] = c;
            base += XSIZE;
        }
        c = loresColor[b >> 4];
        for (i = 0; i < 4; i++) {
            pixels[base] =
                pixels[base + 1] =
                    pixels[base + 2] =
                        pixels[base + 3] =
                            pixels[base + 4] =
                                pixels[base + 5] =
                                    pixels[base + 6] = c;
            base += XSIZE;
        }
    }
    function drawTextChar(x, y, b, invert) {
        var base = (y << 3) * XSIZE + x * 7; // (x<<2) + (x<<1) + x
        var on, off;
        if (invert) {
            on = PIXELOFF;
            off = PIXELON;
        }
        else {
            on = PIXELON;
            off = PIXELOFF;
        }
        for (var yy = 0; yy < 8; yy++) {
            var chr = apple2_charset[(b << 3) + yy];
            pixels[base] = ((chr & 64) > 0) ? on : off;
            pixels[base + 1] = ((chr & 32) > 0) ? on : off;
            pixels[base + 2] = ((chr & 16) > 0) ? on : off;
            pixels[base + 3] = ((chr & 8) > 0) ? on : off;
            pixels[base + 4] = ((chr & 4) > 0) ? on : off;
            pixels[base + 5] = ((chr & 2) > 0) ? on : off;
            pixels[base + 6] = ((chr & 1) > 0) ? on : off;
            base += XSIZE;
        }
    }
    this.getAddressForScanline = function (y) {
        var base = hires_lut[y];
        if ((apple.grswitch & GR_HIRES) && (y < 160 || !(apple.grswitch & GR_MIXMODE)))
            base = base | ((apple.grswitch & GR_PAGE1) ? 0x4000 : 0x2000);
        else
            base = (base & 0x3ff) | ((apple.grswitch & GR_PAGE1) ? 0x800 : 0x400);
        return base;
    };
    function drawHiresLines(y, maxy) {
        var yb = y * XSIZE;
        for (; y < maxy; y++) {
            var base = hires_lut[y] + (((apple.grswitch & GR_PAGE1) != 0) ? 0x4000 : 0x2000);
            if (!apple.dirty[base >> 7]) {
                yb += XSIZE;
                continue;
            }
            var c1, c2;
            var b = 0;
            var b1 = apple.mem[base] & 0xff;
            for (var x1 = 0; x1 < 20; x1++) {
                var b2 = apple.mem[base + 1] & 0xff;
                var b3 = apple.mem[base + 2] & 0xff;
                var d1 = (((b & 0x40) << 2) | b1 | b2 << 9) & 0x3ff;
                for (var i = 0; i < 7; i++)
                    pixels[yb + i] = colors_lut[d1 * 7 + i];
                var d2 = (((b1 & 0x40) << 2) | b2 | b3 << 9) & 0x3ff;
                for (var i = 0; i < 7; i++)
                    pixels[yb + 7 + i] = colors_lut[d2 * 7 + 7168 + i];
                yb += 14;
                base += 2;
                b = b2;
                b1 = b3;
            }
        }
    }
    function drawLoresLine(y) {
        // get the base address of this line
        var base = text_lut[y] +
            (((apple.grswitch & GR_PAGE1) != 0) ? 0x800 : 0x400);
        //		if (!dirty[base >> 7])
        //		    return;
        for (var x = 0; x < 40; x++) {
            var b = apple.mem[base + x] & 0xff;
            // if the char. changed, draw it
            if (b != textbuf[y * 40 + x]) {
                drawLoresChar(x, y, b);
                textbuf[y * 40 + x] = b;
            }
        }
    }
    function drawTextLine(y, flash) {
        // get the base address of this line
        var base = text_lut[y] +
            (((apple.grswitch & GR_PAGE1) != 0) ? 0x800 : 0x400);
        //		if (!dirty[base >> 7])
        //		    return;
        for (var x = 0; x < 40; x++) {
            var b = apple.mem[base + x] & 0xff;
            var invert;
            // invert flash characters 1/2 of the time
            if (b >= 0x80) {
                invert = false;
            }
            else if (b >= 0x40) {
                invert = flash;
                if (flash)
                    b -= 0x40;
                else
                    b += 0x40;
            }
            else
                invert = true;
            // if the char. changed, draw it
            if (b != textbuf[y * 40 + x]) {
                drawTextChar(x, y, b & 0x7f, invert);
                textbuf[y * 40 + x] = b;
            }
        }
    }
    this.updateScreen = function (totalrepaint) {
        var y;
        var flash = (new Date().getTime() % (flashInterval << 1)) > flashInterval;
        // if graphics mode changed, repaint whole screen
        if (apple.grswitch != oldgrmode) {
            oldgrmode = apple.grswitch;
            totalrepaint = true;
        }
        if (totalrepaint) {
            // clear textbuf if in text mode
            if ((apple.grswitch & GR_TXMODE) != 0 || (apple.grswitch & GR_MIXMODE) != 0) {
                for (y = 0; y < 24; y++)
                    for (var x = 0; x < 40; x++)
                        textbuf[y * 40 + x] = -1;
            }
            for (var i = 0; i < apple.dirty.length; i++)
                apple.dirty[i] = true;
        }
        // first, draw top part of window
        if ((apple.grswitch & GR_TXMODE) != 0) {
            for (y = 0; y < 20; y++)
                drawTextLine(y, flash);
        }
        else {
            if ((apple.grswitch & GR_HIRES) != 0)
                drawHiresLines(0, 160);
            else
                for (y = 0; y < 20; y++)
                    drawLoresLine(y);
        }
        // now do mixed part of window
        if ((apple.grswitch & GR_TXMODE) != 0 || (apple.grswitch & GR_MIXMODE) != 0) {
            for (y = 20; y < 24; y++)
                drawTextLine(y, flash);
        }
        else {
            if ((apple.grswitch & GR_HIRES) != 0)
                drawHiresLines(160, 192);
            else
                for (y = 20; y < 24; y++)
                    drawLoresLine(y);
        }
        for (var i = 0; i < apple.dirty.length; i++)
            apple.dirty[i] = false;
    };
    this.invalidate = function () {
        oldgrmode = -1;
    };
};
/*exported apple2_charset */
const apple2_charset = [
    0x00, 0x1c, 0x22, 0x2a, 0x2e, 0x2c, 0x20, 0x1e,
    0x00, 0x08, 0x14, 0x22, 0x22, 0x3e, 0x22, 0x22,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x22, 0x22, 0x3c,
    0x00, 0x1c, 0x22, 0x20, 0x20, 0x20, 0x22, 0x1c,
    0x00, 0x3c, 0x22, 0x22, 0x22, 0x22, 0x22, 0x3c,
    0x00, 0x3e, 0x20, 0x20, 0x3c, 0x20, 0x20, 0x3e,
    0x00, 0x3e, 0x20, 0x20, 0x3c, 0x20, 0x20, 0x20,
    0x00, 0x1e, 0x20, 0x20, 0x20, 0x26, 0x22, 0x1e,
    0x00, 0x22, 0x22, 0x22, 0x3e, 0x22, 0x22, 0x22,
    0x00, 0x1c, 0x08, 0x08, 0x08, 0x08, 0x08, 0x1c,
    0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x22, 0x1c,
    0x00, 0x22, 0x24, 0x28, 0x30, 0x28, 0x24, 0x22,
    0x00, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3e,
    0x00, 0x22, 0x36, 0x2a, 0x2a, 0x22, 0x22, 0x22,
    0x00, 0x22, 0x22, 0x32, 0x2a, 0x26, 0x22, 0x22,
    0x00, 0x1c, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1c,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x20, 0x20, 0x20,
    0x00, 0x1c, 0x22, 0x22, 0x22, 0x2a, 0x24, 0x1a,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x28, 0x24, 0x22,
    0x00, 0x1c, 0x22, 0x20, 0x1c, 0x02, 0x22, 0x1c,
    0x00, 0x3e, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08,
    0x00, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1c,
    0x00, 0x22, 0x22, 0x22, 0x22, 0x22, 0x14, 0x08,
    0x00, 0x22, 0x22, 0x22, 0x2a, 0x2a, 0x36, 0x22,
    0x00, 0x22, 0x22, 0x14, 0x08, 0x14, 0x22, 0x22,
    0x00, 0x22, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08,
    0x00, 0x3e, 0x02, 0x04, 0x08, 0x10, 0x20, 0x3e,
    0x00, 0x3e, 0x30, 0x30, 0x30, 0x30, 0x30, 0x3e,
    0x00, 0x00, 0x20, 0x10, 0x08, 0x04, 0x02, 0x00,
    0x00, 0x3e, 0x06, 0x06, 0x06, 0x06, 0x06, 0x3e,
    0x00, 0x00, 0x00, 0x08, 0x14, 0x22, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3e,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08,
    0x00, 0x14, 0x14, 0x14, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x14, 0x14, 0x3e, 0x14, 0x3e, 0x14, 0x14,
    0x00, 0x08, 0x1e, 0x28, 0x1c, 0x0a, 0x3c, 0x08,
    0x00, 0x30, 0x32, 0x04, 0x08, 0x10, 0x26, 0x06,
    0x00, 0x10, 0x28, 0x28, 0x10, 0x2a, 0x24, 0x1a,
    0x00, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x10, 0x20, 0x20, 0x20, 0x10, 0x08,
    0x00, 0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08,
    0x00, 0x08, 0x2a, 0x1c, 0x08, 0x1c, 0x2a, 0x08,
    0x00, 0x00, 0x08, 0x08, 0x3e, 0x08, 0x08, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x08, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x3e, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x00, 0x02, 0x04, 0x08, 0x10, 0x20, 0x00,
    0x00, 0x1c, 0x22, 0x26, 0x2a, 0x32, 0x22, 0x1c,
    0x00, 0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1c,
    0x00, 0x1c, 0x22, 0x02, 0x0c, 0x10, 0x20, 0x3e,
    0x00, 0x3e, 0x02, 0x04, 0x0c, 0x02, 0x22, 0x1c,
    0x00, 0x04, 0x0c, 0x14, 0x24, 0x3e, 0x04, 0x04,
    0x00, 0x3e, 0x20, 0x3c, 0x02, 0x02, 0x22, 0x1c,
    0x00, 0x0e, 0x10, 0x20, 0x3c, 0x22, 0x22, 0x1c,
    0x00, 0x3e, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10,
    0x00, 0x1c, 0x22, 0x22, 0x1c, 0x22, 0x22, 0x1c,
    0x00, 0x1c, 0x22, 0x22, 0x1e, 0x02, 0x04, 0x38,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x08, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x08, 0x08, 0x10,
    0x00, 0x04, 0x08, 0x10, 0x20, 0x10, 0x08, 0x04,
    0x00, 0x00, 0x00, 0x3e, 0x00, 0x3e, 0x00, 0x00,
    0x00, 0x10, 0x08, 0x04, 0x02, 0x04, 0x08, 0x10,
    0x00, 0x1c, 0x22, 0x04, 0x08, 0x08, 0x00, 0x08,
    0x80, 0x9c, 0xa2, 0xaa, 0xae, 0xac, 0xa0, 0x9e,
    0x80, 0x88, 0x94, 0xa2, 0xa2, 0xbe, 0xa2, 0xa2,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa2, 0xa2, 0xbc,
    0x80, 0x9c, 0xa2, 0xa0, 0xa0, 0xa0, 0xa2, 0x9c,
    0x80, 0xbc, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xbc,
    0x80, 0xbe, 0xa0, 0xa0, 0xbc, 0xa0, 0xa0, 0xbe,
    0x80, 0xbe, 0xa0, 0xa0, 0xbc, 0xa0, 0xa0, 0xa0,
    0x80, 0x9e, 0xa0, 0xa0, 0xa0, 0xa6, 0xa2, 0x9e,
    0x80, 0xa2, 0xa2, 0xa2, 0xbe, 0xa2, 0xa2, 0xa2,
    0x80, 0x9c, 0x88, 0x88, 0x88, 0x88, 0x88, 0x9c,
    0x80, 0x82, 0x82, 0x82, 0x82, 0x82, 0xa2, 0x9c,
    0x80, 0xa2, 0xa4, 0xa8, 0xb0, 0xa8, 0xa4, 0xa2,
    0x80, 0xa0, 0xa0, 0xa0, 0xa0, 0xa0, 0xa0, 0xbe,
    0x80, 0xa2, 0xb6, 0xaa, 0xaa, 0xa2, 0xa2, 0xa2,
    0x80, 0xa2, 0xa2, 0xb2, 0xaa, 0xa6, 0xa2, 0xa2,
    0x80, 0x9c, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x9c,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa0, 0xa0, 0xa0,
    0x80, 0x9c, 0xa2, 0xa2, 0xa2, 0xaa, 0xa4, 0x9a,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa8, 0xa4, 0xa2,
    0x80, 0x9c, 0xa2, 0xa0, 0x9c, 0x82, 0xa2, 0x9c,
    0x80, 0xbe, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88,
    0x80, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x9c,
    0x80, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x94, 0x88,
    0x80, 0xa2, 0xa2, 0xa2, 0xaa, 0xaa, 0xb6, 0xa2,
    0x80, 0xa2, 0xa2, 0x94, 0x88, 0x94, 0xa2, 0xa2,
    0x80, 0xa2, 0xa2, 0x94, 0x88, 0x88, 0x88, 0x88,
    0x80, 0xbe, 0x82, 0x84, 0x88, 0x90, 0xa0, 0xbe,
    0x80, 0xbe, 0xb0, 0xb0, 0xb0, 0xb0, 0xb0, 0xbe,
    0x80, 0x80, 0xa0, 0x90, 0x88, 0x84, 0x82, 0x80,
    0x80, 0xbe, 0x86, 0x86, 0x86, 0x86, 0x86, 0xbe,
    0x80, 0x80, 0x80, 0x88, 0x94, 0xa2, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0xbe,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x88, 0x88, 0x88, 0x88, 0x88, 0x80, 0x88,
    0x80, 0x94, 0x94, 0x94, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x94, 0x94, 0xbe, 0x94, 0xbe, 0x94, 0x94,
    0x80, 0x88, 0x9e, 0xa8, 0x9c, 0x8a, 0xbc, 0x88,
    0x80, 0xb0, 0xb2, 0x84, 0x88, 0x90, 0xa6, 0x86,
    0x80, 0x90, 0xa8, 0xa8, 0x90, 0xaa, 0xa4, 0x9a,
    0x80, 0x88, 0x88, 0x88, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x88, 0x90, 0xa0, 0xa0, 0xa0, 0x90, 0x88,
    0x80, 0x88, 0x84, 0x82, 0x82, 0x82, 0x84, 0x88,
    0x80, 0x88, 0xaa, 0x9c, 0x88, 0x9c, 0xaa, 0x88,
    0x80, 0x80, 0x88, 0x88, 0xbe, 0x88, 0x88, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x88, 0x88, 0x90,
    0x80, 0x80, 0x80, 0x80, 0xbe, 0x80, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x88,
    0x80, 0x80, 0x82, 0x84, 0x88, 0x90, 0xa0, 0x80,
    0x80, 0x9c, 0xa2, 0xa6, 0xaa, 0xb2, 0xa2, 0x9c,
    0x80, 0x88, 0x98, 0x88, 0x88, 0x88, 0x88, 0x9c,
    0x80, 0x9c, 0xa2, 0x82, 0x8c, 0x90, 0xa0, 0xbe,
    0x80, 0xbe, 0x82, 0x84, 0x8c, 0x82, 0xa2, 0x9c,
    0x80, 0x84, 0x8c, 0x94, 0xa4, 0xbe, 0x84, 0x84,
    0x80, 0xbe, 0xa0, 0xbc, 0x82, 0x82, 0xa2, 0x9c,
    0x80, 0x8e, 0x90, 0xa0, 0xbc, 0xa2, 0xa2, 0x9c,
    0x80, 0xbe, 0x82, 0x84, 0x88, 0x90, 0x90, 0x90,
    0x80, 0x9c, 0xa2, 0xa2, 0x9c, 0xa2, 0xa2, 0x9c,
    0x80, 0x9c, 0xa2, 0xa2, 0x9e, 0x82, 0x84, 0xb8,
    0x80, 0x80, 0x80, 0x88, 0x80, 0x88, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x88, 0x80, 0x88, 0x88, 0x90,
    0x80, 0x84, 0x88, 0x90, 0xa0, 0x90, 0x88, 0x84,
    0x80, 0x80, 0x80, 0xbe, 0x80, 0xbe, 0x80, 0x80,
    0x80, 0x90, 0x88, 0x84, 0x82, 0x84, 0x88, 0x90,
    0x80, 0x9c, 0xa2, 0x84, 0x88, 0x88, 0x80, 0x88,
    0x00, 0x1c, 0x22, 0x2a, 0x2e, 0x2c, 0x20, 0x1e,
    0x00, 0x08, 0x14, 0x22, 0x22, 0x3e, 0x22, 0x22,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x22, 0x22, 0x3c,
    0x00, 0x1c, 0x22, 0x20, 0x20, 0x20, 0x22, 0x1c,
    0x00, 0x3c, 0x22, 0x22, 0x22, 0x22, 0x22, 0x3c,
    0x00, 0x3e, 0x20, 0x20, 0x3c, 0x20, 0x20, 0x3e,
    0x00, 0x3e, 0x20, 0x20, 0x3c, 0x20, 0x20, 0x20,
    0x00, 0x1e, 0x20, 0x20, 0x20, 0x26, 0x22, 0x1e,
    0x00, 0x22, 0x22, 0x22, 0x3e, 0x22, 0x22, 0x22,
    0x00, 0x1c, 0x08, 0x08, 0x08, 0x08, 0x08, 0x1c,
    0x00, 0x02, 0x02, 0x02, 0x02, 0x02, 0x22, 0x1c,
    0x00, 0x22, 0x24, 0x28, 0x30, 0x28, 0x24, 0x22,
    0x00, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3e,
    0x00, 0x22, 0x36, 0x2a, 0x2a, 0x22, 0x22, 0x22,
    0x00, 0x22, 0x22, 0x32, 0x2a, 0x26, 0x22, 0x22,
    0x00, 0x1c, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1c,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x20, 0x20, 0x20,
    0x00, 0x1c, 0x22, 0x22, 0x22, 0x2a, 0x24, 0x1a,
    0x00, 0x3c, 0x22, 0x22, 0x3c, 0x28, 0x24, 0x22,
    0x00, 0x1c, 0x22, 0x20, 0x1c, 0x02, 0x22, 0x1c,
    0x00, 0x3e, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08,
    0x00, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1c,
    0x00, 0x22, 0x22, 0x22, 0x22, 0x22, 0x14, 0x08,
    0x00, 0x22, 0x22, 0x22, 0x2a, 0x2a, 0x36, 0x22,
    0x00, 0x22, 0x22, 0x14, 0x08, 0x14, 0x22, 0x22,
    0x00, 0x22, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08,
    0x00, 0x3e, 0x02, 0x04, 0x08, 0x10, 0x20, 0x3e,
    0x00, 0x3e, 0x30, 0x30, 0x30, 0x30, 0x30, 0x3e,
    0x00, 0x00, 0x20, 0x10, 0x08, 0x04, 0x02, 0x00,
    0x00, 0x3e, 0x06, 0x06, 0x06, 0x06, 0x06, 0x3e,
    0x00, 0x00, 0x00, 0x08, 0x14, 0x22, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3e,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08,
    0x00, 0x14, 0x14, 0x14, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x14, 0x14, 0x3e, 0x14, 0x3e, 0x14, 0x14,
    0x00, 0x08, 0x1e, 0x28, 0x1c, 0x0a, 0x3c, 0x08,
    0x00, 0x30, 0x32, 0x04, 0x08, 0x10, 0x26, 0x06,
    0x00, 0x10, 0x28, 0x28, 0x10, 0x2a, 0x24, 0x1a,
    0x00, 0x08, 0x08, 0x08, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x08, 0x10, 0x20, 0x20, 0x20, 0x10, 0x08,
    0x00, 0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08,
    0x00, 0x08, 0x2a, 0x1c, 0x08, 0x1c, 0x2a, 0x08,
    0x00, 0x00, 0x08, 0x08, 0x3e, 0x08, 0x08, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x08, 0x10,
    0x00, 0x00, 0x00, 0x00, 0x3e, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x00, 0x02, 0x04, 0x08, 0x10, 0x20, 0x00,
    0x00, 0x1c, 0x22, 0x26, 0x2a, 0x32, 0x22, 0x1c,
    0x00, 0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1c,
    0x00, 0x1c, 0x22, 0x02, 0x0c, 0x10, 0x20, 0x3e,
    0x00, 0x3e, 0x02, 0x04, 0x0c, 0x02, 0x22, 0x1c,
    0x00, 0x04, 0x0c, 0x14, 0x24, 0x3e, 0x04, 0x04,
    0x00, 0x3e, 0x20, 0x3c, 0x02, 0x02, 0x22, 0x1c,
    0x00, 0x0e, 0x10, 0x20, 0x3c, 0x22, 0x22, 0x1c,
    0x00, 0x3e, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10,
    0x00, 0x1c, 0x22, 0x22, 0x1c, 0x22, 0x22, 0x1c,
    0x00, 0x1c, 0x22, 0x22, 0x1e, 0x02, 0x04, 0x38,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x08, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x08, 0x00, 0x08, 0x08, 0x10,
    0x00, 0x04, 0x08, 0x10, 0x20, 0x10, 0x08, 0x04,
    0x00, 0x00, 0x00, 0x3e, 0x00, 0x3e, 0x00, 0x00,
    0x00, 0x10, 0x08, 0x04, 0x02, 0x04, 0x08, 0x10,
    0x00, 0x1c, 0x22, 0x04, 0x08, 0x08, 0x00, 0x08,
    0x80, 0x9c, 0xa2, 0xaa, 0xae, 0xac, 0xa0, 0x9e,
    0x80, 0x88, 0x94, 0xa2, 0xa2, 0xbe, 0xa2, 0xa2,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa2, 0xa2, 0xbc,
    0x80, 0x9c, 0xa2, 0xa0, 0xa0, 0xa0, 0xa2, 0x9c,
    0x80, 0xbc, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xbc,
    0x80, 0xbe, 0xa0, 0xa0, 0xbc, 0xa0, 0xa0, 0xbe,
    0x80, 0xbe, 0xa0, 0xa0, 0xbc, 0xa0, 0xa0, 0xa0,
    0x80, 0x9e, 0xa0, 0xa0, 0xa0, 0xa6, 0xa2, 0x9e,
    0x80, 0xa2, 0xa2, 0xa2, 0xbe, 0xa2, 0xa2, 0xa2,
    0x80, 0x9c, 0x88, 0x88, 0x88, 0x88, 0x88, 0x9c,
    0x80, 0x82, 0x82, 0x82, 0x82, 0x82, 0xa2, 0x9c,
    0x80, 0xa2, 0xa4, 0xa8, 0xb0, 0xa8, 0xa4, 0xa2,
    0x80, 0xa0, 0xa0, 0xa0, 0xa0, 0xa0, 0xa0, 0xbe,
    0x80, 0xa2, 0xb6, 0xaa, 0xaa, 0xa2, 0xa2, 0xa2,
    0x80, 0xa2, 0xa2, 0xb2, 0xaa, 0xa6, 0xa2, 0xa2,
    0x80, 0x9c, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x9c,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa0, 0xa0, 0xa0,
    0x80, 0x9c, 0xa2, 0xa2, 0xa2, 0xaa, 0xa4, 0x9a,
    0x80, 0xbc, 0xa2, 0xa2, 0xbc, 0xa8, 0xa4, 0xa2,
    0x80, 0x9c, 0xa2, 0xa0, 0x9c, 0x82, 0xa2, 0x9c,
    0x80, 0xbe, 0x88, 0x88, 0x88, 0x88, 0x88, 0x88,
    0x80, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x9c,
    0x80, 0xa2, 0xa2, 0xa2, 0xa2, 0xa2, 0x94, 0x88,
    0x80, 0xa2, 0xa2, 0xa2, 0xaa, 0xaa, 0xb6, 0xa2,
    0x80, 0xa2, 0xa2, 0x94, 0x88, 0x94, 0xa2, 0xa2,
    0x80, 0xa2, 0xa2, 0x94, 0x88, 0x88, 0x88, 0x88,
    0x80, 0xbe, 0x82, 0x84, 0x88, 0x90, 0xa0, 0xbe,
    0x80, 0xbe, 0xb0, 0xb0, 0xb0, 0xb0, 0xb0, 0xbe,
    0x80, 0x80, 0xa0, 0x90, 0x88, 0x84, 0x82, 0x80,
    0x80, 0xbe, 0x86, 0x86, 0x86, 0x86, 0x86, 0xbe,
    0x80, 0x80, 0x80, 0x88, 0x94, 0xa2, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0xbe,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x88, 0x88, 0x88, 0x88, 0x88, 0x80, 0x88,
    0x80, 0x94, 0x94, 0x94, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x94, 0x94, 0xbe, 0x94, 0xbe, 0x94, 0x94,
    0x80, 0x88, 0x9e, 0xa8, 0x9c, 0x8a, 0xbc, 0x88,
    0x80, 0xb0, 0xb2, 0x84, 0x88, 0x90, 0xa6, 0x86,
    0x80, 0x90, 0xa8, 0xa8, 0x90, 0xaa, 0xa4, 0x9a,
    0x80, 0x88, 0x88, 0x88, 0x80, 0x80, 0x80, 0x80,
    0x80, 0x88, 0x90, 0xa0, 0xa0, 0xa0, 0x90, 0x88,
    0x80, 0x88, 0x84, 0x82, 0x82, 0x82, 0x84, 0x88,
    0x80, 0x88, 0xaa, 0x9c, 0x88, 0x9c, 0xaa, 0x88,
    0x80, 0x80, 0x88, 0x88, 0xbe, 0x88, 0x88, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x88, 0x88, 0x90,
    0x80, 0x80, 0x80, 0x80, 0xbe, 0x80, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x88,
    0x80, 0x80, 0x82, 0x84, 0x88, 0x90, 0xa0, 0x80,
    0x80, 0x9c, 0xa2, 0xa6, 0xaa, 0xb2, 0xa2, 0x9c,
    0x80, 0x88, 0x98, 0x88, 0x88, 0x88, 0x88, 0x9c,
    0x80, 0x9c, 0xa2, 0x82, 0x8c, 0x90, 0xa0, 0xbe,
    0x80, 0xbe, 0x82, 0x84, 0x8c, 0x82, 0xa2, 0x9c,
    0x80, 0x84, 0x8c, 0x94, 0xa4, 0xbe, 0x84, 0x84,
    0x80, 0xbe, 0xa0, 0xbc, 0x82, 0x82, 0xa2, 0x9c,
    0x80, 0x8e, 0x90, 0xa0, 0xbc, 0xa2, 0xa2, 0x9c,
    0x80, 0xbe, 0x82, 0x84, 0x88, 0x90, 0x90, 0x90,
    0x80, 0x9c, 0xa2, 0xa2, 0x9c, 0xa2, 0xa2, 0x9c,
    0x80, 0x9c, 0xa2, 0xa2, 0x9e, 0x82, 0x84, 0xb8,
    0x80, 0x80, 0x80, 0x88, 0x80, 0x88, 0x80, 0x80,
    0x80, 0x80, 0x80, 0x88, 0x80, 0x88, 0x88, 0x90,
    0x80, 0x84, 0x88, 0x90, 0xa0, 0x90, 0x88, 0x84,
    0x80, 0x80, 0x80, 0xbe, 0x80, 0xbe, 0x80, 0x80,
    0x80, 0x90, 0x88, 0x84, 0x82, 0x84, 0x88, 0x90,
    0x80, 0x9c, 0xa2, 0x84, 0x88, 0x88, 0x80, 0x88
];
// public domain ROM (http://a2go.applearchives.com/roms/)
const APPLEIIGO_LZG = `TFpHAAAwAAAABYxwdy2NARUZHjRBUFBMRUlJR08gUk9NMS4wADQfNB80HzQfNB80HzQfNB80HDQGIADgGR97GR+uNB80Hxk/azQfNB8ZP2UZH4s0HzQfNB80HzQfNB80HzQfNB80HzQfNB80HTQPoCA0HCAgoBkOKAEQEAwFEw8GFCAODxQgARYBCQwBAgwFGRAoxs/SoM3P0sWgyc4eA83B1MnPzqDQzMXB08Wgw8zJw8ugHgigGQgo1MjFoMHQHhnJycfPoMzPNIHCxczP1x4cNAoZHvhMA+AgWPyiJ70A352ABMoQ9x4DMN+dAAUewx5OGQUDYB4DBh7DkB4ZBx4DTEDgNEEZP7s0HzQfNB80HzQfNB80HzQfNB80HzQfNB80HzQfNB80HzQfNB80HzQfNB80HjQYyc6w7snJkOrJzPDm0OjqNAtISikDCQSFKWgpGJACaX+FKAoKBSiFKGAZHnQApSUgwftlIBkdSzQVpSJIICT8pSiFKqUphSukIYhoaQHFI7ANHk6xKJEqiBD5MOGgACCe/LCGpCSpoJEoyMQhkPkZHsc0G6QksShIKT8JQJEoaGw4GRMbIAz9IKX7NKHJm/DzGRyNNAYgjv2lMyDt/aIBivDzyiA1/cmV0AKxKMngkAIp350AAsmN0LIgnPypjdBbpD2mPB4nIED5oACprUzt/RlfdjQfNB80HzQfNB80HzQfNB80HzQfNB80HjQFqQCFHKXmhRugAIQapRyRGiB+9MjQ9uYbpRspH9DuYIXihuCE4UgpwIUmSkoFJoUmaIUnCgoKJic0QmYmpScpHwXmhSeKwADwBaAjaQTI6Qew+4Tlqr259IUwmEql5IUcsBUcACM0BArJwBAGpRxJf4UcGf7aNB80HzQfNB80HzQfNBw0CkoIIEf4KKkPkAJp4IUusSZFMCUuUSaRJmAgAPjELLARyCAO+JD2aQFIHghoxS2Q9WCgL9ACoCeELaAnqQCFMCAo+IgQ9mAVBQR+JxUGBH4mCgoZgjRgpTAYaQMpD4UwCjQBBTCFMBln35AESjQBKQ8Za/CoSpAJarAQyaLwDCmHSqq9YvkgefjQBKCAqQCqvab5hS4pA4UvmCmPqpigA+CK8AtKkAhKSgkgiND6yIjQ8hmfOzQfNB80FNgghP4gL/sgk/4gif6tWMCtWsCtXcCtX8Ct/88sEMDYIDr/IGD7qQCFAKnGhQFsGR5vNB0VAxNs3dvHzxkKDa1wwKAA6uq9ZMAQBMjQ+IhgqQCFSK1WwK1UwK1RwKkA8AutUMCtU8AgNvipFIUiHhYgqSiFIakYhSOpF4UlTCL8IFj8oAm5CPuZDgSI0PdgrfMDSaWN9ANgyY3QGKwAwBATwJPQDywQwB5E+8CD8AMeBEz9+xUdB/gVEAf4yYfQEqlAIKj8oMCpDDTBrTDAiND1YKQkkSjmJKUkxSGwZmDJoLDvqBDsyY3wWsmKNGGI0MnGJBDopSGFJMYkpSLFJbALxiUVHAf4AEggJPwgnvygAGhpAMUjkPCwyqUihSWgAIQk8OSpAIUk5h4+HhC2xiUVHQf4FQYH+DhI6QHQ/Gg0gfZg5kLQAuZDpTzFPqU95T/mPB4GPRl99BUcB/jmTtAC5k8sAMAQ9ZEorQDALBDAYBUKB/j+YKUySKn/hTK9AAIg7f1oHoHJiPAdyZjwCuD4kAMgOv/o0BOp3B4VFQoH+P4VHgf4NBsASBmiWCDl/WgpDwmwybqQAmkGbDYAyaCQAiUyhDVIIHj7aKQ1GTEvQBkKBRkLGLE8kUIgtPyQ9xm+YTQBoD/QAqD/hDIZYlI+ojigG9AIHoI2oPClPikP8AYJwKAA8AKp/ZQAlQFg6upMFR8eQzQHqYdM7f2lSEilRaZGpEcZbhYZ34Q0GzQB9QP7A2L6Yvo=`;
///
/// Disk II
///
const NUM_DRIVES = 2;
const NUM_TRACKS = 35;
const TRACK_SIZE = 0x1880;
const SECTOR_SIZE = 383;
const DISKII_PROM = [
    0xA2, 0x20, 0xA0, 0x00, 0xA2, 0x03, 0x86, 0x3C, 0x8A, 0x0A, 0x24, 0x3C, 0xF0, 0x10, 0x05, 0x3C,
    0x49, 0xFF, 0x29, 0x7E, 0xB0, 0x08, 0x4A, 0xD0, 0xFB, 0x98, 0x9D, 0x56, 0x03, 0xC8, 0xE8, 0x10,
    0xE5, 0x20, 0x58, 0xFF, 0xBA, 0xBD, 0x00, 0x01, 0x0A, 0x0A, 0x0A, 0x0A, 0x85, 0x2B, 0xAA, 0xBD,
    0x8E, 0xC0, 0xBD, 0x8C, 0xC0, 0xBD, 0x8A, 0xC0, 0xBD, 0x89, 0xC0, 0xA0, 0x50, 0xBD, 0x80, 0xC0,
    0x98, 0x29, 0x03, 0x0A, 0x05, 0x2B, 0xAA, 0xBD, 0x81, 0xC0, 0xA9, 0x56,
    /*0x20,0xA8,0xFC,*/ 0xa9, 0x00, 0xea, 0x88,
    0x10, 0xEB, 0x85, 0x26, 0x85, 0x3D, 0x85, 0x41, 0xA9, 0x08, 0x85, 0x27, 0x18, 0x08, 0xBD, 0x8C,
    0xC0, 0x10, 0xFB, 0x49, 0xD5, 0xD0, 0xF7, 0xBD, 0x8C, 0xC0, 0x10, 0xFB, 0xC9, 0xAA, 0xD0, 0xF3,
    0xEA, 0xBD, 0x8C, 0xC0, 0x10, 0xFB, 0xC9, 0x96, 0xF0, 0x09, 0x28, 0x90, 0xDF, 0x49, 0xAD, 0xF0,
    0x25, 0xD0, 0xD9, 0xA0, 0x03, 0x85, 0x40, 0xBD, 0x8C, 0xC0, 0x10, 0xFB, 0x2A, 0x85, 0x3C, 0xBD,
    0x8C, 0xC0, 0x10, 0xFB, 0x25, 0x3C, 0x88, 0xD0, 0xEC, 0x28, 0xC5, 0x3D, 0xD0, 0xBE, 0xA5, 0x40,
    0xC5, 0x41, 0xD0, 0xB8, 0xB0, 0xB7, 0xA0, 0x56, 0x84, 0x3C, 0xBC, 0x8C, 0xC0, 0x10, 0xFB, 0x59,
    0xD6, 0x02, 0xA4, 0x3C, 0x88, 0x99, 0x00, 0x03, 0xD0, 0xEE, 0x84, 0x3C, 0xBC, 0x8C, 0xC0, 0x10,
    0xFB, 0x59, 0xD6, 0x02, 0xA4, 0x3C, 0x91, 0x26, 0xC8, 0xD0, 0xEF, 0xBC, 0x8C, 0xC0, 0x10, 0xFB,
    0x59, 0xD6, 0x02, 0xD0, 0x87, 0xA0, 0x00, 0xA2, 0x56, 0xCA, 0x30, 0xFB, 0xB1, 0x26, 0x5E, 0x00,
    0x03, 0x2A, 0x5E, 0x00, 0x03, 0x2A, 0x91, 0x26, 0xC8, 0xD0, 0xEE, 0xE6, 0x27, 0xE6, 0x3D, 0xA5,
    0x3D, 0xCD, 0x00, 0x08, 0xA6, 0x2B, 0x90, 0xDB, 0x4C, 0x01, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00
];
class DiskIIState {
    constructor() {
        this.track = 0;
        this.read_mode = true;
        this.write_protect = false;
        this.motor = false;
        this.track_index = 0;
    }
}
class DiskII extends DiskIIState {
    constructor(emu, image) {
        super();
        this.emu = emu;
        this.data = new Array(NUM_TRACKS);
        for (var i = 0; i < NUM_TRACKS; i++) {
            var ofs = i * 16 * 256;
            this.data[i] = nibblizeTrack(254, i, image.slice(ofs, ofs + 16 * 256));
        }
    }
    saveState() {
        var s = {
            data: new Array(NUM_TRACKS),
            track: this.track,
            read_mode: this.read_mode,
            write_protect: this.write_protect,
            motor: this.motor,
            track_index: this.track_index
        };
        for (var i = 0; i < NUM_TRACKS; i++)
            s.data[i] = this.data[i].slice(0);
        return s;
    }
    loadState(s) {
        for (var i = 0; i < NUM_TRACKS; i++)
            this.data[i].set(s.data[i]);
        this.track = s.track;
        this.read_mode = s.read_mode;
        this.write_protect = s.write_protect;
        this.motor = s.motor;
        this.track_index = s.track_index;
        if ((this.track & 1) == 0)
            this.track_data = this.data[this.track >> 1];
        else
            this.track_data = null;
    }
    toLongString() {
        return "Track:  " + (this.track / 2) +
            "\nOffset: " + (this.track_index) +
            "\nMode:   " + (this.read_mode ? "READ" : "WRITE") +
            "\nMotor:  " + this.motor +
            "\nData:   " + (this.track_data ? (0, util_1.hex)(this.track_data[this.track_index]) : '-') +
            "\n";
    }
    read_latch() {
        this.track_index = (this.track_index + 1) % TRACK_SIZE;
        if (this.track_data) {
            return (this.track_data[this.track_index] & 0xff);
        }
        else
            return this.emu.floatbus() | 0x80;
    }
    write_latch(value) {
        this.track_index = (this.track_index + 1) % TRACK_SIZE;
        if (this.track_data != null)
            this.track_data[this.track_index] = value;
    }
    readROM(address) { return DISKII_PROM[address]; }
    readConst(address) { return DISKII_PROM[address]; }
    read(address) { return this.doIO(address, 0); }
    write(address, value) { this.doIO(address, value); }
    doIO(address, value) {
        switch (address & 0x0f) {
            /*
             * Turn motor phases 0 to 3 on.  Turning on the previous phase + 1
             * increments the track position, turning on the previous phase - 1
             * decrements the track position.  In this scheme phase 0 and 3 are
             * considered to be adjacent.  The previous phase number can be
             * computed as the track number % 4.
             */
            case 0x1:
            case 0x3:
            case 0x5:
            case 0x7:
                var phase, lastphase, new_track;
                new_track = this.track;
                phase = (address >> 1) & 3;
                // if new phase is even and current phase is odd
                if (phase == ((new_track - 1) & 3)) {
                    if (new_track > 0)
                        new_track--;
                }
                else if (phase == ((new_track + 1) & 3)) {
                    if (new_track < NUM_TRACKS * 2 - 1)
                        new_track++;
                }
                if ((new_track & 1) == 0) {
                    this.track_data = this.data[new_track >> 1];
                    console.log('track', new_track / 2);
                }
                else
                    this.track_data = null;
                this.track = new_track;
                break;
            /*
             * Turn drive motor off.
             */
            case 0x8:
                this.motor = false;
                break;
            /*
             * Turn drive motor on.
             */
            case 0x9:
                this.motor = true;
                break;
            /*
             * Select drive 1.
             */
            case 0xa:
                //drive = 0;
                break;
            /*
             * Select drive 2.
             */
            case 0xb:
                //drive = 1;
                break;
            /*
             * Select write mode.
             */
            case 0xf:
                this.read_mode = false;
            /*
             * Read a disk byte if read mode is active.
             */
            case 0xC:
                if (this.read_mode)
                    return this.read_latch();
                break;
            /*
             * Select read mode and read the write protect status.
             */
            case 0xE:
                this.read_mode = true;
            /*
             * Write a disk byte if write mode is active and the disk is not
             * write protected.
             */
            case 0xD:
                if (value >= 0 && !this.read_mode && !this.write_protect)
                    this.write_latch(value);
                /*
                 * Read the write protect status only.
                 */
                return this.write_protect ? 0x80 : 0x00;
        }
        return this.emu.floatbus();
    }
}
/* --------------- TRACK CONVERSION ROUTINES ---------------------- */
/*
 * Normal byte (lower six bits only) -> disk byte translation table.
 */
const byte_translation = [
    0x96, 0x97, 0x9a, 0x9b, 0x9d, 0x9e, 0x9f, 0xa6,
    0xa7, 0xab, 0xac, 0xad, 0xae, 0xaf, 0xb2, 0xb3,
    0xb4, 0xb5, 0xb6, 0xb7, 0xb9, 0xba, 0xbb, 0xbc,
    0xbd, 0xbe, 0xbf, 0xcb, 0xcd, 0xce, 0xcf, 0xd3,
    0xd6, 0xd7, 0xd9, 0xda, 0xdb, 0xdc, 0xdd, 0xde,
    0xdf, 0xe5, 0xe6, 0xe7, 0xe9, 0xea, 0xeb, 0xec,
    0xed, 0xee, 0xef, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6,
    0xf7, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff
];
/*
 * Sector skewing table.
 */
const skewing_table = [
    0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15
];
/*
 * Encode a 256-byte sector as SECTOR_SIZE disk bytes as follows:
 *
 *   14 sync bytes
 *   3 address header bytes
 *   8 address block bytes
 *   3 address trailer bytes
 *   6 sync bytes
 *   3 data header bytes
 * 343 data block bytes
 *   3 data trailer bytes
 */
function nibblizeSector(vol, trk, sector, inn, in_ofs, out, i) {
    var loop, checksum, prev_value, value;
    var sector_buffer = new Uint8Array(258);
    value = 0;
    /*
     * Step 1: write 6 sync bytes (0xff's).  Normally these would be
     * written as 10-bit bytes with two extra zero bits, but for the
     * purpose of emulation normal 8-bit bytes will do, since the
     * emulated drive will always be in sync.
     */
    for (loop = 0; loop < 14; loop++)
        out[i++] = 0xff;
    /*
     * Step 2: write the 3-byte address header (0xd5 0xaa 0x96).
     */
    out[i++] = 0xd5;
    out[i++] = 0xaa;
    out[i++] = 0x96;
    /*
     * Step 3: write the address block.  Use 4-and-4 encoding to convert
     * the volume, track and sector and checksum into 2 disk bytes each.
     * The checksum is a simple exclusive OR of the first three values.
     */
    out[i++] = ((vol >> 1) | 0xaa);
    out[i++] = (vol | 0xaa);
    checksum = vol;
    out[i++] = ((trk >> 1) | 0xaa);
    out[i++] = (trk | 0xaa);
    checksum ^= trk;
    out[i++] = ((sector >> 1) | 0xaa);
    out[i++] = (sector | 0xaa);
    checksum ^= sector;
    out[i++] = ((checksum >> 1) | 0xaa);
    out[i++] = (checksum | 0xaa);
    /*
     * Step 4: write the 3-byte address trailer (0xde 0xaa 0xeb).
     */
    out[i++] = (0xde);
    out[i++] = (0xaa);
    out[i++] = (0xeb);
    /*
     * Step 5: write another 6 sync bytes.
     */
    for (loop = 0; loop < 6; loop++)
        out[i++] = (0xff);
    /*
     * Step 6: write the 3-byte data header.
     */
    out[i++] = (0xd5);
    out[i++] = (0xaa);
    out[i++] = (0xad);
    /*
     * Step 7: read the next 256-byte sector from the old disk image file,
     * and add two zero bytes to bring the number of bytes up to a multiple
     * of 3.
     */
    for (loop = 0; loop < 256; loop++)
        sector_buffer[loop] = inn[loop + in_ofs] & 0xff;
    sector_buffer[256] = 0;
    sector_buffer[257] = 0;
    /*
     * Step 8: write the first 86 disk bytes of the data block, which
     * encodes the bottom two bits of each sector byte into six-bit
     * values as follows:
     *
     * disk byte n, bit 0 = sector byte n,       bit 1
     * disk byte n, bit 1 = sector byte n,       bit 0
     * disk byte n, bit 2 = sector byte n +  86, bit 1
     * disk byte n, bit 3 = sector byte n +  86, bit 0
     * disk byte n, bit 4 = sector byte n + 172, bit 1
     * disk byte n, bit 5 = sector byte n + 172, bit 0
     *
     * The scheme allows each pair of bits to be shifted to the right out
     * of the disk byte, then shifted to the left into the sector byte.
     *
     * Before the 6-bit value is translated to a disk byte, it is exclusive
     * ORed with the previous 6-bit value, hence the values written are
     * really a running checksum.
     */
    prev_value = 0;
    for (loop = 0; loop < 86; loop++) {
        value = (sector_buffer[loop] & 0x01) << 1;
        value |= (sector_buffer[loop] & 0x02) >> 1;
        value |= (sector_buffer[loop + 86] & 0x01) << 3;
        value |= (sector_buffer[loop + 86] & 0x02) << 1;
        value |= (sector_buffer[loop + 172] & 0x01) << 5;
        value |= (sector_buffer[loop + 172] & 0x02) << 3;
        out[i++] = (byte_translation[value ^ prev_value]);
        prev_value = value;
    }
    /*
     * Step 9: write the last 256 disk bytes of the data block, which
     * encodes the top six bits of each sector byte.  Again, each value
     * is exclusive ORed with the previous value to create a running
     * checksum (the first value is exclusive ORed with the last value of
     * the previous step).
     */
    for (loop = 0; loop < 256; loop++) {
        value = (sector_buffer[loop] >> 2);
        out[i++] = (byte_translation[value ^ prev_value]);
        prev_value = value;
    }
    /*
     * Step 10: write the last value as the checksum.
     */
    out[i++] = (byte_translation[value]);
    /*
     * Step 11: write the 3-byte data trailer.
     */
    out[i++] = (0xde);
    out[i++] = (0xaa);
    out[i++] = (0xeb);
}
function nibblizeTrack(vol, trk, inn) {
    var out = new Uint8Array(TRACK_SIZE);
    var out_pos = 0;
    for (var sector = 0; sector < 16; sector++) {
        nibblizeSector(vol, trk, sector, inn, skewing_table[sector] << 8, out, out_pos);
        out_pos += SECTOR_SIZE;
    }
    while (out_pos < TRACK_SIZE)
        out[out_pos++] = (0xff);
    return out;
}
//# sourceMappingURL=apple2.js.map