import type {FaqItem, FaqSection} from '~/data/faq';
import {FAQ_CONTACT_ITEMS} from '~/data/faq';

export function faqQuestionId(sectionId: string, question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sectionId}-${slug}`;
}

export type FaqTocEntry = {
  id: string;
  question: string;
  sectionId: string;
  sectionTitle: string;
};

export function getFaqTableOfContents(
  sections: FaqSection[],
): FaqTocEntry[] {
  return sections.flatMap((section) =>
    section.items.map((item) => ({
      id: faqQuestionId(section.id, item.question),
      question: item.question,
      sectionId: section.id,
      sectionTitle: section.title,
    })),
  );
}

/** Scroll to a FAQ anchor; works on repeat clicks (native # links do not). */
export function scrollToFaqAnchor(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({behavior: 'smooth', block: 'start'});
  const nextHash = `#${id}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(null, '', nextHash);
  }
}

export function getAllFaqItems(sections: FaqSection[]): Array<
  FaqItem & {
    id: string;
    sectionId: string;
    sectionTitle: string;
  }
> {
  const main = sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      id: faqQuestionId(section.id, item.question),
      sectionId: section.id,
      sectionTitle: section.title,
    })),
  );
  const contact = FAQ_CONTACT_ITEMS.map((item) => ({
    ...item,
    id: faqQuestionId('contact', item.question),
    sectionId: 'contact',
    sectionTitle: 'Contact & Support',
  }));
  return [...main, ...contact];
}
