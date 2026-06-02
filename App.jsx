import { useState, useEffect, useRef } from "react";

// ─── CHARTE GRAPHIQUE OFFICIELLE ───────────────────────────────────────────
const C = {
  green:       "#0B7A3B",
  greenLight:  "#2FA866",
  greenPale:   "#E8F5EE",
  greenMid:    "#1A9450",
  white:       "#FFFFFF",
  textDark:    "#1A1A1A",
  bgLight:     "#F5F7F5",
  grayMid:     "#6B7280",
  grayLight:   "#D1D5DB",
  red:         "#D32F2F",
  redLight:    "#FFEBEE",
  gold:        "#F59E0B",
  shadow:      "rgba(11,122,59,0.15)",
};

// ─── DONNÉES MOCK ───────────────────────────────────────────────────────────
const TRIPS = [
  { id:1, from:"Yaoundé Centre", to:"Douala Akwa",     driver:"Kouam Éric",    note:4.8, seats:2, price:"4 500", time:"07h30", dur:"3h",    phone:"+237 691 234 567", car:"Toyota Corolla Blanc", verified:true,  km:240 },
  { id:2, from:"Yaoundé Melen",  to:"Douala Bonabéri", driver:"Mireille Biya", note:4.9, seats:3, price:"4 200", time:"08h00", dur:"3h20",  phone:"+237 677 890 123", car:"Honda Civic Gris",    verified:true,  km:248 },
  { id:3, from:"Yaoundé Bastos", to:"Douala Bassa",    driver:"Patrick Ngo",   note:4.6, seats:1, price:"5 000", time:"09h15", dur:"2h50",  phone:"+237 655 432 100", car:"Peugeot 307 Bleu",   verified:false, km:235 },
];

const DRIVER_TRIPS = [
  { id:1, date:"Aujourd'hui", from:"Yaoundé", to:"Douala", passagers:3, statut:"En cours",  revenu:"13 500" },
  { id:2, date:"Hier",        from:"Yaoundé", to:"Bafoussam", passagers:2, statut:"Terminé", revenu:"9 000" },
  { id:3, date:"28 Mai",      from:"Douala",  to:"Yaoundé", passagers:4, statut:"Terminé", revenu:"18 000" },
];

const ADMIN_STATS = { users:1247, drivers:84, trips:3420, revenue:"15 420 000" };
const ADMIN_DRIVERS = [
  { name:"Kouam Éric",    phone:"+237 691 234 567", statut:"Validé",   trips:47 },
  { name:"Patrick Ngo",   phone:"+237 655 432 100", statut:"En attente", trips:0 },
  { name:"Aminata Diallo",phone:"+237 699 111 222", statut:"Validé",   trips:23 },
];

// ─── NAVIGATION ─────────────────────────────────────────────────────────────
const USER_SCREENS   = ["splash","login","otp","home","search","results","detail","booking","payment","qr","tracking","famille","notation","profile","historique","sos"];
const DRIVER_SCREENS = ["splash","login","otp","driver_home","driver_docs","driver_publish","driver_reservations","driver_scan","driver_revenus"];
const ADMIN_SCREENS  = ["splash","login","otp","admin_dashboard","admin_drivers","admin_trips","admin_incidents"];

const LABELS = {
  splash:"Splash", login:"Connexion", otp:"OTP",
  home:"Accueil", search:"Recherche", results:"Résultats", detail:"Détail",
  booking:"Réservation", payment:"Paiement", qr:"QR Code",
  tracking:"Suivi GPS", famille:"Famille", notation:"Notation",
  profile:"Profil", historique:"Historique", sos:"SOS",
  driver_home:"Accueil", driver_docs:"Documents", driver_publish:"Publier",
  driver_reservations:"Réservations", driver_scan:"Scanner QR", driver_revenus:"Revenus",
  admin_dashboard:"Dashboard", admin_drivers:"Chauffeurs", admin_trips:"Trajets", admin_incidents:"Incidents",
};

// ─── UI PRIMITIVES ──────────────────────────────────────────────────────────
const Btn = ({ label, onClick, color=C.green, textColor=C.white, disabled=false, small=false, outline=false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:"100%", padding: small ? "10px 0" : "15px 0",
    background: outline ? "transparent" : (disabled ? C.grayLight : color),
    border: outline ? `2px solid ${color}` : "none",
    borderRadius:14, color: outline ? color : textColor,
    fontWeight:700, fontSize: small ? 13 : 15,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: outline || disabled ? "none" : `0 4px 16px ${C.shadow}`,
    transition:"all 0.2s",
    fontFamily:"inherit",
  }}>{label}</button>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:C.white, borderRadius:16, padding:16, boxShadow:`0 2px 12px ${C.shadow}`, ...style }}>
    {children}
  </div>
);

const Badge = ({ label, color=C.green, bg }) => (
  <span style={{
    background: bg || color+"1A", color, borderRadius:20,
    padding:"3px 10px", fontSize:11, fontWeight:700,
  }}>{label}</span>
);

const Field = ({ icon, label, value }) => (
  <div style={{ background:C.bgLight, borderRadius:12, padding:"12px 16px", display:"flex", gap:12, alignItems:"center" }}>
    <span style={{ fontSize:20 }}>{icon}</span>
    <div>
      <div style={{ color:C.grayMid, fontSize:10, textTransform:"uppercase", letterSpacing:1.5 }}>{label}</div>
      <div style={{ color:C.textDark, fontSize:15, fontWeight:600, marginTop:2 }}>{value}</div>
    </div>
  </div>
);

