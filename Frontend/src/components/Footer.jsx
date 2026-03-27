import { Link } from "react-router-dom";
import { Leaf, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-soil text-soil-foreground">
      <div className="organic-orb -left-16 top-10 h-40 w-40 bg-leaf/20" />
      <div className="organic-orb right-0 top-0 h-48 w-48 bg-gold/10" />

      <div className="container relative mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Leaf className="h-6 w-6 text-leaf" />
              </div>
              <div>
                <span className="font-display text-xl font-bold">FertiMax</span>
                <p className="text-xs uppercase tracking-[0.3em] text-soil-foreground/45">
                  Growth Studio
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-soil-foreground/70">
              AI-powered fertilizer solutions for modern agriculture. Grow smarter,
              harvest better.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <h4 className="mb-4 font-display font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-soil-foreground/70">
              <li>
                <Link to="/" className="transition-colors hover:text-soil-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="transition-colors hover:text-soil-foreground">
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/crop-advisor"
                  className="transition-colors hover:text-soil-foreground"
                >
                  AI Crop Advisor
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-soil-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <h4 className="mb-4 font-display font-semibold">AI Features</h4>
            <ul className="space-y-2 text-sm text-soil-foreground/70">
              <li>Smart Crop Advisor</li>
              <li>Disease Detection</li>
              <li>Dosage Calculator</li>
              <li>Product Recommendations</li>
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <h4 className="mb-4 font-display font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm text-soil-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-leaf" />
                9345869407
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-leaf" />
                balaagroservices@gmail.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-leaf" />
                3/263,vasanthapuram nadanthai ,Paramathi Velur , namakkal
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-soil-foreground/10 pt-8 text-center text-sm text-soil-foreground/50">
          <p>© {new Date().getFullYear()} FertiMax. All rights reserved. Powered by AI.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
