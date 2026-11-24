import type { Metadata } from "next";
import TemporaryProfileExperience from "./temporary-profile";

export const metadata: Metadata = {
  title: "Criar ficha temporária | Cuidar ID",
  description: "Simulação local e temporária do processo de criação de uma ficha Cuidar ID.",
};

export default function TemporaryProfilePage() {
  return <TemporaryProfileExperience />;
}
