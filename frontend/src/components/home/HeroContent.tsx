import { motion } from "framer-motion";
import { Link } from "react-router";

export function HeroContent() {
  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 flex flex-col items-start text-left px-4 max-w-2xl"
    >
      <motion.p variants={item} className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-300">
        Welcome to Josh
      </motion.p>
      
      <motion.h1 
        variants={item} 
        className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-tight"
      >
        What’s Happening Around You <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-pink">
          Right Now
        </span>
      </motion.h1>
      
      <motion.p variants={item} className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl drop-shadow-md">
        Explore trending events, book instantly, and never miss out again. Connect with your community and experience the extraordinary.
      </motion.p>
      
      <motion.div variants={item} className="mt-10 flex flex-wrap gap-4 justify-start">
        <Link
          to="/events"
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-brand-500 to-accent-pink px-8 py-4 font-bold text-white shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(236,72,153,0.7)]"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
          Explore Events
        </Link>
        
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-md px-8 py-4 font-bold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-500"
        >
          Create Account
        </Link>
      </motion.div>
    </motion.div>
  );
}
