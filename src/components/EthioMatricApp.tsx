import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Home, BookOpen, BarChart2, User, Bell, Search, ChevronRight, ChevronDown,
  Play, Clock, CheckCircle, Star, Flame, Target, Trophy, Moon, HelpCircle,
  Info, Settings, LogOut, ArrowLeft, Zap, TrendingUp, XCircle, RotateCcw,
  ListChecks, BookMarked, Bookmark, LayoutGrid, GraduationCap, X, Sun,
  Send, CheckCheck, AlertCircle, MessageSquare, ChevronLeft,
  Pencil, Save,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Question = {
  id: number; text: string; options: string[];
  answer: number; explanation: string;
};
type Unit = { unit: number; title: string; questions: Question[] };
type GradeData = { grade: number; units: Unit[] };
type Subject = typeof subjects[0];
type Stream = "natural" | "social";
type Screen =
  | { name: "home" }
  | { name: "exams" }
  | { name: "subjectDetails"; subject: Subject }
  | { name: "quiz"; subject: Subject; questions: Question[]; title: string; initialMode: "practice" | "exam"; durationSeconds?: number }
  | { name: "progress" }
  | { name: "profile" }
  | { name: "notifications"; from: "home" | "profile" }
  | { name: "helpSupport" }
  | { name: "settings" };

// ─── Subjects ─────────────────────────────────────────────────────────────────

const subjects = [
  { id: 1,  name: "Mathematics", icon: "📐", papers: 12, completion: 72, color: "#6c3fcf", bg: "#ede9f9" },
  { id: 2,  name: "English",     icon: "📖", papers: 10, completion: 55, color: "#0ea5e9", bg: "#e0f2fe" },
  { id: 3,  name: "Physics",     icon: "⚡", papers:  9, completion: 40, color: "#f59e0b", bg: "#fef3c7" },
  { id: 4,  name: "Chemistry",   icon: "🧪", papers: 11, completion: 30, color: "#10b981", bg: "#d1fae5" },
  { id: 5,  name: "Biology",     icon: "🧬", papers:  8, completion: 60, color: "#ec4899", bg: "#fce7f3" },
  { id: 6,  name: "History",     icon: "📜", papers:  8, completion: 45, color: "#f97316", bg: "#ffedd5" },
  { id: 7,  name: "Geography",   icon: "🌍", papers:  6, completion: 20, color: "#14b8a6", bg: "#ccfbf1" },
  { id: 8,  name: "Economics",   icon: "📊", papers:  7, completion: 25, color: "#84cc16", bg: "#f7fee7" },
  { id: 9,  name: "SAT",         icon: "🎯", papers:  6, completion: 35, color: "#ef4444", bg: "#fee2e2" },
];

const NATURAL_IDS = [2, 1, 9, 3, 4, 5]; // English, Math, SAT, Physics, Chemistry, Biology
const SOCIAL_IDS  = [2, 1, 9, 6, 7, 8]; // English, Math, SAT, History, Geography, Economics

const CHIP_YEARS = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010"];

// ─── Full-Paper Questions ─────────────────────────────────────────────────────

const FULL_PAPER_QUESTIONS: Question[] = [
  { id:1,  text:"lim x→0 (sin x)/x = ?", options:["1","0","∞","Undefined"], answer:0,
    explanation:"By the squeeze theorem or L'Hôpital's rule: as x→0, sin(x)/x → 1. This is foundational in calculus." },
  { id:2,  text:"Derivative of f(x) = x³ − 3x² + 2x:", options:["3x²−6x+2","x²−6x+2","3x²−3x","3x²+2"], answer:0,
    explanation:"Power rule term-by-term: d/dx(x³)=3x², d/dx(−3x²)=−6x, d/dx(2x)=2." },
  { id:3,  text:"∫₀¹ x² dx = ?", options:["1/3","1/2","1","2/3"], answer:0,
    explanation:"∫x²dx = x³/3. Evaluate from 0 to 1: 1/3 − 0 = 1/3." },
  { id:4,  text:"Sum to infinity of 1+½+¼+… is:", options:["2","1","4","∞"], answer:0,
    explanation:"Geometric series: S∞ = a/(1−r) = 1/(1−½) = 2. Valid since |r|<1." },
  { id:5,  text:"log₂(32) = ?", options:["5","4","6","16"], answer:0,
    explanation:"2⁵=32, so log₂(32)=5." },
  { id:6,  text:"Roots of x²−5x+6=0:", options:["2 and 3","1 and 6","−2 and −3","−1 and −6"], answer:0,
    explanation:"Factor: (x−2)(x−3)=0. Roots: x=2, x=3." },
  { id:7,  text:"sin θ=3/5 in Q1 → cos θ=?", options:["4/5","3/4","5/4","3/5"], answer:0,
    explanation:"cos²θ=1−sin²θ=1−9/25=16/25. cos θ=4/5 (positive in Q1)." },
  { id:8,  text:"Distance from (1,2) to (4,6):", options:["5","7","3","√7"], answer:0,
    explanation:"d=√((4−1)²+(6−2)²)=√(9+16)=√25=5." },
  { id:9,  text:"Solve: 3x−7=2(x+3)", options:["13","1","−13","7"], answer:0,
    explanation:"3x−7=2x+6 → x=13." },
  { id:10, text:"Mean of {4,8,12,6,10}:", options:["8","10","6","12"], answer:0,
    explanation:"(4+8+12+6+10)/5=40/5=8." },
  { id:11, text:"Geometric mean between 2 and 18:", options:["6","9","10","4"], answer:0,
    explanation:"√(2×18)=√36=6." },
  { id:12, text:"f(x)=2x+1 → f⁻¹(x)=?", options:["(x−1)/2","(x+1)/2","2x−1","x/2−1"], answer:0,
    explanation:"y=2x+1 → x=(y−1)/2, so f⁻¹(x)=(x−1)/2." },
  { id:13, text:"Standard form of quadratic:", options:["ax²+bx+c=0","ax+b=0","ax³+bx=c","a/x+b=0"], answer:0,
    explanation:"A quadratic has degree 2: ax²+bx+c=0 where a≠0." },
  { id:14, text:"Discriminant of x²+4x+4=0:", options:["0","4","16","−4"], answer:0,
    explanation:"Δ=b²−4ac=16−16=0. One repeated root." },
  { id:15, text:"Slope through (2,3) and (5,9):", options:["2","3","½","6"], answer:0,
    explanation:"m=(9−3)/(5−2)=6/3=2." },
];

// ─── Unit Question Bank ───────────────────────────────────────────────────────

