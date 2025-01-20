const RatingSection = () => {
  return (
    <section className="bg-brandBg py-12">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-[#00FF85] text-lg mb-2">OUR PLAYERS</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFB6C1] mb-4">
            Trust Rush App
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-sm md:text-base">
            Play real money games in India on highly trusted money game app
            Rush. Check out reviews from real users below.
          </p>
        </div>

        {/* Rating Card */}
        <div className="bg-[#0A1F1C] p-4 md:p-8 lg:p-12 rounded-3xl">
          <div className="flex flex-row justify-between items-center gap-8 md:gap-12">
            {/* Left Side - Big Rating */}
            <div className="w-1/3 text-center md:text-left">
              <h3 className="text-white text-xl md:text-2xl mb-2 md:mb-4">
                App Rating
              </h3>
              <div className="text-[#00FF85] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-1 md:mb-2">
                4.4
              </div>
              <p className="text-white text-base sm:text-lg md:text-xl">
                out of 5
              </p>
            </div>

            {/* Right Side - Rating Bars */}
            <div className="w-2/3 space-y-4 md:space-y-6">
              {/* 5 Stars */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-white/60 w-4 text-sm md:text-base">
                  5
                </span>
                <div className="relative flex-1 h-4 bg-[#1b2928] rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[95%] bg-[#00FF85] rounded-full"></div>
                </div>
              </div>

              {/* 4 Stars */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-white/60 w-4 text-sm md:text-base">
                  4
                </span>
                <div className="relative flex-1 h-4 bg-[#1b2928] rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[85%] bg-[#00FF85] rounded-full"></div>
                </div>
              </div>

              {/* 3 Stars */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-white/60 w-4 text-sm md:text-base">
                  3
                </span>
                <div className="relative flex-1 h-4 bg-[#1b2928] rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[30%] bg-[#FFB800] rounded-full"></div>
                </div>
              </div>

              {/* 2 Stars */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-white/60 w-4 text-sm md:text-base">
                  2
                </span>
                <div className="relative flex-1 h-4 bg-[#1b2928] rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[20%] bg-[#FF8A00] rounded-full"></div>
                </div>
              </div>

              {/* 1 Star */}
              <div className="flex items-center gap-3 md:gap-4">
                <span className="text-white/60 w-4 text-sm md:text-base">
                  1
                </span>
                <div className="relative flex-1 h-4 bg-[#1b2928] rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 h-full w-[10%] bg-[#FF0000] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RatingSection;
