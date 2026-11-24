import StarRating from '~/components/StarRating';

export function CustomerTestimonials({nodes}: {nodes?: any[]}) {
  const items = Array.isArray(nodes)
    ? nodes.map((t: any) => {
        const img = t?.avatar?.reference?.image;
        return {
          id: t.id,
          name: t?.authorName?.value ?? '',
          role: t?.role?.value ?? '',
          rating: Math.max(0, Math.min(5, Number(t?.rating?.value ?? 0))),
          title: t?.title?.value ?? '',
          text: t?.quote?.value ?? '',
          image: img?.url ?? '',
          alt: img?.altText ?? (t?.authorName?.value ?? ''),
        };
      })
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
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-haniesta-cream/40 border border-haniesta-brown/10 p-6 md:p-7 lg:p-8"
            >
              {/* Visual placeholder to match card mock (image area) */}
              <div className="bg-white/80 border border-haniesta-brown/10 h-40 sm:h-44 w-full mb-6" />

              {/* Stars */}
              <div className="flex items-center mb-3 text-amber-500">
                <StarRating rating={t.rating} className="[&>svg]:h-5 [&>svg]:w-5" colorClass="text-amber-500" />
              </div>

              {/* Quote */}
              <div className="text-haniesta-brown">
                {t.title && (
                  <p className="text-sm sm:text-base italic leading-relaxed break-words">“{t.title}”</p>
                )}
                {t.text && (
                  <p className="mt-2 text-sm sm:text-base leading-relaxed opacity-80 break-words">“{t.text}”</p>
                )}
              </div>

              {/* Author */}
              <p className="mt-6 text-xs text-haniesta-brown/70">– {t.name}{t.role ? ` • ${t.role}` : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
