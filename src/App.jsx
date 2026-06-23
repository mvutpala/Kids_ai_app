import { useState, useEffect, useRef } from "react";

// ── Colors & constants ───────────────────────────────────────────
const C = {
  sky:"#4FC3F7",sun:"#FFD54F",grass:"#66BB6A",coral:"#FF7043",
  purple:"#AB47BC",pink:"#EC407A",mint:"#26C6DA",orange:"#FFA726",
  white:"#FFFFFF",soft:"#F0F9FF",dark:"#1A237E",muted:"#546E7A",card:"#FFFDF7",
};
const MAX_MS = 60*60*1000;

// ── Profiles ─────────────────────────────────────────────────────
const PROFILES = [
  { id:"a", name:"Kid 1", age:9,  emoji:"🦁", color:C.coral,  bg:"#FFF3F0", badge:"Super Solver",   maxDiff:5 },
  { id:"b", name:"Kid 2", age:5,  emoji:"🐰", color:C.purple, bg:"#F9F0FF", badge:"Math Explorer",  maxDiff:2 },
];

// ── Helpers ──────────────────────────────────────────────────────
const rnd = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const fmtN = n => n.toLocaleString("en-US");
function formatTime(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

// ── Word problem templates ───────────────────────────────────────
const WORD_TMPL = {
  "+":[
    (a,b)=>`There are ${fmtN(a)} apples in a basket. Mama Manasa adds ${fmtN(b)} more. How many apples are there now?`,
    (a,b)=>`A rocket traveled ${fmtN(a)} miles on Monday and ${fmtN(b)} miles on Tuesday. How many miles total? 🚀`,
    (a,b)=>`A zoo has ${fmtN(a)} animals. ${fmtN(b)} more arrive. How many animals are in the zoo? 🦁`,
    (a,b)=>`You scored ${fmtN(a)} points in a game, then scored ${fmtN(b)} more. What is your total score? 🎮`,
    (a,b)=>`A library has ${fmtN(a)} books. The librarian adds ${fmtN(b)} new ones. How many books total? 📚`,
  ],
  "-":[
    (a,b)=>`There are ${fmtN(a)} cookies on a plate. ${fmtN(b)} cookies are eaten. How many cookies are left? 🍪`,
    (a,b)=>`A store has ${fmtN(a)} toys. It sells ${fmtN(b)} of them. How many toys remain? 🧸`,
    (a,b)=>`You have ${fmtN(a)} stickers. You give ${fmtN(b)} to your friend. How many do you have left? ✨`,
    (a,b)=>`A school has ${fmtN(a)} students. ${fmtN(b)} go on a field trip. How many are still at school? 🏫`,
    (a,b)=>`A farmer had ${fmtN(a)} carrots. ${fmtN(b)} were eaten by rabbits. How many carrots are left? 🥕`,
  ],
  "×":[
    (a,b)=>`There are ${fmtN(a)} bags of candy. Each bag has ${fmtN(b)} pieces. How many pieces total? 🍬`,
    (a,b)=>`${fmtN(a)} classrooms each have ${fmtN(b)} desks. How many desks altogether? 🏫`,
    (a,b)=>`Each pizza has ${fmtN(b)} slices. There are ${fmtN(a)} pizzas. How many slices in all? 🍕`,
    (a,b)=>`A dinosaur eats ${fmtN(a)} fish every day. How many fish in ${fmtN(b)} days? 🦕`,
    (a,b)=>`${fmtN(a)} boxes each hold ${fmtN(b)} crayons. How many crayons total? 🖍️`,
  ],
  "÷":[
    (a,b)=>`${fmtN(a)} candies are shared equally among ${fmtN(b)} children. How many does each child get? 🍬`,
    (a,b)=>`${fmtN(a)} stickers are packed into ${fmtN(b)} equal bags. How many stickers per bag? 🎒`,
    (a,b)=>`${fmtN(a)} books are placed equally on ${fmtN(b)} shelves. How many books per shelf? 📚`,
    (a,b)=>`${fmtN(a)} marbles are split equally into ${fmtN(b)} jars. How many marbles in each jar? 🔵`,
    (a,b)=>`A farmer plants ${fmtN(a)} seeds equally in ${fmtN(b)} rows. How many seeds per row? 🌱`,
  ],
};
function makeWord(op, a, b, ans) {
  const t = WORD_TMPL[op][rnd(0, WORD_TMPL[op].length - 1)];
  return { question: t(a, b), answer: ans, op, a, b, isWord: true };
}

// ── SUBJECTS ─────────────────────────────────────────────────────
const SUBJECTS = {
  addition: {
    label:"Addition", icon:"➕", color:"#29B6F6", desc:"Add numbers together",
    generate(diff) {
      const ranges = [[1,10],[10,99],[100,999],[1000,9999],[10000,99999]];
      const [lo,hi] = ranges[Math.min(diff,5)-1];
      // diff 3 → sometimes 3 addends; diff 4+ → sometimes 4 addends
      const count = diff >= 4 && Math.random()<0.6 ? rnd(3,4) : diff >= 3 && Math.random()<0.6 ? 3 : 2;
      const nums = Array.from({length:count}, ()=>rnd(lo,hi));
      const answer = nums.reduce((s,n)=>s+n, 0);
      const question = nums.map(fmtN).join(" + ") + " = ?";
      return { question, answer, op:"+", nums, a:nums[0], b:nums[1], isWord:false };
    },
    generateWord(diff) {
      const ranges = [[1,10],[10,99],[100,999],[1000,9999],[10000,99999]];
      const [lo,hi] = ranges[Math.min(diff,5)-1];
      const a=rnd(lo,hi), b=rnd(lo,hi);
      return makeWord("+", a, b, a+b);
    },
  },
  subtraction: {
    label:"Subtraction", icon:"➖", color:C.coral, desc:"Subtract one number from another",
    generate(diff) {
      const ranges = [[2,10],[11,99],[101,999],[1001,9999],[10001,99999]];
      const [lo,hi] = ranges[Math.min(diff,5)-1];
      // diff 3+ → sometimes subtract 2 or 3 values from a starting number
      const subCount = diff >= 4 && Math.random()<0.5 ? rnd(2,3) : diff >= 3 && Math.random()<0.5 ? 2 : 1;
      const start = rnd(Math.ceil(hi*0.55), hi);
      const subs = [];
      let budget = start - 1; // must leave at least 1
      for(let i=0; i<subCount; i++){
        const maxSub = Math.floor(budget / (subCount - i));
        const s = rnd(lo, Math.max(lo, maxSub));
        subs.push(s); budget -= s;
      }
      const nums = [start, ...subs];
      const answer = start - subs.reduce((t,n)=>t+n, 0);
      const question = `${fmtN(start)} - ${subs.map(fmtN).join(" - ")} = ?`;
      return { question, answer, op:"-", nums, a:start, b:subs[0], isWord:false };
    },
    generateWord(diff) {
      const ranges = [[2,10],[11,99],[101,999],[1001,9999],[10001,99999]];
      const [lo,hi] = ranges[Math.min(diff,5)-1];
      const a=rnd(lo,hi), b=rnd(1, a-1);
      return makeWord("-", a, b, a-b);
    },
  },
  multiplication: {
    label:"Multiplication", icon:"✖️", color:C.purple, desc:"Multiply numbers together",
    generate(diff) {
      if(diff<=1){ const a=rnd(1,5),b=rnd(1,5); return {question:`${a} × ${b} = ?`,answer:a*b,op:"×",a,b,isWord:false}; }
      if(diff===2){ const a=rnd(1,10),b=rnd(1,10); return {question:`${a} × ${b} = ?`,answer:a*b,op:"×",a,b,isWord:false}; }
      if(diff===3){ const a=rnd(10,99),b=rnd(2,9); return {question:`${fmtN(a)} × ${b} = ?`,answer:a*b,op:"×",a,b,isWord:false}; }
      if(diff===4){ const a=rnd(100,999),b=rnd(2,9); return {question:`${fmtN(a)} × ${b} = ?`,answer:a*b,op:"×",a,b,isWord:false}; }
      const a=rnd(100,999),b=rnd(10,99); return {question:`${fmtN(a)} × ${b} = ?`,answer:a*b,op:"×",a,b,isWord:false};
    },
    generateWord(diff) {
      if(diff<=1){ const a=rnd(1,5),b=rnd(1,5); return makeWord("×",a,b,a*b); }
      if(diff===2){ const a=rnd(1,10),b=rnd(1,10); return makeWord("×",a,b,a*b); }
      if(diff===3){ const a=rnd(2,9),b=rnd(10,99); return makeWord("×",a,b,a*b); }
      if(diff===4){ const a=rnd(2,9),b=rnd(100,999); return makeWord("×",a,b,a*b); }
      const a=rnd(10,99),b=rnd(10,99); return makeWord("×",a,b,a*b);
    },
  },
  division: {
    label:"Division", icon:"➗", color:C.grass, desc:"Divide numbers into equal groups",
    generate(diff) {
      if(diff<=1){ const d=rnd(1,5),q=rnd(1,5); return {question:`${d*q} ÷ ${d} = ?`,answer:q,op:"÷",a:d*q,b:d,isWord:false}; }
      if(diff===2){ const d=rnd(2,10),q=rnd(1,10); return {question:`${d*q} ÷ ${d} = ?`,answer:q,op:"÷",a:d*q,b:d,isWord:false}; }
      if(diff===3){ const d=rnd(2,9),q=rnd(10,99); return {question:`${fmtN(d*q)} ÷ ${d} = ?`,answer:q,op:"÷",a:d*q,b:d,isWord:false}; }
      if(diff===4){ const d=rnd(2,9),q=rnd(100,999); return {question:`${fmtN(d*q)} ÷ ${d} = ?`,answer:q,op:"÷",a:d*q,b:d,isWord:false}; }
      const d=rnd(10,99),q=rnd(10,99); return {question:`${fmtN(d*q)} ÷ ${d} = ?`,answer:q,op:"÷",a:d*q,b:d,isWord:false};
    },
    generateWord(diff) {
      if(diff<=1){ const d=rnd(1,5),q=rnd(1,5); return makeWord("÷",d*q,d,q); }
      if(diff===2){ const d=rnd(2,10),q=rnd(1,10); return makeWord("÷",d*q,d,q); }
      if(diff===3){ const d=rnd(2,9),q=rnd(10,99); return makeWord("÷",d*q,d,q); }
      if(diff===4){ const d=rnd(2,9),q=rnd(100,999); return makeWord("÷",d*q,d,q); }
      const d=rnd(10,99),q=rnd(10,99); return makeWord("÷",d*q,d,q);
    },
  },
  mixed: {
    label:"Mixed Ops", icon:"🎯", color:C.orange, desc:"A mix of all operations",
    _pick(){ const k=["addition","subtraction","multiplication","division"]; return k[rnd(0,k.length-1)]; },
    generate(diff){ return SUBJECTS[SUBJECTS.mixed._pick()].generate(diff); },
    generateWord(diff){ return SUBJECTS[SUBJECTS.mixed._pick()].generateWord(diff); },
  },
  word: {
    label:"Word Problems", icon:"📖", color:C.pink, desc:"Math hidden inside stories",
    _pick(){ const k=["addition","subtraction","multiplication","division"]; return k[rnd(0,k.length-1)]; },
    generate(diff){ return SUBJECTS[SUBJECTS.word._pick()].generateWord(diff); },
    generateWord(diff){ return SUBJECTS[SUBJECTS.word._pick()].generateWord(diff); },
  },
};
const SUBJECT_KEYS = ["addition","subtraction","multiplication","division","mixed","word"];

function generateUnique(subjectKey, diff, usedSet, wordChance=0.2) {
  const subj = SUBJECTS[subjectKey];
  for(let i=0; i<20; i++) {
    const useWord = subjectKey !== "word" && Math.random() < wordChance;
    const p = useWord ? subj.generateWord(diff) : subj.generate(diff);
    if(!usedSet.has(p.question)) { usedSet.add(p.question); return p; }
  }
  return subj.generate(diff);
}

function generateSimilar(problem, diff=1) {
  const map = {"+":"addition","-":"subtraction","×":"multiplication","÷":"division"};
  const subj = SUBJECTS[map[problem.op]] || SUBJECTS.addition;
  return subj.generate(Math.max(1, diff - 1));
}

const DIFF_LABEL = ["","🌱 Beginner","⭐ Easy","🚀 Medium","💪 Hard","🏆 Expert"];

// ── UI: Bubbles ──────────────────────────────────────────────────
function Bubbles() {
  const items = ["🌟","💫","✨","🎈","🎀","🌈","⭐","🎉","🦋","🌸"];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {items.map((b,i)=>(
        <div key={i} style={{position:"absolute",fontSize:16+Math.random()*14,left:`${(i*11)%95}%`,top:`${(i*17)%90}%`,opacity:0.12,animation:`float${i%3} ${4+i*0.7}s ease-in-out infinite`,animationDelay:`${i*0.4}s`}}>{b}</div>
      ))}
    </div>
  );
}

