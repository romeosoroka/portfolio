
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 mt-16 border-t border-gray-800">
      <p className="text-slate-400">
        &copy; {new Date().getFullYear()} Alex Doe. All rights reserved.
      </p>
      <div className="mt-2 text-slate-500 text-sm">
        <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
        <span className="mx-2">|</span>
        <a href="#" className="hover:text-slate-300 transition-colors">hello@alexdoe.com</a>
      </div>
    </footer>
  );
};

export default Footer;
