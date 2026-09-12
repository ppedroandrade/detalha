import { PersistentPlatform } from "@/components/persistent-platform";
import { PlatformApp } from "@/components/platform-app";
import { config } from "@/lib/server/config";
export const dynamic = 'force-dynamic';
export default function HomePage() {
  const { mode } = config();
  return mode === 'demo' ? <PlatformApp /> : <PersistentPlatform local={mode === 'local'} />;
}
