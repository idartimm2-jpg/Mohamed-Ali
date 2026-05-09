import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Wand2, Sparkles, LayoutList, AlertCircle, Moon, Sun, ChevronDown, Target, Video, Image as ImageIcon, Zap, Download, History, X, Trash2 } from 'lucide-react';
import { PostCard } from './components/PostCard';
import { GrowthStrategyTool } from './components/GrowthStrategyTool';
import { MarketingChatbot } from './components/MarketingChatbot';
import { PostIdea, HistoryItem } from './types';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeTab, setActiveTab] = useState<'content' | 'growth' | 'chat'>('content');
  const [brief, setBrief] = useState('');
  const [market, setMarket] = useState('مصر');
  const [dialect, setDialect] = useState('عامية مصرية');
  const [tone, setTone] = useState('حماسي وطاقي');
  const [postCount, setPostCount] = useState('9');
  const [purpose, setPurpose] = useState('توعية بالعلامة التجارية (Brand Awareness)');
  const [marketingAngle, setMarketingAngle] = useState('التركيز على القيمة المضافة (Value Proposition)');
  const [contentType, setContentType] = useState('تلقائي (مزيج متنوع)');
  const [reelFormat, setReelFormat] = useState('تلقائي (حسب الفكرة)');
  const [platform, setPlatform] = useState('جميع المنصات');
  
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isEnhancingBrief, setIsEnhancingBrief] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [strategy, setStrategy] = useState<PostIdea[]>([]);
  const [error, setError] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  
  const [generatedScripts, setGeneratedScripts] = useState<Record<number, string>>({});
  const [generatedImages, setGeneratedImages] = useState<Record<number, string[]>>({});
  
  const [isDark, setIsDark] = useState(false);
  const toolRef = useRef<HTMLElement>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentContentHistoryId, setCurrentContentHistoryId] = useState<string | null>(null);
  const [growthLoadedData, setGrowthLoadedData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scg_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('scg_history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
    if (currentContentHistoryId === id) {
      setCurrentContentHistoryId(null);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.type === 'content') {
      setActiveTab('content');
      setBrief(item.data.brief || '');
      setMarket(item.data.market || 'مصر');
      setDialect(item.data.dialect || 'عامية مصرية');
      setTone(item.data.tone || 'حماسي وطاقي');
      setPostCount(item.data.postCount || '9');
      setPurpose(item.data.purpose || 'توعية بالعلامة التجارية (Brand Awareness)');
      setMarketingAngle(item.data.marketingAngle || 'التركيز على القيمة المضافة (Value Proposition)');
      setContentType(item.data.contentType || 'تلقائي (مزيج متنوع)');
      setReelFormat(item.data.reelFormat || 'تلقائي (حسب الفكرة)');
      setPlatform(item.data.platform || 'جميع المنصات');
      setStrategy(item.data.strategy || []);
      setGeneratedScripts(item.data.generatedScripts || {});
      setGeneratedImages(item.data.generatedImages || {});
      setCurrentContentHistoryId(item.id);
    } else if (item.type === 'growth') {
      setActiveTab('growth');
      setGrowthLoadedData(item.data);
    }
    setIsHistoryOpen(false);
  };

  const handleSaveGrowthHistory = (data: any) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'growth',
      title: data.brandName || 'استراتيجية نمو',
      data
    };
    saveHistory([newItem, ...history]);
  };

  useEffect(() => {
    if (currentContentHistoryId && strategy.length > 0) {
      setHistory(prev => {
        const newHistory = prev.map(item => {
          if (item.id === currentContentHistoryId) {
            return {
              ...item,
              data: {
                ...item.data,
                generatedScripts,
                generatedImages
              }
            };
          }
          return item;
        });
        localStorage.setItem('scg_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [generatedScripts, generatedImages]);

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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(new Set(strategy.map((_, i) => i)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const togglePost = (index: number) => {
    const newSet = new Set(selectedPosts);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedPosts(newSet);
  };

  const handleEnhanceBrief = async () => {
    if (!brief) {
      setError('يرجى إدخال نبذة مبدئية أولاً ليتم تحسينها.');
      return;
    }
    setIsEnhancingBrief(true);
    setError('');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير في كتابة البريف (Brief) للعلامات التجارية.
قم بتحسين وإعادة صياغة النبذة التالية لتكون احترافية، واضحة، وجذابة، وتبرز القيمة المضافة للعلامة التجارية.
النبذة الحالية:
"${brief}"

أخرج النبذة المحسنة فقط بدون أي مقدمات أو خاتمات.`,
      });
      if (response.text) {
        setBrief(response.text.trim());
      }
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء تحسين النبذة: ' + err.message);
    } finally {
      setIsEnhancingBrief(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('clean-pdf-content');
    if (!element) return;
    
    setIsDownloadingPDF(true);
    
    const opt = {
      margin:       15,
      filename:     'content-strategy.pdf',
      image:        { type: 'jpeg' as const, quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 800, scrollX: 0, scrollY: 0 },
      jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('حدث خطأ أثناء تحميل ملف PDF.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!brief) {
      setError('يرجى إدخال نبذة عن العلامة التجارية');
      return;
    }
    setError('');
    setIsGeneratingStrategy(true);
    setStrategy([]);
    setSelectedPosts(new Set());
    setGeneratedScripts({});
    setGeneratedImages({});
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
- نوع المحتوى المطلوب: ${contentType}
- طريقة تقديم الفيديو/الريلز: ${reelFormat}
- منصة السوشيال ميديا المستهدفة: ${platform}
- عدد المنشورات المطلوبة: ${postCount}

قم بتوليد ${postCount} أفكار لمنشورات تحقق الغرض والزاوية التسويقية المحددة.
تأكد من الالتزام بنوع المحتوى المطلوب (${contentType}) وملاءمته للمنصة المستهدفة (${platform}) وطريقة التقديم (${reelFormat}).
يجب أن يحتوي كل منشور على:
- title: عنوان قصير وجذاب للفكرة.
- description: وصف تفصيلي للفكرة والمحتوى المرئي.
- format: نوع المنشور (ريلز، صورة، كاروسيل، فيديو قصير) بناءً على نوع المحتوى المطلوب والمنصة.
- caption: كابشن (نص المنشور) جاهز للنشر متوافق مع اللهجة والأسلوب المطلوب والمنصة المستهدفة، مع هاشتاجات مناسبة.
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

      const newId = Date.now().toString();
      const newItem: HistoryItem = {
        id: newId,
        date: new Date().toISOString(),
        type: 'content',
        title: brief.substring(0, 30) + (brief.length > 30 ? '...' : '') || 'استراتيجية محتوى',
        data: {
          brief, market, dialect, tone, postCount, purpose, marketingAngle, contentType, reelFormat, platform,
          strategy: parsedStrategy,
          generatedScripts: {},
          generatedImages: {}
        }
      };
      saveHistory([newItem, ...history]);
      setCurrentContentHistoryId(newId);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء توليد الاستراتيجية: ' + err.message);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 pb-10 transition-colors print:bg-white print:text-black" dir="rtl">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors print:hidden">
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
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="سجل الاستراتيجيات"
            >
              <History size={20} />
            </button>
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
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden print:hidden">
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
      <section className="py-20 bg-white dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800 print:hidden">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8 print:py-0" ref={toolRef}>
        <div className="text-center mb-12 print:hidden">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">أدوات صناعة المحتوى والنمو</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">اختر الأداة المناسبة لاحتياجاتك وابدأ السحر.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setActiveTab('content')} 
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              أداة صناعة المحتوى
            </button>
            <button 
              onClick={() => setActiveTab('growth')} 
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'growth' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              استراتيجية النمو الشاملة
            </button>
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              مساعد التسويق الذكي
            </button>
          </div>
        </div>

        {activeTab === 'content' ? (
          <>
            {/* Form Section */}
            <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors print:hidden">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
            <LayoutList className="text-indigo-500 dark:text-indigo-400" size={24} />
            إعدادات الاستراتيجية
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">نبذة عن العلامة التجارية (البريف)</label>
                <button
                  onClick={handleEnhanceBrief}
                  disabled={isEnhancingBrief || !brief}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                  title="تحسين النبذة بالذكاء الاصطناعي"
                >
                  {isEnhancingBrief ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  تحسين بالذكاء الاصطناعي
                </button>
              </div>
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
                <option value="متنوع (مزيج من الكل)">متنوع (مزيج من الكل)</option>
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
                <option value="متنوع (مزيج من الكل)">متنوع (مزيج من الكل)</option>
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
                <option value="متنوع (مزيج من الكل)">متنوع (مزيج من الكل)</option>
                <option value="حماسي وطاقي">حماسي وطاقي</option>
                <option value="عاطفي ومؤثر">عاطفي ومؤثر</option>
                <option value="كوميدي ومرح">كوميدي ومرح</option>
                <option value="رسمي واحترافي">رسمي واحترافي</option>
                <option value="تعليمي ومفيد">تعليمي ومفيد</option>
                <option value="ملهم ومحفز">ملهم ومحفز</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">منصة السوشيال ميديا</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="جميع المنصات">جميع المنصات</option>
                <option value="فيسبوك (Facebook)">فيسبوك (Facebook)</option>
                <option value="انستجرام (Instagram)">انستجرام (Instagram)</option>
                <option value="إكس / تويتر (X / Twitter)">إكس / تويتر (X / Twitter)</option>
                <option value="سناب شات (Snapchat)">سناب شات (Snapchat)</option>
                <option value="تيك توك (TikTok)">تيك توك (TikTok)</option>
                <option value="لينكد إن (LinkedIn)">لينكد إن (LinkedIn)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">نوع المحتوى</label>
              <select 
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="تلقائي (مزيج متنوع)">تلقائي (مزيج متنوع)</option>
                <option value="ريلز فقط (Reels Only)">ريلز فقط (Reels Only)</option>
                <option value="صور وكاروسيل فقط (Posts & Carousels)">صور وكاروسيل فقط (Posts & Carousels)</option>
                <option value="فيديوهات قصيرة فقط (Short Videos)">فيديوهات قصيرة فقط (Short Videos)</option>
                <option value="نسبة وتناسب (50% ريلز، 50% صور)">نسبة وتناسب (50% ريلز، 50% صور)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">طريقة تقديم الفيديو/الريلز</label>
              <select 
                value={reelFormat}
                onChange={(e) => setReelFormat(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="تلقائي (حسب الفكرة)">تلقائي (حسب الفكرة)</option>
                <option value="شخص يتكلم للكاميرا (Talking Head)">شخص يتكلم للكاميرا (Talking Head)</option>
                <option value="شخص يتكلم + مشاهد داعمة (Talking Head + B-Roll)">شخص يتكلم + مشاهد داعمة (Talking Head + B-Roll)</option>
                <option value="مشاهد سينمائية مع تعليق صوتي (Cinematic + Voiceover)">مشاهد سينمائية مع تعليق صوتي (Cinematic + Voiceover)</option>
                <option value="مشاهد تمثيلية / سكتش (Acting / Skit)">مشاهد تمثيلية / سكتش (Acting / Skit)</option>
                <option value="شرح على الشاشة / وايت بورد (Screen Recording / Whiteboard)">شرح على الشاشة / وايت بورد (Screen Recording / Whiteboard)</option>
                <option value="تريند وتحديات (Trend / Challenge)">تريند وتحديات (Trend / Challenge)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">عدد المنشورات</label>
              <select 
                value={postCount}
                onChange={(e) => setPostCount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
              >
                <option value="1">1 منشور (فكرة واحدة)</option>
                <option value="3">3 منشورات</option>
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
          <section className="space-y-8 pt-8 print:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <Sparkles className="text-indigo-500 dark:text-indigo-400" size={32} />
                استراتيجية المحتوى ({strategy.length} منشور)
              </h2>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedPosts.size === strategy.length && strategy.length > 0} 
                    onChange={handleSelectAll} 
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">تحديد الكل</span>
                </label>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={selectedPosts.size === 0 || isDownloadingPDF} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingPDF ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  {isDownloadingPDF ? 'جاري التحميل...' : 'تحميل PDF'}
                </button>
              </div>
            </div>
            
            <div id="pdf-content" className="grid grid-cols-1 gap-8 print:gap-4">
              {strategy.map((idea, index) => (
                <PostCard 
                  key={idea.id || index} 
                  idea={idea} 
                  index={index} 
                  brief={brief}
                  dialect={dialect}
                  tone={tone}
                  reelFormat={reelFormat}
                  isSelected={selectedPosts.has(index)}
                  onToggleSelect={() => togglePost(index)}
                  script={generatedScripts[index]}
                  onScriptChange={(script) => setGeneratedScripts(prev => ({ ...prev, [index]: script }))}
                  imageUrls={generatedImages[index]}
                  onImageUrlsChange={(urls) => setGeneratedImages(prev => ({ ...prev, [index]: urls }))}
                />
              ))}
            </div>
          </section>
        )}
          </>
        ) : activeTab === 'growth' ? (
          <GrowthStrategyTool loadedData={growthLoadedData} onSaveHistory={handleSaveGrowthHistory} />
        ) : (
          <MarketingChatbot />
        )}
      </main>

      {/* History Sidebar Overlay */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 print:hidden backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
      )}
      
      {/* History Sidebar */}
      <div className={`fixed top-0 bottom-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl transform transition-transform duration-300 flex flex-col print:hidden ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <History size={20} className="text-indigo-600 dark:text-indigo-400" />
            سجل الاستراتيجيات
          </h2>
          <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 mt-10 flex flex-col items-center gap-3">
              <History size={48} className="opacity-20" />
              <p>لا يوجد سجل حتى الآن</p>
            </div>
          ) : (
            history.map(item => (
              <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all group relative" onClick={() => loadHistoryItem(item)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.type === 'content' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                    {item.type === 'content' ? 'محتوى' : 'نمو شامل'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium" dir="ltr">
                    {new Date(item.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate pr-1">{item.title}</h3>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteHistoryItem(item.id); }}
                  className="absolute left-2 bottom-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 mt-20 print:hidden">
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

      {/* Hidden Clean Content for PDF Export */}
      <div className="absolute top-0 right-0 -z-50 opacity-0 pointer-events-none w-[800px]">
        <div id="clean-pdf-content" className="p-8 w-full" dir="rtl" style={{ boxSizing: "border-box", fontFamily: "'Cairo', sans-serif", backgroundColor: "#ffffff", color: "#000000", textAlign: "right", direction: "rtl", overflowWrap: "break-word" }}>
          <h1 className="text-3xl font-bold mb-4 text-center" style={{ color: "#000000" }}>استراتيجية المحتوى</h1>
          <p className="text-center mb-12 text-lg font-bold" style={{ color: "#4f46e5" }}>المنصة المستهدفة: {platform}</p>

          <div className="space-y-12">
            {Array.from(selectedPosts).sort((a, b) => a - b).map((index) => {
              const idea = strategy[index];
              const script = generatedScripts[index];
              const images = generatedImages[index];
              
              return (
                <div key={index} className="break-inside-avoid mb-12">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: "#000000" }}>
                    {index + 1}. {idea.title}
                  </h2>
                  <div className="space-y-4 text-lg" style={{ color: "#000000" }}>
                    <p><strong style={{ color: "#000000" }}>نوع المنشور:</strong> {idea.format}</p>
                    <p className="leading-relaxed"><strong style={{ color: "#000000" }}>الوصف:</strong> {idea.description}</p>
                    <div>
                      <strong className="block mb-2" style={{ color: "#000000" }}>الكابشن المقترح:</strong>
                      <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "#000000" }}>{idea.caption}</p>
                    </div>
                    
                    {script && (
                      <div className="mt-6 pt-6" style={{ borderTop: "1px solid #e5e7eb" }}>
                        <strong className="block mb-2 text-xl" style={{ color: "#312e81" }}>اسكريبت الريلز:</strong>
                        <div className="whitespace-pre-wrap leading-relaxed" style={{ color: "#000000" }}>{script}</div>
                      </div>
                    )}
                    
                    {images && images.length > 0 && (
                      <div className="mt-6 pt-6" style={{ borderTop: "1px solid #e5e7eb" }}>
                        <strong className="block mb-4 text-xl" style={{ color: "#312e81" }}>الصور المرفقة:</strong>
                        <div className="grid grid-cols-2 gap-4">
                          {images.map((url, i) => (
                            <img key={i} src={url} alt={`Generated ${i}`} className="max-w-full h-auto rounded-lg" style={{ border: "1px solid #e5e7eb" }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

