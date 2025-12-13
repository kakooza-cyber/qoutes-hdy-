import React from 'react';

interface SocialShareButtonsProps {
  quoteText: string;
  author: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ quoteText, author }) => {
  const encodedText = encodeURIComponent(`"${quoteText}" - ${author}`);
  const pageUrl = encodeURIComponent(window.location.href);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${pageUrl}`,
    },
    {
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedText}`,
    },
    {
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://api.whatsapp.com/send?text=${encodedText}%0A${pageUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=Quote from Quotely-hdy&summary=${encodedText}`,
    },
    {
      name: 'Pinterest',
      icon: 'fab fa-pinterest',
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${pageUrl}&description=${encodedText}&media=${quoteText}`, // Media is often an image URL
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-lg transition duration-300 ${link.color} shadow-md`}
          aria-label={`Share on ${link.name}`}
        >
          <i className={link.icon}></i>
        </a>
      ))}
    </div>
  );
};

export default SocialShareButtons;