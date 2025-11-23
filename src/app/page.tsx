'use client'

import Image from "next/image";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('profiles').select();
      console.log('data:', data);
      console.log('error:', error);
    };
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-10 text-xl">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Your Dating App</h1>
        <p>Check your browser console for Supabase output 👀</p>
        {/* You can keep the Next.js starter images or replace them: */}
        <Image
          src="/vercel.svg"
          alt="Vercel Logo"
          width={100}
          height={24}
        />
      </div>
    </main>
  );
}
