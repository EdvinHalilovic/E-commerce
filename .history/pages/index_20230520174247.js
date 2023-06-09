import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const {data: session}= useSession();
  return <Layout>
    <div className="text-blue-900 flex justify-between">
      <h2> Selam alejk , {session?.user?.name}</h2>
      <div className="flex bg-gray-300 gap-1 text-black">
      <img src={session?.user?.image} className="w-8 h-6"></img>
      <span className="py-1 px-2">{session?.user?.name}</span>
      
      </div>
      
    </div>
  </Layout>
  

}