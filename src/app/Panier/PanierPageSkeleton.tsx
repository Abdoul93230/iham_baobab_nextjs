import React from "react";

export default function PanierPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-20">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Title Skeleton */}
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-6"></div>

          {/* Zone Selector Skeleton */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="w-full h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items Skeleton */}
            <div className="xl:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Product Items Skeleton */}
                  <div className="space-y-3">
                    {[1, 2].map((j) => (
                      <div key={j} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                              <div className="w-40 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                              <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Skeleton */}
            <div className="space-y-4 order-first xl:order-last">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Command Bar Skeleton */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white p-3 shadow-lg border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
