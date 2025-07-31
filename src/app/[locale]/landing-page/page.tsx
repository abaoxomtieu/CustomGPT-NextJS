import ParticlesBackground from "./back-ground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      {/* Particles Background */}
      <ParticlesBackground />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-6">
          Welcome to Our Site
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 text-center max-w-3xl mb-8">
          Experience amazing particles background with Next.js
        </p>
        <button className="bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}