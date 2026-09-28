import net from 'node:net';
import tls from 'node:tls';

function conversation(socket){
  let pending,current=[],buffer='';
  const onData=chunk=>{buffer+=chunk.toString('utf8');let end;while((end=buffer.indexOf('\n'))!==-1){const raw=buffer.slice(0,end).replace(/\r$/,'');buffer=buffer.slice(end+1);if(!raw)continue;current.push(raw);if(/^\d{3} /.test(raw)&&pending){const done=pending;pending=null;const lines=current;current=[];done.resolve({code:Number(raw.slice(0,3)),lines})}}};
  const onError=error=>{if(pending){pending.reject(error);pending=null}};
  socket.on('data',onData);socket.on('error',onError);
  return {wait:()=>new Promise((resolve,reject)=>{pending={resolve,reject}}),close:()=>{socket.off('data',onData);socket.off('error',onError)}};
}
function expect(reply,codes){if(!codes.includes(reply.code))throw Error(`SMTP rejected request (${reply.code}): ${reply.lines.at(-1)}`)}
function openSocket(options){return new Promise((resolve,reject)=>{const socket=net.createConnection({host:options.host,port:options.port});socket.once('connect',()=>resolve(socket));socket.once('error',reject)})}
function secureSocket(socket,host){return new Promise((resolve,reject)=>{const upgraded=tls.connect({socket,servername:host},()=>resolve(upgraded));upgraded.once('error',reject)})}
async function send(socket,chat,text){const response=chat.wait();socket.write(text+'\r\n');return response}

export async function sendSmtpMail({host,port=587,secure=false,user,password,from,to,subject,text}){
  if(!host||!user||!password||!from)throw Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM.');
  let socket=secure?await new Promise((resolve,reject)=>{const s=tls.connect({host,port,servername:host},()=>resolve(s));s.once('error',reject)}):await openSocket({host,port});
  let chat=conversation(socket);
  try{
    expect(await chat.wait(),[220]);
    expect(await send(socket,chat,'EHLO form-fitness'),[250]);
    if(!secure){
      expect(await send(socket,chat,'STARTTLS'),[220]);
      chat.close();socket=await secureSocket(socket,host);chat=conversation(socket);
      expect(await send(socket,chat,'EHLO form-fitness'),[250]);
    }
    const auth=Buffer.from(`\0${user}\0${password}`).toString('base64');
    expect(await send(socket,chat,`AUTH PLAIN ${auth}`),[235]);
    expect(await send(socket,chat,`MAIL FROM:<${from}>`),[250]);
    expect(await send(socket,chat,`RCPT TO:<${to}>`),[250,251]);
    expect(await send(socket,chat,'DATA'),[354]);
    const safeText=text.replace(/\r?\n/g,'\r\n').replace(/^\./gm,'..');
    expect(await send(socket,chat,`From: FORM Fitness <${from}>\r\nTo: <${to}>\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${safeText}\r\n.`),[250]);
    await send(socket,chat,'QUIT').catch(()=>{});
  }finally{chat.close();socket.destroy()}
}
