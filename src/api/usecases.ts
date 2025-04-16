import { supabase, useLocalStorageFallback } from "../lib/supabase";

// Types for use cases
export interface UseCase {
  id: string;
  title: string;
  description: string;
  content: string;
  industry: string;
  category: string;
  industries: string[];
  categories: string[];
  imageUrl: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface UseCaseFormData {
  title: string;
  description: string;
  content: string;
  industries: string[];
  categories: string[];
  imageUrl: string;
  status: string;
}

// Local storage key for use cases
const USECASES_STORAGE_KEY = "usecases";

// Initialize local storage with empty array if not exists
const initializeLocalStorage = () => {
  if (!localStorage.getItem(USECASES_STORAGE_KEY)) {
    localStorage.setItem(USECASES_STORAGE_KEY, JSON.stringify([]));
  }
};

// Initialize on module load
initializeLocalStorage();

// Helper function to generate a slug from a title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-");
};

// CRUD operations for use cases
export const getUseCases = async (): Promise<UseCase[]> => {
  try {
    const delay = Math.random() * 500 + 200; // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (useLocalStorageFallback()) {
      // Use localStorage
      const useCases = JSON.parse(
        localStorage.getItem(USECASES_STORAGE_KEY) || "[]",
      ) as UseCase[];

      // Ensure all useCase objects have industries and categories as arrays
      const normalizedUseCases = useCases.map((useCase) => ({
        ...useCase,
        industries:
          Array.isArray(useCase.industries) && useCase.industries.length > 0
            ? useCase.industries
            : [useCase.industry].filter(Boolean),
        categories:
          Array.isArray(useCase.categories) && useCase.categories.length > 0
            ? useCase.categories
            : [useCase.category].filter(Boolean),
      }));

      console.log("Retrieved use cases from localStorage:", normalizedUseCases);
      return normalizedUseCases;
    } else {
      // Use Supabase
      const { data, error } = await supabase
        .from("usecases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to ensure industries and categories are arrays
      return (data || []).map((useCase) => {
        // Parse industries and categories if they're stored as JSON strings
        let industries = [];
        let categories = [];

        try {
          if (typeof useCase.industries === "string") {
            industries = JSON.parse(useCase.industries);
          } else if (Array.isArray(useCase.industries)) {
            industries = useCase.industries;
          }
        } catch (e) {
          console.warn("Could not parse industries for useCase:", useCase.id);
          industries = useCase.industry ? [useCase.industry] : [];
        }

        try {
          if (typeof useCase.categories === "string") {
            categories = JSON.parse(useCase.categories);
          } else if (Array.isArray(useCase.categories)) {
            categories = useCase.categories;
          }
        } catch (e) {
          console.warn("Could not parse categories for useCase:", useCase.id);
          categories = useCase.category ? [useCase.category] : [];
        }

        // Ensure we always have at least one industry and category
        if (industries.length === 0 && useCase.industry) {
          industries = [useCase.industry];
        }

        if (categories.length === 0 && useCase.category) {
          categories = [useCase.category];
        }

        return {
          id: useCase.id,
          title: useCase.title,
          description: useCase.description,
          content: useCase.content,
          industry:
            useCase.industry || (industries.length > 0 ? industries[0] : ""),
          category:
            useCase.category || (categories.length > 0 ? categories[0] : ""),
          industries,
          categories,
          imageUrl: useCase.image_url,
          status: useCase.status,
          createdAt: useCase.created_at,
          updatedAt: useCase.updated_at,
        };
      });
    }
  } catch (error) {
    console.error("Error fetching use cases:", error);
    throw new Error("Failed to fetch use cases");
  }
};

