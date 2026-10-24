/* Traductions FR / AR + données géographiques */
(function () {
  const dict = {
    fr: {
      brand: "Signature", brand_sub: "Gift Collections",
      tagline: "Plus qu'un cadeau, une émotion à offrir.",
      motto: "Where every gift becomes a memory",
      nav_home: "Accueil", nav_collections: "Collections", nav_compose: "Composer ma box", nav_orders: "Mes commandes",
      nav_account: "Mon compte", nav_login: "Connexion", nav_logout: "Se déconnecter", nav_admin: "Gestion",
      lang_switch: "عربي",
      cta_compose: "Composer ma box", cta_discover: "Découvrir les collections",
      hero_kicker: "Coffrets cadeaux sur mesure",
      hero_text: "Choisissez le coffret, composez son contenu, inscrivez une pensée. Nous préparons le reste avec élégance.",
      col_title: "Nos collections", col_sub: "Partez d'une composition signature, puis personnalisez-la à votre goût.",
      col_use: "Composer cette box", col_quote: "Demandez un devis", col_items: "{n} articles",
      how_title: "Comment ça marche",
      how_1_t: "Choisissez votre box", how_1_d: "Taille, matière et couleur.",
      how_2_t: "Composez le contenu", how_2_d: "Parfum, montre, foulard, accessoires…",
      how_3_t: "Inscrivez une pensée", how_3_d: "Un mot du cœur glissé dans le coffret.",
      how_4_t: "Payez à la livraison", how_4_d: "Nous confirmons par téléphone sous 24 h ouvrables.",
      val_title: "Nos valeurs", val_1: "Authenticité", val_2: "Générosité", val_3: "Bienveillance",
      val_1_d: "Des produits vrais, choisis avec soin.", val_2_d: "Offrir sans compter, avec le cœur.", val_3_d: "Une attention sincère, de la box à la livraison.",
      corp_title: "VIP Corporate & Bespoke", corp_text: "Cadeaux d'affaires, fêtes de fin d'année, 8 mars, reconnaissance des collaborateurs : des coffrets sur mesure, aux couleurs de votre entreprise.",
      corp_cta: "Demandez un devis",
      footer_contact: "Contact", footer_install: "Installer l'application", footer_rights: "Tous droits réservés.",
      install_android: "Installer sur Android", install_ios: "Installer sur iPhone", ios_building: "Application IOS en construction, Veuillez utiliser le site internet", install_howto: "Sur Android : menu ⋮ du navigateur puis « Installer l'application ».", install_ready: "Installer l'application",
      demo_banner: "Mode démo — les données sont enregistrées uniquement sur cet appareil.",
      price_from: "à partir de",
      currency: "DA",

      step_box: "Ma box", step_content: "Contenu", step_note: "Petit mot", step_order: "Commande",
      step_n: "Étape {n} sur {t}",
      box_title: "Choisissez votre box", box_sub: "Chaque détail compte : taille, matière, couleur.",
      opt_size: "Taille", opt_material: "Matière", opt_color: "Couleur", opt_matcolor: "Matière et couleur",
      opt_capacity: "jusqu'à {n} cases", opt_included: "inclus", opt_supp: "+ {p}", opt_empty_box: "Box vide", slot_1: "1 case", slot_n: "{n} cases",
      pick_size_first: "Choisissez d'abord la taille de votre box pour ajouter des articles.", pick_color_first: "Choisissez une couleur pour continuer.",
      content_title: "Composez le contenu", content_sub: "Touchez un article pour l'ajouter à votre box.",
      content_count: "{n} / {max} cases", content_count_free: "{n} cases", content_left: "{n} case(s) libre(s)",
      content_full: "Votre box est pleine. Choisissez une taille plus grande ou retirez un article.", no_room: "Pas assez de cases libres", detail: "Détails", close: "Fermer", content_empty_cat: "Bientôt de nouveaux articles dans cette catégorie.",
      cat_all: "Tout", in_box: "Dans la box", add: "Ajouter", remove: "Retirer", out_of_stock: "Indisponible",
      note_title: "Inscrivez une pensée, nous la ferons parvenir…", note_sub: "Quelques mots du cœur, écrits à la main sur une carte Signature et glissés dans la box. Offert.",
      note_ph: "Ex. : Merci d'être là. Avec toute mon affection…", note_left: "{n} caractères restants", note_skip: "Vous pouvez aussi laisser ce champ vide.",
      note_preview: "Aperçu de la carte",
      order_title: "Livraison et commande", order_sub: "Paiement à la livraison. Nous vous appelons sous 24 h ouvrables pour confirmer.",
      f_name: "Nom et prénom", f_phone: "Téléphone", f_wilaya: "Wilaya", f_commune: "Commune", f_address: "Adresse de livraison", f_note: "Précisions pour la livraison (facultatif)",
      f_choose: "Choisir…", f_phone_hint: "Ex. 0555 12 34 56",
      sum_title: "Récapitulatif", sum_box: "Box", sum_items: "Contenu", sum_message: "Petit mot", sum_subtotal: "Sous-total", sum_delivery: "Livraison", sum_total: "Total à payer",
      sum_delivery_tbc: "confirmée par téléphone", sum_free: "offerte", sum_empty: "Aucun article choisi",
      pay_cod: "Paiement à la livraison", pay_confirm: "Confirmation téléphonique sous 24 h ouvrables",
      btn_next: "Continuer", btn_back: "Retour", btn_confirm: "Confirmer ma commande", btn_sending: "Envoi en cours…",
      need_login: "Connectez-vous pour finaliser votre commande. Votre box est conservée.",
      done_title: "Merci, votre commande est enregistrée", done_num: "Commande n° {n}",
      done_text: "Nous vous appelons dans les 24 h ouvrables pour confirmer votre commande. Vous réglerez à la réception.",
      done_wa: "Écrire sur WhatsApp", done_orders: "Voir mes commandes", done_home: "Retour à l'accueil",
      err_generic: "Une erreur est survenue. Veuillez réessayer.",
      err_slow: "Le chargement est trop long. Vérifiez votre connexion puis réessayez.", btn_retry: "Réessayer", btn_reset: "Se déconnecter et réessayer",
      err_required: "Veuillez remplir tous les champs obligatoires.",
      err_phone: "Numéro de téléphone invalide.",
      err_empty: "Ajoutez au moins un article à votre box.",
      err_capacity: "Trop d'articles pour cette taille de box.",
      err_unavailable: "Un article n'est plus disponible. Mettez votre box à jour.",
      err_options: "Choisissez la taille, la matière et la couleur de la box.",
      err_color: "Cette couleur n'existe pas dans cette matière.", err_rate: "Trop de tentatives. Patientez une minute puis réessayez.", err_otp: "Code incorrect ou expiré.", err_unconfirmed: "Adresse e-mail non confirmée : saisissez le code reçu par e-mail.",
      otp_title: "Vérifiez votre e-mail", otp_sub: "Nous avons envoyé un code à 6 chiffres à {e}. Saisissez-le ci-dessous.", otp_ph: "Code à 6 chiffres", btn_verify: "Valider", otp_resend: "Renvoyer le code", otp_resent: "Un nouveau code a été envoyé.", otp_demo: "Mode démo — votre code : {c}", otp_spam: "Pensez à vérifier vos courriers indésirables.", otp_have: "J'ai déjà un code",
      quote_title: "Demandez un devis", quote_sub: "Dites-nous en quelques mots votre besoin ; nous vous répondons sur WhatsApp avec une proposition sur mesure.",
      quote_vip_man: "Des coffrets d'affaires pensés pour lui : cadeaux de direction, remerciements clients, fêtes de fin d'année.", quote_vip_woman: "Des coffrets d'affaires pensés pour elle : 8 mars, reconnaissance des collaboratrices, événements.", quote_bespoke: "Un coffret entièrement conçu avec vous : contenu, matières, personnalisation, quantités.",
      q_name: "Votre nom", q_company: "Entreprise (facultatif)", q_qty: "Quantité souhaitée", q_need: "Votre besoin (facultatif)", btn_quote_wa: "Envoyer ma demande sur WhatsApp", quote_wa_hi: "Bonjour Signature, je souhaite un devis pour « {c} ».",

      login_title: "Connexion", register_title: "Créer mon compte",
      f_email: "Adresse e-mail", f_password: "Mot de passe", f_password_hint: "6 caractères minimum",
      btn_login: "Se connecter", btn_register: "Créer mon compte",
      to_register: "Pas encore de compte ? Créer un compte", to_login: "Déjà un compte ? Se connecter",
      err_auth: "E-mail ou mot de passe incorrect.", err_exists: "Un compte existe déjà avec cet e-mail.",
      err_weak: "Mot de passe trop court (6 caractères minimum).", err_email: "Adresse e-mail invalide.",
      confirm_email: "Adresse confirmée. Bienvenue !",
      orders_title: "Mes commandes", orders_empty: "Vous n'avez pas encore passé de commande.",
      logged_as: "Connecté : {e}",
      st_new: "Nouvelle", st_confirmed: "Confirmée", st_shipped: "En livraison", st_delivered: "Livrée", st_cancelled: "Annulée",

      adm_title: "Espace de gestion", adm_orders: "Commandes", adm_products: "Produits", adm_options: "Options de box", adm_collections: "Collections", adm_settings: "Réglages",
      adm_denied: "Accès réservé à l'administrateur.", adm_login_first: "Connectez-vous avec le compte administrateur.",
      adm_new_orders: "{n} nouvelle(s) commande(s)", adm_search: "Rechercher…", adm_all: "Toutes",
      adm_call: "Appeler", adm_wa: "WhatsApp", adm_print: "Imprimer", adm_copy: "Copier le petit mot", adm_copied: "Copié",
      adm_note_internal: "Note interne", adm_save: "Enregistrer", adm_saved: "Enregistré", adm_delete: "Supprimer", adm_edit: "Modifier", adm_add: "Ajouter", adm_cancel: "Annuler",
      adm_confirm_delete: "Supprimer définitivement ?",
      adm_export_csv: "Exporter en CSV", adm_import_csv: "Importer une liste", adm_none: "Rien à afficher.",
      p_slots: "Cases occupées dans la box", p_desc_fr: "Présentation (français)", p_desc_ar: "Présentation (arabe)", o_material: "Matière liée (pour une couleur)", o_name_hint: "Nom commercial (ex. Signature Essentielle)", c_kind: "Redirection", c_kind_size: "Vers la composition d'une box", c_kind_quote: "Vers une demande de devis", c_ref: "Cible",
      adm_prod_new: "Nouveau produit", adm_prod_edit: "Modifier le produit",
      p_category: "Catégorie", p_name_fr: "Nom (français)", p_name_ar: "Nom (arabe)", p_price: "Prix (DA)", p_stock: "En stock", p_active: "Visible sur le site", p_image: "Photo", p_image_url: "ou adresse de l'image", p_upload: "Choisir une photo",
      o_type: "Type", o_price: "Prix / supplément (DA)", o_capacity: "Capacité (nb d'articles)", o_hex: "Couleur (code #hex)", o_sort: "Ordre",
      type_size: "Taille", type_material: "Matière", type_color: "Couleur",
      c_tagline_fr: "Slogan (français)", c_tagline_ar: "Slogan (arabe)", c_products: "Articles de la collection",
      imp_title: "Importer des produits", imp_help: "Collez des lignes depuis Excel ou un fichier CSV. Colonnes : catégorie ; nom FR ; nom AR ; prix ; stock (1 ou 0). Les produits existants (même nom FR) sont mis à jour.",
      imp_run: "Importer", imp_done: "{n} produit(s) importé(s).", imp_file: "ou choisir un fichier .csv",
      s_delivery: "Frais de livraison (DA, 0 = à confirmer par téléphone)", s_phone: "Téléphone", s_whatsapp: "WhatsApp (format international, ex. 213783966842)", s_instagram: "Instagram (sans @)", s_email: "E-mail de contact",
      s_announce_fr: "Bandeau d'annonce (français)", s_announce_ar: "Bandeau d'annonce (arabe)",
      o_customer: "Client", o_address: "Adresse", o_message: "Petit mot", o_total: "Total", o_date: "Date",
      new_order_alert: "Nouvelle commande reçue !",
      ph_title: "Bon de préparation"
    },
    ar: {
      brand: "سيغنتشر", brand_sub: "مجموعات الهدايا",
      tagline: "أكثر من هدية… إحساس يُهدى.",
      motto: "حيث تتحوّل كل هدية إلى ذكرى",
      nav_home: "الرئيسية", nav_collections: "المجموعات", nav_compose: "صمّم صندوقك", nav_orders: "طلباتي",
      nav_account: "حسابي", nav_login: "تسجيل الدخول", nav_logout: "تسجيل الخروج", nav_admin: "الإدارة",
      lang_switch: "Français",
      cta_compose: "صمّم صندوقك", cta_discover: "اكتشف المجموعات",
      hero_kicker: "صناديق هدايا حسب الطلب",
      hero_text: "اختر الصندوق، ركّب محتواه، وأضف كلمتك الخاصة. ونحن نتولّى الباقي بكل أناقة.",
      col_title: "مجموعاتنا", col_sub: "ابدأ من تشكيلة جاهزة ثم عدّلها على ذوقك.",
      col_use: "صمّم هذا الصندوق", col_quote: "اطلب عرض سعر", col_items: "{n} قطع",
      how_title: "كيف يعمل؟",
      how_1_t: "اختر صندوقك", how_1_d: "الحجم والخامة واللون.",
      how_2_t: "ركّب المحتوى", how_2_d: "عطر، ساعة، وشاح، إكسسوارات…",
      how_3_t: "اكتب خاطرة", how_3_d: "كلمة من القلب توضع داخل الصندوق.",
      how_4_t: "ادفع عند الاستلام", how_4_d: "نتصل بك للتأكيد خلال 24 ساعة عمل.",
      val_title: "قيمنا", val_1: "الأصالة", val_2: "الكرم", val_3: "اللطف",
      val_1_d: "منتجات حقيقية نختارها بعناية.", val_2_d: "نُهدي بسخاء وبكل قلب.", val_3_d: "اهتمام صادق من الصندوق إلى التسليم.",
      corp_title: "VIP للشركات", corp_text: "هدايا الأعمال، نهاية السنة، 8 مارس، تكريم الموظفين: صناديق حسب الطلب بهوية شركتك.",
      corp_cta: "اطلب عرض سعر",
      footer_contact: "اتصل بنا", footer_install: "ثبّت التطبيق", footer_rights: "جميع الحقوق محفوظة.",
      install_android: "ثبّت على أندرويد", install_ios: "ثبّت على آيفون", ios_building: "تطبيق iOS قيد الإنشاء، يرجى استخدام الموقع الإلكتروني", install_howto: "على أندرويد: قائمة ⋮ في المتصفح ثم «تثبيت التطبيق».", install_ready: "ثبّت التطبيق",
      demo_banner: "وضع تجريبي — البيانات محفوظة على هذا الجهاز فقط.",
      price_from: "ابتداءً من",
      currency: "دج",

      step_box: "الصندوق", step_content: "المحتوى", step_note: "الكلمة", step_order: "الطلب",
      step_n: "الخطوة {n} من {t}",
      box_title: "اختر صندوقك", box_sub: "كل تفصيل مهم: الحجم والخامة واللون.",
      opt_size: "الحجم", opt_material: "الخامة", opt_color: "اللون", opt_matcolor: "الخامة واللون",
      opt_capacity: "حتى {n} خانات", opt_included: "مشمول", opt_supp: "+ {p}", opt_empty_box: "صندوق فارغ", slot_1: "خانة واحدة", slot_n: "{n} خانات",
      pick_size_first: "اختر أولًا حجم صندوقك لإضافة القطع.", pick_color_first: "اختر لونًا للمتابعة.",
      content_title: "ركّب المحتوى", content_sub: "اضغط على القطعة لإضافتها إلى صندوقك.",
      content_count: "{n} / {max} خانات", content_count_free: "{n} خانات", content_left: "{n} خانة متاحة",
      content_full: "صندوقك ممتلئ. اختر حجمًا أكبر أو أزل قطعة.", no_room: "لا توجد خانات كافية", detail: "التفاصيل", close: "إغلاق", content_empty_cat: "قطع جديدة قريبًا في هذه الفئة.",
      cat_all: "الكل", in_box: "في الصندوق", add: "إضافة", remove: "إزالة", out_of_stock: "غير متوفر",
      note_title: "اكتب خاطرة، ونحن نوصلها…", note_sub: "بضع كلمات من القلب تُكتب بخط اليد على بطاقة سيغنتشر وتوضع داخل الصندوق. مجانًا.",
      note_ph: "مثال: شكرًا لأنك موجود. مع كل المحبة…", note_left: "المتبقي {n} حرفًا", note_skip: "يمكنك ترك هذا الحقل فارغًا.",
      note_preview: "معاينة البطاقة",
      order_title: "التوصيل والطلب", order_sub: "الدفع عند الاستلام. نتصل بك خلال 24 ساعة عمل للتأكيد.",
      f_name: "الاسم واللقب", f_phone: "الهاتف", f_wilaya: "الولاية", f_commune: "البلدية", f_address: "عنوان التوصيل", f_note: "ملاحظات للتوصيل (اختياري)",
      f_choose: "اختر…", f_phone_hint: "مثال 0555 12 34 56",
      sum_title: "ملخص الطلب", sum_box: "الصندوق", sum_items: "المحتوى", sum_message: "الكلمة", sum_subtotal: "المجموع الجزئي", sum_delivery: "التوصيل", sum_total: "المبلغ المستحق",
      sum_delivery_tbc: "يؤكَّد عبر الهاتف", sum_free: "مجاني", sum_empty: "لم تختر أي قطعة",
      pay_cod: "الدفع عند الاستلام", pay_confirm: "تأكيد هاتفي خلال 24 ساعة عمل",
      btn_next: "متابعة", btn_back: "رجوع", btn_confirm: "تأكيد طلبي", btn_sending: "جارٍ الإرسال…",
      need_login: "سجّل الدخول لإتمام طلبك. صندوقك محفوظ.",
      done_title: "شكرًا، تم تسجيل طلبك", done_num: "الطلب رقم {n}",
      done_text: "سنتصل بك خلال 24 ساعة عمل لتأكيد الطلب. تدفع عند الاستلام.",
      done_wa: "راسلنا على واتساب", done_orders: "عرض طلباتي", done_home: "العودة إلى الرئيسية",
      err_generic: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      err_slow: "التحميل بطيء جدًا. تحقق من اتصالك ثم أعد المحاولة.", btn_retry: "إعادة المحاولة", btn_reset: "تسجيل الخروج وإعادة المحاولة",
      err_required: "يرجى ملء جميع الحقول الإلزامية.",
      err_phone: "رقم الهاتف غير صحيح.",
      err_empty: "أضف قطعة واحدة على الأقل إلى صندوقك.",
      err_capacity: "عدد القطع أكبر من سعة هذا الحجم.",
      err_unavailable: "إحدى القطع لم تعد متوفرة. حدّث صندوقك.",
      err_options: "اختر حجم الصندوق وخامته ولونه.",
      err_color: "هذا اللون غير متوفر في هذه الخامة.", err_rate: "محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.", err_otp: "الرمز غير صحيح أو منتهي.", err_unconfirmed: "البريد غير مؤكَّد: أدخل الرمز المرسل إلى بريدك.",
      otp_title: "تحقق من بريدك الإلكتروني", otp_sub: "أرسلنا رمزًا من 6 أرقام إلى {e}. أدخله أدناه.", otp_ph: "رمز من 6 أرقام", btn_verify: "تأكيد", otp_resend: "إعادة إرسال الرمز", otp_resent: "تم إرسال رمز جديد.", otp_demo: "وضع تجريبي — رمزك: {c}", otp_spam: "تحقق أيضًا من البريد غير المرغوب فيه.", otp_have: "لدي رمز بالفعل",
      quote_title: "اطلب عرض سعر", quote_sub: "أخبرنا بحاجتك في كلمات قليلة، وسنرد عليك عبر واتساب بعرض خاص.",
      quote_vip_man: "صناديق أعمال مخصصة للرجال: هدايا الإدارة، شكر الزبائن، نهاية السنة.", quote_vip_woman: "صناديق أعمال مخصصة للنساء: 8 مارس، تكريم الموظفات، المناسبات.", quote_bespoke: "صندوق يُصمَّم معك بالكامل: المحتوى والخامات والتخصيص والكميات.",
      q_name: "اسمك", q_company: "الشركة (اختياري)", q_qty: "الكمية المطلوبة", q_need: "حاجتك (اختياري)", btn_quote_wa: "أرسل طلبي عبر واتساب", quote_wa_hi: "مرحبًا سيغنتشر، أرغب في عرض سعر لـ «{c}».",

      login_title: "تسجيل الدخول", register_title: "إنشاء حساب",
      f_email: "البريد الإلكتروني", f_password: "كلمة المرور", f_password_hint: "6 أحرف على الأقل",
      btn_login: "دخول", btn_register: "إنشاء الحساب",
      to_register: "ليس لديك حساب؟ أنشئ حسابًا", to_login: "لديك حساب؟ سجّل الدخول",
      err_auth: "البريد أو كلمة المرور غير صحيحة.", err_exists: "يوجد حساب بهذا البريد بالفعل.",
      err_weak: "كلمة المرور قصيرة (6 أحرف على الأقل).", err_email: "بريد إلكتروني غير صالح.",
      confirm_email: "تم تأكيد البريد. أهلًا بك!",
      orders_title: "طلباتي", orders_empty: "لم تقم بأي طلب بعد.",
      logged_as: "مسجّل الدخول: {e}",
      st_new: "جديد", st_confirmed: "مؤكَّد", st_shipped: "قيد التوصيل", st_delivered: "تم التسليم", st_cancelled: "ملغى",

      adm_title: "لوحة الإدارة", adm_orders: "الطلبات", adm_products: "المنتجات", adm_options: "خيارات الصندوق", adm_collections: "المجموعات", adm_settings: "الإعدادات",
      adm_denied: "الدخول مخصص للمسؤول فقط.", adm_login_first: "سجّل الدخول بحساب المسؤول.",
      adm_new_orders: "{n} طلب جديد", adm_search: "بحث…", adm_all: "الكل",
      adm_call: "اتصال", adm_wa: "واتساب", adm_print: "طباعة", adm_copy: "نسخ الكلمة", adm_copied: "تم النسخ",
      adm_note_internal: "ملاحظة داخلية", adm_save: "حفظ", adm_saved: "تم الحفظ", adm_delete: "حذف", adm_edit: "تعديل", adm_add: "إضافة", adm_cancel: "إلغاء",
      adm_confirm_delete: "حذف نهائي؟",
      adm_export_csv: "تصدير CSV", adm_import_csv: "استيراد قائمة", adm_none: "لا شيء للعرض.",
      p_slots: "الخانات التي يشغلها", p_desc_fr: "العرض (فرنسي)", p_desc_ar: "العرض (عربي)", o_material: "الخامة المرتبطة (للون)", o_name_hint: "الاسم التجاري (مثال Signature Essentielle)", c_kind: "التوجيه", c_kind_size: "إلى تركيب صندوق", c_kind_quote: "إلى طلب عرض سعر", c_ref: "الهدف",
      adm_prod_new: "منتج جديد", adm_prod_edit: "تعديل المنتج",
      p_category: "الفئة", p_name_fr: "الاسم (فرنسي)", p_name_ar: "الاسم (عربي)", p_price: "السعر (دج)", p_stock: "متوفر", p_active: "ظاهر في الموقع", p_image: "الصورة", p_image_url: "أو رابط الصورة", p_upload: "اختر صورة",
      o_type: "النوع", o_price: "السعر / الإضافة (دج)", o_capacity: "السعة (عدد القطع)", o_hex: "اللون (رمز #hex)", o_sort: "الترتيب",
      type_size: "الحجم", type_material: "الخامة", type_color: "اللون",
      c_tagline_fr: "الشعار (فرنسي)", c_tagline_ar: "الشعار (عربي)", c_products: "قطع المجموعة",
      imp_title: "استيراد منتجات", imp_help: "الصق أسطرًا من إكسل أو ملف CSV. الأعمدة: الفئة ؛ الاسم FR ؛ الاسم AR ؛ السعر ؛ المخزون (1 أو 0). المنتجات الموجودة (نفس الاسم FR) تُحدَّث.",
      imp_run: "استيراد", imp_done: "تم استيراد {n} منتج.", imp_file: "أو اختر ملف .csv",
      s_delivery: "تكلفة التوصيل (دج، 0 = تؤكَّد هاتفيًا)", s_phone: "الهاتف", s_whatsapp: "واتساب (صيغة دولية، مثال 213783966842)", s_instagram: "إنستغرام (بدون @)", s_email: "البريد الإلكتروني",
      s_announce_fr: "شريط الإعلان (فرنسي)", s_announce_ar: "شريط الإعلان (عربي)",
      o_customer: "الزبون", o_address: "العنوان", o_message: "الكلمة", o_total: "المجموع", o_date: "التاريخ",
      new_order_alert: "وصل طلب جديد!",
      ph_title: "وصل التحضير"
    }
  };

  const cats = {
    perfume:    { fr: "Parfums",              ar: "عطور" },
    watch:      { fr: "Montres",              ar: "ساعات" },
    scarf:      { fr: "Foulards",             ar: "أوشحة" },
    leather:    { fr: "Maroquinerie",         ar: "جلديات" },
    eyewear:    { fr: "Lunettes",             ar: "نظارات" },
    stationery: { fr: "Papeterie & stylos",   ar: "قرطاسية وأقلام" },
    gourmet:    { fr: "Gourmandises",         ar: "حلويات وأطايب" },
    care:       { fr: "Soins & bien-être",    ar: "عناية وراحة" },
    flowers:    { fr: "Fleurs & déco",        ar: "ورود وديكور" },
    lifestyle:  { fr: "Lifestyle",            ar: "أسلوب حياة" },
    accessory:  { fr: "Accessoires",          ar: "إكسسوارات" },
    clothing:   { fr: "Vêtements",            ar: "ملابس" },
    other:      { fr: "Autres",               ar: "أخرى" }
  };

  const W = [
    ["Adrar","أدرار"],["Chlef","الشلف"],["Laghouat","الأغواط"],["Oum El Bouaghi","أم البواقي"],["Batna","باتنة"],["Béjaïa","بجاية"],["Biskra","بسكرة"],["Béchar","بشار"],["Blida","البليدة"],["Bouira","البويرة"],
    ["Tamanrasset","تمنراست"],["Tébessa","تبسة"],["Tlemcen","تلمسان"],["Tiaret","تيارت"],["Tizi Ouzou","تيزي وزو"],["Alger","الجزائر"],["Djelfa","الجلفة"],["Jijel","جيجل"],["Sétif","سطيف"],["Saïda","سعيدة"],
    ["Skikda","سكيكدة"],["Sidi Bel Abbès","سيدي بلعباس"],["Annaba","عنابة"],["Guelma","قالمة"],["Constantine","قسنطينة"],["Médéa","المدية"],["Mostaganem","مستغانم"],["M'Sila","المسيلة"],["Mascara","معسكر"],["Ouargla","ورقلة"],
    ["Oran","وهران"],["El Bayadh","البيض"],["Illizi","إليزي"],["Bordj Bou Arréridj","برج بوعريريج"],["Boumerdès","بومرداس"],["El Tarf","الطارف"],["Tindouf","تندوف"],["Tissemsilt","تيسمسيلت"],["El Oued","الوادي"],["Khenchela","خنشلة"],
    ["Souk Ahras","سوق أهراس"],["Tipaza","تيبازة"],["Mila","ميلة"],["Aïn Defla","عين الدفلى"],["Naâma","النعامة"],["Aïn Témouchent","عين تموشنت"],["Ghardaïa","غرداية"],["Relizane","غليزان"],["Timimoun","تيميمون"],["Bordj Badji Mokhtar","برج باجي مختار"],
    ["Ouled Djellal","أولاد جلال"],["Béni Abbès","بني عباس"],["In Salah","عين صالح"],["In Guezzam","عين قزام"],["Touggourt","تقرت"],["Djanet","جانت"],["El M'Ghair","المغير"],["El Menia","المنيعة"]
  ].map((w, i) => ({ code: i + 1, fr: w[0], ar: w[1] }));

  let lang = "fr";
  try { lang = localStorage.getItem("sig_lang") || (window.SIGNATURE_CONFIG && window.SIGNATURE_CONFIG.DEFAULT_LANG) || "fr"; } catch (e) {}
  if (lang !== "fr" && lang !== "ar") lang = "fr";

  const I18N = {
    categories: cats,
    wilayas: W,
    get lang() { return lang; },
    t(key, vars) {
      let s = (dict[lang] && dict[lang][key]) || dict.fr[key] || key;
      if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
      return s;
    },
    /* champ localisé : obj.name_fr / obj.name_ar */
    f(obj, base) {
      if (!obj) return "";
      return (lang === "ar" ? (obj[base + "_ar"] || obj[base + "_fr"]) : (obj[base + "_fr"] || obj[base + "_ar"])) || "";
    },
    cat(key) { const c = cats[key] || cats.other; return c[lang]; },
    wilaya(code) { const w = W.find(x => String(x.code) === String(code)); return w ? w[lang] : ""; },
    wilayaName(code, l) { const w = W.find(x => String(x.code) === String(code)); return w ? w[l || lang] : ""; },
    money(n) {
      const v = Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return v + " " + dict[lang].currency;
    },
    apply() {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    },
    set(l) {
      lang = l === "ar" ? "ar" : "fr";
      try { localStorage.setItem("sig_lang", lang); } catch (e) {}
      I18N.apply();
    }
  };
  I18N.apply();
  window.I18N = I18N;
})();
