"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, User, Phone, Award, ArrowRight } from 'lucide-react';

// === НАСТРОЙКИ ===
// Сюда нужно вставить ссылку Web App из Google Apps Script
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwAyLpGPHDjUrBbzG9TG0RGw35d_WNLbkw0Y9Qu5n9QVScp4CfNt5JHoVDZIx9aD8Nq/exec"; 
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb6cRM84yltYGCtATc2n";
const REDIRECT_DELAY_SECONDS = 10;

const questions = [
  {
    id: 1,
    title: "to be етістігінің дұрыс формасын таңдаңыз:",
    question: "«I ___ a student.»",
    options: [
      { id: 'A', text: "am" },
      { id: 'B', text: "is" },
      { id: 'C', text: "are" },
      { id: 'D', text: "be" },
    ],
    correct: 'A'
  },
  {
    id: 2,
    title: "Сөйлемге қандай сөз қою керек?",
    question: "«She ___ my sister.»",
    options: [
      { id: 'A', text: "am" },
      { id: 'B', text: "is" },
      { id: 'C', text: "are" },
      { id: 'D', text: "be" },
    ],
    correct: 'B'
  },
  {
    id: 3,
    title: "Дұрыс артикльді таңдаңыз:",
    question: "«This is ___ apple.»",
    options: [
      { id: 'A', text: "a" },
      { id: 'B', text: "an" },
      { id: 'C', text: "the" },
      { id: 'D', text: "— (артикльсіз)" },
    ],
    correct: 'B'
  },
  {
    id: 4,
    title: "Қай сөйлем дұрыс құрастырылған?",
    question: "Дұрыс нұсқаны таңдаңыз:",
    options: [
      { id: 'A', text: "He are my friend." },
      { id: 'B', text: "He am my friend." },
      { id: 'C', text: "He is my friend." },
      { id: 'D', text: "He be my friend." },
    ],
    correct: 'C'
  },
  {
    id: 5,
    title: "Дұрыс сөзді таңдаңыз:",
    question: "«I ___ from Spain.»",
    options: [
      { id: 'A', text: "am" },
      { id: 'B', text: "is" },
      { id: 'C', text: "are" },
      { id: 'D', text: "be" },
    ],
    correct: 'A'
  },
  {
    id: 6,
    title: "Көпше түрге қай нұсқа сәйкес келеді?",
    question: "«They ___ happy.»",
    options: [
      { id: 'A', text: "am" },
      { id: 'B', text: "is" },
      { id: 'C', text: "are" },
      { id: 'D', text: "be" },
    ],
    correct: 'C'
  },
  // Новые вопросы 7-10
  {
    id: 7,
    title: "Өткен шақ формасын таңдаңыз:",
    question: "«Yesterday I ___ to the cinema.»",
    options: [
      { id: 'A', text: "go" },
      { id: 'B', text: "went" },
      { id: 'C', text: "gone" },
      { id: 'D', text: "going" },
    ],
    correct: 'B'
  },
  {
    id: 8,
    title: "Келер шақты көрсетіңіз:",
    question: "«I ___ call you later.»",
    options: [
      { id: 'A', text: "will" },
      { id: 'B', text: "did" },
      { id: 'C', text: "am" },
      { id: 'D', text: "have" },
    ],
    correct: 'A'
  },
  {
    id: 9,
    title: "Дұрыс предлогты таңдаңыз:",
    question: "«See you ___ Monday.»",
    options: [
      { id: 'A', text: "in" },
      { id: 'B', text: "at" },
      { id: 'C', text: "on" },
      { id: 'D', text: "to" },
    ],
    correct: 'C'
  },
  {
    id: 10,
    title: "Салыстырмалы шырайды таңдаңыз:",
    question: "«This car is ___ than that one.»",
    options: [
      { id: 'A', text: "fast" },
      { id: 'B', text: "faster" },
      { id: 'C', text: "more fast" },
      { id: 'D', text: "fastest" },
    ],
    correct: 'B'
  },
];

