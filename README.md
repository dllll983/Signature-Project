# Signature — site web + application Android (gratuit) — v2

> **Vous avez déjà la v1 en ligne ?** Suivez `GUIDE_MISE_A_JOUR.md`.
> Nouveautés v2 : vrai logo, valeurs Authenticité/Générosité/Bienveillance, box à cases (Essentielle 4 / Élégance 6 / Prestige 8), matière+couleur liées, 20 articles du catalogue, code OTP par e-mail, devis VIP/Bespoke via WhatsApp, boutons Android/iOS, correctif du chargement infini.

Un seul projet = **le site**, **l'application Android** (PWA installable) et **l'espace de gestion** (`/#/admin`).
Ce que l'ami modifie dans l'espace de gestion apparaît tout de suite sur le site et dans l'appli.

Coût : **0 DA**. Services utilisés : Supabase (base de données + comptes), Netlify (hébergement). Aucun des deux ne demande de carte bancaire.

> **Mode démo** : tant que l'étape 2 n'est pas faite, le site fonctionne mais les données restent sur l'appareil de chacun
> (bandeau « Mode démo » en haut). Pratique pour essayer, **pas** pour recevoir de vraies commandes.

---

## Étape 1 — Essayer tout de suite (2 minutes)
Ouvrir `index.html` via un hébergement (étape 3) ou, sur ordinateur, double-cliquer `index.html` (le site s'ouvre, mais l'installation en appli exige l'hébergement).
Pour essayer l'espace de gestion en démo : créer un compte avec l'adresse `cozycorner.ink@gmail.com`, puis ouvrir `/#/admin`.

## Étape 2 — Créer la base de données gratuite (10 minutes)
1. Aller sur **supabase.com** → *Start your project* → se connecter avec `cozycorner.ink@gmail.com`.
2. *New project* : nom `signature`, choisir un mot de passe de base (le noter), région **Europe (Frankfurt ou Paris)**.
3. Menu **SQL Editor** → *New query* → coller **tout** le contenu de `supabase/schema.sql` → **Run**. (Il crée les tables et la sécurité.) Puis une 2ᵉ requête avec `supabase/catalogue_seed.sql` (catalogue, options, collections). Enfin, suivre l'étape 2 de `GUIDE_MISE_A_JOUR.md` (code OTP par e-mail).
4. Menu **Authentication → Providers → Email** : laisser **« Confirm email » activé** (obligatoire : c'est ce qui empêche un inconnu de prendre l'adresse admin).
5. Menu **Authentication → URL Configuration** : dans *Site URL*, mettre l'adresse du site (étape 3).
6. Menu **Project Settings → API** : copier **Project URL** et la clé **anon public**.
   ⚠️ Ne jamais copier la clé `service_role`.
7. Ouvrir `js/config.js` et coller les deux valeurs dans `SUPABASE_URL` et `SUPABASE_ANON_KEY`.

## Étape 3 — Mettre le site en ligne (5 minutes)
1. Aller sur **app.netlify.com/drop** (se connecter avec le même compte Gmail).
2. **Glisser-déposer le dossier `signature`** (celui qui contient `index.html`).
3. Netlify donne une adresse du type `https://xxxx.netlify.app` → *Site settings → Change site name* pour choisir `signature-gifts` par exemple.
4. Retourner à Supabase (étape 2.5) et y coller cette adresse.

## Étape 4 — Devenir administrateur
1. Sur le site, **créer un compte** avec `cozycorner.ink@gmail.com`, cliquer sur le lien de confirmation reçu par e-mail, se connecter.
2. *Mon compte → Gestion* (ou `…/#/admin`).
3. Pour donner l'accès à l'ami avec son propre e-mail : dans Supabase → SQL Editor :
   `insert into public.admins (email) values ('son.adresse@gmail.com');`

## Étape 5 — Installer l'application Android
Sur le téléphone, ouvrir le site dans **Chrome** → menu ⋮ → **Installer l'application** (ou le bouton « Installer l'application » en bas du site).
L'icône Signature apparaît sur l'écran d'accueil, plein écran, comme une vraie appli.
(Pas de Google Play : il demande 25 $ à l'inscription.)

---

## Utilisation par l'ami (espace de gestion)
- **Commandes** : les nouvelles sont en rouge. Boutons *Appeler* / *WhatsApp*, changement de statut (Nouvelle → Confirmée → En livraison → Livrée), *Imprimer* le bon de préparation (avec le petit mot), export CSV.
- **Produits** : changer un **prix** directement dans la liste, interrupteur **En stock**, *Modifier* pour la photo, les noms FR/AR, la catégorie. *Importer une liste* : coller des lignes Excel (`catégorie ; nom FR ; nom AR ; prix ; stock`).
- **Options de box** : tailles (capacité en **cases**), matières, couleurs (liées à une matière) et prix.
- **Produits** : champ « cases occupées » (parfum = 2, kamiss = 3, autres = 1) et présentation FR/AR.
- **Collections** : les 6 cartes de l'accueil. Type « box » → ouvre la composition de la taille choisie ; type « devis » → page « Demandez un devis » puis WhatsApp.
- **Réglages** : frais de livraison (laisser **0** = « confirmés par téléphone »), téléphone, WhatsApp, Instagram, bandeau d'annonce.

## Limites à connaître
- **Photos** : le plan gratuit Supabase donne 1 Go de stockage. Les photos sont réduites automatiquement avant l'envoi.
- **Pause** : un projet Supabase gratuit sans aucune activité pendant 7 jours est mis en pause (réactivation en un clic depuis le tableau de bord). Dès qu'il y a des visites, ce n'est pas un souci.
- **Notification de commande** : le site rafraîchit les commandes toutes les 45 s quand la page de gestion est ouverte. Pour recevoir aussi un e-mail, renseigner `NOTIFY_EMAIL` dans `config.js` (service gratuit formsubmit.co : un clic d'activation au premier envoi).
- **Nom de domaine** `.com` / `.dz` : payant. L'adresse `xxx.netlify.app` reste gratuite.
- **Prix et photos fournis** : les prix des produits sont **indicatifs** (à remplacer). Les photos des coffrets viennent des visuels transmis.
- **Vérifications faites** : parcours complet testé en français et en arabe (mobile et ordinateur) en mode démo. La connexion à Supabase n'a pas pu être testée ici (pas de compte) : à vérifier à l'étape 4 en passant une commande test.

## Contenu du dossier
`index.html` · `css/style.css` · `js/` (config, traductions, données, application, gestion) · `img/` · `icons/` · `manifest.webmanifest` · `sw.js` (mode hors-ligne) · `supabase/schema.sql` · `supabase/catalogue_seed.sql` · `GUIDE_MISE_A_JOUR.md`
