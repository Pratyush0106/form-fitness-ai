import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {Modal} from './shared.jsx';

function InstallApp(){
  const [open,setOpen]=useState(false),[prompt,setPrompt]=useState(null),[installed,setInstalled]=useState(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true),[apk,setApk]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const before=e=>{e.preventDefault();setPrompt(e)},done=()=>{setInstalled(true);setPrompt(null);setStatus('FORM is installed. Look for its icon on your home screen.')};
    window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);
    fetch('/api/app-download').then(r=>r.json()).then(x=>setApk(x.available)).catch(()=>{});
    if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done)};
  },[]);
  async function install(){setBusy(true);try{await prompt.prompt();const result=await prompt.userChoice;setStatus(result.outcome==='accepted'?'Installation requested. Your browser will finish adding FORM.':'Installation cancelled. You can try again later.');setPrompt(null)}catch{setStatus('Use your browser menu to install FORM.')}finally{setBusy(false)}}
  return <><button className="secondary install-launch" onClick={()=>setOpen(true)}>{installed?'App installed':'Get the app'} <span aria-hidden="true">↗</span></button>{open&&<Modal className="auth-modal" title="FORM, on your home screen" onClose={()=>setOpen(false)}><p className="muted">Keep your workouts, recipes and progress one tap away. Sign in with your existing FORM account.</p>{installed?<p className="notice">You’re using the installed app.</p>:prompt?<button className="primary auth-submit" disabled={busy} onClick={install}>Install FORM</button>:<><h3>Install from your browser</h3><p>On Android, open this website in Chrome and choose <strong>⋮ → Add to home screen → Install</strong>.</p><p>On iPhone or iPad, open it in Safari and choose <strong>Share → Add to Home Screen</strong>.</p>{!window.isSecureContext&&<p className="notice">Installation requires the website to be hosted with HTTPS.</p>}</>}<p className="footnote">An internet connection is needed for sign-in, saved data and live recipes.</p><hr/><h3>Android APK</h3>{apk?<a className="primary apk-download" href="/downloads/form-fitness.apk" download>Download Android APK</a>:<p className="muted">The APK download will be available when the Android build is published. You can use the browser install option above in the meantime.</p>}<p role="status">{status}</p></Modal>}</>;
}
function MobileNavigation(){
  const [side,setSide]=useState(null),[nav,setNav]=useState(null),[expanded,setExpanded]=useState(false),[signedIn,setSignedIn]=useState(false);
  useEffect(()=>{
    function locate(){const element=document.querySelector('.side');if(element){setSide(element);return true}return false}
    if(locate())return;
    const observer=new MutationObserver(()=>{if(locate())observer.disconnect()});observer.observe(document.getElementById('root'),{childList:true,subtree:true});return()=>observer.disconnect();
  },[]);
  useEffect(()=>{if(!side)return;const navigation=side.querySelector('nav');navigation.id='form-navigation';setNav(navigation);side.classList.add('has-mobile-menu');
    const close=event=>{if(event.target.closest('nav button'))setExpanded(false)};
    const escape=event=>{if(event.key==='Escape'){setExpanded(false);side.querySelector('.menu-toggle')?.focus()}};
    const media=matchMedia('(max-width:900px)'),resize=()=>setExpanded(false);
    side.addEventListener('click',close);side.addEventListener('keydown',escape);media.addEventListener('change',resize);
    return()=>{side.removeEventListener('click',close);side.removeEventListener('keydown',escape);media.removeEventListener('change',resize);side.classList.remove('has-mobile-menu');setNav(null)};
  },[side]);
  useEffect(()=>{side?.classList.toggle('menu-expanded',expanded);document.body.classList.toggle('mobile-menu-open',expanded);return()=>document.body.classList.remove('mobile-menu-open')},[side,expanded]);
  useEffect(()=>{
    const header=document.querySelector('.app-header');
    const update=()=>setSignedIn(![...document.querySelectorAll('.app-header button')].some(button=>/sign in/i.test(button.textContent||'')));
    update();const observer=header&&new MutationObserver(update);observer?.observe(header,{childList:true,subtree:true,characterData:true});return()=>observer?.disconnect();
  },[side]);
  const openAccount=()=>{document.querySelector('.app-header .primary')?.click();setExpanded(false)};
  return <>{side&&createPortal(<button type="button" className="menu-toggle" aria-label={expanded?'Close navigation menu':'Open navigation menu'} aria-expanded={expanded} aria-controls="form-navigation" onClick={()=>setExpanded(value=>!value)}><span className="hamburger-lines" aria-hidden="true"><i/><i/><i/></span><span>{expanded?'Close':'Menu'}</span></button>,side)}{nav&&createPortal(<div className="mobile-menu-account">{signedIn?<><span className="menu-account-kicker">FORM ACCOUNT</span><strong>Signed in to FORM</strong><p>Your training and nutrition are synced.</p></>:<><span className="menu-account-kicker">START YOUR FORM</span><strong>Train with a plan that fits you.</strong><p>Save workouts, meals and progress across devices.</p><button className="primary mobile-account-button" onClick={openAccount}>Sign in / Join <span aria-hidden="true">→</span></button></>}</div>,nav)}{expanded&&createPortal(<button type="button" className="mobile-menu-backdrop" aria-label="Close navigation menu" onClick={()=>setExpanded(false)}/>,document.body)}</>;
}
const mount=document.createElement('div');mount.className='install-mount';document.body.append(mount);createRoot(mount).render(<><InstallApp/><MobileNavigation/></>);
