import { Canvas } from "@react-three/fiber";
import {
  Float,
  OrbitControls,
  Text,
  Line,
} from "@react-three/drei";

function Node({
  position,
  color,
  label,
}) {
  return (
    <Float
      speed={2}
      floatIntensity={3}
      rotationIntensity={0.4}
    >
      <group position={position}>
        <mesh>
          <sphereGeometry
            args={[2, 64, 64]}
          />

          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
          />
        </mesh>

        <Text
          position={[0, 2.6, 0]}
          fontSize={0.7}
          color="white"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={3} />

      <pointLight
        position={[0, 6, 10]}
        intensity={100}
      />

      {/* CONNECTIONS */}

      <Line
        points={[
          [-26, 0, 0],
          [-13, 0, 0],
        ]}
        color="#3E7C74"
        lineWidth={4}
      />

      <Line
        points={[
          [-13, 0, 0],
          [0, 0, 0],
        ]}
        color="#3E7C74"
        lineWidth={4}
      />

      <Line
        points={[
          [0, 0, 0],
          [13, 0, 0],
        ]}
        color="#3E7C74"
        lineWidth={4}
      />

      <Line
        points={[
          [13, 0, 0],
          [26, 0, 0],
        ]}
        color="#3E7C74"
        lineWidth={4}
      />

      {/* AI CORE */}

      <Float
        speed={1}
        floatIntensity={2}
      >
        <group position={[0, 0, 0]}>
          <mesh>
            <sphereGeometry
              args={[4, 64, 64]}
            />

            <meshStandardMaterial
              color="#3E7C74"
              emissive="#3E7C74"
              emissiveIntensity={2.5}
            />
          </mesh>

          <Text
            position={[0, 0, 4.8]}
            fontSize={1.0}
            color="black"
            //textAlign="centre"
            fontWeight={"bold"}
            // paddingLeft={0.5}
          >
            AI Mentor
          </Text>
        </group>
      </Float>

      {/* LEFT */}

      <Node
        position={[-26, 0, 0]}
        color="#C98A3D"
        label="Knowledge"
      />

      <Node
        position={[-13, 0, 0]}
        color="#3E7C74"
        label="Skills"
      />

      {/* RIGHT */}

      <Node
        position={[13, 0, 0]}
        color="#3E7C74"
        label="Confidence"
      />

      <Node
        position={[26, 0, 0]}
        color="#C98A3D"
        label="Achievement"
      />

      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={5}
      />
    </>
  );
}

function LearningCore3D() {
  return (
    <div className="h-[420px] w-full">
      <Canvas
        camera={{
          position: [0, 0, 32],
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default LearningCore3D;