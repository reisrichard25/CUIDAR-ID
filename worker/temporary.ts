const rows = {
 name:"Nome",age:"Idade",allergies:"Alergias declaradas",communication:"Como se comunicar",
 preferredName:"Como prefere ser chamada",disability:"Pessoa com deficiência",mobility:"Mobilidade",
 medicines:"Medicamentos de uso contínuo",currentTreatment:"Medicamentos do tratamento atual",
 conditions:"Condições relevantes",bloodType:"Tipo sanguíneo declarado · exige confirmação clínica",
 contact:"Contato de emergência fictício",contactPhone:"Telefone fictício"
};
const headers={"Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"};
const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function page(body:string,status=200){return new Response('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ficha temporária | Cuidar ID</title><style>*{box-sizing:border-box}body{margin:auto;padding:24px 16px;max-width:40rem;background:#f4f7fa;color:#16293b;font:1.1rem/1.5 system-ui;overflow-wrap:anywhere}main{background:white;border-radius:18px;padding:20px}h1{line-height:1.15}h2{font-size:1rem;margin-bottom:0}p{margin-top:.25rem}.alert{background:#fff2dd;border-left:4px solid #9a5900;padding:12px}a{color:#124e82}</style><main><strong>Cuidar ID · Demonstração</strong>'+body+'</main></html>',{status,headers:{...headers,"Content-Type":"text/html; charset=utf-8"}})}
export async function temporary(req:Request,kv:KVNamespace){
 const u=new URL(req.url);
 if(u.pathname==="/api/temporarias"){
  if(req.method!=="POST" || req.headers.get("Origin")!==u.origin || !req.headers.get("Content-Type")?.startsWith("application/json"))return new Response(null,{status:403});
  if(Number(req.headers.get("Content-Length")||0)>32000)return new Response(null,{status:413});
  const raw=await req.text();if(raw.length>16000)return new Response(null,{status:413});
  let input;try{input=JSON.parse(raw)}catch{return new Response(null,{status:400})}
  if(!input || input.fictional!==true || !input.name?.trim?.())return new Response(null,{status:400});
  const data:Record<string,string>={};for(const k of Object.keys(rows)){if(typeof input[k]!=="string"||input[k].length>500)return new Response(null,{status:400});data[k]=input[k].trim()}
  const id=crypto.randomUUID(),expires=Date.now()+3600000;
  await kv.put(id,JSON.stringify({data,expires}),{expirationTtl:3600});
  return Response.json({path:"/temporaria/"+id,expires},{status:201,headers});
 }
 const id=u.pathname.slice("/temporaria/".length);
 const record=/^[a-f0-9-]{36}$/.test(id)?await kv.get<{data:Record<string,string>,expires:number}>(id,"json"):null;
 if(!record||Date.now()>=record.expires)return page('<h1>Ficha indisponível</h1><p>O link pode ter expirado ou estar incorreto. Se acabou de escanear, tente novamente em alguns segundos.</p>',404);
 const d=record.data;
 return page('<h1>'+esc(d.name)+'</h1><p>'+esc(d.age)+' · Perfil fictício</p>'+Object.entries(rows).slice(2).map(([k,label])=>'<section'+(k==='allergies'?' class="alert"':'')+'><h2>'+label+'</h2><p>'+esc(d[k])+'</p></section>').join('')+'<hr><p>Informações fictícias para demonstração educacional.</p><a href="/">Conhecer o Cuidar ID</a>');
}
