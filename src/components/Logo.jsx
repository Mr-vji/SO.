import { Text, shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";

const TriangleCutoutMaterial = shaderMaterial(
   {
      uTime: 0,
      uNumLayers: 12,
      uSpeed: 0.2,
      uTriangleSize: 0.06,
      uColorIntensity: 1.4,
      uOpacity: 1.0,
      uRotationSpeed: 0.3,
      uScaleVariation: 0.8,
      uGridDensity: 8.0,
      uRadiusVariation: 0.4,
      uSizeVariation: 0.6,
      uMovementComplexity: 1.0,
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
    uniform float uRadiusVariation;
    uniform float uSizeVariation;
    uniform float uMovementComplexity;
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

    vec4 hash4(vec2 p) {
      vec4 q = vec4(
        dot(p, vec2(127.1, 311.7)), 
        dot(p, vec2(269.5, 183.3)), 
        dot(p, vec2(419.2, 371.9)),
        dot(p, vec2(491.8, 203.4))
      );
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
      
      // Enhanced color palette
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

    // Generate complex movement pattern for each triangle
    vec2 generateMovement(vec2 cellId, float layerFloat, float time) {
      vec4 randomValues = hash4(cellId + layerFloat * 17.83);
      
      // Different movement types based on random value
      float movementType = randomValues.x;
      vec2 movement = vec2(0.0);
      
      // Type 1: Circular motion with varying radius
      if (movementType < 0.25) {
        float radius = 0.05 + randomValues.y * uRadiusVariation * 0.1;
        float speed = 0.5 + randomValues.z * 2.0;
        float phase = randomValues.w * 6.28;
        
        // Pulsating radius
        float radiusModulation = 1.0 + sin(time * speed * 2.0 + phase) * 0.3;
        radius *= radiusModulation;
        
        movement = vec2(
          cos(time * speed + phase) * radius,
          sin(time * speed + phase) * radius
        );
      }
      // Type 2: Figure-8 motion
      else if (movementType < 0.5) {
        float speed = 0.3 + randomValues.z * 1.5;
        float phase = randomValues.w * 6.28;
        float scale = 0.03 + randomValues.y * 0.05;
        
        movement = vec2(
          sin(time * speed + phase) * scale,
          sin(time * speed * 2.0 + phase) * scale * 0.5
        );
      }
      // Type 3: Spiral motion
      else if (movementType < 0.75) {
        float speed = 0.2 + randomValues.z * 1.0;
        float phase = randomValues.w * 6.28;
        float spiralRadius = time * 0.01 + randomValues.y * 0.02;
        spiralRadius = mod(spiralRadius, 0.08);
        
        movement = vec2(
          cos(time * speed + phase) * spiralRadius,
          sin(time * speed + phase) * spiralRadius
        );
      }
      // Type 4: Random walk with smooth transitions
      else {
        float speed = 0.1 + randomValues.z * 0.5;
        vec2 target1 = (hash2(cellId + floor(time * speed)) - 0.5) * 0.08;
        vec2 target2 = (hash2(cellId + floor(time * speed) + 1.0) - 0.5) * 0.08;
        float t = smoothstep(0.0, 1.0, fract(time * speed));
        
        movement = mix(target1, target2, t);
      }
      
      return movement * uMovementComplexity;
    }

    void main() {
      vec2 p = vUv - 0.5;
      vec3 finalColor = vec3(0.08, 0.08, 0.12);
      
      for(int layer = 0; layer < 3; layer++) {
        if(layer >= uNumLayers) break;
        
        float layerFloat = float(layer);
        float time = uTime * uSpeed;
        
        // Grid of triangles
        vec2 gridSize = vec2(uGridDensity, uGridDensity * 0.8);
        
        for(float x = 0.0; x < gridSize.x; x += 1.0) {
          for(float y = 0.0; y < gridSize.y; y += 1.0) {
            vec2 cellId = vec2(x, y);
            vec2 basePos = (cellId / gridSize) - 0.5;
            
            // Random offset for initial position
            vec2 triangleOffset = hash2(cellId + layerFloat * 23.0) - 0.5;
            triangleOffset *= 0.08;
            
            // Generate complex movement
            vec2 dynamicMovement = generateMovement(cellId, layerFloat, time);
            
            // Add layer-wide movement
            vec2 layerMovement = vec2(
              sin(time + layerFloat * 2.0) * 0.02,
              cos(time * 0.9 + layerFloat * 2.0) * 0.015
            );
            
            vec2 trianglePos = basePos + triangleOffset + dynamicMovement + layerMovement;
            
            // Distance from pixel to triangle center
            vec2 triangleUV = p - trianglePos;
            
            // Dynamic triangle size with variation
            vec4 sizeRandoms = hash4(cellId + layerFloat * 31.41);
            
            // Base size with random variation
            float sizeMultiplier = 0.5 + sizeRandoms.x * uSizeVariation * 1.5;
            
            // Pulsating size effect
            float pulsation = 1.0 + sin(time * (1.0 + sizeRandoms.y * 2.0) + sizeRandoms.z * 6.28) * 0.2;
            
            // Some triangles grow and shrink more dramatically
            if (sizeRandoms.w > 0.8) {
              pulsation = 1.0 + sin(time * 0.5 + sizeRandoms.z * 6.28) * 0.6;
            }
            
            float triangleSize = uTriangleSize * sizeMultiplier * pulsation;
            
            // Dynamic rotation with varying speeds
            float baseRotation = hash(cellId.x * 7.0 + cellId.y * 11.0 + layerFloat * 19.0) * 6.28;
            float rotationSpeed = 0.2 + hash(cellId.x + cellId.y + layerFloat) * 1.5;
            
            // Some triangles rotate in opposite direction
            if (sizeRandoms.y > 0.5) rotationSpeed *= -1.0;
            
            float rotation = baseRotation + time * uRotationSpeed * rotationSpeed;
            triangleUV = rotate(triangleUV, rotation);
            
            // Check if we're inside this triangle
            float triangleDist = triangleSDF(triangleUV, triangleSize);
            
            if(triangleDist <= 0.0) {
              // Generate color for this triangle
              vec3 triangleColor = generateColor(basePos + cellId, layerFloat);
              
              // Add some brightness variation based on movement
              float brightness = 1.0 + sin(time * 2.0 + length(dynamicMovement) * 10.0) * 0.1;
              triangleColor *= brightness;
              
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

// ____________________________________________________DOT color white___________________________________________________________________;

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
    gl_FragColor = vec4(1.0); // white color
  }
  `
);

extend({ WhiteDot });

// ___________________________________________________DOT color Black_______________________________________________________________________;

const BlackDot = shaderMaterial(
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
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // black color
    }
  `
);

extend({ BlackDot });

// __________________________________________________________________________________________________________________________;

export default function Logo(props) {
   const shaderRef = useRef();
   useFrame((state) => {
      if (shaderRef.current) {
         shaderRef.current.uTime = state.clock.elapsedTime;
         shaderRef.current.uNumLayers = 12;
         shaderRef.current.uSpeed = 0.56;
         shaderRef.current.uTriangleSize = 0.16;
         shaderRef.current.uColorIntensity = 1.0;
         shaderRef.current.uRotationSpeed = 2.0;
         shaderRef.current.uScaleVariation = 0.15;
         shaderRef.current.uGridDensity = 22;
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
            scale={1.08}
            font="/fonts/fonnts.com-Area_Normal_Black.otf"
         >
            .{/* <whiteDot attach="material" /> */}
            <blackDot attach="material" />
         </Text>
      </group>
   );
}
