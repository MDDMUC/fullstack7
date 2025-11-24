'use client'

import { FormEvent, useState } from 'react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import BackButton from '../components/BackButton'

export default function NameAgeGenderStep() {
  const { data, updateData, setCurrentStep } = useOnboarding()
  const [name, setName] = useState(data.name || '')
  const [age, setAge] = useState(data.age || '')
  const [gender, setGender] = useState<'Man' | 'Woman' | 'Other' | ''>(data.gender || '')
  const [bio, setBio] = useState(data.bio || '')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim() || !age.trim() || !gender) return

    updateData({ name, age, gender: gender as 'Man' | 'Woman' | 'Other', bio })
    setCurrentStep(4)
  }

  return (
    <div className="bg-white flex flex-col gap-4 items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 md:py-20 lg:py-24 min-h-screen w-full relative">
      <BackButton />
      <p className="font-normal leading-normal text-[20px] text-black text-center max-w-2xl">
        My Name is
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center justify-center w-full max-w-md">
        <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
            placeholder="Name"
            required
          />
        </div>

        <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center">
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
            placeholder="Age"
            required
            min="18"
            max="100"
          />
        </div>

        <div className="flex gap-4 items-start justify-center w-full">
          <button
            type="button"
            onClick={() => setGender('Man')}
            className="bg-white border border-[#020202] h-14 relative rounded-[4px] flex-1 flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-normal leading-6 text-[#757575] text-base">Man</span>
            <div className="w-6 h-6 rounded-full border-2 border-[#020202] flex items-center justify-center flex-shrink-0">
              {gender === 'Man' && (
                <div className="w-3 h-3 rounded-full bg-[#020202]"></div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setGender('Woman')}
            className="bg-white border border-[#020202] h-14 relative rounded-[4px] flex-1 flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-normal leading-6 text-[#757575] text-base">Woman</span>
            <div className="w-6 h-6 rounded-full border-2 border-[#020202] flex items-center justify-center flex-shrink-0">
              {gender === 'Woman' && (
                <div className="w-3 h-3 rounded-full bg-[#020202]"></div>
              )}
            </div>
          </button>
        </div>

        <div className="bg-white border border-[#020202] h-14 relative rounded-[4px] w-full flex items-center">
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-full px-4 bg-transparent border-none outline-none text-[#757575] text-base placeholder:text-[#757575]"
            placeholder="Short bio (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim() || !age.trim() || !gender}
          className="bg-[#212121] flex items-center justify-center px-6 py-4 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a2a2a] transition-colors w-full"
        >
          <span className="font-medium leading-4 text-base text-white tracking-[1.25px] uppercase">
            CONTINUE 2/7
          </span>
        </button>
      </form>
    </div>
  )
}

