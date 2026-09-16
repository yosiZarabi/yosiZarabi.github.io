import { Link } from 'react-router-dom';
import Architecture from './Architecture';
import { ButtonLink, Closing, Label, Mark } from './components';
import { content, practiceIds } from './content';
import { Approach } from './Home';
import type { Locale } from './locale';

export function PageHeading({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return <section className="page-heading section-pad"><Label>{label}</Label><h1>{title}</h1>{children && <div className="page-heading-copy">{children}</div>}<span className="page-heading-rule" aria-hidden="true" /></section>;
}

export function About({ locale }: { locale: Locale }) {
  const { ui, about, founder, quote } = content(locale);
  return <>
    <PageHeading label={ui.aboutLabel} title={ui.aboutTitle} />
    <section className="about-story section-pad">
      <div className="about-art" data-reveal><div data-parallax><Architecture /></div><span dir="ltr">THE ART OF PERSPECTIVE</span></div>
      <div className="about-story-copy" data-reveal>{about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>
    <section className="founder section-pad">
      <div className="founder-seal" aria-hidden="true" data-reveal><div><Mark /><span dir="ltr">YOSI ZARABI</span><span className="mono">PERSONAL. BY PRINCIPLE.</span></div></div>
      <div className="founder-copy" data-reveal><Label light>{ui.founderLabel}</Label><h2>{ui.founderName}</h2><span className="founder-role">{ui.founderRole}</span>{founder.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>
    <section className="quote section-pad" data-reveal><span className="quote-mark" aria-hidden="true">“</span><blockquote>{quote}</blockquote><p>{ui.founderName} <span>— {ui.founderRole}</span></p></section>
    <Approach locale={locale} />
    <Closing locale={locale} />
  </>;
}

export function Practices({ locale }: { locale: Locale }) {
  const { ui, practiceIntro, practices, practiceClosing } = content(locale);
  return <>
    <PageHeading label={ui.expertiseLabel} title={ui.practiceTitle}><p>{practiceIntro}</p></PageHeading>
    <div className="practice-layout section-pad">
      <nav className="practice-sidebar" aria-label={ui.practiceNav}>
        <span className="mono">01 — 07</span>
        {practices.map((practice, i) => <a key={practice.title} href={`#${practiceIds[i]}`}><span className="mono">0{i + 1}</span>{practice.title}</a>)}
      </nav>
      <div className="practice-details">
        {practices.map((practice, i) => <section className="practice-detail" id={practiceIds[i]} key={practice.title} data-reveal>
          <span className="detail-number" aria-hidden="true">0{i + 1}</span><h2>{practice.title}</h2><p className="lead">{practice.intro}</p>
          <ul>{practice.services.map((service) => <li key={service}>{service}</li>)}</ul>
          <Link className="text-link" to={`/${locale}/contact?subject=${practiceIds[i]}`}>{ui.meeting}<span aria-hidden="true">↗</span></Link>
        </section>)}
        <div className="practice-help"><p>{practiceClosing}</p><ButtonLink to={`/${locale}/contact`}>{ui.nav[3]}</ButtonLink></div>
      </div>
    </div>
    <Closing locale={locale} />
  </>;
}

export function NotFound({ locale }: { locale: Locale }) {
  const { ui } = content(locale);
  return <div className="not-found section-pad"><Label>404</Label><h1>{ui.notFound}</h1><p>{ui.notFoundText}</p><ButtonLink to={`/${locale}`}>{ui.back}</ButtonLink></div>;
}
