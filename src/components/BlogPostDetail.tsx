import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Header from "./header";
import Footer from "./footer";
import ContactModal from "./ContactModal";
import { getBlogPostBySlug } from "../api/blog";
import { BlogPost } from "../types/blog";
// Import React Markdown with only essential plugins
import ReactMarkdown from "react-markdown";
// Import markdown styles
import "../styles/markdown.css";

interface BlogPostDetailProps {
  slug?: string;
}

const BlogPostDetail = (props: BlogPostDetailProps) => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = props?.slug || slugParam;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        const fetchedPost = await getBlogPostBySlug(slug);
        setPost(fetchedPost);
      } catch (err) {
        console.error(`Error fetching post with slug ${slug}:`, err);
        setError("Failed to load blog post. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          onClick={() => navigate("/blog")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Button>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error || !post ? (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">
              {error || "Blog post not found"}
            </h1>
            <p className="mb-8 text-gray-600">
              We couldn't find the blog post you're looking for.
            </p>
            <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
          </div>
        ) : (
          <article className="max-w-4xl mx-auto">
            {post.featuredImage && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <div className="mx-auto" style={{ maxWidth: "800px" }}>
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="max-w-full max-h-[600px] object-contain mx-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>

              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>{post.category.name}</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-8">
              {/* Conditionally render content based on whether it's HTML or Markdown */}
              {isHtmlContent(post.content) ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(post.content),
                  }}
                />
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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

export default BlogPostDetail;
