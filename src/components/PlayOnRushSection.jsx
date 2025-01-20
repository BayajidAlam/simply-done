const PlayOnRushSection = () => {
  return (
    <section className="bg-brandBg py-16">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFB6C1] mb-4">
            Play on rush app
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-3xl mx-auto">
            Here are some of the reasons why users love to play on the Rush
            money game app. Check out why
            <button className="text-[#00FF85] ml-2 hover:underline">
              more
            </button>
          </p>
        </div>

        {/* First Card - Full Width */}
        <div className="w-full mb-8 md:hidden">
          {/* Earn Real Cash Card */}
          <div className="w-full">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  Earn real cash
                </h3>
                <p className="text-white/60 mb-8">Play fun games to win</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-1.png"
                    alt="Earn Real Cash"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Second Row with Cards 2 & 3 */}
        <div className="flex flex-row gap-4 mb-8 md:hidden">
          {/* Second Card */}
          <div className="w-1/2">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  5 Cr+ Real Players
                </h3>
                <p className="text-white/60 mb-8">No bots in games</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-2.png"
                    alt="Real Players"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Third Card */}
          <div className="w-1/2">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  1 Referral = ₹1,000
                </h3>
                <p className="text-white/60 mb-8">Refer friends to earn</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="	https://www.getrushapp.com/assets/images/homepage/reason-img-4.png"
                    alt="Referral Bonus"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: First Row */}
        <div className="hidden md:flex md:flex-row gap-8 mb-8">
          {/* First Card - 2/3 width */}
          <div className="w-2/3">
            {/* Earn Real Cash Card */}
            <div className="w-full">
              <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
                {/* Glow effects */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

                <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                  <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                    Earn real cash
                  </h3>
                  <p className="text-white/60 mb-8">Play fun games to win</p>

                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                    <img
                      src="https://www.getrushapp.com/assets/images/homepage/reason-img-1.png"
                      alt="Earn Real Cash"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Card - 1/3 width */}
          <div className="w-1/3">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  5 Cr+ Real Players
                </h3>
                <p className="text-white/60 mb-8">No bots in games</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-2.png"
                    alt="Real Players"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Desktop */}
        <div className="hidden md:flex flex-row gap-8 mb-8">
          {/* Third Card - 1/3 desktop */}
          <div className="w-1/3">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  1 Referral = ₹1,000
                </h3>
                <p className="text-white/60 mb-8">Refer friends to earn</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="	https://www.getrushapp.com/assets/images/homepage/reason-img-4.png"
                    alt="Referral Bonus"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fourth Card - 2/3 desktop */}
          <div className="w-2/3">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  Instant Withdrawals
                </h3>
                <p className="text-white/60 mb-8">
                  Directly to your bank account
                </p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="	https://www.getrushapp.com/assets/images/homepage/reason-img-3.png"
                    alt="Instant Withdrawals"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Only: Fourth Card Full Width */}
        <div className="md:hidden w-full mb-8">
          {/* Fourth Card - Full width mobile */}
          <div className="w-full">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  Instant Withdrawals
                </h3>
                <p className="text-white/60 mb-8">
                  Directly to your bank account
                </p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="	https://www.getrushapp.com/assets/images/homepage/reason-img-3.png"
                    alt="Instant Withdrawals"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Only: Last Row for Cards 5 & 6 */}
        <div className="flex md:hidden flex-row gap-4">
          {/* Fifth Card - 1/2 mobile */}
          <div className="w-1/2">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  Big Tournaments
                </h3>
                <p className="text-white/60 mb-8">Zero entry fee</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-5.png"
                    alt="Big Tournaments"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sixth Card - 1/2 mobile */}
          <div className="w-1/2">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  24x7 Support
                </h3>
                <p className="text-white/60 mb-8">Our team is at service</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-6.png"
                    alt="24x7 Support"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row Desktop */}
        <div className="hidden md:flex flex-row gap-8">
          {/* Fifth Card - 2/3 desktop */}
          <div className="w-2/3">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  Big Tournaments
                </h3>
                <p className="text-white/60 mb-8">Zero entry fee</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-5.png"
                    alt="Big Tournaments"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sixth Card - 1/3 desktop */}
          <div className="w-1/3">
            <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent h-full">
              {/* Glow effects */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

              <div className="bg-[#2a1245] rounded-[1.9rem] p-8 h-full">
                <h3 className="text-[#00FF85] text-2xl md:text-3xl font-bold mb-2">
                  24x7 Support
                </h3>
                <p className="text-white/60 mb-8">Our team is at service</p>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.getrushapp.com/assets/images/homepage/reason-img-6.png"
                    alt="24x7 Support"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayOnRushSection;
