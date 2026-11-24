import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData} from '@remix-run/react';
import React, {useEffect, useRef, useState, useMemo} from 'react';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {getHeroMetaobject, getAboutUsMetaobject} from '~/lib/metafields';

export const headers = routeHeaders;

/* ─── Brand tokens ───────────────────────────────────────────────────────────*/
const T = {
  cream: "#EAD8BB", sand: "#E7D8C9", forest: "#2F4F3E",
  brown: "#463925", offwhite: "#FAFAF8",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif",
};

/* ─── Inline styles ──────────────────────────────────────────────────────────*/
const S: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: T.sans, color: T.brown, background: T.offwhite,
    WebkitFontSmoothing: "antialiased", overflowX: "clip",
  },

  /* ACT 1 */
  act1: {
    position: "relative", minHeight: "100svh", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    background: T.brown, overflow: "hidden", textAlign: "center", padding: "40px",
  },
  weave: {
    position: "absolute", inset: "-30%", pointerEvents: "none",
    background: `repeating-linear-gradient(45deg,rgba(234,216,187,.08) 0 1px,transparent 1px 14px),
                 repeating-linear-gradient(-45deg,rgba(234,216,187,.06) 0 1px,transparent 1px 22px)`,
    animation: "weaveDrift 38s linear infinite",
  },
  year: {
    position: "relative", fontFamily: T.serif, fontWeight: 500,
    fontSize: "clamp(78px,14vw,180px)", color: T.cream, lineHeight: 1,
    animation: "heroYear 1.2s cubic-bezier(.2,.7,.2,1) .15s both",
  },
  tagline: {
    position: "relative", marginTop: 30, fontFamily: T.sans, fontWeight: 400,
    fontSize: "clamp(12px,1.2vw,15px)", letterSpacing: "0.3em",
    textTransform: "uppercase", color: T.cream,
    animation: "heroFade 1s ease .5s both",
  },
  rule: {
    position: "relative", width: 48, height: 1,
    background: "rgba(234,216,187,.5)", margin: "28px auto 0",
    animation: "heroFade 1s ease .9s both",
  },
  scrollcue: {
    position: "absolute", bottom: 34, left: "50%", transform: "translateX(-50%)",
    fontFamily: T.sans, fontSize: 11, letterSpacing: "0.25em",
    textTransform: "uppercase", color: "rgba(234,216,187,.6)",
    animation: "heroFade 1s ease 1.4s both", textAlign: "center",
  },
  cueLine: {
    display: "block", margin: "8px auto 0", width: 1, height: 34,
    background: "rgba(234,216,187,.4)", animation: "cueDrop 2s ease-in-out infinite",
    transformOrigin: "top",
  },

  /* ACT 2 */
  act2: { background: T.cream, padding: "120px 0 130px" },
  act2Head: { padding: "0 48px", maxWidth: 1280, margin: "0 auto" },
  kicker: {
    fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase",
    color: T.forest, marginBottom: 16, margin: 0,
  },
  act2H2: { fontFamily: T.serif, fontSize: "clamp(34px,5vw,64px)", color: T.brown, margin: 0, fontWeight: 500 },
  track: {
    display: "flex", gap: 28, overflowX: "auto", scrollSnapType: "x mandatory",
    padding: "54px 48px 30px", WebkitOverflowScrolling: "touch",
  },
  mcard: {
    scrollSnapAlign: "start", flex: "0 0 380px", background: "#fff",
    borderLeft: `4px solid ${T.forest}`, padding: "40px 38px",
  },
  mcardYr: { fontFamily: T.serif, fontSize: 46, color: T.forest, marginBottom: 14, fontWeight: 500 },
  mcardP: { fontSize: 16, lineHeight: 1.6, color: T.brown, margin: 0 },
  railnote: {
    padding: "6px 48px 0", maxWidth: 1280, margin: "0 auto", fontSize: 11,
    letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(70,57,37,.5)",
    textAlign: "center",
  },

  /* ACT 3 */
  act3: { position: "relative", minHeight: "100svh", display: "flex", overflow: "hidden", background: T.sand },
  act3Left: {
    position: "absolute", inset: 0, background: T.forest,
    clipPath: "polygon(0 0,56% 0,44% 100%,0 100%)",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: "60px 56% 60px 5%",
  },
  act3Right: {
    position: "absolute", inset: 0,
    clipPath: "polygon(56% 0,100% 0,100% 100%,44% 100%)",
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    padding: "60px 90px 60px 0",
  },
  bigNum: { fontFamily: T.serif, fontSize: 96, color: "#fff", lineHeight: 1, margin: 0, fontWeight: 500 },
  bigLbl: { fontFamily: T.serif, fontSize: 26, color: T.cream, marginTop: 6, fontWeight: 400 },
  bigDesc: { fontSize: 14, color: "rgba(255,255,255,.7)", marginTop: 14, maxWidth: 240, letterSpacing: "0.02em", margin: "14px auto 0" },
  rightStack: { display: "flex", flexDirection: "column", gap: 48, maxWidth: 300 },
  rightNum: { fontFamily: T.serif, fontSize: 72, color: T.brown, lineHeight: 1, margin: 0, fontWeight: 500 },
  rightLbl: { fontFamily: T.serif, fontSize: 22, color: T.forest, marginTop: 2, fontWeight: 400 },
  rightDesc: { fontSize: 14, color: "rgba(70,57,37,.7)", marginTop: 8, margin: "8px 0 0" },

  /* ACT 4 */
  act4: { position: "relative", height: "400vh" },
  act4Sticky: {
    position: "sticky", top: 0, left: 0, width: "100%", height: "100svh", display: "flex",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
    backgroundColor: T.brown, transition: "background-color 1s ease",
  },
  chapter: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 1s ease" },
  chBg: { position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: T.brown, transform: "scale(1.04)", transition: "transform 7s ease" },
  chScrim: { position: "absolute", inset: 0 },
  chInner: {
    position: "relative", zIndex: 2, maxWidth: 680, padding: "0 40px",
    paddingTop: "var(--height-nav, 0px)", textAlign: "center", textShadow: "0 2px 30px rgba(20,14,6,.45)"
  },
  chI: { fontFamily: T.sans, fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 22, opacity: 0.75, color: T.cream },
  chH2: { fontFamily: T.serif, fontSize: "clamp(38px,6vw,80px)", marginBottom: 26, color: T.cream, fontWeight: 500, lineHeight: 1.05 },
  chBody: { fontSize: 19, lineHeight: 1.65, fontWeight: 300, color: "rgba(250,250,248,.92)", margin: 0 },
  progress: { position: "absolute", left: 48, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 14, zIndex: 3 },
  dot: { width: 8, height: 8, borderRadius: 99, background: T.cream, opacity: 0.32, transition: "opacity .4s,transform .4s", display: "block" },
  dotOn: { opacity: 0.95, transform: "scale(1.5)" },

  /* ACT 5 */
  act5: { background: T.offwhite, padding: "130px 48px 140px" },
  act5Head: { textAlign: "center", maxWidth: 760, margin: "0 auto 64px" },
  act5H2: { fontFamily: T.serif, fontSize: "clamp(30px,4vw,52px)", color: T.brown, margin: 0, fontWeight: 500 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 24, maxWidth: 1280, margin: "0 auto" },
  pcard: { background: "#fff", borderTop: `3px solid ${T.forest}`, padding: "38px 32px" },
  pcardH3: { fontFamily: T.serif, fontSize: 25, color: T.brown, marginBottom: 12, fontWeight: 500 },
  pcardP: { fontSize: 14, lineHeight: 1.6, color: "rgba(70,57,37,.78)", margin: 0 },
  ic: { height: 56, width: 56, marginBottom: 26, color: T.forest },

  /* ACT 6 */
  act6: { background: T.forest, padding: "115px 0 60px", overflow: "hidden" },
  marqueeWrap: { display: "flex", width: "max-content", animation: "marq 40s linear infinite" },
  grp: { display: "flex", alignItems: "center", flex: "0 0 auto" },
  qSpan: { fontFamily: T.serif, fontStyle: "normal", fontWeight: 400, letterSpacing: "0.05em", fontSize: "clamp(21px,2.5vw,36px)", color: T.cream, whiteSpace: "nowrap", padding: "0 18px", lineHeight: 1.2 },
  dia: { color: "rgba(234,216,187,.55)", fontSize: "1.4em", padding: "0 8px", display: "inline-flex", alignItems: "center", lineHeight: 1 },
  ctaWrap: { display: "flex", justifyContent: "center", marginTop: 65, padding: "0 24px" },
  cta: {
    fontFamily: T.sans, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase",
    color: T.cream, background: "transparent", border: `1px solid ${T.cream}`,
    padding: "16px 40px", textDecoration: "none", cursor: "pointer",
    transition: "background .3s ease,color .3s ease",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },

  /* ACT 7 */
  act7: { background: T.cream },
  act7Inner: { maxWidth: 1200, margin: "0 auto" },
  act7CopyH2: { fontFamily: T.serif, fontSize: "clamp(26px,3vw,40px)", color: T.brown, lineHeight: 1.25, margin: 0, fontWeight: 500 },
  badges: { display: "flex", gap: 14, marginTop: 38, flexWrap: "wrap" },
  badge: { background: T.forest, color: T.cream, borderRadius: 999, padding: "11px 26px", fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase" },
};

