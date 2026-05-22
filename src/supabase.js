// ============================================================
//  supabase.js  —  ChantierPro · Client & helpers Supabase
//  Placer ce fichier dans : src/supabase.js
// ============================================================
//
//  INSTALLATION :
//    npm install @supabase/supabase-js
//
//  CONFIGURATION :
//    Dans votre fichier .env (racine du projet) :
//      REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
//      REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
//
//  Les clés se trouvent dans Supabase → Settings → API
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "⚠️  Variables Supabase manquantes.\n" +
    "Créez un fichier .env avec REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
//  Schéma utilisé (chaque table stocke data en JSONB) :
//
//   cp_chantiers  → id bigint, data jsonb, updated_at timestamp
//   cp_teams      → id bigint, data jsonb, updated_at timestamp
//   cp_flotte     → id bigint, data jsonb, updated_at timestamp
//   cp_settings   → key text,  value jsonb, updated_at timestamp
// ============================================================


// ─── Utilitaire interne ─────────────────────────────────────
function logError(fn, error) {
  console.error(`[supabase] ${fn}:`, error?.message || error);
}


// ============================================================
//  CHANTIERS
// ============================================================

/**
 * Charge tous les chantiers depuis Supabase.
 * Retourne un tableau (vide si erreur ou aucune donnée).
 */
export async function fetchChantiers() {
  try {
    const { data, error } = await supabase
      .from("cp_chantiers")
      .select("id, data")
      .order("id", { ascending: true });

    if (error) { logError("fetchChantiers", error); return []; }
    return (data || []).map(row => ({ ...row.data, id: row.id }));
  } catch (e) { logError("fetchChantiers", e); return []; }
}

/**
 * Sauvegarde un chantier (upsert).
 * Si le chantier n'a pas d'id, on en génère un (Date.now()).
 * Retourne le chantier sauvegardé (avec son id) ou null.
 */
export async function saveChantierDB(chantier) {
  try {
    const id   = chantier.id || Date.now();
    const { error } = await supabase
      .from("cp_chantiers")
      .upsert({ id, data: { ...chantier, id }, updated_at: new Date().toISOString() });

    if (error) { logError("saveChantierDB", error); return null; }
    return { ...chantier, id };
  } catch (e) { logError("saveChantierDB", e); return null; }
}

/**
 * Supprime un chantier par son id.
 * Retourne true si succès, false sinon.
 */
export async function deleteChantierDB(id) {
  try {
    const { error } = await supabase
      .from("cp_chantiers")
      .delete()
      .eq("id", id);

    if (error) { logError("deleteChantierDB", error); return false; }
    return true;
  } catch (e) { logError("deleteChantierDB", e); return false; }
}

/**
 * Remplace TOUS les chantiers (utilisé pour la réinitialisation).
 */
export async function resetChantiersDB(chantiers) {
  try {
    await supabase.from("cp_chantiers").delete().neq("id", 0);
    const rows = chantiers.map(c => ({
      id: c.id,
      data: c,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("cp_chantiers").insert(rows);
    if (error) { logError("resetChantiersDB", error); }
  } catch (e) { logError("resetChantiersDB", e); }
}


// ============================================================
//  ÉQUIPES (teams + membres imbriqués dans data)
// ============================================================

/**
 * Charge toutes les équipes (avec leurs membres dans data).
 */
export async function fetchTeams() {
  try {
    const { data, error } = await supabase
      .from("cp_teams")
      .select("id, data")
      .order("id", { ascending: true });

    if (error) { logError("fetchTeams", error); return []; }
    return (data || []).map(row => ({ ...row.data }));
  } catch (e) { logError("fetchTeams", e); return []; }
}

/**
 * Sauvegarde l'état complet de toutes les équipes.
 * On upsert chaque équipe avec un id numérique stable.
 */
export async function saveTeamsDB(teams) {
  try {
    // On attribue un id numérique basé sur l'index si l'équipe n'en a pas
    const TEAM_IDS = {
      couverture: 1,
      maconnerie: 2,
      demolition: 3,
      mecanique:  4,
      platrerie:  5,
    };

    const rows = teams.map(t => ({
      id: TEAM_IDS[t.id] || Math.abs(t.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)),
      data: t,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("cp_teams").upsert(rows);
    if (error) { logError("saveTeamsDB", error); }
  } catch (e) { logError("saveTeamsDB", e); }
}

/**
 * Remplace TOUTES les équipes (réinitialisation).
 */
export async function resetTeamsDB(teams) {
  try {
    await supabase.from("cp_teams").delete().neq("id", 0);
    await saveTeamsDB(teams);
  } catch (e) { logError("resetTeamsDB", e); }
}


// ============================================================
//  FLOTTE
// ============================================================

/**
 * Charge tous les engins/véhicules.
 */
export async function fetchFlotte() {
  try {
    const { data, error } = await supabase
      .from("cp_flotte")
      .select("id, data")
      .order("id", { ascending: true });

    if (error) { logError("fetchFlotte", error); return []; }
    return (data || []).map(row => ({ ...row.data, id: row.id }));
  } catch (e) { logError("fetchFlotte", e); return []; }
}

/**
 * Sauvegarde un engin (upsert).
 */
export async function saveFlotteItemDB(item) {
  try {
    const id = item.id || Date.now();
    const { error } = await supabase
      .from("cp_flotte")
      .upsert({ id, data: { ...item, id }, updated_at: new Date().toISOString() });

    if (error) { logError("saveFlotteItemDB", error); return null; }
    return { ...item, id };
  } catch (e) { logError("saveFlotteItemDB", e); return null; }
}

/**
 * Supprime un engin par son id.
 */
export async function deleteFlotteItemDB(id) {
  try {
    const { error } = await supabase
      .from("cp_flotte")
      .delete()
      .eq("id", id);

    if (error) { logError("deleteFlotteItemDB", error); return false; }
    return true;
  } catch (e) { logError("deleteFlotteItemDB", e); return false; }
}

/**
 * Remplace TOUTE la flotte (réinitialisation).
 */
export async function resetFlotteDB(flotte) {
  try {
    await supabase.from("cp_flotte").delete().neq("id", 0);
    const rows = flotte.map(v => ({
      id: v.id,
      data: v,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("cp_flotte").insert(rows);
    if (error) { logError("resetFlotteDB", error); }
  } catch (e) { logError("resetFlotteDB", e); }
}


// ============================================================
//  SETTINGS (darkMode, etc.)
// ============================================================

/**
 * Charge une valeur depuis cp_settings.
 * Retourne fallback si la clé n'existe pas.
 */
export async function loadSetting(key, fallback = null) {
  try {
    const { data, error } = await supabase
      .from("cp_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) { logError("loadSetting", error); return fallback; }
    return data ? data.value : fallback;
  } catch (e) { logError("loadSetting", e); return fallback; }
}

/**
 * Sauvegarde une valeur dans cp_settings.
 */
export async function saveSetting(key, value) {
  try {
    const { error } = await supabase
      .from("cp_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) { logError("saveSetting", error); }
  } catch (e) { logError("saveSetting", e); }
}
