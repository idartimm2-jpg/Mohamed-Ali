import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Image as ImageIcon, FileText, Upload, X, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { PostIdea } from '../types';

interface PostCardProps {
  idea: PostIdea;
  index: number;
  brief: string;
  dialect: string;
  tone: string;
  reelFormat?: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  script?: string;
  onScriptChange?: (script: string) => void;
  imageUrls?: string[];
  onImageUrlsChange?: (urls: string[]) => void;
}

export function PostCard({ 
  idea, 
  index, 
  brief, 
  dialect, 
  tone, 
  reelFormat,
  isSelected, 
  onToggleSelect,
  script = '',
  onScriptChange,
  imageUrls = [],
  onImageUrlsChange
}: PostCardProps) {
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState('');
  
  const [hasText, setHasText] = useState(false);
  const [brandColor, setBrandColor] = useState('#FF5733');
  const [logoPosition, setLogoPosition] = useState('أعلى اليمين');
  const [carouselCount, setCarouselCount] = useState(1);
  const [imageMood, setImageMood] = useState('فخم وأنيق (Luxury & Elegant)');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [customImagePrompt, setCustomImagePrompt] = useState('');
  const [scriptModel, setScriptModel] = useState('gemini-3-flash-preview');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6', '#E74C3C', '#34495E', '#1ABC9C', '#000000', '#FFFFFF'];

  const imageMoods = [
    'فخم وأنيق (Luxury & Elegant)',
    'داكن ودرامي (Dark & Dramatic)',
    'مشرق وحيوي (Bright & Vibrant)',
    'بسيط وهادئ (Minimalist & Clean)',
    'مستقبلي وحديث (Futuristic & Modern)',
    'كلاسيكي وعتيق (Vintage & Retro)',
    'طبيعي وعضوي (Natural & Organic)',
    'سينمائي (Cinematic)'
  ];

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    if (onScriptChange) onScriptChange('');
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey as string });
      const response = await ai.models.generateContent({
        model: scriptModel,
        contents: `بناءً على فكرة المنشور التالية للعلامة التجارية (${brief})، قم بكتابة اسكريبت فيديو ريلز (Reels) كتابي فقط لما سيتم قوله (بدون وصف مشاهد بصرية).
اللهجة: ${dialect}
الأسلوب: ${tone}
طريقة التقديم: ${reelFormat || 'تلقائي'}
الفكرة: ${idea.title} - ${idea.description}

⚠️ **هام جداً: استخدم أسلوب "الكتابة الفيروسية" (Viral Writing) لضمان أقصى قدر من الانتشار والاحتفاظ بالمشاهد (High Retention).**

يجب أن يكون الاسكريبت مقسماً بوضوح إلى:
1. خطاف فيروسي (Viral Hook): جملة صادمة، مثيرة للفضول، أو تحل مشكلة عميقة في أول 3 ثوانٍ لجذب الانتباه فوراً ومنع المشاهد من التمرير.
2. المحتوى (Body): صلب الموضوع والشرح بأسلوب سريع الإيقاع (Fast-paced)، جذاب، ويحافظ على انتباه المشاهد في كل ثانية.
3. دعوة لاتخاذ إجراء (CTA): طلب تفاعل، مشاركة، أو شراء في النهاية بطريقة ذكية ومحفزة.

قم بتنسيق المخرجات باستخدام Markdown لتكون واضحة وسهلة القراءة.
`,
      });
      if (onScriptChange) onScriptChange(response.text || '');
    } catch (err) {
      console.error(err);
      if (onScriptChange) onScriptChange('حدث خطأ أثناء توليد الاسكريبت.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          setProductImage(file);
          setProductImagePreview(reader.result as string);
        } else {
          setLogoImage(file);
          setLogoImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    if (onImageUrlsChange) onImageUrlsChange([]);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey as string });
      
      const count = idea.format.includes('كاروسيل') ? carouselCount : 1;
      const newUrls: string[] = [];

      for (let i = 0; i < count; i++) {
        let parts: any[] = [];
        
        if (productImagePreview && productImage) {
          parts.push({
            inlineData: {
              data: productImagePreview.split(',')[1],
              mimeType: productImage.type,
            },
          });
        }
        
        if (logoImagePreview && logoImage) {
          parts.push({
            inlineData: {
              data: logoImagePreview.split(',')[1],
              mimeType: logoImage.type,
            },
          });
        }

        const promptText = `قم بتوليد صورة إعلانية جذابة وعالية الجودة لهذه الفكرة: ${idea.title}. الوصف: ${idea.description}. الأسلوب: ${tone}. 
المزاج العام (Mood) للصورة يجب أن يكون: ${imageMood}.
${hasText ? 'أضف نصوص إعلانية مناسبة داخل الصورة.' : 'بدون أي نصوص مكتوبة في الصورة.'}
اللون الأساسي للعلامة التجارية هو: ${brandColor}. اجعل هذا اللون بارزاً في التصميم.
${logoImage ? `ضع الشعار المرفق في ${logoPosition}.` : ''}
${count > 1 ? `هذه هي الصورة رقم ${i + 1} من سلسلة كاروسيل مكونة من ${count} صور.` : ''}
${customImagePrompt ? `تعليمات إضافية من المستخدم: ${customImagePrompt}` : ''}
`;

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: imageModel,
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any
            }
          }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            newUrls.push(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
      
      if (newUrls.length === 0) {
        throw new Error('لم يتم إرجاع صورة من النموذج.');
      }
      if (onImageUrlsChange) onImageUrlsChange(newUrls);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء توليد الصورة.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-html2canvas-ignore={!isSelected}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700'} overflow-hidden transition-colors print:shadow-none print:border-slate-300 print:break-inside-avoid ${!isSelected ? 'print:hidden' : ''}`}
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold text-sm shrink-0 print:bg-indigo-100 print:text-indigo-700">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white print:text-black">{idea.title}</h3>
            </div>
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full mb-4 print:bg-slate-100 print:text-slate-800">
              {idea.format}
            </span>
          </div>
          {onToggleSelect && (
            <div className="print:hidden shrink-0" data-html2canvas-ignore="true">
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={onToggleSelect} 
                className="w-6 h-6 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
              />
            </div>
          )}
        </div>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-300 print:text-slate-800">
          <p className="leading-relaxed"><strong className="text-slate-800 dark:text-white print:text-black">الوصف:</strong> {idea.description}</p>
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 print:bg-slate-50 print:border-slate-200">
            <strong className="text-slate-800 dark:text-white print:text-black block mb-2">الكابشن المقترح:</strong>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{idea.caption}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 print:hidden" data-html2canvas-ignore="true">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-medium rounded-xl transition-colors disabled:opacity-70"
            >
              {isGeneratingScript ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
              توليد اسكريبت ريلز (كتابي)
            </button>
            <select
              value={scriptModel}
              onChange={(e) => setScriptModel(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="gemini-3-flash-preview">Gemini 3 Flash (سريع ومجاني)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (احترافي ومجاني)</option>
            </select>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ImageIcon size={18} />
              إعدادات توليد الصورة
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">النصوص في الصورة</label>
                <select 
                  value={hasText ? 'yes' : 'no'}
                  onChange={(e) => setHasText(e.target.value === 'yes')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="no">بدون نصوص</option>
                  <option value="yes">مع نصوص إعلانية</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">مود الصورة (Mood)</label>
                <select 
                  value={imageMood}
                  onChange={(e) => setImageMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {imageMoods.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              {idea.format.includes('كاروسيل') && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">أبعاد الصورة</label>
                    <select 
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="1:1">مربع (1:1)</option>
                      <option value="3:4">عمودي (3:4)</option>
                      <option value="4:3">أفقي (4:3)</option>
                      <option value="9:16">ستوري/ريلز (9:16)</option>
                      <option value="16:9">يوتيوب/شاشة (16:9)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">عدد صور الكاروسيل</label>
                    <input 
                      type="number" 
                      min="2" max="10"
                      value={carouselCount}
                      onChange={(e) => setCarouselCount(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">اللون العام للبراند</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setBrandColor(c)}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ backgroundColor: c, borderColor: brandColor === c ? '#4f46e5' : 'transparent' }}
                    >
                      {brandColor === c && <Check size={14} color={c === '#FFFFFF' ? '#000' : '#FFF'} />}
                    </button>
                  ))}
                  <input 
                    type="color" 
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">إرفاق صورة منتج</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'product')} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm">
                  <Upload size={16} /> {productImage ? 'تغيير الصورة' : 'إرفاق منتج'}
                </button>
                {productImagePreview && <img src={productImagePreview} alt="Product" className="w-12 h-12 rounded object-cover border border-slate-300 dark:border-slate-600 mt-2" />}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">إرفاق لوجو</label>
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} />
                <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm">
                  <Upload size={16} /> {logoImage ? 'تغيير اللوجو' : 'إرفاق لوجو'}
                </button>
                {logoImagePreview && (
                  <div className="mt-2 space-y-2">
                    <img src={logoImagePreview} alt="Logo" className="w-12 h-12 rounded object-contain bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
                    <select 
                      value={logoPosition}
                      onChange={(e) => setLogoPosition(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="أعلى اليمين">أعلى اليمين</option>
                      <option value="أعلى اليسار">أعلى اليسار</option>
                      <option value="أسفل اليمين">أسفل اليمين</option>
                      <option value="أسفل اليسار">أسفل اليسار</option>
                      <option value="المنتصف">المنتصف</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">تعليمات إضافية للصورة (اختياري)</label>
                <textarea 
                  value={customImagePrompt}
                  onChange={(e) => setCustomImagePrompt(e.target.value)}
                  placeholder="مثال: أريد أن تظهر القهوة على طاولة خشبية مع إضاءة شمس دافئة..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none h-20"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">نموذج توليد الصور</label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="gemini-2.5-flash-image">نانو بنانا 1 (مجاني وسريع)</option>
                  <option value="gemini-3.1-flash-image-preview">نانو بنانا 2 (جودة عالية - يتطلب مفتاح API مدفوع)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors disabled:opacity-70"
              >
                {isGeneratingImage ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
                توليد {idea.format.includes('كاروسيل') ? `${carouselCount} صور` : 'صورة'} بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        </div>

        {/* Script Result */}
        <AnimatePresence>
          {script && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden print:mt-4"
            >
              <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 dark:text-slate-300 p-6 rounded-2xl relative print:bg-white print:text-black print:border print:border-slate-200 print:p-4">
                <button 
                  onClick={() => onScriptChange && onScriptChange('')}
                  data-html2canvas-ignore="true"
                  className="absolute top-4 left-4 p-1.5 bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-300 dark:text-slate-400 print:hidden"
                >
                  <X size={16} />
                </button>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-300 dark:text-indigo-400 print:text-indigo-700">
                  <FileText size={20} />
                  اسكريبت الريلز
                </h4>
                <div className="markdown-body text-sm leading-relaxed prose prose-invert max-w-none print:prose-slate">
                  <Markdown>{script}</Markdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Result */}
        <AnimatePresence>
          {imageUrls.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden print:mt-4 print:break-inside-avoid"
            >
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl relative border border-slate-200 dark:border-slate-700 print:bg-white print:border-slate-200">
                <button 
                  onClick={() => onImageUrlsChange && onImageUrlsChange([])}
                  data-html2canvas-ignore="true"
                  className="absolute top-4 left-4 p-1.5 bg-white dark:bg-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg transition-colors text-slate-600 dark:text-slate-300 z-10 print:hidden"
                >
                  <X size={16} />
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 print:mt-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <img src={url} alt={`Generated ${i}`} className="max-w-full h-auto rounded-xl shadow-md print:shadow-none" />
                      <a 
                        href={url} 
                        download={`post-image-${index + 1}-${i + 1}.png`}
                        data-html2canvas-ignore="true"
                        className="mt-3 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium shadow-sm w-full text-center print:hidden"
                      >
                        تحميل الصورة {imageUrls.length > 1 ? i + 1 : ''}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
