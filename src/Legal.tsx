import { contact, content } from './content';
import type { Locale } from './locale';
import { PageHeading } from './Pages';

export type LegalPage = 'privacy' | 'terms' | 'accessibility';

const legal = {
  he: {
    note: 'טיוטה לתצוגה מקומית בלבד. לפני פרסום נדרשת בדיקה ואישור של המשרד בהתאם לאתר הסופי ולדין החל.',
    privacy: [
      ['פרטיות כברירת מחדל', 'בגרסה המקומית הזו אין כלי מעקב, כלי אנליטיקה, פיקסלים פרסומיים או מפות חיצוניות מוטמעות. הגופנים והאיורים נטענים מתוך האתר עצמו.'],
      ['השפה שלכם', 'האתר משתמש באזור הזמן ובשפת הדפדפן כהערכה בלבד לבחירת עברית או אנגלית. הוא אינו ניגש למיקום GPS ואינו פונה לשירות זיהוי כתובת IP. בחירה ידנית נשמרת בדפדפן תחת zarabi-language. ניתן למחוק אותה דרך הגדרות נתוני האתר בדפדפן.'],
      ['טופס הפנייה', 'הטופס מכין טיוטת דוא״ל בזיכרון הדף בלבד. הוא אינו שולח פנייה לשרת ואינו שומר את פרטי הפנייה בדפדפן. המידע יימסר לספק הדוא״ל שלכם רק אם תבחרו לפתוח ולשלוח את הטיוטה באמצעות תוכנת הדוא״ל. אין לכלול מידע רגיש.'],
      ['קישורים חיצוניים', 'בחירה בקישור WhatsApp פותחת שירות חיצוני, שעליו חלים תנאי השימוש ומדיניות הפרטיות שלו. קישורי טלפון ודוא״ל פותחים את היישומים המתאימים במכשיר. פתיחת הקישור אינה אישור שפנייתכם התקבלה במשרד.'],
      ['שאלות ויצירת קשר', 'לשאלות בנושאי פרטיות ניתן לפנות למשרד בדוא״ל המופיע בהמשך. מדיניות סופית בנוגע לטיפול בפניות במשרד תושלם לפני העלאת האתר לאוויר.'],
    ],
    terms: [
      ['מידע כללי בלבד', 'המידע באתר מיועד להיכרות עם המשרד ותחומי פעילותו. הוא אינו מהווה ייעוץ משפטי ואינו תחליף לייעוץ פרטני המבוסס על נסיבות המקרה.'],
      ['אין יחסי עורך דין–לקוח', 'גלישה באתר או הכנת פנייה אינן יוצרות יחסי עורך דין–לקוח. התקשרות לייצוג מחייבת הסכמה מפורשת של המשרד. אין לשלוח מסמכים או מידע סודי ללא תיאום מוקדם.'],
      ['תצוגה מקומית', 'האתר הוא גרסת עבודה מקומית. לא ניתן להזמין פגישה מאושרת או לשלוח פנייה ישירות מתוך האתר. התוכן והמסמכים המשפטיים טעונים אישור לפני פרסום.'],
      ['תוכן וקישורים', 'אין להסתמך על האתר לצורך מועדים, זכויות או החלטות משפטיות. שירותים חיצוניים שנפתחים מבחירה כפופים לתנאים שלהם.'],
    ],
    accessibility: [
      ['גישה לכל אדם', 'האתר תוכנן עם מבנה כותרות ברור, קישור לדילוג לתוכן, ניווט באמצעות מקלדת, מצבי מיקוד נראים ותוויות לשדות הטופס. הגרסה העברית מוצגת מימין לשמאל.'],
      ['תנועה וקריאות', 'האתר מכבד את הגדרת הפחתת התנועה של מערכת ההפעלה. במצב זה הצורה התלת־ממדית מוצגת ללא אנימציה, אפקטי הפרלקסה והחשיפה מושבתים, וכל הטקסט מוצג מיד. אפשר גם לעצור ולהפעיל את התנועה באמצעות הכפתור בפתיח. הגלילה נשארת טבעית, וניתן להגדיל את התצוגה באמצעות הדפדפן.'],
      ['בדיקה ושיפור', 'זוהי טיוטת הצהרה ולא אישור עמידה בתקן נגישות. נדרשת בדיקת נגישות מלאה של האתר הסופי לפני פרסומו, לרבות בדיקה עם טכנולוגיות מסייעות.'],
      ['נתקלתם בקושי?', 'נשמח לקבל תיאור של הקושי, העמוד הרלוונטי וסוג הדפדפן או הטכנולוגיה המסייעת. ניתן לפנות בדוא״ל או בטלפון המופיעים בהמשך. פרטי איש קשר ייעודי לנגישות יושלמו לפני פרסום.'],
    ],
  },
  en: {
    note: 'Local-preview draft only. The firm must review and approve these notices against the final website and applicable law before publication.',
    privacy: [
      ['Private by default', 'This local version contains no trackers, analytics, advertising pixels or embedded external maps. Fonts and illustrations are served by the website itself.'],
      ['Your language', 'The website uses your browser time zone and language only as hints to select Hebrew or English. It does not access GPS or contact an IP geolocation service. A manual preference is stored in your browser under zarabi-language. You can remove it through your browser’s site-data settings.'],
      ['The enquiry form', 'The form prepares an email draft in page memory only. It does not submit enquiries to a server or store enquiry details in browser storage. Your email provider receives the information only if you choose to open and send the draft through your email application. Please omit sensitive information.'],
      ['External links', 'Choosing WhatsApp opens an external service governed by its own terms and privacy policy. Telephone and email links open the relevant applications on your device. Opening a link is not confirmation that the firm has received your enquiry.'],
      ['Questions and contact', 'For privacy questions, contact the firm using the email below. The final policy covering how the firm handles enquiries must be completed before the site goes live.'],
    ],
    terms: [
      ['General information only', 'This website introduces the firm and its practice. Nothing on it constitutes legal advice or replaces tailored advice based on the circumstances of a specific matter.'],
      ['No attorney–client relationship', 'Browsing the website or preparing an enquiry does not create an attorney–client relationship. Representation requires the firm’s express agreement. Do not send confidential information or documents without prior arrangement.'],
      ['Local preview', 'This website is a local working version. You cannot make a confirmed appointment or submit an enquiry directly through it. Its content and legal notices require approval before publication.'],
      ['Content and links', 'Do not rely on the website for deadlines, rights or legal decisions. External services opened at your choice are governed by their own terms.'],
    ],
    accessibility: [
      ['Access for everyone', 'The website is designed with a clear heading structure, a skip-to-content link, keyboard navigation, visible focus states and labelled form controls. The Hebrew version uses right-to-left layout.'],
      ['Motion and readability', 'The website respects your operating system’s reduced-motion preference. The three-dimensional sculpture is static, parallax and reveal effects are disabled, and all text is immediately visible in that mode. You can also pause and resume motion using the control in the opening section. Scrolling remains native, and you can enlarge the page using browser zoom.'],
      ['Testing and improvement', 'This is a draft statement, not a certification of accessibility compliance. The final site requires a complete accessibility review before publication, including testing with assistive technologies.'],
      ['Having difficulty?', 'Please share a description of the issue, the relevant page and your browser or assistive technology. Contact us using the email or telephone below. A designated accessibility contact must be confirmed before publication.'],
    ],
  },
};

export default function Legal({ locale, page }: { locale: Locale; page: LegalPage }) {
  const { ui } = content(locale);
  return <>
    <PageHeading label={ui.name} title={ui[page]} />
    <article className="legal-copy section-pad">
      <p className="legal-draft-note">{legal[locale].note}</p>
      {legal[locale][page].map(([heading, paragraph]) => <section key={heading}><h2>{heading}</h2><p>{paragraph}</p></section>)}
      <div className="legal-contact"><a href={`mailto:${contact.email}`}>{contact.email}</a><a href={`tel:${contact.phone}`} dir="ltr">+972 54 303 0283</a></div>
    </article>
  </>;
}