export default function App() {
  const [step, setStep] = useState('welcome'); // welcome, quiz, lead, result
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);

  // Логика начала квиза
  const startQuiz = () => {
    setStep('quiz');
  };

  // Обработка ответа
  const handleAnswer = (optionId) => {
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = optionId === currentQ.correct;
    
    setAnswers({ ...answers, [currentQuestionIndex]: optionId });
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep('lead');
      }
    }, 250);
  };

  // === ФОРМАТТЕР ТЕЛЕФОНА (KZ) ===
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Удаляем все нецифровые символы
    let formatted = '';

    if (!input) {
      setLeadData({ ...leadData, phone: '' });
      return;
    }

    // Логика для Казахстана: если вводят 8..., 7... или сразу 701...
    if (['7', '8', '9'].includes(input[0])) {
      if (input[0] === '9') input = '7' + input;
      if (input[0] === '8') input = '7' + input.substring(1);
    } else {
      input = '7' + input;
    }

    input = input.substring(0, 11);

    if (input.length > 0) formatted = '+7';
    if (input.length > 1) formatted += ' (' + input.substring(1, 4);
    if (input.length > 4) formatted += ') ' + input.substring(4, 7);
    if (input.length > 7) formatted += '-' + input.substring(7, 9);
    if (input.length > 9) formatted += '-' + input.substring(9, 11);

    setLeadData({ ...leadData, phone: formatted });
  };

  // Обработка формы лидов
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalData = {
      ...leadData,
      // Добавляем апостроф, чтобы Sheets считал это текстом, а не формулой
      phone: `'${leadData.phone}`, 
      score: score,
      total: questions.length,
      date: new Date().toLocaleString()
    };

    console.log("LEAD COLLECTED:", finalData);

    // === ОТПРАВКА В GOOGLE SHEETS ===
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        // ИСПОЛЬЗУЕМ URLSearchParams (Работает стабильнее с GAS e.parameter)
        const params = new URLSearchParams();
        for (const key in finalData) {
            params.append(key, finalData[key]);
        }
        
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString()
        });
        
        console.log("Data sent to Google Sheets (no-cors mode)");
      } catch (error) {
        console.error("Error sending to Google Sheets", error);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('result');
    }, 1500);
  };

  // Таймер перенаправления
  useEffect(() => {
    if (step === 'result') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = WHATSAPP_CHANNEL_URL;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      {/* Скрываем бейджик v0 с указанным классом */}
      <style>{`
        .v0-built-with-button-303d5a56-3155-49b3-8ef4-74d4ffcfdf7c {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }
      `}</style>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* === STEP 1: WELCOME SCREEN === */}
        {step === 'welcome' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Award size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-slate-900">Ағылшын тілі деңгейіңді тексер!</h1>
            <p className="text-slate-600 mb-8 text-lg">
              10 қарапайым сұраққа жауап беріп, бізден 🔥 жирный бонус алыңыз!
            </p>
            <button 
              onClick={startQuiz}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-200"
            >
              Тестті бастау <ChevronRight size={20} />
            </button>
            <p className="mt-4 text-xs text-slate-400">Бар болғаны 1 минут уақыт алады</p>
          </div>
        )}

        {/* === STEP 2: QUIZ SCREEN === */}
        {step === 'quiz' && (
          <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2">
              <div 
                className="bg-blue-600 h-2 transition-all duration-500 ease-out" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Сұрақ {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              <h2 className="text-sm text-slate-500 font-medium mb-1">
                {questions[currentQuestionIndex].title}
              </h2>
              <h3 className="text-2xl font-bold text-slate-900 mb-8">
                {questions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestionIndex].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className="w-full text-left p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-[0.98] group flex items-center justify-between"
                  >
                    <span className="text-lg font-medium text-slate-700 group-hover:text-blue-700">
                      <span className="inline-block w-8 text-slate-400 group-hover:text-blue-500 font-normal">{option.id})</span> 
                      {option.text}
                    </span>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === STEP 3: LEAD FORM === */}
        {step === 'lead' && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-pulse">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Тест аяқталды!</h2>
              <p className="text-slate-600 mt-2">
                Нәтижеңізді көру үшін төмендегі форманы толтырыңыз.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type="text"
                  placeholder="Атыңыз"
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  required
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={leadData.phone}
                  onChange={handlePhoneChange}
                  maxLength={18} // +7 (123) 456-78-90 (18 chars)
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || leadData.phone.length < 18} // Блокировка если номер не полный
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl mt-4 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Өңделуде...' : 'Нәтижені алу'} 
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
              
              <p className="text-[10px] text-center text-slate-400 mt-4 leading-tight">
                Түймені басу арқылы сіз дербес деректерді өңдеу саясатымен келісесіз.
              </p>
            </form>
          </div>
        )}

        {/* === STEP 4: RESULTS === */}
        {step === 'result' && (
          <div className="p-8 text-center animate-in fade-in duration-500">
             <div className="relative inline-block mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-blue-600"
                    strokeWidth="8"
                    strokeDasharray={365}
                    strokeDashoffset={365 - (365 * score) / questions.length}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-4xl font-bold text-slate-800">{score}</span>
                  <span className="text-sm text-slate-400 block">{questions.length}-дан</span>
                </div>
             </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {score === questions.length ? "Тамаша нәтиже!" : score > 5 ? "Жақсы нәтиже!" : "Әлі де дайындалу керек"}
            </h2>
            
            <p className="text-slate-600 mb-8">
              {score === questions.length 
                ? "Сіздің базалық біліміңіз өте жақсы! Менеджер сізге жақын уақытта хабарласады." 
                : "Қатысқаныңызға рақмет! Менеджер сізге жақын уақытта хабарласады."}
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm font-semibold text-blue-800 mb-1">🎁 Сіздің бонусыңыз:</p>
              <p className="text-sm text-blue-600">Сізге деңгейіңізді толықтай анықтайтын пробный сабаққа 90% жеңілдік беріледі.</p>
            </div>

            {/* Автоматический переход в WhatsApp с таймером */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-3 font-medium">
                WhatsApp арнасына автоматты түрде өту:
              </p>
              
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-2 relative">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / REDIRECT_DELAY_SECONDS) * 100}%` }}
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 mix-blend-multiply">
                   {countdown} сек
                </div>
              </div>
              
              <a 
                href={WHATSAPP_CHANNEL_URL}
                className="mt-2 inline-flex items-center text-green-600 hover:text-green-700 font-bold text-sm bg-green-50 px-4 py-2 rounded-full transition-colors"
              >
                Қазір өту &rarr;
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