const QUESTION_BANK: Record<string, Omit<Question, "id">[]> = {
  "12-1":[
    {text:"Derivative of f(x)=x³+2x:",options:["3x²+2","3x²","x²+2","3x+2"],answer:0,explanation:"Power rule: d/dx(x³)=3x², d/dx(2x)=2."},
    {text:"lim x→2 (x²−4)/(x−2):",options:["4","2","0","Undefined"],answer:0,explanation:"Factor: (x²−4)=(x−2)(x+2). Cancel → x+2 at x=2 = 4."},
    {text:"∫(3x²+1)dx:",options:["x³+x+C","6x+C","3x³+C","x³+C"],answer:0,explanation:"∫3x²dx=x³, ∫1dx=x. Result: x³+x+C."},
  ],
  "12-2":[
    {text:"Common ratio of 3,9,27,81:",options:["3","6","9","27"],answer:0,explanation:"9÷3=3. r=3."},
    {text:"Sum of first 5 terms of 1,2,4,8…:",options:["31","32","16","63"],answer:0,explanation:"Sₙ=a(rⁿ−1)/(r−1)=31."},
    {text:"Which is arithmetic?",options:["2,5,8,11","1,2,4,8","1,4,9,16","3,9,27,81"],answer:0,explanation:"d=3 constant."},
    {text:"nth term with a=2,r=3:",options:["2·3ⁿ⁻¹","3·2ⁿ","2ⁿ","3ⁿ"],answer:0,explanation:"aₙ=a·rⁿ⁻¹=2·3ⁿ⁻¹."},
    {text:"Geometric mean of 4 and 36:",options:["12","10","18","8"],answer:0,explanation:"√(4×36)=√144=12."},
  ],
  "12-3":[
    {text:"Mean of 5,10,15,20,25:",options:["15","12","20","10"],answer:0,explanation:"75/5=15."},
    {text:"Median of 2,3,5,7,9:",options:["5","7","3","9"],answer:0,explanation:"Middle of 5 values = 5."},
  ],
  "11-1":[
    {text:"Roots of x²−5x+6=0:",options:["2 and 3","1 and 6","−2 and −3","3 and 4"],answer:0,explanation:"(x−2)(x−3)=0."},
    {text:"f(x)=2x+3 → f(4):",options:["11","8","14","10"],answer:0,explanation:"2(4)+3=11."},
    {text:"Degree of 4x³−2x+7:",options:["3","1","4","7"],answer:0,explanation:"Highest power is 3."},
    {text:"Which is a polynomial?",options:["3x²+2x−1","√x+1","1/x","x⁻²"],answer:0,explanation:"Non-negative integer exponents only."},
  ],
  "11-2":[
    {text:"log₁₀(1000):",options:["3","4","2","10"],answer:0,explanation:"10³=1000."},
    {text:"e⁰=?",options:["1","0","e","∞"],answer:0,explanation:"Any non-zero number to power 0 = 1."},
    {text:"2ˣ=32 → x=?",options:["5","4","6","3"],answer:0,explanation:"2⁵=32."},
  ],
  "11-3":[
    {text:"sin(90°)=?",options:["1","0","−1","½"],answer:0,explanation:"By unit circle, sin(90°)=1."},
    {text:"cos(0°)=?",options:["1","0","−1","½"],answer:0,explanation:"At 0° on unit circle, x-coord=1."},
  ],
  "10-1":[
    {text:"Solve 2x²−8=0:",options:["x=±2","x=2","x=4","x=±4"],answer:0,explanation:"x²=4 → x=±2."},
    {text:"Discriminant ax²+bx+c:",options:["b²−4ac","−b/2a","√(b²−4ac)","4ac−b²"],answer:0,explanation:"Δ=b²−4ac."},
    {text:"x²+bx+9=0 equal roots → b=?",options:["6","3","9","4"],answer:0,explanation:"Δ=0 → b²=36 → b=±6."},
  ],
  "10-2":[
    {text:"Midpoint of (2,4) and (6,8):",options:["(4,6)","(3,5)","(8,12)","(2,4)"],answer:0,explanation:"((2+6)/2,(4+8)/2)=(4,6)."},
    {text:"Slope through (1,2) and (3,6):",options:["2","4","1","3"],answer:0,explanation:"(6−2)/(3−1)=2."},
    {text:"Line slope 3 through (0,1):",options:["y=3x+1","y=x+3","y=3x","y=1"],answer:0,explanation:"y=mx+b=3x+1."},
    {text:"Distance (0,0) to (3,4):",options:["5","7","4","3"],answer:0,explanation:"√(9+16)=5."},
  ],
  "9-1":[
    {text:"Solve 3x+6=18:",options:["4","6","3","12"],answer:0,explanation:"3x=12 → x=4."},
    {text:"2(x−3)=10 → x=?",options:["8","5","4","7"],answer:0,explanation:"2x−6=10 → x=8."},
  ],
  "9-2":[
    {text:"3:x=6:14 → x=?",options:["7","9","4","6"],answer:0,explanation:"3×14=6x → x=7."},
    {text:"150 km in 3 hrs → speed:",options:["50 km/h","45 km/h","60 km/h","30 km/h"],answer:0,explanation:"150/3=50 km/h."},
    {text:"15% of 200:",options:["30","15","20","25"],answer:0,explanation:"0.15×200=30."},
  ],
};

function buildYearData(subjectName: string, year: string): { year: string; grades: GradeData[] } {
  const make = (g: number, u: number, count: number): Question[] => {
    const bank = QUESTION_BANK[`${g}-${u}`] ?? [];
    return Array.from({ length: count }, (_, i) =>
      bank[i] ? { id: i+1, ...bank[i] } : {
        id: i+1,
        text: `[${subjectName} Gr.${g} U${u}] Q${i+1}: Select the correct concept.`,
        options:["Option A — Correct","Option B","Option C","Option D"],
        answer:0,
        explanation:`Grade ${g}, Unit ${u}: Option A is the correct answer per Ethiopian curriculum.`,
      }
    );
  };
  return {
    year,
    grades:[
      {grade:12,units:[
        {unit:1,title:"Differential Calculus",     questions:make(12,1,3)},
        {unit:2,title:"Sequences & Series",        questions:make(12,2,5)},
        {unit:3,title:"Introduction to Statistics",questions:make(12,3,2)},
      ]},
      {grade:11,units:[
        {unit:1,title:"Polynomial Functions",      questions:make(11,1,4)},
        {unit:2,title:"Exponential & Logarithms",  questions:make(11,2,3)},
        {unit:3,title:"Trigonometry",              questions:make(11,3,2)},
      ]},
      {grade:10,units:[
        {unit:1,title:"Quadratic Equations",       questions:make(10,1,3)},
        {unit:2,title:"Coordinate Geometry",       questions:make(10,2,4)},
      ]},
      {grade:9,units:[
        {unit:1,title:"Linear Equations",          questions:make(9,1,2)},
        {unit:2,title:"Ratio & Proportion",        questions:make(9,2,3)},
      ]},
    ],
  };
}

const allYearsPapers: Record<number, {year:string;questions:number;duration:string;score:number|null}[]> = {
  1:[
    {year:"2017 E.C.",questions:65,duration:"3 hrs",  score:88},
    {year:"2016 E.C.",questions:65,duration:"3 hrs",  score:74},
    {year:"2015 E.C.",questions:60,duration:"2.5 hrs",score:null},
    {year:"2014 E.C.",questions:60,duration:"2.5 hrs",score:91},
    {year:"2013 E.C.",questions:55,duration:"2 hrs",  score:null},
    {year:"2012 E.C.",questions:55,duration:"2 hrs",  score:78},
  ],
  2:[
    {year:"2017 E.C.",questions:70,duration:"3 hrs",  score:65},
    {year:"2016 E.C.",questions:70,duration:"3 hrs",  score:null},
    {year:"2015 E.C.",questions:65,duration:"2.5 hrs",score:78},
  ],
};
const defaultPapers = (id:number) => allYearsPapers[id] ?? [
  {year:"2017 E.C.",questions:60,duration:"2.5 hrs",score:null},
  {year:"2016 E.C.",questions:55,duration:"2 hrs",  score:null},
  {year:"2015 E.C.",questions:55,duration:"2 hrs",  score:72},
];

const scoreHistory = [
  {month:"Feb",score:62},{month:"Mar",score:68},{month:"Apr",score:71},
  {month:"May",score:75},{month:"Jun",score:82},{month:"Jul",score:88},
];
const achievementsList = [
  {icon:"🔥",label:"7-Day Streak",earned:true},{icon:"🏆",label:"Top Scorer",earned:true},
  {icon:"📚",label:"10 Papers Done",earned:true},{icon:"⚡",label:"Speed Demon",earned:false},
  {icon:"🎯",label:"Perfect Score",earned:false},
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function ProgressBar({value,color="#6c3fcf",height=4}:{value:number;color?:string;height?:number}) {
  return (
    <div className="w-full rounded-full overflow-hidden bg-muted" style={{height}}>
      <motion.div className="h-full rounded-full" style={{background:color}}
        initial={{width:0}} animate={{width:`${value}%`}} transition={{duration:0.8,ease:"easeOut"}}/>
    </div>
  );
}

function ModeToggle({mode,onChange,color}:{mode:"practice"|"exam";onChange:(m:"practice"|"exam")=>void;color:string}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-border bg-card" style={{fontSize:11}}>
      {(["practice","exam"] as const).map(m=>(
        <button key={m} onClick={()=>onChange(m)}
          className="px-3 py-1.5 font-bold transition-all"
          style={mode===m?{background:color,color:"#fff"}:{color:"var(--muted-foreground)"}}>
          {m==="practice"?"Practice":"Exam"}
        </button>
      ))}
    </div>
  );
}