// ── UI: MomMessage ───────────────────────────────────────────────
function MomMessage({ onDismiss }) {
  const [wiggle,setWiggle]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setWiggle(w=>!w),1500);return()=>clearInterval(t);},[]);
  return (
    <div style={{background:"linear-gradient(135deg,#FF6B9D,#FF8E53,#FFD93D)",borderRadius:24,padding:24,marginBottom:20,boxShadow:"0 8px 32px rgba(255,107,157,0.35)",position:"relative",overflow:"hidden"}}>
      {["⭐","🌟","✨","💫"].map((s,i)=>(
        <span key={i} style={{position:"absolute",fontSize:18,opacity:0.4,top:`${10+i*20}%`,left:i%2===0?`${5+i*5}%`:`${80-i*5}%`}}>{s}</span>
      ))}
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{fontSize:40,animation:wiggle?"rotate 0.3s ease":"none"}}>💌</div>
          <div>
            <div style={{color:"white",fontWeight:900,fontSize:18,textShadow:"0 2px 4px rgba(0,0,0,0.2)"}}>A Message from Mama Manasa!</div>
            <div style={{color:"rgba(255,255,255,0.85)",fontSize:12}}>Just for YOU 👇</div>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:16,padding:16,backdropFilter:"blur(4px)"}}>
          <p style={{color:"white",fontSize:15,lineHeight:1.7,margin:0,fontWeight:600,textShadow:"0 1px 2px rgba(0,0,0,0.15)"}}>
            🧩 Hey my little superstars! Learning math is like solving the world's most awesome puzzle — except instead of puzzle pieces, you use NUMBERS! 🔢
          </p>
          <p style={{color:"white",fontSize:15,lineHeight:1.7,margin:"10px 0 0",fontWeight:600,textShadow:"0 1px 2px rgba(0,0,0,0.15)"}}>
            And guess what? Even if a puzzle piece doesn't fit at first, you don't eat it 🍪... you try again! So go on, puzzle-smash those numbers! Mama believes in you more than she believes in her morning coffee ☕ (and that's A LOT)!
          </p>
          <p style={{color:"white",fontSize:14,lineHeight:1.6,margin:"10px 0 0",fontWeight:700,textShadow:"0 1px 2px rgba(0,0,0,0.15)"}}>
            💖 Love you to infinity and BEYOND! — Mama Manasa 🦸‍♀️
          </p>
        </div>
        <button onClick={onDismiss} style={{marginTop:14,background:"rgba(255,255,255,0.3)",color:"white",border:"2px solid rgba(255,255,255,0.5)",borderRadius:12,padding:"10px 24px",fontWeight:800,fontSize:14,cursor:"pointer",width:"100%",backdropFilter:"blur(4px)"}}>
          Let's Go! 🚀
        </button>
      </div>
    </div>
  );
}

