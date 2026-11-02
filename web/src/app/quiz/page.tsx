import DatabaseQuiz from "@/components/database-quiz";
import Quiz from "@/components/quiz";
import {questions} from "@/lib/quiz-data";
export default function Page(){return <div className="page"><div className="eyebrow">LEARN A LITTLE, CHANGE A LITTLE</div><h1>ลองทบทวนความเข้าใจกัน</h1><DatabaseQuiz/><Quiz questions={questions.map(({id,text,options})=>({id,text,options}))}/></div>;}
