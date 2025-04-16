import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { Upload, Edit, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";
import MDEditor from "@uiw/react-md-editor";

interface ContentInputProps {
  contentInputMethod: "editor" | "upload";
  onContentInputMethodChange: (value: "editor" | "upload") => void;
  content: string;
  onContentChange: (value?: string) => void;
  markdownFile: File | null;
  onMarkdownFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditingUploadedContent: boolean;
  setIsEditingUploadedContent: (value: boolean) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({
  contentInputMethod,
  onContentInputMethodChange,
  content,
  onContentChange,
  markdownFile,
  onMarkdownFileChange,
  isEditingUploadedContent,
  setIsEditingUploadedContent,
}) => {
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor="content" className="text-base font-medium">
          Content
        </Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant={contentInputMethod === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => onContentInputMethodChange("editor")}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" /> Editor
          </Button>
          <Button
            type="button"
            variant={contentInputMethod === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => onContentInputMethodChange("upload")}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {contentInputMethod === "editor" ? (
        <div className="space-y-2">
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={onContentChange}
              height={400}
              preview="edit"
            />
          </div>
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
              className="text-xs text-gray-500"
            >
              {showMarkdownHelp ? "Hide Markdown Help" : "Show Markdown Help"}
            </Button>
          </div>

          {showMarkdownHelp && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium mb-1">Markdown Cheatsheet:</h4>
              <ul className="space-y-1 list-disc pl-4">
                <li># Heading 1</li>
                <li>## Heading 2</li>
                <li>**Bold Text**</li>
                <li>*Italic Text*</li>
                <li>[Link Text](https://example.com)</li>
                <li>![Image Alt](image-url.jpg)</li>
                <li>- Bullet point</li>
                <li>1. Numbered list</li>
                <li>```code block```</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="file"
                  id="markdownFile"
                  accept=".md,.txt,.markdown"
                  onChange={onMarkdownFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="relative z-0 flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" /> Upload Markdown File
                </Button>
              </div>
              {markdownFile && (
                <span className="text-sm text-gray-500">
                  {markdownFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a markdown (.md) or text (.txt) file
            </p>
          </div>

          {markdownFile && (
            <div className="space-y-2">
              {isEditingUploadedContent ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="uploadedContent"
                      className="text-sm font-medium"
                    >
                      Edit Uploaded Content
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingUploadedContent(false)}
                      className="text-xs text-blue-500"
                    >
                      Cancel Editing
                    </Button>
                  </div>
                  <Textarea
                    id="uploadedContent"
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="uploadedContent"
                      className="text-sm font-medium"
                    >
                      Uploaded Content Preview
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingUploadedContent(true)}
                      className="text-xs text-blue-500"
                    >
                      Edit Content
                    </Button>
                  </div>
                  <div className="max-h-[400px] overflow-auto border rounded-md p-3 bg-gray-50">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {content.substring(0, 1000)}
                      {content.length > 1000 && "... (content truncated)"}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {!markdownFile && (
            <Alert variant="outline" className="bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 text-sm">
                Upload a markdown file or switch to the editor to create
                content.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentInput;
