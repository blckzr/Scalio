import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="space-y-24">
      {/* --- HERO SECTION --- */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
          🚀 AI-Powered Multi-Agent Study Assistant
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-secondary tracking-tight">
          Master Your Tech Career <br />
          with <span className="text-primary">Scalio</span>
        </h1>

        <p className="text-xl text-accent max-w-2xl mx-auto leading-relaxed">
          Scalio is an intelligent ecosystem designed to guide you toward career
          readiness. Analyze your skills, build tailored roadmaps, and align
          your growth with real market demands.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/registration"
            className="bg-primary text-secondary px-8 py-3 rounded-lg font-bold hover:bg-blue-400 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* --- SCOPE / FEATURES GRID --- */}
      <section>
        <h2 className="text-heading font-bold text-secondary mb-10 text-center">
          Who is Scalio for?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-[#222] border border-gray-800 hover:border-primary/50 transition-colors">
            <h3 className="text-xl font-bold text-primary mb-3">
              Adaptive Learning
            </h3>
            <p className="text-accent">
              Support through intelligent agents that analyze skills and
              recommend tailored roadmaps specific to your pace.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-[#222] border border-gray-800 hover:border-primary/50 transition-colors">
            <h3 className="text-xl font-bold text-primary mb-3">
              For Every Learner
            </h3>
            <p className="text-accent">
              Designed for a wide range of users: students, fresh graduates,
              career shifters, professionals, and self-learners.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-[#222] border border-gray-800 hover:border-primary/50 transition-colors">
            <h3 className="text-xl font-bold text-primary mb-3">
              Career Coaching
            </h3>
            <p className="text-accent">
              Intelligent agents that coach study habits to ensure your growth
              is aligned with current industry standards.
            </p>
          </div>
        </div>
      </section>

      {/* --- PURPOSE SECTION --- */}
      <section className="bg-[#1f1f1f] rounded-2xl p-8 md:p-12 border border-gray-800 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1 space-y-4">
          <h2 className="text-heading font-bold text-secondary">Our Purpose</h2>
          <p className="text-accent text-lg leading-relaxed">
            We aim to address the challenges of modern learning by providing a
            system that helps learners build effective study habits.
          </p>
          <ul className="space-y-2 text-secondary">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Reduce burnout
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Strengthen confidence
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Improve career readiness
            </li>
          </ul>
        </div>

        {/* Visual Decoration (Optional) */}
        <div className="w-full md:w-1/3 bg-linear-to-br from-primary to-purple-600 h-64 rounded-xl opacity-20 blur-3xl absolute md:relative pointer-events-none"></div>
      </section>
    </div>
  );
};

export default HomePage;
