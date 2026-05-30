// import Image from "next/image";
import dynamic from "next/dynamic";

//
/*
lazy loading client component in Next.js faster initial load time
(It allows you to defer loading of Client Components and imported libraries, 
and only include them in the client bundle when they're needed. For example, you 
might want to defer loading a modal until a user clicks to open it.)
*/
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