// ── UI: TimerBar ─────────────────────────────────────────────────
function TimerBar({ used, color }) {
  const pct=Math.min((used/MAX_MS)*100,100), remaining=MAX_MS-used;
  const warn=remaining<10*60*1000, critical=remaining<5*60*1000;
  const barColor=critical?"#EF5350":warn?C.sun:color;
  return (
    <div style={{background:"rgba(255,255,255,0.9)",borderRadius:14,padding:"10px 14px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:13,fontWeight:700,color:C.muted}}>⏱ Today's time</span>
        <span style={{fontSize:13,fontWeight:800,color:critical?"#EF5350":warn?"#FF7043":C.dark}}>{formatTime(remaining)} left</span>
      </div>
      <div style={{background:"#eee",borderRadius:99,height:8}}>
        <div style={{background:barColor,height:8,borderRadius:99,width:`${pct}%`,transition:"width 0.5s",boxShadow:`0 0 8px ${barColor}88`}}/>
      </div>
      {warn&&!critical&&<div style={{marginTop:5,fontSize:12,color:C.coral,fontWeight:700}}>⚠️ Less than 10 minutes left!</div>}
      {critical&&<div style={{marginTop:5,fontSize:12,color:"#EF5350",fontWeight:800}}>🚨 Almost out of time!</div>}
    </div>
  );
}

// ── UI: TimeUpScreen ─────────────────────────────────────────────
function TimeUpScreen({ profile, onBack }) {
  return (
    <div style={{background:C.white,borderRadius:24,padding:32,boxShadow:"0 8px 32px rgba(0,0,0,0.1)",textAlign:"center"}}>
      <div style={{fontSize:72,marginBottom:8,animation:"bounce 1s infinite"}}>⏰</div>
      <div style={{background:"linear-gradient(135deg,#FF6B9D,#FF8E53)",borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{color:"white",fontWeight:900,fontSize:22}}>Time's Up, {profile.emoji}!</div>
        <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,marginTop:4}}>Mama Manasa says: "Even superheroes need rest! 🦸‍♀️"</div>
      </div>
      <p style={{color:C.muted,fontSize:15,lineHeight:1.7,margin:"0 0 20px"}}>You've used your <strong>1 hour</strong> for today!<br/>Your brain worked SUPER hard! 🧠💪</p>
      <div style={{background:"#FFF9C4",borderRadius:16,padding:16,marginBottom:20,border:"2px dashed #FFD54F"}}>
        <div style={{fontSize:28,marginBottom:6}}>🧩</div>
        <div style={{fontWeight:800,color:C.dark,fontSize:15}}>Remember what Mama said!</div>
        <div style={{color:C.muted,fontSize:13,marginTop:4,lineHeight:1.6}}>Every puzzle gets easier the more you practice. See you tomorrow, puzzle champion! 🏆</div>
      </div>
      <button onClick={onBack} style={{background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",border:"none",borderRadius:14,padding:"14px 28px",fontSize:16,fontWeight:800,cursor:"pointer",width:"100%",boxShadow:"0 4px 15px rgba(102,126,234,0.4)"}}>← Back to Home</button>
    </div>
  );
}

function Stars({ count }) {
  return <span>{Array.from({length:5},(_,i)=><span key={i} style={{fontSize:22,color:i<count?"#FFD54F":"#ddd",textShadow:i<count?"0 0 8px #FFD54F88":"none"}}>★</span>)}</span>;
}

function FloatingConfetti({ show }) {
  if(!show) return null;
  const items=["🎉","⭐","🌟","💫","🎈","✨","🏆","🎊"];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:100}}>
      {items.map((item,i)=>(
        <div key={i} style={{position:"absolute",fontSize:24+Math.random()*16,left:`${10+i*11}%`,top:"-10%",animation:`fall ${1.5+i*0.2}s ease-in forwards`,animationDelay:`${i*0.1}s`}}>{item}</div>
      ))}
    </div>
  );
}

// ── UI: VerticalMath — renders any +/- problem as stacked column ──
function VerticalMath({ problem, color, showAnswer }) {
  const { op, nums, answer } = problem;
  const allNums = nums || [problem.a, problem.b];
  const bg = op==="+"?"#FFF9C4":op==="-"?"#FDE8E8":op==="×"?"#F3E5F5":"#E8F5E9";
  const lineColor = color || C.dark;
  return (
    <div style={{background:bg,borderRadius:14,padding:"14px 20px",display:"inline-block",minWidth:180,fontFamily:"'Courier New',monospace",fontSize:26,fontWeight:900,lineHeight:1.8}}>
      {allNums.map((n,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
          <span style={{color: i===allNums.length-1 ? lineColor : "transparent", fontSize:22, minWidth:"1.1em"}}>
            {i===allNums.length-1 ? op : ""}
          </span>
          <span style={{color:C.dark,letterSpacing:1}}>{fmtN(n)}</span>
        </div>
      ))}
      <div style={{borderTop:`3px solid ${lineColor}`,marginTop:4,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:"transparent",fontSize:22,minWidth:"1.1em"}}>_</span>
        {showAnswer
          ? <span style={{color:C.grass,fontWeight:900}}>{fmtN(answer)} ✅</span>
          : <span style={{color:C.muted,fontSize:20}}>?</span>}
      </div>
    </div>
  );
}

// ── UI: ColumnHint (for large numbers) ───────────────────────────
function ColumnHint({ problem }) {
  const { op, a, b } = problem;
  const isAddSub = op==="+" || op==="-";
  return (
    <div style={{marginBottom:10,textAlign:"center"}}>
      <div style={{color:C.muted,fontSize:12,textAlign:"left",marginBottom:8}}>
        🔢 {isAddSub?"Line up the digits and work right to left!":op==="×"?"Multiply each digit separately, then add!":"How many times does it fit?"}
      </div>
      {isAddSub
        ? <VerticalMath problem={problem} color={C.dark}/>
        : (
          <div style={{background:op==="×"?"#F3E5F5":"#E8F5E9",borderRadius:12,padding:16,textAlign:"right",fontFamily:"monospace",fontSize:22}}>
            <div>{fmtN(a)}</div>
            <div style={{borderBottom:`3px solid ${C.dark}`,paddingBottom:4,marginBottom:4}}>{op} {fmtN(b)}</div>
            <div style={{color:C.muted,fontSize:16}}>= ?</div>
            {op==="÷"&&<div style={{fontSize:12,color:C.muted,textAlign:"left",marginTop:6}}>How many times does <b>{fmtN(b)}</b> fit into <b>{fmtN(a)}</b>?</div>}
          </div>
        )}
    </div>
  );
}