/* ─── Keyframe injection ─────────────────────────────────────────────────────*/
const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Sans+Pro:wght@300;400;600&display=swap');
@keyframes weaveDrift{0%{transform:translate(0,0)}100%{transform:translate(60px,60px)}}
@keyframes heroYear{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
@keyframes heroFade{from{opacity:0}to{opacity:1}}
@keyframes cueDrop{0%,100%{transform:scaleY(.3);opacity:.3}50%{transform:scaleY(1);opacity:1}}
@keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes revealUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}
@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes charIn{from{opacity:0;transform:translateY(.5em) rotate(4deg)}to{opacity:1;transform:none}}
@keyframes pathDraw{from{stroke-dashoffset:520}to{stroke-dashoffset:0}}
@keyframes pinFade{from{opacity:0}to{opacity:1}}
@keyframes bgScale{from{transform:scale(1.04)}to{transform:scale(1.13)}}
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}
}

/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none !important;  /* IE and Edge */
  scrollbar-width: none !important;  /* Firefox */
}

/* Override parent layout styling only for this page to allow position: sticky to trigger correctly */
#mainContent {
  overflow: visible !important;
}

/* Act 3 Mobile styling overrides */
.heritage-mobile {
  display: none;
}
@media (max-width: 768px) {
  .heritage-desktop {
    display: none !important;
  }
  .heritage-mobile {
    display: block;
  }
  .heritage-section {
    display: block !important;
    min-height: auto !important;
    background: #f6f0e5 !important;
  }
  .heritage-mobile .hero-block {
    position: relative;
    background: #2F4F3E;
    background: linear-gradient(160deg, #2F4F3E 0%, #1e3328 100%);
    padding: 64px 28px 88px;
    text-align: center;
    overflow: hidden;
  }
  .heritage-mobile .eyebrow {
    font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: #EAD8BB;
    margin: 0 0 18px;
  }
  .heritage-mobile .count-wrap {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 76px;
    line-height: 1;
    color: #FAFAF8;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
  }
  .heritage-mobile .count-wrap .plus {
    font-size: 44px;
    margin-top: 6px;
    color: #EAD8BB;
  }
  .heritage-mobile .big-label {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px;
    color: #EAD8BB;
    margin: 8px 0 16px;
  }
  .heritage-mobile .big-sub {
    font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
    color: #d9d1c2;
    font-size: 14.5px;
    line-height: 1.65;
    max-width: 280px;
    margin: 0 auto;
  }
  .heritage-mobile .divider-wave {
    display: block;
    margin-top: -2px;
    width: 100%;
    height: 34px;
  }
  .heritage-mobile .stat-cards {
    background: #f6f0e5;
    padding: 8px 24px 12px;
  }
  .heritage-mobile .stat-card {
    padding: 32px 4px;
    border-bottom: 1px solid rgba(70,55,40,0.18);
    opacity: 0;
    transform: translateY(14px);
    transition: opacity .6s ease, transform .6s ease;
  }
  .heritage-mobile .stat-card:last-child {
    border-bottom: none;
  }
  .heritage-mobile .stat-card.in-view {
    opacity: 1;
    transform: translateY(0);
  }
  .heritage-mobile .stat-card .stat-num {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 30px;
    color: #463925;
    margin: 0 0 2px;
  }
  .heritage-mobile .stat-card .icon-infinity {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 26px;
    color: #463925;
    display: block;
    margin-bottom: 2px;
  }
  .heritage-mobile .stat-card .stat-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-style: italic;
    font-size: 19px;
    color: #2F4F3E;
    margin: 0 0 8px;
  }
  .heritage-mobile .stat-card .stat-desc {
    font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
    color: rgba(70,57,37,.7);
    font-size: 14px;
    line-height: 1.6;
  }
}
`;

/* ─── useIntersect hook ──────────────────────────────────────────────────────*/
function useIntersect(threshold = 0.15): [React.RefObject<any>, boolean] {
  const ref = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── CountUp component ──────────────────────────────────────────────────────*/
function CountUp({ target, suffix = "", active }: { target: number; suffix?: string; active: boolean }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    ran.current = true;
    const dur = 1800, ease = (t: number) => 1 - Math.pow(1 - t, 3);
    let start: number | null = null;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / dur);
      setVal(Math.round(ease(t) * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return <>{val}{suffix}</>;
}

/* ─── AnimChar component ─────────────────────────────────────────────────────*/
function AnimChars({ text, active }: { text: string; active: boolean }) {
  return (
    <span>
      {text.split("").map((ch, i) => (
        <span key={i} style={{
          display: "inline-block",
          opacity: active ? 1 : 0,
          transform: active ? "none" : "translateY(.5em) rotate(4deg)",
          transition: `opacity .5s ease ${i * 0.035}s, transform .5s cubic-bezier(.2,.7,.2,1) ${i * 0.035}s`,
        }}>
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}

/* ─── FadeUp wrapper ─────────────────────────────────────────────────────────*/
function FadeUp({ children, delay = 0, threshold = 0.15 }: { children: React.ReactNode; delay?: number; threshold?: number }) {
  const [ref, vis] = useIntersect(threshold);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(40px)",
      transition: `opacity .9s ease ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ─── Main loader and meta ───────────────────────────────────────────────────*/
