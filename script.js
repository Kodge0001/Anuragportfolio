// Nav scroll
const nav=document.querySelector('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>50)});

// Mobile menu
const menuBtn=document.querySelector('.menu-btn');
const navLinks=document.querySelector('.nav-links');
menuBtn.addEventListener('click',()=>{navLinks.classList.toggle('open');menuBtn.textContent=navLinks.classList.contains('open')?'✕':'☰'});
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('open');menuBtn.textContent='☰'}));

// Active nav link
const sections=document.querySelectorAll('section[id]');
window.addEventListener('scroll',()=>{
  const y=window.scrollY+100;
  sections.forEach(s=>{
    const top=s.offsetTop,h=s.offsetHeight,id=s.getAttribute('id');
    const link=document.querySelector(`.nav-links a[href="#${id}"]`);
    if(link){if(y>=top&&y<top+h)link.classList.add('active');else link.classList.remove('active')}
  });
});

// Reveal on scroll
const revealEls=document.querySelectorAll('.reveal');
const revealObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObs.unobserve(e.target)}});
},{threshold:0.15});
revealEls.forEach(el=>revealObs.observe(el));

// Skill bars animate
const skillBars=document.querySelectorAll('.skill-bar .fill');
const skillObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w;skillObs.unobserve(e.target)}});
},{threshold:0.5});
skillBars.forEach(b=>skillObs.observe(b));

// Typing effect
const typed=document.getElementById('typed');
if(typed){
  const words=['Full Stack Developer','Problem Solver','Tech Enthusiast','Creative Coder'];
  let wi=0,ci=0,del=false;
  function type(){
    const word=words[wi];
    typed.textContent=del?word.substring(0,ci-1):word.substring(0,ci+1);
    ci+=del?-1:1;
    if(!del&&ci===word.length){setTimeout(()=>{del=true;type()},1800);return}
    if(del&&ci===0){del=false;wi=(wi+1)%words.length}
    setTimeout(type,del?40:80);
  }
  type();
}

// Particle canvas
const canvas=document.getElementById('particles');
if(canvas){
  const ctx=canvas.getContext('2d');
  let W,H;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  const particles=[];
  for(let i=0;i<80;i++)particles.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2+.5,dx:(Math.random()-.5)*.5,dy:(Math.random()-.5)*.5,o:Math.random()*.5+.1});
  function drawParticles(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x+=p.dx;p.y+=p.dy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(108,92,231,${p.o})`;ctx.fill();
    });
    // Connect nearby
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(108,92,231,${.08*(1-d/120)})`;ctx.stroke()}
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

// Contact form — sends to Flask backend
const form=document.getElementById('contactForm');
if(form){
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const btn=document.getElementById('formBtn');
    const status=document.getElementById('formStatus');
    const origText=btn.textContent;

    btn.textContent='Sending...';
    btn.disabled=true;
    status.style.display='none';

    const data={
      name:document.getElementById('formName').value,
      email:document.getElementById('formEmail').value,
      subject:document.getElementById('formSubject').value,
      message:document.getElementById('formMessage').value
    };

    try{
      const res=await fetch('/send',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      });
      const result=await res.json();

      status.style.display='block';
      if(result.success){
        status.textContent='✅ '+result.message;
        status.style.color='#06d6a0';
        form.reset();
      }else{
        status.textContent='❌ '+result.error;
        status.style.color='#ff6b6b';
      }
    }catch(err){
      status.style.display='block';
      status.textContent='❌ Failed to send. Please try again.';
      status.style.color='#ff6b6b';
    }

    btn.textContent=origText;
    btn.disabled=false;
    setTimeout(()=>{status.style.display='none'},5000);
  });
}
