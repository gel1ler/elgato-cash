import Image from "next/image";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Добро пожаловать</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <a className="border rounded p-6 hover:bg-gray-50" href="/cash">Учет выручки</a>
        <a className="border rounded p-6 hover:bg-gray-50" href="https://nextjs.org" target="_blank">Документация Next.js</a>
      </div>
    </div>
  );
}
