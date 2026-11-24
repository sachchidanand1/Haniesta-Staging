import clsx from 'clsx';

export function CartSkeleton({layout}: {layout: 'page' | 'drawer'}) {
  const container = {
    drawer: 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };

  return (
    <div className={container[layout]}>
      <CartLinesSkeleton layout={layout} />
      <CartSummarySkeleton layout={layout} />
    </div>
  );
}

function CartLinesSkeleton({layout}: {layout: 'page' | 'drawer'}) {
  const className = clsx([
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : 'px-6 pb-6 sm-max:pt-2 overflow-auto transition md:px-12',
  ]);

  return (
    <section aria-labelledby="cart-contents-skeleton" className={className}>
      <ul className="grid gap-6 md:gap-10">
        <SkeletonLineItem />
        {/* <SkeletonLineItem /> */}
        {/* <SkeletonLineItem /> */}
      </ul>
    </section>
  );
}

function SkeletonLineItem() {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-primary/10 rounded animate-pulse" />
      </div>
      <div className="flex justify-between flex-grow">
        <div className="grid gap-2 w-full">
          <div className="h-4 w-2/3 bg-primary/10 rounded animate-pulse" />
          <div className="grid pb-2 gap-2">
            <div className="h-3 w-1/3 bg-primary/10 rounded animate-pulse" />
            <div className="h-3 w-1/4 bg-primary/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded px-2 py-2 gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded animate-pulse" />
              <div className="w-6 h-6 bg-primary/10 rounded animate-pulse" />
              <div className="w-8 h-8 bg-primary/10 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-4 bg-primary/10 rounded animate-pulse" />
      </div>
    </li>
  );
}

function CartSummarySkeleton({layout}: {layout: 'page' | 'drawer'}) {
  const summary = {
    drawer: 'grid gap-4 p-6 border-t md:px-12',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/20 rounded w-full',
  };
  return (
    <section aria-labelledby="summary-skeleton" className={summary[layout]}>
      <div className="grid gap-3">
        <div className="grid pb-2 gap-2">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 bg-primary/10 rounded animate-pulse" />
            <div className="h-5 w-24 bg-primary/10 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid pb-2 gap-2">
          <div className="h-8 mb-2 w-full bg-primary/10 rounded animate-pulse" />
        </div>
        <div className="grid pb-2 gap-2">
          <div className="h-8 mb-2 w-full bg-primary/10 rounded animate-pulse" />
        </div>
      </div>
    </section>
  );
}
