/* eslint-disable */
import { useState, useEffect, useRef} from "react";
import {
  fetchChantiers, saveChantierDB, deleteChantierDB, resetChantiersDB,
  fetchTeams, saveTeamsDB, resetTeamsDB,
  fetchFlotte, saveFlotteItemDB, deleteFlotteItemDB, resetFlotteDB,
  loadSetting, saveSetting,
} from "./supabase";
const LIGHT = {
  bg: "#F8F9FC", card: "#fff", border: "#F3F4F6", border2: "#E5E7EB",
  text: "#1A1A2E", text2: "#6B7280", text3: "#9CA3AF",
  input: "#FAFAFA", inputBorder: "#E5E7EB",
  headerBg: "#fff", headerBorder: "#F3F4F6",
  rowHover: "#FFF7ED", accent: "#FF6B35", accentDark: "#E85D04",
  shadow: "rgba(0,0,0,0.06)", shadowAccent: "rgba(255,107,53,0.06)",};
const DARK = {
  bg: "#0F1117", card: "#1A1D27", border: "#2A2D3A", border2: "#353848",
  text: "#F1F2F6", text2: "#A0A8C0", text3: "#6B7280",
  input: "#242736", inputBorder: "#353848",
  headerBg: "#1A1D27", headerBorder: "#2A2D3A",
  rowHover: "#2A1F1A", accent: "#FF6B35", accentDark: "#E85D04",
  shadow: "rgba(0,0,0,0.3)", shadowAccent: "rgba(255,107,53,0.08)",};

const INITIAL_TEAMS = [
  { id: "couverture", name: "Couverture", color: "#FF6B35", icon: "🏗", members: [
    { id: 1, nom: "Martin D.", poste: "Chef d'equipe", tel: "06 11 22 33 44", statut: "actif"},
    { id: 2, nom: "Lucas P.", poste: "Couvreur", tel: "06 22 33 44 55", statut: "actif"},
    { id: 3, nom: "Emma R.", poste: "Couvreur", tel: "06 33 44 55 66", statut: "conge"},
  ]},
  { id: "maconnerie", name: "Maconnerie", color: "#E85D04", icon: "⛏", members: [
    { id: 4, nom: "Pierre M.", poste: "Chef d'equipe", tel: "06 44 55 66 77", statut: "actif"},
    { id: 5, nom: "Sophie L.", poste: "Macon", tel: "06 55 66 77 88", statut: "actif"},
    { id: 6, nom: "Antoine B.", poste: "Macon", tel: "06 66 77 88 99", statut: "actif"},
  ]},
  { id: "demolition", name: "Demolition", color: "#DC2F02", icon: "💥", members: [
    { id: 7, nom: "Kevin T.", poste: "Chef d'equipe", tel: "06 77 88 99 00", statut: "actif"},
    { id: 8, nom: "Mathieu G.", poste: "Operateur", tel: "06 88 99 00 11", statut: "actif"},
    { id: 9, nom: "Lea F.", poste: "Operateur", tel: "06 99 00 11 22", statut: "maladie"},
  ]},
  { id: "mecanique", name: "Mecanique", color: "#9D0208", icon: "⚙", members: [
    { id: 10, nom: "Hugo V.", poste: "Chef d'equipe", tel: "06 00 11 22 33", statut: "actif"},
    { id: 11, nom: "Clara N.", poste: "Mecanicien", tel: "06 11 22 33 44", statut: "actif"},
    { id: 12, nom: "Thomas H.", poste: "Mecanicien", tel: "06 22 33 44 55", statut: "actif"},
  ]},
  { id: "platrerie", name: "Platrerie", color: "#6A040F", icon: "🔧", members: [
    { id: 13, nom: "Julien R.", poste: "Chef d'equipe", tel: "06 33 44 55 66", statut: "actif"},
    { id: 14, nom: "Camille S.", poste: "Platrier", tel: "06 44 55 66 77", statut: "actif"},
    { id: 15, nom: "Nicolas W.", poste: "Platrier", tel: "06 55 66 77 88", statut: "conge"},
  ]},
];

const STATUT_CONFIG = {
  planifie: { label: "Planifie", color: "#3B82F6", bg: "#EFF6FF"},
  en_cours: { label: "En cours", color: "#FF6B35", bg: "#FFF7ED"},
  termine: { label: "Termine", color: "#22C55E", bg: "#F0FDF4"},
  retard: { label: "Retard", color: "#EF4444", bg: "#FEF2F2"},
  suspendu: { label: "Suspendu", color: "#F59E0B", bg: "#FFFBEB"},};

const PRIORITE_CONFIG = {
  urgente: { label: "Urgente", color: "#DC2626"},
  haute: { label: "Haute", color: "#FF6B35"},
  normale: { label: "Normale", color: "#3B82F6"},
  basse: { label: "Basse", color: "#6B7280"},};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

const CHANTIERS_62 = [
  { id: 101, nom: "Renovation toiture Mairie", ville: "Lillers", adresse: "Place de la Republique, 62190 Lillers", lat: 50.5637, lng: 2.4823, statut: "en_cours", priorite: "haute", responsable: "Martin D.", equipes: ["couverture"], progression: 65, date: "2026-05-20", heure: "08:00", duree: 4, notes: "Acces par parking arriere", photos: 3, documents: 2, heures: 42, materiel: ["Echafaudage"], rentabilite: 82},
  { id: 102, nom: "Extension pavillon Bethune", ville: "Bethune", adresse: "14 rue Pasteur, 62400 Bethune", lat: 50.5313, lng: 2.6403, statut: "planifie", priorite: "normale", responsable: "Pierre M.", equipes: ["maconnerie"], progression: 0, date: "2026-05-28", heure: "07:30", duree: 8, notes: "Permis depose", photos: 0, documents: 3, heures: 0, materiel: ["Betonniere"], rentabilite: 0},
  { id: 103, nom: "Demolition hangar Aire", ville: "Aire-sur-la-Lys", adresse: "Zone industrielle, 62120 Aire-sur-la-Lys", lat: 50.6378, lng: 2.3967, statut: "en_cours", priorite: "urgente", responsable: "Kevin T.", equipes: ["demolition"], progression: 40, date: "2026-05-18", heure: "06:00", duree: 3, notes: "Amiante traite", photos: 5, documents: 4, heures: 28, materiel: ["Pelleteuse"], rentabilite: 71},
  { id: 104, nom: "Platrerie residence Saint-Omer", ville: "Saint-Omer", adresse: "12 avenue du General de Gaulle, 62500 Saint-Omer", lat: 50.7472, lng: 2.2572, statut: "planifie", priorite: "normale", responsable: "Julien R.", equipes: ["platrerie"], progression: 0, date: "2026-06-02", heure: "08:00", duree: 5, notes: "Client a contacter la veille", photos: 0, documents: 1, heures: 0, materiel: ["Echafaudage interieur"], rentabilite: 0},
  { id: 105, nom: "Refection toiture Isbergues", ville: "Isbergues", adresse: "8 rue de la Paix, 62330 Isbergues", lat: 50.6256, lng: 2.4603, statut: "termine", priorite: "normale", responsable: "Emma R.", equipes: ["couverture"], progression: 100, date: "2026-05-05", heure: "08:00", duree: 2, notes: "Termine, client satisfait", photos: 8, documents: 2, heures: 24, materiel: [], rentabilite: 91},
  { id: 106, nom: "Mecanique chaufferie Merville", ville: "Merville", adresse: "3 rue du Moulin, 59660 Merville", lat: 50.6469, lng: 2.6387, statut: "en_cours", priorite: "haute", responsable: "Hugo V.", equipes: ["mecanique"], progression: 55, date: "2026-05-19", heure: "07:00", duree: 3, notes: "Acces restreint le matin", photos: 2, documents: 1, heures: 18, materiel: ["Outillage specifique"], rentabilite: 68},
  { id: 107, nom: "Maconnerie ecole Bruay", ville: "Bruay-la-Buissiere", adresse: "Avenue de la Liberte, 62700 Bruay-la-Buissiere", lat: 50.4881, lng: 2.5443, statut: "planifie", priorite: "haute", responsable: "Sophie L.", equipes: ["maconnerie", "platrerie"], progression: 0, date: "2026-06-10", heure: "07:30", duree: 15, notes: "Gros chantier - 2 equipes", photos: 0, documents: 6, heures: 0, materiel: ["Betonniere", "Malaxeur"], rentabilite: 0},
];

function Badge({ text, color, bg}) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,letterSpacing:"0.03em",background:bg || "#FFF7ED",color:color || "#FF6B35",whiteSpace:"nowrap"}}>{text}</span>
  );}

