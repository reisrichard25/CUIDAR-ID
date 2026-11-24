"use client";

import { useEffect, useState, type FormEvent } from "react";

type TemporaryProfile = {
  share?: {path:string; expires:number};
  hash: string;
  code: string;
  maskedCpf: string;
  name: string;
  preferredName: string;
  birthDate: string;
  age: string;
  bloodType: string;
  allergies: string;
  medicines: string;
  currentTreatment: string;
  conditions: string;
  disability: string;
  communication: string;
  mobility: string;
  contact: string;
  contactPhone: string;
  createdAt: string;
};

const initialForm = {
  cpf: "",
  name: "",
  preferredName: "",
  birthDate: "",
  bloodType: "",
  allergies: "",
  medicines: "",
  currentTreatment: "",
  conditions: "",
  disability: "",
  communication: "",
  mobility: "",
  contact: "",
  contactPhone: "",
};

const storageKey = "cuidar-id-temporary-profiles";

function onlyDigits(value: string) { return value.replace(/\D/g, "").slice(0, 11); }
function formatCpf(value: string) {
  const digits = onlyDigits(value);
  return digits.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskCpf(value: string) {
  const digits = onlyDigits(value);
  return `***.***.***-${digits.slice(-2)}`;
}
function calculateAge(value: string) {
  const birth = new Date(`${value}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return `${Math.max(0, age)} anos`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {dateStyle: "long"}).format(new Date(`${value}T12:00:00`));
}
async function cpfHash(cpf: string) {
  const bytes = new TextEncoder().encode(onlyDigits(cpf));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export default function TemporaryProfileExperience() {
  const [form, setForm] = useState(initialForm);
  const [profiles, setProfiles] = useState<TemporaryProfile[]>([]);
  const [active, setActive] = useState<TemporaryProfile | null>(null);
  const [notice, setNotice] = useState("");
  const [fictional, setFictional] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "[]") as TemporaryProfile[];
      setProfiles(saved);
      if (saved[0]) setActive(saved[0]);
    } catch { sessionStorage.removeItem(storageKey); }
  }, []);

  const [qr,setQr]=useState("");
  const [qrError,setQrError]=useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let live=true;setQr("");setQrError(false);
    if(active?.share){import("qrcode").then(({default:q})=>q.toDataURL(location.origin+active.share!.path,{width:360,margin:4})).then(v=>{if(live)setQr(v)}).catch(()=>{if(live)setQrError(true)})}
    return ()=>{live=false};
  },[active]);
  function update(key: keyof typeof initialForm, value: string) {
    setForm(current => ({...current, [key]: key === "cpf" ? formatCpf(value) : value}));
  }

  async function createProfile(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    const digits = onlyDigits(form.cpf);
    if (digits.length !== 11) { setNotice("Use 11 números no CPF fictício."); return; }
    if (!fictional) { setNotice("Confirme que todos os dados são fictícios."); return; }
    const hash = await cpfHash(digits);
    const existing = profiles.find(profile => profile.hash === hash);
    if (existing) {
      setActive(existing);
      setNotice("Já existe uma ficha temporária para este CPF fictício nesta sessão. Abrimos a ficha existente.");
      return;
    }
    const profile: TemporaryProfile = {
      hash,
      code: `TEMP-${hash.slice(0, 6).toUpperCase()}`,
      maskedCpf: maskCpf(digits),
      name: form.name.trim(),
      preferredName: form.preferredName.trim() || form.name.trim().split(" ")[0],
      birthDate: formatDate(form.birthDate),
      age: calculateAge(form.birthDate),
      bloodType: form.bloodType || "Não informado",
      allergies: form.allergies.trim() || "Nenhuma alergia declarada",
      medicines: form.medicines.trim() || "Nenhum medicamento contínuo declarado",
      currentTreatment: form.currentTreatment.trim() || "Nenhum tratamento temporário declarado",
      conditions: form.conditions.trim() || "Nenhuma condição relevante declarada",
      disability: form.disability.trim() || "Não declarada",
      communication: form.communication.trim() || "Nenhuma adaptação de comunicação declarada",
      mobility: form.mobility.trim() || "Nenhuma necessidade de mobilidade declarada",
      contact: form.contact.trim() || "Não informado",
      contactPhone: form.contactPhone.trim() || "Telefone não informado",
      createdAt: new Intl.DateTimeFormat("pt-BR", {dateStyle: "long", timeStyle: "short"}).format(new Date()),
    };
    setBusy(true);
    try {
      const {hash: _hash,code: _code,maskedCpf: _cpf,birthDate: _birth,createdAt: _created,...publicFields}=profile;
      const res=await fetch("/api/temporarias",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...publicFields,fictional:true})});
      if(!res.ok)throw Error();
      profile.share=await res.json();
    } catch {setNotice("Não foi possível gerar o link. Seus campos foram mantidos; tente novamente.");return} finally {setBusy(false)}
    const updated = [profile, ...profiles];
    sessionStorage.setItem(storageKey, JSON.stringify(updated));
    setProfiles(updated);
    setActive(profile);
    setForm(initialForm);
    setFictional(false);
    setNotice("Ficha criada. Escaneie o QR Code com outro celular.");
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  function startAnother() { setActive(null); setNotice(""); }
  function clearSession() {
    sessionStorage.removeItem(storageKey);
    setProfiles([]);
    setActive(null);
    setNotice("As fichas temporárias desta sessão foram apagadas.");
  }

  if (active) {
    const initials = active.name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
    const allergyNeutral = active.allergies.startsWith("Nenhuma");
    return <main className="profile-shell temporary-profile-preview">
      <header className="profile-app-bar"><a className="profile-brand" href="/"><span className="brand-mark small" aria-hidden="true">+</span><strong>Cuidar ID</strong></a><span className="profile-app-title">Simulação temporária</span></header>
      <section className="profile-native" aria-labelledby="temporary-profile-title">
        {notice && <div className="temporary-status" role="status">{notice}</div>}
        <header className="profile-hero">
          <div className="profile-context"><span>Ficha temporária</span><span className="demo-badge">Perfil fictício</span></div>
          <div className="profile-person"><div className="native-avatar" aria-hidden="true">{initials}</div><div><h1 id="temporary-profile-title">{active.name}</h1><p className="profile-age">{active.age}</p><p className="profile-updated">Criada em {active.createdAt}</p></div></div>
        </header>
        {active.share && <section className="native-section"><h2>Escaneie para abrir a ficha</h2>
          {qr?<img src={qr} width="260" height="260" style={{maxWidth:"100%",height:"auto"}} alt="QR Code desta ficha temporária"/>:<p role="status">{qrError?"Use o link abaixo.":"Preparando QR Code…"}</p>}
          <p><a href={active.share.path}>Abrir ficha compartilhada</a></p><p>Válida até {new Date(active.share.expires).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}. Depois, crie outra simulação.</p></section>}
        <section className={`allergy-banner ${allergyNeutral ? "allergy-neutral" : ""}`} aria-label="Alergias"><span className="allergy-symbol" aria-hidden="true">{allergyNeutral ? "✓" : "!"}</span><div><h2>{allergyNeutral ? "Alergias" : "Alergia informada"}</h2><strong>{active.allergies}</strong></div></section>
        <section className="native-section identity-section" aria-labelledby="temporary-id-title"><h2 id="temporary-id-title" className="native-section-title">Identificação</h2><div className="native-list">
          <div className="native-row"><span className="row-icon id-code-icon" aria-hidden="true">#</span><div><h3>Código temporário</h3><p>{active.code}</p></div></div>
          <div className="native-row"><span className="row-icon name-icon" aria-hidden="true">Aa</span><div><h3>Como prefere ser chamada</h3><p>{active.preferredName}</p></div></div>
          <div className="native-row"><span className="row-icon age-icon" aria-hidden="true">ID</span><div><h3>Nascimento e idade</h3><p>{active.birthDate} · {active.age}</p></div></div>
          <div className="native-row"><span className="row-icon privacy-icon" aria-hidden="true">••</span><div><h3>CPF declarado</h3><p>{active.maskedCpf}</p><small className="verification-note">Número mascarado. O CPF completo não é exibido na ficha.</small></div></div>
          <div className="native-row"><span className="row-icon accessibility-icon" aria-hidden="true">♿</span><div><h3>Pessoa com deficiência</h3><p>{active.disability}</p></div></div>
        </div></section>
        <section className="native-section" aria-labelledby="temporary-health-title"><h2 id="temporary-health-title" className="native-section-title">Saúde</h2><div className="native-list">
          <div className="native-row"><span className="row-icon blood-icon" aria-hidden="true">AB</span><div><h3>Tipo sanguíneo informado</h3><p>{active.bloodType}</p><small className="verification-note">Dado declarado. Exige confirmação laboratorial antes de uso transfusional.</small></div></div>
          <div className="native-row"><span className="row-icon medicine-icon" aria-hidden="true">+</span><div><h3>Medicamentos de uso contínuo</h3><p>{active.medicines}</p></div></div>
          <div className="native-row"><span className="row-icon treatment-icon" aria-hidden="true">Rx</span><div><h3>Medicamentos do tratamento atual</h3><p>{active.currentTreatment}</p></div></div>
          <div className="native-row"><span className="row-icon condition-icon" aria-hidden="true">♥</span><div><h3>Condições relevantes</h3><p>{active.conditions}</p></div></div>
        </div></section>
        <section className="native-section" aria-labelledby="temporary-support-title"><h2 id="temporary-support-title" className="native-section-title">Apoio e contato</h2><div className="native-list">
          <div className="native-row"><span className="row-icon communication-icon" aria-hidden="true">…</span><div><h3>Como se comunicar</h3><p>{active.communication}</p></div></div>
          <div className="native-row"><span className="row-icon mobility-icon" aria-hidden="true">↔</span><div><h3>Mobilidade</h3><p>{active.mobility}</p></div></div>
          <div className="native-row"><span className="row-icon contact-icon" aria-hidden="true">☎</span><div><h3>Contato de emergência</h3><p>{active.contact} · {active.contactPhone}</p></div></div>
        </div></section>
        <aside className="temporary-privacy-note"><strong>Simulação educacional</strong><p>Apagar a cópia desta aba não desativa um link já criado. O link expira em uma hora. Use somente dados fictícios.</p></aside>
        <div className="temporary-actions"><button className="primary-button dark" onClick={startAnother}>Criar outra simulação</button><button className="secondary-danger" onClick={clearSession}>Apagar fichas desta sessão</button><a href="/">Voltar ao início</a></div>
      </section>
    </main>;
  }

  return <main className="site-shell temporary-builder">
    <header className="nav"><a href="/" className="brand"><span className="brand-mark" aria-hidden="true">+</span><span>Cuidar <strong>ID</strong></span></a><a className="nav-cta" href="/">Voltar ao início</a></header>
    <section className="temporary-form-card" aria-labelledby="temporary-form-title">
      <p className="eyebrow">EXPERIÊNCIA TEMPORÁRIA</p>
      <h1 id="temporary-form-title">Crie uma ficha de demonstração.</h1>
      <p className="temporary-intro">Veja como seria o cadastro do Cuidar ID. Ao criar a ficha, você recebe um QR Code válido por uma hora. Quem tiver o link poderá ler as informações fictícias em outro celular. O CPF e a data de nascimento não são compartilhados.</p>
      <div className="temporary-warning" role="note"><strong>Não use seus dados reais.</strong><span>Digite somente informações inventadas. O CPF será usado apenas para simular a regra de uma ficha por pessoa.</span></div>
      {notice && <div className="temporary-status error" role="alert">{notice}</div>}
      {profiles.length > 0 && <div className="session-summary"><strong>{profiles.length} ficha{profiles.length > 1 ? "s" : ""} nesta sessão</strong><button type="button" onClick={() => setActive(profiles[0])}>Abrir a mais recente</button></div>}
      <form onSubmit={createProfile} className="temporary-form">
        <fieldset><legend>Identificação fictícia</legend><div className="temporary-grid">
          <label>Nome completo fictício<input required maxLength={100} value={form.name} onChange={event => update("name", event.target.value)} autoComplete="off" /></label>
          <label>Como prefere ser chamada<input maxLength={60} value={form.preferredName} onChange={event => update("preferredName", event.target.value)} autoComplete="off" /></label>
          <label>Data de nascimento fictícia<input required type="date" value={form.birthDate} onChange={event => update("birthDate", event.target.value)} /></label>
          <label>CPF fictício<input required inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} onChange={event => update("cpf", event.target.value)} autoComplete="off" aria-describedby="cpf-help" /><small id="cpf-help">Não informe CPF real. Na ficha, somente os dois últimos números aparecerão.</small></label>
          <label>Pessoa com deficiência<textarea rows={2} maxLength={300} placeholder="Ex.: Sim — deficiência visual" value={form.disability} onChange={event => update("disability", event.target.value)} /></label>
        </div></fieldset>
        <fieldset><legend>Informações de saúde fictícias</legend><div className="temporary-grid">
          <label>Tipo sanguíneo informado<select value={form.bloodType} onChange={event => update("bloodType", event.target.value)}><option value="">Não informado</option>{["A+","A−","B+","B−","AB+","AB−","O+","O−"].map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Alergias<textarea rows={2} maxLength={400} value={form.allergies} onChange={event => update("allergies", event.target.value)} /></label>
          <label>Medicamentos de uso contínuo<textarea rows={2} maxLength={400} value={form.medicines} onChange={event => update("medicines", event.target.value)} /></label>
          <label>Medicamentos do tratamento atual<textarea rows={2} maxLength={400} value={form.currentTreatment} onChange={event => update("currentTreatment", event.target.value)} /></label>
          <label>Condições relevantes<textarea rows={2} maxLength={400} value={form.conditions} onChange={event => update("conditions", event.target.value)} /></label>
        </div></fieldset>
        <fieldset><legend>Apoio e contato fictícios</legend><div className="temporary-grid">
          <label>Como se comunicar<textarea rows={2} maxLength={400} value={form.communication} onChange={event => update("communication", event.target.value)} /></label>
          <label>Mobilidade<textarea rows={2} maxLength={400} value={form.mobility} onChange={event => update("mobility", event.target.value)} /></label>
          <label>Contato de emergência fictício<input maxLength={100} placeholder="Nome · vínculo" value={form.contact} onChange={event => update("contact", event.target.value)} autoComplete="off" /></label>
          <label>Telefone fictício<input maxLength={24} inputMode="tel" placeholder="(11) 90000-0000" value={form.contactPhone} onChange={event => update("contactPhone", event.target.value)} autoComplete="off" /></label>
        </div></fieldset>
        <label className="temporary-consent"><input type="checkbox" checked={fictional} onChange={event => setFictional(event.target.checked)} />Confirmo que todas as informações são inventadas e serão usadas apenas nesta demonstração.</label>
        <button className="primary-button dark" disabled={busy} type="submit">{busy?"Gerando QR Code…":"Criar ficha e gerar QR Code"}</button>
      </form>
    </section>
  </main>;
}
