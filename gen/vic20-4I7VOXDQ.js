import{a as g}from"./chunk-7BAKXSVO.js";import{B as f,I as u,r as l,y as x}from"./chunk-YLYWUMYM.js";import{J as o,O as m,g as n}from"./chunk-ATS7PSQG.js";import"./chunk-5XVCUSSZ.js";var h=class extends l{constructor(){super(...arguments);this.numTotalScanlines=312;this.cpuCyclesPerLine=71;this.videoOffsetBytes=-24*4;this.joymask0=0;this.joymask1=0}getBIOSLength(){return 20480}loadBIOS(t){super.loadBIOS(t)}reset(){super.reset();for(var t=0;t<128;t++)this.setKeyInput(t,0,m.KeyUp);if(this.romptr&&this.romlen){let a=this.romarr;if(this.exports.machine_load_rom(this.sys,this.romptr,this.romlen),a[4+2]==65&&a[5+2]==48&&a[6+2]==195&&a[7+2]==194&&a[8+2]==205){for(var i=this.romarr[2+2]+this.romarr[3+2]*256,e=0;e<1e4&&this.getPC()!=i;e++)this.exports.machine_tick(this.sys);console.log("cart",e,n(i))}else if(this.prgstart=a[0]+(a[1]<<8),this.prgstart==4097&&(this.prgstart=a[2]+(a[3]<<8)+2,console.log("prgstart",n(this.prgstart))),this.prgstart<32768){this.exports.machine_exec(this.sys,5e5);var r="SYS "+this.prgstart+"\r";console.log(r);for(var e=0;e<r.length;e++){var s=r.charCodeAt(e);this.exports.machine_exec(this.sys,1e4),this.exports.machine_exec(this.sys,1e4),this.exports.machine_key_down(this.sys,s),this.exports.machine_exec(this.sys,1e4),this.exports.machine_exec(this.sys,1e4),this.exports.machine_key_up(this.sys,s)}for(var e=0;e<1e4&&this.getPC()!=this.prgstart;e++)this.exports.machine_tick(this.sys)}}}advanceFrame(t){var r=this.getRasterY(),e=Math.floor((this.numTotalScanlines-r)*22152/this.numTotalScanlines),s=this.probe!=null;return s&&this.exports.machine_reset_probe_buffer(),e=super.advanceFrameClock(t,e),s&&this.copyProbeData(),e}getRasterY(){return this.exports.machine_get_raster_line(this.sys)}getCPUState(){this.exports.machine_save_cpu_state(this.sys,this.cpustateptr);var t=this.cpustatearr,r=t[2]+(t[3]<<8);return{PC:r,SP:t[9],A:t[6],X:t[7],Y:t[8],C:t[10]&1,Z:t[10]&2,I:t[10]&4,D:t[10]&8,V:t[10]&64,N:t[10]&128,o:this.readConst(r)}}saveState(){return this.exports.machine_save_state(this.sys,this.stateptr),{c:this.getCPUState(),state:this.statearr.slice(0),ram:this.statearr.slice(18640,18640+512)}}loadState(t){this.statearr.set(t.state),this.exports.machine_load_state(this.sys,this.stateptr)}getVideoParams(){return{width:232,height:272,overscan:!0,videoFrequency:50,aspect:1.5}}setKeyInput(t,r,e){if(!(t==16||t==17||t==18||t==224)){var s=0,i=0;t==37&&(t=8,s=4),t==38&&(t=11,s=1),t==39&&(t=9,s=8),t==40&&(t=10,s=2),t==32&&(s=16),t==113&&(t=241),t==115&&(t=243),t==119&&(t=245),t==121&&(t=247),e&m.KeyDown?(this.exports.machine_key_down(this.sys,t),this.joymask0|=s,this.joymask1|=i):e&m.KeyUp&&(this.exports.machine_key_up(this.sys,t),this.joymask0&=~s,this.joymask1&=~i),this.exports.vic20_joystick(this.sys,this.joymask0,this.joymask1)}}};var d=[{id:"hello.dasm",name:"Hello World (ASM)"},{id:"hellocart.dasm",name:"Hello Cartridge (ASM)"},{id:"siegegame.c",name:"Siege Game (C)"}],_={main:[{name:"RAM",start:0,size:1024,type:"ram"},{name:"RAM",start:4096,size:4096,type:"ram"},{name:"BLK1 Cart ROM",start:8192,size:8192,type:"rom"},{name:"BLK2 Cart ROM",start:16384,size:8192,type:"rom"},{name:"BLK3 Cart ROM",start:24576,size:8192,type:"rom"},{name:"Character ROM",start:32768,size:4096,type:"rom"},{name:"I/O 1",start:36864,size:1024,type:"io"},{name:"Color RAM",start:37888,size:1024,type:"io"},{name:"I/O 2",start:38912,size:1024,type:"io"},{name:"I/O 3",start:39936,size:1024,type:"io"},{name:"BLK5 Autostart",start:40960,size:8192,type:"rom"},{name:"BASIC ROM",start:49152,size:8192,type:"rom"},{name:"KERNAL ROM",start:57344,size:8192,type:"rom"}]},c=class extends u{newMachine(){return new h("vic20")}getPresets(){return d}getDefaultExtension(){return".c"}readAddress(t){return this.machine.readConst(t)}getMemoryMap(){return _}showHelp(){return"https://8bitworkshop.com/docs/platforms/vic20/"}getROMExtension(t){return t&&t[0]==1&&t[1]==8?".prg":".bin"}},M=class extends g{constructor(){super(...arguments);this.getToolForFilename=x;this.getOpcodeMetadata=f}getPresets(){return d}getDefaultExtension(){return".c"}loadROM(t,r){if(!this.started)this.startModule(this.mainElement,{jsfile:"mame8bitpc.js",biosfile:"vic20.zip",cfgfile:"vic20.cfg",driver:"vic20",width:418,height:235,romfn:"/emulator/image.crt",romdata:new Uint8Array(r),romsize:65536,extraargs:["-autoboot_delay","5","-autoboot_command",`load "$",8,1
`],preInit:function(s){}});else{this.loadROMFile(r),this.loadRegion(":quickload",r);var e=this.luacall('image:load("/emulator/image.prg")');console.log("load rom",e)}}start(){}getMemoryMap(){return _}};o.vic20=c;o["vic20.wasm"]=c;o["vic20.mame"]=M;
//# sourceMappingURL=vic20-4I7VOXDQ.js.map
