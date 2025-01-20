const reviews = [
  {
    id: 1,
    name: "Vishal Gupta",
    verified: true,
    amount: "₹1,255",
    location: "Bhadohi, Uttar Pradesh",
    message:
      "I earned ₹1 Lakh from this game. I quickly withdrew the winnings to my bank account. It is safe & easy to use app.",
    avatar: "/avatars/vishal.png",
  },
  {
    id: 2,
    name: "Devashish Tomar",
    verified: true,
    amount: "₹54,255",
    location: "Dehradun, Uttarakhand",
    message:
      "I earned over ₹50,000 in Rush App. It has an easy-to-use interface that motivates you to play more and earn big!",
    avatar: "/avatars/devashish.png",
  },
  {
    id: 3,
    name: "Alok Behera",
    verified: true,
    amount: "₹12,765",
    location: "Kanpur, Uttar Pradesh",
    message:
      "Main pichle 2 saal se Rush App pe khel raha hu. Maine ₹10,000 se zyaada jeeta hai iss pe. 100% safe aur secure hai ye app!",
    avatar: "/avatars/alok.png",
  },
  {
    id: 4,
    name: "Rajesh Sharma",
    verified: true,
    amount: "₹94,250",
    location: "Udhampur, J&K",
    message:
      "I love spending my free time on Rush App. It is an excellent platform to play games and win money.",
    avatar: "/avatars/rajesh.png",
  },
  {
    id: 5,
    name: "Aman Kumar",
    verified: true,
    amount: "₹74,250",
    location: "Khagaria, Bihar",
    message:
      "Rush App mein ₹70,000 se zyaada jeeta hai. Iss app ka graphics best hai jo gaming experience ko acha karta hai!",
    avatar: "/avatars/aman.png",
  },
];

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-[#2a1245] rounded-3xl p-6 relative">
      <p className="text-[#FFE500] text-sm mb-6 min-h-[60px]">
        {review.message}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-medium">
              {review.name}
              {review.verified && (
                <span className="inline-block ml-1 text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </h3>
            <span className="text-[#00FF85] text-sm">Won {review.amount}</span>
          </div>
          <p className="text-white/60 text-xs mt-1">{review.location}</p>
        </div>
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  return (
    <section className="bg-brandBg py-12">
      <div className="max-w-[1500px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
