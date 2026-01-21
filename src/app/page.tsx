'use client';

import { ALL_PLUGINS } from "@/lib/mockData";
import { PluginCard } from "@/components/PluginCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";




export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20 max-w-7xl mx-auto relative">

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 mt-10 md:mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl font-black tracking-tighter"
        >
          Sequels
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold max-w-4xl leading-tight text-zinc-800 dark:text-zinc-200"
        >
          You decide what happens next.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-zinc-500 max-w-2xl mt-4"
        >
          Connect your favorite apps and devices. Create powerful automations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Link href="/create">
            <Button size="lg" className="text-xl px-12 py-8 rounded-full shadow-2xl hover:scale-105 transition-transform bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
              Start Creating
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Plugins Grid */}
      <section>
        <div className="flex justify-between items-end mb-8 px-4">
          <h2 className="text-3xl font-bold tracking-tight">Available Plugins</h2>
          <span className="text-zinc-500">and many more...</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {Array.from(new Map(ALL_PLUGINS.map(p => [p.name, p])).values()).map((plugin, index) => (
            <motion.div
              key={plugin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <PluginCard plugin={plugin} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
