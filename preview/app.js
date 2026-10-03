/* Her Purpose — Live Preview App (demo, client-side only) — Phase 3: Coaching + Booking + Payments */
const LS_KEY = "herpurpose_preview_v3";
const LS_OLD_KEYS = ["herpurpose_preview_v2", "herpurpose_preview_v1"];

const LESSON_TYPE_META = {
  video: {icon:"🎬", label:"Video lesson"},
  audio: {icon:"🎧", label:"Audio"},
  article: {icon:"📖", label:"Article"},
  exercise: {icon:"✏️", label:"Exercise"},
  worksheet: {icon:"📋", label:"Worksheet"},
  reflection: {icon:"🪞", label:"Reflection"},
  guide: {icon:"🧭", label:"Guide"},
};

let PATHS = [
  {slug:"self-discovery", title:"Self-Discovery", color:"#6C00FF", icon:"🪞", desc:"Personality, strengths, values & identity — know who you really are.", lessons:[
    {id:"sd1", type:"article", title:"Your Strengths Map", mins:8, body:"List 5 moments you felt most alive. Circle the strengths you used. Those are clues to your design.", prompt:"Which 2 strengths showed up most? Where could you use them this week?", resources:[{t:"Strengths examples sheet", u:"#"}]},
    {id:"sd2", type:"worksheet", title:"Values Clarifier Worksheet", mins:15, body:"Rank these 12 values, then write one boundary that protects your top 3.", prompt:"What is one boundary that protects your top value?", resources:[{t:"Printable values worksheet (PDF)", u:"#"}]},
    {id:"sd3", type:"reflection", title:"Identity Reflection: Who am I becoming?", mins:10, body:"Journal: What labels have others given you? Which ones will you keep, release, or rewrite?", prompt:"Which label will you release, and which will you rewrite?"},
    {id:"sd4", type:"video", title:"Understanding Temperament (12 min)", mins:12, body:"Demo video lesson — how temperament shapes motivation, explained with examples for work and relationships.", prompt:"What is one thing about your temperament you'll work with, not against?", resources:[{t:"Temperament summary guide", u:"#"}]},
    {id:"sd5", type:"exercise", title:"Life Story Timeline", mins:18, body:"Draw a timeline of highs and lows. Mark what each season taught you about your strengths and values.", prompt:"What did your hardest season teach you about who you are?"}]},
  {slug:"purpose", title:"Purpose & Vision", color:"#FF0A7A", icon:"🧭", desc:"Purpose discovery, vision, direction & goal setting.", lessons:[
    {id:"pv1", type:"article", title:"What Is Purpose, Really?", mins:7, body:"Purpose = who you serve + what problem you solve + how you do it differently. Write your draft in one sentence.", prompt:"Draft your purpose in one messy sentence.", resources:[{t:"Purpose sentence template", u:"#"}]},
    {id:"pv2", type:"exercise", title:"Vision Board Exercise", mins:20, body:"Describe your life 3 years from now across faith, family, work, health and contribution. Be specific.", prompt:"What does your life look like 3 years from now, in one paragraph?"},
    {id:"pv3", type:"reflection", title:"From Confusion to Direction", mins:10, body:"What drains you? What energizes you? Your purpose often sits at the intersection.", prompt:"List 2 energizers and 1 drainer. What pattern do you see?"},
    {id:"pv4", type:"worksheet", title:"Purpose Sentence Workshop", mins:15, body:"Use the template: I help [who] + [do what] + [so that] + [because]. Write 3 versions, then circle your favorite.", prompt:"Write your 3 purpose-sentence versions.", resources:[{t:"Purpose sentence template (PDF)", u:"#"}]},
    {id:"pv5", type:"guide", title:"90-Day Purpose Roadmap", mins:12, body:"Turn your purpose draft into a 90-day plan: 1 outcome, 3 milestones, weekly next action. Keep it on one page.", prompt:"What is your one 90-day outcome?"}]},
  {slug:"confidence", title:"Confidence & Self-Development", color:"#FF6B00", icon:"🌟", desc:"Confidence, mindset, discipline & emotional growth.", lessons:[
    {id:"cf1", type:"video", title:"The Confidence Loop (10 min)", mins:10, body:"Confidence follows action, not the other way around. Pick one micro-win for today.", prompt:"What is your micro-win for today?", resources:[{t:"Micro-win planner", u:"#"}]},
    {id:"cf2", type:"exercise", title:"Reframe Self-Doubt", mins:12, body:"Write your inner critic's top 3 lines. Rewrite each with evidence and a kinder truth.", prompt:"What evidence contradicts your loudest self-doubt?"},
    {id:"cf3", type:"worksheet", title:"Discipline Tracker (7-day)", mins:10, body:"Choose 1 habit. Track daily. No zero days — small beats perfect.", prompt:"Which 1 habit will you track for 7 days?", resources:[{t:"7-day tracker (PDF)", u:"#"}]},
    {id:"cf4", type:"audio", title:"Morning Affirmations (6 min)", mins:6, body:"Demo audio — listen daily for a week and note shifts in self-talk.", prompt:"Which affirmation hit you most? Why?"},
    {id:"cf5", type:"guide", title:"30-Day Confidence Plan", mins:14, body:"Stack your wins: 1 micro-win daily, 1 STAR conversation weekly, 1 journal review Sundays. Template included.", prompt:"What are your 3 confidence reps for next week?", resources:[{t:"30-day plan template (PDF)", u:"#"}]}]},
  {slug:"communication", title:"Communication & Relationships", color:"#00A6FF", icon:"💬", desc:"Communication, boundaries & healthy relationships.", lessons:[
    {id:"cm1", type:"article", title:"Speak Up Without Fear", mins:9, body:"Use the STAR framework: Situation, Truth, Ask, Respect. Practice on one low-stakes conversation.", prompt:"Where will you try STAR this week?", resources:[{t:"STAR script examples", u:"#"}]},
    {id:"cm2", type:"worksheet", title:"Boundaries Script Pack", mins:12, body:"5 copy-paste scripts for saying no with grace at work, home and church.", prompt:"Which boundary do you need most right now?", resources:[{t:"5 scripts (PDF)", u:"#"}]},
    {id:"cm3", type:"reflection", title:"Relationship Audit", mins:10, body:"Who pours into you? Who drains you? Adjust time by 10% this week.", prompt:"Who will you spend 10% more time with?"}]},
  {slug:"career", title:"Career & Business", color:"#00C853", icon:"💼", desc:"Career clarity, entrepreneurship, branding & workplace growth.", lessons:[
    {id:"cb1", type:"article", title:"Career Clarity Canvas", mins:10, body:"Map skills × interests × market needs. Your sweet spot is where all three overlap.", prompt:"What sits at your skills × interests × market overlap?", resources:[{t:"Clarity canvas worksheet", u:"#"}]},
    {id:"cb2", type:"video", title:"Personal Branding Basics (14 min)", mins:14, body:"Your story in 60 seconds: who you help, how, and proof. Template included.", prompt:"Draft your 60-second story.", resources:[{t:"60-sec story template", u:"#"}]},
    {id:"cb3", type:"exercise", title:"Side-Hustle Validator", mins:15, body:"Interview 3 potential customers this week. Ask about pains, not your idea.", prompt:"Who are 3 people you could interview this week?"}]},
  {slug:"leadership", title:"Leadership", color:"#C800FF", icon:"👑", desc:"Influence, decision-making & responsibility.", lessons:[
    {id:"ld1", type:"article", title:"Lead Where You Are", mins:8, body:"Leadership is stewardship. Identify one person you can mentor this month.", prompt:"Who could you mentor or encourage this month?"},
    {id:"ld2", type:"exercise", title:"Decision Framework", mins:12, body:"For your hardest decision: list options, values at stake, and a 10-10-10 test.", prompt:"Apply 10-10-10 to your hardest decision right now."}]},
  {slug:"productivity", title:"Productivity & Goal Achievement", color:"#FF1E3C", icon:"⚡", desc:"Planning, habits & time management that actually stick.", lessons:[
    {id:"pd1", type:"article", title:"The Weekly Reset Ritual", mins:8, body:"30 minutes every Sunday: review, plan top 3, clear inboxes, schedule rest.", prompt:"When will you do your 30-min reset this Sunday?"},
    {id:"pd2", type:"worksheet", title:"Habit Stack Planner", mins:10, body:"Attach a new habit to an existing one. Track streaks, design for misses.", prompt:"What habit will you stack onto what routine?", resources:[{t:"Habit stack planner (PDF)", u:"#"}]},
    {id:"pd3", type:"exercise", title:"Deep Work Sprint", mins:15, body:"90-minute focused block: phone away, one goal, visible timer. Debrief after.", prompt:"What is your one goal for your next 90-min sprint?"}]},
];

let PRODUCTS = [
  {id:"p1", type:"Book", title:"The Purposeful Woman", price:18, tag:"Bestseller", desc:"A 120-page guided book on discovering strengths & purpose, with journaling prompts.", color:"#6C00FF", fileName:"purposeful-woman.pdf", linkedPath:"purpose"},
  {id:"p2", type:"Course", title:"Confidence Foundations (Mini-Course)", price:39, tag:"4 lessons", desc:"Video + worksheets: silence self-doubt, speak up, build a 30-day confidence plan.", color:"#FF0A7A", fileName:"confidence-foundations.zip", linkedPath:"confidence"},
  {id:"p3", type:"Resource", title:"Goal-Getter Worksheet Pack", price:9, tag:"PDF", desc:"12 printable worksheets: vision, quarterly goals, habit trackers, weekly reviews.", color:"#FF6B00", fileName:"goal-getter-pack.pdf", linkedPath:"productivity"},
  {id:"p4", type:"Course", title:"Career Clarity Sprint", price:49, tag:"7 days", desc:"Find your next career move in 7 days — skills audit, branding, outreach scripts.", color:"#00C853", fileName:"career-clarity-sprint.zip", linkedPath:"career"},
  {id:"p5", type:"Book", title:"Boundaries with Grace", price:15, tag:"New", desc:"Scripts & reflections for healthy boundaries in family, work and friendships.", color:"#00A6FF", fileName:"boundaries-with-grace.pdf", linkedPath:"communication"},
  {id:"p6", type:"Resource", title:"30-Day Reflection Journal", price:12, tag:"PDF", desc:"Daily 5-minute prompts to build self-awareness and consistency.", color:"#C800FF", fileName:"30-day-journal.pdf", linkedPath:"self-discovery"},
];

let SERVICES = [
  {id:"s1", title:"Clarity Call", dur:"30 min", price:29, desc:"One focused question, fast clarity + next steps."},
  {id:"s2", title:"Deep-Dive Session", dur:"60 min", price:59, desc:"Full picture: assessment review, goals, personalized plan."},
  {id:"s3", title:"Transformation Package", dur:"4 × 60 min", price:199, tag:"Best value", desc:"A month of guided growth with feedback between sessions."},
];

/* Phase 4/5: coach-published content persists across reloads (demo of R2-backed CMS).
   Snapshot overrides the seed above when present. */
const LS_CONTENT_KEY = "herpurpose_content_v1";
try{
  const snap = localStorage.getItem(LS_CONTENT_KEY);
  if(snap){
    const c = JSON.parse(snap);
    if(Array.isArray(c.paths) && c.paths.length) PATHS = c.paths;
    if(Array.isArray(c.products) && c.products.length) PRODUCTS = c.products;
    if(Array.isArray(c.services) && c.services.length) SERVICES = c.services;
  }
}catch(e){}
function saveContent(){ try{ localStorage.setItem(LS_CONTENT_KEY, JSON.stringify({paths:PATHS, products:PRODUCTS, services:SERVICES})); }catch(e){} }

const ASSESS_STEPS = [
  {key:"strengths", title:"What are your top strengths?", sub:"Pick up to 3 that feel most like you.", type:"chips-multi", max:3, options:["Empathy","Creativity","Leadership"," Organization","Communication","Problem-solving","Resilience","Faith & Service"], why:["Strengths reveal where you'll thrive fastest.","Your coach uses these to personalize your path.","We'll match lessons that build on what you already do well."], tip:"Choose what others thank you for — not just what you're good at."},
  {key:"interests", title:"What interests you most right now?", sub:"Pick up to 3.", type:"chips-multi", max:3, options:["Purpose & calling","Confidence","Career growth","Starting a business","Relationships","Leadership","Productivity","Healing & wholeness"], why:["Interests determine which path fits your season.","You can explore all 7 paths afterwards.","Honest answers = better recommendations."], tip:"Think about what you save, search, or talk about late at night."},
  {key:"skills", title:"Which skills do you want to develop?", sub:"Pick up to 3.", type:"chips-multi", max:3, options:["Public speaking","Time management","Decision-making","Emotional resilience","Writing & branding","Money management","Boundaries","Discipline & habits"], why:["Skills turn insight into action.","Your goals will link to skill-building lessons.","Small skill wins compound into confidence."], tip:"Pick skills that would change your daily life if improved."},
  {key:"challenges", title:"What's your biggest challenge today?", sub:"Pick 1 — the one that weighs on you most.", type:"chips-single", options:["Self-doubt","Lack of direction","Procrastination","Fear of speaking up","Career stagnation","Difficult relationships","No time for myself","Overwhelm"], why:["Naming the challenge is the first step to solving it.","Your coach sees this before your first session.","We'll prioritize content that addresses it directly."], tip:"There is no shame here — your answer stays private."},
  {key:"confidence", title:"How confident do you feel right now?", sub:"Tap a number. 1 = very low, 10 = unshakeable.", type:"scale", why:["This gives us a baseline to measure growth.","Your journey view will show how far you've come.","Low scores get extra encouragement, not judgment."], tip:"Answer for this week — not your best day ever."},
  {key:"purpose", title:"How clear is your sense of purpose?", sub:"Pick the sentence closest to you.", type:"chips-single", options:["I have no idea where to start","I have ideas but no clarity","I know my direction but need a plan","I'm clear and taking action"], why:["Purpose clarity shapes your starting point.","We'll recommend Purpose & Vision if clarity is low.","Whatever you pick, there's a next step."], tip:"Most women pick option 2 — you're not behind."},
  {key:"coaching", title:"What support do you want from your coach?", sub:"Pick all that apply.", type:"chips-multi", max:99, options:["Someone to listen & advise","Accountability check-ins","Career / business guidance","Help setting goals","Feedback on my progress","Prayer & encouragement"], why:["This tells your coach how to show up for you.","It shapes your dashboard's next steps.","You can change this anytime in your profile."], tip:"Think of the support you wish you already had."},
];

