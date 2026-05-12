import { DEFAULT_APP_LOCALE, type AppLocale } from "@yowl/types";

type ShellCopy = {
  premiumSocial: string;
  live: string;
  currentMode: string;
  cameraFirst: string;
  currentModeBody: string;
  navigationLabel: string;
  nav: {
    camera: string;
    chat: string;
    howls: string;
    moonlight: string;
    profile: string;
    settings: string;
  };
};

type AuthCopy = {
  introBadge: string;
  introLine: string;
  heroTitle: string;
  headerTagline: string;
  feature1Desc: string;
  feature2Desc: string;
  feature3Desc: string;
  panelTitle: string;
  panelSubtitle: string;
  pill1: string;
  pill2: string;
  pill3: string;
  loginTitle: string;
  registerTitle: string;
  forgotTitle: string;
  loginTab: string;
  registerTab: string;
  loginSubtitle: string;
  registerSubtitle: string;
  forgotSubtitle: string;
  loginIdentifierPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  birthDateLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  genderLabel: string;
  genderMan: string;
  genderWoman: string;
  genderOther: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  accountExistsPrompt: string;
  accountExistsAction: string;
  noAccountPrompt: string;
  noAccountAction: string;
  backToLoginPrompt: string;
  backToLoginAction: string;
  submitLogin: string;
  submitRegister: string;
  submitForgot: string;
  loading: string;
  languageLabel: string;
  languageHelper: string;
  footerPrivacy: string;
  footerSecurity: string;
  footerSupport: string;
  featureInfo: {
    howls: { title: string; body: string };
    moonlight: { title: string; body: string };
    yowlmap: { title: string; body: string };
    echoes: { title: string; body: string };
  };
  footerInfo: {
    privacy: { title: string; body: string };
    security: { title: string; body: string };
  };
};

