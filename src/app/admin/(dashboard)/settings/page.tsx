import { getSettings } from "@/lib/settings";
import TermsEditor from "@/components/admin/TermsEditor";
import { ContactForm, PasswordForm } from "@/components/admin/SettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-10">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Company & contacts</h2>
        <p className="mt-1 text-sm text-muted">
          Shown in the header, contact section and footer of the site.
        </p>
        <div className="mt-6">
          <ContactForm settings={settings} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Terms &amp; Conditions</h2>
        <p className="mt-1 text-sm text-muted">
          These appear on the /terms page and in the &quot;Good to know&quot;
          section of the homepage.
        </p>
        <div className="mt-6">
          <TermsEditor initial={settings.terms} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-bold">Admin password</h2>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
