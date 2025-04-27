import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksProps {
  steps: Step[];
}

const HowItWorks: React.FC<HowItWorksProps> = ({ steps }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
            How It Works
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-secondary sm:text-4xl">
            Simple Process, Exceptional Results
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our marketplace makes buying and selling luxury vehicles easy.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="absolute h-12 w-12 rounded-md bg-primary flex items-center justify-center -left-2 -top-2">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <Card className="mt-6 ml-6">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium text-secondary mt-4">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-gray-500">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
