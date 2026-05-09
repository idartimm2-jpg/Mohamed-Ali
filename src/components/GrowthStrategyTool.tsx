import React, { useState, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { Loader2, Target, Download, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface GrowthStrategyToolProps {
  loadedData?: any;
  onSaveHistory?: (data: any) => void;
}

export function GrowthStrategyTool({ loadedData, onSaveHistory }: GrowthStrategyToolProps) {
  const [brandName, setBrandName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [growthMarket, setGrowthMarket] = useState('مصر');
  const [mainGoal, setMainGoal] = useState('زيادة مبيعات');
  const [targetAudience, setTargetAudience] = useState('');
  const [platforms, setPlatforms] = useState('انستجرام وفيسبوك');
  const [productionCapacity, setProductionCapacity] = useState('موبايل فقط');
  const [contentType, setContentType] = useState('ميكس (ريلز وتصميمات)');
  const [adsBudget, setAdsBudget] = useState('منخفضة');
  const [strategyDuration, setStrategyDuration] = useState('1 شهر');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    if (loadedData) {
      setBrandName(loadedData.brandName || '');
      setBusinessType(loadedData.businessType || '');
      setGrowthMarket(loadedData.growthMarket || 'مصر');
      setMainGoal(loadedData.mainGoal || 'زيادة مبيعات');
      setTargetAudience(loadedData.targetAudience || '');
      setPlatforms(loadedData.platforms || 'انستجرام وفيسبوك');
      setProductionCapacity(loadedData.productionCapacity || 'موبايل فقط');
      setContentType(loadedData.contentType || 'ميكس (ريلز وتصميمات)');
      setAdsBudget(loadedData.adsBudget || 'منخفضة');
      setStrategyDuration(loadedData.strategyDuration || '1 شهر');
      setResult(loadedData.result || '');
    }
  }, [loadedData]);

  const handleGenerate = async () => {
    if (!brandName || !businessType || !targetAudience) {
      setError('يرجى إدخال اسم البراند، نوع النشاط، والفئة المستهدفة.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setResult('');

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey as string });
      
      const prompt = `أنت Chief Marketing Officer + Senior Growth Strategist بخبرة أكثر من 20 عاماً في بناء استراتيجيات نمو للبراندات والشركات الناشئة والبراندات الشخصية.
هدفك إنشاء استراتيجية تسويق محتوى متكاملة وعالية المستوى اعتماداً على أقل عدد ممكن من المدخلات.
فكر كمدير وكالة Marketing Agency يقدم استشارة مدفوعة وليس ككاتب محتوى.

====================================
📌 المرحلة الأولى — تحليل المدخلات:
- اسم البراند: ${brandName}
- نوع النشاط: ${businessType}
- السوق أو الدولة: ${growthMarket}
- الهدف الرئيسي: ${mainGoal}
- الفئة المستهدفة: ${targetAudience}
- المنصات: ${platforms}
- نوع المحتوى المفضل: ${contentType}
- قدرة الإنتاج: ${productionCapacity}
- ميزانية الإعلانات: ${adsBudget}
- مدة الاستراتيجية: ${strategyDuration}

====================================
📌 المرحلة الثانية — التفكير الذاتي (يجب تنفيذها داخلياً):
قم بتحليل:
مستوى المنافسة المتوقع.
نوع الجمهور.
رحلة العميل.
نوع المحتوى المناسب للسوق.
قم بإنشاء افتراضات منطقية عند نقص المعلومات.
لا تطلب معلومات إضافية.

====================================
📌 المطلوب إخراجه:
1️⃣ Client-Friendly Summary: ملخص بسيط جداً ومباشر يشرح للعميل ماذا سنفعل، ولماذا، وما هي النتيجة المتوقعة، بلغة سهلة خالية من المصطلحات المعقدة.
2️⃣ Executive Strategy Summary: ملخص احترافي يشرح الاتجاه العام.
3️⃣ Brand Positioning: شخصية البراند، زاوية التميز USP، صورة البراند المطلوبة ذهنياً.
4️⃣ Persona Analysis (قم بإنشاء Persona كاملة): ماذا يريد العميل؟ ماذا يخاف؟ لماذا لا يشتري؟ محفزات الشراء.
5️⃣ Competitor Angles: توقع ماذا يفعل المنافسون، نقاط ضعفهم، فرص التفوق عليهم.
6️⃣ Platform Strategy: حدد وظيفة كل منصة (مثال: Instagram → صورة ذهنية، TikTok → انتشار سريع).
7️⃣ Content Pillars: أنشئ 5 إلى 7 أعمدة محتوى مع شرح دور كل عمود في Funnel.
8️⃣ Funnel Strategy: Awareness, Consideration, Conversion مع أمثلة محتوى لكل مرحلة.
9️⃣ Viral Growth Blueprint: أنواع Hooks المقترحة، أنماط الفيديو، أسلوب بداية الريلز.
🔟 Reel Ideas Generator: قدم 25 فكرة Reel قابلة للتنفيذ فوراً (كل فكرة تحتوي: Hook، الفكرة الأساسية، الهدف منها).
1️⃣1️⃣ Content Calendar:
- إذا كانت شهر: قدم Calendar لمدة 30 يوم.
- إذا كانت 3 أشهر: قسمها شهرياً.
- إذا كانت 6 أشهر: قسمها مراحل (Launch, Authority, Scale).
حدد عدد الريلز، التصاميم، Stories.
1️⃣2️⃣ Ads Strategy: متى تبدأ الإعلانات، نوع الحملة، توزيع الميزانية.
1️⃣3️⃣ KPI Dashboard: حدد ما يجب قياسه (Saves, Watch Time, Messages, Conversion).
1️⃣4️⃣ Optimization Plan: كيف يتم تطوير الأداء كل شهر.
1️⃣5️⃣ Creative Direction: اقترح أسلوب التصوير، الإضاءة، نوع المونتاج، سرعة الإيقاع.

====================================
📌 قواعد:
لا تقدم نصائح عامة. فكر كرجل أعمال. قدم قرارات واضحة.
اجعل التقرير جاهز للتقديم لعميل يدفع مقابل الاستشارة.
لغة الإخراج: عربية احترافية منظمة بعناوين قوية باستخدام Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const generatedResult = response.text || '';
      setResult(generatedResult);
      
      if (onSaveHistory) {
        onSaveHistory({
          brandName,
          businessType,
          growthMarket,
          mainGoal,
          targetAudience,
          platforms,
          productionCapacity,
          contentType,
          adsBudget,
          strategyDuration,
          result: generatedResult
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء توليد الاستراتيجية: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('growth-pdf-content');
    if (!element) return;
    
    setIsDownloadingPDF(true);
    
    const opt = {
      margin:       15,
      filename:     'growth-strategy.pdf',
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

  return (
    <div className="space-y-8">
      <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors print:hidden">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
          <Target className="text-indigo-500 dark:text-indigo-400" size={24} />
          مدخلات الاستراتيجية الشاملة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">اسم البراند</label>
            <input 
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: SCG Agency"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">نوع النشاط</label>
            <input 
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="مثال: وكالة تسويق، مطعم، متجر ملابس..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الفئة المستهدفة</label>
            <textarea 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="مثال: أصحاب الشركات الصغيرة والمتوسطة، الشباب من 18-25 سنة..."
              className="w-full h-24 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">السوق أو الدولة</label>
            <input 
              type="text"
              value={growthMarket}
              onChange={(e) => setGrowthMarket(e.target.value)}
              placeholder="مثال: مصر، السعودية، دول الخليج..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">الهدف الرئيسي</label>
            <select 
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="زيادة مبيعات">زيادة مبيعات</option>
              <option value="انتشار (Brand Awareness)">انتشار (Brand Awareness)</option>
              <option value="توليد عملاء محتملين (Leads)">توليد عملاء محتملين (Leads)</option>
              <option value="بناء براند شخصي">بناء براند شخصي</option>
              <option value="بناء مجتمع (Community)">بناء مجتمع (Community)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">المنصات المستهدفة</label>
            <input 
              type="text"
              value={platforms}
              onChange={(e) => setPlatforms(e.target.value)}
              placeholder="مثال: انستجرام وتيك توك، جميع المنصات..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">نوع المحتوى المفضل</label>
            <select 
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="ميكس (ريلز وتصميمات)">ميكس (ريلز وتصميمات)</option>
              <option value="ريلز وفيديوهات قصيرة فقط">ريلز وفيديوهات قصيرة فقط</option>
              <option value="تصميمات وصور فقط">تصميمات وصور فقط</option>
              <option value="فيديوهات طويلة (يوتيوب)">فيديوهات طويلة (يوتيوب)</option>
              <option value="محتوى نصي (ثريدز وتويتر)">محتوى نصي (ثريدز وتويتر)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">قدرة الإنتاج</label>
            <select 
              value={productionCapacity}
              onChange={(e) => setProductionCapacity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="موبايل فقط">موبايل فقط</option>
              <option value="تصوير بسيط (كاميرا وإضاءة بسيطة)">تصوير بسيط (كاميرا وإضاءة بسيطة)</option>
              <option value="فريق احترافي (معدات كاملة)">فريق احترافي (معدات كاملة)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">ميزانية الإعلانات</label>
            <select 
              value={adsBudget}
              onChange={(e) => setAdsBudget(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="بدون ميزانية (Organic)">بدون ميزانية (Organic)</option>
              <option value="منخفضة">منخفضة</option>
              <option value="متوسطة">متوسطة</option>
              <option value="عالية">عالية</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">مدة الاستراتيجية</label>
            <select 
              value={strategyDuration}
              onChange={(e) => setStrategyDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="1 شهر">1 شهر</option>
              <option value="3 أشهر">3 أشهر</option>
              <option value="6 أشهر">6 أشهر</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-100 dark:border-red-900/50">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                جاري بناء الاستراتيجية الشاملة...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                توليد استراتيجية النمو
              </>
            )}
          </button>
        </div>
      </section>

      {result && (
        <section className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-10 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Target className="text-indigo-600 dark:text-indigo-400" size={28} />
              استراتيجية النمو الشاملة
            </h2>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloadingPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-xl transition-colors disabled:opacity-70"
            >
              {isDownloadingPDF ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              تحميل PDF
            </button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
            <Markdown>{result}</Markdown>
          </div>
        </section>
      )}

      {/* Hidden PDF Content */}
      <div className="absolute top-0 right-0 -z-50 opacity-0 pointer-events-none w-[800px]">
        <div id="growth-pdf-content" className="p-8 w-full" dir="rtl" style={{ boxSizing: "border-box", fontFamily: "'Cairo', sans-serif", backgroundColor: "#ffffff", color: "#000000", textAlign: "right", direction: "rtl", overflowWrap: "break-word" }}>
          <h1 className="text-4xl font-black mb-2 text-center" style={{ color: "#000000" }}>استراتيجية النمو الشاملة</h1>
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "#4f46e5" }}>{brandName}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-12 p-6 rounded-2xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div><strong style={{ color: "#000000" }}>نوع النشاط:</strong> {businessType}</div>
            <div><strong style={{ color: "#000000" }}>السوق:</strong> {growthMarket}</div>
            <div><strong style={{ color: "#000000" }}>الهدف:</strong> {mainGoal}</div>
            <div><strong style={{ color: "#000000" }}>المنصات:</strong> {platforms}</div>
          </div>

          <div className="prose max-w-none" style={{ color: "#000000" }}>
            <Markdown>{result}</Markdown>
          </div>
        </div>
      </div>
    </div>
  );
}