function seedSlots(){
  const out=[]; const days=["Mon","Tue","Wed","Thu","Fri"]; const times=["09:00","11:30","14:00","16:30"];
  let n=0;
  for(let d=0;d<5;d++){ for(const t of times){ n++; out.push({id:"slot"+n, label:`${days[d]} · ${t}`, day:days[d], time:t, booked:n%5===0}); } }
  // Phase 4: coach-added availability survives reloads via S.customSlots
  (S?.customSlots||[]).forEach(c=>{ if(!out.some(s=>s.label===c.label)) out.push({id:c.id, label:c.label, day:c.day||"", time:c.time||"", booked:!!c.booked}); });
  return out;
}

function defaultState(){
  return {
    profile:{name:"Sharon", ageRange:"25–32", interests:["Purpose & calling","Confidence"], devGoals:["Gain clarity about purpose"], improveAreas:["Confidence"], career:["Career growth"], coaching:["Someone to listen & advise"], isMinor:false, guardianConsent:false},
    assessAnswers:{strengths:["Empathy","Creativity"], interests:["Purpose & calling","Confidence"], skills:["Public speaking"], challenges:"Self-doubt", confidence:5, purpose:"I have ideas but no clarity", coaching:["Someone to listen & advise"]},
    assessDone:true,
    goals:[
      {id:"g1", title:"Get clear on my purpose in 60 days", timeframe:"60 days", status:"in-progress", actions:[{t:"Complete discovery assessment",done:true},{t:"Finish 3 Purpose & Vision lessons",done:true},{t:"Write 1-page vision statement",done:false},{t:"Share vision with coach for feedback",done:false}], reflection:"I realized service and creativity energize me most."},
      {id:"g2", title:"Speak up once in every team meeting", timeframe:"30 days", status:"in-progress", actions:[{t:"Finish Confidence Loop lesson",done:true},{t:"Use STAR script in 1 low-stakes chat",done:false},{t:"Journal after each meeting",done:false}], reflection:""},
    ],
    completed:{"pv1":true,"pv2":true,"cf1":true},
    saved:{"cb1":true},
    progressMeta:{"pv1":{completedAt:"Sep 24"},"pv2":{completedAt:"Sep 25"},"cf1":{completedAt:"Sep 26"}},
    journal:[
      {id:"j1", date:"Sep 24", title:"What energizes me", learnings:"Helping younger girls + creating things. I feel most alive when both combine.", selfDiscovery:"I am energized by service + creativity together.", challenges:"Still unsure how to turn this into direction.", insights:"My purpose thread is service-driven creativity.", progressNote:"Finished 2 Purpose lessons.", coachQuestion:"How do I turn this thread into a clear purpose sentence?", mood:" hopeful"},
      {id:"j2", date:"Sep 26", title:"Self-doubt before speaking", learnings:"I rehearse 5x before meetings.", selfDiscovery:"Fear of being wrong keeps me quiet.", challenges:"Speaking up in team meetings.", insights:"Preparation helps, but I need reps.", progressNote:"Finished Confidence Loop lesson.", coachQuestion:"What is one low-stakes moment to practice STAR?", mood:" honest"},
    ],
    questions:[
      {id:"q1", topic:"Confidence", q:"I struggle with self-doubt before speaking up at work. Where do I start?", a:"Start with micro-wins, Sharon. 1) Use the STAR script from Communication path, 2) finish the Confidence Loop lesson, 3) journal after each meeting. Bring one example to our next session and we'll refine it together. — Coach", date:"Sep 25", status:"answered", links:["Confidence Loop lesson","Boundaries Script Pack"]},
    ],
    bookings:[{id:"b1", service:"Deep-Dive Session", slot:"Tue · 11:30", status:"confirmed", meetingUrl:"https://meet.google.com/demo-herpurpose", needs:"Clarity on purpose + next career move", price:59, paymentStatus:"paid", receipt:"HP-DEMO01", emailSent:true, history:[]}],
    purchases:[],
    notifications:[
      {t:"Coach replied to your question", b:"Confidence · 2 resource referrals included.", unread:true, type:"coach-response", at:"Today"},
      {t:"Session reminder", b:"Deep-Dive Session · Tue 11:30 · link ready.", unread:true, type:"session", at:"Today"},
      {t:"Milestone earned: First 3 lessons 🎉", b:"Keep going — Purpose & Vision is growing.", unread:true, type:"milestone", at:"Today"},
    ],
    notifPrefs:{session:true, reminder:true, "coach-response":true, recommendation:true, goal:true, milestone:true, announcement:true},
    customSlots:[],
    achievements:["Joined Her Purpose","Completed assessment","First 3 lessons","Asked the coach"],
    feedback:[{id:"fb1", contextType:"assessment", context:"Assessment review", date:"Sep 24", observations:"Your strengths (Empathy + Creativity) + interest in purpose point to service-driven work.", improvements:"Tighten your purpose draft to one sentence.", resources:["Purpose & Vision path","Vision Board exercise"], nextSteps:"Write your 1-page vision, then share it for review.", encouragement:"You are further along than you think — keep going, Sharon."}],
    announcements:[],
  };
}

let S;
function migrateJournalEntry(j){
  if(j.body && !j.learnings){
    return {id:j.id||("j"+Date.now()), date:j.date||"Today", title:j.title||"Untitled reflection", learnings:j.body, selfDiscovery:"", challenges:"", insights:"", progressNote:"", coachQuestion:"", mood:j.mood||""};
  }
  return {learnings:"", selfDiscovery:"", challenges:"", insights:"", progressNote:"", coachQuestion:"", mood:"", ...j};
}
try{
  let raw = localStorage.getItem(LS_KEY);
  if(!raw){
    for(const k of LS_OLD_KEYS){ const old = localStorage.getItem(k); if(old){ raw = old; break; } }
  }
  S = raw ? JSON.parse(raw) : defaultState();
  if(!S.progressMeta) S.progressMeta = {};
  if(Array.isArray(S.journal)) S.journal = S.journal.map(migrateJournalEntry);
  if(Array.isArray(S.feedback)) S.feedback = S.feedback.map((f,i)=>({id:("fb"+i), contextType:"general", date:"", observations:"", improvements:"", resources:[], nextSteps:"", encouragement:"", context:"Coach feedback", body:"", ...f, id:f.id||("fb"+i), observations:f.observations||f.body||"", body:f.body||f.observations||""}));
  if(!S.saved) S.saved = {};
  if(!S.completed) S.completed = {};
  if(S.profile && S.profile.guardianConsent===undefined) S.profile.guardianConsent=false;
  // Phase 4 migration: typed notifications + prefs + custom slots
  const DEFPREFS = {session:true, reminder:true, "coach-response":true, recommendation:true, goal:true, milestone:true, announcement:true};
  if(!S.notifPrefs) S.notifPrefs = {...DEFPREFS};
  if(!Array.isArray(S.customSlots)) S.customSlots = [];
  if(Array.isArray(S.notifications)) S.notifications = S.notifications.map((n,i)=>{
    const type = n.type || (/coach|replied|feedback/i.test(n.t||"") ? "coach-response" : /session|booking|reschedul|cancel/i.test((n.t||"")+(n.b||"")) ? "session" : /milestone|achiev|goal completed|path complete/i.test((n.t||"")+(n.b||"")) ? "milestone" : /announce|📢/i.test((n.t||"")+(n.b||"")) ? "announcement" : /purchase|receipt|payment|unlock/i.test((n.t||"")+(n.b||"")) ? "recommendation" : "reminder");
    return {type, at:"", unread:true, ...n, type};
  });
  // Phase 3 migration: enrich old bookings with payment/receipt fields
  if(Array.isArray(S.bookings)) S.bookings = S.bookings.map((b,i)=>({id:b.id||("b"+i), service:b.service||"Deep-Dive Session", slot:b.slot||"", status:b.status||"confirmed", meetingUrl:b.meetingUrl||"", needs:b.needs||"", price:b.price??59, paymentStatus:b.paymentStatus||"paid", receipt:b.receipt||("HP-"+String(Date.now()).slice(-6)), emailSent:b.emailSent??true, history:b.history||[]}));
}catch(e){ S = defaultState(); }
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(S)); }
function resetDemo(){ localStorage.removeItem(LS_KEY); LS_OLD_KEYS.forEach(k=>localStorage.removeItem(k)); S = defaultState(); save(); book={step:1,service:(SERVICES[1]||SERVICES[0]),slot:null,needs:""}; renderAll(); toast("Demo reset — fresh sample data loaded."); showView("home"); }

/* ---------- utils ---------- */
function esc(s){ return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function toast(msg){ const w=document.getElementById("toasts"); const d=document.createElement("div"); d.className="toast"; d.textContent=msg; w.appendChild(d); setTimeout(()=>d.remove(),3200); }
function modal(html){ document.getElementById("modalBox").innerHTML=html; document.getElementById("modalBack").classList.remove("hidden"); }
function closeModal(){ document.getElementById("modalBack").classList.add("hidden"); }
document.getElementById("modalBack")?.addEventListener("click",e=>{ if(e.target.id==="modalBack") closeModal(); });

function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const el=document.getElementById("view-"+name); if(el) el.classList.add("active");
  document.querySelectorAll(".nav-links button").forEach(b=>b.classList.toggle("active", b.dataset.view===name));
  window.scrollTo({top:0,behavior:"smooth"});
  if(name==="dashboard") renderDashboard();
  if(name==="paths") renderPaths();
  if(name==="goals") renderGoals();
  if(name==="journal") renderJournal();
  if(name==="saved") renderSaved();
  if(name==="journey") renderJourney();
  if(name==="ask") renderAsk();
  if(name==="book") renderBook();
  if(name==="store") renderStore();
  if(name==="purchases") renderPurchases();
  if(name==="profile") renderProfile();
  if(name==="admin") renderAdmin("overview");
  if(name==="home") renderHome();
  document.getElementById("navLinks").classList.remove("open");
}

/* ---------- recommender (rules-based, MVP) ---------- */
function recommend(){
  const a=S.assessAnswers||{}; const score={};
  PATHS.forEach(p=>score[p.slug]=10);
  const has=(arr,...keys)=>Array.isArray(arr)&&keys.some(k=>arr.some(x=>String(x).toLowerCase().includes(k.toLowerCase())));
  if(has(a.interests,"confiden")) score["confidence"]+=40;
  if(has(a.interests,"purpose","calling")) score["purpose"]+=40;
  if(has(a.interests,"career")) score["career"]+=40;
  if(has(a.interests,"business")) score["career"]+=35;
  if(has(a.interests,"relation")) score["communication"]+=40;
  if(has(a.interests,"leader")) score["leadership"]+=40;
  if(has(a.interests,"productiv")) score["productivity"]+=40;
  if(has(a.interests,"heal","whole")) score["confidence"]+=25;
  if(has(a.skills,"speak","boundar","communication")) score["communication"]+=25;
  if(has(a.skills,"time","habit","discipline")) score["productivity"]+=25;
  if(has(a.skills,"decision","resilien")) score["confidence"]+=20;
  if(has(a.skills,"brand","money")) score["career"]+=25;
  const ch=String(a.challenges||"").toLowerCase();
  if(ch.includes("doubt")||ch.includes("speak")) score["confidence"]+=35;
  if(ch.includes("direction")) score["purpose"]+=35;
  if(ch.includes("procrast")||ch.includes("time")||ch.includes("overwhelm")) score["productivity"]+=30;
  if(ch.includes("career")||ch.includes("stagnation")) score["career"]+=30;
  if(ch.includes("relation")) score["communication"]+=30;
  if(Number(a.confidence)<=4) score["confidence"]+=20;
  if(String(a.purpose||"").includes("no idea")||String(a.purpose||"").includes("no clarity")) score["purpose"]+=25;
  if(String(a.purpose||"").includes("need a plan")) score["productivity"]+=15;
  if(has(a.strengths,"leader")) score["leadership"]+=15;
  if(has(a.strengths,"creativ")) score["career"]+=10;
  if(has(a.strengths,"empath","communic")) score["communication"]+=10;
  return PATHS.map(p=>({...p, match:Math.min(97,score[p.slug])})).sort((a,b)=>b.match-a.match);
}

/* ---------- HOME ---------- */
function renderHome(){
  const feats=[
    ["🔍","Discovery Assessment","Answer 7 guided steps, get your starting point.","assessment"],
    ["🎯","Goals & Action Plans","Break dreams into trackable actions.","goals"],
    ["🗺","Learning Paths","7 areas from identity to leadership.","paths"],
    ["💬","Ask the Coach","Real guidance + resource referrals.","ask"],
    ["📅","1:1 Booking","Pick a time, pay, get your link.","book"],
    ["📝","Journal","Private reflections that build clarity.","journal"],
    ["📈","Growth Journey","Milestones, feedback, progress story.","journey"],
    ["📚","Store","Books, courses & worksheets.","store"],
  ];
  document.getElementById("featureGrid").innerHTML=feats.map(f=>`<div class="feat" onclick="showView('${f[3]}')"><div class="ico">${f[0]}</div><strong>${f[1]}</strong><p class="muted">${f[2]}</p></div>`).join("");
  const rec=recommend().slice(0,3);
  document.getElementById("homePaths").innerHTML=PATHS.slice(0,6).map(p=>{
    const r=rec.find(x=>x.slug===p.slug);
    return `<div class="path-card"><div class="path-top" style="background:linear-gradient(135deg,${p.color},${p.color}99)">${p.icon} ${p.title}</div><div class="path-body"><p>${p.desc}</p><div class="path-meta">${r?`<span class="tag rec">Recommended · ${r.match}%</span>`:`<span class="tag">${p.lessons.length} lessons</span>`}</div><button class="btn btn-outline btn-xs" onclick="openPath('${p.slug}')">Open path →</button></div></div>`;
  }).join("");
}

