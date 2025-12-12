interface SkeletonCardProps {
  type?: 'business' | 'event' | 'product' | 'simple';
}

export const SkeletonCard = ({ type = 'simple' }: SkeletonCardProps) => {
  if (type === 'business') {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div className="shimmer bg-gray-200 w-20 h-20 rounded-lg mb-4"></div>
        <div className="shimmer bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
        <div className="shimmer bg-gray-200 h-4 w-full rounded mb-2"></div>
        <div className="shimmer bg-gray-200 h-4 w-2/3 rounded mb-4"></div>
        <div className="shimmer bg-gray-200 h-10 w-full rounded"></div>
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
        <div className="shimmer bg-gray-200 w-full h-48"></div>
        <div className="p-4 space-y-3">
          <div className="shimmer bg-gray-200 h-6 w-3/4 rounded"></div>
          <div className="shimmer bg-gray-200 h-4 w-full rounded"></div>
          <div className="shimmer bg-gray-200 h-4 w-2/3 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'product') {
    return (
      <div className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
        <div className="shimmer bg-gray-200 w-full h-64"></div>
        <div className="p-4 space-y-3">
          <div className="shimmer bg-gray-200 h-5 w-2/3 rounded"></div>
          <div className="shimmer bg-gray-200 h-6 w-1/3 rounded"></div>
          <div className="shimmer bg-gray-200 h-10 w-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse space-y-4">
      <div className="shimmer bg-gray-200 h-4 w-3/4 rounded"></div>
      <div className="shimmer bg-gray-200 h-4 w-full rounded"></div>
      <div className="shimmer bg-gray-200 h-4 w-5/6 rounded"></div>
    </div>
  );
};
