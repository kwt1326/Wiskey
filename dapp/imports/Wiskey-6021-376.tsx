import imgImage11 from "figma:asset/7dcae1c8ab7fcb2e14f0ff9c9de168d51476715b.png";

function Frame48095455() {
  return (
    <div className="absolute bg-[#b8621f] box-border content-stretch flex gap-[10px] items-start left-[24px] px-[115px] py-[14px] rounded-[16px] top-[724px] w-[327px]">
      <div className="flex flex-col font-['Poppins:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre">Get Started</p>
      </div>
    </div>
  );
}

function GetStartedButton() {
  return (
    <div className="absolute contents left-[24px] top-[724px]" data-name="getStartedButton">
      <Frame48095455 />
    </div>
  );
}

export default function Wiskey() {
  return (
    <div className="bg-[#070707] relative size-full" data-name="Wiskey">
      <div className="absolute font-['Poppins:SemiBold',_sans-serif] leading-[1.5] left-[12px] not-italic text-[32px] text-white top-[518px] tracking-[-0.64px] w-[351px]">
        <p className="mb-0">Ask with coins</p>
        <p>Answer with wisdom</p>
      </div>
      <GetStartedButton />
      <div className="absolute flex flex-col font-['Poppins:Medium',_sans-serif] justify-center leading-[0] left-[12px] not-italic text-[14px] text-white top-[647px] translate-y-[-50%] w-[372px]">
        <p className="leading-[1.5]">
          Bet your coin on what you want to know,
          <br aria-hidden="true" />
          {` and get rewarded for what you know.`}
        </p>
      </div>
      <div className="absolute flex flex-col font-['Poppins:Bold',_sans-serif] justify-center leading-[0] left-[24px] not-italic text-[64px] text-nowrap text-white top-[108px] translate-y-[-50%]">
        <p className="leading-[normal] whitespace-pre">
          Wiske<span className="text-[#b8621f]">y</span>
        </p>
      </div>
      <div className="absolute h-[418px] left-[34px] top-[135px] w-[393px]" data-name="image (1) 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
    </div>
  );
}