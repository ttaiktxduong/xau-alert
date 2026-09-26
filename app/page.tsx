import { Hero } from "./components/home/Hero";
import { LatestTicket } from "./components/home/LatestTicket";
import { Rules } from "./components/home/Rules";
import { Pricing } from "./components/home/Pricing";
import { RiskNfa } from "./components/home/RiskNfa";

export default function Home() {
  return (
    <div className="bg-[#050505] text-white">
      <Hero />
      <LatestTicket />
      <Rules />
      <Pricing />
      <RiskNfa />
    </div>
  );
}
