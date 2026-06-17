export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Impressum</h1>
      <p className="mt-2 text-sm text-gray-500">Angaben gemäß § 5 TMG</p>

      <section className="mt-10 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Anbieter</h2>
        <p className="text-gray-700">Linkify Jobs GmbH</p>
        <p className="text-gray-700">Musterstraße 1</p>
        <p className="text-gray-700">10115 Berlin</p>
        <p className="text-gray-700">Deutschland</p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Kontakt</h2>
        <p className="text-gray-700">
          <span className="font-medium">E-Mail:</span>{" "}
          <a
            href="mailto:kontakt@linkify-jobs.de"
            className="text-blue-600 hover:underline"
          >
            kontakt@linkify-jobs.de
          </a>
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Telefon:</span> +49 30 000000000
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Vertretungsberechtigte Person
        </h2>
        <p className="text-gray-700">Max Mustermann, Geschäftsführer</p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Handelsregister
        </h2>
        <p className="text-gray-700">
          <span className="font-medium">Registergericht:</span> Amtsgericht Berlin-Charlottenburg
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Registernummer:</span> HRB 123456
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Umsatzsteuer-ID</h2>
        <p className="text-gray-700">
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
        </p>
        <p className="text-gray-700">DE 000000000</p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
        </h2>
        <p className="text-gray-700">Max Mustermann</p>
        <p className="text-gray-700">Musterstraße 1</p>
        <p className="text-gray-700">10115 Berlin</p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Online-Streitbeilegung
        </h2>
        <p className="text-sm text-gray-600">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
      </section>

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Haftungsausschluss
        </h2>
        <p className="text-sm text-gray-600">
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
          jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß
          § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich.
        </p>
      </section>
    </div>
  );
}
