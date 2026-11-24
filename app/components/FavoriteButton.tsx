import {IconHeart, IconHeartFilled} from '~/components/Icon';
import {useFavorites} from '~/hooks/useFavorites';

export function FavoriteButton({
  productId,
  className = '',
  size = 'md',
}: {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const {isFavorite, toggle} = useFavorites();

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  } as const;

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  } as const;

  const active = isFavorite(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      className={`group relative inline-flex items-center justify-center rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 p-0 leading-none aspect-square ${
        active
          ? 'bg-white/20 border-red-500 text-red-600 hover:bg-gray-100 focus:ring-red-200'
          : 'bg-white/20 border-black/10 text-gray-700 hover:bg-gray-100 focus:ring-gray-200'
      } shadow-sm hover:shadow ${sizeClasses[size]} ${className}`}
      style={{zIndex: 10, pointerEvents: 'auto'}}
    >
      {active ? (
        <IconHeartFilled className={`${iconSize[size]} text-red-600 block relative top-px`} />
      ) : (
        <IconHeart className={`${iconSize[size]} group-hover:text-red-600 block relative top-px`} />
      )}
    </button>
  );
}


