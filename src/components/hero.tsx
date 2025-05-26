import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';

import { ContactDialog } from './ContactDialog';
import { AnimatedElement } from './ui/animated-element';

/* -------------------------------------------------- */
/* Config & helpers                                   */
/* -------------------------------------------------- */

interface HeroProps {
  onContactClick?: () => void;
}

const DYNAMIC_WORDS = [
  'Growth',
  'CRM Management',
  'Web Scraping',
  'Customer Support',
  'Lead Generation',
  'Process Automation',
];

/* Hand-drawn underline used twice in the tagline */
function HandDrawnUnderline({
  width,
  offsetX = 0,
}: {
  width: number;
  offsetX?: number;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} 40`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute bottom-[-6px] h-[14px]"
      style={{ width, left: offsetX }}
    >
      <motion.path
        d={`M3 20 C${width * 0.25} 30, ${width * 0.5} 10, ${width * 0.75} 25, ${
          width - 5
        } 10`}
        stroke="#ff3131"
        strokeWidth="6"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/* -------------------------------------------------- */
/* Component                                          */
/* -------------------------------------------------- */

const Hero = ({ onContactClick }: HeroProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  /* Rotate “For … ” word every 2 s */
  useEffect(() => {
    const id = setInterval(
      () => setWordIndex((prev) => (prev + 1) % DYNAMIC_WORDS.length),
      2000
    );
    return () => clearInterval(id);
  }, []);

  const handleContactClick = () => {
    if (onContactClick) onContactClick();
    else setDialogOpen(true);
  };

  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedElement
            animation="fadeIn"
            direction="up"
            delay={0.3}
            className="space-y-8"
          >
            {/* ----------------------------------------- */}
            {/* Headline                                 */}
            {/* ----------------------------------------- */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <AnimatedElement
                animation="fadeIn"
                direction="left"
                delay={0.5}
                as="span"
                className="inline-block"
              >
                We&nbsp;Build
              </AnimatedElement>
              <br />
              <AnimatedElement
                animation="fadeIn"
                direction="right"
                delay={0.7}
                as="span"
                className="inline-block"
              >
                AI&nbsp;Automations
              </AnimatedElement>
              <br />
              <AnimatedElement
                animation="fadeIn"
                direction="left"
                delay={0.9}
                as="span"
                className="inline-block"
              >
                For&nbsp;
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="inline-flex items-center gap-2 text-gray-500"
                  >
                    {DYNAMIC_WORDS[wordIndex]}

                    {/* Red-dot logo element */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-2"
                    >
                      <div className="flex items-center justify-center">
                        <div className="relative h-4 w-4">
                          {/* Halo ring */}
                          <div
                            className="absolute inset-0 rounded-full border-2 border-[#ff3131]/20"
                            style={{ transform: 'scale(1.15)' }}
                          />
                          {/* Centre-aligned bouncing dot */}
                          <motion.div
                            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 bg-[#ff3131] rounded-full"
                            style={{
                              translateX: '-50%',
                              translateY: '-50%',
                            }}
                            animate={{ y: ['-4px', '4px', '-4px'] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.span>
                </AnimatePresence>
              </AnimatedElement>
            </h1>

            {/* ----------------------------------------- */}
            {/* Tagline                                   */}
            {/* ----------------------------------------- */}
            <AnimatedElement
              animation="fadeIn"
              direction="up"
              delay={1.1}
              className="text-xl"
              as="p"
            >
              <AnimatedElement
                animation="pulse"
                duration={3}
                as="span"
                className="relative inline-block text-[#ff3131] font-bold"
              >
                NODDING
                <HandDrawnUnderline width={210} offsetX={-68} />
              </AnimatedElement>{' '}
              <span className="text-black">to&nbsp;the&nbsp;</span>
              <AnimatedElement
                animation="pulse"
                duration={3}
                as="span"
                className="relative inline-block text-[#ff3131] font-bold"
              >
                FUTURE
                <HandDrawnUnderline width={155} offsetX={-50} />
              </AnimatedElement>{' '}
              – We transform businesses through innovative AI solutions,
              creating seamless experiences that define tomorrow&apos;s
              technology.
            </AnimatedElement>

            {/* ----------------------------------------- */}
            {/* CTA buttons                               */}
            {/* ----------------------------------------- */}
            <div className="relative inline-flex items-center">
              {/* Main button */}
              <AnimatedElement
                animation="hover"
                as="button"
                className="bg-black text-white text-lg font-medium px-6 py-4 rounded-lg w-full max-w-[220px] flex justify-between items-center relative z-10"
                onClick={handleContactClick}
                duration={0.2}
              >
                <span>Let&apos;s talk</span>
                <span className="w-[64px]" />
              </AnimatedElement>

              {/* Icon button (overlay) */}
              <AnimatedElement
                animation="hover"
                as="button"
                className="absolute right-0 w-[52px] h-[52px] bg-white hover:bg-gray-50 flex items-center justify-center rounded-lg shadow-md z-20 translate-x-[-16px] border border-gray-200"
                onClick={handleContactClick}
                motionProps={{
                  whileHover: {
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgb(249 250 251)',
                  },
                }}
              >
                <Phone className="w-5 h-5 text-black" />
              </AnimatedElement>
            </div>
          </AnimatedElement>
        </div>
      </div>

      {/* Contact modal */}
      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  );
};

export default Hero;