export async function loader({request, context}: LoaderFunctionArgs) {
  // Fetch hero image from homepage metafields and About Us specific images
  const aboutUsHandle = (context as any)?.env?.ABOUT_US_IMAGES_HANDLE || 'about-us-images-qporpdzl';
  const [heroMetafields, aboutUsImages] = await Promise.all([
    getHeroMetaobject(context.storefront, 'every-rug-tells-a-story'),
    getAboutUsMetaobject(context.storefront, aboutUsHandle),
  ]);

  const seo = seoPayload.page({
    page: {
      title: 'About Us - Our Story',
      seo: {
        title: 'About Us - Our Story',
        description: 'Woven through time, crafted for today. The story of Haniesta — heritage rugs handmade since 1985, from the subcontinent\'s looms to European homes.',
      }
    },
    url: request.url
  });

  return json({
    seo,
    heroMetafields,
    aboutUsImages,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Our Story — Haniesta'},
    {
      name: 'description',
      content:
        'Woven through time, crafted for today. The story of Haniesta — heritage rugs handmade since 1985, from the subcontinent\'s looms to European homes.',
    },
  ];
};

/* ─── Main component ─────────────────────────────────────────────────────────*/
export default function AboutUs() {
  const {heroMetafields, aboutUsImages} = useLoaderData<typeof loader>();

  // Get images from metafields
  const heroBackgroundImage = aboutUsImages?.heroBackgroundImage?.reference?.image;
  const heroImage = heroBackgroundImage || heroMetafields?.heroImage?.reference?.image;
  const brandStoryImage = aboutUsImages?.brandStoryImage?.reference?.image;
  const heritageImage = aboutUsImages?.heritageImage?.reference?.image;
  const inspirationImage = aboutUsImages?.inspirationImage?.reference?.image;
  const sustainabilityImage = aboutUsImages?.sustainabilityImage?.reference?.image;

  // Unsplash fallback links
  const defaultCraftImg = 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?q=80&w=1600&auto=format&fit=crop';
  const defaultLifestyleImg = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1600&auto=format&fit=crop';

  const chFibreImg = "/images/act4/from_fibre.webp";
  const chLoomImg = "/images/act4/to_loom.webp";
  const chPatternImg = "/images/act4/to_pattern.webp";
  const chFloorImg = "/images/act4/to_floor.webp";

  const CHAPTERS = useMemo(() => [
    {
      cls: "ch-fibre", bg: "#463925", bgImg: chFibreImg, bgPos: "center 35%",
      scrim: "linear-gradient(180deg,rgba(50,38,22,.30),rgba(50,38,22,.74))",
      label: "Chapter One", heading: "From Fibre",
      body: "We begin with the raw material. Wool. Jute. Cotton. Each fibre chosen for how it will feel underfoot decades from now.",
    },
    {
      cls: "ch-loom", bg: "#463925", bgImg: chLoomImg, bgPos: "center 60%",
      scrim: "linear-gradient(180deg,rgba(50,38,22,.30),rgba(50,38,22,.74))",
      label: "Chapter Two", heading: "To Loom",
      body: "Artisans whose craft is generational, not industrial. No two hands weave exactly alike. That\u2019s not a flaw, it\u2019s the point.",
    },
    {
      cls: "ch-pattern", bg: "#463925", bgImg: chPatternImg, bgPos: "right center",
      scrim: "linear-gradient(180deg,rgba(50,38,22,.30),rgba(50,38,22,.74))",
      label: "Chapter Three", heading: "To Pattern",
      body: "Design that bridges the subcontinent and the sitting room. Heritage motifs interpreted for modern European homes.",
    },
    {
      cls: "ch-floor", bg: "#463925", bgImg: chFloorImg, bgPos: "center 65%",
      scrim: "linear-gradient(180deg,rgba(50,38,22,.30),rgba(50,38,22,.74))",
      label: "Chapter Four", heading: "To Floor",
      body: "Every rug arrives complete. A story, compressed into texture. Yours to live on.",
    },
  ], [chFibreImg, chLoomImg, chPatternImg, chFloorImg]);

  /* Act 2 scrollbar track ref & progress calculations */
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleRatio, setVisibleRatio] = useState(0.25);

  const updateScrollProgress = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll);
    } else {
      setScrollProgress(0);
    }
    if (scrollWidth > 0) {
      setVisibleRatio(clientWidth / scrollWidth);
    }
  };

  useEffect(() => {
    updateScrollProgress();
    window.addEventListener('resize', updateScrollProgress);
    return () => window.removeEventListener('resize', updateScrollProgress);
  }, []);

  // Drag to scroll handling for desktop mouse drag
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;
    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDragging = false;
      el.style.scrollSnapType = 'none';
      el.style.cursor = 'grabbing';
      startX = e.pageX - el.offsetLeft;
      scrollLeftStart = el.scrollLeft;
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = 'grab';
        el.style.scrollSnapType = 'x mandatory';
      }
    };

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = 'grab';
        el.style.scrollSnapType = 'x mandatory';
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 3) {
        isDragging = true;
      }
      el.scrollLeft = scrollLeftStart - walk;
    };

    const onClick = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('click', onClick, true);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('click', onClick, true);
    };
  }, []);

  /* Act 3 */
  const [act3Ref, act3Vis] = useIntersect(0.3);
  const [card1Ref, card1Vis] = useIntersect(0.15);
  const [card2Ref, card2Vis] = useIntersect(0.15);

  /* Act 4 sticky scroll */
  const act4Ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [stickyBg, setStickyBg] = useState(CHAPTERS[0].bg);

  useEffect(() => {
    let ticking = false;
    const compute = () => {
      ticking = false;
      const el = act4Ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.max(0, Math.min(0.9999, -rect.top / total)) : 0;
      const idx = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(p * CHAPTERS.length)));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActiveChapter(idx);
        setStickyBg(CHAPTERS[idx].bg);
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(compute); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [CHAPTERS]);

  /* Act 5 grid */
  const [gridRef, gridVis] = useIntersect(0.15);

  /* Act 7 map */
  const [mapRef, mapVis] = useIntersect(0.3);

  /* CTA hover */
  const [ctaHover, setCtaHover] = useState(false);

  /* Marquee quote */
  const QUOTE = "We are not new to rugs, we are simply presenting them a new.";

  const PILLARS = [
    {
      title: "Heritage",
      body: "Forty years on the loom. A continuity of craft passed hand to hand since 1985.",
      icon: <svg style={S.ic} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="8" x2="10" y2="40"/><line x1="19" y1="8" x2="19" y2="40"/><line x1="28" y1="8" x2="28" y2="40"/><line x1="37" y1="8" x2="37" y2="40"/><line x1="6" y1="18" x2="42" y2="18"/><line x1="6" y1="30" x2="42" y2="30"/></svg>,
    },
    {
      title: "Natural Fibres",
      body: "Wool, jute and cotton, chosen for how they wear and soften across decades.",
      icon: <svg style={S.ic} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><path d="M24 42 C 24 24, 12 14, 12 14 C 28 14, 36 24, 24 42 Z"/><line x1="24" y1="42" x2="18" y2="22"/></svg>,
    },
    {
      title: "Global Ecosystem",
      body: "A connected network of artisan workshops spanning the subcontinent.",
      icon: <svg style={S.ic} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="24" cy="24" r="16"/><ellipse cx="24" cy="24" rx="7" ry="16"/><line x1="8" y1="24" x2="40" y2="24"/><line x1="10" y1="16" x2="38" y2="16"/><line x1="10" y1="32" x2="38" y2="32"/></svg>,
    },
    {
      title: "Craftsmanship",
      body: "Generational makers whose individual hands give every rug its character.",
      icon: <svg style={S.ic} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 26 v-9 a2 2 0 0 1 4 0 v8 M20 18 v-3 a2 2 0 0 1 4 0 v8 M24 16 a2 2 0 0 1 4 0 v9 M28 19 a2 2 0 0 1 4 0 v9 c0 7 -4 12 -10 12 c-5 0 -8 -3 -10 -7 l-3 -6 a2 2 0 0 1 3.5 -2 l2.5 4"/></svg>,
    },
    {
      title: "European Homes",
      body: "Heritage motifs reinterpreted for the modern UK and European interior.",
      icon: <svg style={S.ic} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 23 L24 10 L39 23"/><path d="M13 21 v17 h22 v-17"/><rect x="21" y="29" width="6" height="9"/></svg>,
    },
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={S.root}>

        {/* ── ACT 1 HERO ──────────────────────────────────────────────────── */}
        <section style={S.act1}>
          <div style={S.weave} />
          <div style={S.year}>1985</div>
          <div style={S.rule} />
          <p style={S.tagline}>Woven Through Time. Crafted for Today.</p>
          <div style={S.scrollcue}>
            Scroll<span style={S.cueLine} />
          </div>
        </section>

        {/* ── ACT 2 TIMELINE ──────────────────────────────────────────────── */}
        <section style={S.act2}>
          <div style={S.act2Head}>
            <FadeUp><p style={S.kicker}>Since 1985</p></FadeUp>
            <FadeUp delay={0.1}><h2 style={S.act2H2}>Our Journey</h2></FadeUp>
          </div>
          <FadeUp threshold={0.1}>
            <div
              ref={trackRef}
              style={S.track}
              className="no-scrollbar"
              onScroll={updateScrollProgress}
            >
              {[
                { yr: "1985", txt: "A single loom. Skilled hands. The belief that craft outlasts trend." },
                { yr: "2000s", txt: "A growing network of artisan workshops across the subcontinent." },
                { yr: "2015", txt: "Global collaborations. Connecting craft to contemporary European design." },
                { yr: "Today", txt: "Haniesta. Operating from the UK. Bringing heritage to modern homes." },
              ].map((c, i) => (
                <article key={i} style={{ ...S.mcard, opacity: 1, transform: "none", transitionDelay: `${i * 150}ms` }}>
                  <div style={S.mcardYr}>{c.yr}</div>
                  <p style={S.mcardP}>{c.txt}</p>
                </article>
              ))}
            </div>
          </FadeUp>
          {/* Custom premium scrollbar */}
          {(() => {
            const ratio = isNaN(visibleRatio) || visibleRatio <= 0 ? 0.25 : visibleRatio;
            const progress = isNaN(scrollProgress) || scrollProgress < 0 ? 0 : scrollProgress;
            const thumbWidth = Math.max(10, Math.min(100, ratio * 100));
            const thumbLeft = Math.max(0, Math.min(100 - thumbWidth, progress * (100 - thumbWidth)));
            return (
              <div style={{
                position: "relative",
                width: "280px",
                height: "2px",
                background: "rgba(70, 57, 37, 0.15)",
                margin: "24px auto 12px",
                borderRadius: "2px",
              }}>
                <div style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${thumbLeft}%`,
                  width: `${thumbWidth}%`,
                  background: "#463925",
                  borderRadius: "2px",
                }} />
              </div>
            );
          })()}
          <p style={S.railnote}>Drag to explore the timeline &rarr;</p>
        </section>

        {/* ── ACT 3 SPLIT COUNTERS ────────────────────────────────────────── */}
        <section ref={act3Ref} style={S.act3} className="heritage-section">
          {/* DESKTOP View */}
          <div className="heritage-desktop" style={{ position: "absolute", inset: 0 }}>
            <div style={{
              ...S.act3Left,
              transform: act3Vis ? "none" : "translateX(-100%)",
              transition: "transform 1.1s cubic-bezier(.2,.7,.2,1)",
            }}>
              <div>
                <div style={S.bigNum}><CountUp target={39} suffix="+" active={act3Vis} /></div>
                <div style={S.bigLbl}>Years of Heritage</div>
                <p style={S.bigDesc}>Four decades of uninterrupted craft, from 1985 to now.</p>
              </div>
            </div>
            <div style={{
              ...S.act3Right,
              transform: act3Vis ? "none" : "translateX(100%)",
              transition: "transform 1.1s cubic-bezier(.2,.7,.2,1)",
            }}>
              <div style={S.rightStack}>
                <div>
                  <div style={S.rightNum}><CountUp target={100} suffix="%" active={act3Vis} /></div>
                  <div style={S.rightLbl}>Natural Fibres</div>
                  <p style={S.rightDesc}>Wool, jute and cotton, nothing synthetic underfoot.</p>
                </div>
                <div>
                  <div style={S.rightNum}>&infin;</div>
                  <div style={S.rightLbl}>Artisan Communities</div>
                  <p style={S.rightDesc}>An ever-growing ecosystem of generational makers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE View */}
          <div className="heritage-mobile">
            <div className="hero-block">
              <p className="eyebrow">Since 1985</p>
              <div className="count-wrap">
                <CountUp target={39} active={act3Vis} />
                <span className="plus">+</span>
              </div>
              <p className="big-label">Years of Heritage</p>
              <p className="big-sub">Four decades of uninterrupted craft, from 1985 to now.</p>
            </div>

            <svg className="divider-wave" viewBox="0 0 400 34" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 C100,34 300,0 400,20 L400,34 L0,34 Z" fill="#f6f0e5"></path>
            </svg>

            <div className="stat-cards">
              <div ref={card1Ref} className={`stat-card ${card1Vis ? 'in-view' : ''}`}>
                <p className="stat-num">100%</p>
                <p className="stat-title">Natural Fibres</p>
                <p className="stat-desc">Wool, jute and cotton, nothing synthetic underfoot.</p>
              </div>
              <div ref={card2Ref} className={`stat-card ${card2Vis ? 'in-view' : ''}`}>
                <span className="icon-infinity">∞</span>
                <p className="stat-title">Artisan Communities</p>
                <p className="stat-desc">An ever-growing ecosystem of generational makers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACT 4 STICKY WEAVE ──────────────────────────────────────────── */}
        <section ref={act4Ref} style={S.act4}>
          <div style={{ ...S.act4Sticky, backgroundColor: stickyBg }}>
            {/* progress dots */}
            <div style={S.progress}>
              {CHAPTERS.map((_, i) => (
                <span key={i} style={{ ...S.dot, ...(i === activeChapter ? S.dotOn : {}) }} />
              ))}
            </div>
            {/* chapters */}
            {CHAPTERS.map((ch, i) => {
              const isActive = i === activeChapter;
              return (
                <div key={i} style={{ ...S.chapter, ...(isActive ? { opacity: 1 } : {}) }}>
                  <div style={{
                    ...S.chBg,
                    backgroundColor: ch.bg,
                    backgroundImage: `url('${ch.bgImg}')`,
                    backgroundPosition: ch.bgPos,
                    ...(isActive ? { transform: "scale(1.13)" } : {}),
                  }} />
                  <div style={{ ...S.chScrim, background: ch.scrim }} />
                  <div style={S.chInner}>
                    <span style={S.chI}>{ch.label}</span>
                    <h2 style={S.chH2}><AnimChars text={ch.heading} active={isActive} /></h2>
                    <p style={S.chBody}>{ch.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ACT 5 PILLARS ───────────────────────────────────────────────── */}
        <section style={S.act5}>
          <div style={S.act5Head}>
            <FadeUp><p style={S.kicker}>The Foundations</p></FadeUp>
            <FadeUp delay={0.1}><h2 style={S.act5H2}>What Defines Haniesta</h2></FadeUp>
          </div>
          <div ref={gridRef} style={S.grid}>
            {PILLARS.map((p, i) => (
              <article key={i} style={{
                ...S.pcard,
                opacity: gridVis ? 1 : 0,
                transform: gridVis ? "none" : "translateY(40px)",
                transition: `opacity .8s ease ${i * 120}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${i * 120}ms`,
              }}>
                {p.icon}
                <h3 style={S.pcardH3}>{p.title}</h3>
                <p style={S.pcardP}>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── ACT 6 MARQUEE ───────────────────────────────────────────────── */}
        <section style={S.act6}>
          <div style={S.marqueeWrap}>
            {[0, 1].map(g => (
              <div key={g} style={S.grp}>
                {[0, 1, 2].map(j => (
                  <span key={j} style={{ display: "inline-flex", alignItems: "center" }}>
                    <span style={S.qSpan}>{QUOTE}</span>
                    <span style={S.dia}>&#9670;</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div style={S.ctaWrap}>
            <a
              href="/collections/all"
              style={{ ...S.cta, ...(ctaHover ? { background: T.cream, color: T.brown } : {}) }}
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
            >
              Explore Our Rugs &rarr;
            </a>
          </div>
        </section>

        {/* ── ACT 7 MAP CLOSE ─────────────────────────────────────────────── */}
        <section style={S.act7} className="px-6 py-16 md:px-12 md:pt-[130px] md:pb-[140px]">
          <div style={S.act7Inner} className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-20 items-center">
            <svg ref={mapRef} style={{ width: "100%", height: "auto" }} viewBox="0 0 520 360" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="none" stroke={T.forest} strokeWidth="2" strokeDasharray="8 7"
                d="M120 250 C 200 120, 320 300, 400 110"
                style={{
                  strokeDashoffset: mapVis ? 0 : 520,
                  transition: "stroke-dashoffset 2.6s ease",
                }}
              />
              <circle cx="120" cy="250" r="7" fill={T.forest}
                style={{ opacity: mapVis ? 1 : 0, transition: "opacity .6s ease" }} />
              <circle cx="400" cy="110" r="7" fill={T.forest}
                style={{ opacity: mapVis ? 1 : 0, transition: "opacity .6s ease 2.2s" }} />
              <text x="120" y="282" textAnchor="middle" fill={T.brown}
                style={{
                  opacity: mapVis ? 0.85 : 0,
                  transition: "opacity .6s ease",
                  fontFamily: T.sans,
                  fontSize: "15px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase"
                }}>
                The Subcontinent
              </text>
              <text x="400" y="92" textAnchor="middle" fill={T.brown}
                style={{
                  opacity: mapVis ? 0.85 : 0,
                  transition: "opacity .6s ease 2.2s",
                  fontFamily: T.sans,
                  fontSize: "15px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase"
                }}>
                United Kingdom
              </text>
            </svg>
            <div>
              <FadeUp><p style={{ ...S.kicker, marginBottom: 22 }}>One Thread</p></FadeUp>
              <FadeUp delay={0.1}>
                <h2 style={S.act7CopyH2}>
                  &ldquo;From the subcontinent&rsquo;s looms to European homes, one thread, forty years, one name.&rdquo;
                </h2>
              </FadeUp>
              <FadeUp delay={0.2}>
                <div style={S.badges}>
                  <span style={S.badge}>Est. 1985</span>
                  <span style={S.badge}>Now in the UK</span>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