const Row = ({ label, value, accent=false }) => (
  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.bgLight}` }}>
    <span style={{ color:C.grayMid, fontSize:13 }}>{label}</span>
    <span style={{ color: accent ? C.green : C.textDark, fontSize:13, fontWeight: accent ? 700 : 500 }}>{value}</span>
  </div>
);

// ─── PHONE FRAME ────────────────────────────────────────────────────────────
function PhoneFrame({ children, mode }) {
  return (
    <div style={{
      width:375, minHeight:780,
      background:C.white,
      borderRadius:44,
      border:`2px solid ${C.grayLight}`,
      overflow:"hidden",
      position:"relative",
      boxShadow:`0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px ${C.grayLight}`,
      display:"flex", flexDirection:"column",
    }}>
      {/* Status bar */}
      <div style={{ background: mode==="admin" ? C.textDark : C.green, padding:"12px 24px 8px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ color:"#ffffff99", fontSize:11, fontFamily:"monospace" }}>9:41</span>
        <div style={{ width:100, height:22, background:"rgba(0,0,0,0.3)", borderRadius:14 }} />
        <span style={{ color:"#ffffff99", fontSize:11 }}>📶 🔋</span>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

// ─── TOPBAR ─────────────────────────────────────────────────────────────────
function TopBar({ title, onBack, onProfile, greenBg=false }) {
  return (
    <div style={{
      background: greenBg ? C.green : C.white,
      padding:"12px 20px",
      display:"flex", alignItems:"center", gap:12,
      borderBottom: greenBg ? "none" : `1px solid ${C.bgLight}`,
      boxShadow: greenBg ? "none" : `0 1px 4px ${C.shadow}`,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:20, padding:4, color: greenBg ? C.white : C.green }}>←</button>
      )}
      <span style={{ flex:1, fontWeight:700, fontSize:16, color: greenBg ? C.white : C.textDark }}>{title}</span>
      {onProfile && (
        <button onClick={onProfile} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:22, padding:4 }}>👤</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ÉCRANS UTILISATEUR
// ════════════════════════════════════════════════════════════════════════════

function SplashScreen({ onNext }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background:`linear-gradient(160deg, ${C.green} 0%, ${C.greenMid} 60%, ${C.greenLight} 100%)`,
      padding:40, gap:24,
    }}>
      {/* Logo */}
      <div style={{ width:100, height:100, borderRadius:32, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
        <span style={{ fontSize:54 }}>🌍</span>
      </div>
      <div style={{ textAlign:"center" }}>
        <div style={{ color:C.white, fontSize:52, fontWeight:900, letterSpacing:-2, fontFamily:"Georgia,serif", lineHeight:1 }}>MENKE</div>
        <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13, letterSpacing:5, marginTop:6, textTransform:"uppercase" }}>Mobilité Africaine</div>
      </div>
      <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:16, padding:"14px 24px", textAlign:"center" }}>
        <div style={{ color:C.white, fontSize:15, fontStyle:"italic", fontFamily:"Georgia,serif" }}>"Votre famille sait où vous êtes."</div>
      </div>
      <div style={{ position:"absolute", bottom:60, width:"80%" }}>
        <Btn label="Commencer →" onClick={onNext} color={C.white} textColor={C.green} />
      </div>
    </div>
  );
}

function LoginScreen({ onNext }) {
  const [phone, setPhone] = useState("");
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"32px 24px", gap:20 }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, marginBottom:8 }}>
        <div style={{ width:60, height:60, borderRadius:20, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>🌍</div>
        <div style={{ fontSize:24, fontWeight:900, color:C.textDark, fontFamily:"Georgia,serif" }}>Bienvenue sur MENKE</div>
        <div style={{ color:C.grayMid, fontSize:13, textAlign:"center" }}>Entrez votre numéro pour continuer</div>
      </div>

      <Card>
        <div style={{ color:C.grayMid, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Numéro de téléphone</div>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:C.bgLight, borderRadius:10, padding:"12px 14px" }}>
          <span style={{ fontSize:22 }}>🇨🇲</span>
          <span style={{ color:C.grayMid, fontWeight:600 }}>+237</span>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="6XX XXX XXX"
            style={{ background:"transparent", border:"none", outline:"none", color:C.textDark, fontSize:17, fontFamily:"monospace", flex:1 }} />
        </div>
      </Card>

      <div style={{ background:C.greenPale, borderRadius:12, padding:12, display:"flex", gap:10, alignItems:"center" }}>
        <span>🔒</span>
        <span style={{ color:C.green, fontSize:12 }}>Connexion sécurisée par code OTP. Vos données sont protégées.</span>
      </div>

      <div style={{ marginTop:"auto" }}>
        <Btn label="Recevoir le code OTP" onClick={onNext} />
      </div>
    </div>
  );
}

function OTPScreen({ onNext }) {
  const [otp] = useState(["6","2","","","",""]);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"32px 24px", gap:20 }}>
      <div style={{ textAlign:"center", gap:8, display:"flex", flexDirection:"column", alignItems:"center", marginBottom:8 }}>
        <div style={{ width:56, height:56, borderRadius:28, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>📱</div>
        <div style={{ fontSize:22, fontWeight:900, color:C.textDark }}>Vérification</div>
        <div style={{ color:C.grayMid, fontSize:13 }}>Code envoyé au +237 6** *** 789</div>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width:46, height:56, borderRadius:12,
            background:C.bgLight,
            border:`2px solid ${i<2 ? C.green : i===2 ? C.greenLight : C.grayLight}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color:C.textDark, fontSize:24, fontWeight:700, fontFamily:"monospace",
          }}>
            {otp[i] || (i===2 ? <span style={{color:C.green,fontSize:18}}>|</span> : "")}
          </div>
        ))}
      </div>

      <div style={{ textAlign:"center", color:C.grayMid, fontSize:12 }}>
        Vous n'avez pas reçu le code ? <span style={{ color:C.green, fontWeight:700 }}>Renvoyer (58s)</span>
      </div>

      <div style={{ marginTop:"auto" }}>
        <Btn label="Valider le code ✓" onClick={onNext} />
      </div>
    </div>
  );
}

