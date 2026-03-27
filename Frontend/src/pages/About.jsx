import { Leaf, Users, Award, Target, Globe, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-farm.jpg";

const values = [
  { icon: Leaf, title: "Sustainability", desc: "We prioritize eco-friendly formulations and sustainable farming practices." },
  { icon: Target, title: "Precision", desc: "AI-driven precision agriculture ensures every gram of fertilizer counts." },
  { icon: Heart, title: "Farmer First", desc: "Everything we do is designed to empower farmers and maximize their harvest." },
  { icon: Globe, title: "Innovation", desc: "Leveraging cutting-edge AI to revolutionize how the world farms." },
];

const team = [
  { name: "Dr. Priya Sharma", role: "Chief Agronomist", bio: "20+ years in soil science and crop nutrition research." },
  { name: "Raj Patel", role: "AI & Technology Lead", bio: "Former ML engineer bringing AI to agriculture." },
  { name: "Sarah Chen", role: "Product Manager", bio: "Passionate about making farming technology accessible." },
  { name: "James Okonkwo", role: "Operations Head", bio: "Ensures every product reaches farmers on time." },
];

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-20">
        <div className="h-64 md:h-80 relative overflow-hidden">
          <img src={heroImg} alt="Farmland" className="w-full h-full object-cover" loading="lazy" width={1920} height={1080} />
          <div className="absolute inset-0 bg-soil/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-cream mb-3">About FertiMax</h1>
              <p className="text-cream/80 text-lg">Where agriculture meets artificial intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              At FertiMax, we believe every farmer deserves access to cutting-edge agricultural science. 
              Our AI-powered platform analyzes soil conditions, crop types, and local climate data to 
              deliver personalized fertilizer recommendations that maximize yield while minimizing environmental impact.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded by agronomists and AI researchers, FertiMax bridges the gap between traditional 
              farming wisdom and modern technology, helping farmers grow smarter and harvest better.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl bg-background border border-border text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Our Team</h2>
          <p className="text-center text-muted-foreground mb-12">The experts behind FertiMax's innovation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="p-6 rounded-2xl bg-card border border-border text-center hover:shadow-medium transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-accent font-medium mb-2">{member.role}</p>
                <p className="text-xs text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
