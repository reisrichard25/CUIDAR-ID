type Statement = { bind(...args: unknown[]): Statement; first(): Promise<any>; all(): Promise<any>; run(): Promise<any> };
type Database = { prepare(sql: string): Statement };
const fields = ['name','age','bloodType','allergies','conditions','medicines','currentTreatment','communication','contact'] as const;
const json = (body: unknown, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
function admin(r: Request, ownerEmail?: string) { return !!ownerEmail && !!r.headers.get('oai-authenticated-user-id') && r.headers.get('oai-authenticated-user-email')?.toLowerCase() === ownerEmail.toLowerCase(); }
function view(row: any) { return {...JSON.parse(row.data), slug:row.id, active:!!row.active, revision:row.revision, updated:row.updated}; }
export async function profilesAPI(r: Request, db?: Database, ownerEmail?: string): Promise<Response> {
 const url = new URL(r.url), path = url.pathname;
 if(path === '/api/session') return json({admin:admin(r, ownerEmail)});
 const publicMatch = path.match(/^\/api\/public\/profiles\/([a-f0-9-]{36})$/);
 const privateMatch = path.match(/^\/api\/profiles\/([a-f0-9-]{36})$/);
 const collection = path === '/api/profiles';
 if (!publicMatch && !privateMatch && !collection) return json({error:'Não encontrado.'},404);
 if (!publicMatch && !admin(r, ownerEmail)) return json({error:'Entre com a conta do administrador.'},403);
 if (publicMatch && r.method !== 'GET') return json({error:'Método não permitido.'},405);
 if (!['GET','POST','PUT','DELETE'].includes(r.method)) return json({error:'Método não permitido.'},405);
 if(r.method !== 'GET') {
  if(r.headers.get('Origin') !== url.origin) return json({error:'Origem inválida.'},403);
  if(!r.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Formato inválido.'},415);
 }
 if(!db) return json({error:'Armazenamento indisponível. Tente novamente.'},503);
 try {
  if(publicMatch) {
   const row = await db.prepare('SELECT * FROM profiles WHERE id = ? AND active = 1').bind(publicMatch[1]).first();
   return row ? json(view(row)) : json({error:'Perfil indisponível. O código pode estar desativado ou não existir.'},404);
  }
  if(r.method === 'GET' && collection) return json((await db.prepare('SELECT * FROM profiles ORDER BY updated DESC LIMIT 100').all()).results.map(view));
  if(r.method === 'POST' && !collection || r.method === 'PUT' && !privateMatch || r.method === 'DELETE' && !privateMatch || r.method === 'GET') return json({error:'Método não permitido.'},405);
  const raw = await r.text();
  if(raw.length > 12000) return json({error:'Conteúdo muito longo.'},413);
  let input: any; try {input = JSON.parse(raw);} catch {return json({error:'Dados inválidos.'},400);}
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({error:'Dados inválidos.'},400);
  if(r.method === 'DELETE') {
   if(!Number.isInteger(input.revision)) return json({error:'Versão inválida.'},400);
   const result = await db.prepare('DELETE FROM profiles WHERE id = ? AND revision = ?').bind(privateMatch![1], input.revision).run();
   return result.meta.changes ? json({ok:true}) : json({error:'O perfil mudou. Atualize a lista.'},409);
  }
  if(input.fictional !== true) return json({error:'Confirme que todos os dados são fictícios.'},400);
  const data: Record<string,string> = {};
  for(const key of fields) {
   if(input[key] === undefined && (key === 'bloodType' || key === 'currentTreatment')) { data[key] = ''; continue; }
   if(typeof input[key] !== 'string' || input[key].length > (key === 'name' ? 100 : 600)) return json({error:'Revise os campos e o tamanho dos textos.'},400);
   data[key] = input[key].trim();
  }
  if(!data.name || !/^\d{1,3}$/.test(data.age) || Number(data.age)>120) return json({error:'Informe nome e idade entre 0 e 120.'},400);
  data.age += ' anos'; data.initials = data.name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  for(const key of fields) if(!data[key]) data[key] = 'Não informado';
  const updated = new Date().toISOString();
  const id = privateMatch?.[1] || crypto.randomUUID();
  if(r.method === 'POST') {
   await db.prepare('INSERT INTO profiles (id,data,active,revision,updated) VALUES (?,?,1,1,?)').bind(id,JSON.stringify(data),updated).run();
  } else {
   if(!Number.isInteger(input.revision) || typeof input.active !== 'boolean') return json({error:'Versão inválida.'},400);
   const result = await db.prepare('UPDATE profiles SET data=?, active=?, updated=?, revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(data),input.active?1:0,updated,id,input.revision).run();
   if(!result.meta.changes) return json({error:'O perfil mudou em outro aparelho. Atualize a lista antes de editar.'},409);
  }
  return json(view(await db.prepare('SELECT * FROM profiles WHERE id=?').bind(id).first()),r.method==='POST'?201:200);
 } catch(error) { console.error('profiles storage error',error); return json({error:'Não foi possível concluir. Seus campos foram preservados; tente novamente.'},503); }
}
