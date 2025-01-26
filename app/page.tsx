import Link from 'next/link';
import { Gamepad2, GraduationCap } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
      {/* Animated Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute animate-blob top-10 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute animate-blob animation-delay-2000 bottom-10 left-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="text-center space-y-8 z-10 px-4">
        <h1 className="text-6xl md:text-7xl font-extrabold drop-shadow-lg">
          🚀 Welcome to <span className="text-yellow-300">Code Stars</span>
        </h1>
        <p className="text-2xl md:text-3xl font-medium max-w-2xl mx-auto">
          A Kahoot-style coding game to learn, code, and compete in a fun, interactive way!
        </p>
      </div>

      <div className="mt-16 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 z-10">
        <Link href="/game/student" className="w-full md:w-auto">
          <button className="flex items-center justify-center w-96 max-w-full px-10 py-6 text-2xl md:text-3xl font-bold bg-yellow-400 text-black rounded-full shadow-2xl hover:shadow-lg hover:bg-yellow-300 transition-all transform hover:scale-105">
            <GraduationCap className="mr-4" size={36} /> I'm a Student
          </button>
        </Link>
        <Link href="/game/teacher/start" className="w-full md:w-auto">
          <button className="flex items-center justify-center w-96 max-w-full px-10 py-6 text-2xl md:text-3xl font-bold bg-teal-500 text-white rounded-full shadow-2xl hover:shadow-lg hover:bg-teal-400 transition-all transform hover:scale-105">
            <Gamepad2 className="mr-4" size={36} /> I'm a Teacher
          </button>
        </Link>
      </div>

      <footer className="absolute bottom-6 text-base md:text-lg text-gray-300 text-center px-4 z-10">
        Made with 💻 and ☕ by <span className="text-white font-semibold">Code Stars Team</span>
      </footer>
    </div>
  );
};

export default HomePage;