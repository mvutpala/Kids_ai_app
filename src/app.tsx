import { useState, useEffect, useRef } from "react";

const COLORS = {
  sky: "#4FC3F7", sun: "#FFD54F", grass: "#66BB6A", coral: "#FF7043",
  purple: "#AB47BC", pink: "#EC407A", mint: "#26C6DA", orange: "#FFA726",
  white: "#FFFFFF", soft: "#F0F9FF", dark: "#1A237E", muted: "#546E7A",
  card: "#FFFDF7",
};

const MAX_MS = 60 * 60 * 1000;

const PROFILES = [
  { id: "a", name: "Kid 1", age: 9, emoji: "🦁", color: COLORS.coral, bg: "#FFF3F0", startLevel: 3, badge: "Super Solver" },
  { id: "b", name: "Kid 2", age: 5, emoji: "🐰", color: COLORS.purple, bg: "#F9F0FF", startLevel: 1, badge: "Math Explorer" },
];

const LEVELS = {
  1:{label:"Counting & Addition (1–10)",icon:"🍎",generate:()=>{const a=Math.floor(Math.random()*5)+1,b=Math.floor(Math.random()*5)+1;return{question:`${a} + ${b} = ?`,answer:a+b,op:"+",a,b};}},
  2:{label:"Addition & Subtraction (1–20)",icon:"🎈",generate:()=>{const op=Math.random()>0.5?"+":"-";const a=Math.floor(Math.random()*10)+5,b=op==="+"?Math.floor(Math.random()*10)+1:Math.floor(Math.random()*a)+1;return{question:`${a} ${op} ${b} = ?`,answer:op==="+"?a+b:a-b,op,a,b};}},
  3:{label:"Multiplication (1–5)",icon:"⭐",generate:()=>{const a=Math.floor(Math.random()*5)+1,b=Math.floor(Math.random()*5)+1;return{question:`${a} × ${b} = ?`,answer:a*b,op:"×",a,b};}},
  4:{label:"Multiplication (1–10)",icon:"🚀",generate:()=>{const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;return{question:`${a} × ${b} = ?`,answer:a*b,op:"×",a,b};}},
  5:{label:"Division",icon:"🍕",generate:()=>{const b=Math.floor(Math.random()*8)+2,ans=Math.floor(Math.random()*8)+1;return{question:`${b*ans} ÷ ${b} = ?`,answer:ans,op:"÷",a:b*ans,b};}},
  6:{label:"Mixed Operations",icon:"🎯",generate:()=>{const ops=["+","-","×","÷"],op=ops[Math.floor(Math.random()*ops.length)];if(op==="÷"){const b=Math.floor(Math.random()*8)+2,ans=Math.floor(Math.random()*8)+1;return{question:`${b*ans} ÷ ${b} = ?`,answer:ans,op,a:b*ans,b};}if(op==="×"){const a=Math.floor(Math.random()*10)+1,b=Math.floor(Math.random()*10)+1;return{question:`${a} × ${b} = ?`,answer:a*b,op,a,b};}const a=Math.floor(Math.random()*20)+5,b=op==="+"?Math.floor(Math.random()*15)+1:Math.floor(Math.random()*a)+1;return{question:`${a} ${op} ${b} = ?`,answer:op==="+"?a+b:a-b,op,a,b};}},
};

function generateSimilar(problem) {
  const {op}=problem;
  if(op==="+"){const a=Math.floor(Math.random()*8)+2,b=Math.floor(Math.random()*8)+2;return{question:`${a} + ${b} = ?`,answer:a+b,op,a,b};}
  if(op==="-"){const a=Math.floor(Math.random()*10)+6,b=Math.floor(Math.random()*a)+1;return{question:`${a} - ${b} = ?`,answer:a-b,op,a,b};}
  if(op==="×"){const a=Math.floor(Math.random()*5)+2,b=Math.floor(Math.random()*5)+2;return{question:`${a} × ${b} = ?`,answer:a*b,op,a,b};}
  const b=Math.floor(Math.random()*6)+2,ans=Math.floor(Math.random()*6)+1;return{question:`${b*ans} ÷ ${b} = ?`,answer:ans,op:"÷",a:b*ans,b};
}

function formatTime(ms) {
  const s=Math.max(0,Math.floor(ms/1000));
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
}

