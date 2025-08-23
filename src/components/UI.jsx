export const UI = () => {
   return (
      <main className="w-screen">
         <Section className="flex flex-col items-center justify-center">
            <a href="https://wawasensei.dev">
               <img src="images/wawasensei-white.png" alt="Wawa Sensei" className="w-30" />
            </a>
            <h1
               className=" text-4xl md:text-8xl font-light text-center text-transparent
        bg-clip-text bg-gradient-to-r  from-gray-100/50 via-white to-gray-100/50 drop-shadow-sm"
            >
               Discover the
               <br />
               Future of Crypto
            </h1>
            <p className="text-center text-white/90 mt-10 text-sm">
               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
               incididunt ut labore et dolore magna.
            </p>
            <button className="mt-10 px-8 py-2 bg-white text-black rounded-full text-sm hover:bg-white/30 hover:text-white cursor-pointer transition-colors duration-300">
               Explore Now
            </button>
         </Section>
         <Section className="flex items-start justify-center flex-col gap-10 relative">
            <h2 className="w-full text-center md:text-left text-3xl md:text-6xl text-white font-extralight">
               Wawa Coin
            </h2>
            <div className="p-4 md:pt-10 rounded-xl bg-gradient-to-br from-gray-500/10 to-orange-300/10 font-light backdrop-blur-md border border-white/20  text-white gap-4 flex flex-col">
               <h3 className="text-3xl md:text-6xl">100%</h3>
               <p className="text-gray-300">One Lifetime Opportunity</p>
               <p className="text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="p-4 md:pt-10 rounded-xl bg-gradient-to-br from-gray-500/10 to-orange-300/10 font-light backdrop-blur-md border border-white/20 text-white gap-4 flex flex-col">
               <h3 className="text-3xl md:text-6xl">+42%</h3>
               <p className="text-gray-300">APY</p>
               <p className="text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="p-4 md:pt-10 rounded-xl bg-gradient-to-br from-gray-500/10 to-orange-300/10 font-light backdrop-blur-md border border-white/20 text-white gap-4 flex flex-col">
               <h3 className="text-3xl md:text-6xl">+420,000</h3>
               <p className="text-gray-300">Transactions</p>
               <p className="text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
         </Section>
         <Section className="flex flex-col items-center justify-end gap-4">
            <h2 className="text-3xl md:text-6xl text-white font-extralight">Our Ecosystem</h2>
            <div className="p-4 md:pt-10 rounded-xl bg-gradient-to-br from-gray-500/10 to-orange-300/10 font-light backdrop-blur-md border border-white/20 text-white gap-4 flex flex-col">
               <h2 className="text-3xl md:text-6xl">+7,420,000</h2>
               <p className="text-gray-300">Users Around the World</p>
               <p className="text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
         </Section>
         <Section className="flex flex-col items-center justify-end gap-4">
            <h2 className="text-3xl md:text-6xl text-white font-extralight">Ultimate Card</h2>
            <div className="p-4 md:pt-10 rounded-xl bg-gradient-to-br from-gray-500/10 to-orange-300/10 font-light backdrop-blur-md border border-white/20 text-white gap-4 flex flex-col">
               <h2 className="text-3xl md:text-6xl">Beyond The Limit</h2>
               <p className="text-gray-300">Purchase Your Groceries with WawaCoin</p>
               <p className="text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
         </Section>
      </main>
   );
};

const Section = ({ children, className = "" }) => {
   return (
      <section className={`max-w-[1024px] mx-auto h-screen p-10 ${className}`}>{children}</section>
   );
};
