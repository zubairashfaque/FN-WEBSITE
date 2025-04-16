import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react";
import { getUseCaseById } from "../api/usecases";
import Header from "./header";
import Footer from "./footer";
import ContactModal from "./ContactModal";
// Import React Markdown with only essential plugins
import ReactMarkdown from "react-markdown";
// Import markdown styles
import "../styles/markdown.css";

interface UseCase {
  id: string;
  title: string;
  description: string;
  content: string;
  industry: string;
  category: string;
  industries?: string[];
  categories?: string[];
  imageUrl: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

const UseCaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchUseCase = async () => {
      if (!id) {
        setError("Use case ID not found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getUseCaseById(id);
        if (data) {
          setUseCase(data);
        } else {
          setError("Use case not found");
        }
      } catch (err) {
        console.error("Error fetching use case:", err);
        setError("Failed to load use case. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUseCase();
  }, [id]);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Helper function to determine if content is mostly HTML
  const isHtmlContent = (content: string): boolean => {
    if (!content) return false;
    // Simple check for HTML content
    return content.includes("</") && content.includes(">");
  };

  // Function to manually format markdown content as HTML
  const formatMarkdown = (markdownText: string): string => {
    // This is a very basic formatter for demonstration
    // Handle headings
    let html = markdownText
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
      .replace(/^##### (.*$)/gim, "<h5>$1</h5>")
      .replace(/^###### (.*$)/gim, "<h6>$1</h6>");

    // Handle bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/~~(.*?)~~/gim, "<del>$1</del>");

    // Handle links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

    // Handle code blocks
    html = html.replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>");

    // Handle inline code
    html = html.replace(/`(.*?)`/gim, "<code>$1</code>");

    // Handle lists
    html = html
      .replace(/^\s*\d+\.\s+(.*$)/gim, "<li>$1</li>")
      .replace(/<\/li>\s*<li>/gim, "</li><li>");
    html = html
      .replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>")
      .replace(/<\/li>\s*<li>/gim, "</li><li>");

    // Handle paragraphs
    html = html.replace(/^([^<].*)/gim, "<p>$1</p>");
    html = html.replace(/<\/p>\s*<p>/gim, "</p><p>");

    // Clean up any extra paragraph tags around elements that don't need them
    html = html.replace(/<p><(h|ul|ol|li|blockquote)/gim, "<$1");
    html = html.replace(/<\/(h|ul|ol|li|blockquote)><\/p>/gim, "</$1>");

    return html;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onContactClick={handleContactClick} />

      <main className="container mx-auto px-4 py-32">
        <Button
          variant="ghost"
          className="mb-8 flex items-center gap-2"
          onClick={() => navigate("/usecases")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Use Cases
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error || !useCase ? (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">
              {error || "Use case not found"}
            </h1>
            <p className="mb-8 text-gray-600">
              We couldn't find the use case you're looking for.
            </p>
            <Button onClick={() => navigate("/usecases")}>Back to Use Cases</Button>
          </div>
        ) : (
          <article className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {useCase.industries && useCase.industries.length > 0 ? (
                  useCase.industries.map((industry, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {industry}
                    </span>
                  ))
                ) : (
                  <span className="inline-block px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                    {useCase.industry}
                  </span>
                )}

                {useCase.categories && useCase.categories.length > 0 ? (
                  useCase.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm bg-secondary/10 text-secondary rounded-full"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <span className="inline-block px-3 py-1 text-sm bg-secondary/10 text-secondary rounded-full">
                    {useCase.category}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {useCase.title}
              </h1>

              <p className="text-xl text-gray-600 mb-8">{useCase.description}</p>
            </div>

            {useCase.imageUrl && (
              <div className="mb-12 rounded-xl overflow-hidden">
                <img
                  src={useCase.imageUrl}
                  alt={useCase.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-8">
              {isHtmlContent(useCase.content) ? (
                <div dangerouslySetInnerHTML={{ __html: useCase.content }} />
              ) : (
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(useCase.content),
                  }}
                />
              )}
            </div>

            <div className="mt-16 p-8 bg-gray-50 rounded-xl">
              <h2 className="text-2xl font-bold mb-4">
                Interested in this solution?
              </h2>
              <p className="mb-6">
                Contact us to learn more about how we can implement a similar
                solution for your business.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                onClick={handleContactClick}
              >
                Get in Touch
              </Button>
            </div>
          </article>
        )}
      </main>

      <Footer />
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default UseCaseDetail;
