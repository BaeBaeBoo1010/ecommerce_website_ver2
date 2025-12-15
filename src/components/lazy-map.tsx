"use client";

import { useState, useEffect, useRef } from "react";

interface LazyMapProps {
  src: string;
  title: string;
  className?: string;
}

export default function LazyMap({ src, title, className }: LazyMapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px",
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        <iframe
          src={src}
          title={title}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
        </div>
      )}
    </div>
  );
}
