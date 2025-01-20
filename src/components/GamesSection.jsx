const games = [
  {
    id: 1,
    name: "Speed Leedo",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 2,
    name: "Call Break",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 3,
    name: "Carrom Freestyle",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 4,
    name: "Speed Ladders",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 5,
    name: "Tezz Leedo",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  // Bottom row games
  {
    id: 6,
    name: "Quiz Game",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 7,
    name: "Tezz Ladders",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 8,
    name: "Pro Carrom",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 9,
    name: "Fruit Slice",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
  {
    id: 10,
    name: "8 Ball Pool",
    image:
      "https://www.getrushapp.com/assets/images/homepage/Speed%20Leedo.png",
  },
];

const GamesSection = () => {
  return (
    <section className="bg-brandBg py-16">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-[#00FF85] text-sm uppercase tracking-wider mb-2">
            EXPERIENCE 15+
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFB6C1] mb-4">
            Skill Based Games
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-3xl mx-auto">
            Download real money earning app & start playing 15+ skills based
            online games to earn money
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {games.map((game) => (
            <div key={game.id} className="relative group cursor-pointer">
              {/* Card with purple glow */}
              <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent">
                {/* Glow effects */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

                {/* Game Card */}
                <div className="relative aspect-square rounded-[1.9rem] overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-[#00FF85] text-black font-medium px-6 py-2 rounded-full transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        Play Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
