import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, TouchEvent } from "react";
import logo from "../assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum distance required for a swipe
  const minSwipeDistance = 50;

  const features = [
    {
      title: "Traffic Analytics",
      description: "Monitor people flow with comprehensive visualizations",
    },
    {
      title: "Advanced Comparisons",
      description: "Compare metrics across locations and time periods",
    },
    {
      title: "Key Metrics",
      description: "Track entries, exits, and conversion rates",
    },
  ];

  // Auto-rotation setup
  useEffect(() => {
    // Auto-rotate every 3 seconds if not paused
    intervalRef.current = window.setInterval(() => {
      if (!isPaused) {
        setCurrentCardIndex((prevIndex) =>
          prevIndex === features.length - 1 ? 0 : prevIndex + 1,
        );
      }
    }, 3000);

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isPaused, features.length]);

  // Touch handlers for swipe functionality
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null); // Reset values
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true); // Pause carousel during swipe
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Handle left swipe (next card)
    if (isLeftSwipe) {
      setCurrentCardIndex((prevIndex) =>
        prevIndex === features.length - 1 ? 0 : prevIndex + 1,
      );
    }

    // Handle right swipe (previous card)
    else if (isRightSwipe) {
      setCurrentCardIndex((prevIndex) =>
        prevIndex === 0 ? features.length - 1 : prevIndex - 1,
      );
    }

    // Resume auto-rotation after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute top-20 -left-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 -right-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#00A5B1]/5 rounded-full blur-2xl"></div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center w-full relative z-10">
        <div className="mx-auto max-w-3xl">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img src={logo} alt="Company Logo" className="h-20" />
          </div>

          {/* Title and Description */}
          <h1 className="mb-4 text-4xl font-bold text-black md:text-5xl text-center">
            People Counter
          </h1>
          <p className="mb-8 text-xl text-gray-600 mx-auto max-w-2xl text-center">
            Track, analyze, and optimize people flow. Powerful insights from
            accurate sensors and smart dashboards — all in one platform.
          </p>

          {/* Dashboard Button */}
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3 bg-[#00A5B1] text-white text-lg font-medium rounded-md
                hover:bg-[#008a94] transition-all flex items-center justify-center shadow-lg shadow-[#00A5B1]/20"
            >
              Go to Dashboard
              <span className="ml-2 transform transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Grid on desktop, Carousel on mobile */}
      <section className="container mx-auto px-4 pb-16 w-full relative z-10">
        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg text-center border-2 border-[#00A5B1]
                        transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#00A5B1]/[0.02]"
            >
              <div className="mb-4 h-8 w-8 bg-[#00A5B1]/10 rounded-full flex items-center justify-center mx-auto">
                <div className="h-4 w-4 bg-[#00A5B1] rounded-full"></div>
              </div>
              <h3 className="text-lg font-medium mb-2 text-[#00A5B1]">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile Auto-Carousel View with Swipe */}
        <div
          className="md:hidden max-w-sm mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative h-64">
            {/* Animated Cards Container */}
            <div className="overflow-hidden rounded-lg">
              <div
                className="transition-transform duration-500 ease-out flex"
                style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
              >
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="min-w-full p-6 bg-white rounded-lg text-center border-2 border-[#00A5B1]
                                                 h-64 flex flex-col justify-center"
                  >
                    <div className="mb-4 h-8 w-8 bg-[#00A5B1]/10 rounded-full flex items-center justify-center mx-auto">
                      <div className="h-4 w-4 bg-[#00A5B1] rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-[#00A5B1]">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentCardIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentCardIndex === index ? "bg-[#00A5B1]" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-20"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C108.81,20.78,211.45,35.94,321.39,56.44Z"
            fill="#00A5B1"
            fillOpacity="0.08"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Landing;
