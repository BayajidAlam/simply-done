const HeroSection = () => {
  return (
    <section className="bg-brandBg py-6 md:py-12">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Mobile Tournament Image - Shows at top on mobile */}
        <div className="md:hidden w-full mb-8">
          <img
            src="https://cdn.getrushapp.com/banners/a3bd8e4a50550ffcfcaa5f6e6ca4a5a4.png"
            alt="Tournament Prizes"
            className="w-full"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left Content */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">
              <span className="text-[#00FF85]">₹10 Crore+</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#FFE500] mb-8">
              Daily Winnings in Real Cash Games
            </p>

            <h2 className="text-white/60 text-lg md:text-xl mb-6">
              Download App & Get ₹10 free!
            </h2>

            {/* Input and Button */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button className="px-8 py-3 rounded-full bg-[#00FF85] text-black font-semibold hover:bg-[#00FF85]/90 transition-colors whitespace-nowrap">
                Get Download Link
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <img
                className="h-24 w-24"
                src="https://www.getrushapp.com/assets/images/homepage/qr-code.png"
              ></img>

              <p className="text-white">
                Download <br />
                via QR Code
              </p>
            </div>

            {/* Stats */}
          </div>

          {/* Right Content - Tournament Image (Hidden on mobile) */}
          <div className="hidden md:block w-full md:w-1/2">
            <img
              src="https://cdn.getrushapp.com/banners/a3bd8e4a50550ffcfcaa5f6e6ca4a5a4.png"
              alt="Tournament Prizes"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
