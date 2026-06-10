// i18n/translations.js
// ----------------------------------------------------------------------------
// All STATIC UI strings, keyed by a dotted name, in both languages. Components
// read these via t("key") from LanguageContext, so switching language flips the
// entire interface — not just the product data.
//
// The brand name "SeedMart" is intentionally NOT translated.
//
// Simple {placeholders} in a string are filled by t("key", { placeholder: x }).
// ----------------------------------------------------------------------------

export const translations = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.catalog": "Catalog",
    "nav.about": "About",
    "nav.account": "Account",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.greeting": "Hi,",

    // Home (landing)
    "home.topBrands": "Top Brands",
    "home.featured": "Featured Products",
    "home.allProducts": "All Products",
    "home.viewAll": "View all →",

    // About
    "about.title": "About Us",
    "about.proprietor": "Proprietor",
    "about.followUs": "Follow us",

    // Footer
    "footer.quickLinks": "Quick Links",
    "footer.followUs": "Follow Us",
    "footer.contact": "Contact",
    "footer.call": "Call",
    "footer.rights": "© 2026 {name}. All rights reserved.",

    // Catalog
    "catalog.title": "Seed Catalog",
    "catalog.searchPlaceholder": "Search by name…",
    "catalog.categoryPlaceholder": "Category (e.g. paddy)",
    "catalog.allCategories": "All categories",
    "catalog.loading": "Loading products…",
    "catalog.failed": "Failed: {msg}",
    "catalog.noResults": "No products match your filters.",
    "catalog.count": "{count} product(s)",

    // Stock
    "stock.all": "All stock",
    "stock.inStock": "In stock",
    "stock.limitedStock": "Limited",
    "stock.outOfStock": "Out of stock",

    // Pagination
    "pagination.prev": "‹ Prev",
    "pagination.next": "Next ›",
    "pagination.pageOf": "Page {page} of {pages}",

    // Product detail
    "detail.back": "‹ Back to catalog",
    "detail.loading": "Loading…",
    "detail.category": "Category:",
    "detail.reviewsTitle": "Verified farmer results",
    "detail.noReviews": "No verified reviews yet.",

    // Product card
    "product.noImage": "No image",

    // Common
    "common.close": "Close",
    "common.showPassword": "Show password",
    "common.hidePassword": "Hide password",
    "common.backHome": "‹ Back to home",

    // Settings (user profile)
    "nav.settings": "Settings",
    "settings.title": "My Settings",
    "settings.username": "Username",
    "settings.phone": "Phone number",
    "settings.email": "Email",
    "settings.noEmail": "Not provided",
    "settings.password": "Password",
    "settings.passwordNote":
      "For your security, passwords are stored as a one-way hash and can never be shown — not even to you. If you forgot it, change it below.",
    "settings.changePassword": "Change password",
    "settings.currentPassword": "Current password",
    "settings.newPassword": "New password",
    "settings.changeBtn": "Update password",
    "settings.changing": "Updating…",
    "settings.changeSuccess": "Password updated successfully.",
    "settings.errCurrent": "Enter your current password",

    // Wishlist
    "wishlist.add": "Add to wishlist",
    "wishlist.remove": "Remove from wishlist",
    "wishlist.empty": "Your wishlist is empty.",

    // Submit review
    "submit.title": "Submit your result",
    "submit.prompt": "Grew this seed? Share your verified result with other farmers.",
    "submit.submittingAs": "Submitting as",
    "submit.yield": "Yield result (e.g. 32 bags/acre)",
    "submit.notes": "Notes (season, soil, practices…)",
    "submit.photos": "Photos of your crop / result (optional)",
    "submit.button": "Submit for verification",
    "submit.sending": "Submitting…",
    "submit.errYield": "Please enter your yield result",
    "submit.success": "Submitted! An admin will verify it before it appears publicly.",

    // Submission status
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.pendingNote": "Awaiting admin verification.",
    "status.rejectedReason": "Reason:",

    // Account tabs
    "account.tabWishlist": "My Wishlist",
    "account.tabSubmissions": "My Submissions",
    "account.noSubmissions": "You haven’t submitted any results yet.",

    // Auth (login + signup)
    "auth.loginTitle": "Login",
    "auth.signupTitle": "Create account",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.phone": "Phone number",
    "auth.email": "Email (optional)",
    "auth.loginBtn": "Login",
    "auth.signupBtn": "Sign up",
    "auth.submitting": "Please wait…",
    "auth.noAccount": "New here?",
    "auth.signupLink": "Create an account",
    "auth.haveAccount": "Already have an account?",
    "auth.loginLink": "Login",
    "auth.backHome": "‹ Back to home",
    "auth.errUsername": "Username must be at least 3 characters",
    "auth.errPassword": "Password must be at least 6 characters",
    "auth.errPhone": "Phone number must be exactly 10 digits",
    "auth.errEmail": "Enter a valid email address",

    // Account
    "account.title": "My Account",
    "account.loggedInAs": "You are logged in as {name} (role: {role}).",
    "account.note": "Wishlist & submission history come in Stage 10.",

    // Admin — shared
    "admin.title": "Admin",
    "admin.navProducts": "Products",
    "admin.navQueue": "Moderation",
    "admin.navSettings": "Settings",
    "admin.loading": "Loading…",
    "admin.save": "Save",
    "admin.saving": "Saving…",
    "admin.cancel": "Cancel",
    "admin.delete": "Delete",
    "admin.edit": "Edit",
    "admin.confirmDelete": "Delete this product? This cannot be undone.",

    // Admin — products
    "admin.products.title": "Products",
    "admin.products.add": "+ Add product",
    "admin.products.none": "No products yet.",
    "admin.products.featured": "Featured",
    "admin.products.colName": "Name",
    "admin.products.colCompany": "Company",
    "admin.products.colStock": "Stock",
    "admin.products.colActions": "Actions",

    // Admin — product form
    "admin.form.newTitle": "New product",
    "admin.form.editTitle": "Edit product",
    "admin.form.nameEn": "Name (English)",
    "admin.form.nameTe": "Name (Telugu)",
    "admin.form.descEn": "Description (English)",
    "admin.form.descTe": "Description (Telugu)",
    "admin.form.company": "Company / brand",
    "admin.form.category": "Category (e.g. paddy)",
    "admin.form.stock": "Stock status",
    "admin.form.featured": "Featured on home page",
    "admin.form.photos": "Photos",
    "admin.form.required": "Please fill all required fields",

    // Image uploader
    "upload.choose": "Upload images",
    "upload.chooseMedia": "Upload photos / videos",
    "upload.uploading": "Uploading…",
    "upload.remove": "Remove",

    // Admin — site settings
    "aset.title": "Site Settings",
    "aset.shopInfo": "Shop info",
    "aset.contact": "Contact",
    "aset.home": "Home content",
    "aset.media": "Media slider (photos & videos)",
    "aset.mediaHint": "Shown in a slider below the header on the home page.",
    "aset.brands": "Top brands (Home)",
    "aset.brandsHint": "Tap to choose which brands show on the home page. None selected = show all.",
    "aset.brandsNone": "No products yet — add products to see their brands here.",
    "aset.social": "Social links",
    "aset.about": "About page",
    "aset.shopNameEn": "Shop name (English)",
    "aset.shopNameTe": "Shop name (Telugu)",
    "aset.shopDescEn": "Shop description (English)",
    "aset.shopDescTe": "Shop description (Telugu)",
    "aset.logo": "Shop logo",
    "aset.whatsapp": "WhatsApp number",
    "aset.contactPhone": "Contact phone",
    "aset.contactEmail": "Contact email",
    "aset.contacts": "Contact numbers (first one gets a call link)",
    "aset.contactLabel": "Label (e.g. Owner)",
    "aset.contactNumber": "Phone number",
    "aset.addressEn": "Address (English)",
    "aset.addressTe": "Address (Telugu)",
    "aset.heroEn": "Hero tagline (English)",
    "aset.heroTe": "Hero tagline (Telugu)",
    "aset.announceEn": "Announcement (English)",
    "aset.announceTe": "Announcement (Telugu)",
    "aset.fb": "Facebook URL",
    "aset.ig": "Instagram URL",
    "aset.yt": "YouTube URL",
    "aset.wa": "WhatsApp link",
    "aset.propName": "Proprietor name",
    "aset.propPhoto": "Proprietor photo",
    "aset.storyEn": "Shop story (English)",
    "aset.storyTe": "Shop story (Telugu)",
    "aset.saved": "Settings saved.",

    // Admin — moderation queue
    "queue.title": "Moderation Queue",
    "queue.filterPending": "Pending",
    "queue.filterApproved": "Approved",
    "queue.filterRejected": "Rejected",
    "queue.empty": "Nothing here.",
    "queue.phone": "Phone",
    "queue.product": "Product",
    "queue.yield": "Yield",
    "queue.notes": "Notes",
    "queue.approve": "Approve",
    "queue.reject": "Reject",
    "queue.farmerPhotos": "Farmer's photos — tap to include / exclude",
    "queue.selectAll": "Select all",
    "queue.clearAll": "Clear",
    "queue.addMore": "Add more photos (optional)",
    "queue.confirmApprove": "Confirm approval",
    "queue.rejectReason": "Reason for rejection (optional)",
    "queue.confirmReject": "Confirm rejection",
    "queue.cancel": "Cancel",
    "queue.working": "Working…",
    "queue.rejectedReason": "Reason:",
    "queue.delete": "Delete",
    "queue.confirmDelete": "Remove this submission from the queue? If it was approved, its public review is also removed. This cannot be undone.",
    "queue.clearAll": "Clear all",
    "queue.confirmClearAll": "Delete ALL {n} submission(s) in this tab? Approved ones also lose their public reviews. This cannot be undone.",
    "queue.clearing": "Clearing…",

    // 404
    "notfound.message": "That page doesn’t exist.",
    "notfound.gohome": "Go home",
  },

  te: {
    // Navbar
    "nav.home": "హోమ్",
    "nav.catalog": "జాబితా",
    "nav.about": "మా గురించి",
    "nav.account": "ఖాతా",
    "nav.admin": "నిర్వహణ",
    "nav.login": "ప్రవేశం",
    "nav.logout": "నిష్క్రమించు",
    "nav.greeting": "నమస్కారం,",

    // Home (landing)
    "home.topBrands": "ప్రముఖ బ్రాండ్‌లు",
    "home.featured": "ఫీచర్డ్ ఉత్పత్తులు",
    "home.allProducts": "అన్ని ఉత్పత్తులు",
    "home.viewAll": "అన్నీ చూడండి →",

    // About
    "about.title": "మా గురించి",
    "about.proprietor": "యజమాని",
    "about.followUs": "మమ్మల్ని అనుసరించండి",

    // Footer
    "footer.quickLinks": "త్వరిత లింక్‌లు",
    "footer.followUs": "మమ్మల్ని అనుసరించండి",
    "footer.contact": "సంప్రదించండి",
    "footer.call": "కాల్ చేయండి",
    "footer.rights": "© 2026 {name}. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",

    // Catalog
    "catalog.title": "విత్తన జాబితా",
    "catalog.searchPlaceholder": "పేరుతో వెతకండి…",
    "catalog.categoryPlaceholder": "వర్గం (ఉదా. వరి)",
    "catalog.allCategories": "అన్ని వర్గాలు",
    "catalog.loading": "ఉత్పత్తులు లోడ్ అవుతున్నాయి…",
    "catalog.failed": "విఫలమైంది: {msg}",
    "catalog.noResults": "మీ ఫిల్టర్‌లకు సరిపోయే ఉత్పత్తులు లేవు.",
    "catalog.count": "{count} ఉత్పత్తులు",

    // Stock
    "stock.all": "అన్ని నిల్వలు",
    "stock.inStock": "అందుబాటులో ఉంది",
    "stock.limitedStock": "పరిమితం",
    "stock.outOfStock": "నిల్వ లేదు",

    // Pagination
    "pagination.prev": "‹ మునుపటి",
    "pagination.next": "తదుపరి ›",
    "pagination.pageOf": "పేజీ {page} / {pages}",

    // Product detail
    "detail.back": "‹ జాబితాకు తిరిగి",
    "detail.loading": "లోడ్ అవుతోంది…",
    "detail.category": "వర్గం:",
    "detail.reviewsTitle": "ధృవీకరించబడిన రైతు ఫలితాలు",
    "detail.noReviews": "ఇంకా ధృవీకరించబడిన సమీక్షలు లేవు.",

    // Product card
    "product.noImage": "చిత్రం లేదు",

    // Common
    "common.close": "మూసివేయి",
    "common.showPassword": "పాస్‌వర్డ్ చూపించు",
    "common.hidePassword": "పాస్‌వర్డ్ దాచు",
    "common.backHome": "‹ హోమ్‌కు తిరిగి",

    // Settings (user profile)
    "nav.settings": "సెట్టింగ్‌లు",
    "settings.title": "నా సెట్టింగ్‌లు",
    "settings.username": "వినియోగదారు పేరు",
    "settings.phone": "ఫోన్ నంబర్",
    "settings.email": "ఇమెయిల్",
    "settings.noEmail": "ఇవ్వలేదు",
    "settings.password": "పాస్‌వర్డ్",
    "settings.passwordNote":
      "మీ భద్రత కోసం, పాస్‌వర్డ్‌లు వన్-వే హాష్‌గా నిల్వ చేయబడతాయి మరియు ఎప్పటికీ చూపించబడవు — మీకు కూడా. మీరు మర్చిపోతే, దిగువన మార్చండి.",
    "settings.changePassword": "పాస్‌వర్డ్ మార్చండి",
    "settings.currentPassword": "ప్రస్తుత పాస్‌వర్డ్",
    "settings.newPassword": "కొత్త పాస్‌వర్డ్",
    "settings.changeBtn": "పాస్‌వర్డ్ నవీకరించండి",
    "settings.changing": "నవీకరిస్తోంది…",
    "settings.changeSuccess": "పాస్‌వర్డ్ విజయవంతంగా నవీకరించబడింది.",
    "settings.errCurrent": "మీ ప్రస్తుత పాస్‌వర్డ్ నమోదు చేయండి",

    // Wishlist
    "wishlist.add": "ఇష్టాంశాలకు జోడించండి",
    "wishlist.remove": "ఇష్టాంశాల నుండి తీసివేయండి",
    "wishlist.empty": "మీ ఇష్టాంశాల జాబితా ఖాళీగా ఉంది.",

    // Submit review
    "submit.title": "మీ ఫలితాన్ని సమర్పించండి",
    "submit.prompt": "ఈ విత్తనాన్ని పండించారా? మీ ధృవీకరించబడిన ఫలితాన్ని ఇతర రైతులతో పంచుకోండి.",
    "submit.submittingAs": "సమర్పిస్తున్నది",
    "submit.yield": "దిగుబడి ఫలితం (ఉదా. ఎకరానికి 32 బస్తాలు)",
    "submit.notes": "గమనికలు (సీజన్, నేల, పద్ధతులు…)",
    "submit.photos": "మీ పంట / ఫలితం ఫోటోలు (ఐచ్ఛికం)",
    "submit.button": "ధృవీకరణ కోసం సమర్పించండి",
    "submit.sending": "సమర్పిస్తోంది…",
    "submit.errYield": "దయచేసి మీ దిగుబడి ఫలితాన్ని నమోదు చేయండి",
    "submit.success": "సమర్పించబడింది! బహిరంగంగా కనిపించే ముందు నిర్వాహకుడు దీన్ని ధృవీకరిస్తారు.",

    // Submission status
    "status.pending": "పెండింగ్‌లో ఉంది",
    "status.approved": "ఆమోదించబడింది",
    "status.rejected": "తిరస్కరించబడింది",
    "status.pendingNote": "నిర్వాహక ధృవీకరణ కోసం వేచి ఉంది.",
    "status.rejectedReason": "కారణం:",

    // Account tabs
    "account.tabWishlist": "నా ఇష్టాంశాలు",
    "account.tabSubmissions": "నా సమర్పణలు",
    "account.noSubmissions": "మీరు ఇంకా ఎటువంటి ఫలితాలను సమర్పించలేదు.",

    // Auth (login + signup)
    "auth.loginTitle": "ప్రవేశం",
    "auth.signupTitle": "ఖాతా సృష్టించండి",
    "auth.username": "వినియోగదారు పేరు",
    "auth.password": "పాస్‌వర్డ్",
    "auth.phone": "ఫోన్ నంబర్",
    "auth.email": "ఇమెయిల్ (ఐచ్ఛికం)",
    "auth.loginBtn": "ప్రవేశం",
    "auth.signupBtn": "నమోదు చేయండి",
    "auth.submitting": "దయచేసి వేచి ఉండండి…",
    "auth.noAccount": "కొత్తవారా?",
    "auth.signupLink": "ఖాతా సృష్టించండి",
    "auth.haveAccount": "ఇప్పటికే ఖాతా ఉందా?",
    "auth.loginLink": "ప్రవేశం",
    "auth.backHome": "‹ హోమ్‌కు తిరిగి",
    "auth.errUsername": "వినియోగదారు పేరు కనీసం 3 అక్షరాలు ఉండాలి",
    "auth.errPassword": "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి",
    "auth.errPhone": "ఫోన్ నంబర్ సరిగ్గా 10 అంకెలు ఉండాలి",
    "auth.errEmail": "చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా నమోదు చేయండి",

    // Account
    "account.title": "నా ఖాతా",
    "account.loggedInAs": "మీరు {name}గా లాగిన్ అయ్యారు (పాత్ర: {role}).",
    "account.note": "ఇష్టాంశాలు & సమర్పణ చరిత్ర దశ 10లో వస్తాయి.",

    // Admin — shared
    "admin.title": "నిర్వహణ",
    "admin.navProducts": "ఉత్పత్తులు",
    "admin.navQueue": "మోడరేషన్",
    "admin.navSettings": "సెట్టింగ్‌లు",
    "admin.loading": "లోడ్ అవుతోంది…",
    "admin.save": "సేవ్ చేయండి",
    "admin.saving": "సేవ్ అవుతోంది…",
    "admin.cancel": "రద్దు చేయండి",
    "admin.delete": "తొలగించండి",
    "admin.edit": "సవరించండి",
    "admin.confirmDelete": "ఈ ఉత్పత్తిని తొలగించాలా? దీన్ని రద్దు చేయలేరు.",

    // Admin — products
    "admin.products.title": "ఉత్పత్తులు",
    "admin.products.add": "+ ఉత్పత్తిని జోడించండి",
    "admin.products.none": "ఇంకా ఉత్పత్తులు లేవు.",
    "admin.products.featured": "ఫీచర్డ్",
    "admin.products.colName": "పేరు",
    "admin.products.colCompany": "కంపెనీ",
    "admin.products.colStock": "నిల్వ",
    "admin.products.colActions": "చర్యలు",

    // Admin — product form
    "admin.form.newTitle": "కొత్త ఉత్పత్తి",
    "admin.form.editTitle": "ఉత్పత్తిని సవరించండి",
    "admin.form.nameEn": "పేరు (ఇంగ్లీష్)",
    "admin.form.nameTe": "పేరు (తెలుగు)",
    "admin.form.descEn": "వివరణ (ఇంగ్లీష్)",
    "admin.form.descTe": "వివరణ (తెలుగు)",
    "admin.form.company": "కంపెనీ / బ్రాండ్",
    "admin.form.category": "వర్గం (ఉదా. వరి)",
    "admin.form.stock": "నిల్వ స్థితి",
    "admin.form.featured": "హోమ్ పేజీలో ఫీచర్ చేయండి",
    "admin.form.photos": "ఫోటోలు",
    "admin.form.required": "దయచేసి అవసరమైన అన్ని ఫీల్డ్‌లను నింపండి",

    // Image uploader
    "upload.choose": "చిత్రాలను అప్‌లోడ్ చేయండి",
    "upload.chooseMedia": "ఫోటోలు / వీడియోలు అప్‌లోడ్ చేయండి",
    "upload.uploading": "అప్‌లోడ్ అవుతోంది…",
    "upload.remove": "తీసివేయండి",

    // Admin — site settings
    "aset.title": "సైట్ సెట్టింగ్‌లు",
    "aset.shopInfo": "షాప్ సమాచారం",
    "aset.contact": "సంప్రదింపు",
    "aset.home": "హోమ్ కంటెంట్",
    "aset.media": "మీడియా స్లైడర్ (ఫోటోలు & వీడియోలు)",
    "aset.mediaHint": "హోమ్ పేజీలో హెడర్ కింద స్లైడర్‌లో చూపించబడుతుంది.",
    "aset.brands": "ప్రముఖ బ్రాండ్‌లు (హోమ్)",
    "aset.brandsHint": "హోమ్ పేజీలో ఏ బ్రాండ్‌లు చూపించాలో ఎంచుకోవడానికి నొక్కండి. ఏదీ ఎంచుకోకపోతే = అన్నీ చూపించబడతాయి.",
    "aset.brandsNone": "ఇంకా ఉత్పత్తులు లేవు — బ్రాండ్‌లను ఇక్కడ చూడటానికి ఉత్పత్తులను జోడించండి.",
    "aset.social": "సోషల్ లింక్‌లు",
    "aset.about": "మా గురించి పేజీ",
    "aset.shopNameEn": "షాప్ పేరు (ఇంగ్లీష్)",
    "aset.shopNameTe": "షాప్ పేరు (తెలుగు)",
    "aset.shopDescEn": "షాప్ వివరణ (ఇంగ్లీష్)",
    "aset.shopDescTe": "షాప్ వివరణ (తెలుగు)",
    "aset.logo": "షాప్ లోగో",
    "aset.whatsapp": "వాట్సాప్ నంబర్",
    "aset.contactPhone": "సంప్రదింపు ఫోన్",
    "aset.contactEmail": "సంప్రదింపు ఇమెయిల్",
    "aset.contacts": "సంప్రదింపు నంబర్‌లు (మొదటిదానికి కాల్ లింక్ ఉంటుంది)",
    "aset.contactLabel": "లేబుల్ (ఉదా. యజమాని)",
    "aset.contactNumber": "ఫోన్ నంబర్",
    "aset.addressEn": "చిరునామా (ఇంగ్లీష్)",
    "aset.addressTe": "చిరునామా (తెలుగు)",
    "aset.heroEn": "హీరో ట్యాగ్‌లైన్ (ఇంగ్లీష్)",
    "aset.heroTe": "హీరో ట్యాగ్‌లైన్ (తెలుగు)",
    "aset.announceEn": "ప్రకటన (ఇంగ్లీష్)",
    "aset.announceTe": "ప్రకటన (తెలుగు)",
    "aset.fb": "ఫేస్‌బుక్ URL",
    "aset.ig": "ఇన్‌స్టాగ్రామ్ URL",
    "aset.yt": "యూట్యూబ్ URL",
    "aset.wa": "వాట్సాప్ లింక్",
    "aset.propName": "యజమాని పేరు",
    "aset.propPhoto": "యజమాని ఫోటో",
    "aset.storyEn": "షాప్ కథ (ఇంగ్లీష్)",
    "aset.storyTe": "షాప్ కథ (తెలుగు)",
    "aset.saved": "సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి.",

    // Admin — moderation queue
    "queue.title": "మోడరేషన్ క్యూ",
    "queue.filterPending": "పెండింగ్",
    "queue.filterApproved": "ఆమోదించబడింది",
    "queue.filterRejected": "తిరస్కరించబడింది",
    "queue.empty": "ఇక్కడ ఏమీ లేదు.",
    "queue.phone": "ఫోన్",
    "queue.product": "ఉత్పత్తి",
    "queue.yield": "దిగుబడి",
    "queue.notes": "గమనికలు",
    "queue.approve": "ఆమోదించండి",
    "queue.reject": "తిరస్కరించండి",
    "queue.farmerPhotos": "రైతు ఫోటోలు — చేర్చడానికి / తీసివేయడానికి నొక్కండి",
    "queue.selectAll": "అన్నీ ఎంచుకోండి",
    "queue.clearAll": "క్లియర్",
    "queue.addMore": "మరిన్ని ఫోటోలు జోడించండి (ఐచ్ఛికం)",
    "queue.confirmApprove": "ఆమోదాన్ని నిర్ధారించండి",
    "queue.rejectReason": "తిరస్కరణకు కారణం (ఐచ్ఛికం)",
    "queue.confirmReject": "తిరస్కరణను నిర్ధారించండి",
    "queue.cancel": "రద్దు చేయండి",
    "queue.working": "పని జరుగుతోంది…",
    "queue.rejectedReason": "కారణం:",
    "queue.delete": "తొలగించండి",
    "queue.confirmDelete": "ఈ సమర్పణను క్యూ నుండి తీసివేయాలా? ఇది ఆమోదించబడి ఉంటే, దాని పబ్లిక్ సమీక్ష కూడా తీసివేయబడుతుంది. దీన్ని రద్దు చేయలేరు.",
    "queue.clearAll": "అన్నీ క్లియర్ చేయండి",
    "queue.confirmClearAll": "ఈ ట్యాబ్‌లోని మొత్తం {n} సమర్పణలను తొలగించాలా? ఆమోదించబడినవి వాటి పబ్లిక్ సమీక్షలను కూడా కోల్పోతాయి. దీన్ని రద్దు చేయలేరు.",
    "queue.clearing": "క్లియర్ అవుతోంది…",

    // 404
    "notfound.message": "ఆ పేజీ లేదు.",
    "notfound.gohome": "హోమ్‌కు వెళ్ళండి",
  },
};

// ── Category labels ─────────────────────────────────────────────────────────
// Products store `category` as a lowercase English key (e.g. "cotton"). We map
// that to a display label in each language so the UI never shows the raw key.
// Unknown categories fall back to the raw value.
export const categoryLabels = {
  paddy: { en: "Paddy", te: "వరి" },
  rice: { en: "Rice", te: "బియ్యం" },
  cotton: { en: "Cotton", te: "పత్తి" },
  chilli: { en: "Chilli", te: "మిర్చి" },
  maize: { en: "Maize", te: "మొక్కజొన్న" },
  groundnut: { en: "Groundnut", te: "వేరుశెనగ" },
  tomato: { en: "Tomato", te: "టమాటా" },
  brinjal: { en: "Brinjal", te: "వంకాయ" },
  vegetable: { en: "Vegetable", te: "కూరగాయలు" },
  pulses: { en: "Pulses", te: "పప్పుధాన్యాలు" },
  millet: { en: "Millet", te: "చిరుధాన్యం" },
};
