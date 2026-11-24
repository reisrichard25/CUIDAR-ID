"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  slug: string;
  initials: string;
  name: string;
  age: string;
  updated: string;
  allergies: string;
  conditions: string;
  medicines: string;
  currentTreatment?: string;
  bloodType?: string;
  communication: string;
  contact: string;
  contactPhone?: string;
  disability?: string;
  birthDate?: string;
  cuidarId?: string;
  preferredName?: string;
  mobility?: string;
  supportNeeds?: string;
};

const profiles: Profile[] = [
  {
    slug: "helena-demo",
    initials: "HM",
    name: "Helena Martins",
    age: "68 anos",
    updated: "30 de julho de 2026",
    allergies: "Penicilina — informação declarada",
    conditions: "Diabetes tipo 2",
    medicines: "Metformina — uso contínuo declarado",
    currentTreatment: "Nenhum tratamento temporário declarado",
    bloodType: "A+",
    communication: "Fale devagar e faça perguntas simples.",
    contact: "Marina Martins · filha",
    contactPhone: "(11) 90000-0101",
    disability: "Não declarada",
    birthDate: "12 de março de 1958",
    cuidarId: "CID-001",
    preferredName: "Helena",
    mobility: "Caminha sem dispositivo de apoio declarado.",
    supportNeeds: "Pode precisar de mais tempo para compreender perguntas e responder.",
  },
  {
    slug: "lucas-demo",
    initials: "LC",
    name: "Lucas Costa",
    age: "19 anos",
    updated: "30 de julho de 2026",
    allergies: "Nenhuma alergia declarada",
    conditions: "Dificuldade temporária de comunicação",
    medicines: "Nenhum medicamento contínuo declarado",
    currentTreatment: "Amoxicilina — tratamento temporário informado no cadastro",
    bloodType: "O+",
    communication: "Use frases curtas e permita respostas por gestos.",
    contact: "Renata Costa · responsável",
    contactPhone: "(11) 90000-0102",
    disability: "Sim — deficiência intelectual leve",
    birthDate: "7 de agosto de 2007",
    cuidarId: "CID-002",
    preferredName: "Lucas",
    mobility: "Caminha sem dispositivo de apoio declarado.",
    supportNeeds: "Explique uma ação de cada vez e confirme se a mensagem foi compreendida.",
  },
  {
    slug: "ana-demo",
    initials: "AR",
    name: "Ana Ribeiro",
    age: "34 anos",
    updated: "30 de julho de 2026",
    allergies: "Látex — informação declarada",
    conditions: "Asma",
    medicines: "Budesonida inalatória — uso contínuo declarado",
    currentTreatment: "Prednisona — tratamento temporário informado no cadastro",
    bloodType: "B+",
    communication: "Comunicação verbal sem adaptação declarada.",
    contact: "Carlos Ribeiro · irmão",
    contactPhone: "(11) 90000-0103",
    disability: "Não declarada",
    birthDate: "22 de novembro de 1991",
    cuidarId: "CID-003",
    preferredName: "Ana",
    mobility: "Sem necessidade de apoio de mobilidade declarada.",
    supportNeeds: "Mantenha o ambiente ventilado e procure atendimento se houver dificuldade para respirar.",
  },
  {
    slug: "paulo-demo", initials: "PA", name: "Paulo Almeida", age: "72 anos",
    updated: "21 de setembro de 2026", allergies: "Não informado",
    conditions: "Baixa visão", medicines: "Nenhum medicamento contínuo declarado",
    currentTreatment: "Colírio lubrificante — uso atual informado no cadastro",
    bloodType: "O−",
    communication: "Identifique-se ao falar e leia as informações em voz alta, se a pessoa desejar.",
    contact: "Clara Almeida · filha",
    contactPhone: "(11) 90000-0104",
    disability: "Sim — deficiência visual (baixa visão)",
    birthDate: "3 de fevereiro de 1954",
    cuidarId: "CID-004",
    preferredName: "Paulo",
    mobility: "Avise sobre degraus e obstáculos antes de conduzir. Ofereça o braço; não puxe a pessoa.",
    supportNeeds: "Descreva o ambiente e informe antes de tocar ou mover objetos próximos.",
  },
  {
    slug: "sofia-demo", initials: "SL", name: "Sofia Lima", age: "28 anos",
    updated: "21 de setembro de 2026", allergies: "Nenhuma alergia declarada",
    conditions: "Deficiência auditiva", medicines: "Nenhum medicamento contínuo declarado",
    currentTreatment: "Nenhum tratamento temporário declarado",
    bloodType: "AB+",
    communication: "Fale de frente para a pessoa e ofereça comunicação por escrito.",
    contact: "Rafael Lima · irmão",
    contactPhone: "(11) 90000-0105",
    disability: "Sim — deficiência auditiva",
    birthDate: "18 de junho de 1998",
    cuidarId: "CID-005",
    preferredName: "Sofia",
    mobility: "Sem necessidade de apoio de mobilidade declarada.",
    supportNeeds: "Prefere comunicação por texto. Não presuma que a pessoa faça leitura labial.",
  },
];

