export const Landing = () => {
    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white flex flex-col">

            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-4">
                <h1 className="text-2xl font-bold">MetaVerse</h1>
                <div className="space-x-6">
                    <button className="hover:text-gray-300">Home</button>
                    <button className="hover:text-gray-300">Explore</button>
                    <button className="hover:text-gray-300">Login</button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex flex-1 flex-col justify-center items-center text-center px-6">
                <h1 className="text-5xl font-extrabold mb-4">
                    Enter the Future of Virtual Worlds 🌐
                </h1>
                <p className="text-gray-400 max-w-xl mb-6">
                    Create your avatar, explore digital spaces, and connect with people in the metaverse.
                </p>

                <div className="space-x-4">
                    <button className="bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-500 transition">
                        Get Started
                    </button>
                    <button className="border border-gray-500 px-6 py-3 rounded-xl hover:bg-gray-800 transition">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 px-10 py-10">
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">🧑‍🚀 Avatars</h2>
                    <p className="text-gray-400">Customize your digital identity.</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">🌍 Spaces</h2>
                    <p className="text-gray-400">Create and explore virtual worlds.</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">🤝 Connect</h2>
                    <p className="text-gray-400">Meet and interact with others.</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-4 text-gray-500 text-sm">
                © 2026 MetaVerse. All rights reserved.
            </footer>

        </div>
    );
};