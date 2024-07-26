import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100  border-t text-gray-600 py-4">
      <div className="container mx-auto flex justify-center items-center px-4">
        <p className="text-sm">
          Made with <span className="text-red-500">❤️</span> by{' '}
          <a
            href="https://arnav7777.github.io/arnavpratapsingh-portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-700 hover:underline"
          >
            Arnav Pratap Singh
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