// Floating bubbles background
function Bubbles() {
  const bubbles = ["🌟","💫","✨","🎈","🎀","🌈","⭐","🎉","🦋","🌸"];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {bubbles.map((b,i)=>(
        <div key={i} style={{
          position:"absolute", fontSize: 16+Math.random()*14,
          left:`${(i*11)%95}%`, top:`${(i*17)%90}%`,
          opacity:0.12,
          animation:`float${i%3} ${4+i*0.7}s ease-in-out infinite`,
          animationDelay:`${i*0.4}s`
        }}>{b}</div>
      ))}
    </div>
  );
}

// Mom's message banner
function MomMessage({ onDismiss }) {
  const [wiggle, setWiggle] = useState(false);
  useEffect(()=>{const t=setInterval(()=>setWiggle(w=>!w),1500);return()=>clearInterval(t);},[]);
  return (
    <div style={{background:"linear-gradient(135deg,#FF6B9D,#FF8E53,#FFD93D)",borderRadius:24,padding:24,marginBottom:20,boxShadow:"0 8px 32px rgba(255,107,157,0.35)",position:"relative",overflow:"hidden"}}>
      {/* decorative stars */}
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

function TimerBar({ used, color }) {
  const pct=Math.min((used/MAX_MS)*100,100), remaining=MAX_MS-used;
  const warn=remaining<10*60*1000, critical=remaining<5*60*1000;
  const barColor=critical?"#EF5350":warn?COLORS.sun:color;
  return (
    <div style={{background:"rgba(255,255,255,0.9)",borderRadius:14,padding:"10px 14px",marginBottom:14,boxShadow:"0 2px 12px rgba(0,0,0,0.08)",backdropFilter:"blur(8px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:13,fontWeight:700,color:COLORS.muted}}>⏱ Today's time</span>
        <span style={{fontSize:13,fontWeight:800,color:critical?"#EF5350":warn?"#FF7043":COLORS.dark}}>{formatTime(remaining)} left</span>
      </div>
      <div style={{background:"#eee",borderRadius:99,height:8}}>
        <div style={{background:barColor,height:8,borderRadius:99,width:`${pct}%`,transition:"width 0.5s",boxShadow:`0 0 8px ${barColor}88`}}/>
      </div>
      {warn&&!critical&&<div style={{marginTop:5,fontSize:12,color:COLORS.coral,fontWeight:700}}>⚠️ Less than 10 minutes left!</div>}
      {critical&&<div style={{marginTop:5,fontSize:12,color:"#EF5350",fontWeight:800}}>🚨 Almost out of time!</div>}
    </div>
  );
}

function TimeUpScreen({ profile, onBack }) {
  return (
    <div style={{background:COLORS.white,borderRadius:24,padding:32,boxShadow:"0 8px 32px rgba(0,0,0,0.1)",textAlign:"center"}}>
      <div style={{fontSize:72,marginBottom:8,animation:"bounce 1s infinite"}}>⏰</div>
      <div style={{background:"linear-gradient(135deg,#FF6B9D,#FF8E53)",borderRadius:16,padding:16,marginBottom:16}}>
        <div style={{color:"white",fontWeight:900,fontSize:22}}>Time's Up, {profile.emoji}!</div>
        <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,marginTop:4}}>Mama Manasa says: "Even superheroes need rest! 🦸‍♀️"</div>
      </div>
      <p style={{color:COLORS.muted,fontSize:15,lineHeight:1.7,margin:"0 0 20px"}}>You've used your <strong>1 hour</strong> for today!<br/>Your brain worked SUPER hard! 🧠💪</p>
      <div style={{background:"#FFF9C4",borderRadius:16,padding:16,marginBottom:20,border:"2px dashed #FFD54F"}}>
        <div style={{fontSize:28,marginBottom:6}}>🧩</div>
        <div style={{fontWeight:800,color:COLORS.dark,fontSize:15}}>Remember what Mama said!</div>
        <div style={{color:COLORS.muted,fontSize:13,marginTop:4,lineHeight:1.6}}>Every puzzle gets easier the more you practice. See you tomorrow, puzzle champion! 🏆</div>
      </div>
      <button onClick={onBack} style={{background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",border:"none",borderRadius:14,padding:"14px 28px",fontSize:16,fontWeight:800,cursor:"pointer",width:"100%",boxShadow:"0 4px 15px rgba(102,126,234,0.4)"}}>← Back to Home</button>
    </div>
  );
}

function Stars({ count }) {
  return <span>{Array.from({length:5},(_,i)=><span key={i} style={{fontSize:22,color:i<count?"#FFD54F":"#ddd",textShadow:i<count?"0 0 8px #FFD54F88":"none"}}>★</span>)}</span>;
}

function FloatingConfetti({ show }) {
  if (!show) return null;
  const items = ["🎉","⭐","🌟","💫","🎈","✨","🏆","🎊"];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:100}}>
      {items.map((item,i)=>(
        <div key={i} style={{
          position:"absolute", fontSize:24+Math.random()*16,
          left:`${10+i*11}%`, top:"-10%",
          animation:`fall ${1.5+i*0.2}s ease-in forwards`,
          animationDelay:`${i*0.1}s`
        }}>{item}</div>
      ))}
    </div>
  );
}

function VisualHint({ problem }) {
  const {op,a,b}=problem;
  const [frame,setFrame]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setFrame(f=>(f+1)%3),900);return()=>clearInterval(t);},[]);
  const pulse={display:"inline-block",transform:frame===1?"scale(1.4)":"scale(1)",transition:"transform 0.3s"};

  if(op==="+"){
    const emojis=["🍎","🍊","🍇","🍓","🍌","🫐","🍑","🥭"];
    const e=emojis[a%emojis.length];
    return(
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{background:"#FFF9C4",borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:12,color:COLORS.muted,marginBottom:6}}>🧺 You have <b>{a}</b> fruits</div>
          <div style={{fontSize:20,letterSpacing:3}}>{Array.from({length:Math.min(a,8)},(_,i)=><span key={i}>{e}</span>)}{a>8?"...":""}</div>
        </div>
        <div style={{fontSize:20,color:COLORS.muted}}>➕</div>
        <div style={{background:"#E8F5E9",borderRadius:12,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:COLORS.muted,marginBottom:6}}>🎁 You get <b>{b}</b> more</div>
          <div style={{fontSize:20,letterSpacing:3}}>{Array.from({length:Math.min(b,8)},(_,i)=><span key={i} style={pulse}>🎁</span>)}{b>8?"...":""}</div>
        </div>
        <div style={{marginTop:10,fontSize:14,fontWeight:800,color:COLORS.dark}}>Put them all together! 🤔</div>
      </div>
    );
  }
  if(op==="-"){
    return(
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{background:"#FFF9C4",borderRadius:12,padding:12,marginBottom:8}}>
          <div style={{fontSize:12,color:COLORS.muted,marginBottom:6}}>🍪 You have <b>{a}</b> cookies</div>
          <div style={{fontSize:20,letterSpacing:2}}>{Array.from({length:Math.min(a,10)},(_,i)=><span key={i}>🍪</span>)}{a>10?"...":""}</div>
        </div>
        <div style={{fontSize:20,color:COLORS.muted}}>➖</div>
        <div style={{background:"#FDE8E8",borderRadius:12,padding:12,marginTop:8}}>
          <div style={{fontSize:12,color:COLORS.muted,marginBottom:6}}>😋 You eat <b>{b}</b> of them</div>
          <div style={{fontSize:20,letterSpacing:2}}>{Array.from({length:Math.min(b,10)},(_,i)=><span key={i} style={{opacity:0.25,textDecoration:"line-through"}}>🍪</span>)}{b>10?"...":""}</div>
        </div>
        <div style={{marginTop:10,fontSize:14,fontWeight:800,color:COLORS.dark}}>How many cookies are left? 🤔</div>
      </div>
    );
  }
  if(op==="×"){
    const rows=Math.min(a,5),cols=Math.min(b,5);
    return(
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontSize:13,color:COLORS.muted,marginBottom:8}}><b>{a}</b> groups, each with <b>{b}</b> ⭐</div>
        <div style={{background:"#F3E5F5",borderRadius:12,padding:12}}>
          {Array.from({length:rows},(_,r)=>(
            <div key={r} style={{marginBottom:4}}>
              {Array.from({length:cols},(_,c)=>(
                <span key={c} style={{fontSize:18,margin:"0 2px",...(frame===1&&r===0?pulse:{})}}>⭐</span>
              ))}{b>5?"...":""}
            </div>
          ))}{a>5?<div style={{color:COLORS.muted,fontSize:12}}>...{a-5} more rows</div>:""}
        </div>
        <div style={{marginTop:10,fontSize:14,fontWeight:800,color:COLORS.dark}}>Count ALL the stars! 🤔</div>
      </div>
    );
  }
  if(op==="÷"){
    return(
      <div style={{textAlign:"center",padding:"8px 0"}}>
        <div style={{fontSize:13,color:COLORS.muted,marginBottom:8}}>Share <b>{a}</b> 🍕 among <b>{b}</b> friends equally!</div>
        <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
          {Array.from({length:Math.min(b,6)},(_,i)=>(
            <div key={i} style={{background:"#E8F5E9",borderRadius:10,padding:"8px 12px",fontSize:13,fontWeight:700,border:"2px dashed #81C784"}}>
              🧑 Friend {i+1}<br/><span style={{fontSize:20,color:COLORS.coral}}>?</span>
            </div>
          ))}{b>6?<div style={{fontSize:12,color:COLORS.muted,alignSelf:"center"}}>+{b-6} more</div>:""}
        </div>
        <div style={{fontSize:14,fontWeight:800,color:COLORS.dark}}>How many slices each? 🤔</div>
      </div>
    );
  }
  return null;
}

