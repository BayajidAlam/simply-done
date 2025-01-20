import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import RatingSection from "./components/RatingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ReviewsSection from "./components/ReviewsSection";
import InstallGuide from "./components/InstallGuide";
import PlayOnRushSection from "./components/PlayOnRushSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="bg-brandBg">
      <Header />
      <HeroSection />
      <RatingSection />
      <TestimonialsSection />
      <ReviewsSection />
      <InstallGuide />
      {/* <GamesSection /> */}
      <PlayOnRushSection />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default App;
