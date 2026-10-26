# Estudio MTC

Aplicación web de tests multirespuesta que funciona íntegramente en el
navegador. Los tests se escriben en Markdown dentro del repositorio y los
resultados se guardan en local (IndexedDB vía Dexie.js). Se publica como sitio
estático en GitHub Pages.

## Stack

- **React 19 + Vite + TypeScript** (SPA estática)
- **Tailwind CSS v4**
- **Dexie.js** para IndexedDB
- **Markdown**: un plugin de Vite parsea y valida los `.md` durante el build;
  el navegador recibe JSON ya validado. Enunciados y explicaciones se
  renderizan con `marked`
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
├── plugins/
│   └── content.ts                # plugin de Vite: parsea los .md en el build
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                  # punto de entrada
│   ├── App.tsx                   # rutas (HashRouter)
│   ├── index.css                 # Tailwind + plugin typography
│   │
│   ├── domain/                   # lógica pura, sin React ni Dexie
│   │   ├── types.ts              # Test, Question, Attempt, AnswerRecord
│   │   ├── quiz.ts               # barajar, corregir, puntuar
│   │   └── stats.ts              # % global, historial, conceptos a repasar
│   │
│   ├── content/                  # capa de datos: Markdown → dominio
│   │   ├── parseTest.ts          # parser + validación del formato
│   │   └── catalog.ts            # tests cargados + tests de repaso por etiqueta
│   │
│   ├── db/                       # capa de persistencia: IndexedDB
│   │   ├── database.ts           # esquema Dexie y versiones
│   │   ├── attempts.ts           # repositorio: guardar/leer/borrar intentos
│   │   └── useAttempts.ts        # hook reactivo (useLiveQuery)
│   │
│   ├── features/                 # pantallas, cada una autocontenida
│   │   ├── catalog/              # listado de tests (CatalogPage, TestCard)
│   │   ├── quiz/                 # test en curso (QuizPage, useQuiz, QuestionView,
│   │   │                         #   OptionButton, ResultView)
│   │   └── dashboard/            # estadísticas (DashboardPage, OverviewCards,
│   │                             #   ConceptsToReview, HistoryList)
│   │
│   ├── components/               # UI genérica: Layout, Button, Markdown,
│   │                             #   ProgressBar, TagList, NotFound
│   └── lib/
│       └── format.ts             # fechas, duraciones, plurales
│
├── tests/                        # Vitest: parser, quiz, estadísticas y contenido
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

## Funcionalidades

- **Tests**: listado agrupado por categoría, con la última y la mejor nota de
  cada test.
- **Realizar un test**: una pregunta por pantalla, feedback inmediato en verde o
  rojo, explicación y etiquetas. Atajos de teclado: `1`–`9` o `A`–`J` para
  responder, `Enter` o `→` para pasar a la siguiente.
- **Resultado**: nota, aciertos y fallos, y repaso de las preguntas falladas.
- **Estadísticas**: porcentaje global, historial y *conceptos a repasar*.
- **Repaso por concepto** (`#/repaso/<etiqueta>`): test con todas las preguntas
  de cualquier test que tengan esa etiqueta.

### Cómo se priorizan los conceptos a repasar

Para cada etiqueta con algún fallo se calcula:

```
prioridad = tasa de fallo reciente × log2(1 + nº de fallos)
```

La tasa de fallo reciente pondera cada respuesta según su antigüedad (pierde la
mitad de su peso cada 14 días). Así, un concepto que fallabas pero que ahora
aciertas baja solo en la lista. El logaritmo hace que acumular fallos pese más
sin que los conceptos muy preguntados acaparen la lista. La lógica está en
`src/domain/stats.ts`.

> Los datos se guardan en IndexedDB **de cada navegador**: no se sincronizan
> entre dispositivos y se pierden si borras los datos del sitio.

## Añadir un test

Crea un `.md` en `content/tests/` siguiendo
[`docs/formato-tests.md`](docs/formato-tests.md). Al hacer push a `main`, el
workflow lo compila y publica.

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo en http://localhost:5173/Estudio-MTC/
npm test           # tests (incluye la validación de todos los .md)
npm run build      # tests + typecheck + build estático en dist/
npm run preview    # sirve dist/ para probar el build
```

## Despliegue en GitHub Pages

El despliegue es automático con `.github/workflows/deploy.yml`:

1. En GitHub, ve a **Settings → Pages → Build and deployment → Source** y
   elige **GitHub Actions** (solo hay que hacerlo una vez).
2. Haz push a `main`. El workflow ejecuta `npm run build` y publica `dist/`.
3. La web queda en `https://<usuario>.github.io/Estudio-MTC/`.

También se puede lanzar a mano desde la pestaña **Actions → Deploy to GitHub
Pages → Run workflow**.

> Si renombras el repositorio, cambia `base` en `vite.config.ts` para que
> coincida con el nuevo nombre.
