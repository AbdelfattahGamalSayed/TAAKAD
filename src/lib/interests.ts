export type Interest='all'|'messages'|'money'|'accounts';
export const interests:Interest[]=['all','messages','money','accounts'];
export const interestCopy={en:{title:'Topics (optional)',hint:'Choose a topic, or see everything. Saved only on this device.',all:'All topics',messages:'Messages & calls',money:'Money & shopping',accounts:'Accounts & passwords',filtered:'Showing your chosen topic. Choose All topics for general updates.'},ar:{title:'المواضيع (اختياري)',hint:'اختر موضوعاً أو شاهد الكل. يُحفظ الاختيار على هذا الجهاز فقط.',all:'كل المواضيع',messages:'الرسائل والمكالمات',money:'المال والتسوّق',accounts:'الحسابات وكلمات المرور',filtered:'نعرض الموضوع الذي اخترته. اختر كل المواضيع للمستجدات العامة.'}};
export function matchesInterest(text:string,interest:Interest){
 if(interest==='all')return true;
 const words={messages:/message|sms|whatsapp|call|phish|رسائ|رسالة|واتساب|مكالم|تصيد|تصيّد/iu,money:/money|bank|pay|shop|card|parcel|delivery|مال|بنك|مصرف|دفع|تسوق|تسوّق|بطاق|شحن|توصيل/iu,accounts:/account|password|code|login|identity|حساب|مرور|رمز|رموز|دخول|هوي/iu};
 return words[interest].test(text);
}
