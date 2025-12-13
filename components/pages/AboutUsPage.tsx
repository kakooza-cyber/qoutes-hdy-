import React from 'react';
import Button from '../Button';
import { APP_NAME, APP_TAGLINE, SOCIAL_MEDIA_LINKS, MOCK_TEAM_MEMBER_IMAGE } from '../../constants';

const teamMembers = [
  {
    id: 1,
    name: 'Jane Doe',
    role: 'Founder & CEO',
    bio: 'Passionate about literature and inspiring quotes, Jane founded Quotely to share wisdom with the world.',
    imageUrl: MOCK_TEAM_MEMBER_IMAGE.replace('teammember', 'jane')
  },
  {
    id: 2,
    name: 'John Smith',
    role: 'Lead Developer',
    bio: 'A coding enthusiast, John brings Quotely to life with seamless functionality and a beautiful user experience.',
    imageUrl: MOCK_TEAM_MEMBER_IMAGE.replace('teammember', 'john')
  },
  {
    id: 3,
    name: 'Emily White',
    role: 'Content Curator',
    bio: 'Emily meticulously curates quotes and proverbs, ensuring a rich and diverse collection for our users.',
    imageUrl: MOCK_TEAM_MEMBER_IMAGE.replace('teammember', 'emily')
  },
];

const AboutUsPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon. (This is a mock submission.)');
    // In a real application, you would send this data to a backend API.
  };

  return (
    <div className="py-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 drop-shadow-md">
        About {APP_NAME}
      </h1>

      <section className="bg-white p-8 rounded-xl shadow-xl mb-12 border border-purple-100 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed text-center">
          At {APP_NAME}, we believe in the power of words to inspire, motivate, and provoke thought. Our mission is to
          create a sanctuary for wisdom and reflection, bringing together a vast collection of quotes and proverbs
          from across history and cultures. We aim to be your daily source of inspiration, helping you connect
          with profound ideas and share them with the world. {APP_TAGLINE}.
        </p>
      </section>

      <section className="mb-12 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-purple-800 mb-8 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-200"
              />
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              <p className="text-purple-600 text-sm mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-8 rounded-xl shadow-xl max-w-3xl mx-auto border border-purple-100">
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">Contact Us</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg">
              Send Message
            </Button>
          </div>
        </form>
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Us On Social Media</h3>
          <div className="flex justify-center space-x-6 text-3xl">
            <a href={SOCIAL_MEDIA_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition duration-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href={SOCIAL_MEDIA_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition duration-300">
              <i className="fab fa-twitter"></i>
            </a>
            <a href={SOCIAL_MEDIA_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition duration-300">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;