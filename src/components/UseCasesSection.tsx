import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowRight, X } from "lucide-react";

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
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  const [defaultUseCases, setDefaultUseCases] = useState<UseCase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownItems, setDropdownItems] = useState<string[]>([]);

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

        setDefaultUseCases(formattedUseCases);
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

  // All unique industries and solution types for filtering
  const industries = Array.from(
    new Set(
      defaultUseCases.flatMap(
        (useCase) => useCase.industries || [useCase.industry],
      ),
    ),
  );
  const solutionTypes = Array.from(
    new Set(
      defaultUseCases.flatMap(
        (useCase) => useCase.categories || [useCase.solutionType],
      ),
    ),
  );

  // Filter use cases based on selected filters
  const filterUseCases = () => {
    let filtered = defaultUseCases;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (useCase) =>
          useCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          useCase.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (useCase.industries || [useCase.industry]).some((industry) =>
            industry.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          (useCase.categories || [useCase.solutionType]).some((category) =>
            category.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    // Filter by selected filters
    if (selectedFilters.length > 0) {
      const selectedIndustries = selectedFilters
        .filter((filter) => filter.type === "industry" && filter.isSelected)
        .map((filter) => filter.name);

      const selectedCategories = selectedFilters
        .filter((filter) => filter.type === "category" && filter.isSelected)
        .map((filter) => filter.name);

      if (selectedIndustries.length > 0) {
        filtered = filtered.filter((useCase) =>
          (useCase.industries || [useCase.industry]).some((industry) =>
            selectedIndustries.includes(industry),
          ),
        );
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter((useCase) =>
          (useCase.categories || [useCase.solutionType]).some((category) =>
            selectedCategories.includes(category),
          ),
        );
      }
    } else if (activeTab !== "all") {
      // If no filters are selected, use the active tab
      if (industries.includes(activeTab)) {
        filtered = filtered.filter((useCase) =>
          (useCase.industries || [useCase.industry]).includes(activeTab),
        );
      } else if (solutionTypes.includes(activeTab)) {
        filtered = filtered.filter((useCase) =>
          (useCase.categories || [useCase.solutionType]).includes(activeTab),
        );
      }
    }

    setUseCases(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Apply search when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      filterUseCases();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilters, activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear selected filters when changing tabs
    setSelectedFilters([]);
  };

  // Toggle filter selection
  const toggleFilter = (name: string, type: "industry" | "category") => {
    setSelectedFilters((prev) => {
      const exists = prev.find((f) => f.name === name && f.type === type);

      if (exists) {
        // Remove filter if it exists
        return prev.filter((f) => !(f.name === name && f.type === type));
      } else {
        // Add new filter
        return [...prev, { name, type, isSelected: true }];
      }
    });
  };

  // Handle mouse enter on category/industry button
  const handleMouseEnter = (
    name: string,
    type: "industry" | "category",
    event: React.MouseEvent,
  ) => {
    setHoveredCategory(name);

    // Get related items based on the hovered category
    let relatedItems: string[] = [];

    if (type === "industry") {
      // For industries, show related categories
      relatedItems = Array.from(
        new Set(
          defaultUseCases
            .filter((useCase) =>
              (useCase.industries || [useCase.industry]).includes(name),
            )
            .flatMap((useCase) => useCase.categories || [useCase.solutionType]),
        ),
      );
    } else {
      // For categories, show related industries
      relatedItems = Array.from(
        new Set(
          defaultUseCases
            .filter((useCase) =>
              (useCase.categories || [useCase.solutionType]).includes(name),
            )
            .flatMap((useCase) => useCase.industries || [useCase.industry]),
        ),
      );
    }

    // Only show dropdown if there are related items
    if (relatedItems.length > 0) {
      // Get button position for dropdown placement
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      setDropdownPosition({
        top: buttonRect.bottom + scrollTop,
        left: buttonRect.left,
      });

      setDropdownItems(relatedItems);
      setShowCategoryDropdown(true);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredCategory(null);
    // Add a small delay before hiding dropdown to allow moving mouse to it
    setTimeout(() => {
      setShowCategoryDropdown(false);
    }, 300);
  };

  // Remove a selected filter
  const removeFilter = (name: string, type: "industry" | "category") => {
    setSelectedFilters((prev) =>
      prev.filter((f) => !(f.name === name && f.type === type)),
    );
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onContactClick={handleContactClick} isOnBlogPage={false} />
      <section className="w-full bg-background py-16 px-4 md:px-8 lg:px-12 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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

          {/* Search and Filter */}
          <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search use cases..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 z-50 max-h-[300px] overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Industries
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {industries
                        .filter((industry) =>
                          industry
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .slice(0, 5)
                        .map((industry) => (
                          <Badge
                            key={industry}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => toggleFilter(industry, "industry")}
                          >
                            {industry}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">
                      Categories
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {solutionTypes
                        .filter((category) =>
                          category
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        )
                        .slice(0, 5)
                        .map((category) => (
                          <Badge
                            key={category}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/20"
                            onClick={() => toggleFilter(category, "category")}
                          >
                            {category}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
          </div>

          {/* Selected filters */}
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedFilters.map((filter) => (
                <Badge
                  key={`${filter.type}-${filter.name}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {filter.name}
                  <button
                    onClick={() => removeFilter(filter.name, filter.type)}
                    className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedFilters([])}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Main filter tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleTabChange("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "all" ? "bg-primary text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
              >
                All
              </button>

              {/* Industry buttons - first row */}
              {[
                "Technology",
                "Finance",
                "Retail",
                "Manufacturing",
                "Healthcare",
              ].map((industry) => (
                <button
                  key={industry}
                  onClick={() => toggleFilter(industry, "industry")}
                  onMouseEnter={(e) =>
                    handleMouseEnter(industry, "industry", e)
                  }
                  onMouseLeave={handleMouseLeave}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${selectedFilters.some((f) => f.name === industry && f.type === "industry") ? "bg-primary text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                >
                  {industry}
                </button>
              ))}
            </div>

            {/* Category buttons - second row */}
            <div className="flex flex-wrap gap-2">
              {[
                "AI",
                "Automation",
                "Communication",
                "Productivity",
                "Finance",
                "Data Analytics",
                "Marketing",
                "AI Solutions",
                "Process Optimization",
                "Customer Service",
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => toggleFilter(category, "category")}
                  onMouseEnter={(e) =>
                    handleMouseEnter(category, "category", e)
                  }
                  onMouseLeave={handleMouseLeave}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${selectedFilters.some((f) => f.name === category && f.type === "category") ? "bg-secondary text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Category dropdown on hover */}
          {showCategoryDropdown && dropdownItems.length > 0 && (
            <div
              className="absolute bg-white shadow-lg rounded-md p-2 z-50 min-w-[200px] border border-gray-200"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              onMouseEnter={() => setShowCategoryDropdown(true)}
              onMouseLeave={() => setShowCategoryDropdown(false)}
            >
              <div className="text-sm font-medium mb-2 text-gray-500 px-2">
                {hoveredCategory && `Related to ${hoveredCategory}`}
              </div>
              <div className="flex flex-col gap-1">
                {dropdownItems.map((item) => (
                  <button
                    key={item}
                    className="text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      // Determine if this is an industry or category
                      const type = industries.includes(item)
                        ? "industry"
                        : "category";
                      toggleFilter(item, type);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Use cases grid */}
          <div className="mt-8">
            {useCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((useCase, index) => (
                  <motion.div
                    key={useCase.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                      <div className="h-48 overflow-hidden">
                        <img
                          src={useCase.image}
                          alt={useCase.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(useCase.industries || [useCase.industry]).map(
                            (industry, idx) => (
                              <Badge
                                key={`${useCase.id}-industry-${idx}`}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                {industry}
                              </Badge>
                            ),
                          )}
                          {(useCase.categories || [useCase.solutionType]).map(
                            (category, idx) => (
                              <Badge
                                key={`${useCase.id}-category-${idx}`}
                                variant="outline"
                                className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20"
                              >
                                {category}
                              </Badge>
                            ),
                          )}
                        </div>
                        <CardTitle className="text-xl">
                          {useCase.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {useCase.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        {/* Additional content can go here */}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="w-full justify-between group"
                          asChild
                        >
                          <a href={useCase.link}>
                            <span>View Case Study</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No use cases found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("all");
                    setSelectedFilters([]);
                    setUseCases(defaultUseCases);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-blue-600/10 p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">
              Have a similar project in mind?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss how our expertise can help transform your business
              with innovative technology solutions.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleContactClick}
            >
              Let's Talk
            </Button>
          </div>
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
