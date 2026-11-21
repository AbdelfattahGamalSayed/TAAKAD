export const featureCopy = {
 en: {
  prepared:'Review your screenshot', chooseCrop:'Choose & crop (optional)', cropOptional:'Cropping is optional. Without cropping, the whole image is used.', loadingPhoto:'Opening photo…', extract:'Read screenshot text', extractConsent:'I checked this screenshot and agree to send it to OpenAI to read its text.',
  review:'2 · Review the extracted text', reviewHelp:'Correct mistakes, especially links and sender details. Remove any remaining private information. Only this edited text and sender will be sent for risk analysis.',
  reviewed:'I reviewed the message and sender and agree to send this edited text to OpenAI for analysis.',
  unclear:'Some text could not be read reliably. Correct it or paste the message before continuing.',
  reading:'Reading the screenshot…', evidence:'What raised concern', quality:'Visible evidence', limited:'Limited', moderate:'Moderate', strong:'Strong',
  scale:'The score is a warning level, not a probability. A low score does not prove a message is safe.',
  links:'Independent link checks', listed:'Reported in the phishing feed', not_listed:'No exact hostname match in this feed', unavailable:'Reputation check unavailable',
  linkLimit:'A feed report can be wrong or outdated. No match does not mean safe. We do not open links or authenticate senders.',
  refreshed:'Feed downloaded', stale:'Cached feed · refresh failed', source:'Source: Phishing.Database', lexical:'Link structure clues (not proof of fraud)', aiScore:'AI message score', overall:'Overall score includes feed evidence.',
  recovery:'I already clicked', recoveryTitle:'Take the next safe step', recoveryIntro:'Select what happened. More than one option may apply. Use a trusted app or independently found official contact details, never contact details from the suspicious message.',
  opened:'I opened a link', password:'I entered a password', otp:'I shared a verification code', payment:'I paid or shared card details', check:'Mark steps as done. This checklist is temporary and is not saved.',
  sourceTitle:'Guidance sources', back:'Back', noRisk:'Not enough information',
  signals:{ unencrypted_http:'Uses HTTP without encryption',credentials_in_url:'The name before @ is not the destination host',internationalized_domain:'Internationalized domain: compare the spelling carefully',ip_address_host:'Uses an IP address instead of a named domain',shortened_link:'Shortened link hides the final destination',many_subdomains:'Several subdomains can obscure the actual domain',unusual_port:'Uses a non-default port' }
 },
 ar: {
  prepared:'راجع لقطة الشاشة',chooseCrop:'اختيار واقتصاص (اختياري)',cropOptional:'الاقتصاص اختياري. دون اقتصاص، تُستخدم الصورة كاملة.',loadingPhoto:'جارٍ فتح الصورة…',extract:'قراءة نص الصورة',extractConsent:'راجعت لقطة الشاشة وأوافق على إرسالها إلى OpenAI لقراءة النص.',
  review:'٢ · راجع النص المستخرج',reviewHelp:'صحّح الأخطاء، خاصة الروابط وبيانات المرسل. احذف أي معلومات خاصة متبقية. سيُرسل هذا النص المعدّل واسم المرسل فقط لتحليل المخاطر.',
  reviewed:'راجعت الرسالة والمرسل وأوافق على إرسال النص المعدّل إلى OpenAI للتحليل.',
  unclear:'تعذّرت قراءة بعض النص بوضوح. صحّحه أو الصق الرسالة قبل المتابعة.',reading:'جارٍ قراءة الصورة…',
  evidence:'ما الذي أثار القلق',quality:'الأدلة الظاهرة',limited:'محدودة',moderate:'متوسطة',strong:'قوية',scale:'الدرجة مستوى تحذير وليست احتمالاً إحصائياً. الدرجة المنخفضة لا تثبت أمان الرسالة.',
  links:'فحوص مستقلة للروابط',listed:'ورد بلاغ عنه في قائمة التصيد',not_listed:'لا يوجد تطابق تام للنطاق في هذه القائمة',unavailable:'فحص السمعة غير متاح',
  linkLimit:'قد يكون البلاغ خاطئاً أو قديماً. عدم وجود تطابق لا يعني الأمان. لا نفتح الروابط ولا نثبت هوية المرسل.',
  refreshed:'تاريخ تنزيل القائمة',stale:'قائمة مخزنة · تعذّر التحديث',source:'المصدر: Phishing.Database',lexical:'مؤشرات في بنية الرابط (ليست دليلاً قاطعاً)',aiScore:'تقييم الذكاء الاصطناعي للرسالة',overall:'تشمل الدرجة الإجمالية أدلة قائمة التصيد.',
  recovery:'لقد ضغطت بالفعل',recoveryTitle:'اتخذ الخطوة الآمنة التالية',recoveryIntro:'اختر ما حدث. قد ينطبق أكثر من خيار. استخدم تطبيقاً موثوقاً أو بيانات اتصال رسمية وجدتها بشكل مستقل، وليس بيانات الرسالة المشبوهة.',
  opened:'فتحت رابطاً',password:'أدخلت كلمة مرور',otp:'شاركت رمز تحقق',payment:'دفعت أو شاركت بيانات بطاقة',check:'ضع علامة على الخطوات المنجزة. هذه القائمة مؤقتة ولا تُحفظ.',sourceTitle:'مصادر الإرشادات',back:'رجوع',noRisk:'المعلومات غير كافية',
  signals:{unencrypted_http:'يستخدم HTTP دون تشفير',credentials_in_url:'الاسم قبل @ ليس نطاق الوجهة',internationalized_domain:'نطاق دولي: قارن التهجئة بعناية',ip_address_host:'يستخدم عنوان IP بدلاً من اسم نطاق',shortened_link:'رابط مختصر يخفي الوجهة النهائية',many_subdomains:'قد تخفي النطاقات الفرعية الكثيرة النطاق الحقيقي',unusual_port:'يستخدم منفذاً غير افتراضي'}
 }
};
export const recoverySteps = {
 en: {
 opened:['Close the page. Do not enter information, accept prompts, download files or return through that link. Opening a link alone does not prove your device was compromised.','Update your browser and operating system. If you downloaded or installed anything, stop using it and seek help from trusted device support or your IT team.','If you also entered a password, shared a code or paid, follow the matching checklist below.'],
 password:['Open the real service through its trusted app or an independently verified address. Change the exposed password and any other accounts that reused it.','Sign out other sessions and remove unfamiliar devices or access. Enable multi-factor authentication. If locked out, use the service’s official account recovery.','Check account activity and recovery details. Secure your email account too if its password was exposed.'],
 otp:['Contact the affected service immediately through its trusted app or independently verified support. If the code related to a payment or bank account, contact the bank urgently.','Tell support which action the code authorized. Ask them to secure the account, end unauthorized sessions and review recent activity or transactions.','Do not share another code or approve new prompts. Change exposed passwords through the real service.'],
 payment:['Contact your bank or payment provider immediately using its official app or the number on your card. Explain the suspected fraud and ask about freezing the card/account and disputing or recalling the payment. Recovery is not guaranteed.','Keep the original message, receipts, transaction references and dates as evidence. Ask the provider about the appropriate local reporting route.','Watch for further transactions and follow the provider’s advice. Be wary of anyone demanding a fee to recover lost money.']
 },
 ar: {
 opened:['أغلق الصفحة. لا تدخل معلومات ولا توافق على طلبات ولا تنزّل ملفات ولا تعد عبر الرابط. فتح الرابط وحده لا يثبت اختراق جهازك.','حدّث المتصفح ونظام التشغيل. إذا نزّلت أو ثبّتّ شيئاً، توقّف عن استخدامه واطلب مساعدة الدعم الموثوق لجهازك أو فريق تقنية المعلومات.','إذا أدخلت كلمة مرور أو شاركت رمزاً أو دفعت، اتبع أيضاً القائمة المناسبة أدناه.'],
 password:['افتح الخدمة الحقيقية عبر تطبيقها الموثوق أو عنوان تحققت منه بشكل مستقل. غيّر كلمة المرور المكشوفة وكلمات مرور الحسابات التي تعيد استخدامها.','سجّل خروج الجلسات الأخرى وأزل الأجهزة أو الصلاحيات غير المعروفة. فعّل التحقق متعدد العوامل. إذا فقدت الوصول فاستخدم استرداد الحساب الرسمي.','راجع نشاط الحساب وبيانات الاسترداد. أمّن بريدك الإلكتروني أيضاً إذا كُشفت كلمة مروره.'],
 otp:['اتصل بالخدمة المعنية فوراً عبر تطبيقها الموثوق أو دعم تحققت منه بشكل مستقل. إذا تعلق الرمز بدفع أو حساب مصرفي، اتصل بالبنك بشكل عاجل.','وضّح للدعم العملية التي أجازها الرمز. اطلب تأمين الحساب وإنهاء الجلسات غير المصرح بها ومراجعة النشاط أو المعاملات الأخيرة.','لا تشارك رمزاً آخر ولا توافق على طلبات جديدة. غيّر كلمات المرور المكشوفة عبر الخدمة الحقيقية.'],
 payment:['اتصل بالبنك أو مزوّد الدفع فوراً عبر تطبيقه الرسمي أو الرقم على بطاقتك. اشرح الاشتباه بالاحتيال واسأل عن تجميد البطاقة أو الحساب والاعتراض على الدفع أو استرجاعه. الاسترداد غير مضمون.','احتفظ بالرسالة الأصلية والإيصالات ومراجع المعاملات والتواريخ كأدلة. اسأل المزوّد عن جهة الإبلاغ المحلية المناسبة.','راقب المعاملات اللاحقة واتبع إرشادات المزوّد. احذر ممن يطلب رسوماً لاستعادة الأموال المفقودة.']
 }
};
