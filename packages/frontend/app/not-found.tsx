"use client";

const NotFound  = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Visual Element */}
        <div className="relative inline-block">
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-zinc-100 to-zinc-800 opacity-20 select-none">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Lost in the digital void?
          </h2>
          <p className="text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
            The page you're looking for has moved to another dimension or simply never existed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto px-10 py-2.5 bg-zinc-100 text-zinc-950 font-bold rounded-xl transition-transform duration-200 cursor-pointer"
          >
            Back to Home
          </button>
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-10 py-2.5 bg-transparent text-zinc-400 font-semibold border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:text-zinc-100 transition-all cursor-pointer"
          >
            Previous Page
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-16 text-zinc-600 text-xs font-medium tracking-tighter uppercase">
          Reference ID: <span className="font-mono text-zinc-500">ERR_404_VOID_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
