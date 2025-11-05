import svgPaths from "./svg-ma27x3m68b";
import imgImage11 from "figma:asset/7dcae1c8ab7fcb2e14f0ff9c9de168d51476715b.png";

function Wiskey() {
  return (
    <div className="absolute h-[56px] left-0 top-0 w-[200px]" data-name="Wiskey">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 56">
        <g id="Wiskey">
          <path d={svgPaths.p17504380} fill="var(--fill-0, #B8621F)" id="Vector" />
          <path d={svgPaths.p167744b0} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p4802d00} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p27284c00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.pda2c0c0} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p187e74c0} fill="var(--fill-0, white)" id="Vector_6" />
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
      <div className="font-['Poppins:SemiBold',_sans-serif] leading-[1.2] min-w-full relative shrink-0 text-[32px] text-neutral-50 tracking-[-0.64px] w-[min-content]">
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

function Button() {
  return (
    <div className="bg-[#b8621f] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center p-[16px] relative w-full">
          <div className="flex flex-col font-['Poppins:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white">
            <p className="leading-[24px] whitespace-pre">Get Started</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame48095457() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[48px] items-start px-[24px] py-[32px] relative w-full">
          <Frame48095456 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Frame48095458() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col gap-[11px] items-end justify-center left-0 w-[375px]">
      <LogoWrap />
      <div className="h-[380px] relative shrink-0 w-[337px]" data-name="image (1) 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[106.44%] left-0 max-w-none top-[-0.06%] w-[112.76%]" src={imgImage11} />
        </div>
      </div>
      <Frame48095457 />
    </div>
  );
}

export default function Wiskey1() {
  return (
    <div className="bg-[#070707] relative size-full" data-name="Wiskey">
      <Frame48095458 />
    </div>
  );
}