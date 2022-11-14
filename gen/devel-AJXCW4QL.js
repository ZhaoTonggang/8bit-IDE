import{a as d}from"./chunk-3XE5YOCV.js";import{o as c}from"./chunk-2WZPKPNM.js";import"./chunk-PP6TWFIY.js";import"./chunk-5SHCNQ2O.js";import"./chunk-33IBPQZG.js";import{I as m,o as u,t as h}from"./chunk-YLYWUMYM.js";import{$ as i,B as o,J as l,m as n}from"./chunk-ATS7PSQG.js";import"./chunk-5XVCUSSZ.js";var s=31,a=class extends u{constructor(){super();this.cpuFrequency=1e6;this.defaultROMSize=32768;this.cpu=new h;this.ram=new Uint8Array(16384);this.read=i([[0,16383,16383,e=>this.ram[e]],[16384,16384,65535,e=>this.serial.byteAvailable()?128:0],[16385,16385,65535,e=>this.serial.recvByte()],[16386,16386,65535,e=>this.serial.clearToSend()?128:0],[32768,65535,32767,e=>this.rom&&this.rom[e]]]);this.write=i([[0,16383,16383,(e,t)=>{this.ram[e]=t}],[16387,16387,65535,(e,t)=>this.serial.sendByte(t)],[16399,16399,65535,(e,t)=>{this.inputs[s]=1}]]);this.connectCPUMemoryBus(this)}connectSerialIO(e){this.serial=e}readConst(e){return this.read(e)}advanceFrame(e){for(var t=0;t<this.cpuFrequency/60&&!(e&&e());)t+=this.advanceCPU();return t}advanceCPU(){if(this.isHalted())return 1;var e=super.advanceCPU();return this.serial&&this.serial.advance(e),e}reset(){this.inputs[s]=0,super.reset(),this.serial&&this.serial.reset()}isHalted(){return this.inputs[s]!=0}};var S=[{id:"hello.dasm",name:"Hello World (ASM)"}],f=class{constructor(e){e.style.overflowY="auto";var t=$('<div id="gameport"/>').appendTo(e);$('<p class="transcript-header">Serial Output</p>').appendTo(t);var y=$('<div id="windowport" class="transcript"/>').appendTo(t);this.div=y[0]}start(){this.tty=new d(this.div,!1)}reset(){this.tty.clear()}saveState(){return this.tty.saveState()}loadState(e){this.tty.loadState(e)}};function p(r){return r==10?"":r<32?String.fromCharCode(r+9216):String.fromCharCode(r)}var v=class{constructor(){this.bufferedRead=!0;this.cyclesPerByte=1e6/(57600/8);this.maxOutputBytes=4096}clearToSend(){return this.outputBytes.length<this.maxOutputBytes}sendByte(e){this.clearToSend()&&(this.outputBytes.push(e),this.viewer.tty.addtext(p(e),2|32),e==10&&this.viewer.tty.newline(),this.clearToSend()||(this.viewer.tty.newline(),this.viewer.tty.addtext("\u26A0\uFE0F OUTPUT BUFFER FULL \u26A0\uFE0F",4)))}byteAvailable(){return this.readIndex()>this.inputIndex}recvByte(){var e=this.readIndex();this.inputIndex=e;var t=(this.inputBytes&&this.inputBytes[e])|0;return this.viewer.tty.addtext(p(t),2|16),t==10&&this.viewer.tty.newline(),t}readIndex(){return this.bufferedRead?this.inputIndex+1:Math.floor(this.clk/this.cyclesPerByte)}reset(){this.inputIndex=-1,this.clk=0,this.outputBytes=[],this.bufin=""}advance(e){this.clk+=e}saveState(){return{clk:this.clk,idx:this.inputIndex,out:this.outputBytes.slice()}}loadState(e){this.clk=e.clk,this.inputIndex=e.idx,this.outputBytes=e.out.slice()}},x=class extends m{constructor(e){super(e);this.getMemoryMap=function(){return{main:[{name:"RAM",start:0,size:16384,type:"ram"},{name:"ROM",start:32768,size:32768,type:"rom"}]}};this.serview=new f(e)}async start(){super.start(),this.serial=new v,this.serial.viewer=this.serview,this.serview.start(),this.machine.connectSerialIO(this.serial)}reset(){this.serial.inputBytes=o(this.internalFiles["serialin.dat"]),super.reset(),this.serview.reset()}isBlocked(){return this.machine.isHalted()}advance(e){return this.isBlocked()?(this.internalFiles["serialout.dat"]=n(this.serial.outputBytes),c(),0):super.advance(e)}saveState(){var e=super.saveState();return e.serial=this.serial.saveState(),e.serview=this.serview.saveState(),e}loadState(e){super.loadState(e),this.serial.loadState(e.serial),this.serview.loadState(e.serview)}newMachine(){return new a}getPresets(){return S}getDefaultExtension(){return".dasm"}readAddress(e){return this.machine.readConst(e)}};l["devel-6502"]=x;export{v as SerialTestHarness};
//# sourceMappingURL=devel-AJXCW4QL.js.map
