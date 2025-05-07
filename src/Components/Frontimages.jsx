import React, { useEffect, useState } from "react";
import img1 from "../../src/images/img1.jpg";
import img2 from "../../src/images/img2.jpg";
import img3 from "../../src/images/img3.jpg";

const slides = [
  {
    image: img1,
    heading: "Elegant Living Spaces",
    paragraph: "Inspired design for curtains",
  },
  {
    image: img2,
    heading: "Timeless Interior Beauty",
    paragraph: "High quality bespoke curtains",
  },
  {
    image: img3,
    heading: "Crafted Comfort & Style",
    paragraph: "Custom blinds & curtains tailored to you",
  },
];

const Frontimages = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 8000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[550px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-all duration-[7000ms] ease-in-out transform ${
            index === current
              ? "opacity-100 scale-[1.08] z-10"
              : "opacity-0 scale-[1.00] z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={`Slide ${index}`}
            className="w-full h-full object-cover"
          />
    
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-10 text-white bg-black bg-opacity-40">
            <h2 className="text-3xl md:text-5xl font-bold font-body mb-2 transition-opacity duration-1000">
              {slide.heading}
            </h2>
            <p className="text-sm md:text-lg transition-opacity font-heading duration-1000">
              {slide.paragraph}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Frontimages;