/* ---------- ASSESSMENT ---------- */
let assessIdx=0, draft={};
function startAssessmentFresh(){ draft={}; assessIdx=0; showView("assessment"); renderAssess(); }
function renderAssess(){
  const step=ASSESS_STEPS[assessIdx];
  document.getElementById("assessFill").style.width=Math.round(((assessIdx+1)/ASSESS_STEPS.length)*100)+"%";
  document.getElementById("assessCount").textContent=`Step ${assessIdx+1} of ${ASSESS_STEPS.length}`;
  document.getElementById("assessWhy").innerHTML=step.why.map(w=>`<li>${w}</li>`).join("");
  document.getElementById("assessTip").textContent=step.tip;
  const cur=draft[step.key] ?? S.assessAnswers?.[step.key];
  let body=`<div class="mini-label">${step.key.toUpperCase()}</div><h3>${step.title}</h3><p class="muted">${step.sub}</p>`;
  if(step.type==="scale"){
    const v=cur??5;
    body+=`<input type="range" min="1" max="10" value="${v}" id="scaleIn" oninput="document.getElementById('scaleVal').textContent=this.value"><div style="font-size:2rem;font-weight:800;text-align:center"><span id="scaleVal">${v}</span><small style="font-size:.9rem;color:var(--muted)">/10</small></div>`;
  } else {
    const multi=step.type==="chips-multi";
    body+=`<div class="chip-row">`+step.options.map(o=>{
      const sel=multi?(Array.isArray(cur)&&cur.includes(o)):(cur===o);
      return `<button class="chip ${sel?"sel":""}" onclick="pickAssess('${step.key}','${o.replace(/'/g,"\\'")}',${multi},${step.max||99})">${o}</button>`;
    }).join("")+`</div>`;
  }
  body+=`<div class="assess-nav"><button class="btn btn-outline" ${assessIdx===0?"disabled":""} onclick="assessNav(-1)">← Back</button>${assessIdx<ASSESS_STEPS.length-1?`<button class="btn btn-primary" onclick="assessNav(1)">Continue →</button>`:`<button class="btn btn-gold" onclick="finishAssess()">See my starting point ✨</button>`}</div>`;
  document.getElementById("assessCard").innerHTML=body;
  const sc=document.getElementById("scaleIn"); if(sc) sc.addEventListener("change",e=>{draft["confidence"]=Number(e.target.value);});
}
function pickAssess(key,opt,multi,max){
  if(key==="confidence") return;
  if(multi){ let arr=Array.isArray(draft[key])?[...draft[key]]:(Array.isArray(S.assessAnswers?.[key])&&draft[key]===undefined?[...S.assessAnswers[key]]:[]); if(arr.includes(opt)) arr=arr.filter(x=>x!==opt); else { if(arr.length>=max){toast(`Pick up to ${max}.`);return;} arr.push(opt);} draft[key]=arr; }
  else draft[key]=opt;
  renderAssess();
}
function assessNav(d){
  const step=ASSESS_STEPS[assessIdx];
  if(step.key==="confidence"&&draft.confidence===undefined){ const v=document.getElementById("scaleIn")?.value; if(v) draft.confidence=Number(v); }
  assessIdx=Math.min(ASSESS_STEPS.length-1,Math.max(0,assessIdx+d)); renderAssess();
}
function finishAssess(){
  const sc=document.getElementById("scaleIn")?.value; if(sc) draft.confidence=Number(sc);
  S.assessAnswers={...S.assessAnswers,...draft}; S.assessDone=true;
  pushNotif("Assessment completed ✨","Your personalized starting point is ready.","milestone");
  if(!S.achievements.includes("Completed assessment")) S.achievements.push("Completed assessment");
  addJourneyMilestone("Completed discovery assessment");
  save(); showStartingPoint();
}
function showStartingPoint(){
  const rec=recommend(); const top=rec.slice(0,3);
  modal(`<h3>✨ Your personalized starting point</h3><p class="muted">Based on your answers: <strong>${esc(S.assessAnswers.challenges||"")}</strong> · confidence ${esc(S.assessAnswers.confidence)}/10</p>
  ${top.map((r,i)=>`<div class="rec-row"><span class="rec-dot" style="background:${r.color}"></span><div><strong>${i+1}. ${r.title}</strong><small>${r.match}% match · ${r.desc}</small></div></div>`).join("")}
  <div class="next-step">🎯 Next: create one goal linked to <strong>${top[0].title}</strong>.</div>
  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-primary" onclick="closeModal();showView('dashboard')">Go to my Dashboard →</button><button class="btn btn-outline" onclick="closeModal();openPath('${top[0].slug}')">Open ${top[0].title} →</button></div>`);
  renderAll();
}

/* ---------- DASHBOARD ---------- */
function renderDashboard(){
  const hour=new Date().getHours(); const day=hour<12?"morning":hour<17?"afternoon":"evening";
  document.getElementById("dashGreet").textContent=`Good ${day}, ${S.profile.name||"friend"} 🌸`;
  const rec=recommend(); const top=rec[0];
  const openGoals=S.goals.filter(g=>g.status!=="done");
  const nextAction=openGoals[0]?.actions.find(a=>!a.done);
  document.getElementById("focusBanner").innerHTML=`🎯 <strong>Your focus next:</strong> ${nextAction?esc(nextAction.t)+` <small>(${esc(openGoals[0].title)})</small>`:"Celebrate — all actions done! Add a new goal."} &nbsp; <button class="btn btn-xs btn-primary" onclick="showView('goals')">Open goals →</button> <button class="btn btn-xs" onclick="openPath('${top.slug}')">Continue ${top.title} →</button>`;
  const gdone=k=>{const g=S.goals.find(x=>x.id===k);return g;};
  document.getElementById("dashGoals").innerHTML=S.goals.slice(0,3).map(g=>{
    const done=g.actions.filter(a=>a.done).length, pct=g.actions.length?Math.round(done/g.actions.length*100):0;
    return `<div class="list-item"><strong>${esc(g.title)}</strong><small> · ${esc(g.timeframe)} · ${g.status}</small><div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div><small>${done}/${g.actions.length} actions · ${pct}%</small></div>`;
  }).join("")||"<p class='muted'>No goals yet.</p>";
  document.getElementById("dashPaths").innerHTML=rec.slice(0,3).map(r=>`<div class="rec-row"><span class="rec-dot" style="background:${r.color}"></span><div><strong>${r.title}</strong><small>${r.match}% match</small></div><button class="btn btn-xs" onclick="openPath('${r.slug}')">→</button></div>`).join("");
  document.getElementById("dashSessions").innerHTML=S.bookings.filter(b=>b.status==="confirmed").length?S.bookings.filter(b=>b.status==="confirmed").map(b=>`<div class="list-item"><strong>${esc(b.service)}</strong><br><small>${esc(b.slot)} · ${esc(b.status)} · $${b.price||""}</small><br><small>🔗 ${esc(b.meetingUrl||"link after payment")}</small><br><button class="btn btn-xs" style="margin-top:6px" onclick="showView('book')">Manage →</button></div>`).join(""):"<p class='muted'>No upcoming sessions. <button class='btn btn-xs' onclick=\"showView('book')\">Book 1:1 →</button></p>";
  const lastQ=[...S.questions].reverse()[0];
  document.getElementById("dashCoach").innerHTML=lastQ?`<div class="list-item"><strong>${esc(lastQ.topic)}</strong> · ${lastQ.status}<br><small>${esc(lastQ.q.slice(0,90))}…</small>${lastQ.a?`<div class="coach-reply">${esc(lastQ.a.slice(0,140))}…</div>`:""}</div>`:"<p class='muted'>No messages yet.</p>";
  document.getElementById("dashResources").innerHTML=PRODUCTS.slice(0,2).map(p=>`<div class="list-item"><strong>${esc(p.title)}</strong> <span class="tag">$${p.price}</span><br><small>${esc(p.desc.slice(0,80))}…</small></div>`).join("");
  document.getElementById("dashAchieve").innerHTML=S.achievements.slice(-4).map(a=>`<div class="list-item">🏆 ${esc(a)}</div>`).join("");
  const cont=nextLesson();
  document.getElementById("dashContinue").innerHTML=cont?`<div class="list-item"><strong>${esc(cont.lesson.title)}</strong><br><small>${esc(cont.path.title)} · ${esc(cont.lesson.type)}</small><br><br><button class="btn btn-xs btn-primary" onclick="openLesson('${cont.path.slug}','${cont.lesson.id}')">Continue →</button></div>`:"<p class='muted'>All caught up! 🎉</p>";
  document.getElementById("dashNext").innerHTML=`<div class="list-item">1. ${S.assessDone?"Review":"Complete"} your assessment ${S.assessDone?"✓":"→"}</div><div class="list-item">2. ${openGoals.length?"Work on":"Create"} your first goal</div><div class="list-item">3. Book a 1:1 clarity call</div>`;
  updateBadge();
}
function nextLesson(){ for(const p of PATHS){ for(const l of p.lessons){ if(!S.completed[l.id]) return {path:p,lesson:l}; } } return null; }

/* ---------- PATHS ---------- */
let pathFilter="All";
function renderPaths(){
  const cats=["All",...PATHS.map(p=>p.title)];
  document.getElementById("pathFilters").innerHTML=cats.map(c=>`<button class="${pathFilter===c?"active":""}" onclick="setPathFilter('${c}')">${c}</button>`).join("");
  const rec=recommend();
  const list=PATHS.filter(p=>pathFilter==="All"||p.title===pathFilter);
  document.getElementById("pathsGrid").innerHTML=list.map(p=>{
    const r=rec.find(x=>x.slug===p.slug); const done=p.lessons.filter(l=>S.completed[l.id]).length;
    return `<div class="path-card"><div class="path-top" style="background:linear-gradient(135deg,${p.color},${p.color}99)">${p.icon} ${p.title}</div><div class="path-body"><p>${p.desc}</p><div class="path-meta"><span class="tag rec">${r.match}% match</span><span class="tag">${done}/${p.lessons.length} done</span>${S.saved[p.lessons[0]?.id]?"<span class='tag'>♥ saved</span>":""}</div><div class="goal-bar"><div class="goal-fill" style="width:${Math.round(done/p.lessons.length*100)}%"></div></div><button class="btn btn-outline btn-xs" onclick="openPath('${p.slug}')">Open path →</button></div></div>`;
  }).join("");
}
function setPathFilter(c){ pathFilter=c; renderPaths(); }
function openPath(slug){
  showView("paths");
  const p=PATHS.find(x=>x.slug===slug); if(!p) return;
  const rec=recommend().find(x=>x.slug===slug);
  const d=document.getElementById("pathDetail"); d.classList.remove("hidden");
  d.innerHTML=`<div class="card" style="border-top:6px solid ${p.color}"><div class="card-head"><h3>${p.icon} ${p.title} <span class="tag rec">${rec.match}% match</span></h3><button class="btn btn-xs" onclick="document.getElementById('pathDetail').classList.add('hidden')">Close ✕</button></div>
  <p class="muted">${p.desc}</p>
  ${p.lessons.map((l,i)=>`<div class="lesson ${S.completed[l.id]?"done":""}"><div class="n">${S.completed[l.id]?"✓":i+1}</div><div style="flex:1"><strong>${esc(l.title)}</strong><br><small>${esc(l.type)} ${S.saved[l.id]?"· ♥ saved":""}</small></div><button class="btn btn-xs" onclick="toggleSave('${l.id}')">${S.saved[l.id]?"♥":"♡"}</button><button class="btn btn-xs ${S.completed[l.id]?"":"btn-primary"}" onclick="openLesson('${p.slug}','${l.id}')">${S.completed[l.id]?"Review":"Start"} →</button></div>`).join("")}</div>`;
  d.scrollIntoView({behavior:"smooth"});
}
function findLesson(lid){
  for(const p of PATHS){ const idx=p.lessons.findIndex(x=>x.id===lid); if(idx>=0) return {path:p, lesson:p.lessons[idx], index:idx}; }
  return null;
}
function openLesson(slug,lid){
  const p=PATHS.find(x=>x.slug===slug); if(!p) return;
  const idx=p.lessons.findIndex(x=>x.id===lid); const l=p.lessons[idx];
  const meta=LESSON_TYPE_META[l.type]||{icon:"📄",label:l.type};
  const prev=p.lessons[idx-1], next=p.lessons[idx+1];
  const done=!!S.completed[lid], saved=!!S.saved[lid];
  const media = l.type==="video"
    ? `<div class="media-box media-video"><span>▶</span><small>Demo video · ${l.mins||10} min — streaming placeholder. Real product: R2-hosted video.</small></div>`
    : l.type==="audio"
    ? `<div class="media-box media-audio"><span>🎧</span><small>Demo audio · ${l.mins||6} min — press play in real product (R2 audio).</small><div class="audio-fake"><div class="audio-fill" style="width:35%"></div></div></div>`
    : "";
  modal(`<div class="mini-label">${esc(p.title.toUpperCase())} · LESSON ${idx+1} OF ${p.lessons.length} · ${esc(meta.label.toUpperCase())} · ${l.mins||8} MIN</div>
  <h3>${meta.icon} ${esc(l.title)}</h3>
  ${media}
  <p style="line-height:1.6">${esc(l.body)}</p>
  ${(l.resources&&l.resources.length)?`<div class="res-box"><strong>📎 Resources & downloads</strong>${l.resources.map(r=>`<div class="list-item">📄 ${esc(r.t)} <button class="btn btn-xs" onclick="toast('Downloading… (demo)')">Open →</button></div>`).join("")}</div>`:""}
  <div class="tip">✍️ <strong>Reflection prompt:</strong> ${esc(l.prompt||"What is one thing you'll apply this week?")}</div>
  <label>Your takeaway (saves to private journal on complete)</label>
  <textarea id="lessonNote" rows="3" placeholder="Write your takeaway…"></textarea>
  <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
    ${prev?`<button class="btn btn-outline" onclick="openLesson('${p.slug}','${prev.id}')">← ${esc(prev.title.slice(0,22))}</button>`:""}
    <button class="btn btn-primary" onclick="completeLesson('${lid}')">${done?"✓ Completed — mark again":"✓ Mark complete"}</button>
    <button class="btn btn-outline" onclick="toggleSave('${lid}',true)">${saved?"♥ Saved":"♡ Save"}</button>
    ${next?`<button class="btn btn-outline" onclick="openLesson('${p.slug}','${next.id}')">Next →</button>`:`<button class="btn btn-gold" onclick="closeModal();showView('journey')">See my Journey →</button>`}
    <button class="btn" onclick="closeModal()">Close</button>
  </div>
  <p class="muted" style="margin-top:8px">${done?`Completed ${esc((S.progressMeta[lid]||{}).completedAt||"")}`:"Not completed yet"} · ${saved?"In Saved ♥":"Not saved"}</p>`);
}
function completeLesson(lid){
  const found=findLesson(lid);
  const first=!S.completed[lid];
  S.completed[lid]=true;
  S.progressMeta=S.progressMeta||{};
  S.progressMeta[lid]={completedAt:"Today", ...(S.progressMeta[lid]||{})};
  const total=Object.keys(S.completed).length;
  if(total===1 && !S.achievements.includes("First lesson completed")) S.achievements.push("First lesson completed");
  if(total===3&&!S.achievements.includes("First 3 lessons 🎉")) S.achievements.push("First 3 lessons 🎉");
  if(total>=7&&!S.achievements.includes("7 lessons strong")) S.achievements.push("7 lessons strong");
  const note=document.getElementById("lessonNote")?.value?.trim();
  if(note) S.journal.unshift({id:"j"+Date.now(), date:"Today", title:`Takeaway: ${(found||{}).lesson?.title||"Lesson"}`, learnings:note, selfDiscovery:"", challenges:"", insights:"", progressNote:`Completed ${(found||{}).lesson?.title||""}`, coachQuestion:"", mood:" 📝"});
  // path-complete milestone
  if(found){
    const allDone=found.path.lessons.every(x=>S.completed[x.id]);
    if(allDone && !S.achievements.includes(`Path complete: ${found.path.title}`)){
      S.achievements.push(`Path complete: ${found.path.title}`);
      pushNotif("Path complete 🏆", found.path.title, "milestone");
    }
  }
  pushNotif("Progress saved 🎉",`Lesson completed (${total} total).`,"milestone");
  save(); closeModal(); toast("Lesson marked complete ✓"); renderAll();
  if(found && found.path.lessons[found.index+1]){
    openLesson(found.path.slug, found.path.lessons[found.index+1].id);
  }
}
function toggleSave(lid, stayOpen){
  S.saved[lid]=!S.saved[lid]; if(!S.saved[lid]) delete S.saved[lid];
  save(); toast(S.saved[lid]?"Saved to favorites ♥":"Removed from favorites");
  if(stayOpen && document.getElementById("modalBack") && !document.getElementById("modalBack").classList.contains("hidden")){
    closeModal(); renderAll(); return;
  }
  renderAll();
}
/* ---------- SAVED ---------- */
function renderSaved(){
  const items=[];
  for(const p of PATHS){ for(const l of p.lessons){ if(S.saved[l.id]) items.push({path:p, lesson:l}); } }
  const el=document.getElementById("savedList");
  if(!el) return;
  el.innerHTML = items.length ? items.map(({path,lesson})=>{
    const meta=LESSON_TYPE_META[lesson.type]||{icon:"📄",label:lesson.type};
    return `<div class="lesson ${S.completed[lesson.id]?"done":""}"><div class="n">${meta.icon}</div><div style="flex:1"><strong>${esc(lesson.title)}</strong><br><small>${esc(path.title)} · ${esc(meta.label)} · ${lesson.mins||8} min ${S.completed[lesson.id]?"· ✓ done":""}</small></div><button class="btn btn-xs" onclick="toggleSave('${lesson.id}')">♥</button><button class="btn btn-xs btn-primary" onclick="openLesson('${path.slug}','${lesson.id}')">${S.completed[lesson.id]?"Review":"Start"} →</button></div>`;
  }).join("") : `<div class="card"><h3>No saved items yet ♥</h3><p class="muted">Tap ♡ on any lesson to save it here for later.</p><button class="btn btn-primary btn-xs" onclick="showView('paths')">Explore paths →</button></div>`;
}