function profilePath(slug: string) {
  const index = profiles.findIndex(profile => profile.slug === slug);
  return index >= 0 ? `/id/${String(index + 1).padStart(3, "0")}` : `/perfil/${encodeURIComponent(slug)}`;
}

export default function SiteContent({ section = "inicio", profileId }: { section?: "inicio" | "como-funciona" | "demonstracao" | "seguranca" | "acessibilidade" | "sobre"; profileId?: string }) {
  profileId = /^00[1-5]$/.test(profileId ?? "") ? profiles[Number(profileId) - 1].slug : profileId;
  const [screen, setScreen] = useState<"home" | "profile">(profileId ? "profile" : "home");
  const [activeSlug, setActiveSlug] = useState(profileId || profiles[0].slug);
  const [qr, setQr] = useState("");
  const [notice, setNotice] = useState("");
  const [stored, setStored] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!profileId && !profiles.some(p => p.slug === profileId));
  const [profileError, setProfileError] = useState("");

  const active = useMemo(
    () => stored ?? profiles.find((profile) => profile.slug === activeSlug) ?? profiles[0],
    [activeSlug, stored],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = profileId || params.get("perfil");
    if (!profileId && requested) { window.location.replace(`/perfil/${encodeURIComponent(requested)}`); return; }
    if (requested) {
      setActiveSlug(requested);
      setScreen("profile");
      if (!profiles.some(p => p.slug === requested)) {
        setLoading(true);
        fetch(`/api/public/profiles/${encodeURIComponent(requested)}`, {cache:"no-store"})
          .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); return data; })
          .then(data => setStored({...data, updated:new Date(data.updated).toLocaleString("pt-BR")}))
          .catch(e => setProfileError(e.message || "Não foi possível carregar o perfil."))
          .finally(() => setLoading(false));
      }
    }
  }, [profileId]);

  useEffect(() => {
    if (section !== "demonstracao") return;
    let cancelled = false;
    setQr("");
    const url = `${window.location.origin}${profilePath(activeSlug)}`;
    import("qrcode").then(({default: QRCode}) => QRCode.toDataURL(url, {
      width: 360,
      margin: 4,
      color: { dark: "#092a57", light: "#ffffff" },
    })).then(value => { if (!cancelled) setQr(value); }).catch(() => { if (!cancelled) setQr(""); });
    return () => { cancelled = true; };
  }, [activeSlug, section]);

  function simulateCall() {
    setNotice(
      `Demonstração: a ação “Entrar em contato” abriria o contato de ${active.contact}. Nenhuma ligação real foi realizada.`,
    );
  }

  if (screen === "profile" && (loading || profileError)) return <main className="admin-shell"><a href="/">Cuidar ID</a><section className="admin-card"><h1>{loading ? "Carregando perfil…" : "Perfil indisponível"}</h1><p role="status">{profileError || "Consultando as informações salvas."}</p>{profileError && <button onClick={() => window.location.reload()}>Tentar novamente</button>}</section></main>;

  if (screen === "profile") {
    const neutralAllergy = active.allergies === "Não informado" || active.allergies.startsWith("Nenhuma");
    const allergyParts = active.allergies.split("—").map((part) => part.trim());
    const contactParts = active.contact.split("·").map((part) => part.trim());
    return (
      <main className="profile-shell">
        <a className="skip-link" href="#conteudo">Ir para as informações</a>
        <header className="profile-app-bar">
          <a className="profile-brand" href="/" aria-label="Conhecer o Cuidar ID">
            <span className="brand-mark small" aria-hidden="true">+</span>
            <strong>Cuidar ID</strong>
          </a>
          <span className="profile-app-title">Identificação e apoio</span>
        </header>

        <section className="profile-native" id="conteudo" tabIndex={-1} aria-labelledby="profile-title">
          <header className="profile-hero">
            <div className="profile-context">
              <span>Ficha de identificação e apoio</span>
              <span className="demo-badge">Perfil fictício</span>
            </div>
            <div className="profile-person">
              <div className="native-avatar" aria-hidden="true">{active.initials}</div>
              <div>
                <h1 id="profile-title">{active.name}</h1>
                <p className="profile-age">{active.age}</p>
                <p className="profile-updated">Atualizado em {active.updated}</p>
              </div>
            </div>
          </header>

          <section className={`allergy-banner ${neutralAllergy ? "allergy-neutral" : ""}`} aria-labelledby="allergy-title">
            <span className="allergy-symbol" aria-hidden="true">{neutralAllergy ? "✓" : "!"}</span>
            <div>
              <h2 id="allergy-title">{neutralAllergy ? "Alergias" : "Alergia informada"}</h2>
              <strong>{allergyParts[0]}</strong>
              {allergyParts[1] && <p>{allergyParts.slice(1).join(" — ")}</p>}
            </div>
          </section>

          <section className="immediate-help" aria-labelledby="help-title">
            <div className="help-heading">
              <span className="help-symbol" aria-hidden="true">+</span>
              <div><h2 id="help-title">Como ajudar agora</h2><p>Use estas orientações enquanto busca ajuda adequada.</p></div>
            </div>
            <ol>
              <li><strong>Observe se o local é seguro</strong><span>Fale com calma e veja se a pessoa responde.</span></li>
              <li><strong>Em uma urgência, ligue 192</strong><span>Acione o SAMU e siga as orientações do atendente.</span></li>
              <li><strong>Não ofereça medicamentos</strong><span>Não dê remédios, alimentos ou líquidos por conta própria.</span></li>
              <li><strong>Use as preferências abaixo</strong><span>Respeite a comunicação, a mobilidade e contate a pessoa responsável.</span></li>
            </ol>
          </section>

          <section className="native-section identity-section" aria-labelledby="identity-title">
            <h2 id="identity-title" className="native-section-title">Identificação</h2>
            <div className="native-list">
              <div className="native-row"><span className="row-icon id-code-icon" aria-hidden="true">#</span><div><h3>Código Cuidar ID</h3><p>{active.cuidarId || "Não informado"}</p></div></div>
              <div className="native-row"><span className="row-icon name-icon" aria-hidden="true">Aa</span><div><h3>Como prefere ser chamada</h3><p>{active.preferredName || active.name}</p></div></div>
              <div className="native-row"><span className="row-icon age-icon" aria-hidden="true">ID</span><div><h3>Nascimento e idade</h3><p>{active.birthDate ? `${active.birthDate} · ${active.age}` : active.age}</p></div></div>
              <div className="native-row"><span className="row-icon accessibility-icon" aria-hidden="true">♿</span><div><h3>Pessoa com deficiência</h3><p>{active.disability || "Não informado"}</p></div></div>
            </div>
          </section>

          <section className="native-section" aria-labelledby="health-title">
            <h2 id="health-title" className="native-section-title">Saúde</h2>
            <div className="native-list">
              <div className="native-row blood-row"><span className="row-icon blood-icon" aria-hidden="true">AB</span><div><h3>Tipo sanguíneo informado</h3><p>{active.bloodType || "Não informado"}</p><small className="verification-note">Dado declarado. Deve ser confirmado por exame antes de qualquer uso transfusional.</small></div></div>
              <div className="native-row"><span className="row-icon medicine-icon" aria-hidden="true">+</span><div><h3>Medicamentos de uso contínuo</h3><p>{active.medicines}</p></div></div>
              <div className="native-row"><span className="row-icon treatment-icon" aria-hidden="true">Rx</span><div><h3>Medicamentos do tratamento atual</h3><p>{active.currentTreatment || "Não informado"}</p></div></div>
              <div className="native-row"><span className="row-icon condition-icon" aria-hidden="true">♥</span><div><h3>Condições relevantes</h3><p>{active.conditions}</p></div></div>
            </div>
          </section>

          <section className="native-section" aria-labelledby="support-title">
            <h2 id="support-title" className="native-section-title">Apoio e autonomia</h2>
            <div className="native-list">
              <div className="native-row"><span className="row-icon communication-icon" aria-hidden="true">…</span><div><h3>Como se comunicar</h3><p>{active.communication}</p></div></div>
              <div className="native-row"><span className="row-icon mobility-icon" aria-hidden="true">↔</span><div><h3>Mobilidade e condução</h3><p>{active.mobility || "Não informado"}</p></div></div>
              <div className="native-row"><span className="row-icon support-icon" aria-hidden="true">i</span><div><h3>Apoio importante</h3><p>{active.supportNeeds || "Não informado"}</p></div></div>
            </div>
          </section>

          <section className="native-section" id="contato" aria-labelledby="contact-title">
            <h2 id="contact-title" className="native-section-title">Contato de emergência</h2>
            <div className="emergency-contact">
              <div className="contact-identity">
                <span className="contact-avatar" aria-hidden="true">{contactParts[0]?.charAt(0)}</span>
                <div><h3>{contactParts[0]}</h3>{contactParts[1] && <p>{contactParts[1]}</p>}<p className="contact-phone">{active.contactPhone || "Telefone não informado"}</p></div>
              </div>
              <button onClick={simulateCall}><span aria-hidden="true">☎</span> Entrar em contato</button>
              <p className="simulation-note">Demonstração: nenhuma ligação será realizada.</p>
              {notice && (
                <div className="profile-notice" role="status">
                  <span>{notice}</span>
                  <button onClick={() => setNotice("")} aria-label="Fechar aviso">Fechar</button>
                </div>
              )}
            </div>
          </section>

          <details className="about-profile">
            <summary>Sobre esta ficha <span aria-hidden="true">›</span></summary>
            <div><p>Este perfil usa dados fictícios para uma demonstração educacional. Em uso real, as informações seriam declaradas pela pessoa ou responsável e precisariam de revisão periódica.</p><p>A ficha apoia a identificação e a comunicação, mas não confirma diagnósticos, tipo sanguíneo ou tratamentos, não autoriza a administração de medicamentos e não substitui atendimento profissional.</p></div>
          </details>
        </section>

        <footer className="native-profile-footer">
          <a href="/">Conhecer o Cuidar ID</a>
          <span>Protótipo educacional · 2026</span>
        </footer>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      <header className="nav">
        <a href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>Cuidar <strong>ID</strong></span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="/" aria-current={section === "inicio" ? "page" : undefined}>Início</a>
          <a href="/como-funciona" aria-current={section === "como-funciona" ? "page" : undefined}>Como funciona</a>
          <a href="/acessibilidade" aria-current={section === "acessibilidade" ? "page" : undefined}>Acessibilidade</a>
          <a href="/seguranca" aria-current={section === "seguranca" ? "page" : undefined}>Segurança</a>
          <a href="/sobre" aria-current={section === "sobre" ? "page" : undefined}>Sobre</a>
        </nav>
        <a className="nav-cta" href="/id/001">
          Ver exemplo
        </a>
      </header>

      {section === "inicio" && <>
      <section className="hero" id="conteudo">
        <div className="hero-copy">
          <p className="eyebrow light">IDENTIFICAÇÃO E COMUNICAÇÃO</p>
          <h1>Informações de saúde.<br /><span>A um QR Code de distância.</span></h1>
          <p className="hero-description">
            O Cuidar ID é uma pulseira ou etiqueta que abre uma ficha pelo celular.
            Veja alergias, medicamentos e necessidades de comunicação. Nesta demonstração, todos os dados são fictícios.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="/demonstracao">
              Perfis de demonstração
            </a>
            <a className="secondary-button" href="/criar-ficha">
              Criar ficha temporária
            </a>
          </div>
          <div className="hero-proof">
            <span><b>01</b> Escaneie</span>
            <span><b>02</b> Consulte</span>
            <span><b>03</b> Comunique</span>
          </div>
        </div>

        <aside className="hero-guide" aria-label="Como consultar uma ficha">
          <span className="guide-label">PARA QUEM VAI CONSULTAR</span>
          <h2>Da pulseira à informação.</h2>
          <ol><li><strong>Abra a câmera do celular</strong><p>Aponte para o QR Code da pulseira.</p></li><li><strong>Toque no link que aparecer</strong><p>A ficha abre no navegador.</p></li><li><strong>Leia as informações</strong><p>Veja os alertas, a orientação de comunicação e o contato.</p></li></ol>
          <p className="guide-note">É preciso ter internet para abrir a ficha.</p>
        </aside>
      </section>

      <section className="problem-strip">
        <p>E se você precisasse de ajuda, mas não conseguisse explicar quem é?</p>
        <span>O Cuidar ID cria uma ponte inicial entre a pessoa e quem oferece cuidado.</span>
      </section>

      </>}

      {section === "como-funciona" && <section className="section route-section" id="conteudo">
        <div className="section-heading">
          <p className="eyebrow">SIMPLES DE USAR</p>
          <h1>Como funciona o Cuidar ID</h1>
        </div>
        <ol className="steps-grid process-steps">
          <li><span>01</span><h2>Encontre a identificação</h2><p>A pulseira ou etiqueta possui um QR Code: o quadrado que a câmera consegue ler.</p></li>
          <li><span>02</span><h2>Abra a câmera</h2><p>Aponte para o código e toque no link que aparecer. Não é preciso instalar um aplicativo.</p></li>
          <li><span>03</span><h2>Consulte as informações</h2><p>A ficha abre diretamente. Veja primeiro as alergias, os medicamentos e as necessidades da pessoa.</p></li>
          <li><span>04</span><h2>Apoie a comunicação</h2><p>Use a ficha como apoio. Ela não confirma diagnósticos nem substitui profissionais de saúde.</p></li>
        </ol>
        <p>É necessário acesso à internet. Se houver uma etiqueta NFC configurada, aproximar um celular compatível abre o mesmo link. O NFC depende da etiqueta física e ainda precisa ser testado pelo grupo.</p>
        <a className="primary-button dark" href="/demonstracao">Experimentar uma ficha</a>
      </section>}

      {section === "demonstracao" && <section className="demo-section route-section" id="conteudo">
        <div className="demo-copy">
          <p className="eyebrow">EXPERIMENTE AGORA</p>
          <h1>Veja como a ficha aparece.</h1>
          <p>Escolha um exemplo abaixo e toque em “Abrir ficha”. Todos os nomes e dados são fictícios.</p>
          <div className="profile-picker">
            {profiles.map((profile) => (
              <button
                key={profile.slug}
                aria-pressed={activeSlug === profile.slug}
                className={activeSlug === profile.slug ? "selected" : ""}
                onClick={() => setActiveSlug(profile.slug)}
              >
                <span>{profile.initials}</span>
                <div><strong>{profile.name}</strong><small>{profile.conditions}</small></div>
              </button>
            ))}
          </div>
          <a className="primary-button dark" href={profilePath(activeSlug)}>
            Abrir ficha
          </a>
        </div>
        <div className="qr-panel">

          {qr && <img src={qr} alt={`QR Code do perfil fictício de ${active.name}`} />}
          <h3>Escaneie com outro celular</h3>
          <p>O código abre diretamente o perfil escolhido.</p>
          <a href={profilePath(activeSlug)}>Abrir {active.name}</a>
          {qr && <p><a href={qr} download={`cuidar-id-${String(profiles.findIndex(p => p.slug === activeSlug) + 1).padStart(3,"0")}.png`}>Baixar QR Code</a></p>}
          <p><a href="/qr-codes">Ver os cinco códigos para impressão</a></p>
        </div>
      </section>}

      {section === "seguranca" && <section className="security-section route-section" id="conteudo">
        <div>
          <p className="eyebrow light">PRIVACIDADE DESDE O INÍCIO</p>
          <h1>Informação com responsabilidade.</h1>
        </div>
        <div className="security-points">
          <article><span>01</span><div><h3>Somente o necessário</h3><p>CPF, endereço e documentos não fazem parte do perfil emergencial.</p></div></article>
          <article><span>02</span><div><h3>Edição protegida</h3><p>O administrador atualiza as fichas e pode desativar um código. Nesta fase, usamos apenas dados fictícios.</p></div></article>
          <article><span>03</span><div><h3>Apoio, não diagnóstico</h3><p>O sistema não substitui exames, prontuários ou profissionais.</p></div></article>
          <article><span>04</span><div><h3>Quem pode ler?</h3><p>As fichas demonstrativas são públicas. Qualquer pessoa com o link ou QR Code pode consultá-las. O código não é uma senha. Não cadastre dados reais de visitantes ou integrantes.</p></div></article>
          <article><span>05</span><div><h3>Privacidade em um uso real</h3><p>A LGPD é a lei brasileira que protege dados pessoais. Dados de saúde exigem cuidados especiais: finalidade clara, uso somente do necessário e uma base legal adequada. Quando utilizado, o consentimento precisa ser específico e informado. Este protótipo não comprova conformidade com a lei.</p></div></article>
          <article><span>06</span><div><h3>Limites desta versão</h3><p>O painel restringe a edição ao administrador, mas as fichas são públicas. Não há prontuário clínico, verificação médica, serviço de emergência nem garantia de disponibilidade. Um uso real exige revisão técnica, jurídica e de segurança.</p></div></article>
          <article><span>07</span><div><h3>Ficha temporária</h3><p>A ficha usa dados inventados. Qualquer pessoa com o QR Code pode abrir a cópia compartilhada por uma hora. O CPF fica fora dessa cópia. Ela demonstra o fluxo, mas não realiza cadastro real nem garante unicidade fora daquela sessão.</p></div></article>
        </div>
      </section>}

      {section === "acessibilidade" && <section className="section route-section readable-page" id="conteudo" tabIndex={-1}>
        <p className="eyebrow">ACESSIBILIDADE DESDE O INÍCIO</p><h1>Uma interface que não exige aprendizado</h1>
        <p>O Cuidar ID foi organizado para apresentar primeiro o que é mais importante, com linguagem simples, textos legíveis e áreas de toque confortáveis.</p>
        <a className="primary-button dark" href="/id/001">Consultar uma ficha</a>
        <h2>Navegação e leitura</h2>
        <ul><li>Use Tab para percorrer links e botões. O contorno visível mostra onde você está.</li><li>Alergias usam símbolo, título e texto, sem depender apenas da cor.</li><li>As páginas possuem títulos, links nomeados e estrutura semântica para leitores de tela.</li><li>O site respeita o zoom, o tamanho de texto e as preferências de movimento do aparelho.</li></ul>
        <h2>Compatibilidade do aparelho</h2><p>Recursos como zoom, leitor de tela, inversão de cores e ajuste de texto podem ser usados diretamente nas configurações de acessibilidade do celular ou computador.</p>
        <h2>O que ainda precisa ser validado</h2><p>Esta versão não possui certificação de acessibilidade. O grupo ainda deve testar com pessoas com diferentes necessidades, leitores de tela e celulares reais.</p>
      </section>}

      {section === "sobre" && <section className="section route-section readable-page" id="conteudo" tabIndex={-1}>
        <p className="eyebrow">FARMÁCIA INTELIGENTE</p><h1>Tecnologia para facilitar a comunicação</h1>
        <p>Quando alguém tem dificuldade para se comunicar, informações importantes podem não estar disponíveis. O Cuidar ID explora como uma identificação simples pode ajudar nesse primeiro contato.</p>
        <h2>Nosso propósito</h2><p>Reunir informações essenciais em uma ficha fácil de consultar, acessada por QR Code ou por uma etiqueta NFC configurada com o mesmo endereço.</p>
        <h2>Um projeto educacional</h2><p>Desenvolvido para a apresentação de Farmácia Inteligente, o projeto aproxima identificação, informação sobre medicamentos e comunicação acessível. Os cinco exemplos são inventados e não orientam tratamentos.</p>
        <h2>Equipe</h2><p>Richard · Beatriz · Maria Eduarda · Yasmin Alves · Luciana</p>
        <a className="primary-button dark" href="/demonstracao">Conhecer os cinco exemplos</a>
      </section>}

      <footer className="site-footer">
        <a href="/" className="brand inverse">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span>Cuidar <strong>ID</strong></span>
        </a>
        <p>Protótipo educacional · Feira de Ciências 2026</p>
        <a href="/demonstracao">Perfis de demonstração</a>
        <a href="/painel">Painel do grupo</a>
      </footer>
    </main>
  );
}
