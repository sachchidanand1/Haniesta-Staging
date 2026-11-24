import StarRating from "~/components/StarRating";

function truncate(text: string, max = 260): string {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

function maskEmail(email: string): string {
  const [u, d] = String(email).split("@");
  if (!u || !d) return String(email || "");
  const visible = Math.min(3, Math.max(1, u.length - 1));
  return `${u.slice(0, visible)}***@${d}`;
}

function deriveNameFromEmail(email?: string): string {
  const local = String(email || "").split("@")[0] || "";
  if (!local) return "Anonymous";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function getReviewerDisplay(rev: any): { name: string; maskedEmail: string } {
  const email = rev?.reviewer?.email ? String(rev.reviewer.email) : "";
  const rawName = rev?.reviewer?.name ? String(rev.reviewer.name) : "";
  const generic = new Set(["customer", "anonymous", "guest", "shopper", "unknown", "n/a", "na"]);
  let name = rawName.trim();
  if (!name || generic.has(name.toLowerCase())) {
    name = deriveNameFromEmail(email);
  }
  return { name, maskedEmail: email ? maskEmail(email) : "" };
}

export function JudgeMeTestimonials({ reviews = [] as any[] }: {reviews?: any[]}) {
  const colorVar = "var(--color-product-reviews)"; // retained for potential future use

  // Normalize minimal shape used by this component
  const items = Array.isArray(reviews)
    ? (reviews as any[]).map((r: any) => ({
        id: r?.id ?? r?._id ?? r?.created_at ?? Math.random().toString(36).slice(2),
        title: (r?.title ?? "").toString(),
        body: (r?.body ?? "").toString(),
        rating: Number(r?.rating ?? 0),
        reviewer: r?.reviewer || {},
        created_at: r?.created_at,
      }))
    : [];

  if (!items.length) return null;

  return (
    <section className="py-20 bg-white">
      <div className="px-6 sm:px-12 lg:px-16 xl:px-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl text-emerald-900 font-light tracking-wide">
            Customer Testimonials
          </h2>
          <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mx-auto mt-3" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t) => {
            const who = getReviewerDisplay(t);
            return (
              <article
                key={t.id}
                className="bg-haniesta-cream/40 border border-haniesta-brown/10 p-6 md:p-7 lg:p-8"
              >
                {/* Visual placeholder to match card mock (image area) */}
                <div className="bg-white/80 border border-haniesta-brown/10 h-40 sm:h-44 w-full mb-6" />
                {/* Stars */}
                <div className="flex items-center mb-3 text-amber-500">
                  <StarRating rating={t.rating} className="[&>svg]:h-5 [&>svg]:w-5" colorClass="text-amber-500" />
                </div>

                {/* Content */}
                <div className="text-haniesta-brown">
                  {t.title ? (
                    <p className="text-sm sm:text-base italic leading-relaxed break-words">“{truncate(t.title, 140)}”</p>
                  ) : null}
                  {t.body ? (
                    <p className="mt-2 text-sm sm:text-base leading-relaxed opacity-80 break-words italic">“{truncate(t.body, 320)}”</p>
                  ) : null}
                </div>

                {/* Author */}
                <p className="mt-6 text-xs text-haniesta-brown/70">
                  – {who.name}
                  {who.maskedEmail ? ` • ${who.maskedEmail}` : ""}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default JudgeMeTestimonials;
