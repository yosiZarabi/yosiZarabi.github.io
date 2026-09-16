import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Footer, Header, ScrollEffects, WhatsApp } from './components';
import { content } from './content';
import Contact from './Contact';
import Home from './Home';
import Legal, { type LegalPage } from './Legal';
import { initialLocale, isLocale } from './locale';
import { About, NotFound, Practices } from './Pages';
import { MotionProvider, useMotion } from './Motion';

function Site() {
  const { paused } = useMotion();
  const { locale: parameter } = useParams();
  const locale = isLocale(parameter) ? parameter : 'he';
  const location = useLocation();
  const lastPath = useRef(location.pathname);
  const page = location.pathname.split('/')[2] || 'home';
  const data = content(locale);
  const knownPage = isLocale(parameter) && ['home', 'about', 'practice', 'contact', 'privacy', 'terms', 'accessibility'].includes(page) && location.pathname.split('/').filter(Boolean).length <= 2;
  const seoKey = page === 'about' || page === 'practice' || page === 'contact' ? page : 'home';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr';
    const legalTitle = page === 'privacy' || page === 'terms' || page === 'accessibility' ? data.ui[page] : null;
    document.title = !knownPage ? `${data.ui.notFound} | ${data.ui.name}` : legalTitle ? `${legalTitle} | ${data.ui.name}` : data.seo[seoKey][0];
    document.querySelector('meta[name="description"]')?.setAttribute('content', data.seo[seoKey][1]);
  }, [locale, page, knownPage, data, seoKey]);

  useEffect(() => {
    let cancelled = false;
    const changed = lastPath.current !== location.pathname;
    lastPath.current = location.pathname;
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
    if (changed) document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    const scrollToHash = () => {
      if (cancelled || !location.hash) return;
      // Hashes are fixed ASCII section IDs; arbitrary URL hashes need no decoding.
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    void document.fonts.ready.then(scrollToHash);
    return () => { cancelled = true; };
  }, [location.pathname, location.hash]);

  return <div id="top" className={`site locale-${locale}`} data-motion={paused ? 'paused' : 'full'} data-page={knownPage ? page : 'not-found'}>
    <Header locale={locale} key={locale} />
    <ScrollEffects />
    <main id="main" tabIndex={-1}>
      {!knownPage ? <NotFound locale={locale} /> :
        page === 'home' ? <Home locale={locale} /> :
          page === 'about' ? <About locale={locale} /> :
            page === 'practice' ? <Practices locale={locale} /> :
              page === 'contact' ? <Contact locale={locale} /> :
                <Legal locale={locale} page={page as LegalPage} />}
    </main>
    <Footer locale={locale} />
    <WhatsApp locale={locale} />
  </div>;
}

export default function App() {
  return <MotionProvider><Routes>
    <Route path="/" element={<Navigate to={`/${initialLocale()}`} replace />} />
    <Route path="/:locale/*" element={<Site />} />
  </Routes></MotionProvider>;
}