function StatCard({ icon, label, value, sub, color, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  return (
    <div style={{ background: T.card, borderRadius: 16, padding: "20px 22px", boxShadow: `0 1px 3px ${T.shadow}`, border: `1px solid ${T.border}`, position: "relative", overflow: "hidden"}}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`, borderRadius: "0 16px 0 80px"}} />
      <div style={{fontSize:22,marginBottom:8}}>{icon}</div>
      <div style={{fontSize:28,fontWeight:700,color:T.text,lineHeight:1}}>{value}</div>
      <div style={{fontSize:13,color:T.text2,marginTop:4}}>{label}</div>
      {sub && <div style={{fontSize:12,color,marginTop:6,fontWeight:600}}>{sub}</div>}
    </div>
  );}

function TeamDot({ teamId, size = 8}) {
  const team = INITIAL_TEAMS.find(t => t.id === teamId);
  return team ? <span style={{display:"inline-block",width:size,height:size,borderRadius:"50%",background:team.color,marginRight:4}} /> : null;}

function ProgressBar({ value, color = "#FF6B35", height = 6, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  return (
    <div style={{background:T.input,borderRadius:999,height,overflow:"hidden"}}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 999, background: value >= 100 ? "#22C55E" : color, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"}} />
    </div>
  );}

function Modal({ open, onClose, title, children, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"12px 8px",overflowY:"auto"}}>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}} />
      <div style={{ position: "relative", background: T.card, borderRadius: 20, padding: "24px 20px", width: "100%", maxWidth: 620, boxShadow: `0 20px 60px ${T.shadow}`, marginTop: 8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:T.text}}>{title}</h2>
          <button onClick={onClose} style={{background:T.input,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.text2}}>x</button>
        </div>
        {children}
      </div>
    </div>
  );}

function ChantierForm({ initial, onSave, onCancel, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [form, setForm] = useState(initial || { nom: "", ville: "", adresse: "", date: "", heure: "08:00", duree: 1, priorite: "normale", statut: "planifie", responsable: "", equipes: [], notes: "", progression: 0, lat: 50.5637, lng: 2.4823, photos: 0, documents: 0, heures: 0, materiel: [], rentabilite: 0});
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState(null); // null | "ok" | "error"
  const geocodeTimer = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v}));
  const toggleEquipe = (id) => set("equipes", form.equipes.includes(id) ? form.equipes.filter(e => e !== id) : [...form.equipes, id]);
  const inputStyle = { width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border2}`, borderRadius: 10, fontSize: 14, outline: "none", background: T.input, boxSizing: "border-box", color: T.text};
  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em"};
  const GEOCODE_DB = {
    "calais": [50.9513, 1.8587], "boulogne": [50.7270, 1.6151], "boulogne-sur-mer": [50.7270, 1.6151],
    "dunkerque": [51.0343, 2.3770], "lille": [50.6292, 3.0573], "arras": [50.2929, 2.7797],
    "lens": [50.4320, 2.8340], "bethune": [50.5313, 2.6403], "bethune": [50.5313, 2.6403],
    "bruay": [50.4881, 2.5443], "bruay-la-buissiere": [50.4881, 2.5443], "bruay la buissiere": [50.4881, 2.5443],
    "lillers": [50.5637, 2.4823], "saint-omer": [50.7480, 2.2572], "saint omer": [50.7480, 2.2572],
    "aire-sur-la-lys": [50.6378, 2.3967], "aire sur la lys": [50.6378, 2.3967], "aire": [50.6378, 2.3967],
    "isbergues": [50.6256, 2.4603], "merville": [50.6469, 2.6387], "hazebrouck": [50.7243, 2.5388],
    "douai": [50.3720, 3.0790], "valenciennes": [50.3580, 3.5236], "cambrai": [50.1763, 3.2349],
    "amiens": [49.8941, 2.2957], "abbeville": [50.1054, 1.8352], "montreuil": [50.4640, 1.7667],
    "le touquet": [50.5214, 1.5853], "hesdin": [50.3672, 2.0378], "saint-pol": [50.3800, 2.3360],
    "saint pol": [50.3800, 2.3360], "saint-pol-sur-ternoise": [50.3800, 2.3360],
    "fruges": [50.5153, 2.1275], "fauquembergues": [50.5986, 2.1011],
    "paris": [48.8566, 2.3522], "reims": [49.2583, 4.0317], "bruxelles": [50.8503, 4.3517],
    "brussels": [50.8503, 4.3517], "rouen": [49.4432, 1.0993], "dieppe": [49.9228, 1.0768],
    "berk": [50.4000, 1.5667], "berck": [50.4000, 1.5667],
    "doullens": [50.1567, 2.3422], "peronne": [49.9319, 2.9322], "peronne": [49.9319, 2.9322],
    "maubeuge": [50.2778, 3.9736], "avesnes": [50.1258, 3.9311],
    "laon": [49.5633, 3.6242], "soissons": [49.3817, 3.3236],
    "mons": [50.4542, 3.9521], "charleroi": [50.4108, 4.4446], "namur": [50.4669, 4.8674],
    "ghent": [51.0543, 3.7174], "gent": [51.0543, 3.7174], "antwerpen": [51.2213, 4.4051],};

  const doGeocode = async (adresse, ville) => {
    setGeocoding(true);
    setGeocodeStatus(null);
    const normalize = (s) => (s || "").toLowerCase().trim()
      .replace(/[eeee]/g,"e").replace(/[aaa]/g,"a").replace(/[uuu]/g,"u")
      .replace(/[ii]/g,"i").replace(/[oo]/g,"o").replace(/c/g,"c");

    const tokens = [normalize(ville), normalize(adresse)];
    let found = null;

    for (const token of tokens) {
      if (!token) continue;
      if (GEOCODE_DB[token]) { found = GEOCODE_DB[token]; break;}
      for (const [key, coords] of Object.entries(GEOCODE_DB)) {
        if (token.includes(key) || key.includes(token)) { found = coords; break;}}
      if (found) break;}

    if (found) {
      setForm(f => ({ ...f, lat: found[0], lng: found[1]}));
      setGeocodeStatus("ok");
      setGeocoding(false);
      return;}
    const query = [adresse, ville].filter(Boolean).join(", ");
    if (!query.trim()) { setGeocoding(false); return;}
    try {
      const prompt = `Donne les coordonnees GPS (latitude, longitude) de cette adresse en France : "${query}".
Reponds UNIQUEMENT avec un objet JSON valide, sans markdown :
{"lat": 48.8566, "lng": 2.3522}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 60,
          messages: [{ role: "user", content: prompt}]})});
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim() || "";
      const coords = JSON.parse(text.replace(/```json|```/g, "").trim());
      if (coords.lat && coords.lng) {
        setForm(f => ({ ...f, lat: parseFloat(coords.lat), lng: parseFloat(coords.lng)}));
        setGeocodeStatus("ok");} else {
        setGeocodeStatus("error");}} catch {
      setGeocodeStatus("error");}
    setGeocoding(false);};

  const scheduleGeocode = (adresse, ville) => {
    clearTimeout(geocodeTimer.current);
    setGeocodeStatus(null);
    if (!adresse && !ville) return;
    geocodeTimer.current = setTimeout(() => doGeocode(adresse, ville), 1000);};
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form;}, [form]);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{gridColumn:"1/-1"}}>
          <label style={labelStyle}>Nom du chantier</label>
          <input style={inputStyle} value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex: Renovation Villa Dumont" />
        </div>
        <div>
          <label style={labelStyle}>Ville</label>
          <input style={inputStyle} value={form.ville} onChange={e => { set("ville", e.target.value); scheduleGeocode(form.adresse, e.target.value);}} placeholder="Lillers" />
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={labelStyle}>Adresse</label>
          <div style={{position:"relative"}}>
            <input
              style={{...inputStyle,paddingRight:44}}
              value={form.adresse}
              onChange={e => { set("adresse", e.target.value); scheduleGeocode(e.target.value, form.ville);}}
              placeholder="14 rue des Lilas, 62190"
            />
            <div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>
              {geocoding ? "⏳" : geocodeStatus === "ok" ? "✅" : geocodeStatus === "error" ? "❌" : ""}
            </div>
          </div>
          {geocodeStatus === "ok" && (
            <div style={{marginTop:5,fontSize:11,color:"#22C55E",fontWeight:600}}>
              📍 Geolocalise : {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              {(form.lat < 49.15 || form.lat > 51.90 || form.lng < 0.35 || form.lng > 4.60) && (
                <span style={{color:"#F59E0B",marginLeft:8}}>⚠️ Hors zone carte 62 — visible dans la liste</span>
              )}
            </div>
          )}
          {geocodeStatus === "error" && (
            <div style={{marginTop:5,fontSize:11,color:"#EF4444",fontWeight:600}}>
              ⚠️ Adresse introuvable — position par defaut (Lillers)
            </div>
          )}
        </div>
        <div>
          <label style={labelStyle}>Heure de debut</label>
          <input type="time" style={inputStyle} value={form.heure} onChange={e => set("heure", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Duree estimee (jours)</label>
          <input type="number" style={inputStyle} value={form.duree} onChange={e => set("duree", +e.target.value)} min={1} />
        </div>
        <div>
          <label style={labelStyle}>Priorite</label>
          <select style={inputStyle} value={form.priorite} onChange={e => set("priorite", e.target.value)}>
            {Object.entries(PRIORITE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Statut</label>
          <select style={inputStyle} value={form.statut} onChange={e => set("statut", e.target.value)}>
            {Object.entries(STATUT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Responsable</label>
          <input style={inputStyle} value={form.responsable} onChange={e => set("responsable", e.target.value)} placeholder="Martin D." />
        </div>
        <div>
          <label style={labelStyle}>Progression (%)</label>
          <input type="number" style={inputStyle} value={form.progression} onChange={e => set("progression", Math.min(100, Math.max(0, +e.target.value)))} min={0} max={100} />
        </div>
      </div>
      <div style={{marginTop:16}}>
        <label style={labelStyle}>Equipes affectees</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {INITIAL_TEAMS.map(t => (
            <button key={t.id} onClick={() => toggleEquipe(t.id)} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${form.equipes.includes(t.id) ? t.color : "#E5E7EB"}`, background: form.equipes.includes(t.id) ? t.color + "15" : T.card, color: form.equipes.includes(t.id) ? t.color : "#6B7280", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s"}}>{t.icon} {t.name}</button>
          ))}
        </div>
      </div>
      <div style={{marginTop:16}}>
        <label style={labelStyle}>Notes</label>
        <textarea style={{...inputStyle,minHeight:80,resize:"vertical",fontFamily:"inherit"}} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Informations complementaires..." />
      </div>
      <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${T.border2}`, background: T.card, cursor: "pointer", fontSize: 14, fontWeight: 600, color: T.text2}}>Annuler</button>
        <button onClick={() => onSave(formRef.current)} style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg, #FF6B35, #E85D04)",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,boxShadow:"0 4px 12px rgba(255,107,53,0.35)"}}>Enregistrer</button>
      </div>
    </div>
  );}

function AIAssistant({ chantiers, onClose, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis votre assistant IA de planification. Je peux optimiser vos plannings, detecter les conflits horaires et proposer les equipes disponibles. Comment puis-je vous aider ?"}
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth"});}, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg}]);
    setLoading(true);
    const context = `Tu es un assistant IA expert en gestion de chantiers BTP. Tu aides a planifier, optimiser et gerer des chantiers dans le Pas-de-Calais (62), base a Lillers 62190.
Donnees actuelles:
- ${chantiers.length} chantiers dans le systeme
- Chantiers actifs: ${chantiers.filter(c => c.statut === "en_cours").length}
- Equipes disponibles: Couverture, Maconnerie, Demolition, Mecanique, Platrerie
- Chantiers: ${chantiers.map(c => `${c.nom} (${c.ville}, ${c.statut}, equipes: ${c.equipes.join("+")}, progression: ${c.progression}%)`).join("; ")}
Reponds en francais, de facon concise et professionnelle.`;
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: [
            ...messages.filter((m, i) => i > 0).map(m => ({ role: m.role, content: m.text})),
            { role: "user", content: userMsg}
          ]})});
      const data = await resp.json();
      const text = data.content?.[0]?.text || "Desole, une erreur s'est produite.";
      setMessages(m => [...m, { role: "assistant", text}]);} catch {
      setMessages(m => [...m, { role: "assistant", text: "Erreur de connexion."}]);}
    setLoading(false);};

  return (
    <div style={{ position: "fixed", bottom: 88, right: 24, width: 340, zIndex: 900, background: T.card, borderRadius: 20, boxShadow: `0 20px 60px ${T.shadow}`, border: `1px solid rgba(255,107,53,0.2)`, overflow: "hidden"}}>
      <div style={{background:"linear-gradient(135deg, #FF6B35, #E85D04)",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:"#fff",fontWeight:700,fontSize:14}}>🤖 Assistant IA ChantierPro</div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,color:"#fff",cursor:"pointer",width:26,height:26,fontSize:14}}>x</button>
      </div>
      <div style={{height:300,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10,background:T.card}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role === "user" ? "flex-end" :"flex-start"}}>
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role === "user" ? "18px 18px 4px 18px" :"18px 18px 18px 4px",background:m.role === "user" ? "linear-gradient(135deg,#FF6B35,#E85D04)" :T.input,color:m.role === "user" ? "#fff" :T.text,fontSize:13,lineHeight:1.5}}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",gap:4,padding:"10px 14px"}}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B35", animation: "bounce 1.2s infinite", animationDelay: `${i*0.2}s`}} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8, background: T.card}}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Posez votre question..." style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${T.border2}`, outline: "none", fontSize: 13, background: T.input, color: T.text}} />
        <button onClick={send} disabled={loading} style={{width:40,height:40,borderRadius:10,border:"none",background:loading ? "#E5E7EB" :"linear-gradient(135deg, #FF6B35, #E85D04)",color:"#fff",cursor:loading ? "not-allowed" :"pointer",fontSize:16}}>→</button>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)}}`}</style>
    </div>
  );}
const MAP_BOUNDS = {
  latMin: 49.15, latMax: 51.90,
  lngMin: 0.35,  lngMax: 4.60,};
const SVG_W = 800;
const SVG_H = 520;

function geoToSvg(lat, lng) {
  const x = ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * SVG_W;
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * SVG_H;
  return { x, y};}
const PAS_DE_CALAIS_SVG = ({ darkMode}) => {

  const coastline = "M 231.5,378.2 L 229.6,347.9 L 229.6,338.5 L 240.9,323.3 L 231.5,298.8 L 227.8,287.4 L 225.9,272.3 L 231.5,260.9 L 227.8,255.3 L 229.6,240.1 L 235.3,221.2 L 240.9,208.0 L 231.5,192.9 L 244.7,189.1 L 259.8,183.4 L 282.4,177.7 L 301.2,175.9 L 329.4,172.1 L 357.6,166.4 L 382.1,162.6 L 414.1,160.7 L 446.1,164.5 L 480.0,155.1 L 502.6,149.4 L 540.2,143.7 L 574.1,138.0 L 602.4,132.4 L 634.4,122.9 L 658.8,107.8 L 687.1,100.2 L 724.7,98.3";

  const roads = [
    "M 235.3,221.2 L 248.5,204.2 L 269.2,189.1 L 286.1,179.6 L 310.6,170.2 L 357.6,164.5 L 385.9,160.7 L 414.1,162.6",  // A16 Boulogne→Calais→Dunkerque
    "M 286.1,177.7 L 310.6,204.2 L 329.4,226.9 L 352.0,253.4 L 376.5,287.4 L 414.1,302.5 L 457.4,304.4",                // A26 Calais→Arras
    "M 457.4,304.4 L 466.8,287.4 L 489.4,278.0 L 502.6,255.3 L 510.1,240.1",                                            // A1 Arras→Lille
    "M 457.4,304.4 L 438.6,325.2 L 416.0,349.8 L 367.1,380.1",                                                          // A1 Arras→Amiens
    "M 510.1,240.1 L 476.2,232.6 L 442.4,223.1 L 414.1,204.2 L 414.1,162.6",                                            // A25 Lille→Dunkerque
    "M 510.1,240.1 L 540.2,264.7 L 596.7,291.2",                                                                         // A23 Lille→Valenciennes
    "M 596.7,291.2 L 640.0,264.7 L 687.1,236.4 L 728.5,217.5 L 752.9,198.5",                                            // A2 Valenciennes→Bruxelles
    "M 359.5,217.5 L 380.2,230.7 L 400.9,238.3 L 431.1,259.1",                                                          // N43 St-Omer→Bethune
    "M 457.4,304.4 L 417.9,295.0 L 374.6,287.4",                                                                         // N17 Arras→Saint-Pol
    "M 367.1,380.1 L 329.4,359.3 L 297.4,340.4 L 278.6,338.5",                                                          // A16 Amiens→Abbeville
    "M 542.1,325.2 L 570.4,312.0 L 596.7,291.2",                                                                         // Cambrai→Valenciennes
  ];

  const rivers = [
    "M 359.5,217.5 L 385.9,228.8 L 400.9,238.3 L 431.1,240.1 L 451.8,240.1 L 480.0,238.3 L 485.6,225.0",  // La Lys
    "M 457.4,304.4 L 480.0,293.1 L 513.9,289.3 L 536.5,291.2",                                              // La Scarpe
    "M 278.6,338.5 L 300.0,345.0 L 330.0,350.0 L 367.1,364.9 L 367.1,380.1",                               // La Somme
    "M 231.5,260.9 L 255.0,265.0 L 280.0,270.0 L 310.0,272.3",                                              // La Canche
    "M 596.7,291.2 L 580.0,310.0 L 560.0,326.0 L 542.1,330.9",                                              // L'Escaut
  ];
  const cities = [
    { name: "Dunkerque",    x: 381.6, y: 163.7},
    { name: "Calais",       x: 284.0, y: 179.4},
    { name: "Boulogne",     x: 238.1, y: 221.8},
    { name: "Le Touquet",   x: 232.5, y: 260.7},
    { name: "Montreuil",    x: 266.7, y: 271.5},
    { name: "Saint-Omer",   x: 359.0, y: 218.0},
    { name: "Aire-s-Lys",   x: 385.3, y: 238.7},
    { name: "Isbergues",    x: 397.2, y: 241.0},
    { name: "Hazebrouck",   x: 412.0, y: 222.3},
    { name: "Merville",     x: 430.8, y: 236.9},
    { name: "Lille",        x: 509.6, y: 240.3},
    { name: "Lens",         x: 467.6, y: 277.6},
    { name: "Bethune",      x: 431.1, y: 258.8},
    { name: "Bruay",        x: 413.0, y: 267.0},
    { name: "Arras",        x: 457.4, y: 303.9},
    { name: "Douai",        x: 513.7, y: 288.9},
    { name: "Valenciennes", x: 597.4, y: 291.6},
    { name: "Saint-Pol",    x: 373.8, y: 287.4},
    { name: "Abbeville",    x: 278.6, y: 339.3},
    { name: "Amiens",       x: 366.2, y: 379.3},
    { name: "Cambrai",      x: 543.0, y: 325.9},
    { name: "Reims",        x: 693.0, y: 490.0},
    { name: "Bruxelles",    x: 753.3, y: 198.5},
  ];
  const hqX = 401.4, hqY = 252.7;

  return (
    <>
      {}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={darkMode ? "#1A1D27" : "#EEF4F8"} rx={12} />

      {}
      <path d={`${coastline} L 800,0 L 0,0 Z`} fill="#D6E8F5" opacity={0.5} />
      <path d={coastline} fill="none" stroke="#7AAFC8" strokeWidth={1.8} opacity={0.85} />
      <text x={160} y={175} fontSize={9} fill="#5A90B0" fontStyle="italic" fontFamily="system-ui,sans-serif">Mer du Nord</text>
      <text x={160} y={265} fontSize={9} fill="#5A90B0" fontStyle="italic" fontFamily="system-ui,sans-serif">Manche</text>

      {}
      <circle cx={hqX} cy={hqY} r={255}
        fill="rgba(255,107,53,0.02)" stroke="#FF6B35" strokeWidth={1}
        strokeDasharray="8 5" opacity={0.4} />
      {}
      <circle cx={hqX} cy={hqY} r={68}
        fill="rgba(255,107,53,0.05)" stroke="#FF6B35" strokeWidth={1}
        strokeDasharray="4 3" opacity={0.55} />

      {}
      {rivers.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#7AAFC8" strokeWidth={1.6} opacity={0.6} />
      ))}

      {}
      {roads.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#B8CCD8" strokeWidth={2} opacity={0.9} />
      ))}

      {}
      {[100,200,300,400,500,600,700].map(x => (
        <line key={x} x1={x} y1={0} x2={x} y2={SVG_H} stroke="#D0DDE8" strokeWidth={0.4} opacity={0.35} />
      ))}
      {[100,200,300,400,500].map(y => (
        <line key={y} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#D0DDE8" strokeWidth={0.4} opacity={0.35} />
      ))}

      {}
      {cities.map(c => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r={2.2} fill="#8AAABB" opacity={0.75} />
          <text x={c.x + 5} y={c.y + 4} fontSize={8.5} fill="#6A8898" fontWeight={500} fontFamily="system-ui,sans-serif">{c.name}</text>
        </g>
      ))}

      {}
      <text x={hqX + 71} y={hqY - 3} fontSize={7.5} fill="#FF6B35" opacity={0.65} fontFamily="system-ui,sans-serif">40 km</text>
      <text x={hqX + 257} y={hqY - 3} fontSize={7.5} fill="#FF6B35" opacity={0.45} fontFamily="system-ui,sans-serif">150 km</text>

      {}
      <g transform={`translate(${SVG_W - 28}, 24)`}>
        <circle r={14} fill="rgba(255,255,255,0.9)" stroke="#C8D8E4" strokeWidth={1} />
        <text textAnchor="middle" y={5} fontSize={13} fill="#5A7A8A" fontWeight={700} fontFamily="system-ui,sans-serif">N↑</text>
      </g>

      {}
      <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize={8.5} fill="#A0B4C4" fontFamily="system-ui,sans-serif">Nord de la France . Zone 150 km autour de Lillers 62190</text>
    </>
  );};

function MapView({ chantiers: propChantiers , darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const chantiers = propChantiers.filter(c => c.lat && c.lng);
  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [filterStatut, setFilterStatut] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0});
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const svgRef = useRef(null);

  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 5;

  const zoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + 0.5).toFixed(1))));
  const zoomOut = () => { setZoom(z => { const nz = Math.max(MIN_ZOOM, parseFloat((z - 0.5).toFixed(1))); if (nz === MIN_ZOOM) setPan({ x: 0, y: 0}); return nz;});};
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0});};
  const onWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn(); else zoomOut();};
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y};};
  const onMouseMove = (e) => {
    if (!isPanning || !panStart.current) return;
    const maxPanX = (zoom - 1) * SVG_W / 2;
    const maxPanY = (zoom - 1) * SVG_H / 2;
    const nx = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - panStart.current.x));
    const ny = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - panStart.current.y));
    setPan({ x: nx, y: ny});};
  const onMouseUp = () => { setIsPanning(false); panStart.current = null;};

  const HQ = geoToSvg(50.5637, 2.4823);

  const filteredChantiers = filterStatut === "all"
    ? chantiers
    : chantiers.filter(c => c.statut === filterStatut);
  const getMarkerPos = (chantiers) => {
    const positions = {};
    return chantiers.map(c => {
      const key = `${c.lat.toFixed(3)}_${c.lng.toFixed(3)}`;
      const count = positions[key] || 0;
      positions[key] = count + 1;
      const offsets = [
        [0, 0], [22, 0], [-22, 0], [0, -22], [0, 22],
        [16, -16], [-16, -16], [16, 16], [-16, 16]
      ];
      const [ox, oy] = offsets[Math.min(count, offsets.length - 1)];
      const base = geoToSvg(c.lat, c.lng);
      return { ...c, _sx: base.x + ox, _sy: base.y + oy};});};

  const positionedChantiers = getMarkerPos(filteredChantiers);
  const distFromLillers = (c) => {
    const R = 6371;
    const dLat = ((c.lat - 50.5637) * Math.PI) / 180;
    const dLng = ((c.lng - 2.4823) * Math.PI) / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos((50.5637*Math.PI)/180) * Math.cos((c.lat*Math.PI)/180) * Math.sin(dLng/2)**2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(a)));};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {}
      <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div>
            <h3 style={{margin:0,fontSize:16,fontWeight:700,color:T.text}}>🗺️ Carte des chantiers — Pas-de-Calais 62</h3>
            <div style={{fontSize:12,color:T.text3,marginTop:2}}>Carte vectorielle . Centre sur Lillers 62190 . Cliquez sur un chantier</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Badge text={`${chantiers.length} chantiers`} color="#FF6B35" bg="#FFF7ED" />
            <Badge text="40 km rayon" color="#3B82F6" bg="#EFF6FF" />
          </div>
        </div>

        {}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          <button onClick={() => setFilterStatut("all")} style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${filterStatut === "all" ? "#FF6B35" : "#E5E7EB"}`, background: filterStatut === "all" ? (darkMode ? T.rowHover : "#FFF7ED") : T.card, color: filterStatut === "all" ? "#FF6B35" : "#6B7280", cursor: "pointer", fontSize: 12, fontWeight: 600}}>Tous ({chantiers.length})</button>
          {Object.entries(STATUT_CONFIG).map(([k, v]) => {
            const n = chantiers.filter(c => c.statut === k).length;
            if (!n) return null;
            return (
              <button key={k} onClick={() => setFilterStatut(k)} style={{ padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${filterStatut === k ? v.color : "#E5E7EB"}`, background: filterStatut === k ? v.bg : T.card, color: filterStatut === k ? v.color : "#6B7280", cursor: "pointer", fontSize: 12, fontWeight: 600}}>
                <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:v.color,marginRight:5}} />{v.label} ({n})
              </button>
            );})}
        </div>

        {}
        <div
          style={{position:"relative",borderRadius:14,overflow:"hidden",border:"1.5px solid #D4E2EF",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",background:"#EEF4F8",userSelect:"none"}}
          onWheel={onWheel}
        >
          {}
          <div style={{position:"absolute",top:12,right:12,zIndex:20,display:"flex",flexDirection:"column",gap:4}}>
            <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom +" style={{width:32,height:32,borderRadius:8,border:"1px solid #D4E2EF",background:T.card,cursor:zoom >= MAX_ZOOM ? "not-allowed" :"pointer",fontSize:18,fontWeight:700,color:zoom >= MAX_ZOOM ? "#C0C0C0" :"#1A1A2E",boxShadow:"0 1px 4px rgba(0,0,0,0.1)",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom −" style={{width:32,height:32,borderRadius:8,border:"1px solid #D4E2EF",background:T.card,cursor:zoom <= MIN_ZOOM ? "not-allowed" :"pointer",fontSize:20,fontWeight:700,color:zoom <= MIN_ZOOM ? "#C0C0C0" :"#1A1A2E",boxShadow:"0 1px 4px rgba(0,0,0,0.1)",lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <button onClick={resetView} title="Reinitialiser" style={{width:32,height:32,borderRadius:8,border:"1px solid #D4E2EF",background:zoom > 1 ? (darkMode ? T.rowHover :"#FFF7ED") :T.card,cursor:"pointer",fontSize:13,color:zoom > 1 ? "#FF6B35" :"#9CA3AF",boxShadow:"0 1px 4px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>⌂</button>
          </div>
          {}
          {zoom > 1 && (
            <div style={{position:"absolute",top:12,left:60,zIndex:20,background:"rgba(255,107,53,0.9)",color:"#fff",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>
              x{zoom.toFixed(1)} — Glissez pour deplacer
            </div>
          )}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{width:"100%",display:"block",cursor:zoom > 1 ? (isPanning ? "grabbing" :"grab") :"default"}}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <g transform={`translate(${SVG_W/2 + pan.x}, ${SVG_H/2 + pan.y}) scale(${zoom}) translate(${-SVG_W/2}, ${-SVG_H/2})`}>
            <PAS_DE_CALAIS_SVG darkMode={darkMode} />

            {}
            <g transform={`translate(${HQ.x}, ${HQ.y})`}>
              <circle r={18} fill={darkMode ? "#2A2D3A" : "#1A1A2E"} stroke="#FF6B35" strokeWidth={3} opacity={0.9} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={13}>🏢</text>
            </g>

            {}
            {positionedChantiers.filter(c => c.statut === "en_cours").map(c => (
              <line key={c.id} x1={HQ.x} y1={HQ.y} x2={c._sx} y2={c._sy}
                stroke="#FF6B35" strokeWidth={1} strokeDasharray="4 4" opacity={0.25} />
            ))}

            {}
            {positionedChantiers.map(c => {
              const p = { x: c._sx, y: c._sy};
              const sc = STATUT_CONFIG[c.statut];
              const color = sc?.color || "#FF6B35";
              const isSelected = selected?.id === c.id;
              const isHovered = hoveredId === c.id;
              const scale = isSelected || isHovered ? 1.25 : 1;

              return (
                <g key={c.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  style={{cursor:"pointer"}}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}>
                  {}
                  {(isSelected || isHovered) && (
                    <circle r={22 * scale} fill={color} opacity={0.15} />
                  )}
                  {}
                  <g transform={`scale(${scale}) translate(-10, -28)`}>
                    <path d="M10 0 C4.5 0 0 4.5 0 10 C0 17 10 28 10 28 C10 28 20 17 20 10 C20 4.5 15.5 0 10 0 Z"
                      fill={color} stroke="#fff" strokeWidth={2} filter={isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"} />
                    <text x="10" y="13" textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#fff">🏗</text>
                  </g>
                  {}
                  <g transform={`translate(8, -28)`}>
                    <rect x={0} y={0} width={24} height={13} rx={6} fill="#fff" stroke={color} strokeWidth={1.5} />
                    <text x="12" y="9.5" textAnchor="middle" fontSize={8} fontWeight={800} fill={color} fontFamily="system-ui,sans-serif">{c.progression}%</text>
                  </g>
                  {}
                  {isHovered && !isSelected && (
                    <g transform="translate(0, -50)">
                      <rect x={-40} y={-12} width={80} height={16} rx={4} fill="rgba(26,26,46,0.85)" />
                      <text textAnchor="middle" y={-1} fontSize={9} fill="#fff" fontFamily="system-ui,sans-serif">{c.ville}</text>
                    </g>
                  )}
                </g>
              );})}

            {}
            <g transform={`translate(14, ${SVG_H - 85})`}>
              <rect x={-6} y={-14} width={130} height={76} rx={8} fill="rgba(255,255,255,0.92)" stroke="#E5E7EB" strokeWidth={1} />
              <text x={0} y={0} fontSize={9} fontWeight={700} fill="#6B7280" fontFamily="system-ui,sans-serif">LEGENDE</text>
              {[
                { color: "#FF6B35", label: "En cours"},
                { color: "#3B82F6", label: "Planifie"},
                { color: "#22C55E", label: "Termine"},
                { color: "#EF4444", label: "Retard"},
              ].map((item, i) => (
                <g key={i} transform={`translate(0, ${14 + i * 14})`}>
                  <circle r={5} fill={item.color} />
                  <text x={12} y={4.5} fontSize={9} fill="#374151" fontFamily="system-ui,sans-serif">{item.label}</text>
                </g>
              ))}
            </g>
            </g>{}
          </svg>

          {}
          {selected && (
            <div style={{position:"absolute",bottom:12,left:12,right:12,maxWidth:420,margin:"0 auto",background:T.card,borderRadius:14,padding:"16px 18px",boxShadow:"0 8px 32px rgba(0,0,0,0.16)",border:"1px solid rgba(255,107,53,0.2)",zIndex:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:2}}>{selected.nom}</div>
                  <div style={{fontSize:12,color:T.text2}}>📍 {selected.adresse}</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",marginLeft:10,flexShrink:0}}>
                  <Badge text={STATUT_CONFIG[selected.statut]?.label} color={STATUT_CONFIG[selected.statut]?.color} bg={STATUT_CONFIG[selected.statut]?.bg} />
                  <button onClick={() => setSelected(null)} style={{background:T.input,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:14,lineHeight:1}}>x</button>
                </div>
              </div>
              <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
                <span style={{fontSize:12,color:T.text2}}>📅 {selected.date}</span>
                <span style={{fontSize:12,color:T.text2}}>🕐 {selected.heure}</span>
                <span style={{fontSize:12,color:T.text2}}>⏱️ {selected.duree}j</span>
                <span style={{fontSize:12,color:T.text2}}>👤 {selected.responsable}</span>
                <span style={{fontSize:12,color:"#FF6B35",fontWeight:600}}>📏 {distFromLillers(selected)} km</span>
              </div>
              <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                {(selected.equipes || []).map(eId => {
                  const t = INITIAL_TEAMS.find(t => t.id === eId);
                  return t ? <span key={eId} style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:t.color + "15",color:t.color,fontWeight:700}}>{t.icon} {t.name}</span> : null;})}
              </div>
              <div style={{marginTop:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:T.text3}}>Progression</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#FF6B35"}}>{selected.progression}%</span>
                </div>
                <ProgressBar value={selected.progression} height={6} />
              </div>
              {selected.notes && (
                <div style={{marginTop:8,padding:"6px 10px",background:"#FFF7ED",borderRadius:8,fontSize:12,color:T.text,borderLeft:"3px solid #FF6B35"}}>{selected.notes}</div>
              )}
              <div style={{marginTop:12,padding:"8px 12px",background:"#F0FDF4",borderRadius:8,fontSize:12,color:"#166534",display:"flex",alignItems:"center",gap:6}}>
                <span>🗺️</span>
                <span>Itineraire estime depuis Lillers : <strong>{Math.round(distFromLillers(selected) * 1.3)} km</strong> . ~<strong>{Math.round(distFromLillers(selected) * 1.3 / 80 * 60)} min</strong> en voiture</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Tous les chantiers — Pas-de-Calais</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px, 1fr))",gap:8}}>
          {chantiers.map(c => {
            const sc = STATUT_CONFIG[c.statut];
            const isActive = selected?.id === c.id;
            return (
              <div key={c.id}
                onClick={() => setSelected(isActive ? null : c)}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${isActive ? sc?.color : "#F3F4F6"}`, background: isActive ? sc?.bg : T.input, cursor: "pointer", transition: "all 0.15s"}}>
                <div style={{fontWeight:600,fontSize:13,color:T.text,marginBottom:3}}>{c.nom}</div>
                <div style={{fontSize:11,color:T.text3,marginBottom:6}}>📍 {c.ville} . {distFromLillers(c)} km</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <Badge text={sc?.label} color={sc?.color} bg={sc?.bg} />
                  <span style={{fontSize:11,color:"#FF6B35",fontWeight:700}}>{c.progression}%</span>
                </div>
              </div>
            );})}
        </div>
      </div>
    </div>
  );}

