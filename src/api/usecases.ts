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

// Enhanced logging function to help debug type issues
function debugValue(label: string, value: any) {
  console.log(`DEBUG ${label}:`, {
    value,
    type: typeof value,
    isArray: Array.isArray(value),
    constructor: value?.constructor?.name,
    toString: String(value),
    ...(typeof value === "object" && value !== null
      ? { keys: Object.keys(value) }
      : {}),
  });
}

// This function makes the ensureArray function even more robust
// by adding additional type checks and error handling
export function safeEnsureArray(
  value: any,
  fieldName: string = "unknown",
): string[] {
  try {
    // Log the input for debugging
    debugValue(`safeEnsureArray input (${fieldName})`, value);

    // Handle null/undefined cases
    if (value === null || value === undefined) {
      console.log(
        `safeEnsureArray: ${fieldName} is null or undefined, returning empty array`,
      );
      return [];
    }

    // Already an array - validate each element is a string
    if (Array.isArray(value)) {
      const result = value.map((item) => String(item));
      console.log(
        `safeEnsureArray: ${fieldName} was already an array with ${result.length} items`,
      );
      return result;
    }

    // Handle string values that might be JSON
    if (typeof value === "string") {
      // Check if it looks like a JSON array
      if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const result = parsed.map((item) => String(item));
            console.log(
              `safeEnsureArray: Successfully parsed ${fieldName} string as JSON array with ${result.length} items`,
            );
            return result;
          } else {
            console.log(
              `safeEnsureArray: Parsed ${fieldName} as JSON but result is not an array, wrapping single value`,
            );
            return [String(value)];
          }
        } catch (e) {
          // If it fails to parse as JSON, just treat as string
          console.log(
            `safeEnsureArray: Failed to parse ${fieldName} as JSON despite brackets, treating as string`,
          );
          return [value];
        }
      } else {
        // Just a regular string
        console.log(
          `safeEnsureArray: ${fieldName} is a regular string, wrapping as array item`,
        );
        return [value];
      }
    }

    // Handle objects - could be a serialized structure
    if (typeof value === "object") {
      console.log(
        `safeEnsureArray: ${fieldName} is an object, converting to string and wrapping`,
      );
      return [String(value)];
    }

    // For any other type (number, boolean, etc.)
    console.log(
      `safeEnsureArray: ${fieldName} is type ${typeof value}, converting to string and wrapping`,
    );
    return [String(value)];
  } catch (error) {
    console.error(`safeEnsureArray ERROR for ${fieldName}:`, error);
    // Always return a valid array even on error
    return [];
  }
}

// Enhanced version of ensureArray with better type checking
export function ensureArray(value: any): string[] {
  return safeEnsureArray(value);
}

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
          ensureArray(useCase.industries).length > 0
            ? ensureArray(useCase.industries)
            : [useCase.industry].filter(Boolean),
        categories:
          ensureArray(useCase.categories).length > 0
            ? ensureArray(useCase.categories)
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
          industries = ensureArray(useCase.industries);
        } catch (e) {
          console.warn("Could not parse industries for useCase:", useCase.id);
          industries = useCase.industry ? [useCase.industry] : [];
        }

        try {
          categories = ensureArray(useCase.categories);
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
    console.log("Fetching use case with ID:", id);

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
      const industriesArray = safeEnsureArray(
        useCase.industries,
        "localstorage_get_industries",
      );
      const finalIndustries =
        industriesArray.length > 0
          ? industriesArray
          : [useCase.industry].filter(Boolean);

      const categoriesArray = safeEnsureArray(
        useCase.categories,
        "localstorage_get_categories",
      );
      const finalCategories =
        categoriesArray.length > 0
          ? categoriesArray
          : [useCase.category].filter(Boolean);

      const result = {
        ...useCase,
        industries: finalIndustries,
        categories: finalCategories,
      };

      console.log("Found use case in localStorage:", result);
      return result;
    } else {
      // Use Supabase
      const { data, error } = await supabase
        .from("usecases")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      console.log("Retrieved use case from Supabase:", data);

      // Process the returned data using our safer array handling
      let industriesArray, categoriesArray;

      try {
        industriesArray = safeEnsureArray(
          data.industries,
          "supabase_get_industries",
        );
      } catch (e) {
        console.warn("Could not parse industries from DB, using fallback", e);
        industriesArray = data.industry ? [data.industry] : [];
      }

      try {
        categoriesArray = safeEnsureArray(
          data.categories,
          "supabase_get_categories",
        );
      } catch (e) {
        console.warn("Could not parse categories from DB, using fallback", e);
        categoriesArray = data.category ? [data.category] : [];
      }

      const result = {
        id: data.id,
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        industry:
          data.industry ||
          (industriesArray.length > 0 ? industriesArray[0] : ""),
        category:
          data.category ||
          (categoriesArray.length > 0 ? categoriesArray[0] : ""),
        industries: industriesArray,
        categories: categoriesArray,
        imageUrl: data.image_url || "",
        status: data.status || "draft",
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };

      console.log("Returning processed use case:", result);
      return result;
    }
  } catch (error) {
    console.error(`Error fetching use case with ID ${id}:`, error);
    throw new Error(`Failed to fetch use case with ID ${id}`);
  }
};

