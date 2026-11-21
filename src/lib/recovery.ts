export const recoveryQuestions = ['payment', 'card', 'otp', 'password', 'opened'] as const;
export type RecoveryQuestion = typeof recoveryQuestions[number];
export type RecoveryAnswer = 'yes' | 'no' | 'unsure';
export type RecoveryAnswers = Partial<Record<RecoveryQuestion, RecoveryAnswer>>;
export type RecoveryTopic = 'payment' | 'otp' | 'password' | 'opened' | 'protect';
export function recoveryTopics(answers: RecoveryAnswers): RecoveryTopic[] {
  const possible = (key: RecoveryQuestion) => answers[key] === 'yes' || answers[key] === 'unsure';
  const topics: RecoveryTopic[] = [];
  if (possible('payment') || possible('card')) topics.push('payment');
  if (possible('otp')) topics.push('otp');
  if (possible('password')) topics.push('password');
  if (possible('opened')) topics.push('opened');
  return [...topics, 'protect'];
}
export const helpSources = {
  aman: 'https://srv.adpolice.gov.ae/en/aman/Pages/contactus.aspx',
  scope: 'https://srv.adpolice.gov.ae/en/aman/pages/qa.aspx',
  apple: 'https://support.apple.com/guide/iphone/report-spam-and-block-senders-iph3f94d910d/ios',
  google: 'https://support.google.com/messages/answer/9061432?co=GENIE.Platform%3DAndroid&hl=en',
  whatsapp: 'https://faq.whatsapp.com/1142481766359885/',
} as const;
export const recoveryCopy = {
  en: {
    title: 'I already clicked or shared something', intro: 'We will help you choose your next steps. You do not need to enter private details.',
    local: 'Your answers stay on this screen. No AI request or police report is sent.', start: 'Help me take action',
    next: 'Next', back: 'Back', yes: 'Yes', no: 'No', unsure: 'Not sure', question: 'Question', of: 'of',
    questions: {payment:'Did you send money or approve a payment?', card:'Did you share your card number, expiry date or security code?', otp:'Did you share a verification code or approve a sign-in?', password:'Did you enter or share a password?', opened:'Did you open a link or install something from it?'},
    urgent: 'If money or card details may be involved, contact your bank or payment service now through its real app. You do not need to finish these questions first.',
    help: 'Official help', plan: 'Your next steps', step: 'Step', uncertain: 'You were not sure about some answers. Follow the steps that may apply, or ask the service to help you check.',
    titles: {payment:'Protect your money', otp:'Secure the account linked to the code', password:'Change the shared password', opened:'Close the suspicious page', protect:'Keep evidence, then block and report'},
    payment: ['Contact your bank or payment service now through its real app or a number you already trust. If card details were shared, ask the bank to freeze or replace the card.', 'Ask them to stop further payments and check whether a payment can be reversed. Recovery is not guaranteed. Keep receipts and watch for payments you did not make.', 'Do not pay anyone who promises to recover your money. If you were defrauded, contact the nearest police station.'],
    opened: ['Close the page. Do not enter details, download files or accept requests. Opening a link alone does not prove your phone was hacked.', 'Update your phone and browser. If you installed something or gave remote access, stop using it and ask the device maker or trusted support for help. Use another trusted device to secure accounts if needed.'],
    protect: ['Keep screenshots, sender details and payment receipts privately before deleting or reporting anything. Do not post private codes or card details.', 'Block the sender and report the message in the app. This does not file a police report or undo a payment. Do not reply or share more information.'],
    done: 'I have done this step', ticks: 'Ticks are reminders, not proof your account is secure. They are not saved.', finish:'Finish reviewing', end:'Keep checking your accounts', endHelp:'These steps cannot confirm that everything is safe. Contact the affected service if anything looks wrong.', edit:'Change my answers', guides:'How to block and report', guideIntro:'Choose the app you used.', illustration:'Simple illustrations. Your app may look different.', preserve:'Save evidence first. Reporting may remove the conversation or share recent messages with the app provider.',
    diagram: ['Sender or conversation', 'Block / Report', 'Read and confirm'],
    guideLabels: {whatsapp:'WhatsApp', apple:'iPhone Messages', google:'Google Messages'},
    guidesText: {
      whatsapp:['Open the chat and tap the sender’s name or number at the top.', 'Find Block or Report in the contact information. Choose the action you need.', 'Read the confirmation before continuing. Reporting shares recent messages with WhatsApp; check whether the chat will be deleted.'],
      apple:['Open the message and tap the sender at the top. Open their information and find Block Contact.', 'For an unknown sender, look for Report Junk or Report Spam when available. Read the confirmation before sending it.', 'Reporting does not always block the sender. Check blocking separately. Options depend on your iOS version and carrier.'],
      google:['In Google Messages, touch and hold the conversation.', 'Choose Block, then Report spam if offered. Read the confirmation and confirm your choice.', 'Reporting also blocks the sender and moves the chat to Spam & blocked. Other Android messaging apps may use different menus.'],
    },
    original:'Open the official instructions', helpTitle:'Get help from a real person', bank:'Money or card details involved? Contact your bank or payment provider first, through its real app or a trusted number.',
    aman:'Abu Dhabi Police — Aman', amanText:'Share information about a suspected scam. Aman is not the service for opening a formal criminal report.', call:'Open phone: 8002626', sms:'Open SMS: 2828', manual:'In the UAE: call 8002626 or text 2828. Outside the UAE: +971 8002626. No message is filled in or sent by this app.',
    police:'To make a formal criminal report, go to the nearest police station. Keep the messages and receipts.', emergency:'Immediate danger or an emergency in the UAE? Call 999. Aman is not an emergency service.', emergencyCall:'Open phone: 999', source:'Official contact details', scope:'About Aman and police reports', checked:'Official sources checked 21 November 2026. T2AKKAD is not a police service and does not send reports or arrange callbacks.',
    error:'Could not open this option. Use the number shown in your Phone or Messages app, or open the official website in your browser.', home:'Back to Check',
  },
  ar: {
    title:'لقد ضغطت أو شاركت شيئاً بالفعل', intro:'سنساعدك على اختيار الخطوات التالية. لا تحتاج إلى إدخال معلومات خاصة.',
    local:'تبقى إجاباتك في هذه الشاشة. لا نرسلها للذكاء الاصطناعي ولا نقدّم بلاغاً للشرطة.', start:'ساعدني على التصرف',
    next:'التالي', back:'رجوع', yes:'نعم', no:'لا', unsure:'لست متأكداً', question:'السؤال', of:'من',
    questions:{payment:'هل أرسلت مالاً أو وافقت على دفعة؟',card:'هل شاركت رقم بطاقتك أو تاريخ انتهائها أو رمز الأمان؟',otp:'هل شاركت رمز تحقق أو وافقت على تسجيل دخول؟',password:'هل أدخلت كلمة مرور أو شاركتها؟',opened:'هل فتحت رابطاً أو ثبّتّ شيئاً منه؟'},
    urgent:'إذا كان المال أو بيانات البطاقة قد تأثرا، تواصل مع بنكك أو خدمة الدفع الآن عبر التطبيق الرسمي. لا تحتاج إلى إنهاء الأسئلة أولاً.',
    help:'مساعدة رسمية', plan:'خطواتك التالية', step:'الخطوة', uncertain:'لم تكن متأكداً من بعض الإجابات. اتبع الخطوات التي قد تنطبق عليك أو اطلب من الخدمة مساعدتك على التحقق.',
    titles:{payment:'احمِ أموالك',otp:'أمّن الحساب المرتبط بالرمز',password:'غيّر كلمة المرور التي شاركتها',opened:'أغلق الصفحة المشبوهة',protect:'احتفظ بالأدلة ثم احظر وأبلغ'},
    payment:['تواصل مع بنكك أو خدمة الدفع الآن عبر التطبيق الرسمي أو رقم موثوق. إذا شاركت بيانات البطاقة، اطلب من البنك تجميدها أو استبدالها.','اطلب إيقاف المدفوعات الإضافية والتحقق من إمكانية إلغاء الدفعة. الاسترداد غير مضمون. احتفظ بالإيصالات وراقب أي مدفوعات لم تُجرها.','لا تدفع لمن يعدك باسترداد أموالك. إذا تعرضت للاحتيال، تواصل مع أقرب مركز شرطة.'],
    opened:['أغلق الصفحة. لا تدخل بيانات ولا تنزّل ملفات ولا توافق على طلبات. فتح الرابط وحده لا يثبت اختراق هاتفك.','حدّث هاتفك ومتصفحك. إذا ثبّتّ شيئاً أو منحت وصولاً عن بُعد، توقّف عن استخدامه واطلب مساعدة الشركة المصنّعة أو دعم موثوق. استخدم جهازاً آخر موثوقاً لتأمين حساباتك عند الحاجة.'],
    protect:['احتفظ بلقطات الشاشة وبيانات المرسل وإيصالات الدفع بشكل خاص قبل الحذف أو الإبلاغ. لا تنشر رموزاً خاصة أو بيانات بطاقة.','احظر المرسل وأبلغ عن الرسالة داخل التطبيق. هذا لا يقدّم بلاغاً للشرطة ولا يلغي دفعة. لا ترد ولا تشارك مزيداً من المعلومات.'],
    done:'أنجزت هذه الخطوة', ticks:'العلامات للتذكير وليست دليلاً على أمان حسابك. لا نحفظها.', finish:'إنهاء المراجعة',end:'واصل متابعة حساباتك',endHelp:'لا تؤكد هذه الخطوات أن كل شيء آمن. تواصل مع الخدمة المعنية إذا لاحظت أمراً غير معتاد.',edit:'تعديل إجاباتي',guides:'كيفية الحظر والإبلاغ',guideIntro:'اختر التطبيق الذي استخدمته.',illustration:'رسوم مبسّطة. قد يختلف شكل تطبيقك.',preserve:'احفظ الأدلة أولاً. قد يؤدي الإبلاغ إلى حذف المحادثة أو مشاركة الرسائل الأخيرة مع مزوّد التطبيق.',
    diagram:['المرسل أو المحادثة','حظر / إبلاغ','اقرأ ثم أكّد'],
    guideLabels:{whatsapp:'واتساب',apple:'رسائل iPhone',google:'رسائل Google'},
    guidesText:{
      whatsapp:['افتح المحادثة واضغط على اسم المرسل أو رقمه في الأعلى.','ابحث عن حظر أو إبلاغ في معلومات جهة الاتصال. اختر الإجراء المطلوب.','اقرأ رسالة التأكيد قبل المتابعة. يشارك الإبلاغ الرسائل الأخيرة مع واتساب؛ تحقّق مما إذا كانت المحادثة ستُحذف.'],
      apple:['افتح الرسالة واضغط على المرسل في الأعلى. افتح معلوماته وابحث عن حظر جهة الاتصال.','للمرسل المجهول، ابحث عن الإبلاغ عن رسالة مزعجة إن كان متاحاً. اقرأ التأكيد قبل الإرسال.','الإبلاغ لا يحظر المرسل دائماً. تحقّق من الحظر بشكل منفصل. تختلف الخيارات حسب إصدار iOS وشركة الاتصالات.'],
      google:['في رسائل Google، اضغط مطولاً على المحادثة.','اختر حظر، ثم الإبلاغ عن رسالة غير مرغوب فيها إن ظهر الخيار. اقرأ التأكيد ثم أكّد اختيارك.','يحظر الإبلاغ المرسل أيضاً وينقل المحادثة إلى الرسائل غير المرغوب فيها والمحظورة. قد تختلف قوائم تطبيقات أندرويد الأخرى.'],
    },
    original:'فتح الإرشادات الرسمية',helpTitle:'احصل على مساعدة من شخص مختص',bank:'هل تأثر المال أو بيانات البطاقة؟ تواصل أولاً مع بنكك أو مزوّد الدفع عبر التطبيق الرسمي أو رقم موثوق.',
    aman:'شرطة أبوظبي — أمان',amanText:'شارك معلومات عن محاولة احتيال. أمان ليست خدمة لفتح بلاغ جنائي رسمي.',call:'فتح الهاتف: 8002626',sms:'فتح الرسائل: 2828',manual:'داخل الإمارات: اتصل على 8002626 أو أرسل رسالة إلى 2828. من خارج الإمارات: ‎+971 8002626. لا يكتب التطبيق رسالة أو يرسلها.',
    police:'لتقديم بلاغ جنائي رسمي، توجّه إلى أقرب مركز شرطة. احتفظ بالرسائل والإيصالات.',emergency:'خطر فوري أو حالة طارئة داخل الإمارات؟ اتصل على 999. أمان ليست خدمة طوارئ.',emergencyCall:'فتح الهاتف: 999',source:'بيانات الاتصال الرسمية',scope:'عن أمان والبلاغات',checked:'تم التحقق من المصادر الرسمية في 21 نوفمبر 2026. تأكّد ليس خدمة شرطة ولا يرسل بلاغات أو يرتّب معاودة الاتصال.',
    error:'تعذّر فتح هذا الخيار. استخدم الرقم الظاهر في تطبيق الهاتف أو الرسائل، أو افتح الموقع الرسمي في المتصفح.',home:'العودة للتحقق',
  },
};
