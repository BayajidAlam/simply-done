import React from "react";

const Footer = () => {
  return (
    <div className="max-w-[1500px] mx-auto text-white font-sans">
      {/* Mobile View */}
      <div className="md:hidden px-6 py-8 text-center">
        <h2 className="text-lg font-bold">CONNECT &</h2>
        <h3 className="text-xl font-bold">Follow us on</h3>

        <div className="flex justify-center space-x-6 my-6">
          <a href="#" className="text-xl">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="#" className="text-xl">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="text-xl">
            <i className="fab fa-telegram"></i>
          </a>
          <a href="#" className="text-xl">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="#" className="text-xl">
            <i className="fas fa-times"></i>
          </a>
        </div>

        <div className="my-8">
          <h1 className="text-3xl font-bold">Rush</h1>
          <p className="text-sm mt-4">
            Rush is an online gaming platform where the competitive spirit of
            India comes alive. Play AAA Rated games like Carrom, Ludo, Call
            Break & more against each other in skill-games and win real money.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-left">
          <div>
            <h4 className="font-semibold">Card Games</h4>
            <p>Call Break</p>
          </div>
          <div>
            <h4 className="font-semibold">Sports Games</h4>
            <p>Archery</p>
            <p>Football</p>
          </div>
          <div>
            <h4 className="font-semibold">Board Games</h4>
            <p>Carrom</p>
            <p>Ludo</p>
          </div>
          <div>
            <h4 className="font-semibold">Casual Games</h4>
            <p>Carrom</p>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block ">
        <div className="flex justify-between items-center mb-12">
          <div className="flex space-x-6">
            <a href="#" className="text-xl">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-xl">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="text-xl">
              <i className="fab fa-telegram"></i>
            </a>
            <a href="#" className="text-xl">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="#" className="text-xl">
              <i className="fas fa-times"></i>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-8 text-left">
          <div>
            <h4 className="font-semibold">Card Games</h4>
            <p>Call Break</p>
          </div>
          <div>
            <h4 className="font-semibold">Casual Games</h4>
            <p>Carrom</p>
            <p>Ludo</p>
            <p>Quizzy</p>
            <p>Snakes & Ladders</p>
          </div>
          <div>
            <h4 className="font-semibold">Arcade Games</h4>
            <p>Fruit Fight</p>
          </div>
          <div>
            <h4 className="font-semibold">Sports Games</h4>
            <p>Archery</p>
            <p>Football</p>
          </div>
          <div>
            <h4 className="font-semibold">Board Games</h4>
            <p>Carrom</p>
            <p>Ludo</p>
          </div>
          <div>
            <h4 className="font-semibold">Cue Sports</h4>
            <p>Pool</p>
            <h4 className="font-semibold mt-4">Fantasy Games</h4>
            <p>Fantasy Cricket</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