export const getUseCaseById = async (id: string): Promise<UseCase | null> => {
  try {
    const delay = Math.random() * 300 + 100; // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (useLocalStorageFallback()) {
      // Use localStorage
      const useCases = JSON.parse(
        localStorage.getItem(USECASES_STORAGE_KEY) || "[]",
      ) as UseCase[];
      const useCase = useCases.find((useCase) => useCase.id === id);

      if (!useCase) return null;

      // Ensure industries and categories are arrays
      return {
        ...useCase,
        industries:
          Array.isArray(useCase.industries) && useCase.industries.length > 0
            ? useCase.industries
            : [useCase.industry].filter(Boolean),
        categories:
          Array.isArray(useCase.categories) && useCase.categories.length > 0
            ? useCase.categories
            : [useCase.category].filter(Boolean),
      };
    } else {
      // Use Supabase
      const { data, error } = await supabase
        .from("usecases")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Parse the arrays from JSON strings
      let industries = [];
      let categories = [];

      try {
        industries = data.industries ? JSON.parse(data.industries) : [];
      } catch (e) {
        console.warn("Could not parse industries, using fallback");
        industries = data.industry ? [data.industry] : [];
      }

      try {
        categories = data.categories ? JSON.parse(data.categories) : [];
      } catch (e) {
        console.warn("Could not parse categories, using fallback");
        categories = data.category ? [data.category] : [];
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        content: data.content,
        industry: data.industry || (industries.length > 0 ? industries[0] : ""),
        category: data.category || (categories.length > 0 ? categories[0] : ""),
        industries: industries,
        categories: categories,
        imageUrl: data.image_url,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch (error) {
    console.error(`Error fetching use case with ID ${id}:`, error);
    throw new Error(`Failed to fetch use case with ID ${id}`);
  }
};

export const createUseCase = async (
  data: UseCaseFormData,
): Promise<UseCase> => {
  try {
    const delay = Math.random() * 800 + 400; // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Validate required fields
    if (!data.title.trim()) {
      throw new Error("Title is required");
    }

    if (!data.description.trim()) {
      throw new Error("Description is required");
    }

    if (!data.content.trim()) {
      throw new Error("Content is required");
    }

    if (!data.industries || data.industries.length === 0) {
      throw new Error("At least one industry is required");
    }

    if (!data.categories || data.categories.length === 0) {
      throw new Error("At least one category is required");
    }

    // Set default featured image if not provided
    const imageUrl =
      data.imageUrl ||
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80";

    const now = new Date().toISOString();

    if (useLocalStorageFallback()) {
      // Use localStorage
      const useCases = JSON.parse(
        localStorage.getItem(USECASES_STORAGE_KEY) || "[]",
      ) as UseCase[];

      // Ensure we store industries and categories as arrays
      const industriesArray = Array.isArray(data.industries)
        ? data.industries
        : [data.industries].filter(Boolean);

      const categoriesArray = Array.isArray(data.categories)
        ? data.categories
        : [data.categories].filter(Boolean);

      // Get primary industry and category (first one in each array)
      const primaryIndustry =
        industriesArray.length > 0 ? industriesArray[0] : "";
      const primaryCategory =
        categoriesArray.length > 0 ? categoriesArray[0] : "";

      console.log("Creating use case with industries:", industriesArray);
      console.log("Creating use case with categories:", categoriesArray);

      const newUseCase: UseCase = {
        id: `usecase_${Date.now()}`,
        title: data.title,
        description: data.description,
        content: data.content,
        industries: industriesArray,
        categories: categoriesArray,
        industry: primaryIndustry,
        category: primaryCategory,
        imageUrl,
        status: data.status as "draft" | "published",
        createdAt: now,
        updatedAt: now,
      };

      useCases.push(newUseCase);
      localStorage.setItem(USECASES_STORAGE_KEY, JSON.stringify(useCases));

      console.log("Created new use case:", newUseCase);
      return newUseCase;
    } else {
      // Use Supabase
      // For Supabase, we need to store arrays as JSON strings
      const industriesArray = Array.isArray(data.industries)
        ? data.industries
        : [data.industries].filter(Boolean);

      const categoriesArray = Array.isArray(data.categories)
        ? data.categories
        : [data.categories].filter(Boolean);

      // Convert arrays to JSON strings for Supabase
      const industriesJson = JSON.stringify(industriesArray);
      const categoriesJson = JSON.stringify(categoriesArray);

      // Get primary industry and category
      const primaryIndustry =
        industriesArray.length > 0 ? industriesArray[0] : "";
      const primaryCategory =
        categoriesArray.length > 0 ? categoriesArray[0] : "";

      const { data: useCaseData, error } = await supabase
        .from("usecases")
        .insert({
          title: data.title,
          description: data.description,
          content: data.content,
          industry: primaryIndustry,
          category: primaryCategory,
          industries: industriesJson, // Store as JSON string
          categories: categoriesJson, // Store as JSON string
          image_url: imageUrl,
          status: data.status,
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to create use case: ${error.message}`);
      }

      // Parse the JSON strings back to arrays
      let parsedIndustries = [];
      let parsedCategories = [];

      try {
        parsedIndustries = useCaseData.industries
          ? JSON.parse(useCaseData.industries)
          : [useCaseData.industry].filter(Boolean);
      } catch (e) {
        console.warn("Could not parse industries, using fallback");
        parsedIndustries = [useCaseData.industry].filter(Boolean);
      }

      try {
        parsedCategories = useCaseData.categories
          ? JSON.parse(useCaseData.categories)
          : [useCaseData.category].filter(Boolean);
      } catch (e) {
        console.warn("Could not parse categories, using fallback");
        parsedCategories = [useCaseData.category].filter(Boolean);
      }

      return {
        id: useCaseData.id,
        title: useCaseData.title,
        description: useCaseData.description,
        content: useCaseData.content,
        industry: useCaseData.industry,
        category: useCaseData.category,
        industries: parsedIndustries,
        categories: parsedCategories,
        imageUrl: useCaseData.image_url,
        status: useCaseData.status,
        createdAt: useCaseData.created_at,
        updatedAt: useCaseData.updated_at,
      };
    }
  } catch (error) {
    console.error("Error creating use case:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create use case",
    );
  }
};

export const updateUseCase = async (
  id: string,
  data: Partial<UseCaseFormData>,
): Promise<UseCase> => {
  try {
    const delay = Math.random() * 800 + 400; // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    const now = new Date().toISOString();

    if (useLocalStorageFallback()) {
      // Use localStorage
      const useCases = JSON.parse(
        localStorage.getItem(USECASES_STORAGE_KEY) || "[]",
      ) as UseCase[];
      const useCaseIndex = useCases.findIndex((useCase) => useCase.id === id);

      if (useCaseIndex === -1) {
        throw new Error(`Use case with ID ${id} not found`);
      }

      const useCase = useCases[useCaseIndex];

      // Ensure we handle industries and categories as arrays
      let industriesArray = useCase.industries;
      if (data.industries !== undefined) {
        industriesArray = Array.isArray(data.industries)
          ? data.industries
          : [data.industries].filter(Boolean);
      }

      let categoriesArray = useCase.categories;
      if (data.categories !== undefined) {
        categoriesArray = Array.isArray(data.categories)
          ? data.categories
          : [data.categories].filter(Boolean);
      }

      // Get primary values from arrays
      const primaryIndustry =
        industriesArray.length > 0 ? industriesArray[0] : "";
      const primaryCategory =
        categoriesArray.length > 0 ? categoriesArray[0] : "";

      const updatedUseCase: UseCase = {
        ...useCase,
        title: data.title !== undefined ? data.title : useCase.title,
        description:
          data.description !== undefined
            ? data.description
            : useCase.description,
        content: data.content !== undefined ? data.content : useCase.content,
        industries: industriesArray,
        categories: categoriesArray,
        industry: primaryIndustry,
        category: primaryCategory,
        imageUrl:
          data.imageUrl !== undefined ? data.imageUrl : useCase.imageUrl,
        status:
          data.status !== undefined
            ? (data.status as "draft" | "published")
            : useCase.status,
        updatedAt: now,
      };

      useCases[useCaseIndex] = updatedUseCase;
      localStorage.setItem(USECASES_STORAGE_KEY, JSON.stringify(useCases));

      return updatedUseCase;
    } else {
      // Use Supabase
      const updateData: any = { updated_at: now };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.content !== undefined) updateData.content = data.content;

      // Properly handle arrays in Supabase
      if (data.industries !== undefined) {
        // Ensure we have an array
        const industriesArray = Array.isArray(data.industries)
          ? data.industries
          : [data.industries].filter(Boolean);

        // Convert to JSON string for storage
        updateData.industries = JSON.stringify(industriesArray);

        // Also update the primary industry field
        updateData.industry =
          industriesArray.length > 0 ? industriesArray[0] : "";
      }

      if (data.categories !== undefined) {
        // Ensure we have an array
        const categoriesArray = Array.isArray(data.categories)
          ? data.categories
          : [data.categories].filter(Boolean);

        // Convert to JSON string for storage
        updateData.categories = JSON.stringify(categoriesArray);

        // Also update the primary category field
        updateData.category =
          categoriesArray.length > 0 ? categoriesArray[0] : "";
      }

      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
      if (data.status !== undefined) updateData.status = data.status;

      const { data: useCaseData, error } = await supabase
        .from("usecases")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw new Error(`Failed to update use case: ${error.message}`);
      }

      // Parse the JSON strings back to arrays
      let parsedIndustries = [];
      let parsedCategories = [];

      try {
        parsedIndustries = useCaseData.industries
          ? JSON.parse(useCaseData.industries)
          : [useCaseData.industry].filter(Boolean);
      } catch (e) {
        console.warn("Could not parse industries, using fallback");
        parsedIndustries = [useCaseData.industry].filter(Boolean);
      }

      try {
        parsedCategories = useCaseData.categories
          ? JSON.parse(useCaseData.categories)
          : [useCaseData.category].filter(Boolean);
      } catch (e) {
        console.warn("Could not parse categories, using fallback");
        parsedCategories = [useCaseData.category].filter(Boolean);
      }

      return {
        id: useCaseData.id,
        title: useCaseData.title,
        description: useCaseData.description,
        content: useCaseData.content,
        industry: useCaseData.industry,
        category: useCaseData.category,
        industries: parsedIndustries,
        categories: parsedCategories,
        imageUrl: useCaseData.image_url,
        status: useCaseData.status,
        createdAt: useCaseData.created_at,
        updatedAt: useCaseData.updated_at,
      };
    }
  } catch (error) {
    console.error(`Error updating use case with ID ${id}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to update use case with ID ${id}`,
    );
  }
};

export const deleteUseCase = async (id: string): Promise<void> => {
  try {
    const delay = Math.random() * 500 + 200; // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (useLocalStorageFallback()) {
      // Use localStorage
      const useCases = JSON.parse(
        localStorage.getItem(USECASES_STORAGE_KEY) || "[]",
      ) as UseCase[];
      const updatedUseCases = useCases.filter((useCase) => useCase.id !== id);

      if (useCases.length === updatedUseCases.length) {
        throw new Error(`Use case with ID ${id} not found`);
      }

      localStorage.setItem(
        USECASES_STORAGE_KEY,
        JSON.stringify(updatedUseCases),
      );
    } else {
      // Use Supabase
      const { error } = await supabase.from("usecases").delete().eq("id", id);

      if (error) {
        throw new Error(`Failed to delete use case: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error deleting use case with ID ${id}:`, error);
    throw new Error(`Failed to delete use case with ID ${id}`);
  }
};
