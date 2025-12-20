import { Lock } from "lucide-react";

const PrivacyPage = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto pt-12 pb-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 border-b border-white/10 pb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary">
          Privacy Policy
        </h1>
        <p className="text-accent text-lg">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content Container */}
      <div className="space-y-10 text-accent leading-relaxed">
        <Section title="1. Introduction">
          <p>
            Welcome to Scalio ("we," "our," or "us"). We respect your privacy
            and are committed to protecting your personal data. This privacy
            policy will inform you as to how we look after your personal data
            when you visit our website and use our AI study assistant services.
          </p>
        </Section>

        <Section title="2. The Data We Collect">
          <p className="mb-4">
            We may collect, use, store and transfer different kinds of personal
            data about you:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-secondary/90">
            <li>
              <strong>Identity Data:</strong> First name, last name, username,
              date of birth.
            </li>
            <li>
              <strong>Contact Data:</strong> Email address and telephone
              numbers.
            </li>
            <li>
              <strong>Technical Data:</strong> Internet protocol (IP) address,
              browser type and version, time zone setting.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our
              website, products, and study roadmap features.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>
            We will only use your personal data when the law allows us to. Most
            commonly, we use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-secondary/90">
            <li>To provide the AI-generated study roadmaps you requested.</li>
            <li>To manage your account and registration.</li>
            <li>To improve our AI models (anonymized data only).</li>
          </ul>
        </Section>

        <Section title="4. Artificial Intelligence & Data Processing">
          <p>
            Scalio utilizes Artificial Intelligence (AI) to analyze your skills
            and generate recommendations. By using our service, you acknowledge
            that your input data (skills, goals, preferences) will be processed
            by our AI agents. We do not use your personal identifiers (name,
            email) to train public AI models.
          </p>
        </Section>

        <Section title="5. Contact Us">
          <p>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at
            <span className="text-primary hover:underline cursor-pointer ml-1">
              privacy@scalio.com
            </span>
            .
          </p>
        </Section>
      </div>
    </div>
  );
};

// Helper for consistent section styling
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

export default PrivacyPage;
