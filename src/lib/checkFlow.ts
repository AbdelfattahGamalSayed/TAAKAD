export type ContextQuestion = 'hasAccount' | 'requestedReset';
export type ContextAnswer = 'yes' | 'no' | 'not_sure' | 'skipped';
export type CheckContext = Partial<Record<ContextQuestion, ContextAnswer>>;

// Only chooses optional questions locally. It never assigns or changes a risk score.
export function relevantQuestions(text: string): ContextQuestion[] {
  const normalized = text.normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g, '').toLowerCase();
  const reset = /(?:reset|recover|change)[\s\S]{0,45}password|password[\s\S]{0,45}(?:reset|recovery|change)|(?:إعادة تعيين|اعادة تعيين|استعادة|تغيير)[\s\S]{0,45}(?:كلمة المرور|كلمه المرور|كلمة السر)/i.test(normalized);
  const account = reset || /\b(?:account|bank|banking)\b|حساب|بنك|مصرف/i.test(normalized);
  return [...(account ? ['hasAccount' as const] : []), ...(reset ? ['requestedReset' as const] : [])];
}
export const flowCopy = {
  "en": {
    "choose": "Choose what to check",
    "pasteMessage": "Paste Text",
    "pasteLink": "Paste a link",
    "photo": "Check your screenshot",
    "review": "Check the words",
    "context": "A little more context",
    "confirm": "Ready to check",
    "next": "Next",
    "back": "Back",
    "skip": "Skip this question",
    "yes": "Yes",
    "no": "No",
    "not_sure": "Not sure",
    "skipped": "Skipped",
    "optional": "Optional. Answers do not prove the sender is genuine.",
    "hasAccount": "Do you have an account with the service mentioned in this message?",
    "requestedReset": "Did you ask to reset or change your password?",
    "continuePhoto": "Use this screenshot",
    "reviewHelp": "Fix any mistakes and remove private details. Check the spelling of links carefully.",
    "confirmHelp": "Check the message before sending.",
    "consent": "I agree to send this message, sender details and my answers to OpenAI to check for scams.",
    "edit": "Edit the message",
    "question": "Question",
    "of": "of",
    "message": "Message to check",
    "answers": "Your answers",
    "noAnswers": "No extra answers",
    "photoRead": "The photo has been read. You can go back to your edited text.",
    "confirmLimit": "This check may be wrong. It cannot confirm who sent the message.",
    "practice": "Practice messages",
    "remove": "Remove screenshot",
    "startOver": "Start a new check",
    "readStep": "Read the photo",
    "textStep": "Review the text",
    "contextStep": "Add context",
    "checkStep": "Get a result"
  },
  "ar": {
    "choose": "اختر ما تريد فحصه",
    "pasteMessage": "الصق نصاً",
    "pasteLink": "الصق رابطاً",
    "photo": "راجع لقطة الشاشة",
    "review": "راجع الكلمات",
    "context": "قليل من المعلومات الإضافية",
    "confirm": "جاهز للتحقق",
    "next": "التالي",
    "back": "رجوع",
    "skip": "تخطَّ هذا السؤال",
    "yes": "نعم",
    "no": "لا",
    "not_sure": "لست متأكداً",
    "skipped": "تم التخطي",
    "optional": "اختياري. الإجابات لا تؤكد هوية المرسل.",
    "hasAccount": "هل لديك حساب لدى الخدمة المذكورة في الرسالة؟",
    "requestedReset": "هل طلبت إعادة تعيين كلمة المرور أو تغييرها؟",
    "continuePhoto": "استخدم هذه الصورة",
    "reviewHelp": "صحّح الأخطاء واحذف المعلومات الخاصة. راجع كتابة الروابط بعناية.",
    "confirmHelp": "راجع الرسالة قبل إرسالها.",
    "consent": "أوافق على إرسال الرسالة وبيانات المرسل وإجاباتي إلى OpenAI للتحقق من الاحتيال.",
    "edit": "تعديل الرسالة",
    "question": "السؤال",
    "of": "من",
    "message": "الرسالة التي سنفحصها",
    "answers": "إجاباتك",
    "noAnswers": "لا توجد إجابات إضافية",
    "photoRead": "تمت قراءة الصورة. يمكنك العودة إلى النص الذي عدّلته.",
    "confirmLimit": "قد يخطئ هذا الفحص. لا يمكنه تأكيد هوية المرسل.",
    "practice": "رسائل للتجربة",
    "remove": "إزالة الصورة",
    "startOver": "بدء فحص جديد",
    "readStep": "قراءة الصورة",
    "textStep": "مراجعة النص",
    "contextStep": "إضافة معلومات",
    "checkStep": "عرض النتيجة"
  }
};