function HomeScreen({ goTo }) {
  const services = [
    { id:"ride",   icon:"🚗", label:"MENKE Ride",   sub:"Covoiturage",    active:true  },
    { id:"travel", icon:"🚌", label:"MENKE Travel", sub:"Interurbain",    active:true  },
    { id:"ticket", icon:"🎟️", label:"MENKE Ticket", sub:"Billetterie",    active:false },
    { id:"food",   icon:"🍽️", label:"MENKE Food",   sub:"Livraison repas",active:false },
    { id:"market", icon:"🛒", label:"MENKE Market", sub:"Produits frais", active:false },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      {/* Header vert */}
      <div style={{ background:C.green, padding:"16px 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12 }}>Bonjour 👋</div>
            <div style={{ color:C.white, fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Jean-Paul M.</div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <button onClick={()=>goTo("sos")} style={{ width:40, height:40, borderRadius:20, background:C.red, border:"none", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(211,47,47,0.5)" }}>🆘</button>
            <button onClick={()=>goTo("profile")} style={{ width:40, height:40, borderRadius:20, background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" }}>👤</button>
          </div>
        </div>
      </div>

      <div style={{ padding:"0 16px", marginTop:-12 }}>
        {/* Banner promo */}
        <Card style={{ marginBottom:16, background:`linear-gradient(135deg, ${C.textDark}, #2d2d2d)`, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", right:-10, top:-10, fontSize:80, opacity:0.15 }}>🚌</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10, letterSpacing:2, textTransform:"uppercase" }}>Populaire aujourd'hui</div>
          <div style={{ color:C.white, fontSize:19, fontWeight:900, marginTop:4, fontFamily:"Georgia,serif" }}>Yaoundé → Douala</div>
          <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12, marginTop:2 }}>12 trajets disponibles · dès 4 200 FCFA</div>
          <button onClick={()=>goTo("search")} style={{ marginTop:12, background:C.green, color:C.white, border:"none", borderRadius:10, padding:"8px 18px", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
            Réserver →
          </button>
        </Card>

        {/* Services */}
        <div style={{ color:C.grayMid, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Nos services</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {services.map(s => (
            <button key={s.id} onClick={()=>s.active && goTo("search")} style={{
              background:C.white, border:`1px solid ${s.active ? C.greenPale : C.grayLight}`,
              borderRadius:14, padding:14, cursor: s.active ? "pointer" : "default",
              textAlign:"left", position:"relative", opacity: s.active ? 1 : 0.6,
              boxShadow: s.active ? `0 2px 8px ${C.shadow}` : "none",
            }}>
              {!s.active && <div style={{ position:"absolute", top:8, right:8, background:C.bgLight, borderRadius:6, padding:"1px 6px", fontSize:9, color:C.grayMid, fontWeight:700 }}>Bientôt</div>}
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ color:C.textDark, fontSize:13, fontWeight:700 }}>{s.label}</div>
              <div style={{ color:C.grayMid, fontSize:11, marginTop:2 }}>{s.sub}</div>
              {s.active && <div style={{ marginTop:8, height:2, background:`linear-gradient(to right, ${C.green}, transparent)`, borderRadius:2 }} />}
            </button>
          ))}
        </div>

        {/* Sécurité */}
        <Card style={{ background:C.greenPale, marginBottom:16 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:28 }}>🛡️</span>
            <div>
              <div style={{ color:C.green, fontWeight:700, fontSize:14 }}>Partage famille activé</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:2 }}>Vos proches peuvent suivre vos trajets en temps réel.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SearchScreen({ onNext }) {
  const [from, setFrom] = useState("Yaoundé");
  const [to, setTo] = useState("Douala");
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <TopBar title="Rechercher un trajet" greenBg />
      <div style={{ flex:1, padding:"20px 20px", display:"flex", flexDirection:"column", gap:14 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { icon:"📍", label:"Départ", val:from, set:setFrom, opts:["Yaoundé","Yaoundé Centre","Yaoundé Melen","Yaoundé Bastos"] },
            { icon:"🏁", label:"Arrivée", val:to,   set:setTo,   opts:["Douala","Douala Akwa","Douala Bonabéri","Bafoussam"] },
          ].map((f,i) => (
            <div key={i} style={{ background:C.white, borderRadius:14, padding:"14px 16px", border:`1px solid ${C.grayLight}`, boxShadow:`0 1px 4px ${C.shadow}` }}>
              <div style={{ color:C.grayMid, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:6 }}>{f.icon} {f.label}</div>
              <select value={f.val} onChange={e=>f.set(e.target.value)} style={{ background:"transparent", border:"none", outline:"none", color:C.textDark, fontSize:17, fontWeight:600, width:"100%", fontFamily:"inherit" }}>
                {f.opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {[
          { icon:"📅", label:"Date", val:"Demain, 2 juin 2026" },
          { icon:"👥", label:"Passagers", val:"1 passager" },
        ].map((f,i) => <Field key={i} icon={f.icon} label={f.label} value={f.val} />)}

        <Card style={{ background:C.greenPale }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span>🛡️</span>
            <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>Tous les chauffeurs MENKE sont vérifiés CNI + permis.</span>
          </div>
        </Card>

        <div style={{ marginTop:"auto" }}>
          <Btn label="Rechercher les trajets 🔍" onClick={onNext} />
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ onNext, setTrip }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bgLight }}>
      <TopBar title="Résultats" greenBg />
      <div style={{ padding:"12px 16px 6px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ color:C.textDark, fontSize:14 }}>Yaoundé → Douala · Lun. 2 juin</div>
        <Badge label={`${TRIPS.length} trajets`} />
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"6px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        {TRIPS.map(t => (
          <button key={t.id} onClick={()=>{ setTrip(t); onNext(); }} style={{
            background:C.white, border:`1px solid ${C.grayLight}`, borderRadius:18,
            padding:16, cursor:"pointer", textAlign:"left", width:"100%",
            boxShadow:`0 2px 8px ${C.shadow}`,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:38, height:38, borderRadius:19, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>
                <div>
                  <div style={{ color:C.textDark, fontWeight:700, fontSize:14 }}>{t.driver}</div>
                  <div style={{ fontSize:11, color:C.gold }}>⭐ {t.note} {t.verified && <span style={{color:C.green}}>· ✓ Vérifié</span>}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:C.green, fontWeight:900, fontSize:17 }}>{t.price} FCFA</div>
                <div style={{ color:C.grayMid, fontSize:11 }}>par personne</div>
              </div>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {[`🕐 ${t.time}`, `⏱ ${t.dur}`, `💺 ${t.seats} place${t.seats>1?"s":""}`, `📍 ${t.km} km`].map((tag,i)=>(
                <span key={i} style={{ background:C.bgLight, borderRadius:8, padding:"4px 10px", fontSize:11, color:C.grayMid }}>{tag}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailScreen({ trip, onNext }) {
  if (!trip) trip = TRIPS[0];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bgLight }}>
      <TopBar title="Détail du trajet" greenBg />

      {/* Route banner */}
      <div style={{ background:C.green, padding:"16px 20px 28px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:C.white, fontWeight:700, fontSize:18 }}>{trip.time}</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>Yaoundé</div>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
            <div style={{ height:2, flex:1, background:"rgba(255,255,255,0.4)", borderRadius:2 }}/>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 10px" }}>
              <span style={{ color:C.white, fontSize:11 }}>{trip.dur} · {trip.km} km</span>
            </div>
            <div style={{ height:2, flex:1, background:"rgba(255,255,255,0.4)", borderRadius:2 }}/>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:C.white, fontWeight:700, fontSize:18 }}>Arrivée</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11 }}>Douala</div>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12, marginTop:-12 }}>
        <Card>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:52, height:52, borderRadius:26, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👤</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16, color:C.textDark }}>{trip.driver}</div>
              <div style={{ color:C.gold, fontSize:12, marginTop:2 }}>⭐ {trip.note} · {trip.verified ? <span style={{color:C.green}}>✓ Vérifié</span> : <span style={{color:C.gold}}>En attente</span>}</div>
            </div>
          </div>
          {[
            ["🚗","Véhicule", trip.car],
            ["📞","Téléphone", trip.phone],
            ["💺","Places dispo.", `${trip.seats} place${trip.seats>1?"s":""}`],
            ["🔒","Assurance voyage","Incluse ✓"],
          ].map(([ic,lbl,val])=>(
            <Row key={lbl} label={`${ic} ${lbl}`} value={val} accent={lbl==="Assurance voyage"} />
          ))}
        </Card>

        <Card>
          <Row label="💰 Tarif par personne" value={`${trip.price} FCFA`} accent />
          <Row label="📍 Point de départ" value="Carrefour Nlongkak" />
          <Row label="🏁 Point d'arrivée" value="Rond-Point Deido" />
        </Card>

        <Card style={{ background:C.greenPale }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:24 }}>🛡️</span>
            <div>
              <div style={{ color:C.green, fontWeight:700, fontSize:13 }}>Sécurité MENKE</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:2 }}>Partage GPS automatique avec votre famille pendant le trajet.</div>
            </div>
          </div>
        </Card>

        <Btn label={`Réserver · ${trip.price} FCFA →`} onClick={onNext} />
      </div>
    </div>
  );
}

function BookingScreen({ trip, onNext }) {
  if (!trip) trip = TRIPS[0];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bgLight }}>
      <TopBar title="Confirmation réservation" greenBg />
      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <div style={{ color:C.grayMid, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Récapitulatif</div>
          {[
            ["Trajet","Yaoundé → Douala"],
            ["Date","Lun. 2 juin 2026"],
            ["Heure",trip.time],
            ["Conducteur",trip.driver],
            ["Véhicule",trip.car],
            ["Passager","Jean-Paul Menkedi"],
            ["Places","1"],
          ].map(([k,v])=><Row key={k} label={k} value={v} />)}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 0", marginTop:4 }}>
            <span style={{ fontWeight:700, fontSize:16, color:C.textDark }}>Total à payer</span>
            <span style={{ fontWeight:900, fontSize:20, color:C.green }}>{trip.price} FCFA</span>
          </div>
        </Card>

        <Card>
          <div style={{ color:C.grayMid, fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Mode de paiement</div>
          <div style={{ display:"flex", gap:10 }}>
            {[{label:"MTN MoMo 📱", active:true},{label:"Orange Money 🔶", active:false}].map((m,i)=>(
              <div key={i} style={{
                flex:1, background: m.active ? C.greenPale : C.bgLight,
                border:`2px solid ${m.active ? C.green : C.grayLight}`,
                borderRadius:12, padding:"12px 8px", textAlign:"center",
                fontSize:12, color: m.active ? C.green : C.grayMid,
                fontWeight: m.active ? 700 : 400, cursor:"pointer",
              }}>{m.label}</div>
            ))}
          </div>
        </Card>

        <Card style={{ background:C.greenPale }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <span>📡</span>
            <span style={{ color:C.green, fontSize:12 }}>Partage GPS activé automatiquement au départ du trajet.</span>
          </div>
        </Card>

        <Btn label={`Payer ${trip.price} FCFA →`} onClick={onNext} />
      </div>
    </div>
  );
}

function PaymentScreen({ trip, onNext }) {
  if (!trip) trip = TRIPS[0];
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const pay = () => { setLoading(true); setTimeout(()=>{ setLoading(false); setDone(true); }, 2000); };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <TopBar title="Paiement" greenBg />
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:28, gap:24 }}>
        {done ? (
          <>
            <div style={{ width:100, height:100, borderRadius:50, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52 }}>✅</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:900, color:C.green, fontFamily:"Georgia,serif" }}>Paiement confirmé !</div>
              <div style={{ color:C.grayMid, fontSize:13, marginTop:6 }}>Votre réservation est enregistrée.</div>
            </div>
            <Card style={{ width:"100%", background:C.greenPale }}>
              <Row label="Réf. paiement" value="MTN-2026-84521" accent />
              <Row label="Montant" value={`${trip.price} FCFA`} accent />
              <Row label="Statut" value="✓ Confirmé" accent />
            </Card>
            <Btn label="Voir mon QR Code →" onClick={onNext} />
          </>
        ) : (
          <>
            <div style={{ width:90, height:90, borderRadius:45, background:"#FFF3E0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>📱</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:900, color:C.textDark }}>MTN Mobile Money</div>
              <div style={{ color:C.grayMid, fontSize:13, marginTop:4 }}>+237 6XX XXX XXX</div>
              <div style={{ color:C.green, fontSize:32, fontWeight:900, marginTop:12 }}>{trip.price} FCFA</div>
            </div>
            <div style={{ background:C.bgLight, borderRadius:12, padding:14, width:"100%" }}>
              <div style={{ color:C.grayMid, fontSize:12, textAlign:"center" }}>Vous allez recevoir une notification MTN MoMo pour confirmer le paiement.</div>
            </div>
            <Btn label={loading ? "Traitement en cours…" : "Confirmer le paiement"} onClick={pay} disabled={loading} />
          </>
        )}
      </div>
    </div>
  );
}

function QRScreen({ trip, onNext }) {
  if (!trip) trip = TRIPS[0];
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bgLight }}>
      <TopBar title="Mon billet" greenBg />
      <div style={{ flex:1, padding:"16px", display:"flex", flexDirection:"column", gap:14, alignItems:"center" }}>
        <Card style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div style={{ color:C.green, fontSize:13, fontWeight:700 }}>Présentez ce QR code au conducteur</div>
          {/* QR simulé */}
          <div style={{ width:170, height:170, background:C.white, borderRadius:16, padding:10, border:`3px solid ${C.green}`, display:"grid", gridTemplateColumns:"repeat(11,1fr)", gap:1.5 }}>
            {Array.from({length:121}).map((_,i)=>{
              const corners = [0,1,2,3,4,5,6,11,17,22,28,33,34,35,36,37,38,39,40,41,42,77,83,84,85,86,87,88,89,90,91,92,93,94,99,105,110,114,115,116,117,118,119,120];
              return <div key={i} style={{ borderRadius:1, background: corners.includes(i)||Math.random()>0.45 ? C.textDark : C.white, aspectRatio:1 }} />;
            })}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"monospace", fontSize:18, fontWeight:900, color:C.green, letterSpacing:3 }}>MNK-2026-7842</div>
            <div style={{ color:C.grayMid, fontSize:11, marginTop:4 }}>Valide jusqu'au 2 juin 2026 · 23h59</div>
          </div>
        </Card>

        <Card style={{ width:"100%" }}>
          <Row label="🚌 Trajet" value="Yaoundé → Douala" />
          <Row label="🕐 Départ" value={trip.time} />
          <Row label="👤 Conducteur" value={trip.driver} />
          <Row label="💰 Montant payé" value={`${trip.price} FCFA`} accent />
          <Row label="✅ Statut" value="Confirmé" accent />
        </Card>

        <div style={{ width:"100%" }}>
          <Btn label="Suivre mon trajet GPS 📍" onClick={onNext} />
        </div>
      </div>
    </div>
  );
}

