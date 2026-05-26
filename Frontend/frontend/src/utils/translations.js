export const translations = {
  en: {
    dashboard: {
      status: "Status",
      available: "Available",
      busy: "Busy",
      active: "Active",
      waiting: "Waiting",
      noActiveTasks: "No Active Tasks",
      time: "Time",
      onSite: "On-site",
      updateStatus: "Update Status",
      walletBalance: "Wallet Balance",
      availableAmount: "Available Amount",
      completedWorks: "Completed Works",
    }
  },
  ml: {
    dashboard: {
      status: "സ്റ്റാറ്റസ്",
      available: "ലഭ്യമാണ്",
      busy: "തിരക്കിലാണ്",
      active: "സജീവം",
      waiting: "കാത്തിരിക്കുന്നു",
      noActiveTasks: "നിലവിൽ ജോലികളില്ല",
      time: "സമയം",
      onSite: "സ്ഥലത്തുണ്ട്",
      updateStatus: "സ്റ്റാറ്റസ് അപ്ഡേറ്റ് ചെയ്യുക",
      walletBalance: "വാലറ്റ് ബാലൻസ്",
      availableAmount: "ലഭ്യമായ തുക",
      completedWorks: "പൂർത്തിയാക്കിയവ",
    }
  }
};

export const getTranslation = (lang, key) => {
  const language = lang === 'ml' ? 'ml' : 'en';
  const keys = key.split('.');
  let current = translations[language];
  for (const k of keys) {
    if (current[k] === undefined) {
      // fallback to english
      let fallback = translations['en'];
      for (const fk of keys) {
        if (fallback[fk] === undefined) return key;
        fallback = fallback[fk];
      }
      return fallback;
    }
    current = current[k];
  }
  return current;
};