/* ---------- GOALS ---------- */
function renderGoals(){
  document.getElementById("goalsList").innerHTML=S.goals.map(g=>{
    const done=g.actions.filter(a=>a.done).length, pct=g.actions.length?Math.round(done/g.actions.length*100):0;
    return `<div class="card" style="margin-bottom:12px"><div class="card-head"><h3>🎯 ${esc(g.title)}</h3><span class="tag">${esc(g.status)} · ${esc(g.timeframe)}</span></div>
    <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div><small>${done}/${g.actions.length} actions · ${pct}%</small>
    ${g.actions.map((a,i)=>`<div class="lesson ${a.done?"done":""}"><div class="n">${a.done?"✓":"○"}</div><div style="flex:1">${esc(a.t)}</div><button class="btn btn-xs" onclick="toggleAction('${g.id}',${i})">${a.done?"Undo":"Done"}</button></div>`).join("")}
    ${g.reflection?`<div class="coach-reply">💭 Reflection: ${esc(g.reflection)}</div>`:""}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn btn-xs" onclick="addAction('${g.id}')">+ Add action</button><button class="btn btn-xs" onclick="reflectGoal('${g.id}')">💭 Reflect</button><button class="btn btn-xs" onclick="finishGoal('${g.id}')">🏁 ${g.status==="done"?"Reopen":"Complete goal"}</button><button class="btn btn-xs" onclick="delGoal('${g.id}')">Delete</button></div></div>`;
  }).join("")||"<p class='muted'>No goals yet — create your first one.</p>";
}
function openGoalModal(){
  modal(`<h3>+ New Goal</h3><label>Goal title</label><input id="gTitle" placeholder="e.g. Get clear on my purpose in 60 days"><label>Timeframe</label><select id="gTime"><option>30 days</option><option>60 days</option><option>90 days</option><option>6 months</option></select><label>First 3 actions (one per line)</label><textarea id="gActions" rows="3" placeholder="Write vision draft&#10;Finish 3 lessons&#10;Share with coach"></textarea><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" onclick="createGoal()">Create goal →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function createGoal(){
  const t=document.getElementById("gTitle").value.trim(); if(!t){toast("Give your goal a title.");return;}
  const acts=document.getElementById("gActions").value.split("\n").map(s=>s.trim()).filter(Boolean).map(t=>({t,done:false}));
  S.goals.unshift({id:"g"+Date.now(), title:t, timeframe:document.getElementById("gTime").value, status:"in-progress", actions:acts.length?acts:[{t:"Define first action",done:false}], reflection:""});
  pushNotif("New goal created 🎯",t,"goal"); save(); closeModal(); renderGoals(); renderDashboard(); toast("Goal created ✓");
}
function toggleAction(gid,i){ const g=S.goals.find(x=>x.id===gid); g.actions[i].done=!g.actions[i].done; if(g.actions.every(a=>a.done)&&g.status!=="done"){g.status="done"; S.achievements.push(`Goal done: ${g.title.slice(0,30)}`); pushNotif("Goal completed 🏆",g.title,"milestone");} save(); renderGoals(); }
function addAction(gid){ const t=prompt("New action:"); if(!t) return; S.goals.find(x=>x.id===gid).actions.push({t,done:false}); save(); renderGoals(); }
function reflectGoal(gid){ const g=S.goals.find(x=>x.id===gid); const r=prompt("Your reflection:",g.reflection||""); if(r!==null){g.reflection=r; save(); renderGoals(); toast("Reflection saved 💭");} }
function finishGoal(gid){ const g=S.goals.find(x=>x.id===gid); g.status=g.status==="done"?"in-progress":"done"; save(); renderGoals(); }
function delGoal(gid){ if(!confirm("Delete this goal?")) return; S.goals=S.goals.filter(x=>x.id!==gid); save(); renderGoals(); }

/* ---------- JOURNAL (§12: learnings, self-discovery, challenges, insights, progress, coach question) ---------- */
function journalBody(j){
  return j.learnings || j.body || "";
}
function renderJournal(){
  const q=(document.getElementById("journalSearch")?.value||"").toLowerCase();
  const list=S.journal.filter(j=>{
    if(!q) return true;
    return [j.title, j.learnings, j.selfDiscovery, j.challenges, j.insights, j.progressNote, j.coachQuestion, j.body].filter(Boolean).join(" ").toLowerCase().includes(q);
  });
  const el=document.getElementById("journalList");
  el.innerHTML=list.map(j=>`<div class="card" style="margin-bottom:10px"><div class="card-head"><h3>📝 ${esc(j.title)} <small style="color:var(--muted)">· ${esc(j.date)}${esc(j.mood||"")}</small></h3><span class="tag">🔒 private</span></div>
  ${j.learnings?`<p><strong>What I learned:</strong> ${esc(j.learnings)}</p>`:""}
  ${j.selfDiscovery?`<p><strong>Self-discovery:</strong> ${esc(j.selfDiscovery)}</p>`:""}
  ${j.challenges?`<p><strong>Challenges:</strong> ${esc(j.challenges)}</p>`:""}
  ${j.insights?`<p><strong>Insights:</strong> ${esc(j.insights)}</p>`:""}
  ${j.progressNote?`<p><strong>Progress:</strong> ${esc(j.progressNote)}</p>`:""}
  ${j.coachQuestion?`<div class="coach-reply"><strong>Question for coach:</strong> ${esc(j.coachQuestion)}</div>`:""}
  ${(!j.learnings&&j.body)?`<p>${esc(j.body)}</p>`:""}
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-xs" onclick="openJournalModal('${j.id}')">Edit</button><button class="btn btn-xs" onclick="askAboutJournal('${j.id}')">Ask coach about this →</button><button class="btn btn-xs" onclick="delJournal('${j.id}')">Delete</button></div></div>`).join("")||"<p class='muted'>No entries match. Write your first reflection.</p>";
}
function openJournalModal(editId){
  const j=editId?S.journal.find(x=>x.id===editId):null;
  modal(`<h3>${j?"Edit":"New"} journal entry 🔒 private</h3><p class="muted">Only you can see this. Your coach sees it only if you choose “Ask coach about this”.</p>
  <label>Title</label><input id="jTitle" placeholder="e.g. What I learned today" value="${esc(j?.title||"")}">
  <label>What I learned</label><textarea id="jLearn" rows="2" placeholder="Key takeaways…">${esc(j?.learnings||"")}</textarea>
  <label>What I discovered about myself</label><textarea id="jSelf" rows="2" placeholder="Self-discovery…">${esc(j?.selfDiscovery||"")}</textarea>
  <label>Challenges I'm experiencing</label><textarea id="jChal" rows="2" placeholder="What's hard right now…">${esc(j?.challenges||"")}</textarea>
  <label>Personal insights</label><textarea id="jIns" rows="2" placeholder="Insights…">${esc(j?.insights||"")}</textarea>
  <label>Progress toward my goals</label><input id="jProg" placeholder="e.g. Finished 2 lessons, kept 1 habit" value="${esc(j?.progressNote||"")}">
  <label>Question I want to discuss with my coach (optional)</label><textarea id="jQ" rows="2" placeholder="e.g. How do I…?">${esc(j?.coachQuestion||"")}</textarea>
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" onclick="saveJournal('${editId||""}')">Save entry →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function saveJournal(editId){
  const data={
    title:document.getElementById("jTitle").value.trim()||"Untitled reflection",
    learnings:document.getElementById("jLearn").value.trim(),
    selfDiscovery:document.getElementById("jSelf").value.trim(),
    challenges:document.getElementById("jChal").value.trim(),
    insights:document.getElementById("jIns").value.trim(),
    progressNote:document.getElementById("jProg").value.trim(),
    coachQuestion:document.getElementById("jQ").value.trim(),
  };
  if(!data.learnings && !data.selfDiscovery && !data.insights && !data.challenges){toast("Write something first.");return;}
  if(editId){
    const j=S.journal.find(x=>x.id===editId); Object.assign(j,data);
    toast("Journal updated 🔒");
  } else {
    S.journal.unshift({id:"j"+Date.now(), date:"Today", mood:"", ...data});
    if(!S.achievements.includes("First journal entry")) S.achievements.push("First journal entry");
    toast("Journal saved 🔒");
  }
  save(); closeModal(); renderJournal();
}
function delJournal(id){ S.journal=S.journal.filter(j=>j.id!==id); save(); renderJournal(); }
function askAboutJournal(id){
  const j=S.journal.find(x=>x.id===id);
  const ctx=[j.title, journalBody(j), j.coachQuestion].filter(Boolean).join(" — ").slice(0,160);
  document.getElementById("askText").value=`About my reflection "${j.title}": ${ctx}… — what do you advise?`;
  showView("ask"); toast("Drafted as a coach question → just send.");
}

/* ---------- JOURNEY (§10: goals + paths + lessons + reflections + sessions + feedback + milestones) ---------- */
let journeyFilter="All";
function feedbackText(f){
  return f.observations || f.body || "";
}
function renderJourney(){
  const lessons=Object.keys(S.completed).length;
  const totalLessons=PATHS.reduce((s,p)=>s+p.lessons.length,0);
  document.getElementById("journeyStats").innerHTML=[["🎯",S.goals.length,"Goals"],["✅",`${lessons}/${totalLessons}`,"Lessons done"],["📝",S.journal.length,"Reflections"],["🏆",S.achievements.length,"Milestones"]].map(s=>`<div class="stat"><strong>${s[0]} ${s[1]}</strong><small>${s[2]}</small></div>`).join("");
  const jp=document.getElementById("journeyPaths");
  if(jp){
    jp.innerHTML=PATHS.map(p=>{
      const done=p.lessons.filter(l=>S.completed[l.id]).length;
      const pct=Math.round(done/p.lessons.length*100);
      return `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:.85rem"><strong>${p.icon} ${esc(p.title)}</strong><small>${done}/${p.lessons.length} · ${pct}%</small></div><div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div></div>`;
    }).join("");
  }
  const cats=["All","Goals","Lessons","Reflections","Sessions","Feedback","Milestones"];
  const jf=document.getElementById("journeyFilters");
  if(jf) jf.innerHTML=cats.map(c=>`<button class="${journeyFilter===c?"active":""}" onclick="journeyFilter='${c}';renderJourney()">${c}</button>`).join("");
  const items=[];
  S.achievements.forEach(a=>items.push({cat:"Milestones", icon:"🏆",t:a,d:"Milestone · keep going"}));
  S.goals.forEach(g=>items.push({cat:"Goals", icon:"🎯",t:`Goal: ${g.title}`,d:`${g.actions.filter(a=>a.done).length}/${g.actions.length} actions · ${g.status}${g.reflection?" · 💭 "+g.reflection.slice(0,60):""}`}));
  Object.keys(S.completed).forEach(lid=>{ const f=findLesson(lid); if(f) items.push({cat:"Lessons", icon:"✅",t:`Completed: ${f.lesson.title}`,d:`${f.path.title} · ${(S.progressMeta[lid]||{}).completedAt||""}`}); });
  S.journal.forEach(j=>items.push({cat:"Reflections", icon:"📝",t:`Reflected: ${j.title}`,d:`${j.date} · ${(journalBody(j)||"").slice(0,80)}`}));
  S.bookings.forEach(b=>items.push({cat:"Sessions", icon:"📅",t:`Session: ${b.service}`,d:`${b.slot} · ${b.status}`}));
  S.feedback.forEach(f=>items.push({cat:"Feedback", icon:"💬",t:`Coach feedback: ${f.context||f.contextType}`,d:feedbackText(f).slice(0,100)+"…"}));
  const filtered=items.filter(i=>journeyFilter==="All"||i.cat===journeyFilter);
  document.getElementById("journeyTimeline").innerHTML=filtered.slice(0,30).map(i=>`<div class="t-item"><strong>${i.icon} ${esc(i.t)}</strong><br><small>${esc(i.d)} · <span class="tag" style="font-size:.65rem">${i.cat}</span></small></div>`).join("")||"<p class='muted'>Nothing here yet — complete a lesson, write a reflection, or finish a goal.</p>";
}
function addJourneyMilestone(t){ if(!S.achievements.includes(t)) S.achievements.push(t); }
function exportJourney(){
  const lines=[`HER PURPOSE — My Growth Journey (export ${new Date().toDateString()})`,"",
    "GOALS:", ...S.goals.map(g=>`- ${g.title} (${g.status})`), "",
    `LESSONS COMPLETED: ${Object.keys(S.completed).length}`,
    ...PATHS.map(p=>`  ${p.title}: ${p.lessons.filter(l=>S.completed[l.id]).length}/${p.lessons.length}`), "",
    "REFLECTIONS:", ...S.journal.map(j=>`- ${j.title}: ${(journalBody(j)||"").slice(0,100)}`), "",
    "COACH FEEDBACK:", ...S.feedback.map(f=>`- ${f.context||f.contextType}: ${feedbackText(f).slice(0,120)}`), "",
    `MILESTONES: ${S.achievements.join("; ")}`];
  const blob=new Blob([lines.join("\n")],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="my-growth-journey.txt"; a.click(); toast("Journey exported ⬇");
}

/* ---------- ASK COACH ---------- */
function renderAsk(){
  document.getElementById("askHistory").innerHTML=[...S.questions].reverse().map(q=>`<div class="card q ${q.status==="answered"?"answered":""}" style="margin-bottom:10px"><strong>${esc(q.topic)}</strong> · <small>${esc(q.status)} · ${esc(q.date)}</small><p>${esc(q.q)}</p>${q.a?`<div class="coach-reply"><strong>Coach:</strong> ${esc(q.a)}${q.links?.length?`<br><small>📚 Resources: ${q.links.map(esc).join(" · ")}</small>`:""}</div>`:"<p class='muted'>Waiting for coach reply… (demo replies instantly)</p>"}</div>`).join("");
}
const DEMO_REPLIES={
  "Confidence":"Beautiful question — and so common. Confidence is built in reps: pick ONE low-stakes moment this week, prepare one line in advance, say it, then journal what happened. I've linked the Confidence Loop lesson + Boundaries Script Pack. You're closer than you think. — Coach",
  "Purpose & Vision":"Thank you for trusting me with this. From your assessment, I see a thread: service + creativity. This week: finish the Vision Board exercise and write a messy 5-sentence draft of your purpose. Bring it to a Deep-Dive and we'll sharpen it together. — Coach",
  "Career & Business":"Great timing. Do the Career Clarity Canvas first (skills × interests × market), then tell me your top 2 options — I'll help you validate with 3 conversations before you commit. Linked the Sprint course below. — Coach",
  "default":"Thank you for sharing so honestly. Here's your next step: break this into one small action you can do in 48 hours, journal the result, and let's review together in your next session. I'm proud of you for asking. — Coach"
};
function submitQuestion(){
  const topic=document.getElementById("askTopic").value;
  const q=document.getElementById("askText").value.trim();
  if(!q){toast("Write your question first.");return;}
  const item={id:"q"+Date.now(), topic, q, a:"", date:"Today", status:"open", links:[]};
  S.questions.push(item); save(); renderAsk();
  document.getElementById("askText").value="";
  toast("Sent to coach ✓ (demo reply incoming…)");
  setTimeout(()=>{
    item.a=DEMO_REPLIES[topic]||DEMO_REPLIES.default;
    item.links=["Confidence Loop lesson","Boundaries Script Pack"];
    item.status="answered";
    pushNotif("Coach replied 💬",topic+" — with 2 resources.","coach-response");
    if(!S.achievements.includes("Asked the coach")) S.achievements.push("Asked the coach");
    save(); renderAsk(); renderDashboard(); toast("Coach replied 💬");
  },1600);
}

/* ---------- BOOKING (Phase 3: service → slot → needs → pay → confirm + history/reschedule/cancel) ---------- */
let book={step:1, service:SERVICES[1], slot:null, needs:""};
function availSlots(excludeId){
  return seedSlots().map(s=>{ const taken=S.bookings.some(x=>x.slot===s.label && x.status==="confirmed" && x.id!==excludeId); return {...s, booked:s.booked||taken}; });
}
function renderBook(){
  const steps=["1 Service","2 Time","3 Details & Pay","4 Confirmed"];
  document.getElementById("bookStepsBar").innerHTML=steps.map((s,i)=>`<div class="bstep ${book.step===i+1?"active":""}">${s}</div>`).join("");
  const b=document.getElementById("bookBody");
  if(book.step===1){
    b.innerHTML=`<div class="grid-3">`+SERVICES.map(s=>`<div class="card svc ${book.service.id===s.id?"sel":""}" onclick="pickService('${s.id}')"><h3>${s.title}</h3><p class="muted">${s.dur} · <strong>$${s.price}</strong> ${s.tag?`· <span class="tag rec">${s.tag}</span>`:""}</p><p>${s.desc}</p><button class="btn ${book.service.id===s.id?"btn-primary":"btn-outline"} btn-xs">${book.service.id===s.id?"Selected ✓":"Select"}</button></div>`).join("")+`</div><div style="margin-top:12px;text-align:right"><button class="btn btn-primary" onclick="book.step=2;renderBook()">Continue →</button></div>`;
  } else if(book.step===2){
    const slots=availSlots();
    b.innerHTML=`<div class="card"><h3>Pick a time — ${esc(book.service.title)} ($${book.service.price})</h3><p class="muted">Live availability from your coach's calendar (demo).</p><div class="slot-grid">`+slots.map(s=>`<div class="slot ${book.slot===s.label?"sel":""} ${s.booked?"booked":""}" onclick="${s.booked?"":"pickSlot('"+s.label+"')"}">${s.label}<br><small>${s.booked?"Booked":"Available"}</small></div>`).join("")+`</div><div style="display:flex;justify-content:space-between;margin-top:12px"><button class="btn btn-outline" onclick="book.step=1;renderBook()">← Back</button><button class="btn btn-primary" ${book.slot?"":"disabled"} onclick="book.step=3;renderBook()">Continue →</button></div></div>`;
  } else if(book.step===3){
    b.innerHTML=`<div class="card"><h3>Describe your needs & pay</h3>
    <div class="list-item"><strong>Order summary</strong><br><small>${esc(book.service.title)} · ${esc(book.service.dur)} · ${esc(book.slot||"no slot yet")}</small><br><strong>Total: $${book.service.price}</strong> <small>· Stripe test-mode (demo — no real charge)</small></div>
    <label>What should the coach prepare for?</label><textarea id="bookNeeds" rows="4" placeholder="e.g. I want clarity on whether to stay in my job or start my business…">${esc(book.needs)}</textarea>
    <label>Email for confirmation + receipt</label><input id="bookEmail" value="sharon@example.com">
    <div class="tip">💳 Demo checkout — no real charge. Real product: Stripe Checkout → webhook confirms → Booking confirmed + email + notification + meeting URL.</div>
    <div style="display:flex;justify-content:space-between;margin-top:12px"><button class="btn btn-outline" onclick="book.step=2;renderBook()">← Back</button><button class="btn btn-gold" onclick="openCheckout()">Pay $${book.service.price} →</button></div></div>`;
  } else {
    const last=S.bookings[S.bookings.length-1];
    b.innerHTML=`<div class="card" style="text-align:center;padding:30px"><div style="font-size:3rem">🎉</div><h3>Booking confirmed!</h3><p>${esc(last.service)} · ${esc(last.slot)}</p>
    <div class="list-item" style="text-align:left;max-width:460px;margin:12px auto">🧾 <strong>Receipt ${esc(last.receipt)}</strong> · $${last.price} · ${esc(last.paymentStatus)}<br><small>📧 Confirmation sent to ${esc(last.email||"your email")} (demo) + reminder scheduled.<br>🔗 Meeting link: <strong>${esc(last.meetingUrl)}</strong></small>${last.needs?`<br><small>📝 Needs: ${esc(last.needs)}</small>`:""}</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap"><button class="btn btn-outline" onclick="book={step:1,service:SERVICES[1],slot:null,needs:''};renderBook()">Book another</button><button class="btn btn-outline" onclick="viewBooking('${last.id}')">View receipt →</button><button class="btn btn-primary" onclick="showView('dashboard')">Go to Dashboard →</button></div></div>`;
  }
  renderBookingHistory();
}
function pickService(id){ book.service=SERVICES.find(s=>s.id===id); renderBook(); }
function pickSlot(label){ book.slot=label; renderBook(); }
function openCheckout(){
  book.needs=document.getElementById("bookNeeds")?.value||"";
  const email=document.getElementById("bookEmail")?.value||"sharon@example.com";
  book.email=email;
  if(!book.slot){ toast("Pick a time slot first."); book.step=2; renderBook(); return; }
  if(!book.needs.trim()){ toast("Describe your needs briefly so your coach can prepare."); return; }
  modal(`<h3>💳 Checkout (demo Stripe)</h3><p><strong>${esc(book.service.title)}</strong> · ${esc(book.slot)} · <strong>$${book.service.price}</strong></p>
  <p class="muted">Test mode — no real charge. Webhook confirmation is simulated instantly.</p>
  <label>Card number</label><input value="4242 4242 4242 4242">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label>Expiry</label><input value="12/28"></div><div><label>CVC</label><input value="123"></div></div>
  <label>Receipt email</label><input id="payEmail" value="${esc(email)}">
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-gold" onclick="payBooking()">Pay $${book.service.price} →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function payBooking(){
  const email=document.getElementById("payEmail")?.value || book.email || "sharon@example.com";
  const nb={id:"b"+Date.now(), service:book.service.title, slot:book.slot, status:"confirmed", meetingUrl:"https://meet.google.com/demo-"+Math.random().toString(36).slice(2,6), needs:book.needs, price:book.service.price, paymentStatus:"paid", receipt:"HP-"+Math.random().toString(36).slice(2,8).toUpperCase(), email, emailSent:true, history:[]};
  S.bookings.push(nb);
  pushNotif("Booking confirmed 📅",`${nb.service} · ${nb.slot}`,"session");
  pushNotif("Receipt "+nb.receipt,`$${nb.price} paid · meeting link ready.`,"recommendation");
  if(!S.achievements.includes("Booked first session")) S.achievements.push("Booked first session");
  save(); closeModal(); book.step=4; renderBook(); renderDashboard(); toast("Payment successful (demo) ✓");
}
function renderBookingHistory(){
  const el=document.getElementById("bookingHistory"); if(!el) return;
  if(!S.bookings.length){ el.innerHTML="<p class='muted'>No bookings yet — pick a service above to start.</p>"; return; }
  el.innerHTML=[...S.bookings].reverse().map(b=>`<div class="list-item"><strong>📅 ${esc(b.service)}</strong> · ${esc(b.slot)} · <span class="tag">${esc(b.status)}</span> <span class="tag">$${b.price} ${esc(b.paymentStatus||"paid")}</span><br><small>🧾 ${esc(b.receipt||"—")} · 🔗 ${esc(b.meetingUrl||"link after payment")}${b.needs?` · 📝 ${esc(b.needs.slice(0,80))}`:""}${(b.history&&b.history.length)?` · ↻ ${esc(b.history.join(" → "))}`:""}</small>
  <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn btn-xs" onclick="viewBooking('${b.id}')">Receipt →</button>${b.status==="confirmed"?`<button class="btn btn-xs" onclick="openReschedule('${b.id}')">Reschedule</button><button class="btn btn-xs" onclick="cancelBooking('${b.id}')">Cancel</button>`:`<button class="btn btn-xs" onclick="rebook('${b.id}')">Book again</button>`}</div></div>`).join("");
}
function viewBooking(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  modal(`<h3>🧾 Booking receipt</h3><div class="list-item"><strong>${esc(b.service)}</strong> · ${esc(b.slot)}<br><small>Receipt <strong>${esc(b.receipt||"—")}</strong> · $${b.price} · ${esc(b.paymentStatus||"paid")} · ${esc(b.status)}<br>📧 Sent to ${esc(b.email||"your email")} (demo, webhook simulated)<br>🔗 Meeting: <strong>${esc(b.meetingUrl||"—")}</strong></small>${b.needs?`<br><small>📝 Needs: ${esc(b.needs)}</small>`:""}</div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">${b.status==="confirmed"?`<button class="btn btn-outline" onclick="closeModal();openReschedule('${b.id}')">Reschedule</button>`:""}<button class="btn btn-primary" onclick="closeModal()">Done</button></div>`);
}
function openReschedule(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  const slots=availSlots(id);
  modal(`<h3>Reschedule — ${esc(b.service)}</h3><p class="muted">Currently: <strong>${esc(b.slot)}</strong>. Pick a new time (demo — coach calendar).</p><div class="slot-grid">`+slots.map(s=>`<div class="slot ${s.booked?"booked":""}" onclick="${s.booked?"":"confirmReschedule('"+id+"','"+s.label+"')"}">${s.label}<br><small>${s.booked?"Booked":"Available"}</small></div>`).join("")+`</div><div style="margin-top:12px;text-align:right"><button class="btn" onclick="closeModal()">Keep current</button></div>`);
}
function confirmReschedule(id, newSlot){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  b.history=b.history||[]; b.history.push(b.slot+" → "+newSlot);
  b.slot=newSlot;
  pushNotif("Booking rescheduled 📅",`${b.service} → ${newSlot}`,"session");
  save(); closeModal(); renderBook(); renderDashboard(); toast("Rescheduled ✓ — confirmation sent (demo)");
}
function cancelBooking(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  if(!confirm(`Cancel ${b.service} on ${b.slot}? (demo — refund simulated)`)) return;
  b.status="cancelled"; b.paymentStatus="refunded";
  pushNotif("Booking cancelled",`${b.service} · ${b.slot} · refund simulated.`,"session");
  save(); renderBook(); renderDashboard(); toast("Booking cancelled — refund simulated.");
}
function rebook(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  const svc=SERVICES.find(s=>s.title===b.service)||SERVICES[1];
  book={step:2, service:svc, slot:null, needs:b.needs||""};
  renderBook(); toast("Pick a new time to rebook.");
}

/* ---------- STORE ---------- */
let storeFilter="All";
function renderStore(){
  const cats=["All","Book","Course","Resource"];
  document.getElementById("storeFilters").innerHTML=cats.map(c=>`<button class="${storeFilter===c?"active":""}" onclick="storeFilter='${c}';renderStore()">${c}s</button>`).join("");
  document.getElementById("purchCount").textContent=S.purchases.length;
  const list=PRODUCTS.filter(p=>storeFilter==="All"||p.type===storeFilter);
  document.getElementById("storeGrid").innerHTML=list.map(p=>{
    const owned=S.purchases.some(x=>x.productId===p.id);
    return `<div class="path-card"><div class="path-top" style="background:linear-gradient(135deg,${p.color},${p.color}99)">${p.type} · ${p.tag}</div><div class="path-body"><h4 style="margin:.2em 0">${p.title}</h4><p>${p.desc}</p><div class="path-meta"><span class="tag">$${p.price}</span>${owned?'<span class="tag rec">Owned ✓ unlocked</span>':'<span class="tag">🔒 locked</span>'}</div><button class="btn ${owned?"":"btn-primary"} btn-xs" onclick="${owned?`openOwned('${p.id}')`:`buyProduct('${p.id}')`}">${owned?"Open / Access →":"Buy · $"+p.price}</button></div></div>`;
  }).join("");
}
function buyProduct(id){
  const p=PRODUCTS.find(x=>x.id===id);
  modal(`<h3>Checkout (demo)</h3><p><strong>${esc(p.title)}</strong> · $${p.price}</p><p class="muted">Demo only — no real charge. Real product: Stripe Checkout → webhook unlocks access.</p><label>Email for receipt</label><input value="sharon@example.com"><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-gold" onclick="confirmBuy('${id}')">Pay $${p.price} →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function confirmBuy(id){
  const p=PRODUCTS.find(x=>x.id===id);
  S.purchases.unshift({id:"pur"+Date.now(), productId:id, title:p.title, amount:p.price, date:"Today", status:"paid"});
  pushNotif("Purchase unlocked 📚",p.title+" — access granted.","recommendation");
  if(!S.achievements.includes("First resource unlocked")) S.achievements.push("First resource unlocked");
  save(); renderStore(); openOwned(id); toast("Unlocked ✓ — access granted");
}
function openOwned(id){
  const p=PRODUCTS.find(x=>x.id===id); if(!p) return;
  const owned=S.purchases.some(x=>x.productId===id);
  if(!owned){ buyProduct(id); return; }
  const linked=PATHS.find(x=>x.slug===p.linkedPath);
  modal(`<h3>📚 ${esc(p.title)} <span class="tag rec">Owned ✓</span></h3>
  <div class="list-item">📄 <strong>${esc(p.fileName||"download.pdf")}</strong> · ${esc(p.type)} · purchased Today<br><small>Real product: presigned R2 download link here (expires in 15 min).</small><br><button class="btn btn-xs btn-primary" style="margin-top:6px" onclick="downloadOwned('${p.id}')">⬇ Download →</button></div>
  ${linked?`<div class="tip">🗺 <strong>Linked learning:</strong> ${esc(linked.title)} — your purchase unlocks this path's track.<br><button class="btn btn-xs" style="margin-top:6px" onclick="closeModal();openPath('${linked.slug}')">Open ${esc(linked.title)} →</button></div>`:""}
  <p class="muted">🧾 Receipt in Purchase history · Access never expires (demo).</p>
  <div style="display:flex;gap:8px;margin-top:8px"><button class="btn btn-primary" onclick="closeModal()">Done</button></div>`);
}
function downloadOwned(id){
  const p=PRODUCTS.find(x=>x.id===id);
  const blob=new Blob([`${p.title}\n\nDemo file — real product downloads "${p.fileName}" from R2 (presigned URL).\n\n${p.desc}`],{type:"text/plain"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=(p.fileName||p.title).replace(/\.[a-z]+$/i,"")+"-demo.txt"; a.click();
  toast("Download started ⬇ (demo file)");
}
function renderPurchases(){
  document.getElementById("purchList").innerHTML=S.purchases.map(pu=>{
    const prod=PRODUCTS.find(x=>x.id===pu.productId);
    return `<div class="list-item"><strong>📚 ${esc(pu.title)}</strong> · $${pu.amount} · ${esc(pu.date)} · ${esc(pu.status)} ${prod?`<span class="tag rec">unlocked</span>`:""}<br><small>${prod?esc(prod.fileName||"")+" · ":""}${prod&&prod.linkedPath?`linked: ${esc((PATHS.find(x=>x.slug===prod.linkedPath)||{}).title||prod.linkedPath)} · `:""}access never expires</small><br><button class="btn btn-xs" style="margin-top:6px" onclick="openOwned('${pu.productId}')">Open / Download →</button></div>`;
  }).join("")||"<p class='muted'>Nothing yet — visit the Store. 🔒 Items unlock only after purchase.</p>";
}

/* ---------- PROFILE ---------- */
function renderProfile(){
  const p=S.profile;
  document.getElementById("profileForm").innerHTML=`
    ${p.isMinor?`<div class="next-step" style="margin-bottom:10px">🔒 Minor account (16–17): extra safeguarding on — journals stay private, no community features, comms logged.</div>`:""}
    <label>Name (stored minimally — PII minimization)</label><input id="pfName" value="${esc(p.name)}">
    <label>Age range</label><select id="pfAge" onchange="document.getElementById('guardianRow').style.display=this.value==='16–17'?'block':'none'"><option ${p.ageRange==="16–17"?"selected":""}>16–17</option><option ${p.ageRange==="18–24"?"selected":""}>18–24</option><option ${p.ageRange==="25–32"?"selected":""}>25–32</option><option ${p.ageRange==="33–40"?"selected":""}>33–40</option></select>
    <div id="guardianRow" style="display:${p.ageRange==="16–17"?"block":"none"}"><label style="display:flex;gap:8px;align-items:flex-start;font-weight:600"><input type="checkbox" id="pfGuardian" style="width:auto;margin-top:4px" ${p.guardianConsent?"checked":""}> I confirm a parent/guardian consents to coaching + stored progress (required for 16–17).</label></div>
    <label>Interests (comma separated)</label><input id="pfInt" value="${esc((p.interests||[]).join(", "))}">
    <label>Goals / areas to improve</label><input id="pfImp" value="${esc((p.improveAreas||[]).join(", "))}">
    <label>Career / business interests</label><input id="pfCar" value="${esc(p.career||"")}">
    <p class="muted">🔒 ${p.ageRange==="16–17"?"Minor account: extra safeguarding on.":"Adult account."} Guardian consent: ${p.guardianConsent?"✓ on file":(p.isMinor?"⚠ required":"n/a")} · Journals always private 🔒 · Only minimal profile stored.</p>`;
  const a=S.assessAnswers||{};
  document.getElementById("profileAssess").innerHTML=`<div class="list-item"><small>STRENGTHS</small><br><strong>${esc((a.strengths||[]).join(" · "))}</strong></div><div class="list-item"><small>CHALLENGE → CONFIDENCE</small><br><strong>${esc(a.challenges||"—")} · ${esc(a.confidence||"—")}/10</strong></div><div class="list-item"><small>PURPOSE</small><br>${esc(a.purpose||"—")}</div>`;
  document.getElementById("profileFeedback").innerHTML=S.feedback.map(f=>`<div class="coach-reply"><strong>${esc(f.context||f.contextType)}</strong>${f.date?` <small>· ${esc(f.date)}</small>`:""}<br>${f.observations?`👁 <strong>Observations:</strong> ${esc(f.observations)}<br>`:""}${f.improvements?`🌱 <strong>To improve:</strong> ${esc(f.improvements)}<br>`:""}${(f.resources&&f.resources.length)?`📚 <strong>Resources:</strong> ${f.resources.map(esc).join(" · ")}<br>`:""}${f.nextSteps?`👉 <strong>Next steps:</strong> ${esc(f.nextSteps)}<br>`:""}${f.encouragement?`💛 <em>${esc(f.encouragement)}</em>`:""}${(!f.observations&&f.body)?esc(f.body):""}</div>`).join("")||"<p class='muted'>No feedback yet — complete your assessment and lessons, and your coach will respond here.</p>";
}
function saveProfile(){
  const age=document.getElementById("pfAge").value;
  const consent=document.getElementById("pfGuardian")?.checked||false;
  if(age==="16–17" && !consent){ toast("Guardian consent required for 16–17 🔒"); return; }
  S.profile.name=document.getElementById("pfName").value;
  S.profile.ageRange=age;
  S.profile.guardianConsent=age==="16–17"?true:false;
  S.profile.interests=document.getElementById("pfInt").value.split(",").map(s=>s.trim()).filter(Boolean);
  S.profile.improveAreas=document.getElementById("pfImp").value.split(",").map(s=>s.trim()).filter(Boolean);
  S.profile.career=document.getElementById("pfCar").value;
  S.profile.isMinor=age==="16–17";
  save(); toast("Profile saved ✓"); renderDashboard(); renderProfile();
}

/* ---------- NOTIFS (Phase 4: typed, batched, mutable) ---------- */
const NOTIF_TYPES=[["session","📅 Sessions"],["reminder","📝 Reminders"],["coach-response","💬 Coach"],["recommendation","📚 Resources"],["goal","🎯 Goals"],["milestone","🏆 Milestones"],["announcement","📢 Announcements"]];
function pushNotif(t,b,type){
  type=type||"reminder";
  S.notifications.unshift({t,b,unread:true,type,at:"Today"});
  const prefs=S.notifPrefs||{};
  if(prefs[type]===false){
    // muted: store but don't badge as unread
    S.notifications[0].unread=false;
  }
  // cap list (batched, not overwhelming): keep last 30
  if(S.notifications.length>30) S.notifications=S.notifications.slice(0,30);
  save(); updateBadge();
}
function updateBadge(){ const n=S.notifications.filter(x=>x.unread).length; const el=document.getElementById("notifBadge"); if(!el) return; el.textContent=n; el.style.display=n?"grid":"none"; }
let notifFilter="All";
function toggleNotifs(){
  const p=document.getElementById("notifPanel"); p.classList.toggle("hidden");
  renderNotifPanel();
}
function renderNotifPanel(){
  const p=document.getElementById("notifPanel"); if(!p||p.classList.contains("hidden")) return;
  const prefs=S.notifPrefs||{};
  const list=S.notifications.filter(n=>notifFilter==="All"||(n.type||"reminder")===notifFilter).slice(0,10);
  p.innerHTML=`<h4 style="margin:4px 6px">Notifications <small class="muted">· useful, not overwhelming</small></h4>
  <div class="filter-row" style="margin:6px">${["All",...NOTIF_TYPES.map(x=>x[0])].map(t=>`<button class="${notifFilter===t?"active":""}" style="font-size:.7rem;padding:4px 9px" onclick="notifFilter='${t}';renderNotifPanel()">${t}</button>`).join("")}</div>`
  +(list.map(n=>`<div class="notif"><b>${esc(n.t)}</b>${esc(n.b)}<br><small><span class="tag" style="font-size:.62rem">${esc(n.type||"reminder")}</span> ${esc(n.at||"")}</small></div>`).join("")||"<p class='muted'>Nothing here. You're all caught up 🌸</p>")
  +`<details style="margin:6px"><summary style="cursor:pointer;font-size:.8rem;font-weight:800">🔕 Mute types</summary>${NOTIF_TYPES.map(([k,label])=>`<label style="display:flex;gap:6px;align-items:center;font-size:.8rem;font-weight:600;margin:4px 0"><input type="checkbox" style="width:auto" ${prefs[k]!==false?"checked":""} onchange="toggleNotifPref('${k}')"> ${label}</label>`).join("")}<small class="muted">Muted types are stored silently (demo of batched email prefs).</small></details>`
  +`<button class="btn btn-xs" onclick="S.notifications.forEach(n=>n.unread=false);save();updateBadge();renderNotifPanel()">Mark all read</button>`;
}
function toggleNotifPref(k){ S.notifPrefs=S.notifPrefs||{}; S.notifPrefs[k]=!(S.notifPrefs[k]!==false); save(); renderNotifPanel(); toast(S.notifPrefs[k]?"Unmuted ✓":"Muted 🔕"); }

/* ---------- ADMIN (Phase 4: full coach console + Phase 5: launch readiness) ---------- */
let adminTab="overview";
const ADMIN_TABS=["overview","users","content","bookings","qa","payments","feedback","comms"];
function smokeChecks(){
  return [
    {k:"Profile saved", ok:!!(S.profile.name && S.profile.ageRange)},
    {k:"Assessment done + ≥2 paths recommended", ok:!!S.assessDone && recommend().length>=2},
    {k:"≥1 goal with actions", ok:S.goals.length>0 && S.goals.some(g=>g.actions.length)},
    {k:"≥1 lesson completed", ok:Object.keys(S.completed).length>=1},
    {k:"≥1 journal entry", ok:S.journal.length>=1},
    {k:"Asked coach + got reply", ok:S.questions.some(q=>q.status==="answered")},
    {k:"Booking paid + meeting link", ok:S.bookings.some(b=>b.paymentStatus==="paid" && b.meetingUrl)},
    {k:"Coach feedback received", ok:S.feedback.length>=1},
    {k:"Store purchase unlocks access", ok:S.purchases.length>=1},
  ];
}
function seedStatus(){
  const okPaths = PATHS.filter(p=>p.lessons.length>=5).length;
  return {totalPaths:PATHS.length, totalLessons:PATHS.reduce((s,p)=>s+p.lessons.length,0), okPaths};
}
function renderAdmin(tab){
  adminTab=tab||adminTab;
  document.getElementById("adminTabs").innerHTML=ADMIN_TABS.map(t=>`<button class="${adminTab===t?"active":""}" onclick="renderAdmin('${t}')">${t}</button>`).join("");
  const b=document.getElementById("adminBody");
  const rev=S.purchases.reduce((s,p)=>s+p.amount,0)+S.bookings.filter(x=>x.paymentStatus==="paid").reduce((s,x)=>s+(x.price||0),0);
  if(adminTab==="overview"){
    const checks=smokeChecks(); const done=checks.filter(c=>c.ok).length;
    const seed=seedStatus();
    b.innerHTML=`<div class="journey-stats"><div class="stat"><strong>👥 128</strong><small>users (demo)</small></div><div class="stat"><strong>📅 ${S.bookings.length}</strong><small>bookings (you)</small></div><div class="stat"><strong>💬 ${S.questions.length}</strong><small>Q&A threads</small></div><div class="stat"><strong>💰 $${rev}</strong><small>demo revenue</small></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    <div class="card"><h3>Pending actions</h3><div class="list-item">💬 ${S.questions.filter(q=>q.status==="open").length} open questions to answer</div><div class="list-item">📅 ${S.bookings.filter(x=>x.status==="confirmed").length} upcoming sessions (meeting links ready)</div><div class="list-item">🔒 Journals are private — review only with user consent (see Users → View)</div></div>
    <div class="card"><h3>🚀 Launch readiness (Phase 5 · E2E smoke)</h3><p class="muted">${done}/${checks.length} checks green · Content: ${seed.okPaths} paths ≥5 lessons (${seed.totalLessons} total)</p>
    ${checks.map(c=>`<div class="list-item">${c.ok?"✅":"⬜"} ${esc(c.k)}</div>`).join("")}
    <p class="muted">UAT: demo to coach with this checklist. Seed target: min 3 paths × 5 lessons — ${seed.okPaths>=3?"met ✓":"add lessons in Content tab"}.</p></div></div>`;
  } else if(adminTab==="users"){
    const a=S.assessAnswers||{};
    b.innerHTML=`<div class="card"><h3>Users (demo cohort)</h3><p class="muted">🔒 Minor accounts (16–17) flagged. Journals stay private — open detail only with consent in real product.</p><table><tr><th>Name</th><th>Age</th><th>Focus</th><th>Progress</th><th>Action</th></tr>
    <tr><td><strong>${esc(S.profile.name)} (you)</strong> ${S.profile.isMinor?'<span class="tag">🔒 minor</span>':""}</td><td>${esc(S.profile.ageRange)}</td><td>${esc((S.profile.interests||[]).join(", "))}</td><td>${Object.keys(S.completed).length} lessons · ${S.goals.length} goals</td><td><button class="btn btn-xs btn-primary" onclick="adminUserView('me')">View →</button></td></tr>
    <tr><td>Amara, 19</td><td>18–24</td><td>Career, Confidence</td><td>5 lessons</td><td><button class="btn btn-xs" onclick="adminUserView('amara')">View →</button></td></tr>
    <tr><td>Grace, 17 🔒</td><td>16–17</td><td>Purpose</td><td>2 lessons</td><td><button class="btn btn-xs" onclick="adminUserView('grace')">View →</button></td></tr>
    <tr><td>Lydia, 34</td><td>33–40</td><td>Business, Leadership</td><td>9 lessons</td><td><button class="btn btn-xs" onclick="adminUserView('lydia')">View →</button></td></tr></table></div>`;
  } else if(adminTab==="content"){
    b.innerHTML=`<div class="card"><div class="card-head"><h3>Content — ${PATHS.length} paths · ${PATHS.reduce((s,p)=>s+p.lessons.length,0)} lessons</h3><div><button class="btn btn-xs" onclick="resetContentSeed()">Reset seed</button> <button class="btn btn-xs btn-primary" onclick="openLessonEditor('')">+ New lesson</button></div></div>
    <p class="muted">Publish flow (demo of R2 CMS): create → appears in Paths instantly → persists in this browser. Real product: Prisma + R2 upload.</p>
    ${PATHS.map(p=>`<div class="list-item"><strong>${p.icon} ${esc(p.title)}</strong> <span class="tag">${p.lessons.length} lessons</span> ${p.lessons.length>=5?'<span class="tag rec">seed ✓</span>':'<span class="tag">needs 5</span>'}
    ${p.lessons.map(l=>`<div style="display:flex;gap:6px;align-items:center;margin-top:6px;font-size:.85rem"><span style="flex:1">· ${esc(l.title)} <small>(${esc(l.type)} · ${l.mins||8}m)</small></span><button class="btn btn-xs" onclick="openPath('${p.slug}')">View</button><button class="btn btn-xs" onclick="openLessonEditor('${p.slug}','${l.id}')">Edit</button><button class="btn btn-xs" onclick="delLesson('${p.slug}','${l.id}')">Delete</button></div>`).join("")}</div>`).join("")}</div>
    <div class="card" style="margin-top:12px"><div class="card-head"><h3>Store products — ${PRODUCTS.length}</h3><button class="btn btn-xs btn-primary" onclick="openProductEditor('')">+ New product</button></div>
    <table><tr><th>Title</th><th>Type</th><th>Price</th><th>Linked path</th><th></th></tr>${PRODUCTS.map(p=>`<tr><td><strong>${esc(p.title)}</strong></td><td>${esc(p.type)}</td><td>$${p.price}</td><td><small>${esc(p.linkedPath||"—")}</small></td><td><button class="btn btn-xs" onclick="openProductEditor('${p.id}')">Edit</button> <button class="btn btn-xs" onclick="delProduct('${p.id}')">Delete</button></td></tr>`).join("")}</table></div>`;
  } else if(adminTab==="bookings"){
    const slots=seedSlots();
    b.innerHTML=`<div class="card"><h3>Bookings — ${S.bookings.length}</h3><table><tr><th>Service</th><th>Slot</th><th>Status / Pay</th><th>Needs</th><th>Meeting</th><th></th></tr>${S.bookings.map(x=>`<tr><td>${esc(x.service)}<br><small>$${x.price||""} · ${esc(x.receipt||"")}</small></td><td>${esc(x.slot)}${(x.history&&x.history.length)?`<br><small>↻ ${esc(x.history.join("; "))}</small>`:""}</td><td>${esc(x.status)} / ${esc(x.paymentStatus||"paid")}</td><td><small>${esc((x.needs||"—").slice(0,60))}</small></td><td><small>${esc(x.meetingUrl||"—")}</small></td><td>${x.paymentStatus==="paid"?`<button class="btn btn-xs" onclick="refundBooking('${x.id}')">Refund</button>`:""}</td></tr>`).join("")||'<tr><td colspan=6>No bookings yet.</td></tr>'}</table></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:12px">
    <div class="card"><div class="card-head"><h3>Services</h3><button class="btn btn-xs btn-primary" onclick="openServiceEditor('')">+ New</button></div>${SERVICES.map(s=>`<div class="list-item"><strong>${esc(s.title)}</strong> · ${esc(s.dur)} · $${s.price}<br><small>${esc(s.desc||"")}</small><div style="margin-top:6px"><button class="btn btn-xs" onclick="openServiceEditor('${s.id}')">Edit</button> <button class="btn btn-xs" onclick="delService('${s.id}')">Delete</button></div></div>`).join("")}</div>
    <div class="card"><h3>Availability (${slots.filter(s=>!s.booked).length} open)</h3><p class="muted">Toggle a slot to block it, or add custom availability below.</p><div class="slot-grid" style="grid-template-columns:repeat(2,1fr)">`+slots.slice(0,12).map(s=>`<div class="slot ${s.booked?"booked":""}" onclick="toggleSlotBlock('${s.label}')">${s.label}<br><small>${s.booked?"Blocked":"Open"}</small></div>`).join("")+`</div>
    <label>New slot (e.g. Sat · 10:00)</label><div style="display:flex;gap:6px"><input id="newSlot" placeholder="Sat · 10:00"><button class="btn btn-xs btn-primary" onclick="addSlot()">Add</button></div>
    ${(S.customSlots||[]).length?`<p class="muted">Custom: ${(S.customSlots||[]).map(c=>esc(c.label)).join(", ")} <button class="btn btn-xs" onclick="clearCustomSlots()">Clear</button></p>`:""}</div></div>`;
  } else if(adminTab==="qa"){
    const open=S.questions.filter(q=>q.status==="open");
    b.innerHTML=`<div class="card"><h3>Q&A — ${open.length} open</h3>${[...S.questions].reverse().map(q=>`<div class="list-item"><strong>${esc(q.topic)}</strong> · ${q.status}<br>${esc(q.q)}${q.a?`<div class="coach-reply">${esc(q.a)}${q.links?.length?`<br><small>📚 ${q.links.map(esc).join(" · ")}</small>`:""}</div>`:`<br><br><textarea id="ans-${q.id}" rows="2" placeholder="Write reply + resource links…"></textarea><input id="anslinks-${q.id}" placeholder="Resource referrals (comma separated)" style="margin-top:6px"><button class="btn btn-xs btn-primary" style="margin-top:6px" onclick="adminReply('${q.id}')">Reply →</button>`}</div>`).join("")}</div>`;
  } else if(adminTab==="payments"){
    b.innerHTML=`<div class="card"><h3>Payments (Stripe test-mode · demo) — $${rev} total</h3><table><tr><th>Item</th><th>Amount</th><th>Status</th><th>Date</th></tr>${S.purchases.map(p=>`<tr><td>📚 ${esc(p.title)}</td><td>$${p.amount}</td><td>${p.status}</td><td>${p.date}</td></tr>`).join("")||"<tr><td colspan=4>No store purchases yet (demo).</td></tr>"}${S.bookings.map(x=>`<tr><td>📅 ${esc(x.service)} booking · ${esc(x.receipt||"")}</td><td>$${x.price||59}</td><td>${esc(x.paymentStatus||"paid")} (demo webhook)</td><td>${esc(x.slot)}</td></tr>`).join("")}</table><p class="muted">Real product: Stripe webhooks write here + provision access. Refunds via Bookings tab.</p></div>`;
  } else if(adminTab==="feedback"){
    b.innerHTML=`<div class="card"><h3>Give feedback</h3><p class="muted">Observations → improvements → resources → next steps → encouragement.</p><label>Context (assessment / exercise / consultation)</label><input id="fbCtx" placeholder="e.g. Assessment review"><label>Observations</label><textarea id="fbText" rows="2" placeholder="e.g. Sharon, your vision draft is strong on service…"></textarea><label>Areas to improve</label><input id="fbImp" placeholder="e.g. Tighten purpose to one sentence"><label>Suggested resources (comma separated)</label><input id="fbRes" placeholder="e.g. Purpose & Vision path, Vision Board exercise"><label>Next steps + encouragement</label><input id="fbNext" placeholder="e.g. Write 1-page vision — you're close!"><button class="btn btn-xs btn-primary" style="margin-top:8px" onclick="adminFeedback()">Send feedback →</button><div style="margin-top:10px">${S.feedback.map(f=>`<div class="coach-reply"><strong>${esc(f.context||f.contextType)}</strong><br>${esc(feedbackText(f)).slice(0,160)}</div>`).join("")}</div></div>`;
  } else if(adminTab==="comms"){
    b.innerHTML=`<div class="card"><h3>Announcements</h3><label>Message to all users</label><textarea id="ancText" rows="3" placeholder="e.g. New Confidence lessons are live 🌟"></textarea><button class="btn btn-xs btn-primary" style="margin-top:8px" onclick="sendAnnouncement()">Send announcement →</button><div style="margin-top:10px">${(S.announcements||[]).map(a=>`<div class="list-item">📢 ${esc(a)}</div>`).join("")||"<p class='muted'>No announcements yet.</p>"}</div></div>
    <div class="card" style="margin-top:12px"><h3>Reminders (useful, not overwhelming)</h3><p class="muted">Sessions, uncompleted activities, goals & milestones. Respects user mute prefs.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-xs" onclick="sendReminder('session')">📅 Session reminders</button><button class="btn btn-xs" onclick="sendReminder('activity')">📝 Nudge uncompleted actions</button><button class="btn btn-xs" onclick="sendReminder('goal')">🎯 Goal check-in</button></div></div>`;
  }
}

function adminReply(qid){
  const t=document.getElementById("ans-"+qid)?.value.trim(); if(!t){toast("Write a reply first.");return;}
  const links=(document.getElementById("anslinks-"+qid)?.value||"").split(",").map(s=>s.trim()).filter(Boolean);
  const q=S.questions.find(x=>x.id===qid); q.a=t+" — Coach"; q.status="answered"; if(links.length) q.links=links;
  pushNotif("Coach replied 💬",q.topic+" — with resources.","coach-response"); save(); renderAdmin("qa"); toast("Reply sent ✓");
}
function adminFeedback(){
  const t=document.getElementById("fbText").value.trim(); if(!t){toast("Write observations first.");return;}
  const ctx=document.getElementById("fbCtx")?.value.trim()||"Coach note";
  const imp=document.getElementById("fbImp")?.value.trim()||"";
  const res=(document.getElementById("fbRes")?.value||"").split(",").map(s=>s.trim()).filter(Boolean);
  const nxt=document.getElementById("fbNext")?.value.trim()||"";
  S.feedback.unshift({id:"fb"+Date.now(), contextType:"general", context:`${ctx} · Today`, date:"Today", observations:t, improvements:imp, resources:res, nextSteps:nxt, encouragement:nxt, body:t}); pushNotif("New coach feedback 💬","Check your profile.","coach-response"); save(); renderAdmin("feedback"); renderProfile(); toast("Feedback sent ✓");
}
function sendAnnouncement(){
  const t=document.getElementById("ancText").value.trim(); if(!t) return;
  S.announcements=S.announcements||[]; S.announcements.unshift(t); pushNotif("📢 "+t,"From your coach.","announcement"); save(); renderAdmin("comms"); toast("Announcement sent 📢");
}
function sendReminder(kind){
  if(kind==="session"){
    const up=S.bookings.filter(b=>b.status==="confirmed");
    pushNotif(up.length?`Session reminder: ${up[0].service} · ${up[0].slot}`:"No upcoming sessions — book a clarity call","Meeting link + prep inside.","session");
  } else if(kind==="activity"){
    const open=S.goals.flatMap(g=>g.actions.filter(a=>!a.done).map(a=>a.t)).slice(0,2);
    pushNotif(open.length?`Uncompleted: ${open.join(" · ")}`:"All actions done — celebrate 🎉","Small steps compound.","reminder");
  } else {
    const g=S.goals.find(x=>x.status!=="done");
    pushNotif(g?`Goal check-in: ${g.title}`:"Set your first goal today","Review progress in Goals.","goal");
  }
  save(); renderAdmin("comms"); toast("Reminder queued ✓ (respects mute prefs)");
}
function refundBooking(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  if(!confirm(`Refund $${b.price} for ${b.service}? (demo)`)) return;
  b.paymentStatus="refunded"; b.status="cancelled";
  pushNotif("Refund issued 💳",`${b.service} · $${b.price} · ${b.receipt}`,"recommendation");
  save(); renderAdmin("bookings"); toast("Refunded (demo) ✓");
}
/* Users detail */
function adminUserView(who){
  if(who==="me"){
    const a=S.assessAnswers||{};
    modal(`<h3>👤 ${esc(S.profile.name)} ${S.profile.isMinor?'<span class="tag">🔒 minor · safeguarding on</span>':""}</h3>
    <div class="list-item"><small>PROFILE</small><br><strong>${esc(S.profile.ageRange)}</strong> · ${esc((S.profile.interests||[]).join(", "))}<br><small>Improve: ${esc((S.profile.improveAreas||[]).join(", "))} · Career: ${esc(S.profile.career||"—")}</small></div>
    <div class="list-item"><small>ASSESSMENT</small><br>Strengths: <strong>${esc((a.strengths||[]).join(" · "))}</strong><br>Challenge: ${esc(a.challenges||"—")} · Confidence ${esc(a.confidence||"—")}/10<br>Purpose: ${esc(a.purpose||"—")}</div>
    <div class="list-item"><small>GOALS & PROGRESS</small><br>${S.goals.length} goals · ${Object.keys(S.completed).length} lessons done · ${S.journal.length} reflections (private 🔒)<br>${S.goals.map(g=>`· ${esc(g.title)} (${g.status})`).join("<br>")||"No goals"}</div>
    <p class="muted">🔒 Journals stay private in MVP. Coach sees reflections only if the user shares via “Ask coach about this”.</p>
    <div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="closeModal()">Done</button></div>`);
  } else {
    const demo={amara:["Amara, 19","18–24","Career, Confidence","5 lessons · 1 goal"],grace:["Grace, 17 🔒","16–17 (minor — guardian consent ✓)","Purpose","2 lessons · assessment done"],lydia:["Lydia, 34","33–40","Business, Leadership","9 lessons · 2 goals · 1 booking"]}[who];
    modal(`<h3>👤 ${demo[0]}</h3><div class="list-item">Age: <strong>${demo[1]}</strong><br>Focus: ${demo[2]}<br>Progress: ${demo[3]}</div><p class="muted">${who==="grace"?"🔒 Minor account: no community features, comms logged, extra care on.":"Demo row — real product loads live Prisma data here."}</p><button class="btn btn-primary" onclick="closeModal()">Done</button>`);
  }
}
/* Content CRUD */
function openLessonEditor(slug, lid){
  const p = slug ? PATHS.find(x=>x.slug===slug) : PATHS[0];
  const l = lid ? p.lessons.find(x=>x.id===lid) : null;
  const typeOpts=["article","video","audio","exercise","worksheet","reflection","guide"];
  modal(`<h3>${l?"Edit":"＋ New"} lesson ${l?`— ${esc(l.title)}`:""}</h3>
  <label>Path</label><select id="lePath">${PATHS.map(x=>`<option value="${x.slug}" ${x.slug===(p.slug)?"selected":""}>${x.title}</option>`).join("")}</select>
  <label>Type</label><select id="leType">${typeOpts.map(t=>`<option ${l?.type===t?"selected":""}>${t}</option>`).join("")}</select>
  <label>Title</label><input id="leTitle" value="${esc(l?.title||"")}" placeholder="e.g. Finding Your Voice at Work">
  <label>Minutes</label><input id="leMins" type="number" value="${l?.mins||10}">
  <label>Body</label><textarea id="leBody" rows="4" placeholder="Lesson content…">${esc(l?.body||"")}</textarea>
  <label>Reflection prompt</label><input id="lePrompt" value="${esc(l?.prompt||"")}" placeholder="What will you apply this week?">
  <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" onclick="saveLessonEditor('${slug||""}','${lid||""}')">Publish →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function saveLessonEditor(slug, lid){
  const targetSlug=document.getElementById("lePath").value;
  const data={type:document.getElementById("leType").value, title:document.getElementById("leTitle").value.trim(), mins:Number(document.getElementById("leMins").value)||8, body:document.getElementById("leBody").value.trim(), prompt:document.getElementById("lePrompt").value.trim()};
  if(!data.title||!data.body){toast("Title + body required.");return;}
  if(lid){
    const p=PATHS.find(x=>x.slug===slug); const l=p.lessons.find(x=>x.id===lid); Object.assign(l,data);
    if(targetSlug!==slug){ p.lessons=p.lessons.filter(x=>x.id!==lid); PATHS.find(x=>x.slug===targetSlug).lessons.push({id:lid,...data}); }
    toast("Lesson updated ✓");
  } else {
    PATHS.find(x=>x.slug===targetSlug).lessons.push({id:"l"+Date.now(), resources:[], ...data});
    pushNotif("New lesson published 📚",data.title,"recommendation");
    toast("Lesson published ✓");
  }
  saveContent(); closeModal(); renderAdmin("content"); renderPaths(); renderHome();
}
function delLesson(slug, lid){
  const p=PATHS.find(x=>x.slug===slug);
  if(!confirm(`Delete "${p.lessons.find(x=>x.id===lid)?.title}"?`)) return;
  p.lessons=p.lessons.filter(x=>x.id!==lid);
  saveContent(); renderAdmin("content"); renderPaths(); toast("Lesson deleted.");
}
function resetContentSeed(){ if(!confirm("Reset content to seed? Your published lessons will be lost.")) return; localStorage.removeItem(LS_CONTENT_KEY); location.reload(); }
function openProductEditor(pid){
  const p=pid?PRODUCTS.find(x=>x.id===pid):{type:"Resource",title:"",price:19,tag:"PDF",desc:"",color:"#6C00FF",fileName:"download.pdf",linkedPath:"purpose"};
  modal(`<h3>${pid?"Edit":"＋ New"} product</h3><label>Title</label><input id="peTitle" value="${esc(p.title)}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label>Type</label><select id="peType">${["Book","Course","Resource"].map(t=>`<option ${p.type===t?"selected":""}>${t}</option>`).join("")}</select></div><div><label>Price ($)</label><input id="pePrice" type="number" value="${p.price}"></div></div><label>Tag</label><input id="peTag" value="${esc(p.tag||"")}"><label>Description</label><textarea id="peDesc" rows="2">${esc(p.desc||"")}</textarea><label>Linked path</label><select id="peLink">${PATHS.map(x=>`<option value="${x.slug}" ${p.linkedPath===x.slug?"selected":""}>${x.title}</option>`).join("")}</select><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" onclick="saveProduct('${pid||""}')">Save →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function saveProduct(pid){
  const data={title:document.getElementById("peTitle").value.trim(), type:document.getElementById("peType").value, price:Number(document.getElementById("pePrice").value)||0, tag:document.getElementById("peTag").value.trim()||"New", desc:document.getElementById("peDesc").value.trim(), linkedPath:document.getElementById("peLink").value, color:"#6C00FF", fileName:"download.pdf"};
  if(!data.title){toast("Title required.");return;}
  if(pid) Object.assign(PRODUCTS.find(x=>x.id===pid), data);
  else PRODUCTS.unshift({id:"p"+Date.now(), ...data});
  saveContent(); closeModal(); renderAdmin("content"); renderStore(); toast("Product saved ✓");
}
function delProduct(pid){ if(!confirm("Delete this product?")) return; PRODUCTS=PRODUCTS.filter(x=>x.id!==pid); saveContent(); renderAdmin("content"); renderStore(); }
/* Services & slots */
function openServiceEditor(sid){
  const s=sid?SERVICES.find(x=>x.id===sid):{title:"",dur:"30 min",price:49,desc:"",tag:""};
  modal(`<h3>${sid?"Edit":"＋ New"} service</h3><label>Title</label><input id="seTitle" value="${esc(s.title)}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div><label>Duration</label><input id="seDur" value="${esc(s.dur)}"></div><div><label>Price ($)</label><input id="sePrice" type="number" value="${s.price}"></div></div><label>Description</label><textarea id="seDesc" rows="2">${esc(s.desc||"")}</textarea><label>Tag (optional)</label><input id="seTag" value="${esc(s.tag||"")}"><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" onclick="saveService('${sid||""}')">Save →</button><button class="btn" onclick="closeModal()">Cancel</button></div>`);
}
function saveService(sid){
  const data={title:document.getElementById("seTitle").value.trim(), dur:document.getElementById("seDur").value.trim()||"30 min", price:Number(document.getElementById("sePrice").value)||0, desc:document.getElementById("seDesc").value.trim(), tag:document.getElementById("seTag").value.trim()};
  if(!data.title){toast("Title required.");return;}
  if(sid) Object.assign(SERVICES.find(x=>x.id===sid), data);
  else SERVICES.push({id:"s"+Date.now(), ...data});
  saveContent(); closeModal(); renderAdmin("bookings"); toast("Service saved ✓");
}
function delService(sid){ if(SERVICES.length<=1){toast("Keep at least 1 service.");return;} if(!confirm("Delete this service?")) return; SERVICES=SERVICES.filter(x=>x.id!==sid); if(book.service.id===sid) book.service=SERVICES[0]; saveContent(); renderAdmin("bookings"); }
function addSlot(){
  const v=document.getElementById("newSlot").value.trim(); if(!v){toast("Type a slot label first.");return;}
  S.customSlots=S.customSlots||[]; S.customSlots.push({id:"c"+Date.now(), label:v, day:v.split("·")[0]?.trim()||"", time:v.split("·")[1]?.trim()||"", booked:false});
  save(); renderAdmin("bookings"); toast("Availability added ✓");
}
function clearCustomSlots(){ S.customSlots=[]; save(); renderAdmin("bookings"); }
function toggleSlotBlock(label){
  const c=(S.customSlots||[]).find(x=>x.label===label);
  if(c){ c.booked=!c.booked; }
  else { S.customSlots=S.customSlots||[]; S.customSlots.push({id:"c"+Date.now(), label, day:"", time:"", booked:true}); }
  save(); renderAdmin("bookings"); toast("Availability updated ✓");
}

/* ---------- boot ---------- */
function renderAll(){ renderHome(); renderDashboard(); renderPaths(); renderGoals(); renderJournal(); renderSaved(); renderJourney(); renderAsk(); renderBook(); renderStore(); renderProfile(); updateBadge(); save(); }
// assessment entry point from buttons
document.querySelectorAll("[onclick*=\"showView('assessment')\"]");
const _origShow=showView;
showView=function(name){ if(name==="assessment"&&assessIdx===0&&!document.getElementById("assessCard").dataset.init){draft={...S.assessAnswers};document.getElementById("assessCard").dataset.init="1";renderAssess();} _origShow(name); if(name==="assessment"&&!document.getElementById("assessCard").innerHTML) renderAssess(); };
draft={...S.assessAnswers};
renderAssess(); renderAll(); showView("home");
