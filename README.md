# Cuidar ID — Farmácia Inteligente

Protótipo educacional para a Feira de Ciências 2026. Uma pulseira com QR Code abre uma ficha fictícia com identificação, informações declaradas de saúde, preferências de comunicação e contato de emergência simulado.

Todos os nomes, telefones e dados de saúde desta versão são fictícios. O projeto não é prontuário, diagnóstico, prescrição ou serviço de emergência.

## Experiência disponível

- Página inicial e páginas próprias de funcionamento, acessibilidade, segurança e projeto.
- Cinco perfis de demonstração em `/id/001` a `/id/005`.
- QR Codes gerados para os perfis de demonstração.
- Ficha fictícia com QR Code gerado no navegador. O Worker guarda apenas os campos de demonstração compartilháveis no KV TEMP por uma hora. CPF, hash e data de nascimento ficam fora do link e do KV.
- Layout responsivo para celular, tablet e computador.

O painel administrativo foi preservado no código, mas está desativado nesta edição pública. Ele dependia do login e do banco da hospedagem anterior. A demonstração da feira não depende desse painel.

## Executar localmente

Requer Node.js 22.13 ou superior.

```bash
npm ci
npm run dev
```

Para verificar a versão de produção:

```bash
npm run build
node --test tests/rendered-html.test.mjs tests/routes.test.mjs tests/profiles.test.mjs
```

## Publicar na Cloudflare Workers

O repositório contém `wrangler.jsonc` e usa o plugin oficial da Cloudflare para Vite. No painel da Cloudflare, conecte este repositório e configure:

- Branch de produção: `main`
- Comando de build: `npm run build`
- Comando de deploy: `npx wrangler deploy`
- Diretório raiz: `/`

O build cria `dist/client` e `dist/server`, incluindo a configuração de deploy ajustada aos artefatos. Não envie `dist`, `node_modules`, `.env` ou `.dev.vars` ao GitHub.

O endereço gratuito terá o formato `cuidar-id.<subdominio-da-conta>.workers.dev`. Gere ou imprima os QR Codes definitivos somente depois de confirmar esse endereço e testar todas as cinco fichas.

## Estrutura principal

- `app/`: páginas e componentes da interface.
- `worker/`: entrada do Cloudflare Worker e API preservada.
- `public/`: ícones públicos.
- `tests/`: testes de rotas, HTML e ciclo de vida da API.
- `wrangler.jsonc`: configuração da Cloudflare.

## Privacidade

Não publique dados médicos reais, CPF, credenciais, tokens ou senhas. Um QR Code público pode ser lido por qualquer pessoa que tenha acesso ao endereço. Uma implantação real precisaria de autenticação, banco protegido, controle de acesso, governança, atualização das informações e revisão jurídica e clínica.

Equipe: Richard, Beatriz, Maria Eduarda, Yasmin Alves e Luciana.
