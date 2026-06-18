import { useTranslations } from "next-intl";
import { LoginButtons } from "@/components/auth/login-buttons";
import { DevLoginForm } from "@/components/auth/dev-login-form";

export default function AuthPage() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white px-8 py-10 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
              {t("loginTitle")}
            </h1>
            <p className="mt-2 text-sm text-gray-500">{t("noAccount")}</p>
          </div>

          {/* OAuth Buttons */}
          <LoginButtons callbackUrl="/app" />

          {/* Dev Login */}
          <DevLoginForm />

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-400">{t("terms")}</p>
        </div>
      </div>
    </div>
  );
}
