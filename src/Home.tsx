import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow, ButtonLink, Closing, Label, Mark } from './components';
import { content, practiceIds } from './content';
import type { Locale } from './locale';
import { MotionControl } from './Motion';
import SignatureScene from './SignatureScene';

export function Approach({ locale }: { locale: Locale }) {
  const { ui, approach } = content(locale);
  const [active, setActive] = useState(0);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(Number(entry.target.getAttribute('data-step')));
      }
    }, { rootMargin: '-25% 0px -40% 0px', threshold: 0 });
    section.current?.querySelectorAll('[data-step]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <section className="approach section-pad" ref={section}>
    <div className="approach-sticky">
      <Label>{ui.philosophyLabel}</Label>
      <h2 className="display-title">{ui.philosophyTitle}</h2>
      <p>{ui.philosophyIntro}</p>
      <div className="chapter-progress" aria-hidden="true">
        <span className="chapter-number">0{active + 1}</span>
        <div className="chapter-track">{approach.map((_, i) => <span key={i} className={i <= active ? 'active' : ''} />)}</div>
        <span className="mono">04</span>
      </div>
      <div className="approach-orbit" aria-hidden="true"><span /><span /><span className="orbit-center"><Mark /></span></div>
    </div>
    <div className="approach-steps">
      {approach.map(([title, description], i) => <article key={title} data-step={i} className={`approach-step ${active === i ? 'active' : ''}`} data-reveal>
        <span className="step-number mono">0{i + 1}</span>
        <h3>{title}</h3><p>{description}</p>
      </article>)}
    </div>
  </section>;
}

export default function Home({ locale }: { locale: Locale }) {
  const data = content(locale);
  const { ui } = data;
  const headlines = data.hero.headline.split('.').map((part) => part.trim()).filter(Boolean);
  return <>
    <section className="hero">
      <div className="hero-atmosphere" aria-hidden="true"><span /><span /><div className="hero-grid" /></div>
      <div className="hero-copy">
        <div className="hero-kicker"><span /> ZARABI & CO. <span className="kicker-divider" /> BEYOND THE EXPECTED</div>
        <h1>{headlines.map((line, i) => <span key={line} className={i === 2 ? 'accent-text' : ''} style={{ animationDelay: `${i * 110 + 100}ms` }}>{line}.</span>)}</h1>
        <p>{data.hero.description}</p>
        <ButtonLink to={`/${locale}/contact`} variant="light">{data.hero.cta}</ButtonLink>
        <div className="hero-foot"><a href="#introduction" className="scroll-cue"><span aria-hidden="true">↓</span>{ui.scroll}</a><MotionControl locale={locale} /></div>
      </div>
      <div className="hero-art">
        <div className="hero-art-inner" data-parallax><SignatureScene /></div>
        <div className="art-topline"><span>01 / A NEW PERSPECTIVE</span><span className="art-cross">+</span></div>
        <div className="scene-coordinate scene-coordinate-one" aria-hidden="true"><span />PRECISION</div>
        <div className="scene-coordinate scene-coordinate-two" aria-hidden="true"><span />PERSPECTIVE</div>
        <div className="art-caption"><span>{locale === 'he' ? 'ראייה רחבה. ירידה לפרטים.' : 'The bigger picture. The finer details.'}</span><span className="hero-location"><span />{ui.location}</span></div>
      </div>
    </section>
    <div className="discipline-strip" aria-hidden="true"><span>REAL ESTATE</span><i /><span>FINANCE</span><i /><span>CORPORATE</span><i /><span>COMMERCIAL</span><i /><span>PRIVATE CLIENTS</span></div>
    <section className="introduction section-pad" id="introduction">
      <div data-reveal><Label>{ui.aboutLabel}</Label><h2 className="display-title">{ui.introTitle}</h2><span className="small-signature" dir="ltr">Zarabi & Co.</span></div>
      <div className="intro-body" data-reveal><p className="lead">{data.intro[0]}</p><p>{data.intro[1]}</p><Link className="text-link" to={`/${locale}/about`}>{ui.discover}<Arrow /></Link></div>
    </section>
    <SignatureStatement locale={locale} />
    <section className="home-practices section-pad">
      <div className="section-heading" data-reveal><div><Label light>{ui.expertiseLabel}</Label><h2>{ui.expertise}</h2></div><Link className="text-link on-dark" to={`/${locale}/practice`}>{ui.explore}<Arrow /></Link></div>
      <div className="practice-grid">
        {data.practices.slice(0, 6).map((practice, i) => <Link className="practice-card" key={practice.title} to={`/${locale}/practice#${practiceIds[i]}`} data-reveal data-spotlight>
          <div className="practice-card-top"><span className="mono">0{i + 1}</span><PracticeIcon index={i} /></div>
          <h3>{practice.title}</h3><p>{data.summaries[i].split(' – ').slice(1).join(' – ')}</p>
          <span className="practice-card-link">{ui.readMore}<Arrow diagonal /></span>
        </Link>)}
      </div>
      <Link className="litigation-link" to={`/${locale}/practice#litigation`}><span className="mono">07</span><span>{data.practices[6].title}</span><Arrow /></Link>
    </section>
    <Approach locale={locale} />
    <section className="clients section-pad">
      <div data-reveal><Label>{ui.trustedLabel}</Label><h2 className="display-title">{ui.clientsTitle}</h2></div>
      <div data-reveal><p>{data.clients}</p><div className="client-sectors">{ui.clientSectors.map((sector) => <span key={sector}>{sector}</span>)}</div></div>
    </section>
    <Closing locale={locale} />
  </>;
}

