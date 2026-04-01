"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function FeatureBlock({ imageSrc, title, description, reverse }) {
  const [isVisible, setIsVisible] = useState(false);
  const blockRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (blockRef.current) observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={blockRef}
      className={`grid md:grid-cols-2 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div
        className={`flex items-center p-8 md:p-12 bg-gray-950 ${
          reverse ? "md:order-2 md:justify-end" : "md:order-1 md:justify-start"
        }`}
      >
        <div className={` ${reverse ? "text-left" : "text-right"}`}>
          <h3
            className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-1000 ${
              isVisible ? "text-emerald-400" : "text-white"
            }`}
          >
            {title}
          </h3>
          <p className="text-gray-400 text-lg">{description}</p>
        </div>
      </div>

      <div
        className={`relative h-64 md:h-[400px] overflow-hidden bg-gray-900 transition-all duration-3000 hover:brightness-110 ${
          reverse ? "md:order-1" : "md:order-2"
        }`}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-all duration-1000"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">Иллюстрация {title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}