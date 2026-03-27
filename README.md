# FreelanceDash

**Timer, fatture, clienti e preventivi. Tutto gratis, tutto nel browser.**

Uno strumento completo per freelancer e lavoratori autonomi. Nessun account, nessun server, nessun costo.

## Funzionalità

- **Dashboard** — panoramica istantanea di fatturato, ore e pagamenti
- **Time Tracker** — timer live e inserimento manuale ore
- **Fatture** — crea fatture con IVA, esporta in PDF, importa ore tracciate
- **Gestione Clienti** — rubrica con tariffa, ore e fatturato per cliente
- **Preventivi** — invia stime professionali ai clienti
- **Backup dati** — esporta/importa in JSON
- **100% privato** — i dati restano nel browser, nessun server coinvolto

## Deploy su Vercel (5 minuti)

1. Crea un account su [github.com](https://github.com/signup)
2. Crea una nuova repository chiamata `freelancedash`
3. Carica tutti i file di questo progetto nella repository
4. Vai su [vercel.com/new](https://vercel.com/new), collega GitHub
5. Seleziona la repository, scegli "Vite" come framework
6. Clicca **Deploy**

La tua app sarà online su `freelancedash-[tuonome].vercel.app`

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri http://localhost:5173

## Struttura

```
├── index.html          # HTML con meta tag SEO e favicon
├── package.json        # Dipendenze
├── vite.config.js      # Build config
└── src/
    ├── main.jsx        # Entry point
    └── App.jsx         # App completa
```

## Licenza

MIT — usa, modifica e distribuisci liberamente.
