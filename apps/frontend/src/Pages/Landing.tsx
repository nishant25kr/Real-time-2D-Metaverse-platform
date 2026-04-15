import { useNavigate } from "react-router-dom";

export const Landing = () => {
    const navigation = useNavigate();

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">

            {/* Nav */}
            <nav className="flex justify-between items-center px-10 py-5 border-b border-gray-100">
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">
                    MetaVerse
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigation("/login")}
                        className="text-sm text-gray-500 px-4 py-2 hover:text-gray-900 transition-colors"
                    >
                        Log in
                    </button>
                    <button
                        onClick={() => navigation("/signup")}
                        className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors"
                    >
                        Sign up
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex flex-1 flex-col justify-center items-center text-center px-6 gap-5">


                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-2xl leading-tight">
                    Virtual spaces for real collaboration
                </h1>

                <p className="text-gray-500 text-base max-w-md leading-relaxed">
                    Create your avatar, explore digital spaces, and move around with others in real-time.
                </p>

                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => navigation("/signup")}
                        className="bg-gray-900 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                        Get started free
                    </button>
                    <button
                        onClick={() => navigation("/login")}
                        className="border border-gray-200 text-gray-600 px-6 py-3 rounded-md text-sm font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Log in
                    </button>
                </div>
            </div>

            <footer className="text-center py-5 border-t border-gray-100 text-xs text-gray-400">
                MetaVerse
            </footer>
        </div>
    );
};