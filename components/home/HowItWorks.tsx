export default function HowItWorks() {
  return (
    <section id="how" className="bg-background-alt py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12 font-heading">
        How It Works
      </h2>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 md:gap-8">
        <div className="flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold flex items-center justify-center mx-auto mb-4 text-base">
            1
          </div>
          <div className="text-base font-semibold mb-2">Upload Photo</div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Drop a front-facing photo or use your camera. We never store your
            image.
          </p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold flex items-center justify-center mx-auto mb-4 text-base">
            2
          </div>
          <div className="text-base font-semibold mb-2">AI Analysis</div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Our AI maps 478 facial landmarks and analyzes 5 dimensions in under
            3 seconds.
          </p>
        </div>
        <div className="flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-accent-light text-accent font-bold flex items-center justify-center mx-auto mb-4 text-base">
            3
          </div>
          <div className="text-base font-semibold mb-2">
            Get Recommendations
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            See your face shape with visual overlay, plus personalized style
            recommendations.
          </p>
        </div>
      </div>
    </section>
  );
}
