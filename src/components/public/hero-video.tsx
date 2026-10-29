'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HeroClip = { src: string; poster: string; label: string };

/** Clips live in /public/videos — swap these to change the hero footage. */
export const heroClips: HeroClip[] = [
  { src: '/videos/notes.mp4', poster: '/videos/notes.jpg', label: 'Taking notes' },
  { src: '/videos/laptop.mp4', poster: '/videos/laptop.jpg', label: 'Learning online' },
  { src: '/videos/classroom.mp4', poster: '/videos/classroom.jpg', label: 'In the classroom' },
  { src: '/videos/reading.mp4', poster: '/videos/reading.jpg', label: 'Reading' },
];

const SCENE_MS = 7000;

/**
 * Full-bleed background that crossfades between video clips.
 * Only the active and next clip are loaded; playback pauses off-screen, in hidden tabs,
 * and is replaced by still posters when the user prefers reduced motion.
 */
export function HeroVideo({ clips = heroClips, className }: { clips?: HeroClip[]; className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const playing = !paused && visible && !reduce;
  const next = (index + 1) % clips.length;
  const goTo = useCallback((i: number) => setIndex(i), []);

  // Pause when the hero scrolls out of view or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && !document.hidden), { threshold: 0.1 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0);
    document.addEventListener('visibilitychange', onVis);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  // Advance scenes on a timer (stills keep rotating too, just without video).
  useEffect(() => {
    if (paused || !visible || clips.length < 2) return;
    const t = setTimeout(() => setIndex(i => (i + 1) % clips.length), SCENE_MS);
    return () => clearTimeout(t);
  }, [index, paused, visible, clips.length]);

  // Play only the active clip; rewind it so each scene starts fresh.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index && playing) {
        v.play().catch(() => { /* autoplay blocked — poster stays visible */ });
      } else {
        v.pause();
        if (i !== index) v.currentTime = 0;
      }
    });
  }, [index, playing]);

  return (
    <div ref={rootRef} className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden={false}>
      {clips.map((clip, i) => {
        const active = i === index;
        return (
          <motion.div
            key={clip.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1.08 : 1 }}
            transition={{
              opacity: { duration: 1.4, ease: 'easeInOut' },
              scale: { duration: active ? SCENE_MS / 1000 + 1.4 : 1.4, ease: 'linear' },
            }}
          >
            {reduce ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clip.poster} alt="" className="h-full w-full object-cover" />
            ) : (
              <video
                ref={el => { videoRefs.current[i] = el; }}
                className="h-full w-full object-cover"
                poster={clip.poster}
                muted
                loop
                playsInline
                preload={active || i === next ? 'auto' : 'none'}
                aria-hidden
                tabIndex={-1}
              >
                <source src={clip.src} type="video/mp4" />
              </video>
            )}
          </motion.div>
        );
      })}

      {/* Brand tint + vignette keep the headline readable over any footage. */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/80 to-brand-800/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(7,24,50,0.6)_100%)]" />

      {/* Scene controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-full bg-black/25 px-3 py-2 backdrop-blur-md">
        <button
          onClick={() => setPaused(p => !p)}
          className="rounded-full p-1 text-white/80 hover:text-white transition-colors"
          aria-label={paused ? 'Play background video' : 'Pause background video'}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Background scenes">
          {clips.map((clip, i) => (
            <button
              key={clip.src}
              role="tab"
              aria-selected={i === index}
              aria-label={clip.label}
              onClick={() => goTo(i)}
              className="relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-all duration-300 hover:bg-white/60"
              style={{ width: i === index ? 28 : 8 }}
            >
              {/* Fill shows time remaining in the current scene. */}
              {i === index && !paused && visible && (
                <motion.span
                  key={`fill-${index}`}
                  className="absolute inset-y-0 left-0 bg-white"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: SCENE_MS / 1000, ease: 'linear' }}
                />
              )}
              {i === index && (paused || !visible) && <span className="absolute inset-0 bg-white" />}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="hidden sm:block text-[11px] font-medium uppercase tracking-wider text-white/80 min-w-[110px]"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {clips[index].label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
