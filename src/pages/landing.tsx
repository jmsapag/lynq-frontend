import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, TouchEvent } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/react";
import { AffluenceChart } from "../components/dashboard/charts/affluence-chart";
import { DeviceComparisonChart } from "../components/dashboard/charts/device-comparison";
import logo from "../assets/logo.png";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toggleLanguage, currentLanguage } = useLanguage();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Animation states for interactive demos
  const [animatedData, setAnimatedData] = useState(0);
  const [floatingElements, setFloatingElements] = useState([
    { id: 1, x: 20, y: 30, delay: 0 },
    { id: 2, x: 80, y: 70, delay: 2 },
    { id: 3, x: 60, y: 20, delay: 4 },
  ]);

  const minSwipeDistance = 50;

  const features = [
    {
      title: t("landing.features.trafficAnalytics"),
      description: t("landing.features.trafficAnalyticsDesc"),
    },
    {
      title: t("landing.features.advancedComparisons"),
      description: t("landing.features.advancedComparisonsDesc"),
    },
    {
      title: t("landing.features.keyMetrics"),
      description: t("landing.features.keyMetricsDesc"),
    },
  ];

  // Animated demo data
  const baseAffluenceData = [15, 25, 45, 78, 92, 85, 70, 55, 30];
  const baseComparisonData = {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    devices: [
      { name: "Main Entrance", values: [120, 145, 165, 180, 195, 210, 185] },
      { name: "Secondary Exit", values: [80, 95, 110, 125, 140, 155, 135] },
      { name: "Emergency Exit", values: [20, 25, 30, 35, 40, 45, 35] },
    ],
  };

  // Create animated data with slight variations
  const demoAffluenceData = {
    categories: [
      "9:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ],
    values: baseAffluenceData.map(
      (val) => val + Math.sin(animatedData * 0.1) * 5,
    ),
  };

  const demoComparisonData = {
    ...baseComparisonData,
    devices: baseComparisonData.devices.map((device) => ({
      ...device,
      values: device.values.map(
        (val) => val + Math.sin(animatedData * 0.1 + device.name.length) * 8,
      ),
    })),
  };

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      if (!isPaused) {
        setCurrentCardIndex((prevIndex) =>
          prevIndex === features.length - 1 ? 0 : prevIndex + 1,
        );
      }
    }, 3000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isPaused, features.length]);

  // Animation effect for data updates and floating elements
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimatedData((prev) => prev + 1);

      // Update floating elements positions
      setFloatingElements((prev) =>
        prev.map((element) => ({
          ...element,
          x: element.x + Math.sin(Date.now() * 0.001 + element.delay) * 0.5,
          y: element.y + Math.cos(Date.now() * 0.0008 + element.delay) * 0.3,
        })),
      );
    }, 100);

    return () => clearInterval(animationInterval);
  }, []);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentCardIndex((prevIndex) =>
        prevIndex === features.length - 1 ? 0 : prevIndex + 1,
      );
    } else if (isRightSwipe) {
      setCurrentCardIndex((prevIndex) =>
        prevIndex === 0 ? features.length - 1 : prevIndex - 1,
      );
    }

    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switch Button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 flex items-center gap-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 z-50 transition-all duration-300 hover:scale-105"
        title={t("common.changeLanguage", "Change language")}
      >
        <LanguageIcon className="h-5 w-5" />
        <span className="text-xs font-medium">
          {currentLanguage.toUpperCase()}
        </span>
      </button>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dynamic background elements with enhanced animations */}
        <div className="absolute top-20 -left-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 -right-16 w-32 h-64 bg-[#00A5B1]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#00A5B1]/5 rounded-full blur-2xl animate-bounce"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Floating animated elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-3 h-3 bg-[#00A5B1]/20 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              transform: `translate(${Math.sin(animatedData * 0.02 + element.delay) * 20}px, ${Math.cos(animatedData * 0.015 + element.delay) * 15}px)`,
              transition: "transform 0.1s ease-out",
            }}
          />
        ))}

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="border border-[#00A5B1] animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        <section className="container mx-auto px-4 py-16 text-center w-full relative z-10">
          <div className="mx-auto max-w-3xl">
            {/* Logo with enhanced animation */}
            <div className="mb-8 flex justify-center animate-fade-in">
              <div className="relative">
                <img
                  src={logo}
                  alt="Company Logo"
                  className="h-20 transition-transform duration-300 hover:scale-110 relative z-10"
                />
                <div className="absolute inset-0 bg-[#00A5B1]/10 rounded-full blur-xl animate-ping"></div>
              </div>
            </div>

            {/* Title and Description with staggered animation */}
            <h1
              className="mb-4 text-4xl font-bold text-black md:text-5xl text-center animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {t("landing.title", "People Counter")}
            </h1>
            <p
              className="mb-8 text-xl text-gray-600 mx-auto max-w-2xl text-center animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              {t(
                "landing.subtitle",
                "Advanced pedestrian analytics platform for understanding foot traffic patterns and optimizing space utilization.",
              )}
            </p>

            {/* Dashboard & Free Demo Buttons with enhanced hover effects */}
            <div
              className="flex flex-col items-center gap-4 mt-4 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <button
                onClick={() => navigate("/login")}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#00A5B1] to-[#008a94] px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span className="relative z-10">
                  {t("landing.goToDashboard", "Access Dashboard")}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#008a94] to-[#006b73] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => navigate("/free-trial")}
                className="relative rounded-lg border-2 border-[#00A5B1] px-8 py-3 text-lg font-semibold text-[#00A5B1] transition-all duration-300 hover:bg-[#00A5B1] hover:text-white hover:scale-105 overflow-hidden group"
              >
                <span className="relative z-10">
                  {t("landing.tryFreeDemo", "Try DEMO")}
                </span>
                <div className="absolute inset-0 bg-[#00A5B1] transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
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
                className="rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile Auto-Carousel View without dots */}
          <div
            className="md:hidden max-w-sm mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-64">
              <div className="overflow-hidden rounded-lg">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentCardIndex * 100}%)`,
                  }}
                >
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Analytics Demo Section with animated elements */}
      <section className="py-20 bg-gray-50 transition-all duration-1000 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-10 left-10 w-32 h-32 border border-[#00A5B1] rounded-full animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>
          <div
            className="absolute top-40 right-20 w-24 h-24 border border-[#00A5B1] rounded-full animate-spin"
            style={{ animationDuration: "15s", animationDirection: "reverse" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/3 w-16 h-16 border border-[#00A5B1] rounded-full animate-spin"
            style={{ animationDuration: "25s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t(
                "landing.analytics.title",
                "Comprehensive Analytics Dashboard",
              )}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "landing.analytics.subtitle",
                "Monitor foot traffic patterns with customizable dashboards that update every 5 minutes. Everything you need in one unified platform.",
              )}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-slide-in-left">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t(
                      "landing.analytics.chartTitle",
                      "Hourly Traffic Patterns",
                    )}
                  </h3>
                  <div className="flex items-center space-x-2"></div>
                </div>
                <div className="h-80 w-full relative overflow-hidden">
                  <AffluenceChart
                    data={demoAffluenceData}
                    groupBy="hour"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8 animate-slide-in-right">
              <div className="flex items-start space-x-4 transform transition-all duration-300 hover:translate-x-2">
                <div className="bg-[#00A5B1]/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg
                    className="w-6 h-6 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t(
                      "landing.features.customizable.title",
                      "Customizable Charts",
                    )}
                  </h4>
                  <p className="text-gray-600">
                    {t(
                      "landing.features.customizable.desc",
                      "Wide range of visualization options to match your specific needs and preferences.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 transform transition-all duration-300 hover:translate-x-2">
                <div
                  className="bg-[#00A5B1]/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                >
                  <svg
                    className="w-6 h-6 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("landing.features.unified.title", "All-in-One Platform")}
                  </h4>
                  <p className="text-gray-600">
                    {t(
                      "landing.features.unified.desc",
                      "Everything you need in one place - analytics, reporting, alerts, and management tools.",
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 transform transition-all duration-300 hover:translate-x-2">
                <div
                  className="bg-[#00A5B1]/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 animate-pulse"
                  style={{ animationDelay: "1s" }}
                >
                  <svg
                    className="w-6 h-6 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("landing.features.updates.title", "5-Minute Updates")}
                  </h4>
                  <p className="text-gray-600">
                    {t(
                      "landing.features.updates.desc",
                      "Near real-time data updates every 5 minutes to keep you informed of current conditions.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Location Comparison Section */}
      <section className="py-20 bg-white transition-all duration-1000 relative overflow-hidden">
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#00A5B1] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t("landing.comparison.title", "Multi-Location Intelligence")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "landing.comparison.subtitle",
                "Compare performance across multiple locations and devices with interactive visualizations.",
              )}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-16 relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {t(
                  "landing.comparison.chartTitle",
                  "Weekly Traffic Comparison",
                )}
              </h3>
            </div>
            <div className="h-96 w-full relative overflow-hidden">
              <DeviceComparisonChart
                data={demoComparisonData}
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="text-center animate-slide-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-[#00A5B1]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110 animate-pulse">
                <svg
                  className="w-8 h-8 text-[#00A5B1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.features.multiLocation", "Multi-Location Support")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "landing.features.multiLocationDesc",
                  "Monitor and compare multiple locations from a single dashboard interface.",
                )}
              </p>
            </div>

            <div
              className="text-center animate-slide-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div
                className="bg-[#00A5B1]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                <svg
                  className="w-8 h-8 text-[#00A5B1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.features.automaticReports", "Automatic Reports")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "landing.features.automaticReportsDesc",
                  "Generate comprehensive reports with scheduled delivery and custom formats.",
                )}
              </p>
            </div>

            <div
              className="text-center animate-slide-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div
                className="bg-[#00A5B1]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 hover:scale-110 animate-pulse"
                style={{ animationDelay: "1s" }}
              >
                <svg
                  className="w-8 h-8 text-[#00A5B1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("landing.features.customization", "Full Customization")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "landing.features.customizationDesc",
                  "Customize dashboards, alerts, and reports to match your business needs.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section with enhanced animations */}
      <section className="py-20 bg-gray-50 transition-all duration-1000 relative overflow-hidden">
        {/* Animated wave effect */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="absolute bottom-0 left-0 w-full h-32"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
              fill="#00A5B1"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z;M0,60 C150,20 350,120 600,60 C850,0 1050,100 1200,60 L1200,120 L0,120 Z;M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
              />
            </path>
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t(
                "landing.features.title",
                "Powerful Features for Smart Decisions",
              )}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "landing.features.subtitle",
                "Everything you need to understand and optimize pedestrian flow in your spaces.",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5 5v-5zM9 6l5-5v5H9zM12 3v18"
                    />
                  </svg>
                ),
                title: t("landing.features.smartAlerts.title", "Smart Alerts"),
                description: t(
                  "landing.features.smartAlerts.desc",
                  "Customizable notifications for occupancy thresholds and traffic patterns.",
                ),
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: t(
                  "landing.features.analytics.title",
                  "Advanced Analytics",
                ),
                description: t(
                  "landing.features.analytics.desc",
                  "Deep insights into traffic patterns, peak hours, and customer behavior.",
                ),
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: t("landing.features.mobile.title", "Mobile Ready"),
                description: t(
                  "landing.features.mobile.desc",
                  "Access your analytics from anywhere with our responsive mobile interface.",
                ),
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8 text-[#00A5B1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: t(
                  "landing.features.secure.title",
                  "Enterprise Security",
                ),
                description: t(
                  "landing.features.secure.desc",
                  "Bank-level security with encrypted data transmission and secure user management.",
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-slide-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="bg-[#00A5B1]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 animate-pulse"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-[#00A5B1] to-[#008a94] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Animated particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}

        <div className="container mx-auto px-6 text-center relative z-10 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t("landing.cta.title", "Ready to Transform Your Space Analytics?")}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t(
              "landing.cta.subtitle",
              "Join hundreds of businesses using our platform to optimize their operations and enhance customer experience.",
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#00A5B1] hover:bg-gray-100 font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              onClick={() => navigate("/free-trial")}
            >
              {t("landing.cta.demo", "Request Demo")}
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-white text-white hover:bg-white hover:text-[#00A5B1] font-semibold px-8 py-3 transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate("/contact")}
            >
              {t("landing.cta.contact", "Contact Sales")}
            </Button>
          </div>
        </div>
      </section>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 1s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Landing;
