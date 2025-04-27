import React from "react";
import SearchForm from "@/components/search-form";

interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => {
  return (
    <section className="relative bg-secondary-dark">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Luxury cars"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark to-transparent opacity-80"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-xl text-gray-300">{subtitle}</p>

        {/* Search form */}
        <div className="mt-10 max-w-xl">
          <SearchForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
