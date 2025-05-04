"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileImageForm({
  userId,
  redirectPath,
}: {
  userId: string;
  redirectPath: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("redirect_path", redirectPath);
      formData.append("profile_image", file);
      
      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        router.refresh();
        if (data.redirect) {
          router.push(data.redirect);
        }
      } else {
        console.error("Error uploading profile picture");
      }
    } catch (error) {
      console.error("Error in upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="profile-image-uploader">
      <input
        type="file"
        name="profile_image"
        id="profile_image"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <User className="w-4 h-4" />
        {isUploading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  );
}
