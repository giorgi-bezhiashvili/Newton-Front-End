export default function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 max-w-sm w-full mx-auto animate-pulse">
      {/* სურათის ადგილი */}
      <div className="animate-pulse bg-gray-300 h-48 w-full rounded-md mb-4"></div>
      {/* სათაურის ადგილი */}
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      {/* ტექსტის ადგილი */}
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
}
