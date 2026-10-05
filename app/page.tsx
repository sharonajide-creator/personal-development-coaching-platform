// Landing page (§19): Hero + What You Can Do + How It Works (5 steps).
// Main call to action: "Start your Purpose Journey" → /start (email-first entry).
export default function HomePage() {
  const pillars = [
    { icon: "🪞", title: "Discover Yourself", body: "A guided assessment maps your strengths, values, interests and confidence — and gives you a personalized starting point, not generic advice." },
    { icon: "🎯", title: "Define Your Direction", body: "Turn fuzzy dreams into clear goals with timeframes, bite-size actions and space to reflect as you grow." },
    { icon: "🗺", title: "Follow Your Growth Path", body: "Seven guided paths — self-discovery, purpose, confidence, communication, career, leadership, productivity — recommended for where you are today." },
    { icon: "💬", title: "Never Walk Alone", body: "Ask your coach anything, book 1:1 clarity sessions, and get personal feedback on your journey." },
  ];
  const steps = [
    { n: 1, title: "Start with your email", body: "One email opens your door — returning sisters sign straight back in." },
    { n: 2, title: "Discover yourself", body: "Complete your personal discovery assessment in minutes." },
    { n: 3, title: "Get your path", body: "Receive recommended paths and set your very first goal." },
    { n: 4, title: "Grow with your coach", body: "Learn, journal, ask questions, book 1:1 sessions." },
    { n: 5, title: "Watch yourself bloom", body: "Track milestones on one timeline — your whole story, visible." },
  ];
  const questions = [
    "Who am I, really?",
    "What am I capable of?",
    "What is my purpose?",
    "What should I do next?",
    "How am I progressing?",
  ];

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand-dark to-slate-900 p-8 text-white md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium tracking-wide">
              For girls & women 16–40 · Guided by a real coach 🌸
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] md:text-6xl">
              Discover Yourself.
              <br />
              Develop Your Potential.
              <br />
              <span className="text-accent-gold">Fulfill Your Purpose.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/85">
              Not another library of courses — a personal growth companion.
              Assess where you are, get a path made for you, and walk it with a coach beside you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/start"
                className="rounded-2xl bg-accent-gold px-8 py-4 text-lg font-bold text-slate-900 shadow-lg transition hover:brightness-110"
              >
                Start your Purpose Journey →
              </a>
              <a href="#how" className="rounded-2xl border border-white/40 px-8 py-4 text-lg hover:bg-white/10">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-white/60">Free to begin · 2 minutes · No card required</p>
          </div>
          <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-2xl">
            <p className="text-sm font-semibold">✨ Your personalized starting point</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">After your 2-minute assessment</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="rounded-lg bg-purple-50 p-3"><span className="font-medium">Confidence & Self-Development</span> <span className="text-brand">· Recommended for you</span></li>
              <li className="rounded-lg bg-purple-50 p-3"><span className="font-medium">Purpose & Vision</span> <span className="text-brand">· Recommended for you</span></li>
              <li className="rounded-lg bg-slate-50 p-3"><span className="font-medium">Your first goal</span> <span className="text-slate-500">· Set with guidance</span></li>
            </ul>
            <a href="/start" className="mt-4 block rounded-xl bg-brand px-5 py-3 text-center font-semibold text-white">
              Start your Purpose Journey →
            </a>
          </div>
        </div>
      </section>

      {/* THE QUESTIONS */}
      <section className="text-center">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Every woman asks these questions.</h2>
        <p className="mt-1 text-slate-500">This platform exists to answer each one — personally.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((q) => (
            <span key={q} className="rounded-full border border-brand/30 bg-purple-50 px-4 py-2 text-sm font-medium text-brand-dark">
              {q}
            </span>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section>
        <h2 className="font-display text-2xl font-semibold md:text-3xl">What you can do here</h2>
        <p className="mt-1 text-slate-500">One guided experience — learning, coaching, tracking, resources.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {pillars.map((f) => (
            <div key={f.title} className="rounded-2xl border p-6 transition hover:border-brand hover:shadow-md">
              <p className="text-3xl">{f.icon}</p>
              <h3 className="mt-2 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="rounded-3xl bg-slate-50 p-8 md:p-12">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">How it works</h2>
        <p className="mt-1 text-slate-500">From first click to visible growth — in five steps.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-white p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{s.n}</div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
        <a
          href="/start"
          className="mt-8 inline-block rounded-2xl bg-brand px-8 py-4 text-lg font-bold text-white shadow transition hover:bg-brand-dark"
        >
          Start your Purpose Journey →
        </a>
      </section>

      {/* FINAL CTA */}
      <section className="rounded-3xl bg-gradient-to-r from-brand to-brand-dark p-8 text-center text-white md:p-12">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">Your purpose is waiting.</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          A year from now, you&apos;ll wish you started today. All it takes is your email —
          your dashboard, assessment and coach are ready when you are.
        </p>
        <a
          href="/start"
          className="mt-6 inline-block rounded-2xl bg-accent-gold px-10 py-4 text-lg font-bold text-slate-900 shadow-lg transition hover:brightness-110"
        >
          Start your Purpose Journey →
        </a>
      </section>
    </div>
  );
}
