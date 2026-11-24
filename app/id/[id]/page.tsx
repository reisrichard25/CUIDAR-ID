import { notFound } from "next/navigation";
import SiteContent from "../../site-content";
export const metadata = { title: "Perfil fictício | Cuidar ID", robots: { index: false, follow: false } };
export default async function Page({params}: {params: Promise<{id:string}>}) {
  const {id} = await params;
  if (!/^00[1-5]$/.test(id)) notFound();
  return <SiteContent profileId={id} />;
}
