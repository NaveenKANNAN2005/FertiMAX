import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Leaf,
  Search,
  Sprout,
  Shield,
  Truck,
  Award,
  ArrowRight,
  Sparkles,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";
import heroImg from "@/assets/hero-farm.jpg";
import productsImg from "@/assets/fertilizer-products.jpg";

const features = [
  {
    icon: Brain,
    title: "AI Crop Advisor",
    desc: "Describe your crop and soil to get instant fertilizer recommendations powered by AI.",
  },
  {
    icon: Bug,
    title: "Disease Detection",
    desc: "Identify plant diseases and get targeted fertilizer solutions to restore crop health.",
  },
  {
    icon: Search,
    title: "Smart Search",
    desc: "Search products naturally. Our AI understands crop types, soil conditions, and more.",
  },
  {
    icon: Sprout,
    title: "Dosage Calculator",
    desc: "Calculate the perfect fertilizer amount based on your land size and crop variety.",
  },
];

const categories = [
  { name: "Organic Fertilizers", apiCategory: "Organic", color: "bg-leaf/10 text-leaf" },
  { name: "NPK Blends", apiCategory: "NPK Blends", color: "bg-primary/10 text-primary" },
  { name: "Micronutrients", apiCategory: "Micronutrients", color: "bg-secondary/10 text-secondary" },
  { name: "Bio Stimulants", apiCategory: "Bio Stimulants", color: "bg-accent/10 text-accent" },
  { name: "Soil Conditioners", apiCategory: "Soil Conditioners", color: "bg-earth/10 text-earth" },
  { name: "Foliar Sprays", apiCategory: "Foliar Sprays", color: "bg-gold/10 text-gold" },
];

const trustItems = [
  {
    icon: Shield,
    title: "Quality Guaranteed",
    desc: "All products are lab-tested and curated for dependable crop performance.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "A smoother path from advisor to order so your farm gets support on time.",
  },
  {
    icon: Award,
    title: "Expert Support",
    desc: "AI-assisted guidance paired with a product workflow built for real growers.",
  },
];

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const limit = 100;

      try {
        const firstPageResponse = await apiClient.get(`/products?limit=${limit}&page=1`);
        const firstPageData = firstPageResponse.data?.data || [];
        const totalPages = firstPageResponse.data?.pagination?.pages || 1;

        let allProducts = [...firstPageData];

        if (totalPages > 1) {
          const requests = Array.from({ length: totalPages - 1 }, (_, index) => {
            const page = index + 2;
            return apiClient.get(`/products?limit=${limit}&page=${page}`);
          });

          const responses = await Promise.all(requests);
          const remainingProducts = responses.flatMap((response) => response.data?.data || []);
          allProducts = [...allProducts, ...remainingProducts];
        }

        const counts = allProducts.reduce((acc, product) => {
          const category = product?.category;

          if (category) {
            acc[category] = (acc[category] || 0) + 1;
          }

          return acc;
        }, {});

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Failed to load category counts:", error);
        setCategoryCounts({});
      }
    };

    fetchCategoryCounts();
  }, []);

  return (
    <div className="min-h-screen grain-overlay">
      <Navbar />

      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div className="organic-orb left-[-5rem] top-28 h-52 w-52 bg-gold/20" />
        <div className="organic-orb right-[-6rem] top-16 h-72 w-72 bg-leaf/20" />

        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Lush green farmland"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-soil/90 via-soil/70 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-leaf/20 px-4 py-2 text-sm font-medium text-leaf animate-fade-in-up">
                <Sparkles className="h-4 w-4" />
                AI-Powered Agriculture
              </div>

              <h1
                className="mb-6 font-display text-4xl font-bold leading-tight text-cream md:text-6xl lg:text-7xl animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                Grow Smarter with{" "}
                <span className="text-gradient-accent">FertiMax</span>
              </h1>

              <p
                className="mb-8 text-lg leading-relaxed text-cream/80 md:text-xl animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                A warmer, more intelligent fertilizer workflow for modern farms.
                Explore live products, get tailored recommendations, and move from
                diagnosis to checkout without friction.
              </p>

              <div
                className="flex flex-col gap-4 sm:flex-row animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button variant="hero" size="lg" className="px-8 py-6 text-base" asChild>
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Brain className="h-5 w-5" />
                      Open Dashboard
                    </Link>
                  ) : (
                    <Link to="/crop-advisor">
                      <Brain className="h-5 w-5" />
                      Try AI Advisor
                    </Link>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-cream/30 px-8 py-6 text-base text-cream hover:bg-cream/10 hover:text-cream"
                  asChild
                >
                  <Link to="/products">
                    Browse Products
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="surface-panel hidden p-6 lg:block">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                Harvest Snapshot
              </p>
              <div className="mt-6 grid gap-4">
                {[
                  ["Soil mapped", "Loam-ready insights"],
                  ["Advisory speed", "Live catalog response"],
                  ["Workflow", "Advisor to checkout in one place"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.5rem] border border-primary/10 bg-white/80 p-4"
                  >
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 font-display text-2xl text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {isAuthenticated ? `Welcome back, ${user?.name || "farmer"}` : "AI Features"}
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold md:text-5xl">
              Intelligence Meets Agriculture
            </h2>
            <p className="text-lg text-muted-foreground">
              The advisor experience is built around live catalog data and a simpler,
              cleaner decision flow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group section-shell p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-strong"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary">
                  <feature.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="section-shell p-8 md:p-10">
            <div className="mb-12 flex flex-col items-start justify-between md:flex-row md:items-end">
              <div>
                <h2 className="mb-3 font-display text-3xl font-bold md:text-5xl">
                  Our Products
                </h2>
                <p className="text-lg text-muted-foreground">
                  Premium fertilizers for every crop and soil type.
                </p>
              </div>
              <Button variant="outline" className="mt-4 md:mt-0" asChild>
                <Link to="/products">
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to="/products"
                  className="group rounded-[1.5rem] border border-primary/10 bg-white/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
                >
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${cat.color}`}
                  >
                    {categoryCounts[cat.apiCategory] ?? 0} products
                  </span>
                  <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src={productsImg}
              alt="Organic fertilizer products"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              width={1280}
              height={720}
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-90" />
            <div className="relative z-10 p-10 text-center md:p-16">
              <h2 className="mb-4 font-display text-3xl font-bold text-cream md:text-5xl">
                Ready to Transform Your Farm?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-cream/80">
                Let the platform analyze your crop needs and move you into the right
                products with less guesswork.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="hero" size="lg" className="px-8 py-6 text-base" asChild>
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Brain className="h-5 w-5" />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link to="/crop-advisor">
                      <Brain className="h-5 w-5" />
                      Start AI Consultation
                    </Link>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-cream/30 px-8 py-6 text-base text-cream hover:bg-cream/10 hover:text-cream"
                  asChild
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="section-shell p-8 text-center">
                <item.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
