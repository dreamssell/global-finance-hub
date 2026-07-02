import type { Locale } from "./config";

type Dict = {
  nav: { home: string; blog: string; simulator: string; login: string };
  hero: { eyebrow: string; title: string; subtitle: string; cta: string; comparePlan: string; compareFinance: string };
  simulator: {
    title: string; step: string; of: string; next: string; back: string; submit: string;
    productLabel: string; insurance: string; consortium: string;
    valueLabel: string; nameLabel: string; emailLabel: string; whatsappLabel: string;
    success: string; error: string;
  };
  blog: { title: string; readMore: string; empty: string; back: string };
  footer: { rights: string };
  meta: { title: string; description: string };
};

// Insurance vs Consortia terminology adapts per locale.
export const T: Record<Locale, Dict> = {
  br: {
    nav: { home: "Início", blog: "Blog", simulator: "Simulador", login: "Entrar" },
    hero: {
      eyebrow: "Seguros & Consórcios",
      title: "Financiar ou planejar? Descubra o caminho certo para o seu patrimônio.",
      subtitle: "Compare Seguros e Consórcios em segundos e receba uma simulação personalizada.",
      cta: "Simular agora",
      comparePlan: "Consórcio",
      compareFinance: "Seguro",
    },
    simulator: {
      title: "Simulador Inteligente", step: "Passo", of: "de", next: "Próximo", back: "Voltar", submit: "Receber simulação",
      productLabel: "O que você procura?", insurance: "Seguro (Auto / Residencial)", consortium: "Consórcio (Auto / Imóvel)",
      valueLabel: "Valor desejado", nameLabel: "Nome completo", emailLabel: "E-mail", whatsappLabel: "WhatsApp",
      success: "Recebemos sua simulação! Entraremos em contato.", error: "Não foi possível enviar. Tente novamente.",
    },
    blog: { title: "Últimos artigos", readMore: "Ler mais", empty: "Em breve novos conteúdos.", back: "Voltar ao blog" },
    footer: { rights: "Todos os direitos reservados." },
    meta: {
      title: "Seguros e Consórcios – Compare, simule e economize",
      description: "Compare Seguros e Consórcios em segundos. Simulação inteligente, conteúdo especializado e o melhor caminho para o seu patrimônio.",
    },
  },
  pt: {
    nav: { home: "Início", blog: "Blog", simulator: "Simulador", login: "Entrar" },
    hero: {
      eyebrow: "Seguros & Clubes de Auto-Financiamento",
      title: "Financiar ou planear? Descubra o caminho certo para o seu património.",
      subtitle: "Compare Seguros e Clubes de Auto-Financiamento em segundos.",
      cta: "Simular agora",
      comparePlan: "Auto-financiamento",
      compareFinance: "Seguro",
    },
    simulator: {
      title: "Simulador Inteligente", step: "Passo", of: "de", next: "Seguinte", back: "Voltar", submit: "Receber simulação",
      productLabel: "O que procura?", insurance: "Seguro (Auto / Habitação)", consortium: "Clube de auto-financiamento",
      valueLabel: "Valor pretendido", nameLabel: "Nome completo", emailLabel: "E-mail", whatsappLabel: "WhatsApp",
      success: "Recebemos a sua simulação! Entraremos em contacto.", error: "Não foi possível enviar. Tente novamente.",
    },
    blog: { title: "Últimos artigos", readMore: "Ler mais", empty: "Em breve novos conteúdos.", back: "Voltar ao blog" },
    footer: { rights: "Todos os direitos reservados." },
    meta: {
      title: "Seguros e Auto-Financiamento – Compare e simule",
      description: "Compare seguros e clubes de auto-financiamento com uma simulação inteligente. Conteúdo especializado para famílias e empresas.",
    },
  },
  en: {
    nav: { home: "Home", blog: "Blog", simulator: "Simulator", login: "Sign in" },
    hero: {
      eyebrow: "Insurance & Savings Clubs",
      title: "Finance it — or plan it? Find the smartest path to your assets.",
      subtitle: "Compare Insurance and Savings-Club plans in seconds. Get a personalized simulation.",
      cta: "Simulate now",
      comparePlan: "Savings Club",
      compareFinance: "Insurance",
    },
    simulator: {
      title: "Smart Simulator", step: "Step", of: "of", next: "Next", back: "Back", submit: "Get my simulation",
      productLabel: "What are you looking for?", insurance: "Insurance (Auto / Home)", consortium: "Savings Club (Auto / Home)",
      valueLabel: "Desired amount", nameLabel: "Full name", emailLabel: "Email", whatsappLabel: "WhatsApp",
      success: "Got it! We'll be in touch shortly.", error: "Could not send. Please try again.",
    },
    blog: { title: "Latest articles", readMore: "Read more", empty: "New content coming soon.", back: "Back to blog" },
    footer: { rights: "All rights reserved." },
    meta: {
      title: "Insurance & Savings Clubs – Compare, simulate, save",
      description: "Compare insurance policies and savings-club plans in seconds. Smart simulations and expert content for smart buyers.",
    },
  },
  es: {
    nav: { home: "Inicio", blog: "Blog", simulator: "Simulador", login: "Entrar" },
    hero: {
      eyebrow: "Seguros & Autofinanciamiento",
      title: "¿Financiar o planificar? Encuentra el camino inteligente para tu patrimonio.",
      subtitle: "Compara Seguros y Autofinanciamiento en segundos con una simulación personalizada.",
      cta: "Simular ahora",
      comparePlan: "Autofinanciamiento",
      compareFinance: "Seguro",
    },
    simulator: {
      title: "Simulador Inteligente", step: "Paso", of: "de", next: "Siguiente", back: "Atrás", submit: "Recibir simulación",
      productLabel: "¿Qué buscas?", insurance: "Seguro (Auto / Hogar)", consortium: "Autofinanciamiento",
      valueLabel: "Monto deseado", nameLabel: "Nombre completo", emailLabel: "Correo", whatsappLabel: "WhatsApp",
      success: "¡Listo! Te contactaremos pronto.", error: "No pudimos enviar. Intenta nuevamente.",
    },
    blog: { title: "Últimos artículos", readMore: "Leer más", empty: "Pronto habrá más contenido.", back: "Volver al blog" },
    footer: { rights: "Todos los derechos reservados." },
    meta: {
      title: "Seguros y Autofinanciamiento – Compara y simula",
      description: "Compara seguros y clubes de autofinanciamiento en segundos con una simulación inteligente y contenido experto.",
    },
  },
  it: {
    nav: { home: "Home", blog: "Blog", simulator: "Simulatore", login: "Accedi" },
    hero: {
      eyebrow: "Assicurazioni & Autofinanziamento",
      title: "Finanziare o pianificare? Scopri la via giusta per il tuo patrimonio.",
      subtitle: "Confronta Assicurazioni e Clubs di Autofinanziamento in pochi secondi.",
      cta: "Simula ora",
      comparePlan: "Autofinanziamento",
      compareFinance: "Assicurazione",
    },
    simulator: {
      title: "Simulatore Intelligente", step: "Passo", of: "di", next: "Avanti", back: "Indietro", submit: "Ricevi simulazione",
      productLabel: "Cosa cerchi?", insurance: "Assicurazione (Auto / Casa)", consortium: "Club di autofinanziamento",
      valueLabel: "Importo desiderato", nameLabel: "Nome completo", emailLabel: "Email", whatsappLabel: "WhatsApp",
      success: "Ricevuto! Ti contatteremo a breve.", error: "Invio non riuscito. Riprova.",
    },
    blog: { title: "Ultimi articoli", readMore: "Leggi di più", empty: "Nuovi contenuti in arrivo.", back: "Torna al blog" },
    footer: { rights: "Tutti i diritti riservati." },
    meta: {
      title: "Assicurazioni e Autofinanziamento – Confronta e simula",
      description: "Confronta assicurazioni e club di autofinanziamento con simulazioni intelligenti e contenuti esperti.",
    },
  },
};

export type TranslationDict = Dict;
