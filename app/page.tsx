import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
    Hello world from Govind Gupta 

    <div>
      <Image src="https://avatars.githubusercontent.com/u/119047426?v=4" alt="Vercel Logo" width={272} height={72} priority />
    </div>
    </div>
  );
}
