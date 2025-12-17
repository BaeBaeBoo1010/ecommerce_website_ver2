import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 text-6xl">📦</div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Sản phẩm không tồn tại
      </h1>
      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        Sản phẩm bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc đường dẫn
        không chính xác.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Xem tất cả sản phẩm
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
