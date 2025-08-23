import { Environment, OrbitControls, Text } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Logo from "./Logo";

export const Experience = () => {
   return (
      <>
         {/* <OrbitControls /> */}
         <Environment preset="city" />
         <ambientLight intensity={0.5} />
         <directionalLight intensity={2} color={"white"} position={[0, 0, 5]} />

         <Logo position={[0, 0, 0]} scale={0.3} />
      </>
   );
};
