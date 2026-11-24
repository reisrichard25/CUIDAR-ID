import SiteContent from "../../site-content";
export const metadata = { title: "Ficha de identificação | Cuidar ID", robots: { index: false, follow: false } };
export default async function Page({params}: {params: Promise<{id:string}>}) { const {id}=await params; return <SiteContent profileId={id} />; }
