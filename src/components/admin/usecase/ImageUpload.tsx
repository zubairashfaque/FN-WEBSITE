import React from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Image, Upload } from "lucide-react";

interface ImageUploadProps {
  imageUrl: string;
  imagePreview: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  imagePreview,
  onInputChange,
  onFileChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="featuredImage" className="text-base font-medium">
        Featured Image
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            name="imageUrl"
            value={imageUrl}
            onChange={onInputChange}
            placeholder="Enter image URL"
            className="flex-1"
          />
          <div className="relative">
            <Input
              type="file"
              id="imageUpload"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={onFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="relative z-0 flex items-center gap-1"
            >
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Enter a URL or upload an image file (max 2MB)
        </p>
      </div>

      {(imageUrl || imagePreview) && (
        <div className="mt-2 border rounded-md overflow-hidden h-40">
          <img
            src={imagePreview || imageUrl}
            alt="Featured"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
