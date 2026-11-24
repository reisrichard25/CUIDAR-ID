import assert from 'node:assert/strict';
import {test} from 'node:test';
import worker from '../dist/server/index.js';
const env = {ASSETS:{fetch:async()=>new Response('Not found',{status:404})}};
const ctx = {waitUntil(){},passThroughOnException(){}};
const pages = {'/':'Informações de saúde','/como-funciona':'Como funciona o Cuidar ID','/acessibilidade':'Uma interface que não exige aprendizado','/seguranca':'Informação com responsabilidade','/sobre':'Tecnologia para facilitar','/demonstracao':'Veja como a ficha aparece','/qr-codes':'QR Codes para a apresentação','/painel':'Gerenciar fichas','/criar-ficha':'Crie uma ficha de demonstração','/id/001':'Helena Martins','/id/002':'Lucas Costa','/id/003':'Ana Ribeiro','/id/004':'Paulo Almeida','/id/005':'Sofia Lima','/perfil/helena-demo':'Helena Martins'};
for(const [path,text] of Object.entries(pages)) test(`renders ${path}`,async()=>{
 const response=await worker.fetch(new Request(`https://example.test${path}`,{headers:{accept:'text/html'}}),env,ctx);
 assert.equal(response.status,200); const html=await response.text(); assert.ok(html.includes(text)); assert.match(html,/<html[^>]*lang="pt-BR"/);
});
test('profile shows identification, support guidance and fictitious emergency phone',async()=>{
 const response=await worker.fetch(new Request('https://example.test/id/004',{headers:{accept:'text/html'}}),env,ctx);
 const html=await response.text(); assert.ok(html.includes('Pessoa com deficiência')); assert.ok(html.includes('deficiência visual')); assert.ok(html.includes('(11) 90000-0104')); assert.ok(html.includes('CID-004')); assert.ok(html.includes('Como ajudar agora')); assert.ok(html.includes('Mobilidade e condução')); assert.ok(html.includes('Tipo sanguíneo informado')); assert.ok(html.includes('O−')); assert.ok(html.includes('Medicamentos do tratamento atual')); assert.ok(html.includes('confirmado por exame'));
});
test('anonymous cannot list stored profiles',async()=>{
 const response=await worker.fetch(new Request('https://example.test/api/profiles'),env,ctx);assert.equal(response.status,403);
});
