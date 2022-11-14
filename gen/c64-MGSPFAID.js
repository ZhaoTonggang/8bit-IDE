import{a as M}from"./chunk-7BAKXSVO.js";import{B as S,I as _,r as g,y as b}from"./chunk-YLYWUMYM.js";import{J as n,O as a,U as p,a as l,g as o,u as x}from"./chunk-ATS7PSQG.js";import"./chunk-5XVCUSSZ.js";var d=class extends g{constructor(){super(...arguments);this.numTotalScanlines=312;this.cpuCyclesPerLine=63;this.joymask0=0;this.joymask1=0;this.lightpen_x=0;this.lightpen_y=0}loadBIOS(e){var s=59940-57344+12288;e[s]=96,super.loadBIOS(e)}reset(){super.reset();for(var e=0;e<128;e++)this.exports.machine_key_up(this.sys,e);if(this.romptr&&this.romlen)if(this.exports.machine_load_rom(this.sys,this.romptr,this.romlen),this.prgstart=this.romarr[0]+(this.romarr[1]<<8),this.prgstart==2049&&(this.prgstart=this.romarr[2]+(this.romarr[3]<<8)+2,console.log("prgstart",o(this.prgstart))),this.prgstart<32768){this.exports.machine_exec(this.sys,25e4);for(var s="\rSYS "+this.prgstart+"\r",t=0;t<s.length;t++){var i=s.charCodeAt(t);this.exports.machine_exec(this.sys,2e4),this.exports.machine_key_down(this.sys,i),this.exports.machine_exec(this.sys,5e3),this.exports.machine_key_up(this.sys,i)}for(var t=0;t<1e5&&this.getPC()!=this.prgstart;t++)this.exports.machine_tick(this.sys)}else{this.exports.machine_exec(this.sys,100);for(var r=this.romarr[4]+this.romarr[5]*256,t=0;t<15e4&&this.getPC()!=r;t++)this.exports.machine_tick(this.sys)}}advanceFrame(e){var s=this.getRasterY(),t=Math.floor((this.numTotalScanlines-s)*19656/this.numTotalScanlines),i=this.probe!=null;return i&&this.exports.machine_reset_probe_buffer(),t=super.advanceFrameClock(e,t),i&&this.copyProbeData(),t}getCPUState(){this.exports.machine_save_cpu_state(this.sys,this.cpustateptr);var e=this.cpustatearr,s=e[2]+(e[3]<<8);return{PC:s,SP:e[9],A:e[6],X:e[7],Y:e[8],C:e[10]&1,Z:e[10]&2,I:e[10]&4,D:e[10]&8,V:e[10]&64,N:e[10]&128,o:this.readConst(s),R:e[19]!=55}}saveState(){this.exports.machine_save_state(this.sys,this.stateptr);let e=this.getDebugStateOffset(1),s=this.getDebugStateOffset(2),t=this.getDebugStateOffset(3),i=this.getDebugStateOffset(4),r=this.getDebugStateOffset(5),c=this.getDebugStateOffset(9);return{c:this.getCPUState(),state:this.statearr.slice(0),ram:this.statearr.slice(r,r+65536),cia1:this.statearr.slice(e,e+64),cia2:this.statearr.slice(s,s+64),vic:this.statearr.slice(t+1,t+1+64),sid:this.statearr.slice(i,i+32),pla:this.statearr.slice(c,c+16)}}loadState(e){this.statearr.set(e.state),this.exports.machine_load_state(this.sys,this.stateptr)}getVideoParams(){return{width:392,height:272,overscan:!0,videoFrequency:50,aspect:392/272*.9365}}setKeyInput(e,s,t){if(!(e==16||e==17||e==18||e==224)){var i=0,r=0;switch(e){case 32:i=16;break;case 37:e=8,i=4;break;case 38:e=11,i=1;break;case 39:e=9,i=8;break;case 40:e=10,i=2;break;case 113:e=241;break;case 115:e=243;break;case 119:e=245;break;case 121:e=247;break;case 188:e=t&a.Shift?60:46;break;case 190:e=t&a.Shift?62:44;break;case 191:e=t&a.Shift?63:47;break;case 222:e=t&a.Shift?34:39;break;case 219:e=t&a.Shift?123:91;break;case 221:e=t&a.Shift?125:93;break;case 48:t&a.Shift&&(e=41);break;case 49:t&a.Shift&&(e=33);break;case 50:t&a.Shift&&(e=64);break;case 51:t&a.Shift&&(e=35);break;case 52:t&a.Shift&&(e=36);break;case 53:t&a.Shift&&(e=37);break;case 54:t&a.Shift&&(e=94);break;case 55:t&a.Shift&&(e=38);break;case 56:t&a.Shift&&(e=42);break;case 57:t&a.Shift&&(e=40);break;case 59:t&a.Shift&&(e=58);break;case 61:t&a.Shift&&(e=43);break;case 173:e=t&a.Shift?95:45;break}t&a.KeyDown?(this.exports.machine_key_down(this.sys,e),this.joymask0|=i,this.joymask1|=r):t&a.KeyUp&&(this.exports.machine_key_up(this.sys,e),this.joymask0&=~i,this.joymask1&=~r),this.exports.c64_joystick(this.sys,this.joymask0,this.joymask1)}}getRasterY(){return this.exports.machine_get_raster_line(this.sys)}getDebugStateOffset(e){var s=this.exports.machine_get_debug_pointer(this.sys,e);return s-this.sys}getDebugCategories(){return["CPU","ZPRAM","Stack","PLA","CIA","VIC","SID"]}getDebugInfo(e,s){switch(e){case"PLA":{let t="",i=s.pla[0],r=s.pla[3];return t+=`$0000 - $9FFF  RAM
`,t+=`$A000 - $BFFF  ${(r&3)==3?"BASIC ROM":"RAM"}
`,t+=`$C000 - $CFFF  RAM
`,t+=`$D000 - $DFFF  ${i?"I/O":(r&3)!=0?"CHAR ROM":"RAM"}
`,t+=`$E000 - $FFFF  ${(r&2)==2?"KERNAL ROM":"RAM"}
`,t}case"CIA":{let t="";for(let i=0;i<2;i++){let r=i?s.cia2:s.cia1;t+=`CIA ${i+1}
`,t+=` A: Data ${o(r[0])}  DDR ${o(r[1])}  Input ${o(r[2])}`,t+=`  Timer ${o(r[10]+r[11]*256,4)}
`,t+=` B: Data ${o(r[4])}  DDR ${o(r[5])}  Input ${o(r[6])}`,t+=`  Timer ${o(r[10+10]+r[11+10]*256,4)}
`}return t}case"VIC":{let t=s.vic,i="",r=(s.cia2[0]&3^3)*16384,c=r+(s.vic[24]&14)*1024,m=r+(s.vic[24]>>4)*1024,h=s.vic[17]&32,R=(s.cia2[0]&1)==1&&(s.vic[24]&12)==4,y=s.state[244],$=this.getRasterY();return i+="Mode:",s.vic[17]&32?i+=" BITMAP":i+=" CHAR",s.vic[22]&16&&(i+=" MULTICOLOR"),s.vic[17]&64&&(i+=" EXTENDED"),i+=`
`,i+=`Raster: (${l(y,3)}, ${l($,3)})     `,i+=`Scroll: (${s.vic[22]&7}, ${s.vic[17]&7})`,i+=`
`,i+=`VIC Bank: $${o(r,4)}   Scrn: $${o(m,4)}   `,h?i+=`Bitmap: $${o(c&57344,4)}`:R?i+=`Char: ROM $${o(c,4)}`:i+=`Char: $${o(c,4)}`,i+=`
`,i+=p(t,53248,64),i}case"SID":{let t=s.sid,i="";return i+=p(t,54272,32),i}}}setPaddleInput(e,s){e==0&&(this.lightpen_x=s),e==1&&(this.lightpen_y=s);let t=22,i=36,r=228,c=220,m=x(0,255,(this.lightpen_x-t)/(r-t)*160+24),h=x(0,255,(this.lightpen_y-i)/(c-i)*200+50);this.exports.machine_set_mouse(this.sys,m,h)}};var v=[{id:"hello.dasm",name:"Hello World (ASM)"},{id:"23matches.c",name:"23 Matches"},{id:"tgidemo.c",name:"TGI Graphics Demo"},{id:"upandaway.c",name:"Up, Up and Away"},{id:"siegegame.c",name:"Siege Game"},{id:"joymove.c",name:"Sprite Movement"},{id:"sprite_collision.c",name:"Sprite Collision"},{id:"scroll1.c",name:"Scrolling (Single Buffer)"},{id:"scroll2.c",name:"Scrolling (Double Buffer)"},{id:"scroll3.c",name:"Scrolling (Multidirectional)"},{id:"scroll4.c",name:"Scrolling (Color RAM Buffering)"},{id:"scroll5.c",name:"Scrolling (Camera Following)"},{id:"side_scroller.c",name:"Side-Scrolling Game"},{id:"fullscrollgame.c",name:"Full-Scrolling Game"},{id:"test_multiplex.c",name:"Sprite Retriggering"},{id:"test_multispritelib.c",name:"Sprite Multiplexing Library"},{id:"scrolling_text.c",name:"Big Scrolling Text"},{id:"mcbitmap.c",name:"Multicolor Bitmap Mode"},{id:"musicplayer.c",name:"Music Player"},{id:"siddemo.c",name:"SID Player Demo"},{id:"climber.c",name:"Climber Game"}],C={main:[{name:"6510 Registers",start:0,size:2,type:"io"},{name:"BIOS Reserved",start:512,size:167},{name:"Default Screen RAM",start:1024,size:1024,type:"ram"},{name:"Cartridge ROM",start:32768,size:8192,type:"rom"},{name:"BASIC ROM",start:40960,size:8192,type:"rom"},{name:"Upper RAM",start:49152,size:4096,type:"ram"},{name:"Character ROM",start:53248,size:4096,type:"rom"},{name:"VIC-II I/O",start:53248,size:1024,type:"io"},{name:"SID",start:54272,size:1024,type:"io"},{name:"Color RAM",start:55296,size:1024,type:"io"},{name:"CIA 1",start:56320,size:256,type:"io"},{name:"CIA 2",start:56576,size:256,type:"io"},{name:"I/O 1",start:56832,size:256,type:"io"},{name:"I/O 2",start:57088,size:256,type:"io"},{name:"KERNAL ROM",start:57344,size:8192,type:"rom"}]},f=class extends _{newMachine(){return new d("c64")}getPresets(){return v}getDefaultExtension(){return".c"}readAddress(e){return this.machine.readConst(e)}getMemoryMap(){return C}showHelp(){return"https://8bitworkshop.com/docs/platforms/c64/"}getROMExtension(e){return e&&e[0]==1&&e[1]==8?".prg":".bin"}},A=class extends M{constructor(){super(...arguments);this.getToolForFilename=b;this.getOpcodeMetadata=S}getPresets(){return v}getDefaultExtension(){return".c"}loadROM(e,s){if(!this.started)this.startModule(this.mainElement,{jsfile:"mame8bitpc.js",biosfile:"c64.zip",cfgfile:"c64.cfg",driver:"c64",width:418,height:235,romfn:"/emulator/image.crt",romdata:new Uint8Array(s),romsize:65536,extraargs:["-autoboot_delay","5","-autoboot_command",`load "$",8,1
`],preInit:function(i){}});else{this.loadROMFile(s),this.loadRegion(":quickload",s);var t=this.luacall('image:load("/emulator/image.prg")');console.log("load rom",t)}}start(){}getMemoryMap(){return C}};n.c64=f;n["c64.wasm"]=f;n["c64.mame"]=A;
//# sourceMappingURL=c64-MGSPFAID.js.map
