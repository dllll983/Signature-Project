# Mise à jour vers la version 2 — pas à pas (sans connaissances techniques)

Durée : environ 25 minutes. Faites les étapes **dans l'ordre**.

## Étape 1 — Mettre à jour la base de données (Supabase)
1. Allez sur **supabase.com**, ouvrez votre projet `signature`.
2. Menu de gauche **SQL Editor** → **New query**.
3. Ouvrez le fichier `supabase/schema.sql` (Bloc-notes), **copiez tout**, collez dans Supabase, cliquez **Run**. Message « Success » = parfait. (Sans danger : vos comptes et commandes sont conservés.)
4. Nouvelle requête (**New query**) : copiez tout le fichier `supabase/catalogue_seed.sql`, collez, **Run**.
   ⚠️ Cela **remplace** les anciens produits d'exemple par les 20 articles du catalogue, les 3 tailles, les matières/couleurs et les 6 collections. Les commandes déjà reçues ne sont pas touchées.

## Étape 2 — Activer le code de confirmation par e-mail (OTP)
1. Supabase → **Authentication → Emails** (ou *Email Templates*) → modèle **Confirm signup**.
2. Remplacez le contenu par :
   - Sujet : `Votre code Signature`
   - Message : `<h2>Bienvenue chez Signature</h2><p>Votre code de confirmation :</p><h1>{{ .Token }}</h1><p>Il est valable 1 heure.</p>`
3. **Enregistrez**. (Laissez **« Confirm email » activé** dans *Authentication → Providers → Email* : c'est ce qui protège l'accès administrateur.)
4. **Important — envoi des e-mails** : Supabase gratuit n'envoie que quelques e-mails par heure. Pour un vrai lancement, configurez votre Gmail :
   - Compte Google → **Sécurité** → activer la **validation en 2 étapes** → **Mots de passe des applications** → créer un mot de passe pour « Signature » (16 lettres).
   - Supabase → **Authentication → Emails → SMTP Settings** → activer *Custom SMTP* : Host `smtp.gmail.com`, Port `465`, Username = votre Gmail, Password = le mot de passe d'application, Sender = votre Gmail, Sender name `Signature`. **Save**.

## Étape 3 — Mettre en ligne les nouveaux fichiers (Netlify)
1. **Gardez votre ancien `js/config.js`** (il contient VOS clés Supabase). Dans le nouveau dossier `signature`, remplacez `js/config.js` par votre ancienne copie (ou recollez-y votre `SUPABASE_URL` et `SUPABASE_ANON_KEY`).
2. Netlify → votre site → onglet **Deploys** → glissez-déposez **le dossier `signature`** dans la zone « Drag and drop » en bas de page.
3. Attendez « Published ».

## Étape 4 — Téléphones qui restaient figés (chargement infini)
Le correctif est inclus : la page se répare seule. Si un téléphone reste bloqué, ouvrir le site, attendre 20 secondes : un bouton **« Réparer »** apparaît. Sinon : paramètres du navigateur → effacer les données du site.

## Étape 5 — Vérifier
Ouvrez le site → **Composer ma box** → créez un compte avec un vrai e-mail : vous devez recevoir un code à 6 chiffres. Passez une commande test, puis ouvrez `/#/admin`.

## Liens d'installation
- **Android** : le bouton installe l'application depuis le navigateur. Si vous avez un fichier APK, mettez son lien dans `js/config.js` → `APK_URL`.
- **iPhone** : affiche « Application IOS en construction, Veuillez utiliser le site internet ».
