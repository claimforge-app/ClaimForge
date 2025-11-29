export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="w-full border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400 to-emerald-400 flex items-center justify-center text-black font-bold text-xs">
            RF
          </div>
          <div>
            <div className="font-semibold tracking-tight">ResolveForge</div>
            <div className="text-xs text-neutral-400 -mt-1">Privacy Policy</div>
          </div>
        </div>
        <a
          href="/"
          className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-neutral-800 text-neutral-300 hover:bg-neutral-900 transition"
        >
          Back to homepage
        </a>
      </header>

      <section className="flex-1 px-6 md:px-12 lg:px-20 py-8 md:py-10 max-w-3xl mx-auto space-y-6 text-sm text-neutral-200">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-neutral-400">
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <p>
          ResolveForge is currently in public beta. This Privacy Policy explains
          what information we collect, how we use it, and the limited ways we
          share it while we are developing the product.
        </p>

        <h2 className="text-lg font-semibold mt-4">Information we collect</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Account details:</strong> when you sign up, we collect your
            email address and a password (stored as a secure hash).
          </li>
          <li>
            <strong>Complaints and claims:</strong> any text you paste into
            ResolveForge and the AI-generated summaries/letters are stored so
            you can view past claims in your dashboard.
          </li>
          <li>
            <strong>Early access emails:</strong> if you join the early access
            list, we store your email so we can contact you about new features
            and updates.
          </li>
          <li>
            <strong>Basic technical data:</strong> like logs and error reports
            to keep the service running reliably.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-4">How we use your data</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To provide the ResolveForge service and show you your claims.</li>
          <li>
            To improve the product, including understanding common issues and
            refining AI prompts.
          </li>
          <li>
            To contact you (if you opted in) about important updates, new
            features and changes to the service.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-4">How your data is stored</h2>
        <p>
          We use third-party infrastructure providers (for example, Supabase and
          Vercel) to host the application and store data. We aim to keep data
          within reputable, secure providers and minimise what we store.
        </p>

        <h2 className="text-lg font-semibold mt-4">
          Sharing and third parties
        </h2>
        <p>
          We do not sell your personal data. We may share limited data with
          service providers who help us run ResolveForge (for example,
          analytics, hosting and email providers) under appropriate
          confidentiality terms.
        </p>

        <h2 className="text-lg font-semibold mt-4">AI and your content</h2>
        <p>
          Your complaint text is sent to AI models to generate summaries and
          letters. We do not intentionally use your text to train our own
          models, but upstream AI providers may use data in accordance with
          their own terms. Avoid including highly sensitive information in your
          complaints wherever possible.
        </p>

        <h2 className="text-lg font-semibold mt-4">Your rights</h2>
        <p>
          Because ResolveForge is in beta, we&apos;re keeping things simple. You
          can contact us at{" "}
          <a
            href="mailto:support@resolveforge.co.uk"
            className="text-yellow-300 underline"
          >
            support@resolveforge.co.uk

          </a>{" "}
          if you want to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Request a copy of the data we hold about you.</li>
          <li>Ask us to delete your account and associated data.</li>
          <li>Raise any concerns about privacy or data handling.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-4">Changes to this policy</h2>
        <p>
          As ResolveForge grows out of beta, this policy may change. We&apos;ll
          update this page with a new date if we make significant changes.
        </p>

        <p className="text-xs text-neutral-500 mt-6">
          This page is provided for transparency during the beta period and does
          not constitute formal legal advice.
        </p>
      </section>
    </main>
  );
}
