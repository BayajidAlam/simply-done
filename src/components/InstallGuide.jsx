import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

const steps = [
  {
    id: 1,
    title: "Step 1",
    description: 'Click "Download" Button to continue.',
    image: "https://www.getrushapp.com/assets/images/homepage/step-1.png",
  },
  {
    id: 2,
    title: "Step 2",
    description: 'Click on "Download Anyway" to start downloading.',
    image: "https://www.getrushapp.com/assets/images/homepage/step-2.png",
  },
  {
    id: 3,
    title: "Step 3",
    description: 'Turn on "Allow Apps" from this source.',
    image: "https://www.getrushapp.com/assets/images/homepage/step-3.png",
  },
  {
    id: 4,
    title: "Step 4",
    description: 'Click on "Install" to play games & earn real cash.',
    image: "https://www.getrushapp.com/assets/images/homepage/step-4.png",
  },
];

const InstallGuide = () => {
  return (
    <section className="bg-brandBg py-16">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h3 className="text-[#00FF85] text-sm uppercase tracking-wider mb-2">
            HOW TO
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-[#FFB6C1] mb-4">
            Install Rush App
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-3xl mx-auto">
            Steps to install the Rush real money game app & win money online are
            :
            <button className="text-[#00FF85] ml-2 hover:underline">
              more
            </button>
          </p>
        </div>

        {/* Steps Grid for Desktop */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              {/* Card with purple glow */}
              <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent">
                {/* Glow effects */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

                {/* Card Content */}
                <div className="bg-[#2a1245] rounded-[1.9rem] p-6">
                  <h4 className="text-white/60 text-sm mb-2">{step.title}</h4>
                  <p className="text-white text-sm mb-6">{step.description}</p>

                  {/* Image Container */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brandBg">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto Slider for Mobile */}
        <div className="block sm:hidden">
          <Swiper
            modules={[Pagination, Autoplay]}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={1}
            loop={true}
            className="w-full"
          >
            {steps.map((step) => (
              <SwiperSlide key={step.id}>
                <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent">
                  <div className="bg-[#2a1245] rounded-[1.9rem] p-6">
                    <h4 className="text-white/60 text-sm mb-2">{step.title}</h4>
                    <p className="text-white text-sm mb-6">{step.description}</p>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brandBg">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default InstallGuide;
