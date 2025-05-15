import React from "react";

interface BlogAuthorDisplayProps {
  name: string;
  avatar: string;
  date: string;
}

const BlogAuthorDisplay: React.FC<BlogAuthorDisplayProps> = ({
  name = "Zubair Ashfaque",
  avatar = "/assets/zubair-avatar.png",
  date = "May 11, 2023",
}) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
};

export default BlogAuthorDisplay;
