const faqs = [
  {
    id: 1,
    question: "Where can I play money winning games?",
    answer:
      "You can play money winning games on Rush App. Download the app, create an account, and start playing to win real cash.",
  },
  {
    id: 2,
    question: "Is it safe to play real money games on Rush?",
    answer:
      "Yes, Rush App is completely safe and secure for playing real money games. We use advanced security measures to protect your data and transactions.",
  },
  {
    id: 3,
    question: "Can I play online cash games and win real money on Rush?",
    answer:
      "Yes, you can win real money by playing online cash games on Rush. We offer various games where you can compete and win cash prizes.",
  },
  {
    id: 4,
    question: "Can I withdraw cash from money winning apps?",
    answer:
      "Yes, you can easily withdraw your winnings from Rush App directly to your bank account. We support multiple payment methods for quick withdrawals.",
  },
];

const FaqSection = () => {
  return (
    <section className="bg-brandBg py-12">
      <div className="max-w-[1500px] mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-[#00FF85] text-lg font-medium mb-0.5">
            MORE QUESTIONS?
          </h3>
          <h2 className="text-[#FFB6C1] text-3xl md:text-4xl font-bold">
            Here are our FAQ's
          </h2>
        </div>

        {/* FAQ List */}
        <div className="relative p-[2px] rounded-[2rem] bg-gradient-to-b from-[#3b1e54] to-transparent">
          {/* Glow effects */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-16 w-[120%] bg-[#3b1e54] blur-2xl -z-10 opacity-40" />

          <div className="bg-[#2a1245]/60 backdrop-blur-sm rounded-[1.9rem] p-3 md:p-4">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="relative">
                <details className="group [&[open]>summary]:mb-0.5">
                  <summary className="flex items-center justify-between gap-3 p-3 md:p-4 rounded-[2rem] cursor-pointer list-none">
                    <h3 className="text-white text-xl font-medium">
                      {faq.question}
                    </h3>
                    <span className="text-white bg-[#3b1e54] rounded-full p-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 transition-transform group-open:rotate-180"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="p-3 md:p-4">
                    <p className="text-white/60 text-lg">{faq.answer}</p>
                  </div>
                </details>
                {index !== faqs.length - 1 && (
                  <hr className="border-t border-[#3b1e54] my-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