function VideoHint({ problem, age }) {
  const queries={"+":"addition for kids fun","- ":"subtraction for kids fun","×":"multiplication for kids fun","÷":"division for kids fun"};
  const q=encodeURIComponent((queries[problem.op]||"math for kids")+` ${age} year old`);
  return(
    <a href={`https://www.youtube.com/results?search_query=${q}`} target="_blank" rel="noopener noreferrer"
      style={{display:"flex",alignItems:"center",gap:10,background:"linear-gradient(135deg,#FF0000,#CC0000)",borderRadius:12,padding:"12px 16px",textDecoration:"none",color:"white",fontWeight:800,fontSize:14,marginTop:10,boxShadow:"0 4px 12px rgba(255,0,0,0.3)"}}>
      <span style={{fontSize:24}}>▶️</span>
      <div><div>Watch a fun video!</div><div style={{fontSize:11,fontWeight:500,opacity:0.9}}>Opens YouTube — ask a grown-up first 🙋</div></div>
    </a>
  );
}

function HintBox({ problem, age, attemptsLeft, onDismiss }) {
  return(
    <div style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px dashed #FFD54F",borderRadius:20,padding:18,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:16,color:COLORS.dark}}>🧩 Puzzle Clue Time!</div>
        <div style={{background:COLORS.sun,borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:800,color:COLORS.dark}}>
          {attemptsLeft} tr{attemptsLeft===1?"y":"ies"} left!
        </div>
      </div>
      <VisualHint problem={problem}/>
      <VideoHint problem={problem} age={age}/>
      <button onClick={onDismiss} style={{marginTop:12,background:"linear-gradient(135deg,#FFD54F,#FF8E53)",color:COLORS.dark,border:"none",borderRadius:12,padding:"12px 20px",fontWeight:900,fontSize:15,cursor:"pointer",width:"100%",boxShadow:"0 4px 12px rgba(255,142,83,0.3)"}}>
        I got it! Let me try again 💪
      </button>
    </div>
  );
}