function Toggle({enabled,onToggle,color="#6c3fcf"}:{enabled:boolean;onToggle:()=>void;color?:string}) {
  return (
    <button onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
      style={{background:enabled?color:"var(--switch-background)"}}>
      <motion.div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        animate={{left:enabled?"calc(100% - 20px)":"4px"}}
        transition={{type:"spring",stiffness:400,damping:30}}/>
    </button>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({q,index,mode,selectedAnswer,isFlagged,onAnswer,onToggleFlag,color}:{
  q:Question;index:number;mode:"practice"|"exam";
  selectedAnswer:number|null;isFlagged:boolean;
  onAnswer:(oi:number)=>void;onToggleFlag:()=>void;color:string;
}) {
  const answered = selectedAnswer!==null;
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="px-4 pt-4 pb-0 flex items-start gap-2.5">
        <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white mt-0.5" style={{background:color}}>
          {index+1}
        </span>
        <p className="text-sm font-medium text-foreground leading-snug flex-1">{q.text}</p>
        <button onClick={onToggleFlag} className="flex-shrink-0 ml-1 mt-0.5 p-0.5">
          <Bookmark size={15} className={isFlagged?"fill-orange-400 text-orange-400":"text-muted-foreground"}/>
        </button>
      </div>
      <div className="px-4 py-3 space-y-2">
        {q.options.map((opt,oi)=>{
          const isSelected=selectedAnswer===oi, isAnswer=oi===q.answer;
          let bg="var(--muted)", border="var(--border)", tc="var(--foreground)";
          if (mode==="practice"&&answered) {
            if (isAnswer)        {bg="#d1fae5";border="#10b981";tc="#065f46";}
            else if (isSelected) {bg="#fee2e2";border="#ef4444";tc="#991b1b";}
          } else if (isSelected) {bg=color+"18";border=color;tc=color;}
          return (
            <button key={oi} disabled={mode==="practice"&&answered} onClick={()=>onAnswer(oi)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2"
              style={{background:bg,borderColor:border,color:tc}}>
              <span className="text-xs font-bold opacity-40 w-4 flex-shrink-0">{["A","B","C","D"][oi]}.</span>
              <span className="flex-1">{opt}</span>
              {mode==="practice"&&answered&&isAnswer   &&<CheckCircle size={13} className="text-green-600 flex-shrink-0"/>}
              {mode==="practice"&&answered&&isSelected&&!isAnswer&&<XCircle size={13} className="text-red-500 flex-shrink-0"/>}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {mode==="practice"&&answered&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
            exit={{height:0,opacity:0}} transition={{duration:0.25,ease:"easeOut"}} className="overflow-hidden">
            <div className="mx-4 mb-4 p-3.5 rounded-2xl"
              style={{background:selectedAnswer===q.answer?"#d1fae520":"#fee2e220",
                      borderLeft:`3px solid ${selectedAnswer===q.answer?"#10b981":"#ef4444"}`}}>
              <p className="text-xs font-bold mb-1" style={{color:selectedAnswer===q.answer?"#059669":"#dc2626"}}>
                {selectedAnswer===q.answer?"✓ Correct!":"✗ Incorrect"}
              </p>
              <p className="text-xs text-foreground leading-relaxed">{q.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exam Results ─────────────────────────────────────────────────────────────

function ExamResults({questions,answers,subject,title,onRetry,onBack}:{
  questions:Question[];answers:Record<number,number>;subject:Subject;
  title:string;onRetry:()=>void;onBack:()=>void;
}) {
  const total=questions.length, attempted=Object.keys(answers).length;
  const correct=questions.filter(q=>answers[q.id]===q.answer).length;
  const pct=total?Math.round((correct/total)*100):0;
  return (
    <div className="flex flex-col gap-5 pb-10">
      <div className="rounded-3xl p-6 text-white text-center" style={{background:`linear-gradient(135deg,${subject.color},${subject.color}bb)`}}>
        <p className="text-sm opacity-75 font-medium">{title}</p>
        <div className="text-6xl font-extrabold mt-2">{pct}%</div>
        <p className="text-white/70 mt-1">{correct}/{total} correct</p>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[["Total",total],["Tried",attempted],["Correct",correct],["Wrong",attempted-correct]].map(([l,v])=>(
            <div key={l as string} className="bg-white/15 rounded-2xl py-2">
              <p className="text-lg font-extrabold">{v}</p><p className="text-[10px] opacity-70">{l}</p>
            </div>
          ))}
        </div>
        {attempted<total&&<p className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">{total-attempted} unanswered</p>}
      </div>
      <p className="font-bold text-sm text-foreground">Answer Review</p>
      <div className="space-y-4">
        {questions.map((q,qi)=>{
          const chosen=answers[q.id]??null;
          const isCorrect=chosen===q.answer, wasAttempted=chosen!==null;
          return (
            <div key={q.id} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="px-4 pt-4 pb-0 flex items-start gap-2.5">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5
                  ${wasAttempted&&isCorrect?"bg-green-100 text-green-700":wasAttempted?"bg-red-100 text-red-600":"bg-muted text-muted-foreground"}`}>
                  {qi+1}
                </span>
                <p className="text-sm font-medium text-foreground leading-snug">{q.text}</p>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {q.options.map((opt,oi)=>{
                  const isAnswer=oi===q.answer,isChosen=oi===chosen;
                  let bg="transparent",border="var(--border)",tc="var(--muted-foreground)";
                  if (isAnswer)      {bg="#d1fae5";border="#10b981";tc="#065f46";}
                  else if (isChosen) {bg="#fee2e2";border="#ef4444";tc="#991b1b";}
                  return (
                    <div key={oi} className="px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2"
                      style={{background:bg,borderColor:border,color:tc}}>
                      <span className="font-bold opacity-40 w-4 flex-shrink-0">{["A","B","C","D"][oi]}.</span>
                      <span className="flex-1">{opt}</span>
                      {isAnswer&&<CheckCircle size={11} className="text-green-600 flex-shrink-0"/>}
                      {isChosen&&!isAnswer&&<XCircle size={11} className="text-red-500 flex-shrink-0"/>}
                    </div>
                  );
                })}
              </div>
              <div className="mx-4 mb-4 p-3 rounded-xl"
                style={{background:isCorrect?"#d1fae520":wasAttempted?"#fee2e220":"var(--muted)",
                        borderLeft:`3px solid ${isCorrect?"#10b981":wasAttempted?"#ef4444":"var(--border)"}`}}>
                <p className="text-xs font-bold mb-0.5" style={{color:isCorrect?"#059669":wasAttempted?"#dc2626":"var(--muted-foreground)"}}>
                  {!wasAttempted?"Not attempted":isCorrect?"✓ Correct":"✗ Incorrect"}
                </p>
                <p className="text-xs text-foreground leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-3 pt-2">
        <button onClick={onRetry}
          className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{background:subject.color}}>
          <RotateCcw size={16}/> Retry
        </button>
        <button onClick={onBack}
          className="w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{background:subject.color+"18",color:subject.color}}>
          <ListChecks size={16}/> Back to Units
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Screen ──────────────────────────────────────────────────────────────

function QuizScreen({questions,subject,title,initialMode,durationSeconds,onBack}:{
  questions:Question[];subject:Subject;title:string;
  initialMode:"practice"|"exam";durationSeconds?:number;onBack:()=>void;
}) {
  const [mode,setMode]=useState<"practice"|"exam">(initialMode);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [flags,setFlags]=useState<Set<number>>(new Set());
  const [submitted,setSubmitted]=useState(false);
  const [navOpen,setNavOpen]=useState(false);
  const [timeLeft,setTimeLeft]=useState<number>(durationSeconds??0);
  const questionRefs=useRef<(HTMLDivElement|null)[]>([]);

  const reset=()=>{setAnswers({});setFlags(new Set());setSubmitted(false);setTimeLeft(durationSeconds??0);};
  const handleModeChange=(m:"practice"|"exam")=>{setMode(m);reset();};

  // Countdown timer for exam mode
  useEffect(()=>{
    if(mode!=="exam"||submitted||!durationSeconds) return;
    if(timeLeft<=0){setSubmitted(true);return;}
    const t=setTimeout(()=>setTimeLeft(s=>s-1),1000);
    return()=>clearTimeout(t);
  },[mode,submitted,timeLeft,durationSeconds]);

  const formatTime=(s:number)=>{
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    return h>0
      ?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
      :`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  const toggleFlag=useCallback((id:number)=>{
    setFlags(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  },[]);
  const selectAnswer=(qId:number,oi:number)=>{
    if (mode==="practice"&&answers[qId]!==undefined) return;
    setAnswers(p=>({...p,[qId]:oi}));
  };
  const scrollToQ=(i:number)=>{questionRefs.current[i]?.scrollIntoView({behavior:"smooth",block:"start"});setNavOpen(false);};
  const answeredCount=Object.keys(answers).length;

  const container=typeof document!=="undefined"?document.getElementById("phone-container"):null;
  const NavigatorPortal=container?createPortal(
    <>
      {!submitted&&(
        <motion.button whileTap={{scale:0.9}} onClick={()=>setNavOpen(true)}
          className="absolute bottom-7 right-4 z-30 rounded-2xl text-white shadow-xl flex items-center justify-center"
          style={{width:52,height:52,background:subject.color,boxShadow:`0 8px 24px ${subject.color}50`}}>
          <LayoutGrid size={20}/>
          {flags.size>0&&(
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-[10px] font-bold text-white">
              {flags.size}
            </span>
          )}
        </motion.button>
      )}
      <AnimatePresence>
        {navOpen&&(
          <>
            <motion.div className="absolute inset-0 bg-black/50 z-40" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setNavOpen(false)}/>
            <motion.div className="absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-5 border-t border-border"
              initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:300}}>
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4"/>
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-foreground">Question Navigator</p>
                <button onClick={()=>setNavOpen(false)}><X size={20} className="text-muted-foreground"/></button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[{label:"Answered",value:answeredCount,c:subject.color},{label:"Remaining",value:questions.length-answeredCount,c:"var(--muted-foreground)"},{label:"Flagged",value:flags.size,c:"#f97316"}].map(s=>(
                  <div key={s.label} className="text-center py-2.5 rounded-2xl" style={{background:s.c+"18"}}>
                    <p className="text-xl font-extrabold" style={{color:s.c}}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-2 mb-4" style={{maxHeight:176,overflowY:"auto"}}>
                {questions.map((q,i)=>{
                  const isAns=answers[q.id]!==undefined, isFlag=flags.has(q.id);
                  return (
                    <button key={q.id} onClick={()=>scrollToQ(i)}
                      className="aspect-square rounded-xl flex items-center justify-center text-sm font-bold relative transition-all"
                      style={isFlag?{background:"#fff7ed",color:"#ea580c",border:"2px solid #f97316"}
                        :isAns?{background:subject.color,color:"#fff"}:{background:"var(--muted)",color:"var(--muted-foreground)"}}>
                      {i+1}
                      {isFlag&&<span className="absolute -top-1 -right-0.5 text-[8px]">🚩</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4">
                {[{bg:subject.color,label:"Answered"},{bg:"var(--muted)",label:"Unanswered"},{bg:"#fff7ed",border:"#f97316",label:"Flagged"}].map(item=>(
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{background:item.bg,border:(item as any).border?`1.5px solid ${(item as any).border}`:undefined}}/>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,container
  ):null;

  if (mode==="exam"&&submitted) return <>{<ExamResults questions={questions} answers={answers} subject={subject} title={title} onRetry={reset} onBack={onBack}/>}{NavigatorPortal}</>;

  return (
    <>
      <div className="flex flex-col gap-4 pb-28">
        <div className="flex items-center gap-3 pt-2">
          <button className="w-9 h-9 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm flex-shrink-0" onClick={onBack}>
            <ArrowLeft size={18} className="text-foreground"/>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{subject.name}</p>
            <p className="text-sm font-bold text-foreground truncate">{title}</p>
          </div>
          {mode==="exam"&&durationSeconds?(
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-sm tabular-nums"
              style={{background:timeLeft<=60?"#fee2e2":subject.color+"18",color:timeLeft<=60?"#dc2626":subject.color}}>
              <Clock size={14}/>{formatTime(timeLeft)}
            </div>
          ):(
            <ModeToggle mode={mode} onChange={handleModeChange} color={subject.color}/>
          )}
        </div>
        <div className="rounded-2xl px-4 py-2.5 flex items-center gap-2.5" style={{background:subject.color+"12"}}>
          {mode==="practice"
            ?<><BookMarked size={14} style={{color:subject.color}}/><p className="text-xs font-medium" style={{color:subject.color}}>Practice — instant feedback after each answer</p></>
            :<><ListChecks size={14} style={{color:subject.color}}/><p className="text-xs font-medium" style={{color:subject.color}}>Exam — answer all, then submit to see results</p></>
          }
        </div>
        <div className="space-y-4">
          {questions.map((q,i)=>(
            <div key={q.id} ref={el=>{questionRefs.current[i]=el;}}>
              <QuestionCard q={q} index={i} mode={mode} selectedAnswer={answers[q.id]??null}
                isFlagged={flags.has(q.id)} onAnswer={oi=>selectAnswer(q.id,oi)}
                onToggleFlag={()=>toggleFlag(q.id)} color={subject.color}/>
            </div>
          ))}
        </div>
        {mode==="exam"&&(
          <button onClick={()=>setSubmitted(true)}
            className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform"
            style={{background:subject.color,boxShadow:`0 8px 24px ${subject.color}40`}}>
            Submit Answers ({answeredCount}/{questions.length})
          </button>
        )}
      </div>
      {NavigatorPortal}
    </>
  );
}

// ─── Year Unit Content ────────────────────────────────────────────────────────

function YearUnitContent({subject,year,onUnitSelect}:{
  subject:Subject;year:string;onUnitSelect:(g:number,u:Unit)=>void;
}) {
  const data=buildYearData(subject.name,year);
  const [expanded,setExpanded]=useState<number|null>(12);
  const totalQ=data.grades.reduce((a,g)=>a+g.units.reduce((b,u)=>b+u.questions.length,0),0);
  return (
    <motion.div key={year} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
      transition={{duration:0.22}} className="flex flex-col gap-3">
      <div className="rounded-2xl p-3.5 flex items-start gap-3" style={{background:subject.color+"12"}}>
        <BookOpen size={16} style={{color:subject.color}} className="mt-0.5 flex-shrink-0"/>
        <div>
          <p className="text-sm font-semibold" style={{color:subject.color}}>{year} E.C. — Questions by unit</p>
          <p className="text-xs text-muted-foreground mt-0.5">{totalQ} questions · Grades 9–12</p>
        </div>
      </div>
      {data.grades.map(g=>{
        const open=expanded===g.grade;
        const total=g.units.reduce((a,u)=>a+u.questions.length,0);
        return (
          <div key={g.grade} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={()=>setExpanded(open?null:g.grade)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{background:subject.color}}>G{g.grade}</div>
              <div className="flex-1"><p className="font-bold text-sm text-foreground">Grade {g.grade}</p><p className="text-xs text-muted-foreground">{g.units.length} units · {total} questions</p></div>
              <motion.div animate={{rotate:open?180:0}} transition={{duration:0.2}}><ChevronDown size={18} className="text-muted-foreground"/></motion.div>
            </button>
            <AnimatePresence initial={false}>
              {open&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.24,ease:"easeInOut"}} className="overflow-hidden">
                  <div className="border-t border-border divide-y divide-border">
                    {g.units.map(u=>(
                      <motion.button key={u.unit} whileTap={{scale:0.98}} onClick={()=>onUnitSelect(g.grade,u)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{background:subject.color+"18",color:subject.color}}>U{u.unit}</div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">Unit {u.unit} — {u.title}</p><p className="text-xs text-muted-foreground">{u.questions.length} questions</p></div>
                        <ChevronRight size={15} className="text-muted-foreground flex-shrink-0"/>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}

// ─── Subject Details ──────────────────────────────────────────────────────────

function SubjectDetails({subject,onBack,onOpenQuiz}:{
  subject:Subject;onBack:()=>void;
  onOpenQuiz:(questions:Question[],title:string,mode:"practice"|"exam",durationSeconds?:number)=>void;
}) {
  const [selectedYear,setSelectedYear]=useState("All Years");
  const [sheetPaper,setSheetPaper]=useState<ReturnType<typeof defaultPapers>[0]|null>(null);
  const [container,setContainer]=useState<HTMLElement|null>(null);
  const papers=defaultPapers(subject.id);

  useEffect(()=>{
    setContainer(document.getElementById("phone-container"));
  },[]);

  // Parse "3 hrs" / "2.5 hrs" → seconds
  const parseDuration=(d:string):number=>{
    const m=d.match(/([\d.]+)/);
    return m?Math.round(parseFloat(m[1])*3600):3600;
  };

  const openMode=(mode:"practice"|"exam")=>{
    if(!sheetPaper) return;
    const seconds=mode==="exam"?parseDuration(sheetPaper.duration):undefined;
    const title=`${subject.name} ${sheetPaper.year}`;
    setSheetPaper(null);
    onOpenQuiz(FULL_PAPER_QUESTIONS,title,mode,seconds);
  };

  const sheetContent=(
    <AnimatePresence>
      {sheetPaper&&(
        <>
          <motion.div key="ov" className="absolute inset-0 bg-black/50 z-40"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setSheetPaper(null)}/>
          <motion.div key="sh" className="absolute bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 border-t border-border"
            initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
            transition={{type:"spring",damping:28,stiffness:300}}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5"/>
            <p className="font-bold text-foreground">{subject.name} — {sheetPaper.year}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{sheetPaper.questions} questions · {sheetPaper.duration}</p>
            {sheetPaper.score!==null&&<div className="mt-3 p-3 rounded-2xl" style={{background:subject.color+"12"}}><p className="text-sm font-semibold" style={{color:subject.color}}>Previous: {sheetPaper.score}%</p></div>}
            <div className="mt-5 space-y-3">
              <button onClick={()=>openMode("practice")}
                className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-4 text-left active:scale-[0.98] transition-transform hover:border-primary/40 shadow-sm">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:subject.color}}>
                  <BookMarked size={20} className="text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">📚 Practice Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Answer questions with instant feedback</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0"/>
              </button>
              <button onClick={()=>openMode("exam")}
                className="w-full p-4 rounded-2xl bg-card border border-border flex items-center gap-4 text-left active:scale-[0.98] transition-transform hover:border-primary/40 shadow-sm">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:subject.color+"22"}}>
                  <Clock size={20} style={{color:subject.color}}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm">📝 Exam Mode</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Take the exam like a real test</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0"/>
              </button>
            </div>
            <button className="mt-4 w-full py-3 text-sm text-muted-foreground font-medium" onClick={()=>setSheetPaper(null)}>Cancel</button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const SheetPortal=container?createPortal(sheetContent,container):null;


  return (
    <>
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center gap-3 pt-2">
          <button className="w-9 h-9 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm" onClick={onBack}>
            <ArrowLeft size={18} className="text-foreground"/>
          </button>
          <div className="flex-1"><h1 className="text-xl font-bold text-foreground">{subject.name}</h1><p className="text-xs text-muted-foreground">{subject.papers} past papers</p></div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{background:subject.bg}}>{subject.icon}</div>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-card border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search year or topic…"/>
        </div>
        {/* Year chips — filter, not navigation */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All Years",...CHIP_YEARS].map(y=>{
            const active=selectedYear===y;
            return (
              <button key={y}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={active?{background:subject.color,color:"#fff"}:{background:"var(--card)",color:"var(--muted-foreground)",border:`1.5px solid ${subject.color}30`}}
                onClick={()=>setSelectedYear(y)}>
                {y}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          {selectedYear==="All Years"?(
            <motion.div key="all" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} className="space-y-3">
              {papers.map((p,i)=>(
                <motion.button key={i} whileTap={{scale:0.98}}
                  className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 text-left"
                  onClick={()=>setSheetPaper(p)}>
                  <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0" style={{background:subject.color+"18"}}>
                    <span className="text-base font-bold leading-tight" style={{color:subject.color}}>{p.year.split(" ")[0].slice(2)}</span>
                    <span className="text-[9px] text-muted-foreground">{p.year.split(" ")[0].slice(0,2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{subject.name} {p.year}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen size={10}/> {p.questions} q</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10}/> {p.duration}</span>
                    </div>
                    {p.score!==null&&<div className="flex items-center gap-1 mt-1.5"><CheckCircle size={11} className="text-green-500"/><span className="text-xs font-semibold text-green-600">Last: {p.score}%</span></div>}
                  </div>
                  
                </motion.button>
              ))}
            </motion.div>
          ):(
            <YearUnitContent key={selectedYear} subject={subject} year={selectedYear}
              onUnitSelect={(_g,u)=>onOpenQuiz(u.questions,`Grade ${_g} · Unit ${u.unit} — ${u.title} (${selectedYear} E.C.)`,"practice")}/>
          )}
        </AnimatePresence>
      </div>
      {SheetPortal}
    </>
  );
}

// ─── Notifications Screen ─────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {id:1,title:"New exam available",body:"Mathematics 2017 E.C. is now available for practice.",time:"2h ago",read:false,icon:"📐"},
  {id:2,title:"Daily goal reached! 🎉",body:"You completed your 5-question daily goal. Keep it up!",time:"5h ago",read:false,icon:"🎯"},
  {id:3,title:"7-day study streak 🔥",body:"Amazing! You have maintained a 7-day streak. Don't break it!",time:"1d ago",read:true,icon:"🔥"},
  {id:4,title:"Physics 2015 E.C. added",body:"Physics exam papers for 2015 E.C. are now available.",time:"2d ago",read:true,icon:"⚡"},
  {id:5,title:"Achievement unlocked",body:"You earned the 'Top Scorer' badge with 91% in Chemistry.",time:"3d ago",read:true,icon:"🏆"},
  {id:6,title:"Study reminder",body:"You haven't studied today. Open a subject to continue your streak.",time:"4d ago",read:true,icon:"📚"},
  {id:7,title:"New feature: Dark Mode",body:"EthioMatric+ now supports dark mode. Try it in Profile > Dark Mode.",time:"5d ago",read:true,icon:"🌙"},
];

function NotificationsScreen({onBack}:{onBack:()=>void}) {
  const [notifications,setNotifications]=useState(NOTIFICATIONS);
  const unreadCount=notifications.filter(n=>!n.read).length;

  const markAllRead=()=>setNotifications(prev=>prev.map(n=>({...n,read:true})));

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center gap-3 pt-2">
        <button className="w-9 h-9 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm" onClick={onBack}>
          <ArrowLeft size={18} className="text-foreground"/>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount>0&&<p className="text-xs text-muted-foreground">{unreadCount} unread</p>}
        </div>
        {unreadCount>0&&(
          <button onClick={markAllRead} className="text-xs font-semibold text-primary">Mark all read</button>
        )}
      </div>
      {notifications.length===0?(
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="text-4xl">🔔</span>
          <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
        </div>
      ):(
        <div className="space-y-2">
          {notifications.map(n=>(
            <motion.div key={n.id} whileTap={{scale:0.98}}
              className="bg-card rounded-2xl p-4 shadow-sm border flex items-start gap-3 cursor-pointer"
              style={{borderColor:n.read?"var(--border)":"var(--primary)",opacity:n.read?0.75:1}}
              onClick={()=>setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {!n.read&&<div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"/>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{n.time}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Help & Support Screen ────────────────────────────────────────────────────

const FAQ = [
  {q:"How do I switch between Practice and Exam mode?",a:"Open any subject, select a year or unit, then use the Practice / Exam toggle in the top-right corner of the question page."},
  {q:"What is the difference between Practice Mode and Exam Mode?",a:"Practice Mode gives instant feedback after each answer with an explanation. Exam Mode hides feedback until you submit all answers."},
  {q:"How do I flag a question for review?",a:"Tap the bookmark icon on any question card while answering. Flagged questions appear in the Question Navigator panel."},
  {q:"Can I change my stream (Natural/Social)?",a:"Yes. Go to Profile and tap your current stream to switch between Natural Science and Social Science subjects."},
];

function HelpSupportScreen({onBack}:{onBack:()=>void}) {
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");
  const [sent,setSent]=useState(false);
  const [openFaq,setOpenFaq]=useState<number|null>(null);

  const handleSend=()=>{
    if (!name.trim()||!message.trim()) return;
    // Ready for backend: { name, message, timestamp: new Date() }
    setSent(true);
    setName("");setMessage("");
    setTimeout(()=>setSent(false),4000);
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center gap-3 pt-2">
        <button className="w-9 h-9 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm" onClick={onBack}>
          <ArrowLeft size={18} className="text-foreground"/>
        </button>
        <div><h1 className="text-xl font-bold text-foreground">Help & Support</h1></div>
      </div>

      {/* FAQ */}
      <div>
        <p className="font-bold text-sm text-foreground mb-3">Frequently Asked Questions</p>
        <div className="space-y-2">
          {FAQ.map((item,i)=>(
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"var(--primary)",opacity:0.9}}>
                  <span className="text-white text-xs font-bold">Q</span>
                </div>
                <p className="text-sm font-semibold text-foreground flex-1 leading-snug">{item.q}</p>
                <motion.div animate={{rotate:openFaq===i?180:0}} transition={{duration:0.2}}>
                  <ChevronDown size={16} className="text-muted-foreground flex-shrink-0"/>
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openFaq===i&&(
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                    exit={{height:0,opacity:0}} transition={{duration:0.22,ease:"easeInOut"}} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0">
                      <p className="text-xs text-muted-foreground leading-relaxed pl-9">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div>
        <p className="font-bold text-sm text-foreground mb-3">Contact Us</p>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <AnimatePresence>
            {sent&&(
              <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                <CheckCheck size={16} className="text-green-600 flex-shrink-0"/>
                <p className="text-sm font-medium text-green-700">Message sent! We'll get back to you within 24 hours.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Your Name</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="e.g. Abebe Girma"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Message</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              placeholder="Describe your issue or question…"/>
          </div>
          <button onClick={handleSend}
            disabled={!name.trim()||!message.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{background:"var(--primary)"}}>
            <Send size={16}/> Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

function SettingsScreen({onBack,initName,initGrade,onSave}:{
  onBack:()=>void;initName:string;initGrade:string;
  onSave:(name:string,grade:string)=>void;
}) {
  const [name,setName]=useState(initName);
  const [grade,setGrade]=useState(initGrade);
  const [errors,setErrors]=useState<{name?:string;grade?:string}>({});
  const [saved,setSaved]=useState(false);

  const validate=()=>{
    const e:{name?:string;grade?:string}={};
    if (!name.trim()) e.name="Name is required";
    else if (name.trim().length<2) e.name="Name must be at least 2 characters";
    if (!grade) e.grade="Please select your grade";
    return e;
  };

  const handleSave=()=>{
    const e=validate();
    if (Object.keys(e).length>0){setErrors(e);return;}
    setErrors({});
    onSave(name.trim(),grade);
    setSaved(true);
    setTimeout(()=>setSaved(false),3000);
  };

  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-center gap-3 pt-2">
        <button className="w-9 h-9 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm" onClick={onBack}>
          <ArrowLeft size={18} className="text-foreground"/>
        </button>
        <div><h1 className="text-xl font-bold text-foreground">Settings</h1></div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        <AnimatePresence>
          {saved&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <CheckCheck size={16} className="text-green-600 flex-shrink-0"/>
              <p className="text-sm font-medium text-green-700">Changes saved successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Full Name</label>
          <div className="relative">
            <Pencil size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <input value={name} onChange={e=>{setName(e.target.value);setErrors(p=>({...p,name:undefined}));}}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-muted border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              style={{borderColor:errors.name?"#ef4444":"var(--border)"}}
              placeholder="Your full name"/>
          </div>
          {errors.name&&<p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.name}</p>}
        </div>

        {/* Grade */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Grade Level</label>
          <div className="grid grid-cols-4 gap-2">
            {["9","10","11","12"].map(g=>(
              <button key={g} onClick={()=>{setGrade(g);setErrors(p=>({...p,grade:undefined}));}}
                className="py-2.5 rounded-xl text-sm font-bold border transition-all"
                style={grade===g?{background:"var(--primary)",color:"#fff",borderColor:"var(--primary)"}:{background:"var(--muted)",color:"var(--muted-foreground)",borderColor:"var(--border)"}}>
                Grade {g}
              </button>
            ))}
          </div>
          {errors.grade&&<p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.grade}</p>}
        </div>

        <button onClick={handleSave}
          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{background:"var(--primary)"}}>
          <Save size={16}/> Save Changes
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center">Your information is stored locally on this device.</p>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({onNavigate,onNotifications,userName}:{
  onNavigate:(tab:string,subjectId?:number)=>void;
  onNotifications:()=>void;userName:string;
}) {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Good morning 👋</p>
          <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
        </div>
        <button onClick={onNotifications} className="relative w-10 h-10 rounded-2xl bg-card flex items-center justify-center shadow-sm border border-border">
          <Bell size={20} className="text-foreground"/>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"/>
        </button>
      </div>
      <motion.div className="rounded-3xl p-5 text-white relative overflow-hidden" whileTap={{scale:0.98}}
        style={{background:"linear-gradient(135deg,#6c3fcf 0%,#9061f9 100%)"}}>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 bg-white"/>
        <div className="absolute -right-2 bottom-4 w-20 h-20 rounded-full opacity-10 bg-white"/>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">In Progress</span>
        <h2 className="mt-2 text-xl font-bold">Mathematics 2016 E.C.</h2>
        <p className="text-sm opacity-80 mt-0.5">65 questions · 3 hrs · Grade 12</p>
        <div className="mt-4 mb-3">
          <div className="flex justify-between text-xs mb-1.5 opacity-80"><span>Progress</span><span>38/65 answered</span></div>
          <div className="w-full h-1.5 rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{width:"58%"}}/></div>
        </div>
        <button className="mt-1 bg-white text-primary font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 active:scale-95">
          <Play size={14} fill="currentColor"/> Continue
        </button>
      </motion.div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Quick Start</h2>
          <button className="text-sm font-medium text-primary" onClick={()=>onNavigate("exams")}>See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {subjects.slice(0,6).map(s=>(
            <motion.button key={s.id} whileTap={{scale:0.95}}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl bg-card shadow-sm border border-border w-[88px]"
              onClick={()=>onNavigate("exams",s.id)}>
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">{s.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2"><Target size={16} className="text-primary"/><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Daily Goal</span></div>
          <p className="text-2xl font-bold text-foreground">3 <span className="text-base font-medium text-muted-foreground">/ 5</span></p>
          <ProgressBar value={60}/>
          <p className="text-xs text-muted-foreground mt-1.5">2 more to hit goal</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-2"><Flame size={16} className="text-orange-500"/><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Streak</span></div>
          <p className="text-2xl font-bold text-foreground">7 <span className="text-base font-medium text-muted-foreground">days</span></p>
          <div className="flex gap-1 mt-1">{["M","T","W","T","F","S","S"].map((_,i)=><div key={i} className="flex-1 h-1.5 rounded-full" style={{background:"var(--primary)"}}/>)}</div>
          <p className="text-xs text-muted-foreground mt-1.5">Personal best!</p>
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Recent Exams</h2>
        <div className="space-y-2.5">
          {[
            {name:"Physics 2015",score:74,date:"Yesterday",icon:"⚡",color:"#f59e0b"},
            {name:"English 2016",score:65,date:"2 days ago",icon:"📖",color:"#0ea5e9"},
            {name:"Biology 2014",score:88,date:"5 days ago",icon:"🧬",color:"#ec4899"},
          ].map((e,i)=>(
            <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-border">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{background:e.color+"18"}}>{e.icon}</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-foreground">{e.name}</p><p className="text-xs text-muted-foreground">{e.date}</p></div>
              <p className="text-base font-bold" style={{color:e.score>=80?"#10b981":e.score>=60?"#f59e0b":"#ef4444"}}>{e.score}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Exams Screen ─────────────────────────────────────────────────────────────

function ExamsScreen({onSubjectSelect,stream}:{onSubjectSelect:(id:number)=>void;stream:Stream}) {
  const [search,setSearch]=useState("");
  const ids=stream==="natural"?NATURAL_IDS:SOCIAL_IDS;
  const streamSubjects=ids.map(id=>subjects.find(s=>s.id===id)!).filter(Boolean);
  const filtered=streamSubjects.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">Past Exams</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{stream} Science stream</p>
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"/>
        <input className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-card border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          placeholder="Search subjects…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(s=>(
          <motion.button key={s.id} whileTap={{scale:0.96}}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border flex flex-col items-start gap-3 text-left"
            onClick={()=>onSubjectSelect(s.id)}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:s.bg}}>{s.icon}</div>
            <div className="w-full">
              <p className="font-bold text-sm text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.papers} past papers</p>
            </div>
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Done</span><span className="font-semibold" style={{color:s.color}}>{s.completion}%</span></div>
              <ProgressBar value={s.completion} color={s.color} height={3}/>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Progress Screen ──────────────────────────────────────────────────────────

function ProgressScreen() {
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="pt-2"><h1 className="text-2xl font-bold text-foreground">Progress</h1><p className="text-sm text-muted-foreground">Track your improvement</p></div>
      <div className="rounded-3xl p-5 text-white" style={{background:"linear-gradient(135deg,#6c3fcf,#9061f9)"}}>
        <p className="text-sm opacity-80 font-medium">Overall Score</p>
        <div className="flex items-end gap-2 mt-1"><span className="text-5xl font-extrabold">88</span><span className="text-xl mb-1 opacity-80">%</span><span className="ml-2 mb-1 text-sm bg-white/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><TrendingUp size={12}/> +6%</span></div>
        <div className="grid grid-cols-3 gap-3 mt-4">{[{label:"Completed",value:"23"},{label:"Avg Score",value:"76%"},{label:"Best",value:"95%"}].map(s=>(
          <div key={s.label} className="bg-white/10 rounded-2xl p-2.5 text-center"><p className="text-lg font-bold">{s.value}</p><p className="text-xs opacity-70 mt-0.5">{s.label}</p></div>
        ))}</div>
      </div>
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <p className="font-bold text-sm text-foreground mb-4">Score History</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={scoreHistory} margin={{top:5,right:5,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
            <XAxis dataKey="month" tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:11,fill:"var(--muted-foreground)"}} axisLine={false} tickLine={false} domain={[50,100]}/>
            <Tooltip contentStyle={{borderRadius:12,border:"1px solid var(--border)",background:"var(--card)",color:"var(--foreground)",fontSize:12}}/>
            <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={{fill:"var(--primary)",r:4,strokeWidth:0}} activeDot={{r:6}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="font-bold text-sm text-foreground mb-3">Subject Performance</p>
        <div className="space-y-3">
          {subjects.slice(0,5).map(s=>(
            <div key={s.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-2.5"><span className="text-xl">{s.icon}</span><div className="flex-1"><div className="flex justify-between"><p className="text-sm font-semibold text-foreground">{s.name}</p><span className="text-sm font-bold" style={{color:s.color}}>{s.completion}%</span></div></div></div>
              <ProgressBar value={s.completion} color={s.color} height={5}/>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border"><div className="flex items-center gap-2 mb-2"><Flame size={16} className="text-orange-500"/><span className="text-xs font-semibold text-muted-foreground uppercase">Streak</span></div><p className="text-3xl font-extrabold text-foreground">7</p><p className="text-xs text-muted-foreground">days in a row</p></div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border"><div className="flex items-center gap-2 mb-2"><Trophy size={16} className="text-yellow-500"/><span className="text-xs font-semibold text-muted-foreground uppercase">Badges</span></div><p className="text-3xl font-extrabold text-foreground">3</p><p className="text-xs text-muted-foreground">earned</p></div>
      </div>
      <div>
        <p className="font-bold text-sm text-foreground mb-3">Achievements</p>
        <div className="grid grid-cols-3 gap-3">
          {achievementsList.map((a,i)=>(
            <div key={i} className="bg-card rounded-2xl p-3 shadow-sm border border-border flex flex-col items-center gap-2 text-center" style={{opacity:a.earned?1:0.4}}>
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-medium text-foreground leading-tight">{a.label}</p>
              {a.earned&&<div className="w-1.5 h-1.5 rounded-full bg-primary"/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({stream,onStreamChange,darkMode,onDarkMode,onNotifications,onHelpSupport,onSettings,userName,userGrade}:{
  stream:Stream;onStreamChange:(s:Stream)=>void;darkMode:boolean;onDarkMode:(v:boolean)=>void;
  onNotifications:()=>void;onHelpSupport:()=>void;onSettings:()=>void;
  userName:string;userGrade:string;
}) {
  const menuItems=[
    {icon:Bell,       label:"Notifications",       sub:"Push & email alerts",   action:onNotifications},
    {icon:Settings,   label:"Settings",             sub:"Name & grade",          action:onSettings},
    {icon:HelpCircle, label:"Help & Support",       sub:"FAQ & contact",         action:onHelpSupport},
    {icon:Info,       label:"About EthioMatric+",  sub:"Version 2.1.0",         action:()=>{}},
  ];
  return (
    <div className="flex flex-col gap-5 pb-6">
      <div className="pt-2"><h1 className="text-2xl font-bold text-foreground">Profile</h1></div>
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white" style={{background:"linear-gradient(135deg,#6c3fcf,#9061f9)"}}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1"><p className="text-lg font-bold text-foreground">{userName}</p><p className="text-sm text-muted-foreground">Grade {userGrade} · Addis Ababa</p>
          <div className="flex items-center gap-1.5 mt-1"><Star size={12} className="text-yellow-400 fill-yellow-400"/><span className="text-xs font-semibold text-foreground capitalize">{stream} Science</span></div>
        </div>
        <button onClick={onSettings} className="text-sm font-semibold text-primary">Edit</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{label:"Exams Done",value:"23"},{label:"Avg Score",value:"76%"},{label:"Day Streak",value:"7 🔥"}].map(s=>(
          <div key={s.label} className="bg-card rounded-2xl p-3 shadow-sm border border-border text-center"><p className="text-lg font-extrabold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground mt-0.5">{s.label}</p></div>
        ))}
      </div>

      {/* Stream selector */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary"><GraduationCap size={18} className="text-primary"/></div>
            <div><p className="text-sm font-semibold text-foreground">Stream</p><p className="text-xs text-muted-foreground">Your subject track</p></div>
          </div>
          <div className="flex gap-2">
            {(["natural","social"] as const).map(s=>(
              <button key={s} onClick={()=>onStreamChange(s)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                style={stream===s?{background:"var(--primary)",color:"#fff"}:{background:"var(--muted)",color:"var(--muted-foreground)"}}>
                {s==="natural"?"🔬 Natural":"🌐 Social"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dark mode + menu */}
      <div className="bg-card rounded-2xl shadow-sm border border-border divide-y divide-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary">
            {darkMode?<Moon size={18} className="text-primary"/>:<Sun size={18} className="text-primary"/>}
          </div>
          <div className="flex-1"><p className="text-sm font-semibold text-foreground">Dark Mode</p><p className="text-xs text-muted-foreground">Switch theme</p></div>
          <Toggle enabled={darkMode} onToggle={()=>onDarkMode(!darkMode)}/>
        </div>
        {menuItems.map((item,i)=>(
          <button key={i} onClick={item.action} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary"><item.icon size={18} className="text-primary"/></div>
            <div className="flex-1"><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
            <ChevronRight size={16} className="text-muted-foreground"/>
          </button>
        ))}
      </div>

      <button className="w-full py-3 rounded-2xl border border-red-300 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm active:bg-red-50 transition-colors">
        <LogOut size={16}/> Sign Out
      </button>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const navItems=[
  {id:"home",    label:"Home",    icon:Home    },
  {id:"exams",   label:"Exams",   icon:BookOpen},
  {id:"progress",label:"Progress",icon:BarChart2},
  {id:"profile", label:"Profile", icon:User    },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,setScreen]=useState<Screen>({name:"home"});
  const [stream,setStream]=useState<Stream>(()=>{try{return(localStorage.getItem("stream")||"natural") as Stream;}catch{return "natural";}});
  const [darkMode,setDarkMode]=useState(()=>{try{return localStorage.getItem("darkMode")==="true";}catch{return false;}});
  const [userName,setUserName]=useState(()=>{try{return localStorage.getItem("userName")||"Abebe Girma";}catch{return "Abebe Girma";}});
  const [userGrade,setUserGrade]=useState(()=>{try{return localStorage.getItem("userGrade")||"12";}catch{return "12";}});

  useEffect(()=>{try{localStorage.setItem("darkMode",String(darkMode));}catch{}},  [darkMode]);
  useEffect(()=>{try{localStorage.setItem("stream",stream);}catch{}},              [stream]);
  useEffect(()=>{try{localStorage.setItem("userName",userName);}catch{}},          [userName]);
  useEffect(()=>{try{localStorage.setItem("userGrade",userGrade);}catch{}},        [userGrade]);

  const inQuiz=screen.name==="quiz";
  const activeTab=["subjectDetails","quiz"].includes(screen.name)?"exams":
    ["notifications","helpSupport","settings"].includes(screen.name)?"profile":screen.name;

  const navigate=(tab:string,subjectId?:number)=>{
    if (tab==="exams"&&subjectId){
      const s=subjects.find(x=>x.id===subjectId)!;
      setScreen({name:"subjectDetails",subject:s});
    } else {
      setScreen({name:tab as any});
    }
  };

  const openQuiz=(subject:Subject,questions:Question[],title:string,mode:"practice"|"exam",durationSeconds?:number)=>{
    setScreen({name:"quiz",subject,questions,title,initialMode:mode,durationSeconds});
  };

  const handleSaveSettings=(name:string,grade:string)=>{
    setUserName(name);setUserGrade(grade);
  };

  const wrapperBg=darkMode?"#0d0b18":"#e8e4f5";

  return (
    <div className="min-h-screen flex items-start justify-center" style={{background:wrapperBg}}>
      <div id="phone-container"
        className={`relative w-full max-w-[390px] ${darkMode?"dark":""}`}
        style={{height:"100dvh",background:"var(--background)",fontFamily:"'Inter',sans-serif",overflow:"hidden"}}>

        {/* Scroll container */}
        <div className="absolute inset-0 overflow-y-auto scrollbar-hide" style={{paddingBottom:inQuiz?0:76}}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-xs font-semibold text-foreground">9:41</span>
            <div className="w-4 h-2.5 rounded-sm border-2 border-foreground/60 relative">
              <div className="absolute inset-0.5 right-0.5 bg-foreground/60 rounded-[1px] w-2/3"/>
            </div>
          </div>

          <div className="px-5">
            <AnimatePresence mode="wait">
              {screen.name==="home"&&(
                <motion.div key="home" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:0.18}}>
                  <HomeScreen onNavigate={navigate} onNotifications={()=>setScreen({name:"notifications",from:"home"})} userName={userName}/>
                </motion.div>
              )}
              {screen.name==="exams"&&(
                <motion.div key="exams" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:0.18}}>
                  <ExamsScreen stream={stream} onSubjectSelect={id=>{const s=subjects.find(x=>x.id===id)!;setScreen({name:"subjectDetails",subject:s});}}/>
                </motion.div>
              )}
              {screen.name==="subjectDetails"&&(
                <motion.div key="subjectDetails" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.18}}>
                  <SubjectDetails subject={screen.subject} onBack={()=>setScreen({name:"exams"})}
                    onOpenQuiz={(q,t,m,d)=>openQuiz(screen.subject,q,t,m,d)}/>
                </motion.div>
              )}
              {screen.name==="quiz"&&(
                <motion.div key="quiz" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.18}}>
                  <QuizScreen questions={screen.questions} subject={screen.subject} title={screen.title}
                    initialMode={screen.initialMode} durationSeconds={screen.durationSeconds}
                    onBack={()=>setScreen({name:"subjectDetails",subject:screen.subject})}/>
                </motion.div>
              )}
              {screen.name==="progress"&&(
                <motion.div key="progress" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:0.18}}>
                  <ProgressScreen/>
                </motion.div>
              )}
              {screen.name==="profile"&&(
                <motion.div key="profile" initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} exit={{opacity:0,x:12}} transition={{duration:0.18}}>
                  <ProfileScreen stream={stream} onStreamChange={setStream} darkMode={darkMode}
                    onDarkMode={setDarkMode} onNotifications={()=>setScreen({name:"notifications",from:"profile"})}
                    onHelpSupport={()=>setScreen({name:"helpSupport"})} onSettings={()=>setScreen({name:"settings"})}
                    userName={userName} userGrade={userGrade}/>
                </motion.div>
              )}
              {screen.name==="notifications"&&(
                <motion.div key="notifications" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.18}}>
                  <NotificationsScreen onBack={()=>setScreen({name:screen.from as any})}/>
                </motion.div>
              )}
              {screen.name==="helpSupport"&&(
                <motion.div key="helpSupport" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.18}}>
                  <HelpSupportScreen onBack={()=>setScreen({name:"profile"})}/>
                </motion.div>
              )}
              {screen.name==="settings"&&(
                <motion.div key="settings" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.18}}>
                  <SettingsScreen onBack={()=>setScreen({name:"profile"})} initName={userName} initGrade={userGrade} onSave={handleSaveSettings}/>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom nav — always visible except in quiz */}
        {!inQuiz&&(
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center px-2 pt-2 pb-5 z-30"
            style={{boxShadow:"0 -4px 20px rgba(108,63,207,0.08)"}}>
            {navItems.map(({id,label,icon:Icon})=>{
              const active=activeTab===id;
              return (
                <button key={id} className="flex-1 flex flex-col items-center gap-1 py-1" onClick={()=>navigate(id)}>
                  <div className="w-12 h-7 rounded-full flex items-center justify-center transition-all" style={{background:active?"var(--secondary)":"transparent"}}>
                    <Icon size={20} strokeWidth={active?2.5:1.8} style={{color:active?"var(--primary)":"var(--muted-foreground)"}}/>
                  </div>
                  <span className="text-[10px] font-semibold" style={{color:active?"var(--primary)":"var(--muted-foreground)"}}>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
