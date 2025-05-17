import { Metadata } from "next";
import LandingPage from "@/components/LandingPage/LandingPage";


export const metadata: Metadata = {
  title: "Agri",
  description: "",
};
export default function Home() {
  return <LandingPage />;
}

