import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Connect to backend logic
  };

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      {/* --- Header --- */}
      <div className="text-center pt-10 space-y-4">
        <h1 className="text-5xl font-bold text-secondary tracking-tight">
          Get in <span className="text-primary">Touch</span>
        </h1>
        <p className="text-accent text-lg max-w-2xl mx-auto">
          Have questions about Scalio? We are here to help you on your journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* --- Left Column: Contact Info --- */}
        <div className="space-y-6">
          {/* Info Card 1 */}
          <div className="bg-[#1e1e1e] border border-white/5 p-8 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">Email Us</h3>
              <p className="text-accent text-sm mb-2">
                Our friendly team is here to help.
              </p>
              <a
                href="mailto:support@scalio.com"
                className="text-primary hover:underline"
              >
                support@scalio.com
              </a>
            </div>
          </div>

          {/* Info Card 2 */}
          <div className="bg-[#1e1e1e] border border-white/5 p-8 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">Office</h3>
              <p className="text-accent text-sm mb-2">
                Come say hello at our office HQ.
              </p>
              <p className="text-secondary">123 Innovation Drive, Tech City</p>
            </div>
          </div>

          {/* Info Card 3 */}
          <div className="bg-[#1e1e1e] border border-white/5 p-8 rounded-2xl flex items-start gap-4 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary">Phone</h3>
              <p className="text-accent text-sm mb-2">
                Mon-Fri from 8am to 5pm.
              </p>
              <p className="text-secondary">+1 (555) 000-0000</p>
            </div>
          </div>
        </div>

        {/* --- Right Column: Contact Form --- */}
        <div className="bg-[#1e1e1e] border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-bold text-secondary">
                Message Sent!
              </h3>
              <p className="text-accent">
                We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Subject
                </label>
                <select className="input-field">
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-accent uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="input-field resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-primary/20 transition-all mt-2"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
