import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterProps {
  variant?: "default" | "portfolio";
}

export default function Footer({ variant = "default" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: "https://github.com/username", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/username", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/username", label: "Twitter" },
    { icon: Globe, href: "https://website.com", label: "Website" }
  ];

  if (variant === "portfolio") {
    return (
      <footer className="bg-gray-50 dark:bg-gray-800 border-t py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-400">
                © {currentYear} Megharaj K. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              FlowCV
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Build your professional portfolio and advance your career with our comprehensive learning management platform.
            </p>
            <div className="flex space-x-4">
              {socialLinks.slice(0, 3).map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/learning" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Learning
                </a>
              </li>
              <li>
                <a href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Profile
                </a>
              </li>
              <li>
                <a href="/skills" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Skills
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                support@flowcv.com
              </li>
              <li>
                <a href="/help" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} FlowCV. All rights reserved.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mt-4 md:mt-0">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for learners
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}