// ── UI: VisualHint ───────────────────────────────────────────────
function VisualHint({ problem }) {
  const {op,a,b} = problem;
  const [frame,setFrame] = useState(0);
  useEffect(()=>{const t=setInterval(()=>setFrame(f=>(f+1)%3),900);return()=>clearInterval(t);},[]);
  const pulse = {display:"inline-block",transform:frame===1?"scale(1.4)":"scale(1)",transition:"transform 0.3s"};

  const wordCard = problem.isWord ? (
    <div style={{background:"#E3F2FD",borderRadius:12,padding:12,marginBottom:10,textAlign:"center",border:"2px dashed #90CAF9"}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:4}}>📐 This word problem is the same as:</div>
      <div style={{fontSize:26,fontWeight:900,color:C.dark}}>{fmtN(a)} {op} {fmtN(b)} = ?</div>
    </div>
  ) : null;

  // For large numbers, skip emoji grid and show column layout
  if(a > 20 || b > 20) {
    return <div>{wordCard}<ColumnHint problem={problem}/></div>;
  }

  if(op==="+") {
    const emojis=["🍎","🍊","🍇","🍓","🍌","🫐","🍑","🥭"];
    const e=emojis[a%emojis.length];
    return (
      <div>{wordCard}
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{background:"#FFF9C4",borderRadius:12,padding:12,marginBottom:8}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>🧺 You have <b>{a}</b> fruits</div>
            <div style={{fontSize:20,letterSpacing:3}}>{Array.from({length:a},(_,i)=><span key={i}>{e}</span>)}</div>
          </div>
          <div style={{fontSize:20,color:C.muted}}>➕</div>
          <div style={{background:"#E8F5E9",borderRadius:12,padding:12,marginTop:8}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>🎁 You get <b>{b}</b> more</div>
            <div style={{fontSize:20,letterSpacing:3}}>{Array.from({length:b},(_,i)=><span key={i} style={pulse}>🎁</span>)}</div>
          </div>
          <div style={{marginTop:10,fontSize:14,fontWeight:800,color:C.dark}}>Put them all together! 🤔</div>
        </div>
      </div>
    );
  }
  if(op==="-") {
    return (
      <div>{wordCard}
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{background:"#FFF9C4",borderRadius:12,padding:12,marginBottom:8}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>🍪 You have <b>{a}</b> cookies</div>
            <div style={{fontSize:20,letterSpacing:2}}>{Array.from({length:a},(_,i)=><span key={i}>🍪</span>)}</div>
          </div>
          <div style={{fontSize:20,color:C.muted}}>➖</div>
          <div style={{background:"#FDE8E8",borderRadius:12,padding:12,marginTop:8}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>😋 You eat <b>{b}</b> of them</div>
            <div style={{fontSize:20,letterSpacing:2}}>{Array.from({length:b},(_,i)=><span key={i} style={{opacity:0.25,textDecoration:"line-through"}}>🍪</span>)}</div>
          </div>
          <div style={{marginTop:10,fontSize:14,fontWeight:800,color:C.dark}}>How many cookies are left? 🤔</div>
        </div>
      </div>
    );
  }
  if(op==="×") {
    return (
      <div>{wordCard}
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:8}}><b>{a}</b> groups, each with <b>{b}</b> ⭐</div>
          <div style={{background:"#F3E5F5",borderRadius:12,padding:12}}>
            {Array.from({length:Math.min(a,5)},(_,r)=>(
              <div key={r} style={{marginBottom:4}}>
                {Array.from({length:Math.min(b,5)},(_,c)=>(
                  <span key={c} style={{fontSize:18,margin:"0 2px",...(frame===1&&r===0?pulse:{})}}>⭐</span>
                ))}{b>5?"...":""}
              </div>
            ))}{a>5?<div style={{color:C.muted,fontSize:12}}>...{a-5} more rows</div>:""}
          </div>
          <div style={{marginTop:10,fontSize:14,fontWeight:800,color:C.dark}}>Count ALL the stars! 🤔</div>
        </div>
      </div>
    );
  }
  if(op==="÷") {
    return (
      <div>{wordCard}
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:8}}>Share <b>{a}</b> 🍕 among <b>{b}</b> friends equally!</div>
          <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {Array.from({length:Math.min(b,6)},(_,i)=>(
              <div key={i} style={{background:"#E8F5E9",borderRadius:10,padding:"8px 12px",fontSize:13,fontWeight:700,border:"2px dashed #81C784"}}>
                🧑 Friend {i+1}<br/><span style={{fontSize:20,color:C.coral}}>?</span>
              </div>
            ))}{b>6?<div style={{fontSize:12,color:C.muted,alignSelf:"center"}}>+{b-6} more</div>:""}
          </div>
          <div style={{fontSize:14,fontWeight:800,color:C.dark}}>How many slices each? 🤔</div>
        </div>
      </div>
    );
  }
  return null;
}

function VideoHint({ problem, age }) {
  const queries={"+":"addition for kids fun","-":"subtraction for kids fun","×":"multiplication for kids fun","÷":"division for kids fun"};
  const q=encodeURIComponent((queries[problem.op]||"math for kids")+` ${age} year old`);
  return (
    <a href={`https://www.youtube.com/results?search_query=${q}`} target="_blank" rel="noopener noreferrer"
      style={{display:"flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#FF0000,#CC0000)",borderRadius:12,padding:"12px 16px",textDecoration:"none",color:"white",fontWeight:800,fontSize:14,marginTop:10,boxShadow:"0 4px 12px rgba(255,0,0,0.3)"}}>
      <span style={{fontSize:24}}>▶️</span>
      <div><div>Watch a fun video!</div><div style={{fontSize:11,fontWeight:500,opacity:0.9}}>Opens YouTube — ask a grown-up first 🙋</div></div>
    </a>
  );
}

function HintBox({ problem, age, attemptsLeft, onDismiss }) {
  return (
    <div style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px dashed #FFD54F",borderRadius:20,padding:18,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:16,color:C.dark}}>🧩 Puzzle Clue Time!</div>
        <div style={{background:C.sun,borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:800,color:C.dark}}>
          {attemptsLeft} tr{attemptsLeft===1?"y":"ies"} left!
        </div>
      </div>
      <VisualHint problem={problem}/>
      <VideoHint problem={problem} age={age}/>
      <button onClick={onDismiss} style={{marginTop:12,background:"linear-gradient(135deg,#FFD54F,#FF8E53)",color:C.dark,border:"none",borderRadius:12,padding:"12px 20px",fontWeight:900,fontSize:15,cursor:"pointer",width:"100%",boxShadow:"0 4px 12px rgba(255,142,83,0.3)"}}>
        I got it! Let me try again 💪
      </button>
    </div>
  );
}

