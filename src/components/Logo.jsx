import { Text, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useControls } from "leva";
import * as THREE from "three";

// Advanced Triangle Cutout Shader
const TriangleCutoutMaterial = shaderMaterial(
   {
      uTime: 0,
      uNumLayers: 12,
      uSpeed: 0.2,
      uTriangleSize: 0.06,
      uColorIntensity: 1.4,
      uOpacity: 1.0,
      uRotationSpeed: 0.3,
      uScaleVariation: 0.0,
      uGridDensity: 8.0,
   },
   // Vertex shader
   `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
   `,
   // Fragment shader
   `
    uniform float uTime;
    uniform int uNumLayers;
    uniform float uSpeed;
    uniform float uTriangleSize;
    uniform float uColorIntensity;
    uniform float uOpacity;
    uniform float uRotationSpeed;
    uniform float uScaleVariation;
    uniform float uGridDensity;
    varying vec2 vUv;

    // Hash functions for randomization
    float hash(float n) {
      return fract(sin(n) * 43758.5453);
    }

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }

    vec3 hash3(vec2 p) {
      vec3 q = vec3(dot(p, vec2(127.1, 311.7)), 
                   dot(p, vec2(269.5, 183.3)), 
                   dot(p, vec2(419.2, 371.9)));
      return fract(sin(q) * 43758.5453);
    }

    // Rotate point around origin
    vec2 rotate(vec2 p, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    }

    // Triangle SDF
    float triangleSDF(vec2 p, float size) {
      p.y += size * 0.3;
      float k = sqrt(3.0);
      p.x = abs(p.x) - size;
      p.y = p.y + size / k;
      if(p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
      p.x -= clamp(p.x, -2.0 * size, 0.0);
      return -length(p) * sign(p.y);
    }

    // Generate vibrant colors matching the reference image
    vec3 generateColor(vec2 pos, float layerIndex) {
      vec3 rand = hash3(pos + layerIndex * 123.456);
      
      // Enhanced color palette to match the reference image
      vec3 colors[12];
      colors[0] = vec3(0.95, 0.15, 0.25);  // Bright Red
      colors[1] = vec3(1.0, 0.35, 0.15);   // Red-Orange
      colors[2] = vec3(1.0, 0.55, 0.05);   // Orange
      colors[3] = vec3(1.0, 0.75, 0.0);    // Yellow-Orange
      colors[4] = vec3(0.95, 0.85, 0.1);   // Yellow
      colors[5] = vec3(0.7, 0.9, 0.15);    // Yellow-Green
      colors[6] = vec3(0.25, 0.8, 0.3);    // Green
      colors[7] = vec3(0.1, 0.75, 0.6);    // Teal
      colors[8] = vec3(0.15, 0.6, 0.9);    // Blue
      colors[9] = vec3(0.25, 0.3, 0.95);   // Deep Blue
      colors[10] = vec3(0.6, 0.2, 0.9);    // Purple
      colors[11] = vec3(0.85, 0.15, 0.7);  // Magenta
      
      int colorIndex = int(rand.x * 12.0);
      vec3 baseColor = colors[colorIndex];
      
      // Add subtle variation while keeping vibrant colors
      baseColor += (rand - 0.5) * 0.15;
      baseColor = clamp(baseColor, 0.1, 1.0);
      
      return baseColor * uColorIntensity;
    }

    void main() {
      vec2 p = vUv - 0.5;
      vec3 finalColor = vec3(0.08, 0.08, 0.12);
      
      // Only 2 layers with stable triangles that just move around
      for(int layer = 0; layer < 3; layer++) {
        if(layer >= uNumLayers) break;
        
        float layerFloat = float(layer);
        
        // Each layer has consistent movement patterns
        float timeOffset = layerFloat * 2.0;
        vec2 layerMovement = vec2(
          sin(uTime * uSpeed + timeOffset) * 0.1,
          cos(uTime * uSpeed * 0.9 + timeOffset) * 0.08
        );
        
        // Fixed triangle size - never changes
        float triangleSize = uTriangleSize;
        
        // Grid of triangles
        vec2 gridSize = vec2(uGridDensity, uGridDensity * 0.8);
        
        for(float x = 0.0; x < gridSize.x; x += 1.0) {
          for(float y = 0.0; y < gridSize.y; y += 1.0) {
            vec2 cellId = vec2(x, y);
            vec2 basePos = (cellId / gridSize) - 0.5;
            
            // Each triangle has its own stable movement pattern
            vec2 triangleOffset = hash2(cellId + layerFloat * 23.0) - 0.5;
            float individualSpeed = 0.5 + hash(cellId.x * 13.0 + cellId.y * 17.0) * 0.5;
            
            vec2 individualMovement = vec2(
              sin(uTime * uSpeed * individualSpeed + cellId.x * 2.0) * 0.05,
              cos(uTime * uSpeed * individualSpeed + cellId.y * 3.0) * 0.04
            );
            
            vec2 trianglePos = basePos + triangleOffset * 0.08 + layerMovement + individualMovement;
            
            // Distance from pixel to triangle center
            vec2 triangleUV = p - trianglePos;
            
            // Stable rotation for each triangle
            float baseRotation = hash(cellId.x * 7.0 + cellId.y * 11.0 + layerFloat * 19.0) * 6.28;
            float rotation = baseRotation + uTime * uRotationSpeed * (0.3 + hash(cellId.x + cellId.y) * 0.4);
            triangleUV = rotate(triangleUV, rotation);
            
            // Check if we're inside this triangle
            float triangleDist = triangleSDF(triangleUV, triangleSize);
            
            if(triangleDist <= 0.0) {
              // Stable color for this triangle
              vec3 triangleColor = generateColor(basePos + cellId, layerFloat);
              finalColor = triangleColor;
            }
          }
        }
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
   `
);

