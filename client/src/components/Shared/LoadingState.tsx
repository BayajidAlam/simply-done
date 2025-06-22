import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="h-8 w-12 bg-slate-200 rounded mb-1 animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-8 w-12 bg-slate-200 rounded mb-1 animate-pulse"></div>
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Create Note Skeleton */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
                <div className="h-5 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border-2 border-slate-200 rounded-xl p-4 animate-pulse"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                    <div className="h-5 bg-slate-200 rounded-full w-20"></div>
                  </div>
                </div>
                <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="mb-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingState;