import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";

export function Title() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden my-4">
      <VelocityScroll>T<span className="text-primary">2</span>MS</VelocityScroll>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
    </div>
  );
}
