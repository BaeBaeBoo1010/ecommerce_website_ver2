export default function ProductSwiperSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 flex-1 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
