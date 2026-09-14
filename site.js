const viewer=document.getElementById('image-viewer');
const picture=document.getElementById('viewer-image');
const caption=document.getElementById('viewer-caption');
for(const trigger of document.querySelectorAll('[data-image]')){
 trigger.addEventListener('click',()=>{picture.src=trigger.dataset.image;picture.alt=trigger.dataset.caption;caption.textContent=trigger.dataset.caption;viewer.showModal();});
}
document.getElementById('close-viewer').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target===viewer){const bounds=viewer.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)viewer.close();}});

// Mobile navigation toggle
const navToggle=document.querySelector('.nav-toggle');
const siteHeader=document.querySelector('header');
const siteNav=document.getElementById('site-nav');
if(navToggle&&siteHeader&&siteNav){
 const closeNav=()=>{siteHeader.classList.remove('nav-open');navToggle.setAttribute('aria-expanded','false');};
 navToggle.addEventListener('click',()=>{
  const open=siteHeader.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded',String(open));
 });
 siteNav.addEventListener('click',event=>{if(event.target.tagName==='A')closeNav();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav();});
 window.matchMedia('(min-width: 761px)').addEventListener('change',closeNav);
}

// Keep previously shared section links useful after the move to separate pages.
if(location.pathname==='/'||location.pathname.endsWith('/index.html')){
 const destinations={'#projects':'projects.html','#gt-movies-store':'gt-movies-store.html','#project-video':'gt-movies-store.html#project-video','#work':'jefferson-lab.html','#about':'about.html','#contact':'contact.html'};
 if(destinations[location.hash])location.replace(destinations[location.hash]);
}
