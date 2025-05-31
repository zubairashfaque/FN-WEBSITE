import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

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
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { getUseCases } from "../api/usecases";
import Header from "./header";
import Footer from "./footer";
import ContactModal from "./ContactModal";

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

interface FilterOption {
  name: string;
  type: "industry" | "category";
  isSelected: boolean;
}

const UseCasesSection = () => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

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
        setFilteredUseCases(formattedUseCases);

        // Extract unique industries and categories for filters
        const allIndustries = new Set<string>();
        const allCategories = new Set<string>();

        formattedUseCases.forEach((useCase) => {
          useCase.industries?.forEach((industry) =>
            allIndustries.add(industry),
          );
          useCase.categories?.forEach((category) =>
            allCategories.add(category),
          );
        });

        const filterOptions: FilterOption[] = [
          ...Array.from(allIndustries).map((industry) => ({
            name: industry,
            type: "industry" as const,
            isSelected: false,
          })),
          ...Array.from(allCategories).map((category) => ({
            name: category,
            type: "category" as const,
            isSelected: false,
          })),
        ];

        setFilters(filterOptions);
      } catch (err) {
        console.error("Error fetching use cases:", err);
        setError("Failed to load use cases. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUseCases();
  }, []);

  // Filter use cases based on selected filters
  useEffect(() => {
    const selectedIndustries = filters
      .filter((f) => f.type === "industry" && f.isSelected)
      .map((f) => f.name);
    const selectedCategories = filters
      .filter((f) => f.type === "category" && f.isSelected)
      .map((f) => f.name);

    if (selectedIndustries.length === 0 && selectedCategories.length === 0) {
      setFilteredUseCases(useCases);
    } else {
      const filtered = useCases.filter((useCase) => {
        const matchesIndustry =
          selectedIndustries.length === 0 ||
          useCase.industries?.some((industry) =>
            selectedIndustries.includes(industry),
          );
        const matchesCategory =
          selectedCategories.length === 0 ||
          useCase.categories?.some((category) =>
            selectedCategories.includes(category),
          );
        return matchesIndustry && matchesCategory;
      });
      setFilteredUseCases(filtered);
    }
  }, [filters, useCases]);

  const toggleFilter = (filterName: string) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.name === filterName
          ? { ...filter, isSelected: !filter.isSelected }
          : filter,
      ),
    );
  };

  const clearAllFilters = () => {
    setFilters((prev) =>
      prev.map((filter) => ({ ...filter, isSelected: false })),
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onContactClick={handleContactClick} isOnBlogPage={false} />
      <section className="w-full bg-background py-16 px-4 md:px-8 lg:px-12 pt-32">
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

          {/* Loading and Error States */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading use cases...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Filters */}
          {!isLoading && !error && useCases.length > 0 && (
            <div className="mb-12">
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {filters.map((filter) => (
                  <Button
                    key={filter.name}
                    variant={filter.isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(filter.name)}
                    className={`transition-all duration-200 ${
                      filter.isSelected
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
              {filters.some((f) => f.isSelected) && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Use Cases Grid */}
          {!isLoading && !error && filteredUseCases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredUseCases.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="relative overflow-hidden">
                      <img
                        src={useCase.image}
                        alt={useCase.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {useCase.industries
                          ?.slice(0, 2)
                          .map((industry, idx) => (
                            <Badge
                              key={`industry-${idx}`}
                              variant="secondary"
                              className="bg-white/90 text-gray-700 text-xs"
                            >
                              {industry}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {useCase.categories
                          ?.slice(0, 2)
                          .map((category, idx) => (
                            <Badge
                              key={`category-${idx}`}
                              variant="outline"
                              className="text-xs"
                            >
                              {category}
                            </Badge>
                          ))}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {useCase.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {useCase.description}
                      </p>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-primary hover:text-primary/80 group"
                        asChild
                      >
                        <a href={useCase.link}>
                          <span>Learn more</span>
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Use Cases State */}
          {!isLoading && !error && filteredUseCases.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {useCases.length === 0
                    ? "No Use Cases Available"
                    : "No Matching Use Cases"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {useCases.length === 0
                    ? "We're working on adding some amazing use cases. Check back soon!"
                    : "Try adjusting your filters to see more results."}
                </p>
                {useCases.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                ) : (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* CTA Section */}
          {!isLoading && !error && useCases.length > 0 && (
            <div className="mt-20 text-center bg-gradient-to-r from-primary/10 to-blue-600/10 p-12 rounded-2xl">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Transform Your Business?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let's discuss how our expertise can help you implement similar
                solutions and drive innovation in your industry.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                onClick={handleContactClick}
              >
                Start Your Project
              </Button>
            </div>
          )}
        </div>
      </section>
      <Footer />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default UseCasesSection;
