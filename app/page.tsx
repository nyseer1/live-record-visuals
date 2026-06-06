// import Image from "next/image";
import dynamic from "next/dynamic";

//lazy loading client component in Next.js faster initial load time (loads Client Components and imported libraries only when needed)

const TonejsContainer = dynamic(() => import("./ToneJSContainer"));

export default function Home() {
  return (
    <>
      <a href="https://nyseer-portfolio.vercel.app/">Nyseer</a>
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <TonejsContainer></TonejsContainer>
      </div>
    </>
  );
}