extend({ TriangleCutoutMaterial });

/* dot color */

const WhiteDot = shaderMaterial(
   {},
   // vertex shader
   /*glsl*/ `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
   // fragment shader
   /*glsl*/ `
    void main() {
      gl_FragColor = vec4(1.0); // pure white
    }
  `
);

extend({ WhiteDot });

export default function Logo(props) {
   const shaderRef = useRef();

   // Leva controls
   const {
      numLayers,
      speed,
      triangleSize,
      colorIntensity,
      rotationSpeed,
      scaleVariation,
      gridDensity,
   } = useControls("Triangle Cutout", {
      numLayers: { value: 20, min: 1, max: 20, step: 1 },
      speed: { value: 1.0, min: 0, max: 5, step: 0.01 },
      triangleSize: { value: 0.1, min: 0.01, max: 0.2, step: 0.001 },
      colorIntensity: { value: 1.2, min: 0.5, max: 3, step: 0.1 },
      rotationSpeed: { value: 2.0, min: 0, max: 2, step: 0.1 },
      scaleVariation: { value: 0.5, min: 0, max: 0.5, step: 0.01 },
      gridDensity: { value: 14, min: 4, max: 20, step: 1 },
   });

   useFrame((state) => {
      if (shaderRef.current) {
         shaderRef.current.uTime = state.clock.elapsedTime;
         shaderRef.current.uNumLayers = numLayers;
         shaderRef.current.uSpeed = speed;
         shaderRef.current.uTriangleSize = triangleSize;
         shaderRef.current.uColorIntensity = colorIntensity;
         shaderRef.current.uRotationSpeed = rotationSpeed;
         shaderRef.current.uScaleVariation = scaleVariation;
         shaderRef.current.uGridDensity = gridDensity;
      }
   });

   return (
      <group {...props}>
         <Text font="/fonts/fonnts.com-Area_Normal_Black.otf">
            SO.
            <triangleCutoutMaterial ref={shaderRef} attach="material" />
         </Text>
         <Text
            position={[0.75, 0.03, 0.001]}
            scale={1.075}
            font="/fonts/fonnts.com-Area_Normal_Black.otf"
         >
            .
            <whiteDot attach="material" />
         </Text>
      </group>
   );
}
