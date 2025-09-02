import { Canvas } from "@react-three/fiber";
import Logo from "./components/Logo";

const App = () => {
   return (
      <div className="w-full h-screen bg-transparent">
         <Canvas camera={{ position: [0, 0, 4] }}>
            <Logo />
         </Canvas>
      </div>
   );
};

export default App;
