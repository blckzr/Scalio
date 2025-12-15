import { Target, Users, Zap, Award } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="space-y-20 pb-12 animate-fade-in">
      {/* --- HERO SECTION --- */}
      <section className="text-center pt-12 max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold text-secondary tracking-tight">
          We are building the future of <br />
          <span className="text-primary">Personalized Learning</span>
        </h1>
        <p className="text-xl text-accent leading-relaxed">
          Scalio is an AI-powered ecosystem designed to guide learners toward
          true career readiness. We believe education should be adaptive,
          supportive, and aligned with the real world.
        </p>
      </section>

      {/* --- OUR MISSION (The "Purpose" you provided) --- */}
      <section className="grid md:grid-cols-2 gap-12 items-center bg-[#1e1e1e] border border-white/5 rounded-3xl p-8 md:p-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm">
            <Target size={18} />
            <span>Our Purpose</span>
          </div>
          <h2 className="text-3xl font-bold text-secondary">
            Reducing burnout, strengthening confidence.
          </h2>
          <p className="text-accent text-lg leading-relaxed">
            The tech industry moves fast. Our goal is to address the challenges
            of modern learning by providing an AI-powered multi-agent study
            assistant. We help learners build effective study habits, receive
            personalized roadmaps, and align their growth with industry
            standards.
          </p>
        </div>
        {/* Decorative Visual (Placeholder for an image) */}
        <div className="h-64 md:h-full bg-linear-to-br from-gray-800 to-black rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <Zap
            size={64}
            className="text-primary/20 group-hover:text-primary/40 transition-colors transform group-hover:scale-110 duration-500"
          />
        </div>
      </section>

      {/* --- WHO WE SERVE (The "Scope") --- */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-heading font-bold text-secondary mb-4">
            Built for Every Stage
          </h2>
          <p className="text-accent max-w-2xl mx-auto">
            Whether you are just starting or looking to pivot, Scalio adapts to
            your unique journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ScopeCard
            icon={<Users />}
            title="Students"
            desc="Building strong foundations."
          />
          <ScopeCard
            icon={<Award />}
            title="Fresh Grads"
            desc="Bridging the gap to industry."
          />
          <ScopeCard
            icon={<Zap />}
            title="Career Shifters"
            desc="Accelerating your pivot."
          />
          <ScopeCard
            icon={<Target />}
            title="Professionals"
            desc="Upskilling efficiently."
          />
        </div>
      </section>

      {/* --- THE TEAM (Placeholder) --- */}
      <section className="space-y-12 border-t border-white/10 pt-16">
        <div className="text-center space-y-4">
          <h2 className="text-heading font-bold text-secondary">
            Meet the Team
          </h2>
          <p className="text-accent">The minds behind the agents.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Duplicate this component for each team member */}
          <TeamMember
            name="[Your Name]"
            role="Lead Developer"
            bio="Passionate about AI and education architecture."
          />
          <TeamMember
            name="Jane Doe"
            role="Product Designer"
            bio="Crafting intuitive experiences for complex systems."
          />
          <TeamMember
            name="John Smith"
            role="AI Engineer"
            bio="Building the multi-agent infrastructure."
          />
        </div>
      </section>
    </div>
  );
};

// --- Helper Components ---

const ScopeCard = ({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <div className="bg-[#222] border border-white/5 p-6 rounded-xl hover:border-primary/50 transition-colors text-center group">
    <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-accent group-hover:text-primary transition-colors">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-secondary mb-2">{title}</h3>
    <p className="text-sm text-accent">{desc}</p>
  </div>
);

const TeamMember = ({
  name,
  role,
  bio,
}: {
  name: string;
  role: string;
  bio: string;
}) => (
  <div className="text-center space-y-3">
    {/* Avatar Placeholder */}
    <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto border-2 border-primary/20 overflow-hidden">
      {/* <img src="..." /> goes here */}
      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
        IMG
      </div>
    </div>
    <div>
      <h3 className="text-lg font-bold text-secondary">{name}</h3>
      <div className="text-primary text-sm font-medium">{role}</div>
    </div>
    <p className="text-accent text-sm max-w-xs mx-auto">{bio}</p>
  </div>
);

export default AboutPage;
