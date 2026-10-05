const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'cases.json');
const USERS_FILE = path.join(ROOT, 'data', 'users.json');
const UPLOAD_DIR = path.join(ROOT, 'uploads');

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(ROOT, 'public')));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  }
});

function readUsers() { try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return []; } }
function writeUsers(users) { const temp = USERS_FILE + '.tmp'; fs.writeFileSync(temp, JSON.stringify(users, null, 2)); fs.renameSync(temp, USERS_FILE); }
function hashPassword(password) { return crypto.createHash('sha256').update(String(password)).digest('hex'); }
const sessions = new Map();
function makeSession(user) { const token = crypto.randomBytes(24).toString('hex'); sessions.set(token, { userId:user.id, createdAt:Date.now() }); return token; }
function authUser(req) { const token = req.headers.authorization?.replace(/^Bearer\s+/i,''); const session = token ? sessions.get(token) : null; if (!session) return null; return readUsers().find(u=>u.id===session.userId) || null; }
function publicUser(u) { return u ? { id:u.id, name:u.name, email:u.email } : null; }
function readCases() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return []; }
}
function writeCases(cases) {
  const temp = DATA_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(cases, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
function now() { return new Date().toISOString(); }
function id(prefix='AC') { return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`; }
function safeCase(c) {
  return { ...c, documents: (c.documents || []).map(d => ({ id:d.id, name:d.name, type:d.type, size:d.size, uploadedAt:d.uploadedAt })) };
}

const DEMO_CASE = () => {
  const created = now();
  return {
    id: 'AC-DEMO01',
    title: 'Scholarship disbursement',
    goal: 'Receive my approved scholarship payment.',
    problem: 'My scholarship was approved two months ago but I still have not received the payment.',
    category: 'Education / Scholarship',
    status: 'MONITORING',
    stage: 'monitoring',
    progress: 78,
    confidence: 94,
    priority: 'Medium',
    deadline: new Date(Date.now()+24*60*60*1000).toISOString(),
    createdAt: created,
    updatedAt: created,
    documents: [
      { id:'doc-1', name:'scholarship-approval.pdf', type:'application/pdf', size:184000, uploadedAt:created },
      { id:'doc-2', name:'fee-receipt.pdf', type:'application/pdf', size:97000, uploadedAt:created },
      { id:'doc-3', name:'application-confirmation.pdf', type:'application/pdf', size:121000, uploadedAt:created }
    ],
    evidence: [
      { id:'ev1', title:'Scholarship approval confirmed', source:'scholarship-approval.pdf · page 2', confidence:96, kind:'verified' },
      { id:'ev2', title:'Application reference found', source:'application-confirmation.pdf · page 1', confidence:99, kind:'verified' },
      { id:'ev3', title:'Payment confirmation missing', source:'Cross-document check', confidence:92, kind:'missing' }
    ],
    steps: [
      { id:'s1', label:'Understand goal', status:'done', detail:'Outcome identified as scholarship payment.' },
      { id:'s2', label:'Collect evidence', status:'done', detail:'3 documents analyzed.' },
      { id:'s3', label:'Build action plan', status:'done', detail:'Dependency-aware plan created.' },
      { id:'s4', label:'Human approval', status:'done', detail:'Status request approved.' },
      { id:'s5', label:'Submit request', status:'done', detail:'Demo request submitted.' },
      { id:'s6', label:'Monitor response', status:'active', detail:'Waiting for institution response.' },
      { id:'s7', label:'Recover if blocked', status:'next', detail:'Follow-up ready if response window expires.' },
      { id:'s8', label:'Verify resolution', status:'next', detail:'Requires payment evidence.' }
    ],
    plan: [
      { n:1, label:'Verify approval', state:'complete' },
      { n:2, label:'Confirm payment requirement', state:'complete' },
      { n:3, label:'Prepare status request', state:'complete' },
      { n:4, label:'Request human approval', state:'complete' },
      { n:5, label:'Submit request', state:'complete' },
      { n:6, label:'Monitor response', state:'active' },
      { n:7, label:'Follow up if overdue', state:'queued' },
      { n:8, label:'Verify payment', state:'queued' }
    ],
    blockers: [{ id:'b1', severity:'warning', title:'Response window is almost due', detail:'No payment confirmation is present yet. The next recovery action is a follow-up request.', state:'open' }],
    events: [
      { time:created, icon:'spark', title:'Case created', detail:'AFTERCARE received the goal.' },
      { time:created, icon:'check', title:'Evidence verified', detail:'3 supporting documents connected to the case.' },
      { time:created, icon:'plan', title:'Action plan generated', detail:'8-step completion plan created.' },
      { time:created, icon:'user', title:'Human approval recorded', detail:'Status request approved by user.' },
      { time:created, icon:'send', title:'Request submitted', detail:'External action simulated in Demo Mode.' },
      { time:new Date(Date.now()+1000).toISOString(), icon:'watch', title:'Monitoring active', detail:'Watching for response and resolution evidence.' }
    ],
    approvals: [],
    audit: [],
    resolution: null,
    demoStep: 0,
    mode:'demo', notes:''
  };
};

function createDemoIfEmpty() {
  const users = readUsers();
  let demo = users.find(u=>u.email==='demo@aftercare.app');
  if (!demo) { demo={id:'USR-DEMO01',name:'Rakshana',email:'demo@aftercare.app',passwordHash:hashPassword('aftercare123'),createdAt:now()}; users.push(demo); writeUsers(users); }
  const cases = readCases();
  if (!cases.length) { const demoCase=DEMO_CASE(); demoCase.userId=demo.id; cases.push(demoCase); writeCases(cases); }
  else { let changed=false; cases.forEach(c=>{ if(!c.userId){c.userId=demo.id;changed=true;} }); if(changed) writeCases(cases); }
}
createDemoIfEmpty();

app.post('/api/auth/login',(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(); const password=String(req.body.password||'');
  const user=readUsers().find(u=>u.email===email && u.passwordHash===hashPassword(password));
  if(!user)return res.status(401).json({error:'Incorrect email or password'});
  const token=makeSession(user); res.json({token,user:publicUser(user)});
});
app.post('/api/auth/signup',(req,res)=>{
  const name=String(req.body.name||'').trim(); const email=String(req.body.email||'').trim().toLowerCase(); const password=String(req.body.password||'');
  if(name.length<2)return res.status(400).json({error:'Please enter your name'});
  if(!email.includes('@'))return res.status(400).json({error:'Enter a valid email'});
  if(password.length<6)return res.status(400).json({error:'Password must be at least 6 characters'});
  const users=readUsers(); if(users.some(u=>u.email===email))return res.status(409).json({error:'An account with this email already exists'});
  const user={id:id('USR'),name,email,passwordHash:hashPassword(password),createdAt:now()}; users.push(user); writeUsers(users);
  const token=makeSession(user); res.status(201).json({token,user:publicUser(user)});
});
app.get('/api/auth/me',(req,res)=>{const user=authUser(req); if(!user)return res.status(401).json({error:'Not signed in'}); res.json({user:publicUser(user)});});
app.post('/api/auth/logout',(req,res)=>{const token=req.headers.authorization?.replace(/^Bearer\s+/i,''); if(token)sessions.delete(token); res.json({ok:true});});

app.get('/api/health', (_req,res)=>res.json({ ok:true, product:'AFTERCARE', time:now(), ai:!!process.env.OPENAI_API_KEY }));
app.get('/api/cases', (req,res)=>{ const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'}); res.json(readCases().filter(c=>c.userId===user.id).map(safeCase)); });
app.get('/api/cases/:caseId', (req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const c=readCases().find(x=>x.id===req.params.caseId && x.userId===user.id);
  if(!c) return res.status(404).json({error:'Case not found'});
  res.json(c);
});

app.post('/api/cases', upload.array('documents',6), async (req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const goal=(req.body.goal||'').trim();
  const problem=(req.body.problem||goal).trim();
  if(!goal) return res.status(400).json({error:'Goal is required'});
  const created=now();
  const docs=(req.files||[]).map(f=>({id:id('DOC'),name:f.originalname,type:f.mimetype,size:f.size,uploadedAt:created,path:f.filename}));
  const c={
    id:id('AC'), userId:user.id, title: goal.length>42 ? goal.slice(0,42)+'…' : goal,
    goal, problem, category:'General process', status:'ANALYZING', stage:'intake', progress:12, confidence:86, priority:'Medium',
    deadline:new Date(Date.now()+3*24*60*60*1000).toISOString(),createdAt:created,updatedAt:created,documents:docs,
    evidence:[],steps:[
      {id:'s1',label:'Understand goal',status:'active',detail:'Intake Agent is structuring the requested outcome.'},
      {id:'s2',label:'Collect evidence',status:'next',detail:'Evidence Agent will inspect uploaded material.'},
      {id:'s3',label:'Build action plan',status:'next',detail:'Planning Agent will map dependencies.'},
      {id:'s4',label:'Human approval',status:'next',detail:'Consequential actions require approval.'},
      {id:'s5',label:'Execute',status:'next',detail:'Approved actions are executed or simulated.'},
      {id:'s6',label:'Monitor',status:'next',detail:'Monitoring Agent watches state over time.'},
      {id:'s7',label:'Recover',status:'next',detail:'Blockers trigger replanning and follow-up.'},
      {id:'s8',label:'Verify resolution',status:'next',detail:'The original goal must be evidence-backed.'}
    ],plan:[],blockers:[],events:[{time:created,icon:'spark',title:'Case created',detail:'Intake Agent started the case.'}],approvals:[],audit:[],resolution:null,demoStep:0,mode:'demo',notes:''
  };
  const cases=readCases(); cases.unshift(c); writeCases(cases);
  // Deterministic local workflow so the product works without an API key.
  setTimeout(()=>runLocalAnalysis(c.id), 150);
  res.status(201).json(c);
});

async function runLocalAnalysis(caseId){
  const cases=readCases(); const c=cases.find(x=>x.id===caseId); if(!c)return;
  c.category = /scholar|college|university|admission/i.test(c.goal) ? 'Education / Student services' : /refund|return|payment|reimburse/i.test(c.goal) ? 'Finance / Resolution' : 'General process';
  c.confidence = Math.min(97, 82 + Math.min(14,(c.documents||[]).length*4));
  c.progress=42; c.status='WAITING_FOR_APPROVAL'; c.stage='planning';
  c.evidence=(c.documents||[]).map((d,i)=>({id:id('EV'),title:`Document received: ${d.name}`,source:d.name,confidence:90+i,kind:'uploaded'}));
  if(!c.evidence.length)c.evidence=[{id:id('EV'),title:'No supporting document uploaded yet',source:'User input',confidence:72,kind:'missing'}];
  c.plan=[{n:1,label:'Clarify desired outcome',state:'complete'},{n:2,label:'Validate available evidence',state:'complete'},{n:3,label:'Prepare the safest next action',state:'active'},{n:4,label:'Request human approval',state:'queued'},{n:5,label:'Execute approved action',state:'queued'},{n:6,label:'Monitor response',state:'queued'},{n:7,label:'Recover if blocked',state:'queued'},{n:8,label:'Verify final outcome',state:'queued'}];
  c.steps.forEach((s,i)=>s.status=i<2?'done':i===2?'active':'next');
  c.events.push({time:now(),icon:'evidence',title:'Evidence Agent finished',detail:`${c.evidence.length} evidence item(s) connected to the case.`});
  c.events.push({time:now(),icon:'plan',title:'Planning Agent created a recovery-aware plan',detail:'Consequential actions are gated by human approval.'});
  c.updatedAt=now(); writeCases(cases);
}

app.post('/api/cases/:caseId/demo', (req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases(); const c=cases.find(x=>x.id===req.params.caseId && x.userId===user.id); if(!c)return res.status(404).json({error:'Case not found'});
  const action=req.body.action;
  const t=now();
  if(action==='advance'){
    c.demoStep=(c.demoStep||0)+1;
    const stages=['intake','evidence','planning','approval','action','monitoring','blocked','recovery','verification','complete'];
    const stage=stages[Math.min(c.demoStep,stages.length-1)]; c.stage=stage;
    if(stage==='evidence'){c.progress=28;c.status='EVIDENCE_COLLECTION';}
    if(stage==='planning'){c.progress=42;c.status='PLANNING';}
    if(stage==='approval'){c.progress=52;c.status='WAITING_FOR_APPROVAL';c.approvals.push({id:id('APR'),action:'Send next-step request',status:'pending',createdAt:t});}
    if(stage==='action'){c.progress=64;c.status='ACTION_EXECUTED';c.approvals.forEach(a=>a.status='approved');c.events.push({time:t,icon:'send',title:'Approved action executed',detail:'External action is simulated and clearly labeled.'});}
    if(stage==='monitoring'){c.progress=72;c.status='MONITORING';}
    if(stage==='blocked'){c.progress=74;c.status='BLOCKED';c.blockers=[{id:id('BLK'),severity:'warning',title:'Expected response window exceeded',detail:'No resolution evidence has arrived. Recovery is now required.',state:'open'}];c.events.push({time:t,icon:'alert',title:'Monitoring Agent detected a blocker',detail:'Case moved to recovery.'});}
    if(stage==='recovery'){c.progress=82;c.status='FOLLOW_UP_REQUIRED';c.approvals=[{id:id('APR'),action:'Approve follow-up request',status:'pending',createdAt:t}];c.events.push({time:t,icon:'refresh',title:'Recovery plan prepared',detail:'Follow-up generated from the current state.'});}
    if(stage==='verification'){c.progress=92;c.status='RESOLUTION_VERIFICATION';c.resolution={pending:true,message:'Waiting for resolution evidence.'};}
    if(stage==='complete'){c.progress=100;c.status='COMPLETED';c.resolution={pending:false,message:'Original goal verified with supporting evidence.',verifiedAt:t};c.blockers=[];c.events.push({time:t,icon:'check',title:'Resolution verified',detail:'The original goal is supported by final evidence.'});}
    c.steps.forEach((s,i)=>{s.status=i < Math.min(c.demoStep,8) ? 'done' : i===Math.min(c.demoStep,7)?'active':'next'});
    c.updatedAt=t; writeCases(cases); return res.json(c);
  }
  if(action==='simulate-delay'){
    c.status='BLOCKED';c.stage='blocked';c.progress=Math.max(c.progress||70,74);c.blockers=[{id:id('BLK'),severity:'warning',title:'Response overdue',detail:'No response arrived inside the expected window. Recovery is required.',state:'open'}];c.events.push({time:t,icon:'alert',title:'Blocker detected',detail:'Monitoring Agent detected an overdue response.'});c.updatedAt=t;writeCases(cases);return res.json(c);
  }
  if(action==='approve'){
    const pending=(c.approvals||[]).find(a=>a.status==='pending');
    if(pending) pending.status='approved';
    c.status='ACTION_EXECUTED';c.stage='action';c.progress=Math.max(c.progress||60,86);c.events.push({time:t,icon:'user',title:'Human approval recorded',detail:'User approved the recommended consequential action.'});c.events.push({time:t,icon:'send',title:'Action executed',detail:'Demo external action executed safely.'});c.updatedAt=t;writeCases(cases);return res.json(c);
  }
  if(action==='resolve'){
    c.status='COMPLETED';c.stage='complete';c.progress=100;c.blockers=[];c.resolution={pending:false,message:'Original goal verified with final resolution evidence.',verifiedAt:t};c.events.push({time:t,icon:'check',title:'Resolution verified',detail:'Verification Agent confirmed the original goal.'});c.updatedAt=t;writeCases(cases);return res.json(c);
  }
  res.status(400).json({error:'Unknown demo action'});
});

app.post('/api/cases/:caseId/reset-demo', (req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases(); const idx=cases.findIndex(x=>x.id===req.params.caseId && x.userId===user.id); if(idx<0)return res.status(404).json({error:'Case not found'});
  cases[idx]=DEMO_CASE(); cases[idx].userId=user.id; writeCases(cases); res.json(cases[idx]);
});

app.post('/api/cases/:caseId/approve', (req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases(); const c=cases.find(x=>x.id===req.params.caseId && x.userId===user.id); if(!c)return res.status(404).json({error:'Case not found'});
  const pending=(c.approvals||[]).find(a=>a.status==='pending'); if(!pending)return res.status(400).json({error:'No pending approval'});
  pending.status='approved'; pending.approvedAt=now(); c.status='ACTION_EXECUTED';c.progress=Math.min(96,(c.progress||60)+12);c.events.push({time:now(),icon:'user',title:'Human approval recorded',detail:'Approved action is now eligible for execution.'});c.updatedAt=now();writeCases(cases);res.json(c);
});

app.patch('/api/cases/:caseId',(req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases(); const c=cases.find(x=>x.id===req.params.caseId && x.userId===user.id); if(!c)return res.status(404).json({error:'Case not found'});
  if(typeof req.body.notes==='string') c.notes=req.body.notes.slice(0,4000);
  if(['Low','Medium','High'].includes(req.body.priority)) c.priority=req.body.priority;
  if(req.body.deadline && !Number.isNaN(Date.parse(req.body.deadline))) c.deadline=new Date(req.body.deadline).toISOString();
  c.updatedAt=now(); c.events=c.events||[]; c.events.push({time:c.updatedAt,icon:'check',title:'Case details updated',detail:'Priority, deadline or notes were updated by the user.'}); writeCases(cases); res.json(c);
});
app.post('/api/cases/:caseId/duplicate',(req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases(); const original=cases.find(x=>x.id===req.params.caseId && x.userId===user.id); if(!original)return res.status(404).json({error:'Case not found'});
  const created=now(); const copy=JSON.parse(JSON.stringify(original)); copy.id=id('AC'); copy.userId=user.id; copy.title=`Copy of ${original.title}`.slice(0,60); copy.status='ANALYZING'; copy.stage='intake'; copy.progress=12; copy.createdAt=created; copy.updatedAt=created; copy.events=[{time:created,icon:'spark',title:'Case duplicated',detail:'A new case was created from an existing case.'}]; copy.approvals=[]; copy.blockers=[]; copy.resolution=null; copy.demoStep=0; cases.unshift(copy); writeCases(cases); res.status(201).json(copy);
});

app.delete('/api/cases/:caseId',(req,res)=>{
  const user=authUser(req); if(!user)return res.status(401).json({error:'Please sign in'});
  const cases=readCases();const next=cases.filter(c=>!(c.id===req.params.caseId && c.userId===user.id));if(next.length===cases.length)return res.status(404).json({error:'Case not found'});writeCases(next);res.json({ok:true});
});

app.get('*', (req,res)=>res.sendFile(path.join(ROOT,'public','index.html')));

app.use((err,_req,res,_next)=>{ console.error(err); res.status(500).json({error:err.message||'Unexpected server error'}); });
app.listen(PORT,()=>console.log(`AFTERCARE running at http://localhost:${PORT}`));
