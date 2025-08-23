import React from "react";
import { Canvas } from "@react-three/fiber";
import Logo from "./components/Logo";
import { Leva } from "leva";

const App = () => {
   return (
      <div className="flex flex-col w-full h-screen">
         {/* Main content */}
         <div className="flex-grow bg-black"></div>

         {/* Footer */}
         <footer className="w-full relative">
            <Leva hidden />
            {/* Bottom-left logo with padding */}
            <div className="absolute bottom-12 left-12 w-28 h-20">
               <Canvas camera={{ position: [0, 0, 1.2] }}>
                  <Logo />
               </Canvas>
            </div>

            {/* Other footer columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-24">
               <div></div>
               <div></div>
               <div></div>
            </div>
         </footer>
      </div>
   );
};

export default App;
