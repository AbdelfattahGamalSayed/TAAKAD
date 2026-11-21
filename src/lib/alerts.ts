import Constants from 'expo-constants';
import { apiOrigin } from './api';
export type AlertItem={id:string;title:string;excerpt:string;url:string;publishedAt:string;locale:string;publisher:string;older:boolean;stale:boolean};
export type AlertFeed={items:AlertItem[];sources:{id:string;category:string;status:'ready'|'stale'|'unavailable';lastSuccessAt:string|null}[];refreshing:boolean;checkedAt:string|null;nextCheckAt:string|null;recentCount:number;permissionUrl:string;publisherCount:number};
export async function getAlerts(locale:string,signal:AbortSignal):Promise<AlertFeed>{
 const response=await fetch(apiOrigin()+'/api/alerts?locale='+locale,{headers:{Authorization:'Bearer '+(Constants.expoConfig?.extra?.developmentToken||'')},signal});
 if(!response.ok)throw Error('ALERTS_UNAVAILABLE');
 return response.json();
}
export const alertsCopy = {
  "en": {
    "tab": "Alerts",
    "eyebrow": "",
    "title": "Scam and safety updates",
    "intro": "Updates from Abu Dhabi Media Office.",
    "scope": "These updates come from one official UAE source: Abu Dhabi Media Office.",
    "refresh": "Refresh",
    "loading": "Looking for updates…",
    "offline": "Cannot load updates. Check your internet, then tap Refresh.",
    "empty": "There are no matching updates to show. This does not mean there are no scams.",
    "noRecent": "No new updates in the past 30 days. Older updates are shown below.",
    "partial": "Some updates could not be loaded. Try refreshing later.",
    "stale": "This saved update may be out of date.",
    "older": "Earlier update",
    "update": "Official update",
    "published": "Published",
    "checked": "Last check",
    "next": "Next source check",
    "open": "Read official source",
    "permission": "About the source",
    "note": "These updates are for awareness. They do not confirm that you are being targeted.",
    "frequency": "We check the source about once an hour while the service is running. Refresh shows what is available.",
    "all": "All updates",
    "recent": "Past 30 days",
    "linkError": "Could not open the article. Check your internet and try again.",
    "excerpt": "From the article",
    "ready": "Available",
    "unavailable": "Unavailable",
    "cached": "Older copy",
    "security": "Security",
    "technology": "Technology",
    "community": "Community"
  },
  "ar": {
    "tab": "التنبيهات",
    "eyebrow": "",
    "title": "مستجدات الاحتيال والأمان",
    "intro": "مستجدات من مكتب أبوظبي الإعلامي.",
    "scope": "تأتي هذه المستجدات من مصدر إماراتي رسمي واحد: مكتب أبوظبي الإعلامي.",
    "refresh": "تحديث",
    "loading": "نبحث عن المستجدات…",
    "offline": "تعذّر تحميل المستجدات. تحقّق من الإنترنت ثم اضغط «تحديث».",
    "empty": "لا توجد مستجدات مطابقة لعرضها. هذا لا يعني عدم وجود احتيال.",
    "noRecent": "لا توجد مستجدات خلال آخر ٣٠ يوماً. تظهر المستجدات الأقدم أدناه.",
    "partial": "تعذّر تحميل بعض المستجدات. حاول التحديث لاحقاً.",
    "stale": "قد تكون هذه النسخة المحفوظة قديمة.",
    "older": "مستجد سابق",
    "update": "مستجد رسمي",
    "published": "تاريخ النشر",
    "checked": "آخر فحص",
    "next": "فحص المصادر التالي",
    "open": "قراءة المصدر الرسمي",
    "permission": "عن المصدر",
    "note": "هذه المستجدات للتوعية. لا تعني أنك تتعرض لهجوم.",
    "frequency": "نفحص المصدر كل ساعة تقريباً أثناء تشغيل الخدمة. يعرض التحديث ما هو متاح.",
    "all": "جميع المستجدات",
    "recent": "آخر ٣٠ يوماً",
    "linkError": "تعذّر فتح المقال. تحقّق من الإنترنت وحاول مجدداً.",
    "excerpt": "من المقال",
    "ready": "متاحة",
    "unavailable": "غير متاحة",
    "cached": "نسخة أقدم",
    "security": "الأمن",
    "technology": "التكنولوجيا",
    "community": "المجتمع"
  }
};
