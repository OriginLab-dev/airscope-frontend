'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { useExperience } from './Experience';

function WireEarth({ enabled }) {
  const group = useRef(null);
  const particles = useMemo(() => {
    const points=new Float32Array(900*3);
    for(let i=0;i<900;i++){
      const phi=Math.acos(1-2*(i+.5)/900),theta=i*2.39996;
      const radius=1.29+.015*Math.sin(i*7);
      points[i*3]=radius*Math.sin(phi)*Math.cos(theta);
      points[i*3+1]=radius*Math.cos(phi);
      points[i*3+2]=radius*Math.sin(phi)*Math.sin(theta);
    }
    return points;
  },[]);
  useFrame(({ clock, pointer }, delta) => {
    if (group.current && enabled) {
      group.current.rotation.y += Math.min(delta,.05)*.12;
      group.current.rotation.x += (pointer.y*.15-group.current.rotation.x)*.025;
      group.current.rotation.z = Math.sin(clock.getElapsedTime()*.25)*.06+pointer.x*.06;
    }
  });
  return <group ref={group}>
    <mesh><sphereGeometry args={[1.23,48,32]}/><meshStandardMaterial color="#bdd9c6" metalness={.25} roughness={.25}/></mesh>
    <mesh><sphereGeometry args={[1.27, 24, 16]} /><meshBasicMaterial color="#238c57" wireframe transparent opacity={.16} /></mesh>
    <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial color="#237f4d" size={.019} transparent opacity={.7}/></points>
    {[[1.7,.35,.2],[-1.55,-.6,.25],[.8,1.5,-.3]].map((position,index)=><mesh key={index} position={position}><sphereGeometry args={[.06+index*.025,16,16]}/><meshStandardMaterial color="#38b96c" metalness={.35} roughness={.2}/></mesh>)}
    {[-.62, 0, .62].map((tilt, index) => <mesh key={tilt} rotation={[tilt, index * .55, Math.PI / 2]}><torusGeometry args={[1.62 + index * .08, .008, 8, 100]} /><meshBasicMaterial color="#0b9d7b" transparent opacity={.47} /></mesh>)}
    <mesh rotation={[Math.PI / 2.65, .28, -.55]}><torusGeometry args={[1.72, .009, 8, 100]} /><meshBasicMaterial color="#0b9d7b" transparent opacity={.54} /></mesh>
    <mesh rotation={[-Math.PI / 3.2, -.55, .35]}><torusGeometry args={[1.7, .009, 8, 100]} /><meshBasicMaterial color="#80ceb8" transparent opacity={.43} /></mesh>
  </group>;
}

export default function AirField() {
  const { enabled } = useExperience();
  return <div aria-hidden="true" className="absolute inset-0"><Canvas frameloop={enabled?'always':'demand'} dpr={[1, 1.5]} camera={{ position:[0, 0, 5.6], fov:44 }}><ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={3}/><pointLight position={[-3,-1,2]} intensity={8} color="#7fe4ac"/><WireEarth enabled={enabled}/></Canvas></div>;
}