// ── UI: SolutionBox ──────────────────────────────────────────────
function SolutionBox({ problem, similarProblems, onNextSimilar }) {
  const { op, a, b, answer } = problem;
  const isLarge = a > 20 || b > 20;
  const isMultiNum = (problem.nums||[]).length > 2;
  const useColumn = isLarge || isMultiNum;
  return (
    <div style={{background:"linear-gradient(135deg,#E8F5E9,#F1F8E9)",border:"3px solid #81C784",borderRadius:20,padding:18,marginBottom:14}}>
      <div style={{fontWeight:900,fontSize:16,color:C.dark,marginBottom:12}}>🎓 Let's crack this puzzle together!</div>
      {problem.isWord && (
        <div style={{background:"#E3F2FD",borderRadius:12,padding:10,marginBottom:12,textAlign:"center",border:"2px dashed #90CAF9"}}>
          <div style={{fontSize:12,color:C.muted,marginBottom:4}}>📐 Word problem = equation:</div>
          <div style={{fontSize:20,fontWeight:900,color:C.dark}}>{fmtN(a)} {op} {fmtN(b)} = ?</div>
        </div>
      )}
      <div style={{background:C.white,borderRadius:14,padding:14,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        {useColumn && (op==="+" || op==="-") ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:12,color:C.muted,textAlign:"left",marginBottom:8}}>🔢 Column method — now with the answer:</div>
            <VerticalMath problem={problem} color={C.grass} showAnswer={true}/>
            {isMultiNum && op==="+" && (
              <div style={{marginTop:10,fontSize:13,color:C.muted}}>
                💡 Add one number at a time from top to bottom!
              </div>
            )}
          </div>
        ) : useColumn ? (
          <div style={{fontFamily:"monospace",textAlign:"right",fontSize:20}}>
            <div style={{fontSize:12,color:C.muted,textAlign:"left",marginBottom:8}}>🔢 Column method:</div>
            <div>{fmtN(a)}</div>
            <div style={{borderBottom:`2px solid ${C.dark}`,paddingBottom:4,marginBottom:4}}>{op} {fmtN(b)}</div>
            <div style={{fontWeight:900,color:C.grass,fontSize:22}}>{fmtN(answer)} ✅</div>
          </div>
        ) : (<>
          {op==="+"&&<>
            <div style={{fontSize:13,color:C.muted,marginBottom:6}}>🐾 Count on from {a}...</div>
            <div style={{fontSize:14,color:C.coral,marginBottom:6}}>{Array.from({length:Math.min(b,8)},(_,i)=><span key={i}>+1 </span>)}</div>
            <div style={{fontSize:20,fontWeight:900,color:C.grass}}>{a} + {b} = {answer} ✅</div>
          </>}
          {op==="-"&&<>
            <div style={{fontSize:13,color:C.muted,marginBottom:6}}>🐾 Count back from {a}...</div>
            <div style={{fontSize:14,color:C.purple,marginBottom:6}}>{Array.from({length:Math.min(b,8)},(_,i)=><span key={i}>-1 </span>)}</div>
            <div style={{fontSize:20,fontWeight:900,color:C.grass}}>{a} - {b} = {answer} ✅</div>
          </>}
          {op==="×"&&<>
            <div style={{fontSize:13,color:C.muted,marginBottom:6}}>🔄 Add {b}, exactly {a} times:</div>
            <div style={{fontSize:14,color:C.coral,marginBottom:6}}>{Array.from({length:Math.min(a,6)},(_,i)=><span key={i}>{b}{i<Math.min(a,6)-1?" + ":""}</span>)}{a>6?"...":""} = {answer}</div>
            <div style={{fontSize:20,fontWeight:900,color:C.grass}}>{a} × {b} = {answer} ✅</div>
          </>}
          {op==="÷"&&<>
            <div style={{fontSize:13,color:C.muted,marginBottom:6}}>🍕 Share {a} into {b} equal groups:</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{Array.from({length:Math.min(b,6)},(_,i)=><div key={i} style={{background:"#E8F5E9",borderRadius:8,padding:"4px 8px",fontSize:13,fontWeight:700}}>{answer} each</div>)}</div>
            <div style={{fontSize:20,fontWeight:900,color:C.grass}}>{a} ÷ {b} = {answer} ✅</div>
          </>}
        </>)}
      </div>
      {similarProblems[0] && (
        <div style={{background:"#FFF9C4",borderRadius:14,padding:12,border:"2px dashed #FFD54F"}}>
          <div style={{fontWeight:800,fontSize:14,color:C.dark,marginBottom:8}}>🎯 Now try a similar (easier) puzzle!</div>
          <div style={{fontSize:28,fontWeight:900,color:C.dark,textAlign:"center",marginBottom:10}}>{similarProblems[0].question}</div>
          <button onClick={onNextSimilar} style={{background:"linear-gradient(135deg,#66BB6A,#43A047)",color:"white",border:"none",borderRadius:12,padding:"12px 24px",fontWeight:900,fontSize:15,cursor:"pointer",width:"100%",boxShadow:"0 4px 12px rgba(102,187,106,0.4)"}}>
            I'll try this one! 🚀
          </button>
        </div>
      )}
    </div>
  );
}

