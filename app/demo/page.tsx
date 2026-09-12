import Link from "next/link";
import { PlatformApp } from "@/components/platform-app";
export default function DemoPage() { return <><div className="bg-brand-soft p-2 text-center text-xs">Demonstração fictícia · dados somente neste navegador · <Link href="/" className="underline">Área persistente</Link></div><PlatformApp /></>; }
