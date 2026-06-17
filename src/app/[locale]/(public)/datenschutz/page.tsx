export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-gray-500">
        Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
      </p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          1. Verantwortliche Stelle
        </h2>
        <p className="text-sm text-gray-600">
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:
        </p>
        <address className="not-italic text-sm text-gray-700">
          <p>Linkify Jobs GmbH</p>
          <p>Musterstraße 1</p>
          <p>10115 Berlin</p>
          <p>
            E-Mail:{" "}
            <a href="mailto:datenschutz@linkify-jobs.de" className="text-blue-600 hover:underline">
              datenschutz@linkify-jobs.de
            </a>
          </p>
        </address>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          2. Erhebung und Speicherung personenbezogener Daten
        </h2>
        <p className="text-sm text-gray-600">
          Beim Besuch unserer Website werden automatisch Informationen in sogenannten
          Server-Log-Dateien gespeichert, die Ihr Browser automatisch übermittelt.
          Dies sind: Browsertyp und -version, Betriebssystem, Referrer-URL,
          Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und
          IP-Adresse.
        </p>
        <p className="text-sm text-gray-600">
          Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit
          anderen Datenquellen zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1
          lit. f DSGVO (berechtigtes Interesse).
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          3. Registrierung und Nutzerkonto
        </h2>
        <p className="text-sm text-gray-600">
          Zur Nutzung unserer Dienste können Sie sich mit Ihrem Google- oder
          LinkedIn-Konto registrieren (OAuth 2.0). Dabei werden folgende Daten
          verarbeitet: Name, E-Mail-Adresse und Profilbild. Diese Daten werden
          ausschließlich zur Bereitstellung des Dienstes verwendet. Rechtsgrundlage
          ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">4. Cookies</h2>
        <p className="text-sm text-gray-600">
          Unsere Website verwendet Cookies. Dabei handelt es sich um kleine
          Textdateien, die auf Ihrem Endgerät gespeichert werden. Wir nutzen
          ausschließlich technisch notwendige Cookies (Session-Cookies für die
          Authentifizierung). Diese erfordern keine Einwilligung gemäß
          Art. 6 Abs. 1 lit. f DSGVO. Es werden keine Tracking- oder
          Werbe-Cookies eingesetzt.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          5. Weitergabe von Daten an Dritte
        </h2>
        <p className="text-sm text-gray-600">
          Ihre personenbezogenen Daten werden nicht an Dritte weitergegeben, es sei
          denn, dies ist zur Vertragserfüllung erforderlich oder Sie haben
          ausdrücklich eingewilligt. Eine Übermittlung in Drittländer erfolgt nur,
          sofern ein angemessenes Datenschutzniveau (z.&nbsp;B. EU-Standardvertragsklauseln)
          gewährleistet ist.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          6. Ihre Rechte
        </h2>
        <p className="text-sm text-gray-600">
          Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer
          personenbezogenen Daten:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
          <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
        </ul>
        <p className="text-sm text-gray-600">
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an{" "}
          <a
            href="mailto:datenschutz@linkify-jobs.de"
            className="text-blue-600 hover:underline"
          >
            datenschutz@linkify-jobs.de
          </a>
          .
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          7. Beschwerderecht bei der Aufsichtsbehörde
        </h2>
        <p className="text-sm text-gray-600">
          Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über
          die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
          Die zuständige Aufsichtsbehörde ist der Berliner Beauftragte für
          Datenschutz und Informationsfreiheit.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">
          8. Datensicherheit
        </h2>
        <p className="text-sm text-gray-600">
          Wir treffen geeignete technische und organisatorische Maßnahmen, um
          Ihre Daten gegen zufällige oder vorsätzliche Manipulation, Verlust,
          Zerstörung oder den Zugriff unberechtigter Personen zu schützen. Alle
          Daten werden verschlüsselt (TLS/HTTPS) übertragen.
        </p>
      </section>

      <p className="mt-12 text-xs text-gray-400">
        Stand: Juni 2025 | Diese Datenschutzerklärung wird regelmäßig aktualisiert.
      </p>
    </div>
  );
}