function SignatureStatement({ locale }: { locale: Locale }) {
  const lines = locale === 'he'
    ? ['לראות את התמונה המלאה.', 'לדייק בכל פרט.', 'ולהוביל אתכם קדימה.']
    : ['See the bigger picture.', 'Consider every detail.', 'Find the way forward.'];
  return <section className="signature-statement" data-scrub>
    <div className="statement-stage">
      <div className="statement-contours" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ '--contour': i } as React.CSSProperties} />)}</div>
      <div className="statement-content">
        <Label light>{locale === 'he' ? 'מעבר למשפט. אל מה שחשוב.' : 'Beyond the legal. Into what matters.'}</Label>
        <h2>{lines.map((line) => <span className="statement-line" key={line}>{line.split(' ').map((word, i) => <span data-word key={`${word}-${i}`} className="statement-word">{word}{' '}</span>)}</span>)}</h2>
        <div className="statement-bottom"><span className="mono" dir="ltr">THE ZARABI PERSPECTIVE</span><span className="statement-meter" aria-hidden="true"><span /></span><span className="mono">01 — 03</span></div>
      </div>
    </div>
  </section>;
}

function PracticeIcon({ index }: { index: number }) {
  const paths = [
    'M9 38V14l14-7 14 7v24M15 38V19h16v19M5 38h36M20 24h6m-6 6h6',
    'M8 38h32M12 33V21m8 12V15m8 18V10m8 23V6M8 17l13-7 8 2 11-8',
    'M24 5v10m-14 6h28M10 21v10m14-16v16m14-10v10M5 31h10v10H5zm14 0h10v10H19zm14 0h10v10H33z',
    'M12 5h18l7 7v29H12ZM30 5v9h7M18 21h13m-13 6h13m-13 6h8',
    'M24 5 8 12v11c0 9 16 19 16 19s16-10 16-19V12ZM17 23l5 5 10-11',
    'M24 5a19 19 0 1 0 0 38 19 19 0 0 0 0-38Zm0 0c-13 12-13 26 0 38 13-12 13-26 0-38ZM5 24h38M10 12c9 7 19 7 28 0M10 36c9-7 19-7 28 0',
  ];
  return <svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true"><path d={paths[index]} stroke="currentColor" strokeWidth="1" /></svg>;
}
