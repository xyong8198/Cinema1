"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MoviePosterProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  useNextImage?: boolean;
  fallbackClassName?: string;
}

export default function MoviePoster({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
  width,
  height,
  style,
  useNextImage = true,
  fallbackClassName = "",
}: MoviePosterProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${
          fill ? "absolute inset-0" : ""
        } ${fallbackClassName} ${className}`} 
        style={!fill ? { width, height, ...style } : style}
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">No Preview</p>
        </div>
      </div>
    );
  }

  if (useNextImage) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={className}
        style={style}
        onError={handleError}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
