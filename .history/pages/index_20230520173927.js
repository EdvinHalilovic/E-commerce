import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const {data: session}= useSession();
  return <Layout>
    <div className="text-blue-900 flex">
      <h2> Selam alejk , {session?.user?.name}</h2>
      <div>
      <img src={session?.user?.image}></img>
      </div>
      
    </div>
  </Layout>
  

}