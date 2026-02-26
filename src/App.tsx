import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Wand2, Sparkles, LayoutList, AlertCircle, Moon, Sun, ChevronDown, Target, Video, Image as ImageIcon, Zap } from 'lucide-react';
import { PostCard } from './components/PostCard';
import { PostIdea } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [brief, setBrief] = useState('');
  const [market, setMarket] = useState('مصر');
  const [dialect, setDialect] = useState('عامية مصرية');
  const [tone, setTone] = useState('حماسي وطاقي');
  const [postCount, setPostCount] = useState('9');
  const [purpose, setPurpose] = useState('توعية بالعلامة التجارية (Brand Awareness)');
  const [marketingAngle, setMarketingAngle] = useState('التركيز على القيمة المضافة (Value Proposition)');
  
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategy, setStrategy] = useState<PostIdea[]>([]);
  const [error, setError] = useState('');
  
  const [isDark, setIsDark] = useState(false);
  const toolRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const scrollToTool = () => {
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerateStrategy = async () => {
    if (!brief) {
      setError('يرجى إدخال نبذة عن العلامة التجارية');
      return;
    }
    setError('');
    setIsGeneratingStrategy(true);
    setStrategy([]);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير تسويق وصناعة محتوى. قم بإنشاء استراتيجية محتوى لعلامة تجارية بناءً على المعطيات التالية:
- وصف العلامة التجارية: ${brief}
- السوق المستهدف: ${market}
- اللهجة: ${dialect}
- الشعور/الأسلوب: ${tone}
- غرض المحتوى (الهدف): ${purpose}
- الزاوية التسويقية: ${marketingAngle}
- عدد المنشورات المطلوبة: ${postCount}

قم بتوليد ${postCount} أفكار لمنشورات متنوعة (ريلز، صور، كاروسيل) تحقق الغرض والزاوية التسويقية المحددة.
يجب أن يحتوي كل منشور على:
- title: عنوان قصير وجذاب للفكرة.
- description: وصف تفصيلي للفكرة والمحتوى المرئي.
- format: نوع المنشور (ريلز، صورة، كاروسيل، فيديو قصير).
- caption: كابشن (نص المنشور) جاهز للنشر متوافق مع اللهجة والأسلوب المطلوب، مع هاشتاجات مناسبة.
`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                format: { type: Type.STRING },
                caption: { type: Type.STRING },
              },
              required: ['id', 'title', 'description', 'format', 'caption'],
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || '[]';
      const parsedStrategy = JSON.parse(jsonStr);
      setStrategy(parsedStrategy);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء توليد الاستراتيجية: ' + err.message);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 pb-10 transition-colors" dir="rtl">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">SCG</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الرئيسية</button>
            <button onClick={scrollToTool} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">الأداة</button>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={scrollToTool} className="hidden md:flex px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              ابدأ الآن
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-8 border border-indigo-100 dark:border-indigo-800/50">
            <Zap size={16} />
            الجيل الجديد من صناعة المحتوى
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
            اصنع محتوى احترافي <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
              في ثوانٍ معدودة
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            أداتك الذكية لتوليد استراتيجيات المحتوى، كتابة اسكريبتات الريلز، وتصميم الصور الإعلانية بالذكاء الاصطناعي بناءً على هوية علامتك التجارية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={scrollToTool}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
            >
              <Wand2 size={22} />
              ابدأ بصناعة المحتوى
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">كل ما تحتاجه لإدارة حساباتك</h2>
            <p className="text-slate-600 dark:text-slate-400">من الفكرة إلى التصميم، كل شيء في مكان واحد.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">استراتيجيات متكاملة</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                خطط محتوى مخصصة لجمهورك المستهدف، مع تحديد الزاوية التسويقية والهدف من كل منشور.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <Video size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">اسكريبتات ريلز</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                نصوص جاهزة للتسجيل مقسمة باحترافية (خطاف، محتوى، دعوة لاتخاذ إجراء) تناسب لهجتك.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">تصاميم بالذكاء الاصطناعي</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                توليد صور إعلانية جذابة مع إمكانية دمج شعارك ومنتجاتك واختيار الألوان والمود المناسب.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8" ref={toolRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">أداة صناعة المحتوى</h2>
          <p className="text-slate-600 dark:text-slate-400">أدخل تفاصيل علامتك التجارية وابدأ السحر.</p>
        </div>

        {/* Form Section */}
        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
            <LayoutList className="text-indigo-500 dark:text-indigo-400" size={24} />
            إعدادات الاستراتيجية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">نبذة عن العلامة التجارية (البريف)</label>
              <textarea 
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="مثال: متجر إلكتروني لبيع القهوة المختصة، نستهدف عشاق القهوة الذين يبحثون عن جودة عالية وتجربة مميزة..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">السوق الموجه إليه المحتوى</label>
              <input 
                type="text"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="مثال: مصر، السعودية، الخليج..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">غرض المحتوى (الهدف)</label>
              <select 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="توعية بالعلامة التجارية (Brand Awareness)">توعية بالعلامة التجارية (Brand Awareness)</option>
                <option value="زيادة المتابعين والتفاعل (Engagement & Growth)">زيادة المتابعين والتفاعل (Engagement & Growth)</option>
                <option value="محتوى بيعي مباشر (Sales & Conversion)">محتوى بيعي مباشر (Sales & Conversion)</option>
                <option value="محتوى تعليمي وتثقيفي (Educational)">محتوى تعليمي وتثقيفي (Educational)</option>
                <option value="بناء الثقة والمصداقية (Trust & Credibility)">بناء الثقة والمصداقية (Trust & Credibility)</option>
                <option value="إطلاق منتج جديد (Product Launch)">إطلاق منتج جديد (Product Launch)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الزاوية التسويقية</label>
              <select 
                value={marketingAngle}
                onChange={(e) => setMarketingAngle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="التركيز على القيمة المضافة (Value Proposition)">التركيز على القيمة المضافة (Value Proposition)</option>
                <option value="حل مشكلة العميل (Problem-Agitate-Solve)">حل مشكلة العميل (Problem-Agitate-Solve)</option>
                <option value="الندرة والاستعجال (FOMO & Urgency)">الندرة والاستعجال (FOMO & Urgency)</option>
                <option value="الدليل الاجتماعي وآراء العملاء (Social Proof)">الدليل الاجتماعي وآراء العملاء (Social Proof)</option>
                <option value="سرد القصص (Storytelling)">سرد القصص (Storytelling)</option>
                <option value="مقارنة مع المنافسين (Us vs Them)">مقارنة مع المنافسين (Us vs Them)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">اللهجة</label>
              <select 
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="عامية مصرية">عامية مصرية</option>
                <option value="عامية سعودية">عامية سعودية</option>
                <option value="عامية خليجية">عامية خليجية</option>
                <option value="عربية فصحى">عربية فصحى</option>
                <option value="مزيج (فصحى وعامية)">مزيج (فصحى وعامية)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الشعور / الأسلوب</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="حماسي وطاقي">حماسي وطاقي</option>
                <option value="عاطفي ومؤثر">عاطفي ومؤثر</option>
                <option value="كوميدي ومرح">كوميدي ومرح</option>
                <option value="رسمي واحترافي">رسمي واحترافي</option>
                <option value="تعليمي ومفيد">تعليمي ومفيد</option>
                <option value="ملهم ومحفز">ملهم ومحفز</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">عدد المنشورات</label>
              <select 
                value={postCount}
                onChange={(e) => setPostCount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="9">9 منشورات</option>
                <option value="12">12 منشور</option>
                <option value="15">15 منشور</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/50">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleGenerateStrategy}
              disabled={isGeneratingStrategy}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-lg"
            >
              {isGeneratingStrategy ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Wand2 size={22} />
                  استخراج الاستراتيجية
                </>
              )}
            </button>
          </div>
        </section>

        {/* Strategy Results */}
        {strategy.length > 0 && (
          <section className="space-y-8 pt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Sparkles className="text-indigo-500 dark:text-indigo-400" size={32} />
                استراتيجية المحتوى ({strategy.length} منشور)
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {strategy.map((idea, index) => (
                <PostCard 
                  key={idea.id || index} 
                  idea={idea} 
                  index={index} 
                  brief={brief}
                  dialect={dialect}
                  tone={tone}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white">SCG</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            كل الحقوق محفوظة لمحمد علي 01026465273 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

