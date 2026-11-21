export type Category = 'all' | 'messages' | 'links' | 'accounts';
export const forumCopy = {
  "en": {
    "eyebrow": "",
    "title": "Learn from others",
    "subtitle": "See examples of scams and how to respond.",
    "preview": "Sample content only",
    "notice": "These are made-up examples, not real reports. You cannot post yet.",
    "search": "Search sample discussions",
    "all": "All topics",
    "messages": "Messages",
    "links": "Links",
    "accounts": "Accounts",
    "guide": "Before you share",
    "guideBody": "Leave out names, phone numbers, verification codes and payment details. Do not share clickable scam links.",
    "start": "Start a discussion",
    "coming": "Posting is not available yet",
    "comingBody": "You can read the examples for now. Nothing you type here will be posted.",
    "close": "Close preview",
    "login": "Sign-in coming soon",
    "member": "Sample member",
    "example": "Fictional example",
    "read": "Read discussion",
    "hide": "Hide discussion",
    "replies": "Sample replies",
    "helpful": "Helpful · preview",
    "marked": "Marked helpful · preview",
    "empty": "No matching sample discussions",
    "reset": "Reset filters",
    "footer": "This preview does not send or save your posts."
  },
  "ar": {
    "eyebrow": "",
    "title": "تعلّم من الآخرين",
    "subtitle": "أمثلة على الاحتيال وكيفية التعامل معه.",
    "preview": "محتوى تجريبي فقط",
    "notice": "هذه أمثلة غير حقيقية وليست بلاغات. النشر غير متاح بعد.",
    "search": "ابحث في النقاشات التجريبية",
    "all": "كل المواضيع",
    "messages": "الرسائل",
    "links": "الروابط",
    "accounts": "الحسابات",
    "guide": "قبل أن تشارك",
    "guideBody": "احذف الأسماء وأرقام الهواتف ورموز التحقق وبيانات الدفع. لا تشارك روابط احتيالية قابلة للنقر.",
    "start": "ابدأ نقاشاً",
    "coming": "النشر غير متاح بعد",
    "comingBody": "يمكنك قراءة الأمثلة الآن. لن يُنشر ما تكتبه هنا.",
    "close": "إغلاق المعاينة",
    "login": "تسجيل الدخول قريباً",
    "member": "عضو تجريبي",
    "example": "مثال خيالي",
    "read": "اقرأ النقاش",
    "hide": "إخفاء النقاش",
    "replies": "ردود تجريبية",
    "helpful": "مفيد · تجريبي",
    "marked": "تم تحديده كمفيد · تجريبي",
    "empty": "لا توجد نقاشات تجريبية مطابقة",
    "reset": "إعادة ضبط البحث",
    "footer": "لا ترسل هذه المعاينة منشوراتك ولا تحفظها."
  }
};
export const samplePosts: {id:string;category:Exclude<Category,"all">;author:{en:string;ar:string};en:{title:string;body:string;replies:string[]};ar:{title:string;body:string;replies:string[]}}[] = [
  {
    "id": "delivery",
    "category": "messages",
    "author": {
      "en": "Amal",
      "ar": "أمل"
    },
    "en": {
      "title": "A small delivery fee. A big warning sign?",
      "body": "A delivery message asks for a small fee, card details and a verification code. What should you do?",
      "replies": [
        "Open the delivery company’s official app to check the tracking number.",
        "Never share a verification code with someone who asks for it."
      ]
    },
    "ar": {
      "title": "رسوم توصيل بسيطة… وعلامة خطر كبيرة؟",
      "body": "تخيّل رسالة توصيل تطلب رسوماً بسيطة وبيانات البطاقة ورمز التحقق. ما الذي ستتحقق منه قبل الرد؟",
      "replies": [
        "افتح التطبيق الرسمي لشركة التوصيل للتحقق من رقم التتبع.",
        "لا تشارك رمز التحقق في رسالة أو مع متصل غير متوقع."
      ]
    }
  },
  {
    "id": "domain",
    "category": "links",
    "author": {
      "en": "Omar",
      "ar": "عمر"
    },
    "en": {
      "title": "The logo looks familiar. The link doesn’t.",
      "body": "A message copies a familiar logo but links to a different website. What should you check?",
      "replies": [
        "A logo can be copied. Check the full website name in the link.",
        "Open the official app independently for any sensitive request."
      ]
    },
    "ar": {
      "title": "الشعار مألوف، لكن الرابط ليس كذلك.",
      "body": "تستخدم رسالة تجريبية شعاراً مألوفاً لكن رابطها يشير إلى نطاق مختلف. كيف نساعد الآخرين على ملاحظة الفرق؟",
      "replies": [
        "يمكن نسخ الشعار. اقرأ النطاق الحقيقي ولا تكتفِ بكلمة مألوفة في الرابط.",
        "افتح التطبيق الرسمي بنفسك عند وجود طلب حساس."
      ]
    }
  },
  {
    "id": "account",
    "category": "accounts",
    "author": {
      "en": "Noor",
      "ar": "نور"
    },
    "en": {
      "title": "“Your account closes today.” Take a breath.",
      "body": "This example uses an urgent account-closure threat to request a password. What advice would help a family member pause and verify?",
      "replies": [
        "An urgent message is not proof that an account is really at risk.",
        "Contact the service through an app or number you already trust."
      ]
    },
    "ar": {
      "title": "«سيُغلق حسابك اليوم». خذ نفساً.",
      "body": "يستخدم هذا المثال تهديداً عاجلاً بإغلاق الحساب لطلب كلمة المرور. ما النصيحة التي تساعد فرداً من الأسرة على التمهّل والتحقق؟",
      "replies": [
        "الرسالة المستعجلة ليست دليلاً على أن الحساب في خطر فعلاً.",
        "تواصل مع الخدمة عبر تطبيق أو رقم موثوق لديك."
      ]
    }
  }
];