const COPY: Record<AppLocale, { shell: ShellCopy; auth: AuthCopy }> = {
  nl: {
    shell: {
      premiumSocial: "Premium sociaal",
      live: "Live",
      currentMode: "Huidige modus",
      cameraFirst: "Camera eerst, altijd.",
      currentModeBody: "Snelle, donkere UI met originele Yowl-branding en motion.",
      navigationLabel: "Navigatie",
      nav: {
        camera: "Camera",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Profiel",
        settings: "Instellingen"
      }
    },
    auth: {
      introBadge: "Jouw wereld, één app",
      introLine: "Chats, Howls, YowlMoji en YowlMap werken samen zonder gedoe.",
      heroTitle: "Welkom bij YowlChat",
      headerTagline: "Echte mensen. Echte gesprekken. Eigen glow.",
      feature1Desc: "Foto's en momenten van je vrienden op één plek.",
      feature2Desc: "Snelle clips en highlights die je meteen ziet.",
      feature3Desc: "Zie in één oogopslag waar je vrienden zijn.",
      panelTitle: "Alles bij elkaar, zonder rommel",
      panelSubtitle: "Je profiel, camera en voorkeuren blijven gewoon netjes op hun plek.",
      pill1: "Taal onthouden",
      pill2: "Privacy op orde",
      pill3: "Camera en chat dichtbij",
      loginTitle: "Inloggen bij Yowl",
      registerTitle: "Maak een Yowl-account",
      forgotTitle: "Wachtwoord vergeten",
      loginTab: "Inloggen",
      registerTab: "Aanmelden",
      loginSubtitle: "Gebruik je e-mailadres of gebruikersnaam om verder te gaan.",
      registerSubtitle: "Maak je profiel aan, zet je YowlMoji klaar en stap meteen de app in.",
      forgotSubtitle: "Vraag veilig een herstellink aan met je e-mailadres.",
      loginIdentifierPlaceholder: "jij@voorbeeld.be of je gebruikersnaam",
      emailLabel: "E-mailadres",
      emailPlaceholder: "jij@voorbeeld.be",
      firstNameLabel: "Voornaam",
      firstNamePlaceholder: "Voornaam",
      lastNameLabel: "Achternaam",
      lastNamePlaceholder: "Achternaam",
      birthDateLabel: "Geboortedatum",
      phoneLabel: "Telefoonnummer",
      phonePlaceholder: "+32 ...",
      genderLabel: "Gender",
      genderMan: "Man",
      genderWoman: "Vrouw",
      genderOther: "Geen van beide",
      passwordLabel: "Wachtwoord",
      passwordPlaceholder: "Minstens 8 tekens",
      forgotPassword: "Wachtwoord vergeten?",
      accountExistsPrompt: "Al een account?",
      accountExistsAction: "Inloggen",
      noAccountPrompt: "Nog nieuw bij Yowl?",
      noAccountAction: "Aanmelden",
      backToLoginPrompt: "Terug naar login?",
      backToLoginAction: "Inloggen",
      submitLogin: "Volgende",
      submitRegister: "Account aanmaken",
      submitForgot: "Herstelmail sturen",
      loading: "Even laden...",
      languageLabel: "Taal",
      languageHelper: "Kies de taal voor je hele app",
      footerPrivacy: "Privacy",
      footerSecurity: "Veiligheid",
      footerSupport: "Support",
      featureInfo: {
        howls: { title: "Howls", body: "Korte verhalen van je vrienden in een duidelijke ring, zodat je snel ziet wat er speelt." },
        moonlight: { title: "Moonlight", body: "Korte highlights en snelle momenten die je meteen kunt bekijken zonder de flow te verlaten." },
        yowlmap: { title: "YowlMap", body: "Zie waar je vrienden actief zijn op een kaart, met een privacy-first weergave." },
        echoes: { title: "Echoes", body: "Bewaarde momenten, herinneringen en clips die je later nog eens terug kunt kijken." }
      },
      footerInfo: {
        privacy: {
          title: "Privacy",
          body: "Yowl bewaart alleen wat nodig is om je account, chats en voorkeuren te laten werken. Je taal, zichtbaarheid, camera- en meldingsinstellingen horen bij je account zodat je ze op elk toestel terugziet. Je bepaalt zelf wat zichtbaar is voor anderen, en je kunt je profiel en zichtbaarheid later altijd aanpassen."
        },
        security: {
          title: "Veiligheid",
          body: "We gebruiken veilige sessies, accountbeveiliging en duidelijke foutmeldingen zodat je niet onnodig technische details ziet. In de app houden we gevoelige acties afgeschermd en blijven belangrijke instellingen onder je controle. Als iets niet klopt, helpen we je via support of accountinstellingen verder."
        }
      }
    }
  },
  en: {
    shell: {
      premiumSocial: "Premium social",
      live: "Live",
      currentMode: "Current mode",
      cameraFirst: "Camera first, always.",
      currentModeBody: "Fast, dark UI with original Yowl branding and motion.",
      navigationLabel: "Navigation",
      nav: {
        camera: "Camera",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Profile",
        settings: "Settings"
      }
    },
    auth: {
      introBadge: "Your world in one app",
      introLine: "Chats, Howls, YowlMoji and YowlMap work together without extra friction.",
      heroTitle: "Welcome to YowlChat",
      headerTagline: "Real people. Real conversations. Our own glow.",
      feature1Desc: "Photos and moments from your friends in one place.",
      feature2Desc: "Quick clips and highlights you can catch at a glance.",
      feature3Desc: "See at a glance where your friends are now.",
      panelTitle: "Everything together, without the clutter",
      panelSubtitle: "Your profile, camera and preferences stay neatly in place.",
      pill1: "Remember language",
      pill2: "Privacy sorted",
      pill3: "Camera and chat nearby",
      loginTitle: "Log in to Yowl",
      registerTitle: "Create a Yowl account",
      forgotTitle: "Forgot password",
      loginTab: "Log in",
      registerTab: "Sign up",
      loginSubtitle: "Use your email address or username to continue.",
      registerSubtitle: "Set up your profile, prepare your YowlMoji and jump into the app.",
      forgotSubtitle: "Request a secure reset link with your email address.",
      loginIdentifierPlaceholder: "you@example.com or your username",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      firstNameLabel: "First name",
      firstNamePlaceholder: "First name",
      lastNameLabel: "Last name",
      lastNamePlaceholder: "Last name",
      birthDateLabel: "Birthdate",
      phoneLabel: "Phone number",
      phonePlaceholder: "+1 ...",
      genderLabel: "Gender",
      genderMan: "Man",
      genderWoman: "Woman",
      genderOther: "Neither",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      forgotPassword: "Forgot password?",
      accountExistsPrompt: "Already have an account?",
      accountExistsAction: "Log in",
      noAccountPrompt: "New to Yowl?",
      noAccountAction: "Sign up",
      backToLoginPrompt: "Back to login?",
      backToLoginAction: "Log in",
      submitLogin: "Continue",
      submitRegister: "Create account",
      submitForgot: "Send reset email",
      loading: "Loading...",
      languageLabel: "Language",
      languageHelper: "Choose the language for your whole app",
      footerPrivacy: "Privacy",
      footerSecurity: "Safety",
      footerSupport: "Support",
      featureInfo: {
        howls: { title: "Howls", body: "Quick stories from your friends in a clear ring, so you can see what is happening at a glance." },
        moonlight: { title: "Moonlight", body: "Short highlights and fast moments you can view without leaving the flow." },
        yowlmap: { title: "YowlMap", body: "See where your friends are active on a map, with a privacy-first view." },
        echoes: { title: "Echoes", body: "Saved moments, memories and clips you can come back to later." }
      },
      footerInfo: {
        privacy: {
          title: "Privacy",
          body: "Yowl stores only what is needed for your account, chats and preferences to work. Your language, visibility, camera and notification settings belong to your account so they follow you across devices. You stay in control of what others can see, and you can change your profile or visibility at any time."
        },
        security: {
          title: "Safety",
          body: "We use secure sessions, account protection and clear errors so you do not see technical details you do not need. Sensitive actions stay behind protective layers, while important settings remain under your control. If something looks wrong, support and account settings are there to help."
        }
      }
    }
  },
  fr: {
    shell: {
      premiumSocial: "Social premium",
      live: "En direct",
      currentMode: "Mode actuel",
      cameraFirst: "La caméra d'abord, toujours.",
      currentModeBody: "Interface rapide et sombre avec la marque Yowl et du mouvement.",
      navigationLabel: "Navigation",
      nav: {
        camera: "Caméra",
        chat: "Discussion",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Profil",
        settings: "Paramètres"
      }
    },
    auth: {
      introBadge: "Tout au même endroit",
      introLine: "Chats, Howls, YowlMoji et YowlMap dans une seule app. Simple, rapide et familière.",
      heroTitle: "Bienvenue sur YowlChat",
      headerTagline: "De vraies personnes. De vraies conversations. Notre propre glow.",
      feature1Desc: "Photos et vidéos de vos amis.",
      feature2Desc: "Clips courts et moments mis en avant dans un seul flux.",
      feature3Desc: "Voyez où sont vos amis maintenant.",
      panelTitle: "Votre profil, votre caméra, votre fil",
      panelSubtitle: "Tout ce qu'il faut, sans effort superflu.",
      pill1: "Mémoriser votre langue",
      pill2: "Confidentialité bien gérée",
      pill3: "Caméra et chat à portée de main",
      loginTitle: "Connexion à Yowl",
      registerTitle: "Créer un compte Yowl",
      forgotTitle: "Mot de passe oublié",
      loginTab: "Connexion",
      registerTab: "Inscription",
      loginSubtitle: "Utilisez votre adresse e-mail ou votre nom d'utilisateur pour continuer.",
      registerSubtitle: "Créez votre profil, préparez votre YowlMoji et entrez dans l'app.",
      forgotSubtitle: "Demandez un lien de réinitialisation sécurisé avec votre e-mail.",
      loginIdentifierPlaceholder: "vous@exemple.fr ou votre nom d'utilisateur",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "vous@exemple.fr",
      firstNameLabel: "Prénom",
      firstNamePlaceholder: "Prénom",
      lastNameLabel: "Nom de famille",
      lastNamePlaceholder: "Nom de famille",
      birthDateLabel: "Date de naissance",
      phoneLabel: "Numéro de téléphone",
      phonePlaceholder: "+33 ...",
      genderLabel: "Genre",
      genderMan: "Homme",
      genderWoman: "Femme",
      genderOther: "Aucun des deux",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Au moins 8 caractères",
      forgotPassword: "Mot de passe oublié ?",
      accountExistsPrompt: "Vous avez déjà un compte ?",
      accountExistsAction: "Connexion",
      noAccountPrompt: "Nouveau sur Yowl ?",
      noAccountAction: "S'inscrire",
      backToLoginPrompt: "Retour à la connexion ?",
      backToLoginAction: "Connexion",
      submitLogin: "Continuer",
      submitRegister: "Créer le compte",
      submitForgot: "Envoyer l'e-mail",
      loading: "Chargement...",
      languageLabel: "Langue",
      languageHelper: "Choisissez la langue pour toute votre app",
      footerPrivacy: "Confidentialité",
      footerSecurity: "Sécurité",
      footerSupport: "Support",
      featureInfo: {
        howls: { title: "Howls", body: "Des stories rapides de vos amis, affichées clairement pour voir ce qui se passe d'un coup d'œil." },
        moonlight: { title: "Moonlight", body: "Des highlights courts et des moments rapides à consulter sans quitter le flux." },
        yowlmap: { title: "YowlMap", body: "Voyez où vos amis sont actifs sur une carte, avec une vue pensée pour la confidentialité." },
        echoes: { title: "Echoes", body: "Des moments sauvegardés, souvenirs et clips à revoir plus tard." }
      },
      footerInfo: {
        privacy: {
          title: "Confidentialité",
          body: "Yowl conserve seulement ce qu'il faut pour faire fonctionner votre compte, vos chats et vos préférences. Votre langue, votre visibilité, la caméra et les notifications suivent votre compte, pour que tout reste cohérent sur vos appareils. Vous gardez le contrôle sur ce que les autres voient, et vous pouvez modifier votre profil ou votre visibilité à tout moment."
        },
        security: {
          title: "Sécurité",
          body: "Nous utilisons des sessions sécurisées, une protection du compte et des erreurs claires pour éviter d'afficher des détails techniques inutiles. Les actions sensibles restent protégées, tandis que les réglages importants restent sous votre contrôle. Si quelque chose semble anormal, le support et les paramètres du compte sont là pour aider."
        }
      }
    }
  },
  de: {
    shell: {
      premiumSocial: "Premium Social",
      live: "Live",
      currentMode: "Aktueller Modus",
      cameraFirst: "Kamera zuerst, immer.",
      currentModeBody: "Schnelle, dunkle UI mit originalem Yowl-Branding und Motion.",
      navigationLabel: "Navigation",
      nav: {
        camera: "Kamera",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Profil",
        settings: "Einstellungen"
      }
    },
    auth: {
      introBadge: "Alles an einem Ort",
      introLine: "Chats, Howls, YowlMoji und YowlMap in einer App. Einfach, schnell und vertraut.",
      heroTitle: "Willkommen bei YowlChat",
      headerTagline: "Echte Menschen. Echte Gespräche. Unser eigener Glow.",
      feature1Desc: "Fotos und Videos von deinen Freunden.",
      feature2Desc: "Kurze Clips und Highlights in einem Feed.",
      feature3Desc: "Sieh, wo deine Freunde gerade sind.",
      panelTitle: "Dein Profil, deine Kamera, dein Feed",
      panelSubtitle: "Alles, was du brauchst, ohne unnötigen Aufwand.",
      pill1: "Sprache merken",
      pill2: "Datenschutz sauber gelöst",
      pill3: "Kamera und Chat direkt daneben",
      loginTitle: "Bei Yowl anmelden",
      registerTitle: "Ein Yowl-Konto erstellen",
      forgotTitle: "Passwort vergessen",
      loginTab: "Anmelden",
      registerTab: "Registrieren",
      loginSubtitle: "Verwende deine E-Mail-Adresse oder deinen Benutzernamen, um fortzufahren.",
      registerSubtitle: "Richte dein Profil ein, bereite deinen YowlMoji vor und starte direkt in die App.",
      forgotSubtitle: "Fordere einen sicheren Reset-Link mit deiner E-Mail-Adresse an.",
      loginIdentifierPlaceholder: "du@beispiel.de oder dein Benutzername",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "du@beispiel.de",
      firstNameLabel: "Vorname",
      firstNamePlaceholder: "Vorname",
      lastNameLabel: "Nachname",
      lastNamePlaceholder: "Nachname",
      birthDateLabel: "Geburtsdatum",
      phoneLabel: "Telefonnummer",
      phonePlaceholder: "+49 ...",
      genderLabel: "Geschlecht",
      genderMan: "Mann",
      genderWoman: "Frau",
      genderOther: "Keines von beiden",
      passwordLabel: "Passwort",
      passwordPlaceholder: "Mindestens 8 Zeichen",
      forgotPassword: "Passwort vergessen?",
      accountExistsPrompt: "Du hast schon ein Konto?",
      accountExistsAction: "Anmelden",
      noAccountPrompt: "Neu bei Yowl?",
      noAccountAction: "Registrieren",
      backToLoginPrompt: "Zurück zum Login?",
      backToLoginAction: "Anmelden",
      submitLogin: "Weiter",
      submitRegister: "Konto erstellen",
      submitForgot: "Reset-Mail senden",
      loading: "Lädt...",
      languageLabel: "Sprache",
      languageHelper: "Wähle die Sprache für deine ganze App",
      footerPrivacy: "Datenschutz",
      footerSecurity: "Sicherheit",
      footerSupport: "Support",
      featureInfo: {
        howls: { title: "Howls", body: "Kurze Stories deiner Freunde in einem klaren Ring, damit du sofort siehst, was los ist." },
        moonlight: { title: "Moonlight", body: "Kurze Highlights und schnelle Momente, die du ansehen kannst, ohne den Flow zu verlassen." },
        yowlmap: { title: "YowlMap", body: "Sieh auf einer Karte, wo deine Freunde aktiv sind, mit einer Privacy-first-Ansicht." },
        echoes: { title: "Echoes", body: "Gespeicherte Momente, Erinnerungen und Clips, die du später wieder ansehen kannst." }
      },
      footerInfo: {
        privacy: {
          title: "Datenschutz",
          body: "Yowl speichert nur das, was nötig ist, damit dein Konto, deine Chats und deine Einstellungen funktionieren. Sprache, Sichtbarkeit, Kamera und Benachrichtigungen gehören zu deinem Konto, damit sie auf allen Geräten gleich bleiben. Du bestimmst selbst, was andere sehen können, und kannst dein Profil oder deine Sichtbarkeit jederzeit ändern."
        },
        security: {
          title: "Sicherheit",
          body: "Wir nutzen sichere Sitzungen, Kontoschutz und klare Fehlermeldungen, damit du keine unnötigen technischen Details siehst. Sensible Aktionen bleiben geschützt, während wichtige Einstellungen unter deiner Kontrolle bleiben. Wenn etwas nicht stimmt, helfen Support und Kontoeinstellungen weiter."
        }
      }
    }
  },
  es: {
    shell: {
      premiumSocial: "Social premium",
      live: "En vivo",
      currentMode: "Modo actual",
      cameraFirst: "La cámara primero, siempre.",
      currentModeBody: "Interfaz rápida y oscura con la marca original de Yowl y movimiento.",
      navigationLabel: "Navegación",
      nav: {
        camera: "Cámara",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Perfil",
        settings: "Ajustes"
      }
    },
    auth: {
      introBadge: "Todo en un solo lugar",
      introLine: "Chats, Howls, YowlMoji y YowlMap en una sola app. Simple, rápida y familiar.",
      heroTitle: "Bienvenido a YowlChat",
      headerTagline: "Personas reales. Conversaciones reales. Nuestro propio brillo.",
      feature1Desc: "Fotos y videos de tus amigos.",
      feature2Desc: "Clips cortos y momentos destacados en un solo feed.",
      feature3Desc: "Ve dónde están tus amigos ahora.",
      panelTitle: "Tu perfil, tu cámara, tu feed",
      panelSubtitle: "Todo lo que necesitas, sin fricción extra.",
      pill1: "Recordar tu idioma",
      pill2: "Privacidad bien gestionada",
      pill3: "Cámara y chat cerca",
      loginTitle: "Inicia sesión en Yowl",
      registerTitle: "Crear una cuenta de Yowl",
      forgotTitle: "Contraseña olvidada",
      loginTab: "Iniciar sesión",
      registerTab: "Registrarte",
      loginSubtitle: "Usa tu correo electrónico o nombre de usuario para continuar.",
      registerSubtitle: "Configura tu perfil, prepara tu YowlMoji y entra en la app.",
      forgotSubtitle: "Solicita un enlace seguro de restablecimiento con tu correo.",
      loginIdentifierPlaceholder: "tu@ejemplo.es o tu nombre de usuario",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@ejemplo.es",
      firstNameLabel: "Nombre",
      firstNamePlaceholder: "Nombre",
      lastNameLabel: "Apellido",
      lastNamePlaceholder: "Apellido",
      birthDateLabel: "Fecha de nacimiento",
      phoneLabel: "Número de teléfono",
      phonePlaceholder: "+34 ...",
      genderLabel: "Género",
      genderMan: "Hombre",
      genderWoman: "Mujer",
      genderOther: "Ninguno de los dos",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Al menos 8 caracteres",
      forgotPassword: "¿Olvidaste tu contraseña?",
      accountExistsPrompt: "¿Ya tienes una cuenta?",
      accountExistsAction: "Iniciar sesión",
      noAccountPrompt: "¿Nuevo en Yowl?",
      noAccountAction: "Registrarte",
      backToLoginPrompt: "¿Volver al inicio de sesión?",
      backToLoginAction: "Iniciar sesión",
      submitLogin: "Continuar",
      submitRegister: "Crear cuenta",
      submitForgot: "Enviar correo",
      loading: "Cargando...",
      languageLabel: "Idioma",
      languageHelper: "Elige el idioma para toda tu app",
      footerPrivacy: "Privacidad",
      footerSecurity: "Seguridad",
      footerSupport: "Soporte",
      featureInfo: {
        howls: { title: "Howls", body: "Historias rápidas de tus amigos en un anillo claro, para ver al instante lo que pasa." },
        moonlight: { title: "Moonlight", body: "Destacados cortos y momentos rápidos que puedes ver sin salir del flujo." },
        yowlmap: { title: "YowlMap", body: "Mira dónde están activos tus amigos en un mapa, con una vista centrada en la privacidad." },
        echoes: { title: "Echoes", body: "Momentos guardados, recuerdos y clips que puedes volver a ver más tarde." }
      },
      footerInfo: {
        privacy: {
          title: "Privacidad",
          body: "Yowl guarda solo lo necesario para que tu cuenta, chats y preferencias funcionen. El idioma, la visibilidad, la cámara y las notificaciones pertenecen a tu cuenta para que se mantengan iguales en todos tus dispositivos. Tú decides qué pueden ver los demás y puedes cambiar tu perfil o visibilidad cuando quieras."
        },
        security: {
          title: "Seguridad",
          body: "Usamos sesiones seguras, protección de cuenta y errores claros para que no veas detalles técnicos innecesarios. Las acciones sensibles se mantienen protegidas, mientras que los ajustes importantes siguen bajo tu control. Si algo no parece correcto, soporte y ajustes de cuenta están ahí para ayudarte."
        }
      }
    }
  },
  it: {
    shell: {
      premiumSocial: "Social premium",
      live: "Live",
      currentMode: "Modalità attuale",
      cameraFirst: "Prima la camera, sempre.",
      currentModeBody: "Interfaccia veloce e scura con branding Yowl originale e motion.",
      navigationLabel: "Navigazione",
      nav: {
        camera: "Camera",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Profilo",
        settings: "Impostazioni"
      }
    },
    auth: {
      introBadge: "Tutto in un posto",
      introLine: "Chat, Howls, YowlMoji e YowlMap in un'unica app. Semplice, veloce e familiare.",
      heroTitle: "Benvenuto su YowlChat",
      headerTagline: "Persone vere. Conversazioni vere. Il nostro glow.",
      feature1Desc: "Foto e video dei tuoi amici.",
      feature2Desc: "Clip brevi e highlights in un solo feed.",
      feature3Desc: "Vedi dove sono i tuoi amici adesso.",
      panelTitle: "Il tuo profilo, la tua camera, il tuo feed",
      panelSubtitle: "Tutto quello che ti serve, senza frizioni extra.",
      pill1: "Ricordare la tua lingua",
      pill2: "Privacy gestita bene",
      pill3: "Camera e chat vicine",
      loginTitle: "Accedi a Yowl",
      registerTitle: "Crea un account Yowl",
      forgotTitle: "Password dimenticata",
      loginTab: "Accedi",
      registerTab: "Registrati",
      loginSubtitle: "Usa il tuo indirizzo email o nome utente per continuare.",
      registerSubtitle: "Configura il tuo profilo, prepara il tuo YowlMoji ed entra nell'app.",
      forgotSubtitle: "Richiedi un link sicuro di reset con la tua email.",
      loginIdentifierPlaceholder: "tuo@esempio.it o il tuo nome utente",
      emailLabel: "Indirizzo email",
      emailPlaceholder: "tuo@esempio.it",
      firstNameLabel: "Nome",
      firstNamePlaceholder: "Nome",
      lastNameLabel: "Cognome",
      lastNamePlaceholder: "Cognome",
      birthDateLabel: "Data di nascita",
      phoneLabel: "Numero di telefono",
      phonePlaceholder: "+39 ...",
      genderLabel: "Genere",
      genderMan: "Uomo",
      genderWoman: "Donna",
      genderOther: "Nessuno dei due",
      passwordLabel: "Password",
      passwordPlaceholder: "Almeno 8 caratteri",
      forgotPassword: "Hai dimenticato la password?",
      accountExistsPrompt: "Hai già un account?",
      accountExistsAction: "Accedi",
      noAccountPrompt: "Nuovo su Yowl?",
      noAccountAction: "Iscriviti",
      backToLoginPrompt: "Torna al login?",
      backToLoginAction: "Accedi",
      submitLogin: "Continua",
      submitRegister: "Crea account",
      submitForgot: "Invia email",
      loading: "Caricamento...",
      languageLabel: "Lingua",
      languageHelper: "Scegli la lingua per tutta l'app",
      footerPrivacy: "Privacy",
      footerSecurity: "Sicurezza",
      footerSupport: "Supporto",
      featureInfo: {
        howls: { title: "Howls", body: "Storie rapide dei tuoi amici in un anello chiaro, così vedi subito cosa succede." },
        moonlight: { title: "Moonlight", body: "Highlight brevi e momenti veloci da guardare senza uscire dal flusso." },
        yowlmap: { title: "YowlMap", body: "Vedi dove sono attivi i tuoi amici su una mappa, con una vista privacy-first." },
        echoes: { title: "Echoes", body: "Momenti salvati, ricordi e clip da rivedere più tardi." }
      },
      footerInfo: {
        privacy: {
          title: "Privacy",
          body: "Yowl salva solo ciò che serve per far funzionare il tuo account, le chat e le preferenze. Lingua, visibilità, camera e notifiche appartengono al tuo account così restano uguali su tutti i dispositivi. Decidi tu cosa gli altri possono vedere e puoi cambiare il tuo profilo o la visibilità quando vuoi."
        },
        security: {
          title: "Sicurezza",
          body: "Usiamo sessioni sicure, protezione dell'account e messaggi di errore chiari così non vedi dettagli tecnici inutili. Le azioni sensibili restano protette, mentre le impostazioni importanti restano sotto il tuo controllo. Se qualcosa non va, supporto e impostazioni account sono lì per aiutarti."
        }
      }
    }
  },
  pt: {
    shell: {
      premiumSocial: "Social premium",
      live: "Ao vivo",
      currentMode: "Modo atual",
      cameraFirst: "Câmera primeiro, sempre.",
      currentModeBody: "Interface rápida e escura com branding original da Yowl e movimento.",
      navigationLabel: "Navegação",
      nav: {
        camera: "Câmera",
        chat: "Chat",
        howls: "Howls",
        moonlight: "Moonlight",
        profile: "Perfil",
        settings: "Definições"
      }
    },
    auth: {
      introBadge: "Tudo em um só lugar",
      introLine: "Chats, Howls, YowlMoji e YowlMap em um único app. Simples, rápido e familiar.",
      heroTitle: "Bem-vindo ao YowlChat",
      headerTagline: "Pessoas reais. Conversas reais. O nosso glow.",
      feature1Desc: "Fotos e vídeos dos teus amigos.",
      feature2Desc: "Clipes curtos e destaques num só feed.",
      feature3Desc: "Vê onde os teus amigos estão agora.",
      panelTitle: "O teu perfil, a tua câmera, o teu feed",
      panelSubtitle: "Tudo o que precisas, sem fricção extra.",
      pill1: "Lembrar a tua língua",
      pill2: "Privacidade bem tratada",
      pill3: "Câmera e chat por perto",
      loginTitle: "Entrar no Yowl",
      registerTitle: "Criar uma conta Yowl",
      forgotTitle: "Palavra-passe esquecida",
      loginTab: "Entrar",
      registerTab: "Registar",
      loginSubtitle: "Usa o teu email ou nome de utilizador para continuar.",
      registerSubtitle: "Prepara o teu perfil, o teu YowlMoji e entra já na app.",
      forgotSubtitle: "Pede um link seguro de redefinição com o teu email.",
      loginIdentifierPlaceholder: "tu@exemplo.pt ou o teu nome de utilizador",
      emailLabel: "Endereço de email",
      emailPlaceholder: "tu@exemplo.pt",
      firstNameLabel: "Nome",
      firstNamePlaceholder: "Nome",
      lastNameLabel: "Apelido",
      lastNamePlaceholder: "Apelido",
      birthDateLabel: "Data de nascimento",
      phoneLabel: "Número de telefone",
      phonePlaceholder: "+351 ...",
      genderLabel: "Género",
      genderMan: "Homem",
      genderWoman: "Mulher",
      genderOther: "Nenhum dos dois",
      passwordLabel: "Palavra-passe",
      passwordPlaceholder: "Pelo menos 8 caracteres",
      forgotPassword: "Esqueceste-te da palavra-passe?",
      accountExistsPrompt: "Já tens conta?",
      accountExistsAction: "Entrar",
      noAccountPrompt: "Novo no Yowl?",
      noAccountAction: "Regista-te",
      backToLoginPrompt: "Voltar ao login?",
      backToLoginAction: "Entrar",
      submitLogin: "Continuar",
      submitRegister: "Criar conta",
      submitForgot: "Enviar email",
      loading: "A carregar...",
      languageLabel: "Idioma",
      languageHelper: "Escolhe o idioma para a tua app inteira",
      footerPrivacy: "Privacidade",
      footerSecurity: "Segurança",
      footerSupport: "Suporte",
      featureInfo: {
        howls: { title: "Howls", body: "Stories rápidas dos teus amigos num anel claro, para veres logo o que se passa." },
        moonlight: { title: "Moonlight", body: "Destaques curtos e momentos rápidos para veres sem sair do fluxo." },
        yowlmap: { title: "YowlMap", body: "Vê onde os teus amigos estão ativos num mapa, com uma vista privacy-first." },
        echoes: { title: "Echoes", body: "Momentos guardados, memórias e clips que podes rever mais tarde." }
      },
      footerInfo: {
        privacy: {
          title: "Privacidade",
          body: "A Yowl guarda apenas o necessário para a tua conta, conversas e preferências funcionarem. Idioma, visibilidade, câmara e notificações pertencem à tua conta, para que fiquem iguais em todos os dispositivos. Tu decides o que os outros podem ver e podes mudar o teu perfil ou visibilidade quando quiseres."
        },
        security: {
          title: "Segurança",
          body: "Usamos sessões seguras, proteção de conta e erros claros para que não vejas detalhes técnicos desnecessários. As ações sensíveis ficam protegidas, enquanto as definições importantes continuam sob o teu controlo. Se algo parecer errado, o suporte e as definições da conta ajudam-te."
        }
      }
    }
  }
};

export function getUiCopy(locale: AppLocale | null | undefined) {
  return COPY[locale ?? DEFAULT_APP_LOCALE] ?? COPY[DEFAULT_APP_LOCALE];
}
