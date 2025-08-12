"use client";

import Image from "next/image";
import React, { useState } from "react";

interface MoviePosterProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  useNextImage?: boolean;
  fallbackClassName?: string;
}

const MoviePoster: React.FC<MoviePosterProps> = ({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
  style,
  useNextImage = true,
  fallbackClassName = "",
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm font-medium ${
          fill ? "absolute inset-0" : ""
        } ${fallbackClassName} ${className}`}
        style={!fill ? { width, height, ...style } : style}
      >
        No Preview
      </div>
    );
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (useNextImage) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={className}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
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
      onLoad={handleLoad}
    />
  );
};

export default MoviePoster;
