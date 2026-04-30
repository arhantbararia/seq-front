import React from "react";

export const metadata = {
  title: "Terms & Privacy",
  description: "Terms of Service and Privacy Policy",
};

export default function TermsAndPrivacyPage() {
  const effectiveDate = "April 30, 2026";

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service & Privacy Policy</h1>

      <p className="text-sm text-gray-600 mb-6">Effective date: {effectiveDate}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
        <p>
          These Terms of Service and Privacy Policy (together, the "Agreement") govern your access to
          and use of this website and services. By using the service you agree to these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">2. Terms of Service</h2>
        <h3 className="font-medium mt-3">Acceptable Use</h3>
        <p>
          You agree to use the service lawfully and not to attempt to disrupt, reverse-engineer,
          or otherwise misuse the platform. You are responsible for any content you upload or
          publish using the service.
        </p>

        <h3 className="font-medium mt-3">Accounts</h3>
        <p>
          When you create an account you must provide accurate information and are responsible for
          activity on your account. We may suspend or terminate accounts that violate these terms.
        </p>

        <h3 className="font-medium mt-3">Intellectual Property</h3>
        <p>
          Unless otherwise indicated, the service and its original content, features and
          functionality are owned by the project maintainers. Your individual contributions may be
          licensed under open-source terms as described in the relevant plugin repository.
        </p>

        <h3 className="font-medium mt-3">Liability</h3>
        <p>
          To the extent permitted by law, the service is provided "as is" and we disclaim
          warranties and liability for damages arising from use of the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">3. Open Source Plugins & Contributions</h2>
        <p>
          Many plugins and integrations provided with this project are open-source. Source code is
          available in public Git repositories and contributions are welcome. When contributing,
          you should follow the contribution guidelines in the corresponding repository. By
          submitting a contribution you grant the project maintainers the rights described in the
          repository's license and contribution policy.
        </p>

        <p className="mt-3">
          If you would like to link to or reference the repository, replace the placeholder below
          with the actual repository URL: <a href="#">[GitHub Repository]</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">4. Privacy Policy</h2>

        <h3 className="font-medium mt-3">Information We Collect</h3>
        <p>
          We may collect information you provide directly (for example, account information),
          information about your use of the service (logs, analytics), and data required for
          integrations with third-party services.
        </p>

        <h3 className="font-medium mt-3">How We Use Information</h3>
        <p>
          We use information to operate, maintain and improve the service, to communicate with
          you, and to comply with legal obligations. We do not sell personal information.
        </p>

        <h3 className="font-medium mt-3">Third-Party Services</h3>
        <p>
          The service may use third-party providers (analytics, hosting, payment processors).
          Those providers have their own privacy policies and obligations.
        </p>

        <h3 className="font-medium mt-3">Data Security</h3>
        <p>
          We take reasonable measures to protect data, but no method of transmission or storage
          is completely secure. You should take care when sharing sensitive information.
        </p>

        <h3 className="font-medium mt-3">Your Rights</h3>
        <p>
          Depending on your jurisdiction you may have rights to access, correct or delete your
          personal data. To exercise these rights, please contact the maintainers via the
          repository or the contact method provided by the project.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">5. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Major changes will be communicated via the
          website or repository. Continued use after changes constitutes acceptance of the new
          terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">6. Governing Law</h2>
        <p>
          These terms are governed by the laws of India. Exclusive jurisdiction for any dispute
          will be the courts located in Delhi, India.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">7. Contact</h2>
        <p>
          For questions about these terms or the privacy policy, please open an issue or contact
          the maintainers through the project's GitHub repository.
        </p>
      </section>
    </main>
  );
}
