import { Scale, AlertTriangle } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto pt-12 pb-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 border-b border-white/10 pb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary mb-4">
          <Scale size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary">
          Terms of Service
        </h1>
        <p className="text-accent text-lg">
          Please read these terms carefully before using Scalio.
        </p>
      </div>

      {/* Content Container */}
      <div className="space-y-10 text-accent leading-relaxed">
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing and using Scalio, you accept and agree to be bound by
            the terms and provision of this agreement. In addition, when using
            these particular services, you shall be subject to any posted
            guidelines or rules applicable to such services.
          </p>
        </Section>

        <Section title="2. AI Services Disclaimer">
          <div className="bg-[#2a2a2a] border-l-4 border-yellow-500 p-4 rounded-r-lg my-4">
            <div className="flex gap-2 items-center text-yellow-500 font-bold mb-2">
              <AlertTriangle size={20} />
              <span>Important Notice on AI Accuracy</span>
            </div>
            <p className="text-sm text-secondary">
              Scalio uses experimental AI technology. While we strive for
              accuracy, the roadmaps and advice generated may occasionally be
              incorrect or misleading. You should verify important career
              information with official sources.
            </p>
          </div>
          <p>
            We do not guarantee that the AI agents will always produce
            error-free or completely accurate results. Use the generated study
            plans as a guide, not absolute truth.
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            You are responsible for maintaining the security of your account and
            password. Scalio cannot and will not be liable for any loss or
            damage from your failure to comply with this security obligation.
          </p>
        </Section>

        <Section title="4. Termination">
          <p>
            We may terminate or suspend access to our Service immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms.
          </p>
        </Section>

        <Section title="5. Governing Law">
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of [Your Country/State], without regard to its conflict of law
            provisions.
          </p>
        </Section>
      </div>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <h2 className="text-2xl font-bold text-secondary">{title}</h2>
    <div className="text-base md:text-lg">{children}</div>
  </section>
);

export default TermsPage;
