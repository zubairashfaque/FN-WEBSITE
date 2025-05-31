import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import Header from "./header";
import Hero from "./hero";
import Services from "./services";
import Process from "./process";
import NodSection from "./nod-section";
import Team from "./team";
import Footer from "./footer";
import ContactModal from "./ContactModal";
import EnvVariablesNotice from "./EnvVariablesNotice";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { getUseCases } from "../api/usecases";

function HandDrawnUnderline({
  width,
  offsetX,
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
      style={{ width, left: offsetX || 0 }}
    >
      <motion.path
        d={`M3 20 C${width * 0.25} 30, ${width * 0.5} 10, ${width * 0.75} 25, ${width - 5} 10`}
        stroke="#ff3131"
        strokeWidth="6"
        fill="transparent"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  image: string;
  industry: string;
  industries?: string[];
  solutionType: string;
  categories?: string[];
  link: string;
}

function UseCaseSlideshow({ onContactClick }: { onContactClick: () => void }) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  // Fetch use cases from the database
  useEffect(() => {
    const fetchUseCases = async () => {
      setIsLoading(true);
      try {
        const useCasesData = await getUseCases();

        // Map the data to match our component's expected format
        const formattedUseCases = useCasesData.map((useCase) => ({
          id: useCase.id,
          title: useCase.title,
          description: useCase.description,
          image: useCase.imageUrl,
          industry: useCase.industry,
          // Ensure industries is always an array
          industries:
            Array.isArray(useCase.industries) && useCase.industries.length > 0
              ? useCase.industries
              : [useCase.industry],
          solutionType: useCase.category,
          // Ensure categories is always an array
          categories:
            Array.isArray(useCase.categories) && useCase.categories.length > 0
              ? useCase.categories
              : [useCase.category],
          link: `/use-cases/${useCase.id}`,
        }));

        setUseCases(formattedUseCases);
      } catch (err) {
        console.error("Error fetching use cases:", err);
        setError("Failed to load use cases. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUseCases();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || useCases.length === 0) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % useCases.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, useCases.length]);

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % useCases.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + useCases.length) % useCases.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Animation variants for the use case cards
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const currentUseCase = useCases[currentIndex];

  if (isLoading || error || useCases.length === 0) {
    return null; // Don't show the section if there's no data
  }

  return (
    <section className="w-full bg-background py-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 relative inline-block">
            <span className="relative inline-block text-[#ff3131] font-bold">
              Use Cases
              <HandDrawnUnderline width={240} offsetX={-80} />
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-8">
            Discover how our solutions have transformed businesses across
            industries with innovative technology implementations.
          </p>
        </div>

        {/* Main Use Case Display */}
        <div className="relative">
          {/* Use Case Carousel */}
          <div className="relative h-[600px] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.4 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    goToNext();
                  } else if (swipe > swipeConfidenceThreshold) {
                    goToPrevious();
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <Card className="h-full border-none shadow-2xl bg-white/80 backdrop-blur-sm">
                  <div className="grid md:grid-cols-2 h-full">
                    {/* Image Section */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-8">
                      <div className="relative z-10">
                        <img
                          src={currentUseCase.image}
                          alt={currentUseCase.title}
                          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-lg"
                          loading="lazy"
                        />
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
                      <div className="absolute bottom-8 left-8 w-16 h-16 bg-secondary/10 rounded-full blur-lg"></div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col justify-center p-8 md:p-12">
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(
                          currentUseCase.industries || [currentUseCase.industry]
                        ).map((industry, idx) => (
                          <Badge
                            key={`industry-${idx}`}
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
                          >
                            {industry}
                          </Badge>
                        ))}
                        {(
                          currentUseCase.categories || [
                            currentUseCase.solutionType,
                          ]
                        ).map((category, idx) => (
                          <Badge
                            key={`category-${idx}`}
                            variant="outline"
                            className="bg-secondary/10 text-secondary border-secondary/20 px-3 py-1"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        {currentUseCase.title}
                      </h3>

                      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        {currentUseCase.description}
                      </p>

                      <div className="flex gap-4">
                        <Button
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-white group"
                          asChild
                        >
                          <a href={currentUseCase.link}>
                            <span>Explore Case Study</span>
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </a>
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={onContactClick}
                        >
                          Let's Talk
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous use case"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next use case"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center mt-8 gap-6">
            {/* Dots Indicator */}
            <div className="flex gap-2">
              {useCases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-primary scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to use case ${index + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={toggleAutoPlay}
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-full p-2 transition-all duration-200 hover:scale-110"
              aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 text-gray-700" />
              ) : (
                <Play className="h-4 w-4 text-gray-700" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="text-center text-sm text-gray-500 mb-2">
              {currentIndex + 1} of {useCases.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / useCases.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Header onContactClick={handleContactClick} />
      <Hero onContactClick={handleContactClick} />
      <div className="container mx-auto px-4 mt-4">
        <EnvVariablesNotice />
      </div>
      <Services />
      <Process onContactClick={handleContactClick} />
      <NodSection />
      <UseCaseSlideshow onContactClick={handleContactClick} />
      <Team />
      <Footer />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}

export default Home;
