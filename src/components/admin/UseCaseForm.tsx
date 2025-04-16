import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import EnvVariablesNotice from "../EnvVariablesNotice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Eye, Save, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  createUseCase,
  getUseCaseById,
  updateUseCase,
} from "../../api/usecases";
import ContentInput from "./usecase/ContentInput";
import ImageUpload from "./usecase/ImageUpload";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const UseCaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    industries: [] as string[],
    categories: [] as string[],
    imageUrl: "",
    status: "draft",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [contentInputMethod, setContentInputMethod] = useState<
    "editor" | "upload"
  >("editor");
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [isEditingUploadedContent, setIsEditingUploadedContent] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch use case data if in edit mode
  useEffect(() => {
    const fetchUseCase = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const useCase = await getUseCaseById(id);

        if (!useCase) {
          setError(`Use case with ID ${id} not found`);
          return;
        }

        setFormData({
          title: useCase.title,
          description: useCase.description,
          content: useCase.content,
          industries: useCase.industries || [],
          categories: useCase.categories || [],
          imageUrl: useCase.imageUrl,
          status: useCase.status,
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : `Failed to fetch use case with ID ${id}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUseCase();
  }, [id]);

  // Update search params when search value changes
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  // Mock industries and categories for the form
  const industries = [
    { id: "1", name: "Healthcare" },
    { id: "2", name: "Finance" },
    { id: "3", name: "Technology" },
    { id: "4", name: "Retail" },
    { id: "5", name: "Manufacturing" },
  ];

  const categories = [
    { id: "1", name: "AI Solutions" },
    { id: "2", name: "Automation" },
    { id: "3", name: "Data Analytics" },
    { id: "4", name: "Customer Service" },
    { id: "5", name: "Process Optimization" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    // Create a preview URL for the image
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleMarkdownFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMarkdownFile(file);

    // Read the markdown file content
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Normalize line endings to ensure consistent handling across platforms
      // Convert all types of line endings (CRLF, CR) to LF
      const normalizedContent = result
        .replace(/\r\n/g, "\n") // CRLF → LF
        .replace(/\r/g, "\n"); // CR → LF
      setFormData((prev) => ({ ...prev, content: normalizedContent }));
      // Reset editing state when a new file is uploaded
      setIsEditingUploadedContent(false);
    };
    reader.readAsText(file);
  };

  const handleContentInputMethodChange = (value: "editor" | "upload") => {
    setContentInputMethod(value);
    // Reset editing state when switching input methods
    setIsEditingUploadedContent(false);
  };

  const handleContentChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, content: value || "" }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set("search", value);
    } else {
      newSearchParams.delete("search");
    }
    setSearchParams(newSearchParams);
  };

  const handleIndustryChange = (value: string[]) => {
    setFormData((prev) => ({ ...prev, industries: value }));
  };

  const handleCategoryChange = (value: string[]) => {
    setFormData((prev) => ({ ...prev, categories: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation
      if (!formData.title.trim()) throw new Error("Title is required");
      if (!formData.description.trim())
        throw new Error("Description is required");
      if (!formData.content.trim()) throw new Error("Content is required");
      if (!formData.industries || formData.industries.length === 0)
        throw new Error("Please select at least one industry");
      if (!formData.categories || formData.categories.length === 0)
        throw new Error("Please select at least one category");

      // Prepare the content based on the input method
      let finalContent = formData.content;

      // If using uploaded content and not in editing mode, use the original uploaded content
      if (
        contentInputMethod === "upload" &&
        markdownFile &&
        !isEditingUploadedContent
      ) {
        // Re-read the file to ensure we have the latest content
        const reader = new FileReader();
        const fileContent = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsText(markdownFile);
        });
        // Normalize line endings to ensure consistent handling across platforms
        // Convert all types of line endings (CRLF, CR) to LF
        finalContent = fileContent
          .replace(/\r\n/g, "\n") // CRLF → LF
          .replace(/\r/g, "\n"); // CR → LF
      }

      // Process image if it's a base64 string that's too large
      let finalImageUrl = formData.imageUrl;
      if (
        finalImageUrl.startsWith("data:image") &&
        finalImageUrl.length > 1000000
      ) {
        // Compress the image
        try {
          console.log("Compressing large image...");
          const img = new Image();
          img.src = finalImageUrl;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Resize to smaller dimensions
          const maxWidth = 800;
          const maxHeight = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Get compressed image
          finalImageUrl = canvas.toDataURL("image/jpeg", 0.6);
          console.log("Image compressed successfully");
        } catch (compressionError) {
          console.error("Error compressing image:", compressionError);
          // Continue with the original image if compression fails
        }
      }

      // Create the final form data with the prepared content and image
      const finalFormData = {
        ...formData,
        content: finalContent,
        imageUrl: finalImageUrl,
      };

      if (isEditMode && id) {
        // Update existing use case
        await updateUseCase(id, finalFormData);
        setSuccess("Use case updated successfully!");
      } else {
        // Create new use case
        await createUseCase(finalFormData);
        setSuccess("Use case created successfully!");
      }

      // Don't navigate away immediately so user can see success message
      setTimeout(() => {
        navigate("/admin/usecases");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update use case"
            : "Failed to create use case",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-64">
        <p className="text-gray-500">Loading use case data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <EnvVariablesNotice />
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Use Case" : "Create New Use Case"}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search use cases..."
            className="pl-10"
            value={searchValue}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter use case title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a brief description (1-2 sentences)"
            rows={2}
          />
        </div>

        <ContentInput
          contentInputMethod={contentInputMethod}
          onContentInputMethodChange={handleContentInputMethodChange}
          content={formData.content}
          onContentChange={handleContentChange}
          markdownFile={markdownFile}
          onMarkdownFileChange={handleMarkdownFileChange}
          isEditingUploadedContent={isEditingUploadedContent}
          setIsEditingUploadedContent={setIsEditingUploadedContent}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="industries">Industries (Select multiple)</Label>
            <div className="border rounded-md p-3 space-y-2">
              {industries.map((industry) => (
                <div key={industry.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`industry-${industry.id}`}
                    checked={formData.industries.includes(industry.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleIndustryChange([
                          ...formData.industries,
                          industry.name,
                        ]);
                      } else {
                        handleIndustryChange(
                          formData.industries.filter(
                            (i) => i !== industry.name,
                          ),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`industry-${industry.id}`}
                    className="text-sm"
                  >
                    {industry.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.industries.length > 0 && (
              <div className="text-sm text-gray-500">
                Selected: {formData.industries.join(", ")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories (Select multiple)</Label>
            <div className="border rounded-md p-3 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={formData.categories.includes(category.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleCategoryChange([
                          ...formData.categories,
                          category.name,
                        ]);
                      } else {
                        handleCategoryChange(
                          formData.categories.filter(
                            (c) => c !== category.name,
                          ),
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.categories.length > 0 && (
              <div className="text-sm text-gray-500">
                Selected: {formData.categories.join(", ")}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ImageUpload
          imageUrl={formData.imageUrl}
          imagePreview={imagePreview}
          onInputChange={handleInputChange}
          onFileChange={handleImageFileChange}
        />

        {showPreview && (
          <div className="mb-6 border rounded-md p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Markdown Preview</h3>
              {contentInputMethod === "upload" && markdownFile && (
                <div className="text-sm text-gray-500">
                  Previewing {isEditingUploadedContent ? "edited" : "uploaded"}{" "}
                  content from: {markdownFile.name}
                </div>
              )}
            </div>
            <div className="prose max-w-none overflow-auto p-4 border rounded-md bg-gray-50">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formData.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />{" "}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>

          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/usecases")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Update Use Case" : "Save Use Case"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UseCaseForm;