function SolutionBox({ problem, similarProblems, onNextSimilar }) {
  return(
    <div style={{background:"linear-gradient(135deg,#E8F5E9,#F1F8E9)",border:"3px solid #81C784",borderRadius:20,padding:18,marginBottom:14}}>
      <div style={{fontWeight:900,fontSize:16,color:COLORS.dark,marginBottom:12}}>🎓 Let's crack this puzzle together!</div>
      <div style={{background:COLORS.white,borderRadius:14,padding:14,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        {problem.op==="+"&&<>
          <div style={{fontSize:13,color:COLORS.muted,marginBottom:6}}>🐾 Count on from {problem.a}...</div>
          <div style={{fontSize:14,color:COLORS.coral,marginBottom:6}}>{Array.from({length:Math.min(problem.b,8)},(_,i)=><span key={i}>+1 </span>)}</div>
          <div style={{fontSize:20,fontWeight:900,color:COLORS.grass}}>{problem.a} + {problem.b} = {problem.answer} ✅</div>
        </>}
        {problem.op==="-"&&<>
          <div style={{fontSize:13,color:COLORS.muted,marginBottom:6}}>🐾 Count backwards from {problem.a}...</div>
          <div style={{fontSize:14,color:COLORS.purple,marginBottom:6}}>{Array.from({length:Math.min(problem.b,8)},(_,i)=><span key={i}>-1 </span>)}</div>
          <div style={{fontSize:20,fontWeight:900,color:COLORS.grass}}>{problem.a} - {problem.b} = {problem.answer} ✅</div>
        </>}
        {problem.op==="×"&&<>
          <div style={{fontSize:13,color:COLORS.muted,marginBottom:6}}>🔄 Add {problem.b}, exactly {problem.a} times:</div>
          <div style={{fontSize:14,color:COLORS.coral,marginBottom:6}}>{Array.from({length:Math.min(problem.a,6)},(_,i)=><span key={i}>{problem.b}{i<Math.min(problem.a,6)-1?" + ":""}</span>)}{problem.a>6?"...":""} = {problem.answer}</div>
          <div style={{fontSize:20,fontWeight:900,color:COLORS.grass}}>{problem.a} × {problem.b} = {problem.answer} ✅</div>
        </>}
        {problem.op==="÷"&&<>
          <div style={{fontSize:13,color:COLORS.muted,marginBottom:6}}>🍕 Share {problem.a} into {problem.b} equal groups:</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>{Array.from({length:Math.min(problem.b,6)},(_,i)=><div key={i} style={{background:"#E8F5E9",borderRadius:8,padding:"4px 8px",fontSize:13,fontWeight:700}}>{problem.answer} each</div>)}</div>
          <div style={{fontSize:20,fontWeight:900,color:COLORS.grass}}>{problem.a} ÷ {problem.b} = {problem.answer} ✅</div>
        </>}
      </div>
      <div style={{background:"#FFF9C4",borderRadius:14,padding:12,border:"2px dashed #FFD54F"}}>
        <div style={{fontWeight:800,fontSize:14,color:COLORS.dark,marginBottom:8}}>🎯 Now try a similar puzzle!</div>
        <div style={{fontSize:32,fontWeight:900,color:COLORS.dark,textAlign:"center",marginBottom:10}}>{similarProblems[0]?.question}</div>
        <button onClick={onNextSimilar} style={{background:"linear-gradient(135deg,#66BB6A,#43A047)",color:"white",border:"none",borderRadius:12,padding:"12px 24px",fontWeight:900,fontSize:15,cursor:"pointer",width:"100%",boxShadow:"0 4px 12px rgba(102,187,106,0.4)"}}>
          I'll try this one! 🚀
        </button>
      </div>
    </div>
  );
}

function LessonView({ profile, level, onStartQuiz }) {
  const [aiLesson,setAiLesson]=useState(""),[ loading,setLoading]=useState(true);
  useEffect(()=>{
    setLoading(true);setAiLesson("");
    (async()=>{
      try{
        const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:`You are a super fun math teacher for kids! Teach "${LEVELS[level].label}" to a ${profile.age}-year-old. Write a SHORT, SILLY, fun lesson (max 120 words) using lots of emojis, a funny real-world example (like pizza, dinosaurs, toys), one worked example, and an encouraging punchline at the end. No markdown. Plain text only.`}]})});
        const data=await res.json();
        setAiLesson(data.content?.[0]?.text||"Let's do some math magic today! ✨");
      }catch{setAiLesson("Let's learn math today! 🌟");}
      setLoading(false);
    })();
  },[level,profile]);
  return(
    <div style={{background:COLORS.white,borderRadius:24,padding:24,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:`3px solid ${profile.color}33`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${profile.color},${profile.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,boxShadow:`0 4px 12px ${profile.color}44`}}>{profile.emoji}</div>
        <div>
          <div style={{fontWeight:900,fontSize:19,color:COLORS.dark}}>{profile.name}'s Lesson!</div>
          <div style={{color:COLORS.muted,fontSize:13}}>{LEVELS[level].icon} {LEVELS[level].label}</div>
        </div>
      </div>
      <div style={{background:`linear-gradient(135deg,${profile.bg},#FAFFF8)`,borderRadius:16,padding:18,minHeight:110,marginBottom:18,fontSize:15,lineHeight:1.8,color:"#333",border:`2px dashed ${profile.color}44`}}>
        {loading?<div style={{display:"flex",alignItems:"center",gap:10,color:COLORS.muted}}><span style={{fontSize:24,animation:"spin 1s linear infinite",display:"inline-block"}}>⏳</span>Loading your lesson...</div>:aiLesson}
      </div>
      <button onClick={onStartQuiz} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:16,padding:"16px 32px",fontSize:19,fontWeight:900,cursor:"pointer",width:"100%",boxShadow:`0 6px 20px ${profile.color}55`,letterSpacing:0.5}}>
        Let's Quiz! 🎯
      </button>
    </div>
  );
}

