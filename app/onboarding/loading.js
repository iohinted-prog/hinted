export default function Loading() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-slate-800">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[30px] border border-[#efd8ce] bg-white p-8 text-center shadow-[0_25px_80px_rgba(173,101,72,0.14)]">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#fff1ea] p-3">
            <div className="h-full w-full animate-spin rounded-full border-2 border-[#f6d8ca] border-t-[#f36f64]" />
          </div>

          <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
            We’re getting your profile ready
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Pulling everything together so your space feels personal from the start.
          </p>

          <div className="mt-6 rounded-full bg-[#f5eee9] p-1">
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[#ff946d] to-[#f36f64]" />
          </div>
        </div>
      </div>
    </main>
  );
}