function Calendar({ chantiers, onSelectChantier, onNewChantier, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear]   = useState(today.getFullYear());
  const [selectedDay, setSelectedDay]   = useState(null);

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDay    = (m, y) => (new Date(y, m, 1).getDay() + 6) % 7;
  const days    = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDay(currentMonth, currentYear);

  const dateStr = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getChantierForDay = (day) => {
    const d = new Date(dateStr(day));
    return chantiers.filter(c => {
      const start = new Date(c.date);
      const end   = new Date(start);
      end.setDate(end.getDate() + (c.duree || 1) - 1);
      return d >= start && d <= end;});};

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1);} else setCurrentMonth(m => m - 1);};
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1);} else setCurrentMonth(m => m + 1);};

  const dayChantiersSel = selectedDay ? getChantierForDay(selectedDay) : [];

  return (
    <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
      {}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700,color:T.text}}>📅 Planning</h3>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={prevMonth} style={{background:T.input,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:14}}>‹</button>
          <span style={{fontWeight:700,color:T.text,fontSize:15,minWidth:140,textAlign:"center"}}>{MONTHS[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} style={{background:T.input,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:14}}>›</button>
        </div>
      </div>

      {}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2,marginBottom:4}}>
        {DAYS.map(d => <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:T.text3,padding:"4px 0",textTransform:"uppercase"}}>{d}</div>)}
      </div>

      {}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2}}>
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} style={{height:60}} />)}
        {Array(days).fill(null).map((_, i) => {
          const day = i + 1;
          const dayCh = getChantierForDay(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const isSel = selectedDay === day;
          return (
            <div key={day}
              onClick={() => setSelectedDay(isSel ? null : day)}
              style={{minHeight:60,padding:"4px",borderRadius:8,position:"relative",cursor:"pointer",background:isSel ? "#FFF0E8" :isToday ? "#FFF7ED" :"#FAFAFA",border:isSel ? "1.5px solid #FF6B35" :isToday ? "1.5px solid #FFD0B8" :"1px solid #F3F4F6",transition:"all 0.1s"}}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#FFF7ED";}}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isToday ? "#FFF7ED" : "#FAFAFA";}}>
              <div style={{fontSize:11,fontWeight:isToday ? 700 :500,color:isToday ? "#FF6B35" :"#374151",marginBottom:2}}>{day}</div>
              {dayCh.slice(0, 2).map((c, ci) => {
                const team = INITIAL_TEAMS.find(t => c.equipes?.includes(t.id));
                const sc = STATUT_CONFIG[c.statut];
                return (
                  <div key={ci} style={{fontSize:8,padding:"1px 4px",borderRadius:4,marginBottom:1,background:(sc?.color || "#FF6B35") + "22",color:sc?.color || "#FF6B35",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.nom.split(" ").slice(0, 2).join(" ")}
                  </div>
                );})}
              {dayCh.length > 2 && <div style={{fontSize:8,color:T.text3}}>+{dayCh.length - 2}</div>}
              {}
              {dayCh.length === 0 && (
                <div onClick={e => { e.stopPropagation(); onNewChantier && onNewChantier(dateStr(day));}}
                  style={{position:"absolute",bottom:3,right:3,width:16,height:16,borderRadius:4,background:"#FF6B35",color:"#fff",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.15s",lineHeight:1}}
                  className="add-btn">+</div>
              )}
            </div>
          );})}
      </div>

      {}
      {selectedDay && (
        <div style={{marginTop:16,borderTop:"1px solid #F3F4F6",paddingTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>
              {selectedDay} {MONTHS[currentMonth]} {currentYear}
            </div>
            <button
              onClick={() => onNewChantier && onNewChantier(dateStr(selectedDay))}
              style={{padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #FF6B35, #E85D04)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              + Nouveau chantier ce jour
            </button>
          </div>
          {dayChantiersSel.length === 0 ? (
            <div style={{textAlign:"center",padding:"16px 0",color:T.text3,fontSize:13}}>Aucun chantier ce jour</div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {dayChantiersSel.map(c => {
                const sc = STATUT_CONFIG[c.statut];
                const pc = PRIORITE_CONFIG[c.priorite];
                return (
                  <div key={c.id}
                    onClick={() => onSelectChantier && onSelectChantier(c)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: sc?.bg || "#F8F9FA", border: `1px solid ${sc?.color || "#E5E7EB"}22`, cursor: "pointer", transition: "all 0.15s"}}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{width:36,height:36,borderRadius:10,background:(sc?.color || "#FF6B35") + "18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏗️</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nom}</div>
                      <div style={{fontSize:11,color:T.text3}}>📍 {c.ville} . 🕐 {c.heure} . ⏱ {c.duree}j</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:sc?.bg,color:sc?.color,fontWeight:700}}>{sc?.label}</span>
                      <span style={{fontSize:10,color:pc?.color,fontWeight:600}}>● {pc?.label}</span>
                    </div>
                    <div style={{width:50,flexShrink:0}}>
                      <div style={{background:T.input,borderRadius:999,height:5,overflow:"hidden"}}>
                        <div style={{ width: `${c.progression}%`, height: "100%", background: sc?.color, borderRadius: 999}} />
                      </div>
                      <div style={{fontSize:9,color:T.text3,textAlign:"center",marginTop:2}}>{c.progression}%</div>
                    </div>
                    <div style={{fontSize:11,color:T.text3,flexShrink:0}}>✏️</div>
                  </div>
                );})}
            </div>
          )}
        </div>
      )}
      <style>{`.add-btn { opacity: 0 !important;} div:hover > .add-btn { opacity: 1 !important;}`}</style>
    </div>
  );}

function PersonnelView({ teams, setTeams , darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [editingMember, setEditingMember] = useState(null);
  const [addingToTeam, setAddingToTeam] = useState(null);
  const [newMember, setNewMember] = useState({ nom: "", poste: "", tel: "", statut: "actif"});
  const STATUT_MEMBRE = { actif: { label: "Actif", color: "#22C55E", bg: "#F0FDF4"}, conge: { label: "Conge", color: "#F59E0B", bg: "#FFFBEB"}, maladie: { label: "Maladie", color: "#EF4444", bg: "#FEF2F2"}};
  const inputStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${T.border2}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.input, boxSizing: "border-box", color: T.text};
  const [confirmDelete, setConfirmDelete] = useState(null); // { teamId, memberId, nom}
  const deleteMember = (teamId, memberId) => {
    const newTeams = teams.map(t => t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== memberId)} : t);
    setTeams(newTeams);
    saveTeamsDB(newTeams);
    setConfirmDelete(null);};
  const saveMember = (teamId, member) => {
    const newTeams = teams.map(t => t.id === teamId ? { ...t, members: t.members.map(m => m.id === member.id ? member : m)} : t);
    setTeams(newTeams);
    saveTeamsDB(newTeams);
    setEditingMember(null);};
  const addMember = (teamId) => {
    if (!newMember.nom.trim()) return;
    const member = { ...newMember, id: Date.now()};
    const newTeams = teams.map(t => t.id === teamId ? { ...t, members: [...t.members, member]} : t);
    setTeams(newTeams);
    saveTeamsDB(newTeams);
    setNewMember({ nom: "", poste: "", tel: "", statut: "actif"});
    setAddingToTeam(null);};
  const totalPersonnel = teams.reduce((s, t) => s + t.members.length, 0);
  const totalActifs = teams.reduce((s, t) => s + t.members.filter(m => m.statut === "actif").length, 0);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px, 1fr))",gap:12,marginBottom:24}}>
        <StatCard icon="👷" label="Total personnel" value={totalPersonnel} color="#FF6B35" />
        <StatCard icon="✅" label="Disponibles" value={totalActifs} sub={`${totalPersonnel - totalActifs} indisponibles`} color="#22C55E" />
        <StatCard icon="🏗️" label="Equipes" value={teams.length} color="#3B82F6" />
      </div>
      {teams.map(team => (
        <div key={team.id} style={{ background: T.card, borderRadius: 16, padding: 22, marginBottom: 16, boxShadow: `0 1px 3px ${T.shadow}`, border: `1px solid ${T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:12,background:team.color + "18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{team.icon}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16,color:T.text}}>Equipe {team.name}</div>
                <div style={{fontSize:12,color:T.text2}}>{team.members.filter(m => m.statut === "actif").length} actifs . {team.members.length} au total</div>
              </div>
            </div>
            <button onClick={() => setAddingToTeam(team.id)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #FF6B35, #E85D04)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>+ Ajouter</button>
          </div>
          {addingToTeam === team.id && (
            <div style={{background:"#FFF7ED",borderRadius:12,padding:16,marginBottom:14,border:"1px solid #FFE4D6"}}>
              <div style={{fontWeight:700,fontSize:13,color:"#FF6B35",marginBottom:12}}>Nouveau membre</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <input style={inputStyle} placeholder="Nom Prenom" value={newMember.nom} onChange={e => setNewMember(n => ({ ...n, nom: e.target.value}))} />
                <input style={inputStyle} placeholder="Poste" value={newMember.poste} onChange={e => setNewMember(n => ({ ...n, poste: e.target.value}))} />
                <input style={inputStyle} placeholder="Telephone" value={newMember.tel} onChange={e => setNewMember(n => ({ ...n, tel: e.target.value}))} />
                <select style={inputStyle} value={newMember.statut} onChange={e => setNewMember(n => ({ ...n, statut: e.target.value}))}>
                  {Object.entries(STATUT_MEMBRE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <button onClick={() => addMember(team.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#FF6B35",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>Enregistrer</button>
                <button onClick={() => setAddingToTeam(null)} style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${T.border2}`, background: T.card, cursor: "pointer", fontSize: 13, color: T.text2}}>Annuler</button>
              </div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {team.members.map(member => {
              const sm = STATUT_MEMBRE[member.statut] || STATUT_MEMBRE.actif;
              const isEditing = editingMember?.member?.id === member.id && editingMember?.teamId === team.id;
              return (
                <div key={member.id}>
                  {isEditing ? (
                    <div style={{background:T.input,borderRadius:10,padding:14,border:"1.5px solid #FF6B35"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        <input style={inputStyle} value={editingMember.member.nom} onChange={e => setEditingMember(em => ({ ...em, member: { ...em.member, nom: e.target.value}}))} placeholder="Nom" />
                        <input style={inputStyle} value={editingMember.member.poste} onChange={e => setEditingMember(em => ({ ...em, member: { ...em.member, poste: e.target.value}}))} placeholder="Poste" />
                        <input style={inputStyle} value={editingMember.member.tel} onChange={e => setEditingMember(em => ({ ...em, member: { ...em.member, tel: e.target.value}}))} placeholder="Telephone" />
                        <select style={inputStyle} value={editingMember.member.statut} onChange={e => setEditingMember(em => ({ ...em, member: { ...em.member, statut: e.target.value}}))}>
                          {Object.entries(STATUT_MEMBRE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button onClick={() => saveMember(team.id, editingMember.member)} style={{padding:"7px 16px",borderRadius:8,border:"none",background:"#FF6B35",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:12}}>✓ Sauvegarder</button>
                        <button onClick={() => setEditingMember(null)} style={{ padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${T.border2}`, background: T.card, cursor: "pointer", fontSize: 12, color: T.text2}}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: T.input, border: `1px solid ${T.border}`}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:team.color + "20",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:team.color,flexShrink:0}}>{member.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:T.text}}>{member.nom}</div>
                        <div style={{fontSize:11,color:T.text3}}>{member.poste}{member.tel ? ` . ${member.tel}` : ""}</div>
                      </div>
                      <Badge text={sm.label} color={sm.color} bg={sm.bg} />
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        {confirmDelete?.memberId === member.id ? (
                          <div style={{display:"flex",gap:4,alignItems:"center",background:"#FEF2F2",border:"1px solid #FEE2E2",borderRadius:8,padding:"4px 8px"}}>
                            <span style={{fontSize:11,color:"#EF4444",fontWeight:600}}>Supprimer ?</span>
                            <button onClick={() => deleteMember(team.id, member.id)} style={{padding:"2px 8px",borderRadius:6,border:"none",background:"#EF4444",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>Oui</button>
                            <button onClick={() => setConfirmDelete(null)} style={{padding:"2px 8px",borderRadius:6,border:"1px solid #E5E7EB",background:T.card,cursor:"pointer",fontSize:11,color:T.text2}}>Non</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setEditingMember({ teamId: team.id, member: { ...member}})} style={{width:30,height:30,borderRadius:7,border:"1px solid #E5E7EB",background:T.card,cursor:"pointer",fontSize:13}}>✏️</button>
                            <button onClick={() => setConfirmDelete({ teamId: team.id, memberId: member.id, nom: member.nom})} style={{width:30,height:30,borderRadius:7,border:"1px solid #FEE2E2",background:"#FEF2F2",cursor:"pointer",fontSize:13}}>🗑️</button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );})}
            {team.members.length === 0 && <div style={{textAlign:"center",padding:20,color:T.text3,fontSize:13}}>Aucun membre — cliquez sur + Ajouter</div>}
          </div>
        </div>
      ))}
    </div>
  );}

function TeamView({ chantiers, teams , darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {teams.map(team => {
        const teamChantiers = chantiers.filter(c => c.equipes.includes(team.id));
        const active = teamChantiers.filter(c => c.statut === "en_cours").length;
        const actifs = team.members.filter(m => m.statut === "actif").length;
        return (
          <div key={team.id} style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:team.color + "15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{team.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:T.text}}>Equipe {team.name}</div>
                  <div style={{fontSize:12,color:T.text2}}>{team.members.length} membres . {active} chantier{active > 1 ? "s" : ""} actif{active > 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Badge text={`${actifs} dispo`} color={team.color} bg={team.color + "15"} />
                <Badge text={`${teamChantiers.length} chantiers`} color="#6B7280" bg="#F3F4F6" />
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
              {team.members.map(m => {
                const statutColor = m.statut === "actif" ? "#22C55E" : m.statut === "conge" ? "#F59E0B" : "#EF4444";
                return <div key={m.id} style={{padding:"4px 10px",borderRadius:20,background:T.input,fontSize:12,color:T.text,fontWeight:500,display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",background:statutColor,display:"inline-block"}} />{m.nom}</div>;})}
            </div>
            {teamChantiers.length > 0 ? (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {teamChantiers.map(c => {
                  const sc = STATUT_CONFIG[c.statut];
                  return (
                    <div key={c.id} style={{ padding: "10px 14px", borderRadius: 10, background: T.input, border: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:T.text}}>{c.nom}</div>
                        <div style={{fontSize:11,color:T.text3}}>📍 {c.ville} . 📅 {c.date}</div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <Badge text={sc.label} color={sc.color} bg={sc.bg} />
                        <div style={{width:80}}><ProgressBar value={c.progression} color={team.color} height={4} /></div>
                      </div>
                    </div>
                  );})}
              </div>
            ) : <div style={{textAlign:"center",padding:"20px",color:T.text3,fontSize:13}}>Aucun chantier assigne</div>}
          </div>
        );})}
    </div>
  );}
const WMO_CODES = {
  0:"Clair",1:"Peu nuageux",2:"Partiellement nuageux",3:"Couvert",
  45:"Brouillard",51:"Bruine legere",53:"Bruine",55:"Bruine dense",
  61:"Pluie legere",63:"Pluie",65:"Pluie forte",
  71:"Neige legere",73:"Neige",75:"Neige forte",
  80:"Averses legeres",81:"Averses",82:"Averses fortes",
  95:"Orage",96:"Orage avec grele",};
const WMO_ICON = {
  0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",
  51:"🌦️",53:"🌦️",55:"🌧️",61:"🌦️",63:"🌧️",65:"🌧️",
  71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",
  95:"⛈️",96:"⛈️",};
const VILLE_COORDS = {
  "lillers":[50.5637,2.4823],"bethune":[50.5313,2.6403],"bethune":[50.5313,2.6403],
  "aire-sur-la-lys":[50.6378,2.3967],"aire":[50.6378,2.3967],
  "saint-omer":[50.7480,2.2572],"isbergues":[50.6256,2.4603],
  "merville":[50.6469,2.6387],"bruay":[50.4881,2.5443],
  "hazebrouck":[50.7243,2.5388],"lens":[50.4320,2.8340],
  "arras":[50.2929,2.7797],"calais":[50.9513,1.8587],
  "boulogne":[50.7270,1.6151],"dunkerque":[51.0343,2.3770],
  "lille":[50.6292,3.0573],"amiens":[49.8941,2.2957],};
function generateMeteo(ville) {
  const now = new Date();
  const month = now.getMonth();
  const norm = s => (s||"").toLowerCase().trim().replace(/[eeee]/g,"e").replace(/[aaa]/g,"a").replace(/c/g,"c");
  const key = norm(ville);
  let [lat] = Object.entries(VILLE_COORDS).find(([k])=>key.includes(k)||k.includes(key))?.[1] || [50.56];
  const NORMALS = [
    {tMoy:4, tAmp:4, rain:55, wind:30, sunH:8},   // jan
    {tMoy:5, tAmp:4, rain:50, wind:28, sunH:9},   // fev
    {tMoy:8, tAmp:5, rain:48, wind:26, sunH:11},  // mar
    {tMoy:11,tAmp:6, rain:42, wind:22, sunH:14},  // avr
    {tMoy:15,tAmp:6, rain:48, wind:20, sunH:16},  // mai
    {tMoy:18,tAmp:6, rain:48, wind:18, sunH:17},  // jun
    {tMoy:20,tAmp:5, rain:45, wind:16, sunH:16},  // jul
    {tMoy:20,tAmp:5, rain:48, wind:17, sunH:15},  // aou
    {tMoy:17,tAmp:5, rain:52, wind:22, sunH:12},  // sep
    {tMoy:13,tAmp:4, rain:58, wind:26, sunH:10},  // oct
    {tMoy:8, tAmp:3, rain:60, wind:29, sunH:8},   // nov
    {tMoy:5, tAmp:3, rain:58, wind:31, sunH:7},   // dec
  ];
  const N = NORMALS[month];
  const seed = now.getDate() * 31 + now.getMonth() * 12 + ville.length;
  const rng = (s) => { let x = Math.sin(s*9301+49297)*233280; return x-Math.floor(x);};
  const dayCode = rng(seed) < N.rain/100
    ? (rng(seed+1) < 0.3 ? 63 : rng(seed+1) < 0.6 ? 61 : 80)
    : (rng(seed+2) < 0.3 ? 3  : rng(seed+2) < 0.6 ? 2  : rng(seed+2) < 0.8 ? 1 : 0);

  const tBase = N.tMoy + (rng(seed+3)-0.5)*6;
  const windBase = N.wind + (rng(seed+4)-0.5)*14;
  const daily = [];
  for (let d = 0; d < 3; d++) {
    const ds = seed + d*7;
    const dc = rng(ds) < N.rain/100 ? (rng(ds+1)<0.4?63:61) : (rng(ds+2)<0.35?3:rng(ds+2)<0.65?2:1);
    const tMax = Math.round(tBase + N.tAmp/2 + d*(rng(ds+3)-0.4)*2);
    const tMin = Math.round(tBase - N.tAmp/2);
    const rainAmt = dc >= 61 ? Math.round(rng(ds+4)*8*10)/10 : 0;
    const wMax = Math.round(windBase + (rng(ds+5)-0.5)*12);
    const dt = new Date(now); dt.setDate(dt.getDate()+d);
    const dateStr = dt.toISOString().slice(0,10);
    const sunriseH = Math.round(6 + (1-month/6)*1.5);
    const sunsetH  = Math.round(18 + (month<6?month:12-month)*0.5);
    daily.push({
      date: dateStr, code: dc, tMax, tMin,
      rain: rainAmt, wind: wMax,
      sunrise: `0${sunriseH}:${Math.round(rng(ds+6)*30+10)}`.slice(-5),
      sunset:  `${sunsetH}:${Math.round(rng(ds+7)*30+10)}`.padStart(5,"0"),});}
  const hourly = { time:[], temperature_2m:[], apparent_temperature:[], precipitation_probability:[],
    precipitation:[], weathercode:[], windspeed_10m:[], winddirection_10m:[], relativehumidity_2m:[], uv_index:[]};

  for (let d = 0; d < 3; d++) {
    const dt = new Date(now); dt.setDate(dt.getDate()+d);
    const dateStr = dt.toISOString().slice(0,10);
    const dc = daily[d].code;
    for (let h = 0; h < 24; h++) {
      const hs = seed + d*100 + h;
      const tHour = tBase + N.tAmp * Math.sin((h-6)/24*Math.PI*2) + (rng(hs)-0.5)*2;
      const feelOffset = -(rng(hs+1)*3);
      const rainProb = dc>=61 ? Math.round(40+rng(hs+2)*50) : dc>=80 ? Math.round(20+rng(hs+2)*40) : Math.round(rng(hs+2)*25);
      const rainMm = rainProb > 60 ? Math.round(rng(hs+3)*3*10)/10 : 0;
      const windH = Math.round(windBase + 5*Math.sin(h/12*Math.PI) + (rng(hs+4)-0.5)*8);
      const windDir = Math.round(200 + (rng(hs+5)-0.5)*80);
      const hum = Math.round(70 + (rng(hs+6)-0.5)*20);
      const uvH = h>=N.sunH && h<=20 ? Math.round(Math.sin((h-N.sunH)/(20-N.sunH)*Math.PI)*5*(1-month>5?0:0.3)*10)/10 : 0;
      hourly.time.push(`${dateStr}T${String(h).padStart(2,"0")}:00`);
      hourly.temperature_2m.push(Math.round(tHour*10)/10);
      hourly.apparent_temperature.push(Math.round((tHour+feelOffset)*10)/10);
      hourly.precipitation_probability.push(rainProb);
      hourly.precipitation.push(rainMm);
      let hCode = dc;
      if (dc <= 3) {
        if (h < 8 || h > 20) hCode = 1;
        else if (h < 11) hCode = rng(hs+10) < 0.7 ? 0 : 1;
        else if (h < 15) hCode = rng(hs+10) < 0.5 ? 1 : 2;
        else hCode = rng(hs+10) < 0.4 ? 2 : 3;} else if (dc === 61 || dc === 63) {
        if (h < 7) hCode = rng(hs+10) < 0.5 ? 2 : 61;
        else if (h < 12) hCode = rng(hs+10) < 0.5 ? 61 : 80;
        else if (h < 18) hCode = rng(hs+10) < 0.5 ? 63 : 61;
        else hCode = rng(hs+10) < 0.4 ? 80 : 61;} else if (dc === 80) {
        hCode = rng(hs+10) < 0.4 ? 80 : rng(hs+10) < 0.7 ? 2 : 3;}
      hourly.weathercode.push(hCode);
      hourly.windspeed_10m.push(windH);
      hourly.winddirection_10m.push(windDir);
      hourly.relativehumidity_2m.push(hum);
      hourly.uv_index.push(uvH);}}

  return { hourly, daily};}

function WeatherDashboard({ chantiers, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [data, setData] = useState({});
  const [selectedVille, setSelectedVille] = useState(null);
  const norm = s => (s||"").toLowerCase().trim().replace(/[eeee]/g,"e").replace(/[aaa]/g,"a").replace(/c/g,"c");

  const villes = ["Lillers", ...new Set(
    chantiers.filter(c=>c.statut==="en_cours"||c.statut==="planifie")
      .map(c=>c.ville).filter(v=>norm(v)!=="lillers")
  )].slice(0,5);

  useEffect(() => {
    const d = {};
    villes.forEach(v => { d[v] = generateMeteo(v);});
    setData(d);
    if (!selectedVille) setSelectedVille(villes[0]);}, []);

  const active = selectedVille || villes[0];
  const d = data[active];
  const getTempColor = t => t<=0?"#93C5FD":t<=10?"#BAE6FD":t<=20?"#86EFAC":t<=28?"#FDE68A":"#FCA5A5";

  const getCurHour = () => {
    if (!d?.hourly?.time) return null;
    const now = new Date();
    const i = d.hourly.time.findIndex(t=>parseInt(t.slice(11,13))>=now.getHours()&&t.startsWith(now.toISOString().slice(0,10)));
    const idx = i>=0?i:0;
    return {
      temp: Math.round(d.hourly.temperature_2m[idx]),
      pluie: d.hourly.precipitation_probability[idx],
      code: d.hourly.weathercode[idx],
      vent: Math.round(d.hourly.windspeed_10m[idx]),};};
  const cur = getCurHour();

  if (!d) return null;
  return (
    <div style={{background:T.card,borderRadius:16,padding:20,boxShadow:`0 1px 3px ${T.shadow}`,border:`1px solid ${T.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:T.text}}>⛅ Meteo chantiers</h3>
        <span style={{fontSize:10,color:T.text3}}>Previsions saisonnieres</span>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {villes.map(v=>(
          <button key={v} onClick={()=>setSelectedVille(v)}
            style={{padding:"5px 10px",borderRadius:20,border:`1.5px solid ${active===v?"#FF6B35":T.border2}`,
              background:active===v?(darkMode?"#2A1F1A":"#FFF7ED"):T.input,
              color:active===v?"#FF6B35":T.text2,cursor:"pointer",fontSize:11,fontWeight:600}}>
            {v}
          </button>
        ))}
      </div>
      {cur && (
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"12px 14px",borderRadius:12,background:darkMode?"#1E2130":"#EFF6FF"}}>
          <div style={{fontSize:36}}>{WMO_ICON[cur.code]||"🌡️"}</div>
          <div>
            <div style={{fontSize:28,fontWeight:800,color:getTempColor(cur.temp)}}>{cur.temp}°C</div>
            <div style={{fontSize:12,color:T.text2}}>{WMO_CODES[cur.code]||"—"}</div>
          </div>
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontSize:12,color:cur.pluie>50?"#3B82F6":T.text3}}>💧 {cur.pluie}%</div>
            <div style={{fontSize:12,color:cur.vent>40?"#EF4444":T.text3}}>💨 {cur.vent} km/h</div>
            {cur.pluie>60&&<div style={{fontSize:10,color:"#EF4444",fontWeight:700,marginTop:4}}>⚠️ Chantier risque</div>}
          </div>
        </div>
      )}
    </div>
  );}

function MeteoPage({ chantiers, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const norm = s => (s||"").toLowerCase().trim().replace(/[eeee]/g,"e").replace(/[aaa]/g,"a").replace(/c/g,"c");
  const villes = ["Lillers",...new Set(
    chantiers
      .filter(c=>c.statut==="en_cours"||c.statut==="planifie")
      .map(c=>c.ville)
      .filter(v=>norm(v)!=="lillers")
  )].slice(0,8);
  const [data] = useState(() => { const d={}; villes.forEach(v=>{d[v]=generateMeteo(v);}); return d;});
  const [selectedVille, setSelectedVille] = useState(villes[0]);
  const [selectedDay, setSelectedDay]     = useState(0);

  const active = selectedVille || villes[0];
  const d = data[active];
  const getTempColor = t => t<=0?"#93C5FD":t<=10?"#BAE6FD":t<=20?"#86EFAC":t<=28?"#FDE68A":"#FCA5A5";
  const windDir = deg => ["N","NE","E","SE","S","SO","O","NO"][Math.round(deg/45)%8];
  const getRisk = (p,v) => p>70||v>60?{label:"🔴 Travaux deconseilles",color:"#EF4444",bg:"#FEF2F2"}:p>40||v>40?{label:"🟡 Vigilance meteo",color:"#F59E0B",bg:"#FFFBEB"}:{label:"🟢 Conditions favorables",color:"#22C55E",bg:"#F0FDF4"};

  const getHours = () => {
    if (!d?.hourly?.time) return [];
    const now = new Date();
    const dayStr = new Date(now.getTime()+selectedDay*86400000).toISOString().slice(0,10);
    const startH = selectedDay===0 ? now.getHours() : 0;
    return d.hourly.time.reduce((acc,t,i)=>{
      if (t.startsWith(dayStr)&&parseInt(t.slice(11,13))>=startH) acc.push({
        h:t.slice(11,16), temp:Math.round(d.hourly.temperature_2m[i]),
        feel:Math.round(d.hourly.apparent_temperature[i]),
        pluie:d.hourly.precipitation_probability[i], mm:d.hourly.precipitation[i],
        code:d.hourly.weathercode[i], vent:Math.round(d.hourly.windspeed_10m[i]),
        dir:d.hourly.winddirection_10m[i], hum:d.hourly.relativehumidity_2m[i],
        uv:d.hourly.uv_index[i],
        isNow:selectedDay===0&&parseInt(t.slice(11,13))===now.getHours(),}); return acc;},[]);};

  const hours = getHours();
  const daily = d?.daily || [];
  const curH  = hours.find(h=>h.isNow)||hours[0];
  const risk  = curH?getRisk(curH.pluie,curH.vent):null;
  const cardS = {background:T.card,borderRadius:14,padding:16,border:`1px solid ${T.border}`,boxShadow:`0 1px 4px ${T.shadow}`};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{...cardS,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{margin:0,fontSize:18,fontWeight:800,color:T.text}}>⛅ Meteo des chantiers</h2>
          <div style={{fontSize:11,color:T.text3,marginTop:2}}>Previsions saisonnieres Nord de la France . {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
      </div>

      {}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {villes.map(v=>{
          const vd=data[v]; const dd=vd?.daily?.[selectedDay];
          return (
            <button key={v} onClick={()=>setSelectedVille(v)}
              style={{padding:"10px 14px",borderRadius:12,cursor:"pointer",
                border:`2px solid ${active===v?"#FF6B35":T.border2}`,
                background:active===v?(darkMode?"#2A1F1A":"#FFF7ED"):T.input}}>
              <div style={{fontSize:12,fontWeight:700,color:active===v?"#FF6B35":T.text,textAlign:"left"}}>{norm(v)==="lillers"?"🏢 ":""}{v}</div>
              {dd&&<div style={{fontSize:11,color:T.text3}}>{WMO_ICON[dd.code]||"🌡️"} {dd.tMax}°/{dd.tMin}°</div>}
            </button>
          );})}
      </div>

      {}
      <div style={{display:"flex",gap:6}}>
        {["Aujourd'hui","Demain","Apres-demain"].map((label,i)=>{
          const dd=daily[i];
          return (
            <button key={i} onClick={()=>setSelectedDay(i)}
              style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",
                border:`2px solid ${selectedDay===i?"#FF6B35":T.border2}`,
                background:selectedDay===i?(darkMode?"#2A1F1A":"#FFF7ED"):T.input,
                display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{fontSize:11,fontWeight:700,color:selectedDay===i?"#FF6B35":T.text2}}>{label}</div>
              {dd&&<><div style={{fontSize:22}}>{WMO_ICON[dd.code]||"🌡️"}</div>
                <div style={{fontSize:13,fontWeight:800,color:getTempColor(dd.tMax)}}>{dd.tMax}° <span style={{fontSize:11,color:T.text3,fontWeight:400}}>/ {dd.tMin}°</span></div>
                {dd.rain>0&&<div style={{fontSize:10,color:"#3B82F6"}}>💧{dd.rain}mm</div>}
                <div style={{fontSize:10,color:T.text3}}>💨{dd.wind}km/h</div>
              </>}
            </button>
          );})}
      </div>

      {}
      {curH&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="grid-2col">
          <div style={{...cardS,background:darkMode?"#1A2035":"#EFF6FF",border:`1px solid ${darkMode?"#2A3550":"#BFDBFE"}`,display:"flex",gap:16,alignItems:"center"}}>
            <div style={{fontSize:52}}>{WMO_ICON[curH.code]||"🌡️"}</div>
            <div>
              <div style={{fontSize:34,fontWeight:900,color:getTempColor(curH.temp),lineHeight:1}}>{curH.temp}°C</div>
              <div style={{fontSize:13,color:T.text2,marginTop:2}}>{WMO_CODES[curH.code]||"—"}</div>
              <div style={{fontSize:12,color:T.text3,marginTop:4}}>Ressenti {curH.feel}°C</div>
              {daily[selectedDay]&&<div style={{fontSize:11,color:T.text3,marginTop:2}}>🌅{daily[selectedDay].sunrise} 🌇{daily[selectedDay].sunset}</div>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{...cardS,padding:"10px 14px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["💧","Pluie",`${curH.pluie}%`,curH.pluie>50?"#3B82F6":T.text2],
                  ["🌧️","Precip.",`${curH.mm}mm`,T.text2],
                  ["💨","Vent",`${curH.vent}km/h ${windDir(curH.dir)}`,curH.vent>40?"#EF4444":T.text2],
                  ["💦","Humidite",`${curH.hum}%`,T.text2],
                  ["☀️","UV",`${Number(curH.uv).toFixed(1)}`,curH.uv>6?"#F59E0B":T.text2],
                ].map(([icon,label,val,color])=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14}}>{icon}</span>
                    <div>
                      <div style={{fontSize:9,color:T.text3,fontWeight:600,textTransform:"uppercase"}}>{label}</div>
                      <div style={{fontSize:12,fontWeight:700,color}}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {risk&&(
              <div style={{padding:"10px 14px",borderRadius:10,background:risk.bg,border:`1px solid ${risk.color}30`}}>
                <div style={{fontSize:13,fontWeight:700,color:risk.color}}>{risk.label}</div>
                <div style={{fontSize:11,color:risk.color,marginTop:2,opacity:0.8}}>
                  {curH.pluie>70?"Risque de pluie important":curH.vent>60?"Vent dangereux en hauteur":curH.pluie>40?"Pluie moderee prevue":"Meteo favorable pour travailler"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {hours.length>0&&(
        <div style={cardS}>
          <div style={{fontSize:12,fontWeight:700,color:T.text3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>🕐 Heure par heure — {active}</div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",width:"100%",minWidth:560}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${T.border}`}}>
                  {["Heure","","Temp","Ressenti","Pluie","mm","Vent","Hum.","UV"].map(h=>(
                    <th key={h} style={{padding:"6px 8px",fontSize:10,fontWeight:700,color:T.text3,textTransform:"uppercase",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((h,i)=>(
                  <tr key={i} style={{background:h.isNow?(darkMode?"#2A1F1A":"#FFF7ED"):i%2===0?T.input:"transparent",borderLeft:h.isNow?"3px solid #FF6B35":"3px solid transparent"}}>
                    <td style={{padding:"8px",fontSize:12,fontWeight:h.isNow?800:500,color:h.isNow?"#FF6B35":T.text2,whiteSpace:"nowrap"}}>{h.isNow?"▶ Maint.":h.h}</td>
                    <td style={{padding:"8px 4px",fontSize:18}}>{WMO_ICON[h.code]||"🌡️"}</td>
                    <td style={{padding:"8px",fontSize:13,fontWeight:700,color:getTempColor(h.temp)}}>{h.temp}°C</td>
                    <td style={{padding:"8px",fontSize:12,color:T.text3}}>{h.feel}°C</td>
                    <td style={{padding:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <div style={{width:36,height:5,borderRadius:3,background:T.border,overflow:"hidden"}}>
                          <div style={{width:`${h.pluie}%`,height:"100%",background:h.pluie>60?"#3B82F6":h.pluie>30?"#93C5FD":"#BAE6FD",borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:11,color:h.pluie>50?"#3B82F6":T.text3}}>{h.pluie}%</span>
                      </div>
                    </td>
                    <td style={{padding:"8px",fontSize:12,color:h.mm>0?"#3B82F6":T.text3}}>{h.mm>0?`${h.mm}mm`:"—"}</td>
                    <td style={{padding:"8px",fontSize:12,fontWeight:600,color:h.vent>50?"#EF4444":h.vent>30?"#F59E0B":T.text2,whiteSpace:"nowrap"}}>{h.vent}km/h {windDir(h.dir)}</td>
                    <td style={{padding:"8px",fontSize:12,color:T.text3}}>{h.hum}%</td>
                    <td style={{padding:"8px"}}>
                      <span style={{fontSize:11,fontWeight:600,padding:"2px 6px",borderRadius:6,background:h.uv>=8?"#FEF2F2":h.uv>=6?"#FFFBEB":h.uv>=3?"#F0FDF4":T.input,color:h.uv>=8?"#EF4444":h.uv>=6?"#F59E0B":h.uv>=3?"#22C55E":T.text3}}>
                        {Number(h.uv).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {daily.length>0&&(
        <div style={cardS}>
          <div style={{fontSize:12,fontWeight:700,color:T.text3,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>📅 Resume 3 jours</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {daily.map((dd,i)=>{
              const labels=["Aujourd'hui","Demain","Apres-demain"];
              const r2=getRisk(dd.rain>5?70:dd.rain>2?45:10,dd.wind);
              return (
                <div key={i} onClick={()=>setSelectedDay(i)} style={{padding:"14px 12px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${i===selectedDay?"#FF6B35":T.border}`,background:i===selectedDay?(darkMode?"#2A1F1A":"#FFF7ED"):T.input}}>
                  <div style={{fontSize:11,fontWeight:700,color:i===selectedDay?"#FF6B35":T.text3,marginBottom:6}}>{labels[i]}</div>
                  <div style={{fontSize:28,marginBottom:6}}>{WMO_ICON[dd.code]||"🌡️"}</div>
                  <div style={{fontSize:14,fontWeight:800,color:getTempColor(dd.tMax)}}>{dd.tMax}° <span style={{fontSize:12,color:T.text3,fontWeight:400}}>/ {dd.tMin}°</span></div>
                  <div style={{fontSize:11,color:T.text2,marginTop:3}}>{WMO_CODES[dd.code]||"—"}</div>
                  <div style={{fontSize:11,color:T.text3,marginTop:4}}>💨 max {dd.wind}km/h</div>
                  {dd.rain>0&&<div style={{fontSize:11,color:"#3B82F6"}}>🌧️ {dd.rain}mm</div>}
                  <div style={{marginTop:8,fontSize:10,fontWeight:700,color:r2.color}}>{r2.label}</div>
                </div>
              );})}
          </div>
        </div>
      )}
    </div>
  );}

function Dashboard({ chantiers, teams, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const actifs = chantiers.filter(c => c.statut === "en_cours").length;
  const termines = chantiers.filter(c => c.statut === "termine").length;
  const retards = chantiers.filter(c => c.statut === "retard").length;
  const planifies = chantiers.filter(c => c.statut === "planifie").length;
  const avgRentabilite = chantiers.filter(c => c.rentabilite > 0).reduce((s, c, _, a) => s + c.rentabilite / a.length, 0);
  const avgProgression = chantiers.filter(c => c.statut === "en_cours").reduce((s, c, _, a) => s + c.progression / a.length, 0);
  const totalPersonnel = teams.reduce((s, t) => s + t.members.length, 0);
  const equipeStats = teams.map(t => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const activeToday = chantiers.some(c => {
      if (!c.equipes.includes(t.id) || c.statut !== "en_cours") return false;
      const start = new Date(c.date); start.setHours(0,0,0,0);
      const end   = new Date(start);  end.setDate(end.getDate() + (c.duree || 1) - 1);
      return today >= start && today <= end;});
    return { ...t, activeToday};});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px, 1fr))",gap:12}}>
        <StatCard icon="🏗️" label="Chantiers actifs" value={actifs} sub={`${planifies} planifies`} color="#FF6B35" darkMode={darkMode} />
        <StatCard icon="✅" label="Termines" value={termines} sub="Ce mois" color="#22C55E" darkMode={darkMode} />
        <StatCard icon="⚠️" label="En retard" value={retards} sub={retards > 0 ? "Action requise" : "Tout va bien"} color="#EF4444" darkMode={darkMode} />
        <StatCard icon="👷" label="Personnel" value={totalPersonnel} sub={`${teams.reduce((s,t)=>s+t.members.filter(m=>m.statut==="actif").length,0)} disponibles`} color="#3B82F6" darkMode={darkMode} />
        <StatCard icon="📈" label="Rentabilite moy." value={`${Math.round(avgRentabilite)}%`} sub="Chantiers termines" color="#8B5CF6" darkMode={darkMode} />
        <StatCard icon="🎯" label="Progression moy." value={`${Math.round(avgProgression)}%`} sub="Chantiers actifs" color="#F59E0B" darkMode={darkMode} />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700,color:T.text}}>📊 Repartition par statut</h3>
          {Object.entries(STATUT_CONFIG).map(([k, v]) => {
            const count = chantiers.filter(c => c.statut === k).length;
            const pct = chantiers.length > 0 ? (count / chantiers.length) * 100 : 0;
            return (
              <div key={k} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,color:T.text,fontWeight:500}}>{v.label}</span>
                  <span style={{fontSize:13,fontWeight:700,color:v.color}}>{count}</span>
                </div>
                <ProgressBar value={pct} color={v.color} height={6} />
              </div>
            );})}
        </div>
        <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
          <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700,color:T.text}}>👷 Equipes actives</h3>
          {equipeStats.map(t => (
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:16}}>{t.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:600,color:T.text}}>{t.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:t.activeToday ? "#22C55E" :"#9CA3AF"}}>
                    {t.activeToday ? "● Active" : "○ Inactive"}
                  </span>
                </div>
                <div style={{background:T.input,borderRadius:999,height:5,overflow:"hidden"}}>
                  <div style={{width:t.activeToday ? "100%" :"0%",height:"100%",borderRadius:999,background:t.activeToday ? "#22C55E" :"#E5E7EB",transition:"width 0.4s"}} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
        <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700,color:T.text}}>📋 Chantiers recents</h3>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {chantiers.slice(0, 5).map((c, i) => {
            const sc = STATUT_CONFIG[c.statut];
            const pc = PRIORITE_CONFIG[c.priorite];
            return (
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i < 4 ? "1px solid #F3F4F6" :"none"}}>
                <div style={{width:36,height:36,borderRadius:10,background:sc.color + "15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏗️</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.nom}</div>
                  <div style={{fontSize:11,color:T.text3}}>📍 {c.ville} . 👤 {c.responsable}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                  <Badge text={sc.label} color={sc.color} bg={sc.bg} />
                  <div style={{fontSize:11,color:pc.color,fontWeight:600}}>● {pc.label}</div>
                </div>
                <div style={{width:60,flexShrink:0}}>
                  <ProgressBar value={c.progression} color={sc.color} height={5} />
                  <div style={{fontSize:10,color:T.text3,marginTop:2,textAlign:"center"}}>{c.progression}%</div>
                </div>
              </div>
            );})}
        </div>
      </div>

      <WeatherDashboard chantiers={chantiers} darkMode={darkMode} />

      {}
      <div style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`}}>
        <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700,color:T.text}}>📍 Chantiers par ville</h3>
        {}
        <div style={{display:"flex",gap:16,marginBottom:16}}>
          {[["en_cours","En cours"],["planifie","Planifie"],["termine","Termine"]].map(([key, label]) => (
            <div key={key} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:10,height:10,borderRadius:3,background:STATUT_CONFIG[key].color}} />
              <span style={{fontSize:11,color:T.text2}}>{label}</span>
            </div>
          ))}
        </div>
        {(() => {
          const villes = {};
          const norm = s => (s || "").trim().toLowerCase()
            .replace(/[eeee]/g,"e").replace(/[aaa]/g,"a").replace(/[uuu]/g,"u")
            .replace(/[ii]/g,"i").replace(/[oo]/g,"o").replace(/c/g,"c");
          chantiers.forEach(c => {
            const key = norm(c.ville);
            const label = (c.ville || "").trim() || "Non defini";
            if (!villes[key]) villes[key] = { label, en_cours: 0, planifie: 0, termine: 0, total: 0};
            if (c.statut === "en_cours") villes[key].en_cours++;
            else if (c.statut === "planifie") villes[key].planifie++;
            else villes[key].termine++; // termine, retard, suspendu
            villes[key].total++;});
          const sorted = Object.entries(villes).sort((a, b) => b[1].total - a[1].total);
          const maxTotal = sorted[0]?.[1].total || 1;
          const segments = [
            { key: "en_cours",  color: STATUT_CONFIG.en_cours.color},
            { key: "planifie",  color: STATUT_CONFIG.planifie.color},
            { key: "termine",   color: STATUT_CONFIG.termine.color},
          ];

          return sorted.map(([key, stats]) => (
            <div key={key} style={{marginBottom:16}}>
              {}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>📍 {stats.label}</span>
                <span style={{fontSize:12,color:T.text3,fontWeight:500}}>{stats.total} chantier{stats.total > 1 ? "s" : ""}</span>
              </div>
              {}
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28, width: `${(stats.total / maxTotal) * 100}%`, minWidth: 60, transition: "width 0.5s"}}>
                {segments.map(({ key, color}) => {
                  const n = stats[key] || 0;
                  if (!n) return null;
                  const pct = (n / stats.total) * 100;
                  return (
                    <div key={key} style={{
                      width: `${pct}%`, background: color, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: "#fff",
                      transition: "width 0.5s", position: "relative",
                      minWidth: 24}}>
                      {n}
                    </div>
                  );})}
              </div>
            </div>
          ));})()}
      </div>
    </div>
  );}

function ChantierCard({ chantier, onClick, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const sc = STATUT_CONFIG[chantier.statut];
  const pc = PRIORITE_CONFIG[chantier.priorite];
  return (
    <div onClick={() => onClick(chantier)} style={{ background: T.card, borderRadius: 16, padding: 20, boxShadow: `0 1px 3px ${T.shadow}`, border: `1px solid ${chantier.statut === "en_cours" ? "#FF6B3530" : T.border}`, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden"}}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,107,53,0.12)";}}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";}}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `${sc.color}10`, borderRadius: "0 16px 0 60px"}} />
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <Badge text={sc.label} color={sc.color} bg={sc.bg} />
        <div style={{fontSize:11,color:pc.color,fontWeight:700}}>● {pc.label}</div>
      </div>
      <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700,color:T.text,lineHeight:1.3}}>{chantier.nom}</h3>
      <div style={{fontSize:12,color:T.text2,marginBottom:12}}>📍 {chantier.ville} . {chantier.adresse}</div>
      <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}>
        <div style={{fontSize:11,color:T.text2}}>📅 {chantier.date}</div>
        <div style={{fontSize:11,color:T.text2}}>🕐 {chantier.heure}</div>
        <div style={{fontSize:11,color:T.text2}}>⏱ {chantier.duree}j</div>
        <div style={{fontSize:11,color:T.text2}}>👤 {chantier.responsable}</div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>
        {chantier.equipes.map(eId => { const team = INITIAL_TEAMS.find(t => t.id === eId); return team ? <span key={eId} style={{padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,background:team.color + "15",color:team.color}}>{team.icon} {team.name}</span> : null;})}
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:11,color:T.text3}}>Progression</span>
          <span style={{fontSize:11,fontWeight:700,color:chantier.progression >= 100 ? "#22C55E" :"#FF6B35"}}>{chantier.progression}%</span>
        </div>
        <ProgressBar value={chantier.progression} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`}}>
        <div style={{fontSize:11,color:T.text3}}>📸 {chantier.photos}</div>
        <div style={{fontSize:11,color:T.text3}}>📄 {chantier.documents}</div>
        <div style={{fontSize:11,color:T.text3}}>⏱ {chantier.heures}h</div>
        {chantier.rentabilite > 0 && <div style={{fontSize:11,color:"#22C55E",fontWeight:600}}>📈 {chantier.rentabilite}%</div>}
      </div>
    </div>
  );}
function PiecesJointes({ chantier, onUpdate, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const fichiers = chantier.fichiers || [];

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: Date.now() + Math.random(),
        nom: file.name,
        taille: file.size,
        type: file.type,
        url,
        date: new Date().toLocaleDateString("fr-FR"),};});
    onUpdate({ ...chantier, fichiers: [...fichiers, ...newFiles]});};

  const removeFile = (id) => {
    onUpdate({ ...chantier, fichiers: fichiers.filter(f => f.id !== id)});};

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} Ko`;
    if (bytes < 1024*1024*1024) return `${(bytes/1024/1024).toFixed(1)} Mo`;
    return `${(bytes/1024/1024/1024).toFixed(1)} Go`;};

  const getIcon = (type, nom) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.includes("word") || nom.endsWith(".docx") || nom.endsWith(".doc")) return "📝";
    if (type.includes("excel") || nom.endsWith(".xlsx") || nom.endsWith(".xls")) return "📊";
    if (type.includes("zip") || type.includes("rar")) return "🗜️";
    if (type.startsWith("video/")) return "🎥";
    return "📎";};

  return (
    <div>
      <div style={{fontSize:11,color:T.text3,fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>
        📎 Pieces jointes ({fichiers.length})
      </div>

      {}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true);}}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files);}}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#FF6B35" : T.border2}`,
          borderRadius: 12, padding: "20px 16px", textAlign: "center",
          cursor: "pointer", marginBottom: 12, transition: "all 0.2s",
          background: dragOver ? (darkMode ? "#2A1F1A" : "#FFF7ED") : T.input,}}>
        <input ref={inputRef} type="file" multiple style={{display:"none"}}
          onChange={e => addFiles(e.target.files)} />
        <div style={{fontSize:24,marginBottom:6}}>📂</div>
        <div style={{fontSize:13,color:T.text2,fontWeight:600}}>
          {dragOver ? "Deposez ici !" : "Cliquer ou glisser-deposer"}
        </div>
        <div style={{fontSize:11,color:T.text3,marginTop:3}}>
          Photos, PDF, documents — aucune limite de taille
        </div>
      </div>

      {}
      {fichiers.length > 0 && (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {fichiers.map(f => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: T.input, border: `1px solid ${T.border}`}}>
              {}
              {f.type.startsWith("image/") ? (
                <img src={f.url} alt={f.nom} style={{width:36,height:36,borderRadius:6,objectFit:"cover",flexShrink:0}} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 6, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${T.border}`}}>
                  {getIcon(f.type, f.nom)}
                </div>
              )}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.nom}</div>
                <div style={{fontSize:10,color:T.text3}}>{formatSize(f.taille)} . {f.date}</div>
              </div>
              <a href={f.url} download={f.nom} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border2}`, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 13, flexShrink: 0}} title="Telecharger">⬇️</a>
              {f.type.startsWith("image/") && (
                <a href={f.url} target="_blank" rel="noreferrer" style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border2}`, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 13, flexShrink: 0}} title="Ouvrir">🔍</a>
              )}
              <button onClick={() => removeFile(f.id)} style={{width:28,height:28,borderRadius:7,border:`1px solid #FEE2E2`,background:"#FEF2F2",cursor:"pointer",fontSize:13,flexShrink:0}} title="Supprimer">🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );}

function ChantierDetail({ chantier, onEdit, onClose, onDelete, onUpdate, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const sc = STATUT_CONFIG[chantier.statut];
  const pc = PRIORITE_CONFIG[chantier.priorite];
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <Badge text={sc.label} color={sc.color} bg={sc.bg} />
        <Badge text={pc.label} color={pc.color} bg={pc.color + "15"} />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        {[["📍 Ville", chantier.ville], ["🏠 Adresse", chantier.adresse], ["📅 Date", chantier.date], ["🕐 Heure", chantier.heure], ["⏱ Duree", `${chantier.duree} jours`], ["👤 Responsable", chantier.responsable], ["📸 Photos", chantier.photos], ["📄 Documents", chantier.documents], ["⏱ Heures", `${chantier.heures}h`], ["📈 Rentabilite", chantier.rentabilite > 0 ? `${chantier.rentabilite}%` : "N/A"]].map(([k, v]) => (
          <div key={k}>
            <div style={{fontSize:11,color:T.text3,fontWeight:600,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:T.text3,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Equipes affectees</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {chantier.equipes.map(eId => { const team = INITIAL_TEAMS.find(t => t.id === eId); return team ? <span key={eId} style={{padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:700,background:team.color + "15",color:team.color}}>{team.icon} {team.name} . {team.members.length} membres</span> : null;})}
        </div>
      </div>
      {chantier.notes && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:T.text3,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Notes</div>
          <div style={{padding:12,background:"#FFF7ED",borderRadius:10,fontSize:13,color:T.text,borderLeft:"3px solid #FF6B35"}}>{chantier.notes}</div>
        </div>
      )}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <div style={{fontSize:11,color:T.text3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Progression</div>
          <span style={{fontSize:14,fontWeight:700,color:"#FF6B35"}}>{chantier.progression}%</span>
        </div>
        <ProgressBar value={chantier.progression} height={10} />
      </div>
      {chantier.materiel?.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.text3,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Materiel</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {chantier.materiel.map(m => <span key={m} style={{padding:"5px 10px",borderRadius:8,background:T.input,fontSize:12,color:T.text,fontWeight:500}}>⚙️ {m}</span>)}
          </div>
        </div>
      )}
      {}
      <div style={{marginBottom:20}}>
        <PiecesJointes chantier={chantier} onUpdate={onUpdate} darkMode={darkMode} />
      </div>

      <div style={{display:"flex",gap:8}}>
        <button onClick={() => onEdit(chantier)} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"linear-gradient(135deg, #FF6B35, #E85D04)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✏️ Modifier</button>
        <button onClick={() => { if (confirm("Supprimer ce chantier ?")) { onDelete(chantier.id); onClose();}}} style={{padding:"10px 16px",borderRadius:10,border:"1.5px solid #FEE2E2",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontWeight:600,fontSize:13}}>🗑️</button>
      </div>
    </div>
  );}
function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}}

const FLOTTE_TYPES = {
  engin:    { label:"Engin",    icon:"🚜", color:"#F59E0B" },
  camion:   { label:"Camion",   icon:"🚛", color:"#3B82F6" },
  materiel: { label:"Materiel", icon:"⚙️", color:"#8B5CF6" },
  vehicule: { label:"Vehicule", icon:"🚗", color:"#22C55E" },
};
const FLOTTE_STATUTS = {
  disponible:  { label:"Disponible",   color:"#22C55E", bg:"#F0FDF4" },
  utilise:     { label:"En service",   color:"#FF6B35", bg:"#FFF7ED" },
  maintenance: { label:"Maintenance",  color:"#F59E0B", bg:"#FFFBEB" },
  hs:          { label:"Hors service", color:"#EF4444", bg:"#FEF2F2" },
};




function FlotteView({ flotte, setFlotte, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState(null);
  const [confirmDel, setConfirmDel]   = useState(null);
  const [filterType, setFilterType]   = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");
  const [search, setSearch]           = useState("");
  const [detail, setDetail]           = useState(null);

  const filtered = flotte.filter(v => {
    const matchType   = filterType   === "all" || v.type   === filterType;
    const matchStatut = filterStatut === "all" || v.statut === filterStatut;
    const matchSearch = !search || v.nom.toLowerCase().includes(search.toLowerCase()) ||
      (v.immat||"").toLowerCase().includes(search.toLowerCase()) ||
      (v.marque||"").toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatut && matchSearch;});

  const save = async (form) => {
    const saved = await saveFlotteItemDB(form);
    if (!saved) return;
    if (form.id) setFlotte(f => f.map(v => v.id === saved.id ? saved : v));
    else         setFlotte(f => [...f, saved]);
    setShowForm(false); setEditing(null);};
  const del = async (id) => { await deleteFlotteItemDB(id); setFlotte(f => f.filter(v => v.id !== id)); setConfirmDel(null); setDetail(null);};
  const stats = Object.keys(FLOTTE_STATUTS).map(k => ({ k, count: flotte.filter(v => v.statut === k).length}));
  const ctAlert = flotte.filter(v => {
    if (!v.prochain_ct) return false;
    const days = (new Date(v.prochain_ct) - new Date()) / 86400000;
    return days <= 30 && days >= 0;});

  const inputS = { width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border2}`, borderRadius:8, fontSize:13, outline:"none", background:T.input, color:T.text, boxSizing:"border-box"};
  const labelS = { fontSize:11, fontWeight:600, color:T.text3, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:"0.05em"};
  const cardS  = { background:T.card, borderRadius:16, padding:20, boxShadow:`0 1px 3px ${T.shadow}`, border:`1px solid ${T.border}`};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
        {[
          { icon:"🚛", label:"Total flotte",   value:flotte.length,                          color:"#FF6B35"},
          { icon:"✅", label:"Disponibles",    value:flotte.filter(v=>v.statut==="disponible").length, color:"#22C55E"},
          { icon:"🔧", label:"Maintenance",    value:flotte.filter(v=>v.statut==="maintenance").length,color:"#F59E0B"},
          { icon:"⚠️", label:"CT < 30 jours",  value:ctAlert.length,                         color:"#EF4444"},
        ].map(s => (
          <div key={s.label} style={{...cardS,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`${s.color}10`,borderRadius:"0 16px 0 60px"}}/>
            <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:26,fontWeight:800,color:T.text,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {}
      {ctAlert.length > 0 && (
        <div style={{background:darkMode?"#2A1A0A":"#FFFBEB",border:"1px solid #F59E0B",borderRadius:12,padding:"12px 16px",display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:18}}>⚠️</span>
          <div>
            <div style={{fontWeight:700,color:"#F59E0B",fontSize:13}}>Controles techniques a venir</div>
            <div style={{fontSize:12,color:T.text2,marginTop:3}}>
              {ctAlert.map(v=>`${v.nom} (${new Date(v.prochain_ct).toLocaleDateString("fr-FR")})`).join(" . ")}
            </div>
          </div>
        </div>
      )}

      {}
      <div style={{...cardS,padding:"14px 16px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher..."
            style={{...inputS,flex:1,minWidth:160,padding:"8px 12px"}}/>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}
            style={{...inputS,width:"auto",padding:"8px 12px"}}>
            <option value="all">Tous types</option>
            {Object.entries(FLOTTE_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}
            style={{...inputS,width:"auto",padding:"8px 12px"}}>
            <option value="all">Tous statuts</option>
            {Object.entries(FLOTTE_STATUTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={()=>{setEditing(null);setShowForm(true);}}
            style={{padding:"8px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#FF6B35,#E85D04)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,whiteSpace:"nowrap"}}>
            + Ajouter
          </button>
        </div>
      </div>

      {}
      {filtered.length === 0 ? (
        <div style={{...cardS,textAlign:"center",padding:40,color:T.text3}}>
          <div style={{fontSize:36,marginBottom:8}}>🚛</div>
          <div style={{fontWeight:600,color:T.text}}>Aucun engin trouve</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtered.map(v => {
            const ft = FLOTTE_TYPES[v.type]  || FLOTTE_TYPES.materiel;
            const fs = FLOTTE_STATUTS[v.statut] || FLOTTE_STATUTS.disponible;
            const ctDays = v.prochain_ct ? Math.round((new Date(v.prochain_ct)-new Date())/86400000) : null;
            return (
              <div key={v.id} onClick={()=>setDetail(v)}
                style={{...cardS,cursor:"pointer",transition:"all 0.15s",border:`1px solid ${v.statut==="maintenance"?"#F59E0B30":v.statut==="hs"?"#EF444430":T.border}`}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:12,background:`${ft.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{ft.icon}</div>
                  <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:fs.bg,color:fs.color}}>{fs.label}</span>
                </div>
                <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:3}}>{v.nom}</div>
                <div style={{fontSize:12,color:T.text3,marginBottom:8}}>{v.marque} {v.modele} . {v.annee}</div>
                {v.immat && <div style={{fontSize:11,fontWeight:700,color:T.text2,background:T.input,padding:"3px 8px",borderRadius:6,display:"inline-block",marginBottom:8,fontFamily:"monospace"}}>{v.immat}</div>}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:4}}>
                  {v.km > 0 && <span style={{fontSize:11,color:T.text3}}>🛣️ {v.km.toLocaleString()} km</span>}
                  {ctDays !== null && (
                    <span style={{fontSize:11,color:ctDays<=30?"#EF4444":ctDays<=90?"#F59E0B":T.text3,fontWeight:ctDays<=30?700:400}}>
                      🔧 CT dans {ctDays}j
                    </span>
                  )}
                </div>
                {v.notes && <div style={{marginTop:8,fontSize:11,color:T.text3,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.notes}</div>}
              </div>
            );})}
        </div>
      )}

      {}
      {detail && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div onClick={()=>setDetail(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}/>
          <div style={{position:"relative",background:T.card,borderRadius:20,padding:28,width:"100%",maxWidth:500,boxShadow:`0 20px 60px ${T.shadow}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:`${(FLOTTE_TYPES[detail.type]||FLOTTE_TYPES.materiel).color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{(FLOTTE_TYPES[detail.type]||FLOTTE_TYPES.materiel).icon}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:T.text}}>{detail.nom}</div>
                  <div style={{fontSize:12,color:T.text3}}>{detail.marque} {detail.modele} . {detail.annee}</div>
                </div>
              </div>
              <button onClick={()=>setDetail(null)} style={{background:T.input,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.text2}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[
                ["📋 Type",    (FLOTTE_TYPES[detail.type]||FLOTTE_TYPES.materiel).label],
                ["🔖 Statut",  (FLOTTE_STATUTS[detail.statut]||FLOTTE_STATUTS.disponible).label],
                ["🚘 Immat.",  detail.immat||"—"],
                ["📅 Annee",   detail.annee||"—"],
                ["🛣️ Km",      detail.km>0?detail.km.toLocaleString()+" km":"—"],
                ["🔧 Prochain CT", detail.prochain_ct?new Date(detail.prochain_ct).toLocaleDateString("fr-FR"):"—"],
              ].map(([k,v])=>(
                <div key={k}>
                  <div style={{fontSize:10,color:T.text3,fontWeight:600,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text}}>{v}</div>
                </div>
              ))}
            </div>
            {detail.notes && (
              <div style={{padding:"10px 12px",background:T.input,borderRadius:8,fontSize:12,color:T.text2,marginBottom:16,borderLeft:"3px solid #FF6B35"}}>{detail.notes}</div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{setEditing({...detail});setDetail(null);setShowForm(true);}}
                style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#FF6B35,#E85D04)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>✏️ Modifier</button>
              {confirmDel===detail.id ? (
                <div style={{display:"flex",gap:6,alignItems:"center",background:"#FEF2F2",border:"1px solid #FEE2E2",borderRadius:10,padding:"0 12px"}}>
                  <span style={{fontSize:11,color:"#EF4444",fontWeight:600}}>Supprimer ?</span>
                  <button onClick={()=>del(detail.id)} style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#EF4444",color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700}}>Oui</button>
                  <button onClick={()=>setConfirmDel(null)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border2}`,background:T.card,cursor:"pointer",fontSize:11,color:T.text2}}>Non</button>
                </div>
              ) : (
                <button onClick={()=>setConfirmDel(detail.id)}
                  style={{padding:"10px 16px",borderRadius:10,border:"1.5px solid #FEE2E2",background:"#FEF2F2",color:"#EF4444",cursor:"pointer",fontWeight:600,fontSize:13}}>🗑️</button>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      {showForm && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"12px 8px",overflowY:"auto"}}>
          <div onClick={()=>{setShowForm(false);setEditing(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}/>
          <div style={{position:"relative",background:T.card,borderRadius:20,padding:28,width:"100%",maxWidth:560,boxShadow:`0 20px 60px ${T.shadow}`,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700,color:T.text}}>{editing?"Modifier":"Ajouter un engin"}</h2>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{background:T.input,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:16,color:T.text2}}>x</button>
            </div>
            <FlotteForm initial={editing} onSave={save} onCancel={()=>{setShowForm(false);setEditing(null);}} darkMode={darkMode}/>
          </div>
        </div>
      )}
    </div>
  );}

function FlotteForm({ initial, onSave, onCancel, darkMode}) {
  const T = darkMode ? DARK : LIGHT;
  const [form, setForm] = useState(initial || {
    nom:"", type:"camion", immat:"", marque:"", modele:"", annee: new Date().getFullYear(),
    statut:"disponible", km:0, prochain_ct:"", notes:"", photo:null});
  const formRef = useRef(form);
  useEffect(()=>{ formRef.current = form;},[form]);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inputS = { width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border2}`, borderRadius:8, fontSize:13, outline:"none", background:T.input, color:T.text, boxSizing:"border-box"};
  const labelS = { fontSize:11, fontWeight:600, color:T.text3, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:"0.05em"};

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{gridColumn:"1/-1"}}>
          <label style={labelS}>Nom / Designation</label>
          <input style={inputS} value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Ex: Pelleteuse Volvo EC220"/>
        </div>
        <div>
          <label style={labelS}>Type</label>
          <select style={inputS} value={form.type} onChange={e=>set("type",e.target.value)}>
            {Object.entries(FLOTTE_TYPES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelS}>Statut</label>
          <select style={inputS} value={form.statut} onChange={e=>set("statut",e.target.value)}>
            {Object.entries(FLOTTE_STATUTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelS}>Marque</label>
          <input style={inputS} value={form.marque} onChange={e=>set("marque",e.target.value)} placeholder="Volvo, Renault..."/>
        </div>
        <div>
          <label style={labelS}>Modele</label>
          <input style={inputS} value={form.modele} onChange={e=>set("modele",e.target.value)} placeholder="EC220, Kerax..."/>
        </div>
        <div>
          <label style={labelS}>Immatriculation</label>
          <input style={inputS} value={form.immat} onChange={e=>set("immat",e.target.value.toUpperCase())} placeholder="AB-123-CD" style={{...inputS,fontFamily:"monospace"}}/>
        </div>
        <div>
          <label style={labelS}>Annee</label>
          <input type="number" style={inputS} value={form.annee} onChange={e=>set("annee",+e.target.value)} min={1990} max={2030}/>
        </div>
        <div>
          <label style={labelS}>Kilometrage</label>
          <input type="number" style={inputS} value={form.km} onChange={e=>set("km",+e.target.value)} min={0}/>
        </div>
        <div>
          <label style={labelS}>Prochain CT</label>
          <input type="date" style={inputS} value={form.prochain_ct} onChange={e=>set("prochain_ct",e.target.value)}/>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={labelS}>Notes</label>
          <textarea style={{...inputS,minHeight:70,resize:"vertical",fontFamily:"inherit"}} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Observations, entretiens..."/>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{padding:"9px 20px",borderRadius:10,border:`1.5px solid ${T.border2}`,background:T.card,cursor:"pointer",fontSize:13,fontWeight:600,color:T.text2}}>Annuler</button>
        <button onClick={()=>onSave(formRef.current)} style={{padding:"9px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#FF6B35,#E85D04)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 12px rgba(255,107,53,0.35)"}}>Enregistrer</button>
      </div>
    </div>
  );}

function GlobalSearch({open,onClose,query,setQuery,chantiers,teams,flotte,darkMode,onSelectChantier,onSelectTab}) {
  const T = darkMode ? DARK : LIGHT;
  if (!open) return null;
  const q = query.toLowerCase();
  const rC = !q ? [] : chantiers.filter(c=>c.nom.toLowerCase().includes(q)||c.ville.toLowerCase().includes(q)||(c.responsable||"").toLowerCase().includes(q)).slice(0,5);
  const rP = !q ? [] : teams.flatMap(t=>t.members.map(m=>({...m,tN:t.name,tC:t.color,tI:t.icon}))).filter(m=>m.nom.toLowerCase().includes(q)||(m.poste||"").toLowerCase().includes(q)).slice(0,4);
  const rF = !q ? [] : flotte.filter(v=>v.nom.toLowerCase().includes(q)||(v.immat||"").toLowerCase().includes(q)||(v.marque||"").toLowerCase().includes(q)).slice(0,4);
  const total = rC.length+rP.length+rF.length;
  const SectionHead = ({icon,label,n}) => <div style={{padding:"8px 16px 4px",fontSize:10,fontWeight:700,color:T.text3,textTransform:"uppercase",letterSpacing:"0.05em",background:T.input}}>{icon} {label} ({n})</div>;
  const Row = ({children,onClick}) => {
    const [hover,setHover] = useState(false);
    return <div onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid ${T.border}`,background:hover?T.input:"transparent"}}>{children}</div>;
  };
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:80}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:620,padding:"0 16px"}}>
        <div style={{background:T.card,borderRadius:16,boxShadow:`0 20px 60px ${T.shadow}`,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🔍</span>
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Rechercher chantiers, personnel, engins..."
              style={{flex:1,border:"none",outline:"none",fontSize:15,background:"transparent",color:T.text}}/>
            {query && <button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.text3}}>x</button>}
            <kbd style={{fontSize:11,color:T.text3,background:T.input,padding:"2px 6px",borderRadius:4}}>Echap</kbd>
          </div>
          <div style={{maxHeight:420,overflowY:"auto"}}>
            {!q ? (
              <div style={{padding:"20px 16px",color:T.text3,fontSize:13,textAlign:"center"}}>Tapez pour rechercher dans les chantiers, le personnel et la flotte</div>
            ) : total===0 ? (
              <div style={{padding:"30px 16px",textAlign:"center",color:T.text3}}>
                <div style={{fontSize:28,marginBottom:8}}>🔍</div>
                <div style={{fontSize:13}}>Aucun resultat pour "{query}"</div>
              </div>
            ) : (
              <>
                {rC.length>0 && <><SectionHead icon="🏗️" label="Chantiers" n={rC.length}/>
                  {rC.map(ch=>{const sc=STATUT_CONFIG[ch.statut];return(
                    <Row key={ch.id} onClick={()=>onSelectChantier(ch)}>
                      <div style={{width:34,height:34,borderRadius:8,background:(sc?.color||"#FF6B35")+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🏗️</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ch.nom}</div>
                        <div style={{fontSize:11,color:T.text3}}>📍 {ch.ville} . 👤 {ch.responsable}</div>
                      </div>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:sc?.bg,color:sc?.color,fontWeight:700,flexShrink:0}}>{sc?.label}</span>
                    </Row>
                  );})}
                </>}
                {rP.length>0 && <><SectionHead icon="👷" label="Personnel" n={rP.length}/>
                  {rP.map(m=>(
                    <Row key={m.id} onClick={()=>onSelectTab("personnel")}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:m.tC+"20",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:m.tC,flexShrink:0}}>{m.nom.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:13,color:T.text}}>{m.nom}</div>
                        <div style={{fontSize:11,color:T.text3}}>{m.poste} . {m.tI} {m.tN}</div>
                      </div>
                    </Row>
                  ))}
                </>}
                {rF.length>0 && <><SectionHead icon="🚛" label="Flotte" n={rF.length}/>
                  {rF.map(v=>{const ft=FLOTTE_TYPES[v.type]||FLOTTE_TYPES.materiel;const fs=FLOTTE_STATUTS[v.statut]||FLOTTE_STATUTS.disponible;return(
                    <Row key={v.id} onClick={()=>onSelectTab("flotte")}>
                      <div style={{width:34,height:34,borderRadius:8,background:ft.color+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ft.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.nom}</div>
                        <div style={{fontSize:11,color:T.text3}}>{v.marque} {v.modele}{v.immat?" . "+v.immat:""}</div>
                      </div>
                      <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:fs.bg,color:fs.color,fontWeight:700,flexShrink:0}}>{fs.label}</span>
                    </Row>
                  );})}
                </>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


const INITIAL_FLOTTE = [
    { id:1, nom:"Pelleteuse Volvo EC220", type:"engin", immat:"AB-123-CD", marque:"Volvo", modele:"EC220", annee:2019, statut:"disponible", km:12400, prochain_ct:"2025-11-15", notes:"Vidange faite en avril", photo:null },
    { id:2, nom:"Camion-benne Renault", type:"camion", immat:"EF-456-GH", marque:"Renault", modele:"Kerax 380", annee:2017, statut:"disponible", km:87500, prochain_ct:"2025-08-20", notes:"", photo:null },
    { id:3, nom:"Betonniere remorque", type:"materiel", immat:"", marque:"Altrad", modele:"B180", annee:2021, statut:"disponible", km:0, prochain_ct:"", notes:"Verifier courroie", photo:null },
    { id:4, nom:"Nacelle Haulotte", type:"engin", immat:"IJ-789-KL", marque:"Haulotte", modele:"HA16PX", annee:2020, statut:"maintenance", km:3200, prochain_ct:"2026-02-10", notes:"Controle annuel en cours", photo:null },
    { id:5, nom:"Fourgon Ford Transit", type:"camion", immat:"MN-012-OP", marque:"Ford", modele:"Transit 350", annee:2022, statut:"disponible", km:34200, prochain_ct:"2026-05-30", notes:"", photo:null },
  ];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const T = darkMode ? DARK : LIGHT;
  const [tab, setTab] = useState("dashboard");
  const [chantiers, setChantiers] = useState([]);
  const [flotte, setFlotte] = useState([]);
  const [teams, setTeams] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const isFirstRender = useRef(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedChantier, setSelectedChantier] = useState(null);
  const [editingChantier, setEditingChantier] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterEquipe, setFilterEquipe] = useState("all");
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [notifications] = useState([
    { id:1, text:"Chantier Mairie Lillers a 65% — livraison estimee dans 2 jours", time:"Il y a 10 min"},
    { id:2, text:"L'equipe Demolition est disponible mardi prochain", time:"Il y a 1h"},
    { id:3, text:"Hangar Aire-sur-la-Lys : retard possible detecte", time:"Il y a 2h"},
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [prefillDate, setPrefillDate] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // ── Chargement initial depuis Supabase ──────────────────────
  useEffect(() => {
    (async () => {
      setDbLoading(true);
      const [dbChantiers, dbTeams, dbFlotte, dbDark] = await Promise.all([
        fetchChantiers(),
        fetchTeams(),
        fetchFlotte(),
        loadSetting("darkMode", false),
      ]);
      if (dbChantiers.length === 0) { await resetChantiersDB(CHANTIERS_62); setChantiers(CHANTIERS_62); }
      else setChantiers(dbChantiers);
      if (dbTeams.length === 0) { await resetTeamsDB(INITIAL_TEAMS); setTeams(INITIAL_TEAMS); }
      else setTeams(dbTeams);
      if (dbFlotte.length === 0) { await resetFlotteDB(INITIAL_FLOTTE); setFlotte(INITIAL_FLOTTE); }
      else setFlotte(dbFlotte);
      setDarkMode(dbDark);
      setDbLoading(false);
    })();
  }, []);

  // ── Persistance darkMode ────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    saveSetting("darkMode", darkMode);
  }, [darkMode]);
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") { setShowGlobalSearch(false); setGlobalSearch(""); } };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const saveChantier = async (form) => {
    const saved = await saveChantierDB(form);
    if (!saved) return;
    if (form.id) setChantiers(c => c.map(ch => ch.id === saved.id ? saved : ch));
    else setChantiers(c => [...c, saved]);
    setShowNewForm(false);
    setEditingChantier(null);
  };

  const filteredChantiers = chantiers.filter(c => {
    const matchStatut = filterStatut === "all" || c.statut === filterStatut;
    const matchEquipe = filterEquipe === "all" || c.equipes.includes(filterEquipe);
    const matchSearch = !search || c.nom.toLowerCase().includes(search.toLowerCase()) || c.ville.toLowerCase().includes(search.toLowerCase());
    return matchStatut && matchEquipe && matchSearch;
  });

  


  const TABS = [
    { id:"dashboard", label:"Dashboard", icon:"📊" },
    { id:"chantiers", label:"Chantiers", icon:"🏗️" },
    { id:"planning",  label:"Planning",  icon:"📅" },
    { id:"meteo",     label:"Meteo",     icon:"⛅" },
    { id:"carte",     label:"Carte 62",  icon:"🗺️" },
    { id:"equipes",   label:"Equipes",   icon:"👷" },
    { id:"personnel", label:"Personnel", icon:"👤" },
    { id:"flotte",    label:"Flotte",    icon:"🚛" },
  ];

  if (dbLoading) return (
    <div style={{minHeight:"100vh",background:"#0F1117",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:"4px solid #FF6B3530",borderTop:"4px solid #FF6B35",animation:"spin 0.8s linear infinite"}}/>
      <div style={{color:"#FF6B35",fontWeight:700,fontSize:15}}>Chargement ChantierPro…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:T.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:T.text, transition:"background 0.2s,color 0.2s"}}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#FF6B35; border-radius:3px; }
        @media (max-width:768px) {
          .desktop-only { display:none !important; }
          .tab-label { display:none !important; }
          .grid-2col { grid-template-columns:1fr !important; }
          .stat-grid { grid-template-columns:repeat(2,1fr) !important; }
          .chantier-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <GlobalSearch
        open={showGlobalSearch}
        onClose={() => { setShowGlobalSearch(false); setGlobalSearch(""); }}
        query={globalSearch} setQuery={setGlobalSearch}
        chantiers={chantiers} teams={teams} flotte={flotte} darkMode={darkMode}
        onSelectChantier={c => { setSelectedChantier(c); setShowGlobalSearch(false); setGlobalSearch(""); }}
        onSelectTab={t => { setTab(t); setShowGlobalSearch(false); setGlobalSearch(""); }}
      />

      {!isOnline && (
        <div style={{background:"#EF4444", color:"#fff", textAlign:"center", padding:"8px 16px", fontSize:13, fontWeight:600}}>
          📡 Mode hors-ligne — vos donnees sont sauvegardees localement
        </div>
      )}

      {/* Header */}
      <div style={{background:T.headerBg, borderBottom:`1px solid ${T.headerBorder}`, boxShadow:`0 1px 4px ${T.shadow}`, position:"sticky", top:0, zIndex:100, transition:"background 0.2s"}}>
        <div style={{maxWidth:1280, margin:"0 auto", padding:"0 12px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", height:56}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <div style={{width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#FF6B35,#E85D04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0}}>🏗️</div>
              <div className="desktop-only">
                <div style={{fontWeight:800, fontSize:16, color:T.text, letterSpacing:"-0.02em"}}>ChantierPro</div>
                <div style={{fontSize:10, color:T.text3, fontWeight:500, display:"flex", alignItems:"center", gap:5}}>
                  Lillers 62190 . Pas-de-Calais
                  <span style={{color:isOnline?"#22C55E":"#EF4444"}}>{isOnline?"● En ligne":"● Hors-ligne"}</span>
                  <span style={{color:"#22C55E"}}>. 💾 Sauvegarde</span>
                </div>
              </div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <button onClick={() => setShowGlobalSearch(s => !s)} title="Recherche globale"
                style={{background:showGlobalSearch?"#FFF7ED":T.input, border:`1px solid ${showGlobalSearch?"#FF6B35":T.border2}`, borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center"}}>
                "🔍"
              </button>
              <button onClick={async () => { if(window.confirm("Reinitialiser toutes les donnees ?")) { await resetChantiersDB(CHANTIERS_62); await resetTeamsDB(INITIAL_TEAMS); await resetFlotteDB(INITIAL_FLOTTE); setChantiers(CHANTIERS_62); setTeams(INITIAL_TEAMS); setFlotte(INITIAL_FLOTTE); }}} title="Reinitialiser" style={{background:T.input, border:`1px solid ${T.border2}`, borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center"}} className="desktop-only">
                {"🔄"}
              </button>
              <button onClick={() => setDarkMode(d => !d)} title={darkMode?"Mode clair":"Mode sombre"}
                style={{background:T.input, border:`1px solid ${T.border2}`, borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center"}}>
                {darkMode ? "☀️" : "🌙"}
              </button>
              <div style={{position:"relative"}}>
                <button onClick={() => setShowNotif(!showNotif)}
                  style={{position:"relative", background:T.input, border:`1px solid ${T.border2}`, borderRadius:10, width:38, height:38, cursor:"pointer", fontSize:16}}>🔔
                  <div style={{position:"absolute", top:4, right:4, width:8, height:8, borderRadius:"50%", background:"#FF6B35", border:`2px solid ${T.card}`}}/>
                </button>
                {showNotif && (
                  <div style={{position:"absolute", top:46, right:0, width:300, background:T.card, borderRadius:14, boxShadow:`0 10px 40px ${T.shadow}`, border:`1px solid ${T.border}`, zIndex:200, overflow:"hidden"}}>
                    <div style={{padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between"}}>
                      <span style={{fontWeight:700, fontSize:14, color:T.text}}>Notifications</span>
                      <span style={{fontSize:11, color:T.text3}}>{notifications.length} nouvelles</span>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} style={{padding:"12px 16px", borderBottom:`1px solid ${T.border}`}}>
                        <div style={{fontSize:12, color:T.text2, marginBottom:4}}>{n.text}</div>
                        <div style={{fontSize:10, color:T.text3}}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { setEditingChantier(null); setShowNewForm(true); }}
                style={{padding:"8px 14px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#FF6B35,#E85D04)", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, boxShadow:"0 2px 8px rgba(255,107,53,0.35)", whiteSpace:"nowrap"}}>
                + Nouveau
              </button>
            </div>
          </div>
          <div style={{display:"flex", gap:0, paddingBottom:0, overflowX:"auto"}}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{padding:"10px 12px", border:"none", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:tab===t.id?700:500, color:tab===t.id?"#FF6B35":T.text2, borderBottom:`2px solid ${tab===t.id?"#FF6B35":"transparent"}`, transition:"all 0.15s", borderRadius:"4px 4px 0 0", whiteSpace:"nowrap", flexShrink:0}}>
                {t.icon} <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1280, margin:"0 auto", padding:"16px 12px"}}>
        {tab === "dashboard"  && <Dashboard chantiers={chantiers} teams={teams} darkMode={darkMode} />}
        {tab === "chantiers"  && (
          <div>
            <div style={{display:"flex", gap:10, marginBottom:20, flexWrap:"wrap"}}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un chantier..."
                style={{flex:1, minWidth:150, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${T.border2}`, fontSize:13, outline:"none", background:T.input, color:T.text}}/>
              <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
                style={{padding:"10px 14px", borderRadius:10, border:`1.5px solid ${T.border2}`, fontSize:13, background:T.input, color:T.text, cursor:"pointer"}}>
                <option value="all">Tous statuts</option>
                {Object.entries(STATUT_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterEquipe} onChange={e => setFilterEquipe(e.target.value)}
                style={{padding:"10px 14px", borderRadius:10, border:`1.5px solid ${T.border2}`, fontSize:13, background:T.input, color:T.text, cursor:"pointer"}}>
                <option value="all">Toutes equipes</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
              </select>
            </div>
            <div style={{fontSize:13, color:T.text2, marginBottom:16}}>{filteredChantiers.length} chantier{filteredChantiers.length!==1?"s":""}</div>
            {filteredChantiers.length === 0 ? (
              <div style={{textAlign:"center", padding:"60px 20px", color:T.text3}}>
                <div style={{fontSize:40, marginBottom:12}}>🏗️</div>
                <div style={{fontSize:16, fontWeight:600, color:T.text}}>Aucun chantier trouve</div>
              </div>
            ) : (
              <div className="chantier-grid" style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14}}>
                {filteredChantiers.map(c => <ChantierCard key={c.id} chantier={c} onClick={setSelectedChantier} darkMode={darkMode}/>)}
              </div>
            )}
          </div>
        )}
        {tab === "planning" && (
          <div className="grid-2col" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
            <Calendar chantiers={chantiers} darkMode={darkMode}
              onSelectChantier={c => setSelectedChantier(c)}
              onNewChantier={date => { setEditingChantier(null); setShowNewForm(true); setPrefillDate(date); }}
            />
            <div style={{display:"flex", flexDirection:"column", gap:16}}>
              <WeatherDashboard chantiers={chantiers} darkMode={darkMode}/>
              <div style={{background:"linear-gradient(135deg,#FF6B35,#E85D04)", borderRadius:16, padding:20}}>
                <div style={{color:"#fff", fontWeight:700, fontSize:15, marginBottom:8}}>🤖 Suggestion IA</div>
                <div style={{color:"rgba(255,255,255,0.9)", fontSize:13, lineHeight:1.5, marginBottom:16}}>
                  Optimisez votre planning en consultant l'assistant IA pour les affectations d'equipes et les conflits horaires.
                </div>
                <button onClick={() => setShowAI(true)} style={{background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", borderRadius:8, padding:"8px 16px", color:"#fff", cursor:"pointer", fontWeight:600, fontSize:12}}>💬 Demander a l'IA →</button>
              </div>
              <div style={{background:T.card, borderRadius:16, padding:20, boxShadow:`0 1px 3px ${T.shadow}`}}>
                <h3 style={{margin:"0 0 16px", fontSize:15, fontWeight:700, color:T.text}}>🗓️ Prochains chantiers</h3>
                {chantiers.filter(c => c.statut === "planifie").map(c => (
                  <div key={c.id} style={{display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${T.border}`, alignItems:"center"}}>
                    <div style={{width:40, height:40, borderRadius:10, background:"#FFF7ED", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                      <div style={{fontSize:10, fontWeight:800, color:"#FF6B35"}}>{c.date.split("-")[2]}</div>
                      <div style={{fontSize:9, color:"#9CA3AF"}}>{MONTHS[parseInt(c.date.split("-")[1])-1]?.slice(0,3)}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600, fontSize:13, color:T.text}}>{c.nom}</div>
                      <div style={{fontSize:11, color:T.text3}}>📍 {c.ville} . 🕐 {c.heure}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "meteo"     && <MeteoPage chantiers={chantiers} darkMode={darkMode}/>}
        {tab === "carte"     && <MapView chantiers={chantiers} darkMode={darkMode}/>}
        {tab === "equipes"   && <TeamView chantiers={chantiers} teams={teams} darkMode={darkMode}/>}
        {tab === "personnel" && <PersonnelView teams={teams} setTeams={setTeams} darkMode={darkMode}/>}
        {tab === "flotte"    && <FlotteView flotte={flotte} setFlotte={setFlotte} darkMode={darkMode}/>}
      </div>

      {/* AI FAB */}
      <button onClick={() => setShowAI(!showAI)}
        style={{position:"fixed", bottom:showAI?560:24, right:24, width:52, height:52, borderRadius:"50%", border:"none", background:"linear-gradient(135deg,#FF6B35,#E85D04)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:899, boxShadow:"0 6px 20px rgba(255,107,53,0.4)", transition:"all 0.3s"}}>
        {"🤖"}
      </button>

      {showAI && <AIAssistant chantiers={chantiers} darkMode={darkMode} onClose={() => setShowAI(false)}/>}

      <Modal open={showNewForm} onClose={() => { setShowNewForm(false); setPrefillDate(null); }} title="Nouveau chantier" darkMode={darkMode}>
        <ChantierForm darkMode={darkMode}
          initial={prefillDate ? {nom:"",ville:"",adresse:"",date:prefillDate,heure:"08:00",duree:1,priorite:"normale",statut:"planifie",responsable:"",equipes:[],notes:"",progression:0,lat:50.5637,lng:2.4823,photos:0,documents:0,heures:0,materiel:[],rentabilite:0} : null}
          onSave={saveChantier} onCancel={() => { setShowNewForm(false); setPrefillDate(null); }}/>
      </Modal>

      <Modal open={!!editingChantier} onClose={() => setEditingChantier(null)} title="Modifier le chantier" darkMode={darkMode}>
        {editingChantier && <ChantierForm darkMode={darkMode} initial={editingChantier} onSave={saveChantier} onCancel={() => setEditingChantier(null)}/>}
      </Modal>

      <Modal open={!!selectedChantier && !editingChantier} onClose={() => setSelectedChantier(null)} title={selectedChantier?.nom||""} darkMode={darkMode}>
        {selectedChantier && <ChantierDetail chantier={selectedChantier} darkMode={darkMode}
          onEdit={c => { setSelectedChantier(null); setEditingChantier(c); }}
          onClose={() => setSelectedChantier(null)}
          onDelete={async id => { await deleteChantierDB(id); setChantiers(c => c.filter(ch => ch.id !== id)); setSelectedChantier(null); }}
          onUpdate={async updated => { await saveChantierDB(updated); setChantiers(cs => cs.map(ch => ch.id===updated.id?updated:ch)); setSelectedChantier(updated); }}
        />}
      </Modal>

      {showNotif && <div onClick={() => setShowNotif(false)} style={{position:"fixed", inset:0, zIndex:150}}/>}
    </div>
  );
}
