const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const ctx=vm.createContext({module:{exports:{}}});vm.runInContext(scripts.find(s=>s.includes('const DEFAULT_RULES')),ctx);
const C=ctx.module.exports,plain=x=>JSON.parse(JSON.stringify(x));
function fixture(){
 const s=C.empty(),names=['Nz','1000円くれ(🌽)','すみ猫','れんこん','マッカーサー','マ姉','いった','えぐっぴ','cactus','ジョージ','む','山ちゃん'];
 s.current.players=C.roster(names.join('\n'));C.assignLeagues(s.current.players,2);s.current.matches=C.leagueSchedule(s.current.players,1);
 for(const m of C.list(s.current.matches))C.record(s.current,m.id,'a');
 s.current.info.phase='live';s.revision=1;return s;
}
const s=fixture(),before=plain(s.current.matches);C.createRequestedPlayoff(s.current,3);
const p=s.current.playoff,view=C.playoffView(s.current),name=id=>p.entrants[id]?.name;
assert.deepEqual(plain(s.current.matches),before);assert.equal(p.bestOf,3);
assert.equal(name(p.matches.r1s0.a),'1000円くれ(🌽)');assert.equal(p.matches.r1s0.status,'bye');
assert.deepEqual([name(p.matches.r1s1.a),name(p.matches.r1s1.b)],['れんこん','えぐっぴ']);
assert.equal(name(p.matches.r1s2.a),'Nz');assert.equal(p.matches.r1s2.status,'bye');
assert.deepEqual([name(p.matches.r1s3.a),name(p.matches.r1s3.b)],['マッカーサー','ジョージ']);
C.recordScoreStage(s.current,'r1s1',2,1,'playoff');C.recordScoreStage(s.current,'r1s3',1,2,'playoff');
assert.deepEqual([name(p.matches.r2s0.a),name(p.matches.r2s0.b)],['1000円くれ(🌽)','れんこん']);
assert.deepEqual([name(p.matches.r2s1.a),name(p.matches.r2s1.b)],['Nz','ジョージ']);
assert.throws(()=>C.createRequestedPlayoff(s.current,3),/保護/);
C.recordScoreStage(s.current,'r2s0',1,2,'playoff');C.recordScoreStage(s.current,'r2s1',2,0,'playoff');
assert.deepEqual([name(p.matches.r3s0.a),name(p.matches.r3s0.b)],['れんこん','Nz']);
C.recordScoreStage(s.current,'r3s0',1,2,'playoff');assert.equal(name(p.matches.r3s0.winner),'Nz');
C.recordScoreStage(s.current,'r1s1',1,2,'playoff');assert.equal(p.matches.r2s0.scoreA,0);assert.equal(p.matches.r3s0.status,'pending');assert.equal(p.matches.r2s1.scoreA,2);
for(const score of [[2,2],[-1,2],[3,0],[1.5,0],[NaN,0]])assert.throws(()=>C.recordScore(view,'r1s1',...score));
const fresh=fixture();C.createRequestedPlayoff(fresh.current,3);C.recordScoreStage(fresh.current,'r1s1',1,1,'playoff');assert.equal(fresh.current.playoff.matches.r1s1.status,'pending');
assert.throws(()=>C.recordScoreStage(fresh.current,'r1s0',2,0,'playoff'));
for(let n=2;n<=32;n++)for(const bestOf of [1,3]){
 const players=C.roster(Array.from({length:n},(_,i)=>'選手'+(i+1)).join('\n')),current={info:{format:'knockout'},players,matches:C.schedule(players,'knockout',bestOf)};
 const first=C.list(current.matches).filter(m=>m.round===1),used=first.flatMap(m=>[m.a,m.b]).filter(Boolean);
 assert.equal(new Set(used).size,n);assert.equal(used.length,n);
 if(n===6)assert.equal(first.filter(m=>m.status==='bye').map(m=>Math.floor(m.slot/2)).join(','),'0,1');
 for(const m of C.list(current.matches).sort((a,b)=>a.round-b.round||a.slot-b.slot))if(m.status!=='bye')C.recordScore(current,m.id,(bestOf+1)/2,0);
 assert(C.list(current.matches).every(m=>m.status!=='pending'));
}
for(const script of scripts)new vm.Script(script);
module.exports={fixture,C,html};
if(require.main===module)console.log('PASS: requested six-player bracket, 2–1/2–0 scoring, winner advancement, downstream-only correction resets, preserved leagues, invalid scores, 2–32 players and both match formats');
