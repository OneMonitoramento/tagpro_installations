// Path: ./src/components/SkeletonLoader.tsx

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
    />
  );
};

// Skeleton para card de placa
export const PlacaCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="space-y-1">
      <Skeleton className="w-32 h-3" />
      <Skeleton className="w-24 h-3" />
    </div>
  </div>
);

// Skeleton para lista de placas
export const PlacaListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <PlacaCardSkeleton key={index} />
    ))}
  </div>
);

// Skeleton para estatísticas
export const EstatisticasCardSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="w-6 h-6" />
      <Skeleton className="w-24 h-5" />
    </div>
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center">
          <Skeleton className="w-8 h-6 mx-auto mb-1" />
          <Skeleton className="w-12 h-3 mx-auto" />
        </div>
      ))}
    </div>
    <div className="mt-4">
      <Skeleton className="w-full h-2 rounded-full" />
      <Skeleton className="w-16 h-3 mx-auto mt-1" />
    </div>
  </div>
);

// Skeleton para header de informações
export const InfoHeaderSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div>
            <Skeleton className="w-20 h-3 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
      ))}
    </div>
    
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-20 h-3" />
      </div>
      <Skeleton className="w-full h-3 rounded-full" />
    </div>
  </div>
);

// Skeleton para tabs
export const TabsSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="py-4 px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-6 h-4 rounded-full" />
            </div>
          </div>
        ))}
      </nav>
    </div>
    
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-24 h-4" />
      </div>
      <PlacaListSkeleton count={3} />
    </div>
  </div>
);

// Skeleton completo do dashboard
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <Skeleton className="w-48 h-6 mb-1" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-24 h-8 rounded-lg" />
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Info Header */}
      <InfoHeaderSkeleton />
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <EstatisticasCardSkeleton />
        <EstatisticasCardSkeleton />
      </div>
      
      {/* Tabs e Lista */}
      <TabsSkeleton />
    </div>
  </div>
);

export default Skeleton;