function TrackingScreen({ goTo }) {
  const [sharing, setSharing] = useState(false);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      {/* Map simulée */}
      <div style={{ flex:1, background:`linear-gradient(180deg,#1b3a1b 0%,#0d2010 100%)`, position:"relative", minHeight:380, overflow:"hidden" }}>
        {/* Grille carte */}
        {Array.from({length:10}).map((_,i)=>(
          <div key={i} style={{ position:"absolute", left:0, right:0, top:`${i*11}%`, height:1, background:"#ffffff06" }} />
        ))}
        {Array.from({length:7}).map((_,i)=>(
          <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${i*17}%`, width:1, background:"#ffffff06" }} />
        ))}
        <svg style={{ position:"absolute", width:"100%", height:"100%" }}>
          <path d="M 70 340 C 120 260 180 200 230 150 C 270 110 310 80 340 50" stroke={C.green} strokeWidth="3" fill="none" strokeDasharray="8,4" opacity="0.8"/>
          <circle cx="70" cy="340" r="9" fill={C.greenLight} />
          <circle cx="340" cy="50" r="9" fill={C.green} />
          <circle cx="195" cy="215" r="16" fill={C.green} opacity="0.25"/>
          <circle cx="195" cy="215" r="8" fill={C.green}/>
          <circle cx="195" cy="215" r="3" fill={C.white}/>
        </svg>
        <div style={{ position:"absolute", bottom:80, left:50, background:"rgba(0,0,0,0.7)", borderRadius:8, padding:"4px 10px", color:C.greenLight, fontSize:11, fontWeight:700 }}>📍 Yaoundé</div>
        <div style={{ position:"absolute", top:30, right:30, background:"rgba(0,0,0,0.7)", borderRadius:8, padding:"4px 10px", color:C.green, fontSize:11, fontWeight:700 }}>🏁 Douala</div>
        {/* Status */}
        <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.8)", borderRadius:20, padding:"6px 16px", display:"flex", gap:8, alignItems:"center", whiteSpace:"nowrap", border:`1px solid ${C.green}44` }}>
          <div style={{ width:8, height:8, borderRadius:4, background:C.greenLight, boxShadow:`0 0 6px ${C.greenLight}` }}/>
          <span style={{ color:C.greenLight, fontSize:12, fontWeight:700 }}>En route · 1h48 restant</span>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ background:C.white, padding:"16px 20px", borderTop:`1px solid ${C.bgLight}`, display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", justifyContent:"space-around" }}>
          {[["87 km/h","Vitesse"],["142 km","Distance"],["10h34","Arrivée"]].map(([v,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ color:C.green, fontWeight:900, fontSize:17 }}>{v}</div>
              <div style={{ color:C.grayMid, fontSize:11 }}>{l}</div>
            </div>
          ))}
        </div>
        <Btn
          label={sharing ? "✅ Famille informée en temps réel" : "📡 Partager ma position avec ma famille"}
          onClick={()=>setSharing(!sharing)}
          color={sharing ? C.greenLight : C.green}
        />
        {sharing && (
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            {["👩 Maman","👨 Papa","👧 Sœur"].map(p=>(
              <div key={p} style={{ background:C.greenPale, borderRadius:20, padding:"4px 12px", fontSize:12, color:C.green }}>
                {p} · En ligne
              </div>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1 }}><Btn label="🗺 Carte" onClick={()=>{}} outline small /></div>
          <div style={{ flex:1 }}><Btn label="👨‍✈️ Chauffeur" onClick={()=>{}} outline small /></div>
          <div style={{ flex:1 }}>
            <button onClick={()=>goTo("sos")} style={{ width:"100%", padding:"10px 0", background:C.redLight, border:`2px solid ${C.red}`, borderRadius:14, color:C.red, fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>🆘 SOS</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FamilleScreen() {
  const [contacts] = useState([
    { name:"Maman Menkedi", phone:"+237 677 000 111", status:"En ligne", suivi:true },
    { name:"Papa Jean",     phone:"+237 699 222 333", status:"En ligne", suivi:true },
    { name:"Sœur Carole",   phone:"+237 655 444 555", status:"Hors ligne",suivi:false },
  ]);
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Partage famille" greenBg />
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        <Card style={{ background:C.greenPale }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <span style={{ fontSize:28 }}>📡</span>
            <div>
              <div style={{ color:C.green, fontWeight:700, fontSize:14 }}>Position partagée en direct</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:2 }}>Vos contacts voient votre trajet en temps réel.</div>
            </div>
          </div>
        </Card>
        {contacts.map((c,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:44, height:44, borderRadius:22, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>👤</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{c.name}</div>
                <div style={{ color:C.grayMid, fontSize:12 }}>{c.phone}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <Badge label={c.status} color={c.suivi ? C.green : C.grayMid} />
              </div>
            </div>
          </Card>
        ))}
        <Btn label="+ Ajouter un contact famille" color={C.green} outline />
      </div>
    </div>
  );
}

function NotationScreen({ trip, goTo }) {
  if (!trip) trip = TRIPS[0];
  const [stars, setStars] = useState(5);
  const [sent, setSent] = useState(false);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.bgLight }}>
      <TopBar title="Fin de trajet" greenBg />
      <div style={{ flex:1, padding:20, display:"flex", flexDirection:"column", gap:16, alignItems:"center" }}>
        <div style={{ width:72, height:72, borderRadius:36, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>🎉</div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:22, fontWeight:900, color:C.textDark, fontFamily:"Georgia,serif" }}>Trajet terminé !</div>
          <div style={{ color:C.grayMid, fontSize:13, marginTop:4 }}>Vous êtes arrivé à Douala.</div>
        </div>

        {!sent ? (
          <Card style={{ width:"100%" }}>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:C.textDark }}>Notez {trip.driver}</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:4 }}>Comment s'est passé votre trajet ?</div>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:20 }}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>setStars(s)} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:32 }}>
                  {s<=stars ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            <Btn label="Envoyer ma note" onClick={()=>setSent(true)} />
          </Card>
        ) : (
          <Card style={{ width:"100%", background:C.greenPale }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
              <div style={{ fontWeight:700, color:C.green }}>Merci pour votre retour !</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:4 }}>Note envoyée : {"⭐".repeat(stars)}</div>
            </div>
          </Card>
        )}

        <div style={{ width:"100%" }}>
          <Btn label="Retour à l'accueil" onClick={()=>goTo("home")} outline />
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ goTo }) {
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <div style={{ background:C.green, padding:"20px 20px 32px" }}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ width:64, height:64, borderRadius:32, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>👤</div>
          <div>
            <div style={{ color:C.white, fontWeight:900, fontSize:18, fontFamily:"Georgia,serif" }}>Jean-Paul Menkedi</div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>+237 670 123 456</div>
            <Badge label="✓ Compte vérifié" color={C.white} bg="rgba(255,255,255,0.2)" />
          </div>
        </div>
        <div style={{ display:"flex", gap:0, marginTop:20 }}>
          {[["12","Voyages"],["4.9","Note"],["2","Contacts"]].map(([v,l])=>(
            <div key={l} style={{ flex:1, textAlign:"center", borderRight:`1px solid rgba(255,255,255,0.2)` }}>
              <div style={{ color:C.white, fontWeight:900, fontSize:20 }}>{v}</div>
              <div style={{ color:"rgba(255,255,255,0.6)", fontSize:11 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"12px 16px 0", marginTop:-12 }}>
        <Card>
          {[
            { icon:"📜", label:"Historique des trajets", action:()=>goTo("historique") },
            { icon:"👨‍👩‍👧","label":"Contacts d'urgence", action:()=>goTo("famille") },
            { icon:"💳", label:"Portefeuille · 12 500 FCFA", action:()=>{} },
            { icon:"🔔", label:"Notifications", action:()=>{} },
            { icon:"🔒", label:"Sécurité & Confidentialité", action:()=>{} },
            { icon:"⚙️", label:"Paramètres", action:()=>{} },
          ].map((item,i)=>(
            <button key={i} onClick={item.action} style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 4px",
              borderBottom:`1px solid ${C.bgLight}`, width:"100%", background:"transparent", border:"none",
              cursor:"pointer", textAlign:"left",
            }}>
              <span style={{ fontSize:22 }}>{item.icon}</span>
              <span style={{ color:C.textDark, flex:1, fontSize:14 }}>{item.label}</span>
              <span style={{ color:C.grayLight, fontSize:18 }}>›</span>
            </button>
          ))}
        </Card>
        <div style={{ height:16 }} />
        <Btn label="Se déconnecter" color={C.red} small />
      </div>
    </div>
  );
}

function HistoriqueScreen() {
  const h = [
    { date:"28 Mai 2026", from:"Yaoundé", to:"Douala",    prix:"4 500", note:5, statut:"Terminé" },
    { date:"20 Mai 2026", from:"Douala",  to:"Yaoundé",   prix:"4 200", note:4, statut:"Terminé" },
    { date:"12 Mai 2026", from:"Yaoundé", to:"Bafoussam", prix:"3 800", note:5, statut:"Terminé" },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Mes trajets" greenBg />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {h.map((t,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{t.from} → {t.to}</div>
              <Badge label={t.statut} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.grayMid, fontSize:12 }}>📅 {t.date}</span>
              <span style={{ color:C.green, fontWeight:700, fontSize:13 }}>{t.prix} FCFA</span>
            </div>
            <div style={{ color:C.gold, fontSize:13, marginTop:4 }}>{"⭐".repeat(t.note)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SOSScreen({ goBack }) {
  const [sent, setSent] = useState(false);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background: sent ? C.greenPale : C.redLight }}>
      <div style={{ background: sent ? C.green : C.red, padding:"16px 20px" }}>
        <button onClick={goBack} style={{ background:"transparent", border:"none", color:C.white, fontSize:20, cursor:"pointer" }}>←</button>
        <span style={{ color:C.white, fontWeight:700, fontSize:16, marginLeft:12 }}>{sent ? "Alerte envoyée" : "ALERTE SOS"}</span>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:32 }}>
        {!sent ? (
          <>
            <div style={{ width:100, height:100, borderRadius:50, background:C.red, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, boxShadow:`0 0 40px ${C.red}88`, animation:"pulse 1.5s infinite" }}>🆘</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:C.red, fontFamily:"Georgia,serif" }}>En cas d'urgence</div>
              <div style={{ color:C.grayMid, fontSize:13, marginTop:8 }}>Appuyez pour alerter vos contacts d'urgence et partager votre position GPS.</div>
            </div>
            <Card style={{ width:"100%", background:C.white }}>
              {["👩 Maman · +237 677 000 111","👨 Papa · +237 699 222 333"].map((c,i)=>(
                <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.bgLight}`, color:C.textDark, fontSize:13 }}>🔔 {c}</div>
              ))}
            </Card>
            <button onClick={()=>setSent(true)} style={{ width:160, height:160, borderRadius:80, background:C.red, border:`4px solid #fff`, cursor:"pointer", fontSize:64, boxShadow:`0 0 40px ${C.red}66`, fontFamily:"inherit" }}>🆘</button>
            <div style={{ color:C.grayMid, fontSize:12 }}>Appui long pour confirmer l'alerte</div>
          </>
        ) : (
          <>
            <div style={{ width:90, height:90, borderRadius:45, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48 }}>✅</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:C.green }}>Alerte envoyée !</div>
              <div style={{ color:C.grayMid, fontSize:13, marginTop:6 }}>Vos contacts sont informés. Police & SAMU alertés.</div>
            </div>
            <Card style={{ width:"100%", background:C.greenPale }}>
              <Row label="📍 Position partagée" value="En cours" accent />
              <Row label="👩 Maman" value="Notifiée ✓" accent />
              <Row label="👨 Papa" value="Notifié ✓" accent />
            </Card>
            <Btn label="Annuler l'alerte" color={C.green} small />
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ÉCRANS CHAUFFEUR
// ════════════════════════════════════════════════════════════════════════════