// Modified createUseCase function in src/api/usecases.ts
export const createUseCase = async (
  data: UseCaseFormData,
): Promise<UseCase> => {
  try {
    console.log("Creating new use case with data:", data);

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

    // Use our safer array validation
    const industriesArray = safeEnsureArray(
      data.industries,
      "create_industries",
    );
    if (industriesArray.length === 0) {
      throw new Error("At least one industry is required");
    }

    const categoriesArray = safeEnsureArray(
      data.categories,
      "create_categories",
    );
    if (categoriesArray.length === 0) {
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
      // Use Supabase with explicit column types

      // Get primary industry and category
      const primaryIndustry =
        industriesArray.length > 0 ? industriesArray[0] : "";
      const primaryCategory =
        categoriesArray.length > 0 ? categoriesArray[0] : "";

      console.log("Creating use case with primary industry:", primaryIndustry);
      console.log("Creating use case with primary category:", primaryCategory);

      // Create a clean database object with proper types for Supabase
      const dbData = {
        title: String(data.title),
        description: String(data.description),
        content: String(data.content),
        industry: String(primaryIndustry),
        category: String(primaryCategory),
        // Store as JSONB arrays for PostgreSQL compatibility
        industries: industriesArray,
        categories: categoriesArray,
        image_url: String(imageUrl),
        status: String(data.status),
        created_at: now,
        updated_at: now,
      };

      console.log("Final DB data:", dbData);

      try {
        // Skip RPC approach and use direct insert
        console.log("Using direct insert for use case");

        const { data: useCaseData, error } = await supabase
          .from("usecases")
          .insert(dbData)
          .select("*")
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(`Failed to create use case: ${error.message}`);
        }

        console.log("Use case created in DB:", useCaseData);

        // Process the returned data using our safer array handling
        let returnIndustriesArray, returnCategoriesArray;

        try {
          returnIndustriesArray = safeEnsureArray(
            useCaseData.industries,
            "returned_create_industries",
          );
        } catch (e) {
          console.warn(
            "Could not parse returned industries, using fallback",
            e,
          );
          returnIndustriesArray = [useCaseData.industry].filter(Boolean);
        }

        try {
          returnCategoriesArray = safeEnsureArray(
            useCaseData.categories,
            "returned_create_categories",
          );
        } catch (e) {
          console.warn(
            "Could not parse returned categories, using fallback",
            e,
          );
          returnCategoriesArray = [useCaseData.category].filter(Boolean);
        }

        const result = {
          id: useCaseData.id,
          title: useCaseData.title,
          description: useCaseData.description,
          content: useCaseData.content,
          industry: useCaseData.industry || "",
          category: useCaseData.category || "",
          industries: returnIndustriesArray,
          categories: returnCategoriesArray,
          imageUrl: useCaseData.image_url,
          status: useCaseData.status,
          createdAt: useCaseData.created_at,
          updatedAt: useCaseData.updated_at,
        };

        console.log("Returning processed new use case:", result);
        return result;
      } catch (innerError) {
        console.error("Error in Supabase operation:", innerError);
        throw innerError;
      }
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
    console.log("Updating use case with ID:", id);
    console.log("Update data:", data);

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

      // Use our safer array handling
      let industriesArray = safeEnsureArray(
        useCase.industries || [],
        "existing_industries",
      );
      if (data.industries !== undefined) {
        industriesArray = safeEnsureArray(data.industries, "new_industries");
      }

      let categoriesArray = safeEnsureArray(
        useCase.categories || [],
        "existing_categories",
      );
      if (data.categories !== undefined) {
        categoriesArray = safeEnsureArray(data.categories, "new_categories");
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

      console.log("Updated use case in localStorage:", updatedUseCase);
      return updatedUseCase;
    } else {
      // Use Supabase
      const updateData: any = { updated_at: now };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.content !== undefined) updateData.content = data.content;

      // Handle arrays in Supabase
      if (data.industries !== undefined) {
        // Use our safer array handling
        const industriesArray = safeEnsureArray(
          data.industries,
          "industries_to_update",
        );

        // Debug logging
        console.log("Updating industries:", industriesArray);
        console.log(
          "Industries type:",
          typeof industriesArray,
          Array.isArray(industriesArray),
        );

        // CRITICAL: Make sure we're storing a valid JSON string
        try {
          updateData.industries = industriesArray;
          console.log("Stringified industries:", updateData.industries);
        } catch (e) {
          console.error("Failed to stringify industries:", e);
          // Fallback to empty array
          updateData.industries = "[]";
        }

        // Also update the primary industry field
        updateData.industry =
          industriesArray.length > 0 ? industriesArray[0] : "";
      }

      if (data.categories !== undefined) {
        // Use our safer array handling
        const categoriesArray = safeEnsureArray(
          data.categories,
          "categories_to_update",
        );

        // Debug logging
        console.log("Updating categories:", categoriesArray);
        console.log(
          "Categories type:",
          typeof categoriesArray,
          Array.isArray(categoriesArray),
        );

        // CRITICAL: Make sure we're storing a valid JSON string
        try {
          updateData.categories = categoriesArray;
          console.log("Stringified categories:", updateData.categories);
        } catch (e) {
          console.error("Failed to stringify categories:", e);
          // Fallback to empty array
          updateData.categories = "[]";
        }

        // Also update the primary category field
        updateData.category =
          categoriesArray.length > 0 ? categoriesArray[0] : "";
      }

      if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
      if (data.status !== undefined) updateData.status = data.status;

      console.log("Update data being sent to Supabase:", updateData);

      const { data: useCaseData, error } = await supabase
        .from("usecases")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(`Failed to update use case: ${error.message}`);
      }

      console.log("Updated use case data from Supabase:", useCaseData);

      // Process the returned data using our safer array handling
      let industriesArray = [];
      let categoriesArray = [];

      try {
        industriesArray = safeEnsureArray(
          useCaseData.industries,
          "returned_industries",
        );
      } catch (e) {
        console.warn("Could not parse industries, using fallback", e);
        industriesArray = useCaseData.industry ? [useCaseData.industry] : [];
      }

      try {
        categoriesArray = safeEnsureArray(
          useCaseData.categories,
          "returned_categories",
        );
      } catch (e) {
        console.warn("Could not parse categories, using fallback", e);
        categoriesArray = useCaseData.category ? [useCaseData.category] : [];
      }

      // Build the final response object
      const result = {
        id: useCaseData.id,
        title: useCaseData.title || "",
        description: useCaseData.description || "",
        content: useCaseData.content || "",
        industry: useCaseData.industry || "",
        category: useCaseData.category || "",
        industries: industriesArray,
        categories: categoriesArray,
        imageUrl: useCaseData.image_url || "",
        status: useCaseData.status || "draft",
        createdAt: useCaseData.created_at || now,
        updatedAt: useCaseData.updated_at || now,
      };

      console.log("Returning processed use case:", result);
      return result;
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
