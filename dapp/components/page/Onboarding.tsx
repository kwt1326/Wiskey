'use client'

import React from 'react';
import { motion } from 'framer-motion';
import svgPaths from "../../imports/svg-ma27x3m68b";
import wiskey from "/public/wiskey.png";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OnboardingProps {
  homePath: string;
}

function Wiskey() {
  return (
    <div className="absolute h-[56px] left-0 top-0 w-[200px]" data-name="Wiskey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 56">
        <defs>
          <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8611E" />
            <stop offset="100%" stopColor="#D08C3A" />
          </linearGradient>
        </defs>
        <g id="Wiskey">
          <path d={svgPaths.p17504380} fill="#B8611E" id="Vector" />
          <path d={svgPaths.p167744b0} fill="white" id="Vector_2" />
          <path d={svgPaths.p4802d00} fill="white" id="Vector_3" />
          <path d={svgPaths.p27284c00} fill="white" id="Vector_4" />
          <path d={svgPaths.pda2c0c0} fill="white" id="Vector_5" />
          <path d={svgPaths.p187e74c0} fill="white" id="Vector_6" />
        </g>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="h-[56px] relative shrink-0 w-[200px]" data-name="Logo">
      <Wiskey />
    </div>
  );
}

function LogoWrap() {
  return (
    <div className="relative shrink-0 w-full" data-name="LogoWrap">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[8px] items-start justify-center px-[32px] py-[8px] relative w-full">
          <Logo />
        </div>
      </div>
    </div>
  );
}

function Frame48095456() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start leading-[0] not-italic relative shrink-0 w-full">
      <div className="font-['Poppins:SemiBold',_sans-serif] leading-[1.2] min-w-full relative shrink-0 text-[32px] text-neutral-50 tracking-[-0.64px] w-[min-content] text-luxury-glow">
        <p className="mb-0">Ask with coins</p>
        <p>Answer with wisdom</p>
      </div>
      <div className="flex flex-col font-['Poppins:Regular',_sans-serif] justify-center relative shrink-0 text-[#a0a0a0] text-[14px] text-nowrap">
        <p className="leading-[1.5] whitespace-pre">
          Bet your coin on what you want to know,
          <br aria-hidden="true" />
          and get rewarded for what you know.
        </p>
      </div>
    </div>
  );
}

function Button({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="button-luxury metallic-shine relative rounded-[16px] shrink-0 w-full transition-all hover:shadow-[0_6px_20px_rgba(93,58,255,0.2),0_4px_16px_rgba(184,98,31,0.4)] active:scale-[0.98]" 
      data-name="Button"
    >
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center p-[16px] relative w-full">
          <div className="flex flex-col font-['Poppins:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
            <p className="leading-[24px] whitespace-pre m-0">Get Started</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Frame48095457({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-start px-[24px] py-[32px] relative w-full">
          <Frame48095456 />
          <Button onClick={onGetStarted} />
        </div>
      </div>
    </div>
  );
}

function Frame48095458({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[11px] items-end justify-center left-0 w-[375px]">
      <LogoWrap />
      <div className="h-[380px] relative shrink-0 w-[337px]" data-name="image (1) 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image alt="" className="absolute h-[106.44%] left-0 max-w-none top-[-0.06%] w-[112.76%]" src={wiskey} />
        </div>
      </div>
      <Frame48095457 onGetStarted={onGetStarted} />
    </div>
  );
}

// Floating particles for luxury atmosphere
function FloatingParticles() {
  const [isClient, setIsClient] = React.useState(false);
  const particleColors = ['#D08C3A', '#FFB86B', '#F5D49B'];
  const particleCount = 40; // Number of particles
  
  // Ensure we only generate particles on the client
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Generate random particle configurations
  const particles = React.useMemo(() => {
    if (!isClient) return [];
    return Array.from({ length: particleCount }, (_, i) => {
      const size = Math.random() * 2 + 2; // 2-4px
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      const xPos = Math.random() * 100; // % position
      // Concentrate slightly more particles at bottom (60% chance bottom half)
      const yPos = Math.random() < 0.6 ? Math.random() * 50 + 50 : Math.random() * 100;
      const opacity = Math.random() * 0.5 + 0.2; // 0.2-0.7
      const duration = Math.random() * 10 + 10; // 10-20 seconds
      const delay = Math.random() * 5; // stagger start
      const xDrift = Math.random() * 20 - 10; // Pre-calculate drift
      
      return {
        id: i,
        size,
        color,
        xPos,
        yPos,
        opacity,
        duration,
        delay,
        xDrift,
      };
    });
  }, [isClient]);
  
  if (!isClient) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: `${particle.xPos}%`,
            bottom: `${particle.yPos}%`,
            filter: 'blur(1px)',
          }}
          initial={{
            opacity: 0,
            y: 0,
          }}
          animate={{
            opacity: [0, particle.opacity, particle.opacity, 0],
            y: [-100, -200],
            x: [0, particle.xDrift], // Use pre-calculated drift
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export function Onboarding({ homePath }: OnboardingProps) {
  const router = useRouter();

  return (
    <div
      className="bg-premium-gradient relative size-full w-screen h-screen"
      data-name="Wiskey"
    >
      <FloatingParticles />
      <Frame48095458 onGetStarted={() => router.push(homePath)} />
    </div>
  );
}