function DriverHome({ goTo }) {
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <div style={{ background:C.textDark, padding:"16px 20px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Mode Chauffeur 🚗</div>
            <div style={{ color:C.white, fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>Kouam Éric</div>
          </div>
          <Badge label="✓ Validé" color={C.greenLight} bg={C.green} />
        </div>
        <div style={{ display:"flex", gap:0, marginTop:16 }}>
          {[["47","Trajets"],["4.8","Note"],["211 500","FCFA ce mois"]].map(([v,l])=>(
            <div key={l} style={{ flex:1, textAlign:"center", borderRight:`1px solid rgba(255,255,255,0.15)` }}>
              <div style={{ color:C.white, fontWeight:900, fontSize:18 }}>{v}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"12px 16px 0", marginTop:-12 }}>
        {[
          { icon:"🗺️",  label:"Publier un trajet",  action:()=>goTo("driver_publish") },
          { icon:"📋",  label:"Mes réservations",   action:()=>goTo("driver_reservations") },
          { icon:"📷",  label:"Scanner QR passager",action:()=>goTo("driver_scan") },
          { icon:"💰",  label:"Mes revenus",         action:()=>goTo("driver_revenus") },
          { icon:"📄",  label:"Mes documents",       action:()=>goTo("driver_docs") },
        ].map((item,i)=>(
          <button key={i} onClick={item.action} style={{
            display:"flex", alignItems:"center", gap:14, padding:"16px",
            width:"100%", background:C.white, border:"none", borderRadius:14, cursor:"pointer",
            marginBottom:10, boxShadow:`0 2px 8px ${C.shadow}`,
          }}>
            <span style={{ fontSize:26 }}>{item.icon}</span>
            <span style={{ color:C.textDark, fontSize:15, fontWeight:600 }}>{item.label}</span>
            <span style={{ color:C.grayLight, fontSize:18, marginLeft:"auto" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DriverDocs() {
  const docs = [
    { icon:"🪪", label:"Carte Nationale d'Identité", status:"Validé",    date:"Upload: 12 Mai" },
    { icon:"📋", label:"Permis de conduire",         status:"Validé",    date:"Upload: 12 Mai" },
    { icon:"🚗", label:"Assurance véhicule",         status:"En attente",date:"Upload: 28 Mai" },
    { icon:"📸", label:"Photo véhicule",             status:"Validé",    date:"Upload: 12 Mai" },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Mes documents" greenBg />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <Card style={{ background:C.greenPale }}>
          <div style={{ color:C.green, fontSize:13, fontWeight:600 }}>🛡️ Vos documents permettent à MENKE de garantir la sécurité des passagers.</div>
        </Card>
        {docs.map((d,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:26 }}>{d.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{d.label}</div>
                <div style={{ color:C.grayMid, fontSize:11, marginTop:2 }}>{d.date}</div>
              </div>
              <Badge label={d.status} color={d.status==="Validé" ? C.green : C.gold} />
            </div>
          </Card>
        ))}
        <Btn label="+ Ajouter un document" outline />
      </div>
    </div>
  );
}

function DriverPublish() {
  const [pub, setPub] = useState(false);
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Publier un trajet" greenBg />
      <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { icon:"📍", label:"Départ", val:"Yaoundé Centre" },
          { icon:"🏁", label:"Arrivée", val:"Douala Akwa" },
          { icon:"📅", label:"Date", val:"Demain, 2 juin 2026" },
          { icon:"🕐", label:"Heure", val:"07h30" },
          { icon:"💺", label:"Places disponibles", val:"3 places" },
          { icon:"💰", label:"Prix par passager", val:"4 500 FCFA" },
        ].map((f,i)=><Field key={i} icon={f.icon} label={f.label} value={f.val} />)}

        {!pub ? (
          <Btn label="Publier ce trajet →" onClick={()=>setPub(true)} />
        ) : (
          <Card style={{ background:C.greenPale }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
              <div style={{ fontWeight:700, color:C.green }}>Trajet publié avec succès !</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:4 }}>Les passagers peuvent maintenant réserver.</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function DriverReservations() {
  const resa = [
    { name:"Jean-Paul M.", seats:1, phone:"+237 670 123 456", time:"07h30", statut:"Confirmé" },
    { name:"Aminata D.",   seats:2, phone:"+237 699 888 777", time:"07h30", statut:"En attente" },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Mes réservations" greenBg />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ color:C.grayMid, fontSize:12 }}>Trajet Yaoundé → Douala · Demain 07h30</div>
        {resa.map((r,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:20, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:C.textDark }}>{r.name}</div>
                <div style={{ color:C.grayMid, fontSize:12 }}>{r.phone} · {r.seats} place{r.seats>1?"s":""}</div>
              </div>
              <Badge label={r.statut} color={r.statut==="Confirmé" ? C.green : C.gold} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}><Btn label="📞 Appeler" small outline /></div>
              <div style={{ flex:1 }}><Btn label="✓ Confirmer" small /></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DriverScan() {
  const [scanned, setScanned] = useState(false);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
      <TopBar title="Scanner QR passager" greenBg />
      <div style={{ flex:1, background:C.textDark, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:32 }}>
        <div style={{ width:220, height:220, borderRadius:24, border:`3px solid ${C.green}`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:200, height:200, background:C.bgLight, borderRadius:16, display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:2, padding:8 }}>
            {Array.from({length:100}).map((_,i)=>(
              <div key={i} style={{ borderRadius:1, background: Math.random()>0.45 ? C.textDark : C.white }}/>
            ))}
          </div>
          {/* Scanner line */}
          <div style={{ position:"absolute", left:10, right:10, height:2, background:C.green, top:"35%", boxShadow:`0 0 8px ${C.green}` }}/>
          {/* Corner brackets */}
          {[[0,0],[0,"auto"],["auto",0],["auto","auto"]].map(([t,b,l,r],i)=>(
            <div key={i} style={{ position:"absolute", top:i<2?-2:"auto", bottom:i>=2?-2:"auto", left:i%2===0?-2:"auto", right:i%2===1?-2:"auto", width:24, height:24, borderTop:i<2?`3px solid ${C.green}`:"none", borderBottom:i>=2?`3px solid ${C.green}`:"none", borderLeft:i%2===0?`3px solid ${C.green}`:"none", borderRight:i%2===1?`3px solid ${C.green}`:"none" }}/>
          ))}
        </div>
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, textAlign:"center" }}>Pointez la caméra vers le QR code du passager</div>
        {!scanned ? (
          <Btn label="Simuler scan ✓" onClick={()=>setScanned(true)} color={C.green} />
        ) : (
          <Card style={{ background:C.greenPale, width:"100%" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:28 }}>✅</div>
              <div style={{ fontWeight:700, color:C.green, marginTop:8 }}>Passager validé !</div>
              <div style={{ color:C.grayMid, fontSize:12, marginTop:4 }}>Jean-Paul Menkedi · MNK-2026-7842</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function DriverRevenus() {
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Mes revenus" greenBg />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        <Card style={{ background:`linear-gradient(135deg,${C.green},${C.greenLight})` }}>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Ce mois</div>
          <div style={{ color:C.white, fontSize:34, fontWeight:900, fontFamily:"Georgia,serif" }}>211 500 FCFA</div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:12, marginTop:4 }}>47 trajets · Moy. 4 500 FCFA/trajet</div>
        </Card>
        {DRIVER_TRIPS.map((t,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ fontWeight:700, color:C.textDark }}>{t.from} → {t.to}</div>
              <div style={{ color:C.green, fontWeight:700 }}>{t.revenu} FCFA</div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.grayMid, fontSize:12 }}>{t.date} · {t.passagers} passagers</span>
              <Badge label={t.statut} color={t.statut==="En cours" ? C.gold : C.green} />
            </div>
          </Card>
        ))}
        <Btn label="Retirer mes revenus (MTN MoMo)" outline />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ÉCRANS ADMIN
// ════════════════════════════════════════════════════════════════════════════

function AdminDashboard({ goTo }) {
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <div style={{ background:C.textDark, padding:"16px 20px 24px" }}>
        <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Dashboard Administrateur</div>
        <div style={{ color:C.white, fontSize:20, fontWeight:900, fontFamily:"Georgia,serif" }}>MENKE Admin</div>
      </div>
      <div style={{ padding:"12px 16px 0", marginTop:-12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {[
            { v:ADMIN_STATS.users,    l:"Utilisateurs", ic:"👥", c:C.green },
            { v:ADMIN_STATS.drivers,  l:"Chauffeurs",   ic:"🚗", c:C.greenLight },
            { v:ADMIN_STATS.trips,    l:"Trajets",      ic:"🗺️", c:"#3B82F6" },
            { v:`${ADMIN_STATS.revenue} F`, l:"Revenus FCFA", ic:"💰", c:C.gold },
          ].map((s,i)=>(
            <Card key={i}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.ic}</div>
              <div style={{ color:s.c, fontWeight:900, fontSize:18 }}>{s.v}</div>
              <div style={{ color:C.grayMid, fontSize:11 }}>{s.l}</div>
            </Card>
          ))}
        </div>
        {[
          { ic:"🚗", label:"Gérer les chauffeurs", action:()=>goTo("admin_drivers") },
          { ic:"🗺️", label:"Voir les trajets",     action:()=>goTo("admin_trips") },
          { ic:"🆘", label:"Incidents & SOS",       action:()=>goTo("admin_incidents") },
        ].map((item,i)=>(
          <button key={i} onClick={item.action} style={{ display:"flex", alignItems:"center", gap:14, padding:16, width:"100%", background:C.white, border:"none", borderRadius:14, cursor:"pointer", marginBottom:10, boxShadow:`0 2px 8px ${C.shadow}` }}>
            <span style={{ fontSize:24 }}>{item.ic}</span>
            <span style={{ color:C.textDark, fontSize:15, fontWeight:600 }}>{item.label}</span>
            <span style={{ color:C.grayLight, marginLeft:"auto", fontSize:18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminDrivers() {
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Gestion chauffeurs" />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", gap:10 }}>
          {[["84","Total"],["71","Validés"],["13","En attente"]].map(([v,l])=>(
            <Card key={l} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontWeight:900, fontSize:18, color:C.green }}>{v}</div>
              <div style={{ color:C.grayMid, fontSize:11 }}>{l}</div>
            </Card>
          ))}
        </div>
        {ADMIN_DRIVERS.map((d,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
              <div style={{ width:40, height:40, borderRadius:20, background:C.greenPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>👤</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:C.textDark }}>{d.name}</div>
                <div style={{ color:C.grayMid, fontSize:12 }}>{d.phone} · {d.trips} trajets</div>
              </div>
              <Badge label={d.statut} color={d.statut==="Validé" ? C.green : C.gold} />
            </div>
            {d.statut==="En attente" && (
              <div style={{ display:"flex", gap:8 }}>
                <div style={{ flex:1 }}><Btn label="✓ Valider" small /></div>
                <div style={{ flex:1 }}><Btn label="✗ Refuser" small color={C.red} /></div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminTrips() {
  const trips = [
    { from:"Yaoundé",to:"Douala",    driver:"Kouam Éric",   passagers:3, statut:"En cours",  heure:"07h30" },
    { from:"Douala", to:"Yaoundé",   driver:"Mireille B.",  passagers:2, statut:"Terminé",   heure:"06h00" },
    { from:"Yaoundé",to:"Bafoussam", driver:"Patrick N.",   passagers:1, statut:"Programmé", heure:"09h15" },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Trajets en cours" />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {trips.map((t,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontWeight:700, color:C.textDark }}>{t.from} → {t.to}</div>
              <Badge label={t.statut} color={t.statut==="En cours" ? C.gold : t.statut==="Terminé" ? C.green : C.grayMid} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:C.grayMid, fontSize:12 }}>👤 {t.driver} · {t.passagers} passagers</span>
              <span style={{ color:C.grayMid, fontSize:12 }}>{t.heure}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminIncidents() {
  const inc = [
    { id:"INC-001", type:"SOS Passager",   user:"Jean-Paul M.", heure:"08h22", statut:"Résolu" },
    { id:"INC-002", type:"Retard signalé", user:"Aminata D.",   heure:"07h45", statut:"En cours" },
  ];
  return (
    <div style={{ flex:1, background:C.bgLight }}>
      <TopBar title="Incidents & SOS" />
      <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        <Card style={{ background:C.redLight }}>
          <div style={{ color:C.red, fontWeight:700, fontSize:13 }}>🆘 {inc.filter(i=>i.type.includes("SOS")).length} alerte SOS aujourd'hui</div>
        </Card>
        {inc.map((inc,i)=>(
          <Card key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <div style={{ fontWeight:700, color:C.textDark }}>{inc.type}</div>
              <Badge label={inc.statut} color={inc.statut==="Résolu" ? C.green : C.red} />
            </div>
            <div style={{ color:C.grayMid, fontSize:12 }}>{inc.user} · {inc.heure} · Réf: {inc.id}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP PRINCIPALE
// ════════════════════════════════════════════════════════════════════════════

export default function MENKEApp() {
  const [mode, setMode] = useState("user");
  const [screen, setScreen] = useState("splash");
  const [trip, setTrip] = useState(null);

  const screens_map = {
    user: USER_SCREENS, driver: DRIVER_SCREENS, admin: ADMIN_SCREENS,
  };

  const goTo = (s) => setScreen(s);
  const next = () => {
    const list = screens_map[mode];
    const idx = list.indexOf(screen);
    if (idx < list.length-1) setScreen(list[idx+1]);
  };
  const back = () => {
    const list = screens_map[mode];
    const idx = list.indexOf(screen);
    if (idx > 0) setScreen(list[idx-1]);
  };

  const changeMode = (m) => { setMode(m); setScreen("splash"); setTrip(null); };

  const renderScreen = () => {
    const topBar = screen !== "splash" && (
      <TopBar
        title={LABELS[screen] || screen}
        onBack={["login","otp","home","driver_home","admin_dashboard"].includes(screen) ? null : back}
        onProfile={["home"].includes(screen) ? ()=>goTo("profile") : null}
        greenBg={["login","otp","home","search","results","detail","booking","payment","qr","tracking","famille","notation","driver_home","driver_publish","driver_docs","driver_reservations","driver_scan","driver_revenus","admin_dashboard"].includes(screen)}
      />
    );

    switch(screen) {
      case "splash": return <SplashScreen onNext={next} />;
      case "login":  return <LoginScreen onNext={next} />;
      case "otp":    return <OTPScreen onNext={next} />;

      // User
      case "home":    return <HomeScreen goTo={goTo} />;
      case "search":  return <SearchScreen onNext={next} />;
      case "results": return <ResultsScreen onNext={next} setTrip={setTrip} />;
      case "detail":  return <DetailScreen trip={trip} onNext={next} />;
      case "booking": return <BookingScreen trip={trip} onNext={next} />;
      case "payment": return <PaymentScreen trip={trip} onNext={next} />;
      case "qr":      return <QRScreen trip={trip} onNext={next} />;
      case "tracking":return <TrackingScreen goTo={goTo} />;
      case "famille": return <FamilleScreen />;
      case "notation":return <NotationScreen trip={trip} goTo={goTo} />;
      case "profile": return <ProfileScreen goTo={goTo} />;
      case "historique": return <HistoriqueScreen />;
      case "sos":     return <SOSScreen goBack={back} />;

      // Driver
      case "driver_home":         return <DriverHome goTo={goTo} />;
      case "driver_docs":         return <DriverDocs />;
      case "driver_publish":      return <DriverPublish />;
      case "driver_reservations": return <DriverReservations />;
      case "driver_scan":         return <DriverScan />;
      case "driver_revenus":      return <DriverRevenus />;

      // Admin
      case "admin_dashboard": return <AdminDashboard goTo={goTo} />;
      case "admin_drivers":   return <AdminDrivers />;
      case "admin_trips":     return <AdminTrips />;
      case "admin_incidents": return <AdminIncidents />;

      default: return <div style={{padding:32,color:C.grayMid}}>Écran inconnu</div>;
    }
  };

  const navScreens = screens_map[mode];

  return (
    <div style={{ minHeight:"100vh", background:"#F0F2F0", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px 40px", gap:24, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:900, color:C.green, letterSpacing:-1 }}>MENKE</div>
        <div style={{ color:C.grayMid, fontSize:11, letterSpacing:4, textTransform:"uppercase" }}>Prototype Officiel MVP v1</div>
      </div>

      {/* Mode selector */}
      <div style={{ display:"flex", gap:8, background:C.white, borderRadius:20, padding:4, boxShadow:`0 2px 12px ${C.shadow}` }}>
        {[["user","👤 Utilisateur"],["driver","🚗 Chauffeur"],["admin","⚙️ Admin"]].map(([m,l])=>(
          <button key={m} onClick={()=>changeMode(m)} style={{
            background: mode===m ? C.green : "transparent",
            color: mode===m ? C.white : C.grayMid,
            border:"none", borderRadius:16, padding:"8px 16px",
            fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {/* Phone */}
      <PhoneFrame mode={mode}>
        {renderScreen()}
      </PhoneFrame>

      {/* Navigation rapide */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", maxWidth:420 }}>
        {navScreens.map(s => (
          <button key={s} onClick={()=>goTo(s)} style={{
            background: s===screen ? C.green : C.white,
            border:`1px solid ${s===screen ? C.green : C.grayLight}`,
            borderRadius:20, padding:"5px 12px",
            color: s===screen ? C.white : C.grayMid,
            fontSize:11, cursor:"pointer", fontWeight: s===screen ? 700 : 400,
            boxShadow: s===screen ? `0 2px 8px ${C.shadow}` : "none",
            fontFamily:"inherit",
          }}>{LABELS[s]||s}</button>
        ))}
      </div>

      <div style={{ color:C.grayLight, fontSize:11, textAlign:"center" }}>
        MENKE · Plateforme africaine de mobilité intelligente et sécurisée · Yaoundé, Cameroun
      </div>
    </div>
  );
}
