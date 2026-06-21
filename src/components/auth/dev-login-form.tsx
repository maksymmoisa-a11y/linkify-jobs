export function DevLoginForm() {
  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <p className="mb-3 text-center text-xs font-medium text-orange-600">
        Dev Login (nur Entwicklung)
      </p>
      <form action="/api/auth/callback/credentials" method="POST">
        <input type="hidden" name="email" value="test@linkify-jobs.de" />
        <input type="hidden" name="callbackUrl" value="/de/app" />
        <button
          type="submit"
          className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer"
        >
          Dev Login
        </button>
      </form>
    </div>
  );
}
