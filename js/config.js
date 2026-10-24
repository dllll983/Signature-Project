/* ==========================================================
   SIGNATURE — configuration
   Tant que SUPABASE_URL / SUPABASE_ANON_KEY sont vides, le site
   tourne en MODE DÉMO (données stockées uniquement sur l'appareil).
   Voir README.md, étape 2, pour brancher la vraie base gratuite.
   ========================================================== */
window.SIGNATURE_CONFIG = {
  SUPABASE_URL: "hhttps://legoujiolgjqnbszxape.supabase.co",        // ex. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZ291amlvbGdqcW5ic3p4YXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzE4MjQsImV4cCI6MjEwODI0NzgyNH0.npk761PXbHXb-koRL0DcS4XWdFSevQJKh6IjHEhZBJU",   // clé « anon / public » (pas la clé service_role !)

  // E-mail administrateur (le compte qui gère le catalogue et les commandes).
  // En mode démo, ce compte a accès à /#/admin. En mode réel, la liste des
  // admins est dans la table « admins » (voir supabase/schema.sql).
  ADMIN_EMAIL: "denni.lyes@gmail.com",

  // Optionnel : recevoir un e-mail à chaque commande (service gratuit formsubmit.co,
  // nécessite un clic d'activation unique). Laisser vide pour désactiver.
  NOTIFY_EMAIL: "",

  // Optionnel : lien de téléchargement direct du fichier APK Android (ex. dépôt GitHub / Drive).
  // Si vide, le bouton « Installer sur Android » installe l'application directement depuis le navigateur (PWA).
  APK_URL: "",

  DEFAULT_LANG: "fr"
};
