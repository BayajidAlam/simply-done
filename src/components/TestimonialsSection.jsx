import  { useState } from "react";

const TestimonialsSection = () => {
  const videoId = "kDcM_xwmP3Q"; // Same video ID for both cards
  const [activeVideo, setActiveVideo] = useState(null); // Track which video is active

  const openVideo = (id) => {
    setActiveVideo(id); // Set the active video ID
  };

  const cardClasses = `
    relative p-[2px] rounded-[2.5rem] 
    bg-gradient-to-b from-[#3b1e54] to-transparent 
    before:absolute before:inset-0 before:-z-10 before:rounded-[2.5rem]
    before:bg-brandBg
    after:absolute after:inset-0 after:-z-20 after:rounded-[2.5rem]
    after:bg-[#3b1e54] after:blur-xl
    shadow-[0_0_40px_10px_rgba(59,30,84,0.3)]
    group cursor-pointer
  `;

  return (
    <section className="bg-brandBg py-12 relative overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="flex justify-end mb-6">
          <p className="text-[#FFE500] text-lg flex items-center gap-2">
            So does Rush players
            <span role="img" aria-label="smile" className="text-2xl">
              😊
            </span>
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((id) => (
            <div
              key={id}
              className={cardClasses}
              onClick={() => openVideo(id)}
            >
              {/* Shadows */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-50" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-50" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-50" />
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-[80%] bg-[#3b1e54] blur-2xl -z-10 opacity-30" />

              {/* Card Content */}
              <div className="relative rounded-[2.4rem] overflow-hidden bg-brandBg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-video bg-gradient-to-r from-[#2a1245] to-[#1b0029]">
                  {activeVideo === id ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                      alt={`Testimonial ${id}`}
                      className="w-full h-full object-cover opacity-90"
                    />
                  )}

                  {/* Rush Logo */}
                  <div className="absolute top-4 right-4 z-20">
                    <img
                      src="/rush-gaming.svg"
                      alt="Rush Gaming"
                      className="h-8"
                    />
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

export default TestimonialsSection;
