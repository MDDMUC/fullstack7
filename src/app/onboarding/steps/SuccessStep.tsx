'use client'

export default function SuccessStep() {

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full">
      <div className="flex gap-2 items-center justify-center px-4 py-0 w-full max-w-2xl">
        <h1 className="font-bold leading-[41px] text-[#020202] text-[34px] text-nowrap tracking-[0.374px]">
          Success
        </h1>
      </div>
      
      <p className="font-normal leading-normal text-[20px] text-black text-center text-nowrap max-w-2xl">
        All done!
      </p>
      
      <p className="font-normal leading-normal text-[20px] text-black text-center text-nowrap max-w-2xl">
        Welcome to the crew
      </p>
    </div>
  )
}