// ── SubjectPicker ─────────────────────────────────────────────────
function SubjectPicker({ profile, subjectDiff, onSelect }) {
  return (
    <div style={{background:C.white,borderRadius:24,padding:22,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:`3px solid ${profile.color}33`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${profile.color},${profile.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{profile.emoji}</div>
        <div>
          <div style={{fontWeight:900,fontSize:18,color:C.dark}}>{profile.name}, pick a subject!</div>
          <div style={{color:C.muted,fontSize:13}}>What do you want to practise today?</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {SUBJECT_KEYS.map(key=>{
          const s = SUBJECTS[key];
          const d = subjectDiff[profile.id]?.[key] || 1;
          const cappedD = Math.min(d, profile.maxDiff);
          return (
            <button key={key} onClick={()=>onSelect(key)}
              style={{background:`linear-gradient(135deg,${s.color}22,${s.color}11)`,border:`2px solid ${s.color}55`,borderRadius:16,padding:"14px 10px",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
              <div style={{fontWeight:900,fontSize:14,color:C.dark}}>{s.label}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.desc}</div>
              <div style={{marginTop:6,fontSize:11,fontWeight:800,color:s.color,background:`${s.color}22`,borderRadius:99,padding:"2px 8px",display:"inline-block"}}>{DIFF_LABEL[cappedD]}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── LessonView ───────────────────────────────────────────────────
function LessonView({ profile, subject, diff, onStartQuiz }) {
  const [aiLesson,setAiLesson]=useState(""), [loading,setLoading]=useState(true);
  const s = SUBJECTS[subject];
  const cappedDiff = Math.min(diff, profile.maxDiff);
  useEffect(()=>{
    setLoading(true); setAiLesson("");
    (async()=>{
      try {
        const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:`You are a super fun math teacher for kids! Teach "${s.label}" at difficulty level ${DIFF_LABEL[cappedDiff]} to a ${profile.age}-year-old. Write a SHORT, SILLY, fun lesson (max 120 words) using lots of emojis, a funny real-world example (like pizza, dinosaurs, toys), one worked example, and an encouraging punchline at the end. No markdown. Plain text only.`})});
        const data=await res.json();
        setAiLesson(data.text||"Let's do some math magic today! ✨");
      } catch { setAiLesson("Let's learn math today! 🌟"); }
      setLoading(false);
    })();
  },[subject, cappedDiff, profile]);
  return (
    <div style={{background:C.white,borderRadius:24,padding:24,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:`3px solid ${profile.color}33`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${profile.color},${profile.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{profile.emoji}</div>
        <div>
          <div style={{fontWeight:900,fontSize:19,color:C.dark}}>{profile.name}'s Lesson!</div>
          <div style={{color:C.muted,fontSize:13}}>{s.icon} {s.label} · {DIFF_LABEL[cappedDiff]}</div>
        </div>
      </div>
      <div style={{background:`linear-gradient(135deg,${profile.bg},#FAFFF8)`,borderRadius:16,padding:18,minHeight:110,marginBottom:18,fontSize:15,lineHeight:1.8,color:"#333",border:`2px dashed ${profile.color}44`}}>
        {loading ? <div style={{display:"flex",alignItems:"center",gap:10,color:C.muted}}><span style={{fontSize:24,animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>Loading your lesson...</div> : aiLesson}
      </div>
      <button onClick={onStartQuiz} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:16,padding:"16px 32px",fontSize:19,fontWeight:900,cursor:"pointer",width:"100%",boxShadow:`0 6px 20px ${profile.color}55`}}>
        Let's Quiz! 🎯
      </button>
    </div>
  );
}

// ── QuizView ──────────────────────────────────────────────────────
function QuizView({ profile, subject, startDiff, onComplete }) {
  const TOTAL_Q=8, MAX_ATTEMPTS=3;
  const maxDiff = profile.maxDiff;
  const [sessionDiff,setSessionDiff]=useState(Math.min(startDiff, maxDiff));
  const usedQ = useRef(new Set());
  const correctRun = useRef(0);
  const wrongRun = useRef(0);
  const [diffMsg,setDiffMsg]=useState("");

  const [problem,setProblem]=useState(()=>generateUnique(subject, Math.min(startDiff,maxDiff), usedQ.current));
  const [input,setInput]=useState("");
  const [phase,setPhase]=useState("answering");
  const [attempts,setAttempts]=useState(0);
  const [streak,setStreak]=useState(0);
  const [correct,setCorrect]=useState(0);
  const [questionNum,setQuestionNum]=useState(1);
  const [similarProblems,setSimilarProblems]=useState([]);
  const [aiFeedback,setAiFeedback]=useState("");
  const [loadingFeedback,setLoadingFeedback]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);
  const inputRef=useRef();

  useEffect(()=>{if(phase==="answering"){setInput("");setTimeout(()=>inputRef.current?.focus(),100);}},[phase,problem]);

  const bumpDiff=(dir)=>{
    setSessionDiff(d=>{
      const nd=Math.min(Math.max(d+dir,1),maxDiff);
      if(nd!==d) setDiffMsg(dir>0?"🔥 Getting harder!":"💙 Let's try a slightly easier one!");
      setTimeout(()=>setDiffMsg(""),2500);
      return nd;
    });
  };

  const getAiFeedback=async(isCorrect,wasHinted)=>{
    setLoadingFeedback(true);
    try {
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:`Fun math teacher for ${profile.age}-year-old. Question: ${problem.question}, correct: ${isCorrect}, used hints: ${wasHinted}. ONE sentence (max 15 words) of ${isCorrect?"wild celebration":"warm silly encouragement"}. 1-2 emojis. No markdown.`})});
      const data=await res.json();
      setAiFeedback(data.text||(isCorrect?"You're a math superstar! 🌟":"You've got this! 💪"));
    } catch { setAiFeedback(isCorrect?"Woohoo! Amazing! 🎉":"You can do it! 💪"); }
    setLoadingFeedback(false);
  };

  const handleSubmit=async()=>{
    const val=parseInt(input.replace(/,/g,""));
    if(isNaN(val)) return;
    const isCorrect=val===problem.answer, newAttempts=attempts+1;
    setAttempts(newAttempts);
    if(isCorrect) {
      if(newAttempts===1) setStreak(s=>s+1); else setStreak(0);
      setCorrect(c=>c+1);
      setShowConfetti(true);
      setTimeout(()=>setShowConfetti(false),2000);
      setPhase("correct");
      correctRun.current+=1; wrongRun.current=0;
      if(correctRun.current>=2){ correctRun.current=0; bumpDiff(1); }
      await getAiFeedback(true, newAttempts>1);
    } else {
      if(newAttempts<MAX_ATTEMPTS){ setPhase("hint"); }
      else {
        setStreak(0);
        wrongRun.current+=1; correctRun.current=0;
        if(wrongRun.current>=2){ wrongRun.current=0; bumpDiff(-1); }
        setSimilarProblems([generateSimilar(problem,sessionDiff), generateSimilar(problem,sessionDiff)]);
        setPhase("solution");
      }
    }
  };

  const moveNext=()=>{
    if(questionNum>=TOTAL_Q){ onComplete(correct,TOTAL_Q,streak,sessionDiff); return; }
    setQuestionNum(n=>n+1);
    setProblem(generateUnique(subject, sessionDiff, usedQ.current));
    setAttempts(0); setPhase("answering"); setAiFeedback("");
  };

  const handleSimilarAttempt=()=>{setProblem(similarProblems[0]);setAttempts(0);setPhase("answering");};
  const progress=((questionNum-1)/TOTAL_Q)*100;
  const attemptsLeft=MAX_ATTEMPTS-attempts;
  const subj=SUBJECTS[subject];

  return (
    <div style={{background:C.white,borderRadius:24,padding:22,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:`3px solid ${profile.color}22`}}>
      <FloatingConfetti show={showConfetti}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontWeight:900,color:C.dark,fontSize:15}}>{profile.emoji} Q{questionNum}/{TOTAL_Q}</span>
        <span style={{background:C.grass+"22",color:C.grass,fontWeight:800,fontSize:14,padding:"4px 10px",borderRadius:99}}>✓ {correct} correct</span>
      </div>
      <div style={{background:"#eee",borderRadius:99,height:10,marginBottom:16,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(90deg,${profile.color},${C.sun})`,height:10,borderRadius:99,width:`${progress}%`,transition:"width 0.4s",boxShadow:`0 0 8px ${profile.color}88`}}/>
      </div>
      {diffMsg && (
        <div style={{background:"linear-gradient(135deg,#667eea22,#f093fb22)",borderRadius:12,padding:"8px 14px",marginBottom:12,textAlign:"center",fontWeight:800,fontSize:14,color:C.dark,border:"2px dashed #667eea55"}}>
          {diffMsg}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,color:C.muted,fontWeight:700}}>{subj.icon} {subj.label}</span>
        <span style={{fontSize:11,fontWeight:800,color:subj.color,background:`${subj.color}22`,borderRadius:99,padding:"2px 8px"}}>{DIFF_LABEL[sessionDiff]}</span>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,alignItems:"center"}}>
        {Array.from({length:MAX_ATTEMPTS},(_,i)=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<attempts?(phase==="solution"&&i===MAX_ATTEMPTS-1?"#EF5350":"#FFD54F"):phase==="correct"&&i===0?C.grass:"#ddd",transition:"background 0.3s"}}/>
        ))}
        <span style={{fontSize:12,color:C.muted,marginLeft:4}}>
          {phase==="correct"?"✅":phase==="solution"?"💡 Revealed!":attemptsLeft===3?"First try!":attemptsLeft===2?"1 wrong — try again!":"Last chance!"}
        </span>
      </div>

      {/* Question bubble */}
      <div style={{background:`linear-gradient(135deg,${profile.bg},#FAFFFE)`,borderRadius:20,padding:problem.isWord?18:16,textAlign:"center",marginBottom:18,border:`2px dashed ${profile.color}44`}}>
        <div style={{fontSize:13,color:C.muted,marginBottom:8,fontWeight:600}}>{subj.icon} {problem.isWord?"Read carefully! 📖":"Solve this puzzle!"}</div>
        {problem.isWord ? (
          <>
            <div style={{fontSize:16,fontWeight:900,color:C.dark,lineHeight:1.6}}>{problem.question}</div>
            <div style={{marginTop:8,fontSize:13,color:C.muted,fontStyle:"italic"}}>What is the answer?</div>
          </>
        ) : (problem.op==="+" || problem.op==="-") && (problem.nums?.length > 2 || Math.max(...(problem.nums||[problem.a,problem.b])) >= 100) ? (
          <VerticalMath problem={problem} color={profile.color}/>
        ) : problem.op==="×" || problem.op==="÷" ? (
          <div style={{fontFamily:"'Courier New',monospace",fontSize:Math.max(problem.a,problem.b)>99?28:40,fontWeight:900,color:C.dark,letterSpacing:1,lineHeight:1.4}}>
            <div>{fmtN(problem.a)}</div>
            <div style={{borderBottom:`3px solid ${profile.color}55`,paddingBottom:4,marginBottom:4}}>{problem.op} {fmtN(problem.b)}</div>
            <div style={{color:C.muted,fontSize:24}}>?</div>
          </div>
        ) : (
          <div style={{fontSize:52,fontWeight:900,color:C.dark,letterSpacing:2,textShadow:`2px 2px 0 ${profile.color}33`}}>{problem.question}</div>
        )}
      </div>

      {phase==="answering"&&(
        <div style={{display:"flex",gap:10}}>
          <input ref={inputRef} type="number" value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            placeholder="Your answer..."
            style={{flex:1,border:`3px solid ${profile.color}`,borderRadius:14,padding:"14px 18px",fontSize:24,fontWeight:900,outline:"none",textAlign:"center",color:C.dark,background:"#FAFAFA"}}/>
          <button onClick={handleSubmit} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:14,padding:"14px 20px",fontSize:22,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 12px ${profile.color}55`}}>→</button>
        </div>
      )}

      {phase==="hint"&&<HintBox problem={problem} age={profile.age} attemptsLeft={attemptsLeft} onDismiss={()=>setPhase("answering")}/>}

      {phase==="solution"&&(
        <>
          <SolutionBox problem={problem} similarProblems={similarProblems} onNextSimilar={handleSimilarAttempt}/>
          <button onClick={moveNext} style={{background:"#eee",color:C.dark,border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%"}}>Skip to next question →</button>
        </>
      )}

      {phase==="correct"&&(
        <div style={{background:"linear-gradient(135deg,#E8F5E9,#F1F8E9)",borderRadius:18,padding:20,textAlign:"center",border:"3px solid #81C784"}}>
          <div style={{fontSize:48,marginBottom:6}}>{attempts===1?"🏆":"💪"}</div>
          <div style={{fontWeight:900,fontSize:20,color:C.grass,marginBottom:6}}>{attempts===1?"PERFECT! First try! 🌟":"Got it! 💪"}</div>
          <div style={{color:C.muted,fontSize:14,marginBottom:12}}>{loadingFeedback?"...✨":aiFeedback}</div>
          {streak>=2&&<div style={{color:C.sun,fontWeight:900,fontSize:16,marginBottom:8,textShadow:"0 0 8px #FFD54F"}}>🔥 {streak} in a row! YOU'RE ON FIRE!</div>}
          <button onClick={moveNext} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}BB)`,color:"white",border:"none",borderRadius:14,padding:"14px 28px",fontSize:17,fontWeight:900,cursor:"pointer",boxShadow:`0 6px 16px ${profile.color}44`}}>
            {questionNum>=TOTAL_Q?"See Results! 🏆":"Next Puzzle! →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── ResultView ───────────────────────────────────────────────────
function ResultView({ profile, correct, total, streak, subject, endDiff, onChooseSubject, onRetry }) {
  const score=Math.round((correct/total)*100);
  const stars=score>=90?5:score>=70?4:score>=50?3:score>=30?2:1;
  const msgs=["Keep going, you're learning! 🌱","Nice effort, getting stronger! 💪","Solid work, keep it up! ⭐","Great job, puzzle solver! 🧩","AMAZING! You're a MATH STAR! 🏆"];
  const s=SUBJECTS[subject];
  return (
    <div style={{background:C.white,borderRadius:24,padding:26,boxShadow:"0 8px 32px rgba(0,0,0,0.1)",textAlign:"center"}}>
      <div style={{background:`linear-gradient(135deg,${profile.color},${profile.color}99)`,borderRadius:20,padding:20,marginBottom:18}}>
        <div style={{fontSize:56,marginBottom:6}}>{score>=80?"🏆":score>=50?"🌟":"💪"}</div>
        <div style={{fontWeight:900,fontSize:24,color:"white"}}>{profile.emoji} {profile.name}</div>
        <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,marginTop:4}}>{msgs[stars-1]}</div>
      </div>
      <div style={{marginBottom:12}}><Stars count={stars}/></div>
      <div style={{fontSize:52,fontWeight:900,color:profile.color,marginBottom:4}}>{score}%</div>
      <div style={{color:C.muted,marginBottom:8,fontSize:15}}>{correct} out of {total} correct</div>
      <div style={{fontSize:13,color:s.color,fontWeight:800,marginBottom:12}}>{s.icon} {s.label} · ended at {DIFF_LABEL[endDiff]}</div>
      {streak>=3&&<div style={{background:"#FFF9C4",borderRadius:12,padding:10,marginBottom:12,fontWeight:900,color:C.dark,fontSize:15}}>🔥 Best streak: {streak} in a row!</div>}
      <div style={{background:"#FFF9C4",borderRadius:14,padding:12,marginBottom:18,border:"2px dashed #FFD54F"}}>
        <div style={{fontSize:13,color:C.dark,fontWeight:700}}>💌 Mama Manasa says: "{score>=80?"I knew you could do it, my little puzzle master!":"Every puzzle takes practice — and you're getting better every time! 🧩"}"</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onRetry} style={{flex:1,background:"#eee",color:C.dark,border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:800,cursor:"pointer"}}>Try Again 🔄</button>
        <button onClick={onChooseSubject} style={{flex:2,background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:900,cursor:"pointer"}}>
          Pick Subject 📚
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [selectedProfile,setSelectedProfile]=useState(null);
  const [subject,setSubject]=useState(null);
  const [subjectDiff,setSubjectDiff]=useState({
    a:{addition:1,subtraction:1,multiplication:1,division:1,mixed:1,word:1},
    b:{addition:1,subtraction:1,multiplication:1,division:1,mixed:1,word:1},
  });
  const [screen,setScreen]=useState("home");
  const [showMomMsg,setShowMomMsg]=useState(true);
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState({a:[],b:[]});
  const [timeUsed,setTimeUsed]=useState({a:0,b:0});
  const sessionStart=useRef(null);
  const tickRef=useRef(null);

  useEffect(()=>{
    if(selectedProfile&&screen!=="home"&&screen!=="result"){
      sessionStart.current=Date.now();
      tickRef.current=setInterval(()=>{
        const elapsed=Date.now()-sessionStart.current;
        setTimeUsed(prev=>{sessionStart.current=Date.now();return{...prev,[selectedProfile.id]:prev[selectedProfile.id]+elapsed};});
      },1000);
    } else {
      if(sessionStart.current&&selectedProfile){
        const elapsed=Date.now()-sessionStart.current;
        setTimeUsed(prev=>({...prev,[selectedProfile.id]:prev[selectedProfile.id]+elapsed}));
        sessionStart.current=null;
      }
      clearInterval(tickRef.current);
    }
    return()=>clearInterval(tickRef.current);
  },[selectedProfile,screen]);

  const isTimedOut=id=>timeUsed[id]>=MAX_MS;

  const selectProfile=profile=>{
    setSelectedProfile(profile);
    setScreen(isTimedOut(profile.id)?"timeout":"subjectPick");
  };

  const selectSubject=key=>{
    setSubject(key);
    setScreen("lesson");
  };

  const handleQuizComplete=(correct,total,streak,endDiff)=>{
    setResult({correct,total,streak,endDiff});
    setHistory(h=>({...h,[selectedProfile.id]:[...h[selectedProfile.id],Math.round((correct/total)*100)]}));
    setSubjectDiff(sd=>({
      ...sd,
      [selectedProfile.id]:{...sd[selectedProfile.id],[subject]:Math.min(endDiff,selectedProfile.maxDiff)}
    }));
    setScreen("result");
  };

  const goHome=()=>{setScreen("home");setSelectedProfile(null);};

  useEffect(()=>{
    if(selectedProfile&&isTimedOut(selectedProfile.id)&&screen!=="home"&&screen!=="timeout") setScreen("timeout");
  },[timeUsed]);

  const getTimeLabel=id=>{
    const r=MAX_MS-timeUsed[id];
    if(r<=0) return "⏰ Done for today";
    return`${Math.floor(r/60000)}m left today`;
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#667eea 0%,#f093fb 50%,#f5576c 100%)",fontFamily:"'Segoe UI',system-ui,sans-serif",padding:"20px 16px",position:"relative"}}>
      <Bubbles/>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float0{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(5deg)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-15px) rotate(-5deg)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes fall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes rotate{0%,100%{transform:rotate(0deg)}50%{transform:rotate(20deg)}}
        input::-webkit-inner-spin-button{display:none}
      `}</style>
      <div style={{maxWidth:480,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:4,filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.2))"}}>🧮</div>
          <h1 style={{margin:"0 0 4px",fontWeight:900,fontSize:30,color:"white",textShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>Math Adventure!</h1>
          <p style={{margin:0,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:600}}>🧩 Every number is a puzzle waiting to be solved!</p>
        </div>

        {screen==="home"&&showMomMsg&&<MomMessage onDismiss={()=>setShowMomMsg(false)}/>}

        {screen==="home"&&(
          <div>
            {!showMomMsg&&(
              <button onClick={()=>setShowMomMsg(true)} style={{background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.4)",borderRadius:12,padding:"8px 16px",color:"white",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:14,backdropFilter:"blur(8px)"}}>
                💌 Read Mama's message again
              </button>
            )}
            <div style={{fontWeight:900,color:"white",marginBottom:14,fontSize:17,textShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>Who's solving puzzles today? 🧩</div>
            {PROFILES.map(p=>{
              const scores=history[p.id], avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
              const timedOut=isTimedOut(p.id);
              return (
                <div key={p.id} onClick={()=>!timedOut&&selectProfile(p)}
                  style={{background:timedOut?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.95)",borderRadius:22,padding:20,marginBottom:14,cursor:timedOut?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:16,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:`3px solid ${timedOut?"#ccc":p.color}`,transition:"all 0.2s",opacity:timedOut?0.7:1}}
                  onMouseEnter={e=>{if(!timedOut)e.currentTarget.style.transform="scale(1.02)"}}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{width:64,height:64,borderRadius:20,background:`linear-gradient(135deg,${p.color},${p.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:900,fontSize:19,color:C.dark}}>{p.name}</div>
                    <div style={{color:p.color,fontSize:13,marginTop:2,fontWeight:700}}>🏅 {p.badge}</div>
                    <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                      {avg!==null&&<span style={{background:`${p.color}22`,color:p.color,fontWeight:800,fontSize:12,padding:"2px 8px",borderRadius:99}}>Avg: {avg}% 📊</span>}
                      <span style={{background:timedOut?"#fde8e8":"#e8f5e9",color:timedOut?"#EF5350":C.grass,fontWeight:700,fontSize:12,padding:"2px 8px",borderRadius:99}}>{getTimeLabel(p.id)}</span>
                    </div>
                  </div>
                  <div style={{fontSize:28,color:timedOut?"#ccc":p.color}}>{timedOut?"🔒":"→"}</div>
                </div>
              );
            })}
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:14,padding:14,marginTop:4,fontSize:13,color:"white",textAlign:"center",fontWeight:600,backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.3)"}}>
              ⏱ 1 hr/kid/day · 💡 3 tries + hints · 📈 Gets harder as you improve!
            </div>
          </div>
        )}

        {screen!=="home"&&(
          <button onClick={goHome} style={{background:"rgba(255,255,255,0.2)",border:"2px solid rgba(255,255,255,0.4)",borderRadius:12,padding:"8px 16px",cursor:"pointer",marginBottom:14,fontSize:14,color:"white",fontWeight:700,backdropFilter:"blur(8px)"}}>← Home</button>
        )}

        {selectedProfile&&screen!=="home"&&screen!=="timeout"&&(
          <TimerBar used={timeUsed[selectedProfile.id]} color={selectedProfile.color}/>
        )}

        {screen==="timeout"&&selectedProfile&&<TimeUpScreen profile={selectedProfile} onBack={goHome}/>}

        {screen==="subjectPick"&&selectedProfile&&(
          <SubjectPicker profile={selectedProfile} subjectDiff={subjectDiff} onSelect={selectSubject}/>
        )}

        {screen==="lesson"&&selectedProfile&&subject&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"10px 16px",marginBottom:14,fontSize:14,color:"white",fontWeight:700,backdropFilter:"blur(8px)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{SUBJECTS[subject].icon} {SUBJECTS[subject].label}</span>
              <button onClick={()=>setScreen("subjectPick")} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",borderRadius:8,padding:"4px 10px",color:"white",fontSize:12,cursor:"pointer",fontWeight:700}}>Change ↩</button>
            </div>
            <LessonView profile={selectedProfile} subject={subject} diff={subjectDiff[selectedProfile.id]?.[subject]||1} onStartQuiz={()=>setScreen("quiz")}/>
          </div>
        )}

        {screen==="quiz"&&selectedProfile&&subject&&(
          <QuizView
            profile={selectedProfile}
            subject={subject}
            startDiff={subjectDiff[selectedProfile.id]?.[subject]||1}
            onComplete={handleQuizComplete}
          />
        )}

        {screen==="result"&&selectedProfile&&result&&(
          <ResultView
            profile={selectedProfile}
            correct={result.correct} total={result.total} streak={result.streak}
            subject={subject} endDiff={result.endDiff}
            onRetry={()=>setScreen("lesson")}
            onChooseSubject={()=>setScreen("subjectPick")}
          />
        )}
      </div>
    </div>
  );
}
