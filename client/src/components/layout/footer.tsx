import React from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold">
              Auto<span className="text-accent">Market</span>
            </Link>
            <p className="mt-4 text-gray-300">
              The premium marketplace for luxury cars. Connect with trusted showrooms and find your dream vehicle.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-300 hover:text-white transition-colors">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/showrooms" className="text-gray-300 hover:text-white transition-colors">
                  Showrooms
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">For Sellers</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/auth" className="text-gray-300 hover:text-white transition-colors">
                  Join as Seller
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/add-listing" className="text-gray-300 hover:text-white transition-colors">
                  Add Listings
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Seller Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Seller Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Contact Us</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-accent shrink-0 mt-0.5" />
                <span className="text-gray-300">123 Business Street, Dubai, UAE</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-accent shrink-0" />
                <span className="text-gray-300">+971 4 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-accent shrink-0" />
                <span className="text-gray-300">info@automarket.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium">Newsletter</h3>
              <div className="mt-2 flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none bg-white text-secondary"
                />
                <Button className="rounded-l-none bg-accent hover:bg-accent-light">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300">© 2023 AutoMarket. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
