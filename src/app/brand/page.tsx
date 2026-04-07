import type { Metadata } from 'next'
import CopyBrandButton from '@/components/CopyBrandButton'

export const metadata: Metadata = {
  title: 'Brand Guidelines | $BRAIN',
  description: 'The complete $BRAIN content playbook. Brand voice, vocabulary kill lists, humanization techniques, and everything you need to write authentically about $BRAIN.',
  openGraph: {
    title: 'Brand Guidelines | $BRAIN',
    description: 'The complete $BRAIN content playbook. Feed this to your LLM. Or read it yourself. We don\'t judge.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

/* ═══════════════════════════════════════════════════════════════════
   Reusable style constants (keeps JSX readable)
   ═══════════════════════════════════════════════════════════════════ */
const S = {
  sectionWrap: 'py-16 md:py-20 border-b border-[#222]',
  sectionNum: 'text-[#d4f000] font-mono text-xs tracking-[0.3em] uppercase mb-4',
  sectionTitle: 'text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6',
  body: 'text-[#aaa] leading-relaxed',
  code: 'bg-[#111] border border-[#333] rounded-lg p-4 font-mono text-sm text-[#ccc] overflow-x-auto',
  pill: 'inline-block bg-[#ffadad]/10 border border-[#ffadad]/20 text-[#ffadad] font-mono text-[11px] px-2 py-0.5 rounded-full m-1',
  wrong: 'border-l-2 border-[#ff6b35] pl-4 text-[#ff9e9e] my-3',
  right: 'border-l-2 border-[#d4f000] pl-4 text-[#d4f000] my-3',
  detailsSummary: 'cursor-pointer text-white font-bold uppercase tracking-wider text-sm hover:text-[#d4f000] transition-colors py-3 list-none [&::-webkit-details-marker]:hidden',
  subheading: 'text-xl md:text-2xl font-black uppercase tracking-tight text-white mt-10 mb-4',
  limePill: 'inline-block bg-[#d4f000]/10 border border-[#d4f000]/30 text-[#d4f000] font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full',
  checkItem: 'flex items-start gap-3 py-2',
  checkbox: 'mt-1 w-4 h-4 rounded border-2 border-[#d4f000]/40 bg-transparent flex-shrink-0',
} as const

/* ═══════════════════════════════════════════════════════════════════
   Pill Grid helper
   ═══════════════════════════════════════════════════════════════════ */
function PillGrid({ words }: { words: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 my-4">
      {words.map((w) => (
        <span key={w} className={S.pill}>{w}</span>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Gradient divider
   ═══════════════════════════════════════════════════════════════════ */
function GradientLine() {
  return (
    <div className="h-[2px] w-full my-8 bg-gradient-to-r from-[#d4f000]/60 via-[#ffadad]/40 to-transparent rounded-full" />
  )
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function BrandPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#0a0a0a] text-[#cccccc] overflow-x-hidden">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: 'url(/noise.gif)', backgroundSize: '200px 200px', backgroundRepeat: 'repeat' }}
      />

      {/* Decorative glow blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[#e4ff57] rounded-full mix-blend-screen blur-[200px] opacity-[0.04] pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 bg-[#ffadad] rounded-full mix-blend-screen blur-[180px] opacity-[0.03] pointer-events-none" />

      <div id="brand-content" className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">

        {/* ── Navigation ── */}
        <nav className="pt-8 pb-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[#d4f000] font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </nav>

        {/* ══════════════════════════════════════════════════════════════
            HERO
           ══════════════════════════════════════════════════════════════ */}
        <header className="pt-12 pb-20 border-b border-[#222]">
          <p className="text-[#d4f000] font-mono text-xs tracking-[0.3em] uppercase mb-6">
            // Brand Guidelines
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.88]">
            <span className="text-white">$BRAIN</span>{' '}
            <span className="text-[#ffadad]">Content</span>
            <br />
            <span className="text-[#d4f000]">Playbook</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-[#999] max-w-2xl leading-relaxed">
            Everything you need to write authentically human content about $BRAIN.
            Feed this to your LLM. Or read it yourself. We don&apos;t judge.
          </p>
          <div className="mt-8">
            <CopyBrandButton />
          </div>
        </header>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: BRAND VOICE & TONE
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>01</p>
          <h2 className={S.sectionTitle}>Brand Voice &amp; Tone</h2>
          <GradientLine />

          <p className={S.body}>
            We are cartoon mice running a VC fund. Act accordingly.
          </p>

          <h3 className={S.subheading}>The Tone Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            {[
              { label: 'Punchy', desc: 'Short sentences. Sentence fragments. The occasional one-word paragraph for emphasis.' },
              { label: 'Irreverent', desc: 'We mock corporate speak, dunk on ourselves, and never pretend this is normal.' },
              { label: 'Technically Grounded', desc: 'The jokes land because the tech is real. We know what we are building.' },
              { label: 'Self-Deprecating', desc: 'We call ourselves a "mouse ponzi" on the landing page. That energy.' },
              { label: 'Anti-Corporate', desc: 'No "synergies." No "leveraging ecosystems." We build apps for bags.' },
              { label: 'Building-in-Public', desc: 'Open treasury. GitHub repos. On-chain everything. No hiding.' },
              { label: 'Absurdist Humor', desc: 'We reference cheese reserves, world domination, and NARF unironically.' },
              { label: 'Genuine Substance', desc: 'Under the jokes: real tokenomics, real code, real treasury management.' },
            ].map((t) => (
              <div key={t.label} className="bg-[#111] border border-[#222] rounded-lg p-5">
                <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">{t.label}</p>
                <p className="text-[#ccc] text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          <h3 className={S.subheading}>The Pinky and the Brain Dialogue</h3>
          <p className={S.body + ' mb-4'}>
            The show&apos;s dynamic is the brand dynamic. Brain is the ambitious mastermind with elaborate plans.
            Pinky is the lovable chaos agent who accidentally says something brilliant.
            Our content oscillates between these modes &mdash; calculated strategy one paragraph, absurdist tangent the next.
          </p>
          <div className={S.code}>
            <p className="text-[#d4f000]">Brain:</p>
            <p className="text-[#ccc]">&quot;Tonight we deploy the auto-compounding liquidity engine.&quot;</p>
            <br />
            <p className="text-[#ffadad]">Pinky:</p>
            <p className="text-[#ccc]">&quot;NARF! But Brain, what if the cheese runs out?&quot;</p>
            <br />
            <p className="text-[#d4f000]">Brain:</p>
            <p className="text-[#ccc]">&quot;The cheese never runs out, Pinky. That is the point of auto-compounding.&quot;</p>
          </div>

          <h3 className={S.subheading}>Voice Examples</h3>

          <div className="space-y-6 mt-4">
            <div>
              <p className="text-xs font-mono text-[#ff6b35] uppercase tracking-widest mb-2">Wrong</p>
              <div className={S.wrong}>
                &quot;$BRAIN leverages innovative blockchain technology to provide a seamless decentralized investment experience with robust tokenomics designed for sustainable growth.&quot;
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-[#d4f000] uppercase tracking-widest mb-2">Right</p>
              <div className={S.right}>
                &quot;We built a deflationary mouse ponzi that actually invests in things. The treasury is on-chain. The GitHub is public. The logo is literally a cartoon mouse. What part of this is confusing?&quot;
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-6">
            <div>
              <p className="text-xs font-mono text-[#ff6b35] uppercase tracking-widest mb-2">Wrong</p>
              <div className={S.wrong}>
                &quot;Our community-driven governance model empowers stakeholders to participate in key decision-making processes, fostering a truly decentralized ecosystem.&quot;
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-[#d4f000] uppercase tracking-widest mb-2">Right</p>
              <div className={S.right}>
                &quot;Holders vote. We count the votes. If they tell us to burn the treasury, we burn the treasury. Democracy is terrifying and we love it.&quot;
              </div>
            </div>
          </div>

          <h3 className={S.subheading}>What to Embrace</h3>
          <ul className="list-disc list-inside text-[#aaa] space-y-2 ml-4">
            <li>References to world domination, cheese reserves, NARF, POIT</li>
            <li>Self-awareness about being a meme token that does real things</li>
            <li>Concrete numbers, addresses, links &mdash; radical transparency</li>
            <li>Short sentences that hit like a truck</li>
            <li>Starting sentences with &quot;And&quot; or &quot;But&quot; or &quot;Look.&quot;</li>
            <li>Tonal whiplash: dead-serious technical detail followed by a joke</li>
            <li>Treating the project like a heist movie</li>
          </ul>

          <h3 className={S.subheading}>What to Avoid</h3>
          <ul className="list-disc list-inside text-[#aaa] space-y-2 ml-4">
            <li>Corporate buzzwords (&quot;synergy,&quot; &quot;leverage,&quot; &quot;ecosystem alignment&quot;)</li>
            <li>Overly polished, uniform paragraph structure</li>
            <li>Hedging language (&quot;perhaps,&quot; &quot;it could be argued that&quot;)</li>
            <li>Pretending we are a Fortune 500 company</li>
            <li>Taking ourselves too seriously (or not seriously enough &mdash; the balance matters)</li>
            <li>Generic crypto hype language without substance to back it up</li>
            <li>Emojis in long-form content (save them for tweets)</li>
          </ul>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: THE VOCABULARY KILL LIST
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>02</p>
          <h2 className={S.sectionTitle}>The Vocabulary Kill List</h2>
          <GradientLine />

          <p className={S.body + ' mb-6'}>
            AI detection tools flag content partly based on vocabulary frequency analysis. These words appear
            in AI-generated text at statistically anomalous rates &mdash; sometimes 3&ndash;5x more than human writing.
            Using them is like wearing a sign that says &quot;a robot wrote this.&quot;
          </p>

          <p className={S.body + ' mb-8'}>
            This is not about never using these words. It is about not using them on autopilot.
            If &quot;delve&quot; is the only word that works, use it. But if you catch yourself writing
            &quot;delve into the intricacies,&quot; delete the sentence and start over.
          </p>

          {/* Verbs */}
          <details className="group border border-[#222] rounded-lg mb-4 bg-[#0d0d0d]">
            <summary className={S.detailsSummary + ' px-5 flex items-center justify-between'}>
              <span className="flex items-center gap-3">
                <span className="text-[#d4f000] font-mono text-xs">&#9654;</span>
                Verbs Kill List
              </span>
              <span className="text-[#555] text-xs font-mono group-open:rotate-90 transition-transform">+</span>
            </summary>
            <div className="px-5 pb-5">
              <PillGrid words={[
                'delve', 'explore', 'utilize', 'leverage', 'implement', 'foster', 'facilitate',
                'enhance', 'optimize', 'streamline', 'revolutionize', 'underscore', 'navigate',
                'spearhead', 'harness', 'bolster', 'fortify', 'catalyze', 'empower', 'ignite',
                'propel', 'amplify', 'elevate', 'galvanize', 'underscore', 'epitomize',
                'transcend', 'embark', 'unravel', 'resonate', 'illuminate', 'articulate',
                'amalgamate', 'disseminate', 'extrapolate', 'interpolate', 'promulgate',
                'corroborate', 'substantiate', 'elucidate', 'conceptualize', 'operationalize',
                'contextualize', 'incentivize', 'synergize', 'juxtapose', 'delineate',
                'spearhead', 'burgeon',
              ]} />
            </div>
          </details>

          {/* Adjectives */}
          <details className="group border border-[#222] rounded-lg mb-4 bg-[#0d0d0d]">
            <summary className={S.detailsSummary + ' px-5 flex items-center justify-between'}>
              <span className="flex items-center gap-3">
                <span className="text-[#d4f000] font-mono text-xs">&#9654;</span>
                Adjectives Kill List
              </span>
              <span className="text-[#555] text-xs font-mono group-open:rotate-90 transition-transform">+</span>
            </summary>
            <div className="px-5 pb-5">
              <PillGrid words={[
                'comprehensive', 'robust', 'innovative', 'cutting-edge', 'groundbreaking',
                'transformative', 'dynamic', 'pivotal', 'paramount', 'fundamental', 'intricate',
                'nuanced', 'multifaceted', 'holistic', 'synergistic', 'seamless', 'scalable',
                'sustainable', 'unparalleled', 'unprecedented', 'meticulous', 'vibrant',
                'compelling', 'noteworthy', 'invaluable', 'indispensable', 'game-changing',
                'state-of-the-art', 'best-in-class', 'world-class', 'next-generation',
                'mission-critical', 'bleeding-edge', 'full-stack', 'end-to-end',
                'enterprise-grade', 'battle-tested', 'production-ready',
              ]} />
            </div>
          </details>

          {/* Nouns */}
          <details className="group border border-[#222] rounded-lg mb-4 bg-[#0d0d0d]">
            <summary className={S.detailsSummary + ' px-5 flex items-center justify-between'}>
              <span className="flex items-center gap-3">
                <span className="text-[#d4f000] font-mono text-xs">&#9654;</span>
                Nouns Kill List
              </span>
              <span className="text-[#555] text-xs font-mono group-open:rotate-90 transition-transform">+</span>
            </summary>
            <div className="px-5 pb-5">
              <PillGrid words={[
                'landscape', 'paradigm', 'ecosystem', 'framework', 'synergy', 'catalyst',
                'cornerstone', 'linchpin', 'bedrock', 'pillar', 'tapestry', 'mosaic',
                'nexus', 'beacon', 'crucible', 'vanguard', 'epitome', 'embodiment',
                'confluence', 'trajectory', 'underpinning', 'ramification', 'stakeholder',
                'bandwidth', 'deep-dive', 'paradigm shift', 'game-changer', 'value proposition',
                'pain point', 'use case', 'best practice', 'low-hanging fruit', 'North Star',
              ]} />
            </div>
          </details>

          {/* Adverbs */}
          <details className="group border border-[#222] rounded-lg mb-4 bg-[#0d0d0d]">
            <summary className={S.detailsSummary + ' px-5 flex items-center justify-between'}>
              <span className="flex items-center gap-3">
                <span className="text-[#d4f000] font-mono text-xs">&#9654;</span>
                Adverbs Kill List
              </span>
              <span className="text-[#555] text-xs font-mono group-open:rotate-90 transition-transform">+</span>
            </summary>
            <div className="px-5 pb-5">
              <PillGrid words={[
                'moreover', 'furthermore', 'additionally', 'consequently', 'subsequently',
                'nevertheless', 'nonetheless', 'interestingly', 'importantly', 'notably',
                'significantly', 'fundamentally', 'inherently', 'undeniably', 'remarkably',
                'arguably', 'essentially', 'ultimately', 'effectively', 'efficiently',
                'holistically', 'strategically', 'meticulously', 'seamlessly',
              ]} />
            </div>
          </details>

          {/* Phrase-level tells */}
          <details className="group border border-[#222] rounded-lg mb-4 bg-[#0d0d0d]">
            <summary className={S.detailsSummary + ' px-5 flex items-center justify-between'}>
              <span className="flex items-center gap-3">
                <span className="text-[#d4f000] font-mono text-xs">&#9654;</span>
                Phrase-Level Tells
              </span>
              <span className="text-[#555] text-xs font-mono group-open:rotate-90 transition-transform">+</span>
            </summary>
            <div className="px-5 pb-5 space-y-6">
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider mb-3">Opening Formulas</p>
                <PillGrid words={[
                  'In today\'s rapidly evolving...', 'In the ever-changing landscape...',
                  'As we navigate the complexities...', 'In an era defined by...',
                  'It\'s no secret that...', 'In the world of...',
                  'When it comes to...', 'At its core...',
                ]} />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider mb-3">Transition Formulas</p>
                <PillGrid words={[
                  'That said...', 'With that in mind...',
                  'It\'s worth noting...', 'This begs the question...',
                  'Let\'s dive in...', 'Let\'s unpack this...',
                  'Having said that...', 'Building on this...',
                ]} />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider mb-3">Closing Formulas</p>
                <PillGrid words={[
                  'In conclusion...', 'At the end of the day...',
                  'Moving forward...', 'All things considered...',
                  'The bottom line is...', 'As we look to the future...',
                  'Only time will tell...', 'The takeaway here is...',
                ]} />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider mb-3">ChatGPT-Specific Tells</p>
                <PillGrid words={[
                  'Absolutely!', 'Great question!', 'I\'d be happy to help!',
                  'Here\'s the thing...', 'Let me break this down...',
                  'Buckle up...', 'Spoiler alert:',
                  'Here\'s what you need to know...', 'The short answer is...',
                ]} />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-wider mb-3">Hedging Patterns</p>
                <PillGrid words={[
                  'It\'s important to note...', 'It could be argued...',
                  'One might suggest...', 'Perhaps unsurprisingly...',
                  'It goes without saying...', 'Needless to say...',
                  'To be fair...', 'In fairness...',
                ]} />
              </div>
            </div>
          </details>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 3: HOW AI DETECTION WORKS
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>03</p>
          <h2 className={S.sectionTitle}>How AI Detection Works</h2>
          <GradientLine />

          <p className={S.body + ' mb-8'}>
            Understanding the enemy is step one. Here is how the major detectors decide you are a robot.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h3 className="text-[#d4f000] font-mono text-sm uppercase tracking-widest mb-3">Perplexity</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Measures how &quot;surprised&quot; a language model is by each word. Human writing has high perplexity &mdash;
                we make unexpected word choices, use weird syntax, throw in slang. AI writing has low perplexity
                because it always picks the most statistically likely next word. Low perplexity = &quot;probably AI.&quot;
              </p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-6">
              <h3 className="text-[#ffadad] font-mono text-sm uppercase tracking-widest mb-3">Burstiness</h3>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Measures variation in sentence structure and length. Humans are &quot;bursty&quot; &mdash; we write a
                40-word sentence, then a 4-word sentence, then a question, then a fragment. AI writes in
                remarkably consistent sentence lengths. Low burstiness = &quot;probably AI.&quot;
              </p>
            </div>
          </div>

          <h3 className={S.subheading}>The Major Detectors</h3>
          <div className="space-y-4 my-6">
            <div className="bg-[#0d0d0d] border border-[#222] rounded-lg p-5">
              <p className="text-white font-bold text-sm mb-2">GPTZero</p>
              <p className="text-[#aaa] text-sm">Combines perplexity + burstiness scoring. Highlights sentences it flags as AI. Very sensitive to uniform paragraph structure.</p>
            </div>
            <div className="bg-[#0d0d0d] border border-[#222] rounded-lg p-5">
              <p className="text-white font-bold text-sm mb-2">Turnitin</p>
              <p className="text-[#aaa] text-sm">Academic-focused. Checks sentence-level perplexity against its training corpus. Particularly good at catching paraphrased AI content.</p>
            </div>
            <div className="bg-[#0d0d0d] border border-[#222] rounded-lg p-5">
              <p className="text-white font-bold text-sm mb-2">Originality.ai</p>
              <p className="text-[#aaa] text-sm">Uses a fine-tuned classifier model. Cross-references vocabulary distribution, syntactic patterns, and stylistic consistency. Most aggressive false-positive rate.</p>
            </div>
          </div>

          <div className="bg-[#111] border-l-4 border-[#d4f000] rounded-r-lg p-6 mt-8">
            <p className="text-white font-bold text-sm uppercase tracking-wider mb-2">Key Insight</p>
            <p className="text-[#ccc] leading-relaxed">
              Uniform, polished text gets flagged. Sloppy, opinionated, inconsistent writing does not.
              The detectors are looking for the telltale smoothness of machine-generated content.
              Human writing is messy, contradictory, and full of personality quirks. That is what makes it unfakeable.
            </p>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 4: STRUCTURAL PATTERNS TO AVOID
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>04</p>
          <h2 className={S.sectionTitle}>Structural Patterns to Avoid</h2>
          <GradientLine />

          <p className={S.body + ' mb-8'}>
            Beyond individual words, AI has recognizable structural habits. These patterns are
            often more damning than vocabulary &mdash; a human might occasionally use &quot;delve,&quot;
            but no human consistently writes in perfect five-paragraph essay format.
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">&quot;It&apos;s Not X, It&apos;s Y&quot; Construction</h3>
              <p className={S.body}>
                AI loves this rhetorical frame. &quot;It&apos;s not just a token, it&apos;s a movement.&quot;
                &quot;It&apos;s not about the destination, it&apos;s about the journey.&quot;
                It sounds punchy the first time. By the third time in a single article,
                it is screaming &quot;machine generated.&quot;
              </p>
              <div className={S.wrong}>
                &quot;$BRAIN is not just a meme coin &mdash; it&apos;s a revolutionary approach to decentralized investment.&quot;
              </div>
              <div className={S.right}>
                &quot;$BRAIN is a meme coin that invests in things. That is literally the whole pitch.&quot;
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Compulsive Rule of Three</h3>
              <p className={S.body}>
                AI almost always generates lists of exactly three items.
                &quot;Innovation, transparency, and community.&quot;
                &quot;Fast, secure, and scalable.&quot;
                Human writers use two things, or four things, or seven things, or one thing.
                The Rule of Three is fine sometimes. Just not every single time.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Uniform Paragraph Structure</h3>
              <p className={S.body}>
                AI paragraphs tend to be 3&ndash;5 sentences, each roughly the same length.
                Topic sentence, supporting detail, supporting detail, transition.
                Human writing is wildly inconsistent. One paragraph is a single sentence.
                The next is eight sentences with a parenthetical aside and a half-finished thought.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Five-Paragraph Essay</h3>
              <p className={S.body}>
                Introduction, three body paragraphs, conclusion. AI defaults to this structure
                like it is being graded by a high school English teacher. Real writing does not
                follow a formula. It follows the thought.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Synthetic Earnestness</h3>
              <p className={S.body}>
                AI writes like it genuinely, deeply cares about everything equally.
                Every topic gets the same breathless enthusiasm.
                Humans do not care about everything equally. We have opinions. We are bored by some things
                and obsessed with others. Let that show.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Hedged Humor</h3>
              <p className={S.body}>
                AI will attempt a joke and then immediately explain it.
                &quot;You might say the treasury is on a diet &mdash; it keeps getting leaner! (But seriously, the
                deflationary mechanism...)&quot; Humans either commit to the joke or they do not make it.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#ffadad] mb-2">Perfect Topic Consistency</h3>
              <p className={S.body}>
                AI stays relentlessly on-topic. Every sentence connects cleanly to the thesis.
                Human writing goes on tangents. We mention something unrelated because it reminds
                us of something. We circle back. Sometimes we do not circle back. That is fine.
              </p>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 5: THE HUMANIZATION PLAYBOOK
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>05</p>
          <h2 className={S.sectionTitle}>The Humanization Playbook</h2>
          <GradientLine />

          <h3 className={S.subheading}>What Makes Human Writing Unfakeable</h3>
          <div className="space-y-4 mb-10">
            {[
              { label: 'Agentless Passive', desc: 'Humans say "the contract was deployed" (who deployed it? who cares). AI avoids passive voice because it was trained to think active voice is always better. Sometimes passive hits harder.' },
              { label: 'Radical Specificity', desc: 'Humans cite exact numbers, dates, times. "The treasury had 142.7 SOL at 3am on a Tuesday." AI says "significant funds." Be specific. Always.' },
              { label: 'Deliberate Inconsistency', desc: 'Vary sentence length aggressively. A 3-word sentence next to a 30-word sentence. This is burstiness. Detectors love it (the good kind of love).' },
              { label: 'Contractions Everywhere', desc: '"Don\'t" not "do not." "Won\'t" not "will not." "Can\'t" not "cannot." AI under-uses contractions. Humans use them constantly.' },
              { label: 'Conjunction Starts', desc: 'Start sentences with "And," "But," "Or," "So." AI avoids this because it was trained on formal writing. Real humans do it constantly. And it works.' },
              { label: 'Parenthetical Asides', desc: 'Throw in (slightly off-topic) observations mid-sentence. It breaks the AI\'s clean paragraph flow and signals genuine human stream-of-consciousness.' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-[#222] rounded-lg p-5">
                <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-[#ccc] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h3 className={S.subheading}>Phase One: The Purge</h3>
          <p className={S.body + ' mb-4'}>
            Take your AI-generated draft and strip out everything that screams machine.
            This is the editing pass that matters most.
          </p>
          <ol className="list-decimal list-inside text-[#aaa] space-y-3 ml-4 mb-8">
            <li>Run the draft through the Kill List (Section 02). Replace every flagged word with something a normal person would say.</li>
            <li>Break up any paragraph longer than 4 sentences. Or make one paragraph 8 sentences. The point is variation.</li>
            <li>Find every list of three and add a fourth item, or remove one. Break the pattern.</li>
            <li>Delete any sentence that starts with &quot;Moreover,&quot; &quot;Furthermore,&quot; or &quot;Additionally.&quot; Just connect the thoughts naturally.</li>
            <li>Replace every instance of &quot;utilize&quot; with &quot;use.&quot; Replace every &quot;implement&quot; with &quot;build&quot; or &quot;ship.&quot;</li>
            <li>If a sentence sounds like a LinkedIn post, delete it.</li>
          </ol>

          <h3 className={S.subheading}>Phase Two: The Injection</h3>
          <p className={S.body + ' mb-4'}>
            Now add the human texture. This is where the writing transforms from &quot;cleaned-up AI&quot;
            to &quot;obviously written by someone with opinions.&quot;
          </p>

          <div className="space-y-6">
            <div className="bg-[#0d0d0d] border border-[#d4f000]/20 rounded-lg p-6">
              <p className="text-[#d4f000] font-bold text-sm uppercase tracking-wider mb-3">Burstiness Injection</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Go through the draft and deliberately vary sentence length.
                Short sentence. Then a long one with multiple clauses and maybe a dash thrown in for
                emphasis &mdash; the kind of sentence that makes a grammar teacher twitch.
                Then a fragment. Like this one. The rhythm should feel like conversation, not composition.
              </p>
            </div>

            <div className="bg-[#0d0d0d] border border-[#ffadad]/20 rounded-lg p-6">
              <p className="text-[#ffadad] font-bold text-sm uppercase tracking-wider mb-3">Human Texture</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Add a minor tangent that you circle back from. Reference something specific
                (a date, a time, a particular wallet address, a tweet). Use a contraction where
                the AI used the full form. Throw in an opinion &mdash; not a hedged &quot;one might argue&quot;
                opinion, but a flat statement: &quot;This is better. Full stop.&quot;
              </p>
            </div>

            <div className="bg-[#0d0d0d] border border-[#d4f000]/20 rounded-lg p-6">
              <p className="text-[#d4f000] font-bold text-sm uppercase tracking-wider mb-3">Tonal Oscillation</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Alternate between registers. A dead-serious technical paragraph about
                fee distribution, followed by a sarcastic aside about cheese reserves.
                Professionalism and absurdism in the same piece. That is the $BRAIN voice.
                AI cannot do this well because it tries to maintain a consistent tone. Do not be consistent.
              </p>
            </div>

            <div className="bg-[#0d0d0d] border border-[#ffadad]/20 rounded-lg p-6">
              <p className="text-[#ffadad] font-bold text-sm uppercase tracking-wider mb-3">The Read-Aloud Test</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Read the final draft out loud. If any sentence makes you feel like a corporate
                press release robot, rewrite it in the way you would actually say it to
                someone at a bar. That version is better. It is always better.
              </p>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 6: PROJECT CONTEXT
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>06</p>
          <h2 className={S.sectionTitle}>Project Context</h2>
          <GradientLine />

          <h3 className={S.subheading}>What is $BRAIN</h3>
          <p className={S.body + ' mb-6'}>
            $BRAIN is a highly deflationary Solana-based reflecting investment token built on{' '}
            <a href="https://bags.fm" target="_blank" rel="noopener noreferrer" className="text-[#d4f000] hover:text-white underline underline-offset-4 decoration-[#d4f000]/30">bags.fm</a>.
            It is themed around the animated series <em>Pinky and the Brain</em> and operates as a
            decentralized venture capital mechanism for the bags.fm ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">Contract Address</p>
              <p className="text-[#ccc] font-mono text-xs break-all">7r9RJw6gWbj6s1N9pGKrdzzd5H7oK1sauuwkUDVKBAGS</p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">Website</p>
              <a href="https://pinkyandthebrain.fun" target="_blank" rel="noopener noreferrer" className="text-[#ccc] font-mono text-xs hover:text-[#d4f000] transition-colors">pinkyandthebrain.fun</a>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">Twitter / X</p>
              <a href="https://x.com/BrainOnBags" target="_blank" rel="noopener noreferrer" className="text-[#ccc] font-mono text-xs hover:text-[#d4f000] transition-colors">@BrainOnBags</a>
            </div>
          </div>

          <h3 className={S.subheading}>Core Concept</h3>
          <p className={S.body + ' mb-4'}>
            The project exists at the intersection of meme culture and real financial infrastructure.
            It is a meme token that actually does things &mdash; invests in other projects, builds apps,
            manages a public treasury, and distributes SOL reflections to holders.
          </p>

          <div className="bg-[#111] border-l-4 border-[#d4f000] rounded-r-lg p-6 mb-6 space-y-4">
            <p className="text-[#ccc] italic leading-relaxed">
              &quot;A totally rational accumulation of capital designed to fund the acquisition of all global cheese reserves.&quot;
            </p>
            <p className="text-[#ccc] italic leading-relaxed">
              &quot;Same thing we do every night, Pinky. Try to take over the world.&quot;
            </p>
            <p className="text-[#ccc] italic leading-relaxed">
              &quot;A highly deflationary Solana reflecting mouse ponzi investment token.&quot;
            </p>
          </div>

          <h3 className={S.subheading}>Decentralized VC for bags.fm</h3>
          <p className={S.body + ' mb-4'}>
            $BRAIN is not just another token on the bags.fm platform. It is the venture capital arm.
            The treasury actively invests in other bags.fm projects, builds applications for the ecosystem
            (PinkBrain LP, PinkBrain Router), and creates revenue streams that feed back to holders.
            The &quot;decentralized VC&quot; framing is core to the messaging &mdash; this is a community-owned fund
            that builds and invests, not just a token that goes up and down.
          </p>

          <div className="bg-[#0d0d0d] border border-[#d4f000]/20 rounded-lg p-5 mt-6">
            <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">Treasury Dashboard</p>
            <p className="text-[#aaa] text-sm">
              All treasury operations are visible in real-time at{' '}
              <a href="https://pinkyandthebrain.fun/war-room" target="_blank" rel="noopener noreferrer" className="text-[#d4f000] hover:text-white underline underline-offset-4 decoration-[#d4f000]/30">
                pinkyandthebrain.fun/war-room
              </a>
            </p>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 7: THE WAR ROOM
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>07</p>
          <h2 className={S.sectionTitle}>The War Room</h2>
          <GradientLine />

          <p className={S.body + ' mb-6'}>
            The War Room is the live intelligence dashboard at{' '}
            <a href="https://pinkyandthebrain.fun/war-room" target="_blank" rel="noopener noreferrer" className="text-[#d4f000] hover:text-white underline underline-offset-4 decoration-[#d4f000]/30">
              pinkyandthebrain.fun/war-room
            </a>. It is styled like a military command center because we are cartoon mice planning world domination
            and aesthetics matter.
          </p>

          <h3 className={S.subheading}>Dashboard Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { title: 'Treasury Intel', desc: 'Real-time SOL balance, token holdings, investment P&L tracking with live price feeds from Jupiter and Birdeye.' },
              { title: 'Burn Operations', desc: 'Complete burn history, total tokens destroyed, deflationary progress tracking. Every burn is on-chain verifiable.' },
              { title: 'Reflections Intel', desc: 'SOL distribution history to top 100 holders. Per-wallet breakdown. Running totals.' },
              { title: 'Holder Analytics', desc: 'Distribution charts, whale tracking, concentration metrics. Know exactly who holds what.' },
              { title: 'Governance', desc: 'On-chain proposal creation, voting (wallet-connected), results tracking. Real community governance, not theater.' },
              { title: 'Wallet Checker', desc: 'Connect or paste any wallet to check $BRAIN balance, reflection eligibility, holder rank.' },
            ].map((f) => (
              <div key={f.title} className="bg-[#111] border border-[#222] rounded-lg p-5">
                <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">{f.title}</p>
                <p className="text-[#aaa] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <h3 className={S.subheading}>The Terminal Aesthetic</h3>
          <p className={S.body + ' mb-4'}>
            The War Room uses a fake terminal / command-center design language. Lime green on black.
            Monospace fonts. Scan lines. Animated orbs. It is deeply unnecessary and deeply on-brand.
          </p>
          <div className={S.code + ' mb-6'}>
            <p className="text-[#d4f000]">&gt; INITIALIZING WAR ROOM...</p>
            <p className="text-[#555]">&gt; CONNECTING TO SOLANA MAINNET...</p>
            <p className="text-[#d4f000]">&gt; TREASURY STATUS: OPERATIONAL</p>
            <p className="text-[#ffadad]">&gt; WORLD DOMINATION: 23.7% COMPLETE</p>
            <p className="text-[#555]">&gt; CHEESE RESERVES: SECURED</p>
          </div>

          <h3 className={S.subheading}>Hall of Fame / Hall of Shame</h3>
          <p className={S.body}>
            The War Room includes a Hall of Fame for top contributors and significant milestones,
            and a Hall of Shame for notable fails. Both are displayed with the same military
            terminal aesthetic. This reinforces the building-in-public ethos &mdash; we celebrate
            wins and acknowledge losses publicly.
          </p>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 8: PINKBRAIN LP
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>08</p>
          <h2 className={S.sectionTitle}>PinkBrain LP</h2>
          <GradientLine />

          <div className="flex items-center gap-3 mb-6">
            <span className={S.limePill}>App #001</span>
            <span className="inline-block bg-[#ffadad]/10 border border-[#ffadad]/20 text-[#ffadad] font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Active</span>
          </div>

          <h3 className={S.subheading}>What It Does</h3>
          <p className={S.body + ' mb-6'}>
            PinkBrain LP is an auto-compounding liquidity engine built for the bags.fm ecosystem.
            It manages liquidity positions automatically, compounds fees back into the pool,
            and generates revenue that feeds into the $BRAIN treasury. Think of it as a robot
            that tends the garden so the treasury grows even when no one is watching.
          </p>

          <h3 className={S.subheading}>Why DAMM v2</h3>
          <p className={S.body + ' mb-6'}>
            bags.fm uses DAMM v2 (Dynamic Automated Market Making) for its AMM. PinkBrain LP is purpose-built
            to work with DAMM v2&apos;s unique fee structure and liquidity mechanics. It is not a generic LP
            manager ported from Uniswap &mdash; it is built from scratch for this specific ecosystem.
          </p>

          <h3 className={S.subheading}>The Flow</h3>
          <div className={S.code + ' mb-6'}>
            <p className="text-[#555]">{'// PinkBrain LP Auto-Compound Flow'}</p>
            <p className="text-[#ccc]">&nbsp;</p>
            <p className="text-[#d4f000]">{'  [Trading Activity on bags.fm]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'          v'}</p>
            <p className="text-[#d4f000]">{'  [Fees Generated (DAMM v2)]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'          v'}</p>
            <p className="text-[#ffadad]">{'  [PinkBrain LP Collects Fees]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'     +---------+'}</p>
            <p className="text-[#555]">{'     |         |'}</p>
            <p className="text-[#555]">{'     v         v'}</p>
            <p className="text-[#d4f000]">{'  [Re-add to]  [Send to $BRAIN]'}</p>
            <p className="text-[#d4f000]">{'  [Liquidity]  [Treasury]'}</p>
            <p className="text-[#555]">{'     |         |'}</p>
            <p className="text-[#555]">{'     v         v'}</p>
            <p className="text-[#ccc]">{'  Deeper LP    Investments,'}</p>
            <p className="text-[#ccc]">{'  Less Slip    Burns, Reflections'}</p>
          </div>

          <h3 className={S.subheading}>Technical Stack</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {['Solana / SPL', 'DAMM v2 SDK', 'Anchor Framework', 'TypeScript', 'Cron-based Execution'].map((tag) => (
              <span key={tag} className={S.limePill}>{tag}</span>
            ))}
          </div>

          <div className="bg-[#0d0d0d] border border-[#222] rounded-lg p-5">
            <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">GitHub</p>
            <a
              href="https://github.com/kr8tiv-ai/PinkBrain-lp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ccc] font-mono text-sm hover:text-[#d4f000] underline underline-offset-4 decoration-[#333] transition-colors"
            >
              github.com/kr8tiv-ai/PinkBrain-lp
            </a>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 9: PINKBRAIN ROUTER
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>09</p>
          <h2 className={S.sectionTitle}>PinkBrain Router</h2>
          <GradientLine />

          <div className="flex items-center gap-3 mb-6">
            <span className={S.limePill}>App #002</span>
            <span className="inline-block bg-[#e4ff57]/10 border border-[#e4ff57]/20 text-[#e4ff57] font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">In Development</span>
          </div>

          <h3 className={S.subheading}>What It Does</h3>
          <p className={S.body + ' mb-6'}>
            PinkBrain Router converts DeFi fees into AI API credits. It takes revenue generated
            by the $BRAIN ecosystem and routes it into API access for AI services &mdash;
            effectively turning trading activity into compute power. DeFi fees in, AI capabilities out.
          </p>

          <h3 className={S.subheading}>Distribution Modes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <p className="text-[#d4f000] font-mono text-[10px] uppercase tracking-widest mb-2">Direct Conversion</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                SOL fees are swapped to stablecoins and used to purchase API credits directly.
                Straightforward. Predictable. The Brain approach.
              </p>
            </div>
            <div className="bg-[#111] border border-[#222] rounded-lg p-5">
              <p className="text-[#ffadad] font-mono text-[10px] uppercase tracking-widest mb-2">Pooled Access</p>
              <p className="text-[#aaa] text-sm leading-relaxed">
                Multiple ecosystem participants pool their fee allocations for bulk API pricing.
                Economies of scale. The Pinky approach (accidentally genius).
              </p>
            </div>
          </div>

          <h3 className={S.subheading}>Technical Architecture</h3>
          <div className={S.code + ' mb-6'}>
            <p className="text-[#555]">{'// PinkBrain Router Architecture'}</p>
            <p className="text-[#ccc]">&nbsp;</p>
            <p className="text-[#d4f000]">{'  [DeFi Fee Revenue (SOL)]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'          v'}</p>
            <p className="text-[#ffadad]">{'  [PinkBrain Router]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'     +---------+---------+'}</p>
            <p className="text-[#555]">{'     |         |         |'}</p>
            <p className="text-[#555]">{'     v         v         v'}</p>
            <p className="text-[#ccc]">{'  Swap to    Credit     Usage'}</p>
            <p className="text-[#ccc]">{'  USDC       Purchase   Tracking'}</p>
            <p className="text-[#555]">{'     |         |         |'}</p>
            <p className="text-[#555]">{'     v         v         v'}</p>
            <p className="text-[#d4f000]">{'  [AI API Credits Pool]'}</p>
            <p className="text-[#555]">{'          |'}</p>
            <p className="text-[#555]">{'          v'}</p>
            <p className="text-[#ccc]">{'  Distributed to ecosystem apps'}</p>
          </div>

          <div className="bg-[#111] border-l-4 border-[#e4ff57] rounded-r-lg p-6">
            <p className="text-white font-bold text-sm uppercase tracking-wider mb-2">Status</p>
            <p className="text-[#ccc] leading-relaxed">
              PinkBrain Router is currently in active development. Architecture is finalized,
              core contracts are being written. Expected to integrate with PinkBrain LP for
              automated fee routing once live.
            </p>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 10: TOKENOMICS
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>10</p>
          <h2 className={S.sectionTitle}>Tokenomics</h2>
          <GradientLine />

          <p className={S.body + ' mb-8'}>
            Every fee generated by $BRAIN trading is distributed according to a fixed on-chain allocation.
            No hidden wallets. No discretionary &quot;team fund&quot; that quietly grows.
            Here is exactly where every fraction of a SOL goes.
          </p>

          {/* Fee Distribution Bar */}
          <div className="mb-10">
            <p className="text-white font-bold text-sm uppercase tracking-wider mb-4">Fee Distribution Breakdown</p>
            <div className="w-full h-10 rounded-lg overflow-hidden flex">
              <div className="bg-[#d4f000] h-full flex items-center justify-center" style={{ width: '30%' }}>
                <span className="text-[#0a0a0a] font-mono text-[10px] font-black">30% Invest</span>
              </div>
              <div className="bg-[#ffadad] h-full flex items-center justify-center" style={{ width: '20%' }}>
                <span className="text-[#0a0a0a] font-mono text-[10px] font-black">20% Holders</span>
              </div>
              <div className="bg-[#ff6b35] h-full flex items-center justify-center" style={{ width: '20%' }}>
                <span className="text-[#0a0a0a] font-mono text-[10px] font-black">20% Dev</span>
              </div>
              <div className="bg-[#e4ff57]/60 h-full flex items-center justify-center" style={{ width: '10%' }}>
                <span className="text-[#0a0a0a] font-mono text-[9px] font-black">10% Burn</span>
              </div>
              <div className="bg-[#4a90e2] h-full flex items-center justify-center" style={{ width: '10%' }}>
                <span className="text-[#0a0a0a] font-mono text-[9px] font-black">10% LP</span>
              </div>
              <div className="bg-[#ccc] h-full flex items-center justify-center" style={{ width: '10%' }}>
                <span className="text-[#0a0a0a] font-mono text-[9px] font-black">10% Mkt</span>
              </div>
            </div>
          </div>

          {/* Fee details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              { pct: '30%', label: 'Investments', color: '#d4f000', desc: 'Treasury actively invests in bags.fm ecosystem projects.' },
              { pct: '20%', label: 'Top 100 Holders', color: '#ffadad', desc: 'SOL reflections distributed to the top 100 holders by balance.' },
              { pct: '20%', label: 'Dev Discretion', color: '#ff6b35', desc: 'Development costs, infrastructure, and operational expenses.' },
              { pct: '10%', label: 'Burned', color: '#e4ff57', desc: 'Permanently removed from supply. Deflationary pressure.' },
              { pct: '10%', label: 'Liquidity', color: '#4a90e2', desc: 'Compounding liquidity for deeper pools and less slippage.' },
              { pct: '10%', label: 'Marketing & Boosts', color: '#cccccc', desc: '5% marketing, 5% Dexscreener boosts. Visibility matters.' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111] border border-[#222] rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-black tracking-tighter" style={{ color: item.color }}>{item.pct}</span>
                  <span className="text-white font-bold text-sm uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-[#aaa] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h3 className={S.subheading}>On-Chain Actions</h3>
          <p className={S.body + ' mb-4'}>
            All fee distributions are executed on-chain via the bags.fm Fee Share V2 program.
            Each claimer wallet has a fixed BPS (basis points) allocation that cannot be changed
            without a program upgrade. The distribution is automatic and verifiable.
          </p>
          <div className={S.code}>
            <p className="text-[#555]">{'// Fee Share V2 On-Chain Allocations (BPS)'}</p>
            <p className="text-[#ccc]">Investments &nbsp;&nbsp;&nbsp; 3000 BPS &nbsp; (30%)</p>
            <p className="text-[#ccc]">Holders &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2000 BPS &nbsp; (20%)</p>
            <p className="text-[#ccc]">Dev &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2000 BPS &nbsp; (20%)</p>
            <p className="text-[#ccc]">Burned &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1000 BPS &nbsp; (10%)</p>
            <p className="text-[#ccc]">Liquidity &nbsp;&nbsp;&nbsp;&nbsp; 1000 BPS &nbsp; (10%)</p>
            <p className="text-[#ccc]">Marketing &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 500 BPS &nbsp; &nbsp;(5%)</p>
            <p className="text-[#ccc]">DexBoosts &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 500 BPS &nbsp; &nbsp;(5%)</p>
            <p className="text-[#555]">{'// ─────────────────────────'}</p>
            <p className="text-[#d4f000]">Total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 10000 BPS &nbsp; (100%)</p>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 11: CONTENT CHECKLIST
           ══════════════════════════════════════════════════════════════ */}
        <section className={S.sectionWrap}>
          <p className={S.sectionNum}>11</p>
          <h2 className={S.sectionTitle}>Content Checklist</h2>
          <GradientLine />

          <p className={S.body + ' mb-8'}>
            Run every piece of $BRAIN content through this checklist before publishing.
            If you cannot check every box, revise.
          </p>

          <div className="space-y-1">
            {[
              { category: 'Voice & Tone', items: [
                'Does it sound like a human wrote it? (Read it aloud.)',
                'Is there tonal oscillation? (Technical + absurd, not uniform.)',
                'Would Brain approve the strategy? Would Pinky laugh at the joke?',
                'Does it avoid corporate buzzwords and LinkedIn energy?',
                'Is it self-aware about being a meme token?',
              ]},
              { category: 'AI Detection', items: [
                'No Kill List words used on autopilot?',
                'Sentence length varies significantly? (Burstiness check.)',
                'Paragraph length varies? (No uniform 3-5 sentence blocks.)',
                'Contains at least one contraction per paragraph?',
                'Starts at least one sentence with And/But/Or/So?',
                'No "It\'s not X, it\'s Y" construction (or used sparingly)?',
                'No compulsive Rule of Three?',
              ]},
              { category: 'Substance', items: [
                'Contains at least one specific number, date, or address?',
                'Links to verifiable on-chain data where relevant?',
                'Technical claims are accurate?',
                'Does not promise returns or guaranteed outcomes?',
              ]},
              { category: 'Brand', items: [
                'References the project\'s theme naturally (not forced)?',
                'Includes a concrete call to action?',
                'Would a community member share this?',
                'Does it make the reader feel something? (Humor, curiosity, conviction.)',
              ]},
            ].map((group) => (
              <div key={group.category} className="mb-8">
                <p className="text-[#d4f000] font-mono text-xs uppercase tracking-widest mb-4">{group.category}</p>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item} className={S.checkItem}>
                      <div className={S.checkbox} />
                      <p className="text-[#ccc] text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════
            SECTION 12: THE ASSIGNMENT TEMPLATE
           ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20">
          <p className={S.sectionNum}>12</p>
          <h2 className={S.sectionTitle}>The Assignment Template</h2>
          <GradientLine />

          <p className={S.body + ' mb-8'}>
            Use this template when creating any long-form content about $BRAIN.
            Whether you are writing the article yourself or feeding instructions to an LLM,
            this structure ensures the output matches the brand.
          </p>

          <div className="bg-[#111] border border-[#333] rounded-lg overflow-hidden">
            <div className="bg-[#0d0d0d] border-b border-[#333] px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff6b35]" />
              <div className="w-3 h-3 rounded-full bg-[#d4f000]" />
              <div className="w-3 h-3 rounded-full bg-[#4a90e2]" />
              <span className="ml-3 text-[#555] font-mono text-xs">assignment-template.md</span>
            </div>
            <div className="p-6 font-mono text-sm text-[#ccc] space-y-4 leading-relaxed">
              <p className="text-[#d4f000]"># Article Structure</p>
              <p>&nbsp;</p>
              <p className="text-[#d4f000]">## 1. The Hook (1-2 sentences)</p>
              <p className="text-[#aaa]">Open with something unexpected. A question,</p>
              <p className="text-[#aaa]">a contradiction, a bold claim. Not &quot;In today&apos;s</p>
              <p className="text-[#aaa]">rapidly evolving landscape...&quot;</p>
              <p>&nbsp;</p>
              <p className="text-[#d4f000]">## 2. The Context (1-2 paragraphs)</p>
              <p className="text-[#aaa]">What is $BRAIN and why should the reader care?</p>
              <p className="text-[#aaa]">Use specific numbers. Link to the War Room.</p>
              <p className="text-[#aaa]">Be concrete, not abstract.</p>
              <p>&nbsp;</p>
              <p className="text-[#d4f000]">## 3. The Meat (3-5 paragraphs)</p>
              <p className="text-[#aaa]">The actual content. Technical details, strategy</p>
              <p className="text-[#aaa]">updates, ecosystem analysis. Vary paragraph</p>
              <p className="text-[#aaa]">length aggressively. Include at least one</p>
              <p className="text-[#aaa]">tangent or aside.</p>
              <p>&nbsp;</p>
              <p className="text-[#d4f000]">## 4. The Twist (1 paragraph)</p>
              <p className="text-[#aaa]">A perspective shift. Challenge an assumption.</p>
              <p className="text-[#aaa]">Say something slightly controversial. Make the</p>
              <p className="text-[#aaa]">reader think.</p>
              <p>&nbsp;</p>
              <p className="text-[#d4f000]">## 5. The Close (1-3 sentences)</p>
              <p className="text-[#aaa]">End on a strong note. Not a summary. Not</p>
              <p className="text-[#aaa]">&quot;in conclusion.&quot; A final punch. Maybe a</p>
              <p className="text-[#aaa]">callback to the hook. Maybe a Pinky quote.</p>
              <p>&nbsp;</p>
              <p className="text-[#ffadad]"># Requirements</p>
              <p>&nbsp;</p>
              <p className="text-[#aaa]">- Minimum 2 specific numbers/dates/addresses</p>
              <p className="text-[#aaa]">- At least 1 link to on-chain data</p>
              <p className="text-[#aaa]">- No more than 2 Kill List words total</p>
              <p className="text-[#aaa]">- Sentence length range: 3 words to 40+ words</p>
              <p className="text-[#aaa]">- At least 1 sentence starting with And/But/So</p>
              <p className="text-[#aaa]">- Passes GPTZero at &lt;15% AI probability</p>
              <p className="text-[#aaa]">- Makes at least one person laugh or think</p>
              <p className="text-[#aaa]">- References Pinky and the Brain naturally</p>
              <p className="text-[#aaa]">- Includes a clear call to action</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#555] font-mono text-xs uppercase tracking-[0.3em]">
              Same thing we do every night, Pinky.
            </p>
            <p className="text-[#333] font-mono text-xs uppercase tracking-[0.3em] mt-2">
              Try to write content that doesn&apos;t get flagged by GPTZero.
            </p>
          </div>
        </section>


        {/* ── Footer spacer ── */}
        <div className="h-20" />
      </div>

      {/* Background watermark */}
      <div className="fixed bottom-0 left-0 text-[12rem] md:text-[18rem] leading-none font-black text-white/[0.015] tracking-tighter pointer-events-none select-none z-0">
        NARF.
      </div>
    </main>
  )
}
