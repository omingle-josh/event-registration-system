import { DiscoBallScene } from "../components/home/DiscoBallScene";
import { HeroContent } from "../components/home/HeroContent";

export function HomePage() {
  return (
    <main className="relative w-full bg-slate-950 md:bg-transparent">
      {/* Fixed background scene (Hidden on mobile) */}
      <DiscoBallScene />
      
      {/* Scrollable content layer */}
      <div className="relative w-full z-10 flex flex-col items-center">
        {/* Hero Section takes full viewport height */}
        <section className="flex min-h-[calc(100vh-64px)] w-full max-w-7xl px-4 sm:px-6 lg:px-8 items-center justify-start md:pt-20 pb-10">
          <HeroContent />
        </section>

        {/* Dummy content section to enable scrolling for the Disco Ball rotation */}
        <section className="w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8 min-h-[100vh]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Experience the Vibe</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Scroll down to keep the party moving. The interactive elements map to your scroll and mouse movements creating an immersive event discovery experience.
            </p>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[1, 2, 3].map((i) => (
                 <div key={i} className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
                    <div className="h-40 bg-slate-700/50 rounded-xl mb-4 animate-pulse"></div>
                    <div className="h-6 w-3/4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                 </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
