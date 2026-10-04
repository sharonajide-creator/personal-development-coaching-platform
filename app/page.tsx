// Marketing homepage (§19): Hero + What You Can Do + How It Works (5 steps).
export default function HomePage() {
  const features = [
    { title: "Discovery Assessment", body: "Strengths, interests, confidence, purpose — get a personalized starting point." },
    { title: "Goals & Action Plans", body: "Turn clarity into goals, break them into actions, track and reflect." },
    { title: "7 Learning Paths", body: "Self-discovery, purpose, confidence, communication, career, leadership, productivity." },
    { title: "Ask the Coach", body: "Submit questions, get guidance and resource referrals." },
    { title: "1:1 Consultations", body: "Pick a time, describe your needs, pay securely, meet your coach." },
    { title: "Growth Journey", body: "Goals, lessons, reflections, sessions, feedback, milestones — one story." },
    { title: "Resource Store", body: "Books, courses and downloadable resources curated by your coach." },
    { title: "Progress Tracking", body: "Answer every week: what should I focus on next?" },
  ];
  const steps = [
    { n: 1, title: "Discover Yourself", body: "Complete your personal discovery assessment." },
    { n: 2, title: "Define Your Goals", body: "Identify what you want to achieve." },
    { n: 3, title: "Follow Your Growth Path", body: "Get personalized recommendations." },
    { n: 4, title: "Get Coaching", body: "Ask questions, book consultations." },
    { n: 5, title: "Track Your Growth", body: "Reflect, complete activities, celebrate milestones." },
  ];
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-8 text-white md:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs">
            For girls & women 16–40 · Guided by a real coach
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
            Discover Yourself.
            <br />
            Develop Your Potential.
            <br />
            Fulfill Your Purpose.
          </h1>
          <p className="mt-4 text-white/85">
            Not a library of courses — a personal growth companion. Assess where you are, get a
            personalized path, learn practical skills, talk to your coach, and track real growth.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="/register" className="rounded-xl bg-accent-gold px-5 py-3 font-semibold text-slate-900">
              Take the Discovery Assessment
            </a>
            <a href="/dashboard" className="rounded-xl border border-white/40 px-5 py-3">
              See my Dashboard
            </a>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 text-slate-900">
          <p className="text-sm font-semibold">✨ Your personalized starting point</p>
          <p className="mt-1 text-xs text-slate-500">BASED ON YOUR ASSESSMENT (Phase 1)</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="rounded-lg bg-slate-50 p-3">Confidence & Self-Development <span className="text-slate-500">· Recommended</span></li>
            <li className="rounded-lg bg-slate-50 p-3">Purpose & Vision <span className="text-slate-500">· Recommended</span></li>
            <li className="rounded-lg bg-slate-50 p-3">Career & Business <span className="text-slate-500">· Suggested</span></li>
          </ul>
          <p className="mt-3 text-sm">🎯 Next step: <a href="/register" className="font-semibold text-brand">create your account →</a></p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">What you can do here</h2>
        <p className="text-slate-500">Who am I? → What am I capable of? → What is my purpose? → What next? → How am I progressing?</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border p-4">
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-bold text-white">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="text-sm text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
