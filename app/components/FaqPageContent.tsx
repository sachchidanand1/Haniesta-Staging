import {clsx} from 'clsx';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {FAQ_SECTIONS} from '~/data/faq';
import {FaqAnswer} from '~/components/FaqAnswer';
import {FaqExpandIcon, FaqSectionIcon} from '~/components/FaqSectionIcon';
import {faqQuestionId, scrollToFaqAnchor} from '~/lib/faq';

function faqAnchorClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  id: string,
) {
  event.preventDefault();
  scrollToFaqAnchor(id);
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="pointer-events-none absolute left-[18px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8480]"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-[#C8A96E]" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-[#25D366]" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.463h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0 text-[#C8A96E]" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

export function FaqPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState(FAQ_SECTIONS[0]?.id ?? '');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleSections = useMemo(() => {
    if (!normalizedQuery) return FAQ_SECTIONS;

    return FAQ_SECTIONS.map((section) => {
      const items = section.items.filter((item) => {
        const haystack = `${item.question} ${item.answer}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
      return {...section, items};
    }).filter((section) => section.items.length > 0);
  }, [normalizedQuery]);

  const hasResults = visibleSections.length > 0;

  const toggleItem = useCallback((itemId: string) => {
    setOpenItems((prev) => ({...prev, [itemId]: !prev[itemId]}));
  }, []);

  const isItemOpen = useCallback(
    (itemId: string, matchesSearch: boolean) => {
      if (normalizedQuery && matchesSearch) return true;
      return Boolean(openItems[itemId]);
    },
    [normalizedQuery, openItems],
  );

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    requestAnimationFrame(() => scrollToFaqAnchor(hash));
  }, []);

  useEffect(() => {
    const nodes = FAQ_SECTIONS.map((s) => sectionRefs.current[s.id]).filter(
      Boolean,
    ) as HTMLElement[];

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.1, 0.25]},
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [hasResults]);

  const clearSearch = () => {
    setSearchQuery('');
    setOpenItems({});
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1a1714]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[rgba(26,23,20,0.1)] px-8 py-20 text-center md:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(200,169,110,0.08), transparent)',
          }}
        />
        <span className="relative inline-block rounded-full border border-[#C8A96E] px-4 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B6914]">
          Customer support
        </span>
        <h1 className="relative mt-6 font-cormorant text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1.15] tracking-wide text-[#1a1714]">
          Frequently asked <em className="italic text-[#8B6914]">questions</em>
        </h1>
        <p className="relative mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-[#8a8480]">
          Everything you need to know about Haniesta rugs, care, delivery, and
          returns.
        </p>

        {/* <div className="relative mx-auto mt-10 max-w-[520px]">
          <SearchIcon />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search — try 'pet friendly', 'jute', 'returns'…"
            autoComplete="off"
            className="w-full rounded-full border border-[rgba(26,23,20,0.18)] bg-white py-3.5 pl-12 pr-12 text-[13px] font-light tracking-wide text-[#1a1714] outline-none transition-shadow placeholder:text-[#8a8480] focus:border-[#C8A96E] focus:shadow-[0_0_0_3px_rgba(200,169,110,0.12)]"
            aria-label="Search frequently asked questions"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-1 text-lg leading-none text-[#8a8480] hover:text-[#1a1714]"
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div> */}
      </section>

      {/* Quick nav pills */}
      <div className="mx-auto flex max-w-[900px] flex-wrap justify-center gap-2 px-8 pt-8">
        {FAQ_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => faqAnchorClick(e, section.id)}
            className={clsx(
              'inline-flex items-center rounded-full border border-[rgba(26,23,20,0.18)] bg-white px-4 py-1.5 text-[11px] tracking-wide text-[#4a4540] transition-all hover:border-[#C8A96E] hover:bg-[#F5EDD8] hover:text-[#8B6914]',
              activeSection === section.id &&
                'border-[#C8A96E] bg-[#F5EDD8] text-[#8B6914]',
            )}
          >
            {section.pillLabel}
            {section.popular ? (
              <span className="ml-1 text-[9px] text-[#C8A96E]" aria-hidden>
                ★
              </span>
            ) : null}
          </a>
        ))}
      </div>

      {/* Layout */}
      <div className="mx-auto grid max-w-[1060px] grid-cols-1 items-start gap-0 px-8 py-12 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="mb-8 border-b border-[rgba(26,23,20,0.1)] pb-8 lg:sticky lg:top-24 lg:mb-0 lg:border-b-0 lg:border-r lg:pr-12 lg:pb-0">
          <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.18em] text-[#8a8480]">
            Browse by topic
          </p>
          <nav aria-label="FAQ sections">
            <ul className="space-y-0.5">
              {FAQ_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => faqAnchorClick(e, section.id)}
                    className={clsx(
                      'flex items-center justify-between rounded-md px-3 py-2 text-xs tracking-wide text-[#4a4540] transition-colors hover:bg-[#F5EDD8] hover:text-[#8B6914]',
                      activeSection === section.id &&
                        'bg-[#F5EDD8] font-medium text-[#8B6914]',
                    )}
                  >
                    <span>{section.title}</span>
                    <span
                      className={clsx(
                        'rounded-full px-1.5 py-0.5 text-[10px] text-[#8a8480]',
                        activeSection === section.id
                          ? 'bg-[rgba(139,105,20,0.15)] text-[#8B6914]'
                          : 'bg-[rgba(26,23,20,0.06)]',
                      )}
                    >
                      {section.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 rounded-[10px] border border-[rgba(26,23,20,0.1)] bg-white p-5">
            <p className="font-cormorant text-[15px] text-[#1a1714]">
              Need more help?
            </p>
            <p className="mt-2 text-[11px] font-light leading-relaxed text-[#8a8480]">
              Our team replies within 24 hours, Monday to Friday.
            </p>
            <a
              href="mailto:support@haniesta.com"
              className="mt-3 flex items-center gap-2 border-b border-[rgba(26,23,20,0.1)] py-1.5 text-[11px] text-[#4a4540] transition-colors hover:text-[#8B6914]"
            >
              <MailIcon />
              support@haniesta.com
            </a>
            <a
              href="https://wa.me/447542424785"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border-b border-[rgba(26,23,20,0.1)] py-1.5 text-[11px] text-[#4a4540] transition-colors hover:text-[#8B6914]"
            >
              <WhatsAppIcon />
              +44 7542 424785
            </a>
            <p className="flex items-center gap-2 pt-1.5 text-[11px] text-[#4a4540]">
              <ClockIcon />
              Mon–Fri, 9AM–6PM
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 bg-[#FAF8F4] lg:pl-12">
          {!hasResults ? (
            <div className="relative py-20 text-center text-[#8a8480]">
              <div className="relative mx-auto mb-4 h-4 w-full max-w-[200px]">
                <SearchIcon />
              </div>
              <p className="mt-4 text-sm font-light">
                No questions match your search. Try different keywords or{' '}
                <a
                  href="mailto:support@haniesta.com"
                  className="text-[#8B6914] underline-offset-2 hover:underline"
                >
                  contact us
                </a>
                .
              </p>
            </div>
          ) : (
            visibleSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                className="mb-14 scroll-mt-28"
              >
                <div className="mb-5 flex items-center gap-3 border-b border-[rgba(26,23,20,0.1)] pb-3">
                  <FaqSectionIcon sectionId={section.id} />
                  <h2 className="font-cormorant text-xl tracking-wide text-[#1a1714]">
                    {section.title}
                  </h2>
                  {section.badge ? (
                    <span className="ml-auto rounded-full bg-[#F5EDD8] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-[#8B6914]">
                      {section.badge}
                    </span>
                  ) : null}
                </div>

                <div>
                  {section.items.map((item, index) => {
                    const itemId = faqQuestionId(section.id, item.question);
                    const matchesSearch =
                      !normalizedQuery ||
                      `${item.question} ${item.answer}`
                        .toLowerCase()
                        .includes(normalizedQuery);
                    const open = isItemOpen(itemId, matchesSearch);

                    return (
                      <div
                        key={itemId}
                        id={itemId}
                        className={clsx(
                          'scroll-mt-28 border-b border-[rgba(26,23,20,0.1)]',
                          index === 0 && 'border-t border-[rgba(26,23,20,0.1)]',
                        )}
                      >
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-4 px-1 py-[18px] text-left"
                          aria-expanded={open}
                          onClick={() => toggleItem(itemId)}
                        >
                          <span
                            className={clsx(
                              'text-sm leading-snug tracking-wide transition-colors',
                              open ? 'text-[#8B6914]' : 'text-[#1a1714]',
                            )}
                          >
                            {item.question}
                          </span>
                          <FaqExpandIcon open={open} />
                        </button>
                        <div
                          className={clsx(
                            'grid transition-[grid-template-rows] duration-300 ease-out',
                            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="px-1 pb-5">
                              <FaqAnswer text={item.answer} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(26,23,20,0.1)] bg-white px-8 py-12 text-center">
        <p className="text-xs font-light text-[#8a8480]">
          Still have a question? Email us at{' '}
          <a
            href="mailto:support@haniesta.com"
            className="text-[#8B6914] hover:underline"
          >
            support@haniesta.com
          </a>{' '}
          — we reply within 24 hours.
        </p>
        <p className="mt-1.5 text-xs font-light text-[#8a8480]">
          © {new Date().getFullYear()} Haniesta. All rights reserved.{' '}
          <a
            href="https://haniesta.com"
            className="text-[#8B6914] hover:underline"
          >
            haniesta.com
          </a>
        </p>
      </footer>
    </div>
  );
}
