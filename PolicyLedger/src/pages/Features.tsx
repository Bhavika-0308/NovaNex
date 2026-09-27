import Nav from '../components/Nav';
import { Link } from 'react-router-dom';

const features = [
  {
    title: "Policy extraction",
    description: "Upload any standard health insurance policy PDF. PolicyLedger automatically reads and categorizes your coverage rules, eligibility criteria, waiting periods, deductibles, sub-limits, and named exclusions.",
    align: "left"
  },
  {
    title: "Cited, conversational answers",
    description: "Ask plain-language questions like 'Are maternity expenses covered?' Every response is strictly tethered to your document. PolicyLedger provides the answer along with a distinct, clickable citation detailing the exact section and page number.",
    align: "right"
  },
  {
    title: "Treatment cost estimation",
    description: "Go beyond abstract rules. Input a diagnosis or treatment name, and PolicyLedger combines your policy's terms with a structured dataset of typical localized medical costs to project your likely hospital bill.",
    align: "left"
  },
  {
    title: "Covered vs. out-of-pocket breakdown",
    description: "The estimated cost is split into exactly what the policy is likely to pay and your remaining financial liability. We clearly explain the driving factors, such as 'room choice exceeded the daily limit' or 'co-pay applied'.",
    align: "right"
  },
  {
    title: "Confidence and missing-information flags",
    description: "We never guess. If crucial information like your policy inception date or specific room type is missing, the system states its confidence level and names the missing inputs required for a precise calculation.",
    align: "left"
  },
  {
    title: "Live refinement",
    description: "Update the scenario on the fly. Change your room category from 'Suite' to 'Single Private' and watch the estimate and confidence level update instantly, allowing you to make informed decisions before admission.",
    align: "right"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-ink font-sans text-text">
      <Nav />
      
      <main>
        {/* Header */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
          <h1 className="text-4xl lg:text-6xl font-serif">Every rule and limit, calculated.</h1>
          <p className="text-xl text-muted leading-relaxed">
            From parsing dense legal clauses to projecting actual hospital bills, discover how PolicyLedger brings transparency to your health insurance.
          </p>
        </section>

        {/* Feature Sections */}
        <section className="max-w-7xl mx-auto px-6 py-12 space-y-32 mb-32">
          {features.map((feat, idx) => (
            <div key={idx} className={`flex flex-col lg:flex-row items-center gap-16 ${feat.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              
              {/* Text Block */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-panel border border-line text-gold font-mono text-sm mb-2">
                  0{idx + 1}
                </div>
                <h2 className="text-3xl font-serif">{feat.title}</h2>
                <p className="text-lg text-muted leading-relaxed">
                  {feat.description}
                </p>
              </div>

              {/* Placeholder UI Mock Slot */}
              <div className="flex-1 w-full relative">
                <div className="aspect-video bg-panel border border-line rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                  {/* Subtle decorative elements for the mockup */}
                  <div className="absolute top-0 left-0 w-full h-12 border-b border-line bg-panel-2/50 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-line"></div>
                    <div className="w-3 h-3 rounded-full bg-line"></div>
                    <div className="w-3 h-3 rounded-full bg-line"></div>
                  </div>
                  
                  <div className="text-muted/50 font-mono text-sm mt-8 border border-dashed border-line/50 rounded p-4">
                    [ UI Mockup: {feat.title} ]
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </section>

        {/* CTA Band */}
        <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
          <div className="border border-line bg-panel p-12 rounded-xl space-y-6">
            <h2 className="text-4xl font-serif">Stop guessing your medical bills.</h2>
            <p className="text-xl text-muted max-w-xl mx-auto">
              Get clarity on your coverage in minutes, not days.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link to="/login" className="inline-block bg-gold text-ink font-medium px-8 py-4 rounded hover:bg-gold/90 transition-colors text-lg">
                Upload your policy
              </Link>
              <Link to="/dashboard" className="inline-block bg-panel-2 border border-line text-text font-medium px-8 py-4 rounded hover:bg-panel transition-colors text-lg">
                Try sample policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div>
            <span className="font-serif font-bold text-text mr-2">PolicyLedger</span>
            — Insurance Intelligence
          </div>
          <div className="text-xs text-muted/60">
            Estimates are illustrative and not a claim decision.
          </div>
        </div>
      </footer>
    </div>
  );
}