function QuizView({ profile, level, onComplete }) {
  const TOTAL_Q=5,MAX_ATTEMPTS=3;
  const [problem,setProblem]=useState(()=>LEVELS[level].generate());
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

  const getAiFeedback=async(isCorrect,wasHinted)=>{
    setLoadingFeedback(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:`Fun math teacher for ${profile.age}-year-old. Question: ${problem.question}, correct: ${isCorrect}, used hints: ${wasHinted}. ONE sentence (max 15 words) of ${isCorrect?"wild celebration":"warm silly encouragement"}. 1-2 emojis. No markdown.`}]})});
      const data=await res.json();
      setAiFeedback(data.content?.[0]?.text||(isCorrect?"You're a math superstar! 🌟":"You've got this, keep going! 💪"));
    }catch{setAiFeedback(isCorrect?"Woohoo! Amazing! 🎉":"You can do it! 💪");}
    setLoadingFeedback(false);
  };

  const handleSubmit=async()=>{
    const val=parseInt(input);
    if(isNaN(val))return;
    const isCorrect=val===problem.answer,newAttempts=attempts+1;
    setAttempts(newAttempts);
    if(isCorrect){
      if(newAttempts===1)setStreak(s=>s+1);else setStreak(0);
      setCorrect(c=>c+1);
      setShowConfetti(true);
      setTimeout(()=>setShowConfetti(false),2000);
      setPhase("correct");
      await getAiFeedback(true,newAttempts>1);
    }else{
      if(newAttempts<MAX_ATTEMPTS){setPhase("hint");}
      else{
        setStreak(0);
        setSimilarProblems([generateSimilar(problem),generateSimilar(problem),generateSimilar(problem)]);
        setPhase("solution");
      }
    }
  };

  const moveNext=()=>{
    if(questionNum>=TOTAL_Q){onComplete(correct,TOTAL_Q,streak);}
    else{setQuestionNum(n=>n+1);setProblem(LEVELS[level].generate());setAttempts(0);setPhase("answering");setAiFeedback("");}
  };

  const handleSimilarAttempt=()=>{setProblem(similarProblems[0]);setAttempts(0);setPhase("answering");};
  const progress=((questionNum-1)/TOTAL_Q)*100;
  const attemptsLeft=MAX_ATTEMPTS-attempts;

  return(
    <div style={{background:COLORS.white,borderRadius:24,padding:22,boxShadow:"0 8px 32px rgba(0,0,0,0.08)",border:`3px solid ${profile.color}22`}}>
      <FloatingConfetti show={showConfetti}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontWeight:900,color:COLORS.dark,fontSize:15}}>{profile.emoji} Question {questionNum}/{TOTAL_Q}</span>
        <span style={{background:COLORS.grass+"22",color:COLORS.grass,fontWeight:800,fontSize:14,padding:"4px 10px",borderRadius:99}}>✓ {correct} correct</span>
      </div>
      {/* progress bar */}
      <div style={{background:"#eee",borderRadius:99,height:10,marginBottom:16,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(90deg,${profile.color},${COLORS.sun})`,height:10,borderRadius:99,width:`${progress}%`,transition:"width 0.4s",boxShadow:`0 0 8px ${profile.color}88`}}/>
      </div>
      {/* attempt dots */}
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16,alignItems:"center"}}>
        {Array.from({length:MAX_ATTEMPTS},(_,i)=>(
          <div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<attempts?(phase==="solution"&&i===MAX_ATTEMPTS-1?"#EF5350":"#FFD54F"):phase==="correct"&&i===0?COLORS.grass:"#ddd",transition:"background 0.3s",boxShadow:i<attempts?"0 0 6px #FFD54F88":"none"}}/>
        ))}
        <span style={{fontSize:12,color:COLORS.muted,marginLeft:4}}>
          {phase==="correct"?"✅":phase==="solution"?"💡 Revealed!":attemptsLeft===3?"First try!":attemptsLeft===2?"1 wrong — try again!":"Last chance!"}
        </span>
      </div>
      {/* question bubble */}
      <div style={{background:`linear-gradient(135deg,${profile.bg},#FAFFFE)`,borderRadius:20,padding:22,textAlign:"center",marginBottom:18,border:`2px dashed ${profile.color}44`}}>
        <div style={{fontSize:14,color:COLORS.muted,marginBottom:4,fontWeight:600}}>{LEVELS[level].icon} Solve this puzzle!</div>
        <div style={{fontSize:52,fontWeight:900,color:COLORS.dark,letterSpacing:3,textShadow:`2px 2px 0 ${profile.color}33`}}>{problem.question}</div>
      </div>

      {phase==="answering"&&(
        <div style={{display:"flex",gap:10}}>
          <input ref={inputRef} type="number" value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            placeholder="Type your answer!"
            style={{flex:1,border:`3px solid ${phase==="answering"?profile.color:"#eee"}`,borderRadius:14,padding:"14px 18px",fontSize:24,fontWeight:900,outline:"none",textAlign:"center",color:COLORS.dark,background:"#FAFAFA"}}/>
          <button onClick={handleSubmit} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:14,padding:"14px 20px",fontSize:22,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 12px ${profile.color}55`}}>→</button>
        </div>
      )}

      {phase==="hint"&&<HintBox problem={problem} age={profile.age} attemptsLeft={attemptsLeft} onDismiss={()=>setPhase("answering")}/>}

      {phase==="solution"&&(
        <>
          <SolutionBox problem={problem} similarProblems={similarProblems} onNextSimilar={handleSimilarAttempt}/>
          <button onClick={moveNext} style={{background:"#eee",color:COLORS.dark,border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%"}}>Skip to next question →</button>
        </>
      )}

      {phase==="correct"&&(
        <div style={{background:"linear-gradient(135deg,#E8F5E9,#F1F8E9)",borderRadius:18,padding:20,textAlign:"center",border:"3px solid #81C784"}}>
          <div style={{fontSize:48,marginBottom:6}}>{attempts===1?"🏆":"💪"}</div>
          <div style={{fontWeight:900,fontSize:20,color:COLORS.grass,marginBottom:6}}>{attempts===1?"PERFECT! First try! 🌟":"Got it! 💪"}</div>
          <div style={{color:COLORS.muted,fontSize:14,marginBottom:12}}>{loadingFeedback?"...✨":aiFeedback}</div>
          {streak>=2&&<div style={{color:COLORS.sun,fontWeight:900,fontSize:16,marginBottom:8,textShadow:"0 0 8px #FFD54F"}}>🔥 {streak} in a row! YOU'RE ON FIRE!</div>}
          <button onClick={moveNext} style={{background:`linear-gradient(135deg,${profile.color},${profile.color}BB)`,color:"white",border:"none",borderRadius:14,padding:"14px 28px",fontSize:17,fontWeight:900,cursor:"pointer",boxShadow:`0 6px 16px ${profile.color}44`}}>
            {questionNum>=TOTAL_Q?"See Results! 🏆":"Next Puzzle! →"}
          </button>
        </div>
      )}
    </div>
  );
}

function ResultView({ profile, correct, total, streak, level, onContinue, onRetry }) {
  const score=Math.round((correct/total)*100);
  const stars=score>=90?5:score>=70?4:score>=50?3:score>=30?2:1;
  const levelUp=score>=80&&level<6,levelDown=score<40&&level>1;
  const msgs=["Keep going, you're learning! 🌱","Nice effort, getting stronger! 💪","Solid work, keep it up! ⭐","Great job, puzzle solver! 🧩","AMAZING! You're a MATH STAR! 🏆"];
  return(
    <div style={{background:COLORS.white,borderRadius:24,padding:26,boxShadow:"0 8px 32px rgba(0,0,0,0.1)",textAlign:"center"}}>
      <div style={{background:`linear-gradient(135deg,${profile.color},${profile.color}99)`,borderRadius:20,padding:20,marginBottom:18,boxShadow:`0 6px 20px ${profile.color}44`}}>
        <div style={{fontSize:56,marginBottom:6}}>{score>=80?"🏆":score>=50?"🌟":"💪"}</div>
        <div style={{fontWeight:900,fontSize:24,color:"white"}}>{profile.emoji} {profile.name}</div>
        <div style={{color:"rgba(255,255,255,0.9)",fontSize:14,marginTop:4}}>{msgs[stars-1]}</div>
      </div>
      <div style={{marginBottom:12}}><Stars count={stars}/></div>
      <div style={{fontSize:52,fontWeight:900,color:profile.color,marginBottom:4,textShadow:`2px 2px 0 ${profile.color}33`}}>{score}%</div>
      <div style={{color:COLORS.muted,marginBottom:12,fontSize:15}}>{correct} out of {total} correct</div>
      {streak>=3&&<div style={{background:"#FFF9C4",borderRadius:12,padding:10,marginBottom:12,fontWeight:900,color:COLORS.dark,fontSize:15}}>🔥 Best streak: {streak} in a row!</div>}
      {levelUp&&<div style={{background:"#E8F5E9",borderRadius:14,padding:14,marginBottom:14,color:COLORS.grass,fontWeight:900,border:"2px solid #81C784"}}>⬆️ LEVEL UP! You unlocked harder puzzles! 🔓</div>}
      {levelDown&&<div style={{background:"#FFF3E0",borderRadius:14,padding:14,marginBottom:14,color:COLORS.coral,fontWeight:700}}>Let's practice this level a bit more 💪 You've got this!</div>}
      <div style={{background:"#FFF9C4",borderRadius:14,padding:12,marginBottom:18,border:"2px dashed #FFD54F"}}>
        <div style={{fontSize:13,color:COLORS.dark,fontWeight:700}}>💌 Mama Manasa says: "{score>=80?"I knew you could do it, my little puzzle master!":"Every puzzle takes practice — and you're getting better every time! 🧩"}"</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onRetry} style={{flex:1,background:"#eee",color:COLORS.dark,border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:800,cursor:"pointer"}}>Try Again 🔄</button>
        <button onClick={()=>onContinue(levelUp?level+1:levelDown?level-1:level)} style={{flex:2,background:`linear-gradient(135deg,${profile.color},${profile.color}CC)`,color:"white",border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:900,cursor:"pointer",boxShadow:`0 4px 12px ${profile.color}44`}}>
          {levelUp?"Next Level! 🚀":"New Lesson 📚"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedProfile,setSelectedProfile]=useState(null);
  const [level,setLevel]=useState(1);
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
    }else{
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
    setSelectedProfile(profile);setLevel(profile.startLevel);
    setScreen(isTimedOut(profile.id)?"timeout":"lesson");
  };

  const handleQuizComplete=(correct,total,streak)=>{
    setResult({correct,total,streak});
    setHistory(h=>({...h,[selectedProfile.id]:[...h[selectedProfile.id],Math.round((correct/total)*100)]}));
    setScreen("result");
  };

  const goHome=()=>{setScreen("home");setSelectedProfile(null);};

  useEffect(()=>{
    if(selectedProfile&&isTimedOut(selectedProfile.id)&&screen!=="home"&&screen!=="timeout")setScreen("timeout");
  },[timeUsed]);

  const getTimeLabel=id=>{
    const r=MAX_MS-timeUsed[id];
    if(r<=0)return"⏰ Done for today";
    return`${Math.floor(r/60000)}m left today`;
  };

  return(
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
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:4,filter:"drop-shadow(0 4px 8px rgba(0,0,0,0.2))"}}>🧮</div>
          <h1 style={{margin:"0 0 4px",fontWeight:900,fontSize:30,color:"white",textShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>Math Adventure!</h1>
          <p style={{margin:0,color:"rgba(255,255,255,0.85)",fontSize:14,fontWeight:600}}>🧩 Every number is a puzzle waiting to be solved!</p>
        </div>

        {/* Mom's message on home screen */}
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
              const scores=history[p.id],avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
              const timedOut=isTimedOut(p.id);
              return(
                <div key={p.id} onClick={()=>!timedOut&&selectProfile(p)}
                  style={{background:timedOut?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.95)",borderRadius:22,padding:20,marginBottom:14,cursor:timedOut?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:16,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:`3px solid ${timedOut?"#ccc":p.color}`,transition:"all 0.2s",opacity:timedOut?0.7:1,backdropFilter:"blur(8px)"}}
                  onMouseEnter={e=>{if(!timedOut)e.currentTarget.style.transform="scale(1.02)"}}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{width:64,height:64,borderRadius:20,background:`linear-gradient(135deg,${p.color},${p.color}99)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:`0 4px 16px ${p.color}55`,flexShrink:0}}>{p.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:900,fontSize:19,color:COLORS.dark}}>{p.name}</div>
                    <div style={{color:p.color,fontSize:13,marginTop:2,fontWeight:700}}>🏅 {p.badge}</div>
                    <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
                      {avg!==null&&<span style={{background:`${p.color}22`,color:p.color,fontWeight:800,fontSize:12,padding:"2px 8px",borderRadius:99}}>Avg: {avg}% 📊</span>}
                      <span style={{background:timedOut?"#fde8e8":"#e8f5e9",color:timedOut?"#EF5350":COLORS.grass,fontWeight:700,fontSize:12,padding:"2px 8px",borderRadius:99}}>{getTimeLabel(p.id)}</span>
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

        {screen==="lesson"&&selectedProfile&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"10px 16px",marginBottom:14,fontSize:14,color:"white",fontWeight:700,backdropFilter:"blur(8px)"}}>
              {LEVELS[level].icon} Level {level}: {LEVELS[level].label}
            </div>
            <LessonView profile={selectedProfile} level={level} onStartQuiz={()=>setScreen("quiz")}/>
          </div>
        )}

        {screen==="quiz"&&selectedProfile&&(
          <QuizView profile={selectedProfile} level={level} onComplete={handleQuizComplete}/>
        )}

        {screen==="result"&&selectedProfile&&result&&(
          <ResultView profile={selectedProfile} correct={result.correct} total={result.total} streak={result.streak} level={level}
            onRetry={()=>setScreen("lesson")}
            onContinue={newLevel=>{setLevel(Math.min(Math.max(newLevel,1),6));setScreen("lesson");}}/>
        )}
      </div>
    </div>
  );
}
