export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-xl font-bold text-gray-900">System Access</h1>
        <a
          href="/api/auth/signin?callbackUrl=/de/myhome"
          className="flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Anmelden
        </a>
      </div>
    </div>
  );
}
