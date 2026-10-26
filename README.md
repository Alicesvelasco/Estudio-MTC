# Estudio MTC

Aplicación web de tests multirespuesta que funciona íntegramente en el
navegador. Los tests se escriben en Markdown dentro del repositorio y los
resultados se guardan en local (IndexedDB vía Dexie.js). Se publica como sitio
estático en GitHub Pages.

## Stack

- **React 19 + Vite + TypeScript** (SPA estática)
- **Tailwind CSS v4**
- **Dexie.js** para IndexedDB
- **Markdown**: los `.md` se importan en build con `import.meta.glob` y se
  parsean con un parser propio (frontmatter YAML + cuerpo)
- **HashRouter**: evita los 404 de GitHub Pages al recargar una ruta

## Estructura del proyecto

```text
Estudio-MTC/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI: build + deploy a GitHub Pages
├── content/
│   └── tests/                    # ← UN FICHERO .md POR TEST
│       └── fundamentos-mtc.md
├── docs/
│   └── formato-tests.md          # especificación del formato Markdown
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                  # punto de entrada
│   ├── App.tsx                   # rutas (HashRouter) + layout
│   ├── index.css                 # @import "tailwindcss"
│   │
│   ├── domain/                   # lógica pura, sin React ni Dexie
│   │   ├── types.ts              # Test, Question, Attempt, Answer…
│   │   ├── quiz.ts               # barajar, corregir, puntuar
│   │   └── stats.ts              # % global, historial, conceptos a repasar
│   │
│   ├── content/                  # capa de datos: Markdown → dominio
│   │   ├── parseTest.ts          # parser + validación del formato
│   │   └── catalog.ts            # import.meta.glob de content/tests/*.md
│   │
│   ├── db/                       # capa de persistencia: IndexedDB
│   │   ├── database.ts           # esquema Dexie y versiones
│   │   └── attempts.ts           # repositorio: guardar/leer intentos
│   │
│   ├── features/                 # pantallas, cada una autocontenida
│   │   ├── catalog/
│   │   │   ├── CatalogPage.tsx   # listado de tests
│   │   │   └── TestCard.tsx
│   │   ├── quiz/
│   │   │   ├── QuizPage.tsx
│   │   │   ├── useQuiz.ts        # máquina de estados del test
│   │   │   ├── QuestionView.tsx
│   │   │   ├── OptionButton.tsx  # feedback verde/rojo
│   │   │   └── ResultView.tsx
│   │   └── dashboard/
│   │       ├── DashboardPage.tsx
│   │       ├── useStats.ts       # useLiveQuery de Dexie + domain/stats
│   │       ├── OverviewCards.tsx
│   │       ├── HistoryList.tsx
│   │       └── ConceptsToReview.tsx
│   │
│   └── components/               # UI genérica reutilizable
│       ├── Layout.tsx
│       ├── Markdown.tsx          # render de enunciados/explicaciones
│       └── ProgressBar.tsx
│
├── tests/                        # Vitest: parser y estadísticas
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts                # base: "/Estudio-MTC/"
```

### Por qué esta organización

- **`domain/`** no depende de nada: se puede testear sin navegador.
- **`content/`** y **`db/`** son adaptadores (Markdown e IndexedDB) que traducen
  al modelo de `domain/`. Cambiar Dexie por otra cosa no toca las pantallas.
- **`features/`** agrupa por pantalla, no por tipo de fichero.

## Añadir un test

Crea un `.md` en `content/tests/` siguiendo
[`docs/formato-tests.md`](docs/formato-tests.md). Al hacer push a `main`, el
workflow lo compila y publica.
