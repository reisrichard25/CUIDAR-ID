"use client";
import { useEffect, useState } from "react";

const names = ["Helena Martins", "Lucas Costa", "Ana Ribeiro", "Paulo Almeida", "Sofia Lima"];
export default function QRCodes() {
  const [codes, setCodes] = useState<{id:string;name:string;url:string;image:string}[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("qrcode").then(async ({default: QRCode}) => Promise.all(names.map(async (name, index) => {
      const id = String(index + 1).padStart(3, "0");
      const url = `${window.location.origin}/id/${id}`;
      return {id, name, url, image: await QRCode.toDataURL(url, {width:600,margin:4,errorCorrectionLevel:"M"})};
    }))).then(result => {if(!cancelled) setCodes(result);}).catch(() => {if(!cancelled) setError(true);});
    return () => {cancelled = true;};
  }, []);
  return <main className="utility-shell"><section className="section qr-sheet">
    <div className="no-print"><a href="/demonstracao">Voltar aos exemplos</a><h1>QR Codes para a apresentação</h1><p>Todos os perfis são fictícios. Cada código abre uma ficha diferente.</p><p>Antes de imprimir, confirme que está usando o endereço público do projeto. Preserve a margem branca e teste o tamanho impresso com os celulares da equipe.</p><button className="primary-button dark" disabled={codes.length !== 5} onClick={() => window.print()}>Imprimir os cinco códigos</button></div>
    {error && <p role="alert">Não foi possível gerar os códigos. Recarregue a página para tentar novamente.</p>}
    {!error && codes.length === 0 && <p role="status">Preparando os códigos…</p>}
    <div className="qr-sheet-grid">{codes.map(code => <article key={code.id} className="qr-print-card"><p>CUIDAR ID · {code.id}</p><h2>{code.name}</h2><img width={240} height={240} src={code.image} alt={`QR Code para o perfil fictício de ${code.name}`} /><p>Perfil fictício · Demonstração educacional</p><a href={code.url}>{code.url}</a><p className="no-print"><a href={code.image} download={`cuidar-id-${code.id}.png`}>Baixar QR Code {code.id}</a></p></article>)}</div>
  </section></main>;
}
