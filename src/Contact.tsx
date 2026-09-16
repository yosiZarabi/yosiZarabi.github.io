import { useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Arrow, Label } from './components';
import { contact, content, practiceIds } from './content';
import { composeEmail, mailtoLink, validPhone } from './enquiry';
import type { Locale } from './locale';
import { PageHeading } from './Pages';
import brandMark from './brand-mark.json';

export default function Contact({ locale }: { locale: Locale }) {
  const { ui, contactIntro, practices } = content(locale);
  return <>
    <PageHeading label={ui.contactLabel} title={ui.contactTitle}><p>{contactIntro}</p></PageHeading>
    <section className="contact-layout section-pad">
      <aside className="contact-info">
        <Label>{ui.office}</Label>
        <h2>{ui.address}</h2><p>{ui.street}</p><p className="appointment-note">{ui.appointments}</p>
        <div className="contact-method"><span>{ui.phone}</span><a href={`tel:${contact.phone}`} dir="ltr">{locale === 'he' ? contact.phoneDisplay : '+972 54 303 0283'}<Arrow diagonal /></a></div>
        <div className="contact-method"><span>{ui.email}</span><a href={`mailto:${contact.email}`} dir="ltr">{contact.email}<Arrow diagonal /></a></div>
        <a className="text-link whatsapp-link" href={contact.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={ui.whatsappLabel}>{ui.whatsapp}<Arrow diagonal /></a>
        <div className="office-map">
          <svg viewBox="0 0 440 260" aria-hidden="true">
            <rect width="440" height="260" fill="#e7e3d8" />
            <g fill="#d8d7ca" stroke="#c7c9bd">
              <path d="m0 25 123-32 18 60-129 27ZM18 107l129-36 23 83-133 38ZM46 214l131-37 28 83H60ZM237 0h74l24 75-87 22ZM256 123l88-23 29 91-91 27ZM346 0h80l14 48-80 23ZM367 99l73-21v93l-45 12ZM295 239l90-25 14 46H300Z" />
            </g>
            <path d="M169-20 259 280" stroke="#f7f4eb" strokeWidth="35" />
            <path d="m-20 109 480-139M-20 235 480-134" stroke="#f7f4eb" strokeWidth="17" />
            <path d="m150-20 89 300" stroke="#b4b5a8" strokeWidth="2" strokeDasharray="4 6" />
            <circle cx="241" cy="141" r="28" fill="#14292d" opacity=".07" />
            <circle cx="241" cy="141" r="18" fill="#14292d" />
            <svg x="232" y="132" width="18" height="18" viewBox={brandMark.viewBox}><path d={brandMark.path} fill="#ffffff" /></svg>
          </svg>
          <strong>{ui.mapTitle}</strong><small>{ui.mapNote}</small>
        </div>
      </aside>
      <ContactForm key={locale} locale={locale} subjects={practices.map((practice) => practice.title)} />
    </section>
  </>;
}

function ContactForm({ locale, subjects }: { locale: Locale; subjects: string[] }) {
  const { ui } = content(locale);
  const t = ui.form;
  const [search] = useSearchParams();
  const requestedSubject = search.get('subject') ?? '';
  const defaultSubject = practiceIds.find((id) => id === requestedSubject) ?? '';
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<{ body: string; href: string } | null>(null);
  const draftHeading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const description = locale === 'he'
    ? 'הפנייה אינה יוצרת יחסי עורך דין–לקוח ואינה מהווה ייעוץ משפטי. אנא הימנעו מהכללת מידע רגיש.'
    : 'An enquiry does not create an attorney–client relationship or constitute legal advice. Please do not include sensitive information.';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const values = new FormData(element);
    const get = (key: string) => String(values.get(key) ?? '').trim();
    const phone = element.elements.namedItem('phone') as HTMLInputElement;
    const name = element.elements.namedItem('name') as HTMLInputElement;
    const message = element.elements.namedItem('message') as HTMLTextAreaElement;
    phone.setCustomValidity(validPhone(get('phone')) ? '' : t.invalidPhone);
    name.setCustomValidity(get('name') ? '' : t.invalid);
    message.setCustomValidity(get('message') ? '' : t.invalid);
    if (!element.checkValidity()) {
      setError(!phone.validity.valid ? t.invalidPhone : t.invalid);
      element.querySelector<HTMLElement>(':invalid')?.focus();
      return;
    }
    setError('');
    const subjectIndex = practiceIds.findIndex((id) => id === get('subject'));
    const subject = subjectIndex < 0 ? t.other : subjects[subjectIndex];
    const body = composeEmail({
      name: get('name'), phone: get('phone'), email: get('email'),
      company: get('company'), subject, message: get('message'),
    }, { name: t.name, phone: t.phone, email: t.email, company: t.company, subject: t.subject, message: t.message });
    setDraft({ body, href: mailtoLink(contact.email, t.emailSubject + subject, body) });
    requestAnimationFrame(() => draftHeading.current?.focus());
  };

  return <div className="contact-form-panel">
    <span className="form-index mono">YOUR NEXT CHAPTER</span>
    <h2>{t.title}</h2>
    <p className="local-form-note" id="local-form-note">{t.localNote}</p>
    <form ref={form} onSubmit={submit} noValidate hidden={draft !== null} aria-describedby="local-form-note form-disclaimer">
      <div className="form-grid">
        <label htmlFor="full-name">{t.name} <span aria-hidden="true">*</span><input id="full-name" name="name" autoComplete="name" dir="auto" required maxLength={100} onInput={(e) => e.currentTarget.setCustomValidity('')} /></label>
        <label htmlFor="phone">{t.phone} <span aria-hidden="true">*</span><input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" required maxLength={30} onInput={(e) => e.currentTarget.setCustomValidity('')} /></label>
        <label htmlFor="email">{t.email} <span aria-hidden="true">*</span><input id="email" name="email" type="email" autoComplete="email" dir="ltr" required maxLength={254} /></label>
        <label htmlFor="company">{t.company} <span className="optional">({t.optional})</span><input id="company" name="company" autoComplete="organization" dir="auto" maxLength={150} /></label>
        <label className="full-width" htmlFor="subject">{t.subject} <span aria-hidden="true">*</span><select id="subject" name="subject" required defaultValue={defaultSubject}><option value="" disabled>{t.select}</option>{subjects.map((subject, i) => <option key={subject} value={practiceIds[i]}>{subject}</option>)}<option value="other">{t.other}</option></select></label>
        <label className="full-width" htmlFor="message">{t.message} <span aria-hidden="true">*</span><textarea id="message" name="message" rows={4} required maxLength={1500} placeholder={t.placeholder} dir="auto" onInput={(e) => e.currentTarget.setCustomValidity('')} /></label>
      </div>
      <div className="consent-row"><input id="consent" type="checkbox" name="consent" required /><label htmlFor="consent">{t.consent} <span aria-hidden="true">*</span></label></div>
      <Link className="policy-form-link" to={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">{ui.privacy} ↗</Link>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="button">{t.submit}<Arrow /></button>
    </form>
    {draft && <div className="draft-panel">
      <h3 ref={draftHeading} tabIndex={-1}>{t.ready}</h3><p>{t.readyNote}</p>
      <label htmlFor="email-draft">{t.draft}</label><textarea id="email-draft" readOnly rows={12} value={draft.body} dir="auto" />
      <a className="draft-address" href={`mailto:${contact.email}`}>{contact.email}</a>
      <a className="button" href={draft.href}>{t.open}<Arrow /></a>
      <button className="text-button" type="button" onClick={() => { setDraft(null); requestAnimationFrame(() => form.current?.querySelector('input')?.focus()); }}>{t.edit}</button>
    </div>}
    <p className="form-disclaimer" id="form-disclaimer">{description}</p>
  </div>;
}
