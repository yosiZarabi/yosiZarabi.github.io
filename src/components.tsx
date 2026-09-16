import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { contact, content } from './content';
import { saveLocale, type Locale } from './locale';
import brandMark from './brand-mark.json';
import { useMotion } from './Motion';
import { clamp, sectionProgress } from './motionMath';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className={`arrow ${diagonal ? 'diagonal' : ''}`} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.3" />
  </svg>;
}

export function Mark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox={brandMark.viewBox} fill="currentColor" aria-hidden="true">
    <path d={brandMark.path} />
  </svg>;
}

function Brand({ locale }: { locale: Locale }) {
  return <span className="brand-art">
    <img className="brand-logo brand-logo-dark" src="/brand/zarabi-dark.svg" width="212" height="61" alt="" />
    <img className="brand-logo brand-logo-light" src="/brand/zarabi-light.svg" width="212" height="61" alt="" />
    {locale === 'he' && <span className="brand-local-name">זרבי ושות׳ · משרד עורכי דין</span>}
  </span>;
}

export function Label({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span />{children}</div>;
}

export function ButtonLink({ to, children, variant = '' }: { to: string; children: ReactNode; variant?: string }) {
  return <Link className={`button ${variant}`} to={to}>{children}<Arrow /></Link>;
}

export function Header({ locale }: { locale: Locale }) {
  const { ui } = content(locale);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(window.scrollY > 20);
  const links = ['', '/about', '/practice', '/contact'];
  const otherLocale = locale === 'he' ? 'en' : 'he';
  const otherPath = location.pathname.replace(/^\/[^/]+/, `/${otherLocale}`);

  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>('a');
    firstLink?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const focusable = [menuButton.current, ...Array.from(menuRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].filter(Boolean);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const desktop = window.matchMedia('(min-width: 901px)');
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', onResize);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  return <>
    <a className="skip-link" href="#main">{ui.skip}</a>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <Link to={`/${locale}`} className="brand" aria-label={`${ui.name} — ${ui.nav[0]}`} onClick={() => setOpen(false)}>
        <Brand locale={locale} />
      </Link>
      <nav className="desktop-nav" aria-label={locale === 'he' ? 'תפריט ראשי' : 'Main navigation'}>
        {links.map((path, i) => <NavLink key={path} to={`/${locale}${path}`} end={path === ''}>{ui.nav[i]}</NavLink>)}
      </nav>
      <div className="header-actions">
        <Link className="language-switch" to={`${otherPath}${location.search}${location.hash}`} lang={otherLocale} aria-label={locale === 'he' ? 'Switch to English' : 'מעבר לעברית'} onClick={() => { saveLocale(otherLocale); setOpen(false); }}>
          {locale === 'he' ? 'EN' : 'עב'}<span aria-hidden="true">↗</span>
        </Link>
        <Link to={`/${locale}/contact`} className="header-cta">{ui.meeting}<Arrow /></Link>
        <button ref={menuButton} className={`menu-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? ui.close : ui.menu}>
          <span /><span />
        </button>
      </div>
    </header>
    {open && <div className="mobile-menu" id="mobile-menu" ref={menuRef}>
      <nav aria-label={locale === 'he' ? 'ניווט נייד' : 'Mobile navigation'}>
        {links.map((path, i) => <NavLink key={path} to={`/${locale}${path}`} end={path === ''} onClick={() => setOpen(false)}><span className="mono">0{i + 1}</span>{ui.nav[i]}<Arrow /></NavLink>)}
      </nav>
      <p>{ui.location} · {ui.since}</p>
      <a href={`tel:${contact.phone}`} dir="ltr">{contact.phoneDisplay}</a>
    </div>}
  </>;
}

export function ScrollEffects() {
  const location = useLocation();
  const progress = useRef<HTMLDivElement>(null);
  const { paused } = useMotion();

  useEffect(() => {
    let frame = 0;
    const parallaxes = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
    const scrubSections = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map((element) => ({
      element, words: [...element.querySelectorAll<HTMLElement>('[data-word]')],
    }));
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let spotlight: HTMLElement | null = null;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const resetSpotlight = () => {
      if (!spotlight) return;
      spotlight.style.setProperty('--tilt-x', '0deg');
      spotlight.style.setProperty('--tilt-y', '0deg');
      spotlight.style.setProperty('--spot-opacity', '0');
      spotlight = null;
    };
    const updateSpotlight = () => {
      if (spotlight) {
        const bounds = spotlight.getBoundingClientRect();
        const x = clamp((pointerX - bounds.left) / bounds.width);
        const y = clamp((pointerY - bounds.top) / bounds.height);
        spotlight.style.setProperty('--spot-x', `${x * 100}%`);
        spotlight.style.setProperty('--spot-y', `${y * 100}%`);
        spotlight.style.setProperty('--tilt-x', `${(0.5 - y) * 5}deg`);
        spotlight.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
        spotlight.style.setProperty('--spot-opacity', '1');
      }
      pointerFrame = 0;
    };
    const onPointer = (event: PointerEvent) => {
      if (paused || !finePointer.matches) return;
      const next = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-spotlight]') : null;
      if (next !== spotlight) { resetSpotlight(); spotlight = next; }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updateSpotlight);
    };
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      parallaxes.forEach((element) => {
        const bounds = element.parentElement?.getBoundingClientRect();
        if (paused) element.style.setProperty('--parallax', '0px');
        else if (bounds && bounds.bottom > 0 && bounds.top < window.innerHeight) {
          element.style.setProperty('--parallax', `${clamp(-bounds.top * 0.18, -80, 80)}px`);
        }
      });
      scrubSections.forEach(({ element, words }) => {
        const bounds = element.getBoundingClientRect();
        const amount = paused ? 1 : sectionProgress(bounds.top - 80, bounds.height, window.innerHeight - 80);
        element.style.setProperty('--scrub', String(amount));
        words.forEach((word, index) => word.classList.toggle('is-lit', paused || amount >= index / words.length));
      });
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });
    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetSpotlight);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', resetSpotlight);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
      resetSpotlight();
    };
  }, [location.pathname, paused]);

  return <div className="reading-progress" ref={progress} aria-hidden="true" />;
}

export function Closing({ locale }: { locale: Locale }) {
  const { ui, closing } = content(locale);
  return <section className="closing section-pad">
    <div className="closing-watermark" aria-hidden="true"><Mark /></div>
    <div data-reveal>
      <Label light>{ui.contactLabel}</Label>
      <h2>{closing[0]}</h2>
      <p>{closing[1]}</p>
      <div className="closing-actions">
        <ButtonLink to={`/${locale}/contact`} variant="light">{ui.meeting}</ButtonLink>
        <a className="text-link on-dark" href={contact.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={ui.whatsappLabel}>{ui.whatsapp}<Arrow diagonal /></a>
      </div>
    </div>
  </section>;
}

export function Footer({ locale }: { locale: Locale }) {
  const { ui, disclaimer } = content(locale);
  return <footer className="site-footer">
    <div className="footer-top">
      <Link className="brand" to={`/${locale}`} aria-label={`${ui.name} — ${ui.nav[0]}`}><Brand locale={locale} /></Link>
      <p>{ui.address}<br />{ui.street}</p>
      <div className="footer-contact"><a href={`tel:${contact.phone}`} dir="ltr">{locale === 'he' ? contact.phoneDisplay : '+972 54 303 0283'}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
      <a className="back-top" href="#top" aria-label={locale === 'he' ? 'חזרה לראש העמוד' : 'Back to top'}>↑</a>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} {ui.name}. {ui.rights}</span>
      <nav aria-label={locale === 'he' ? 'מידע משפטי' : 'Legal information'}>
        <Link to={`/${locale}/privacy`}>{ui.privacy}</Link><Link to={`/${locale}/terms`}>{ui.terms}</Link><Link to={`/${locale}/accessibility`}>{ui.accessibility}</Link>
      </nav>
    </div>
    <p className="disclaimer">{disclaimer}</p>
  </footer>;
}

export function WhatsApp({ locale }: { locale: Locale }) {
  return <a className="floating-contact" href={contact.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={content(locale).ui.whatsappLabel}>
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M20 11.6a8.1 8.1 0 0 1-12 7.1L3 20l1.3-4.8A8.1 8.1 0 1 1 20 11.6Z" stroke="currentColor" strokeWidth="1.3" /><path d="m8 7 1.6 2.5-1 1.2a9 9 0 0 0 3.6 3.6l1.2-1 2.5 1.6c-.2 1.7-1.7 2.1-3.1 1.4a13 13 0 0 1-6.2-6.2C6 8.7 6.3 7.2 8 7Z" stroke="currentColor" strokeWidth="1.1" /></svg>
  </a>;
}
