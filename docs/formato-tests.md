# Formato de los ficheros de test

Cada test es un fichero `.md` dentro de `content/tests/`. El nombre del fichero
no importa para la app (se usa el `id` del frontmatter), pero conviene que
coincidan.

El formato está pensado para que el fichero **se lea bien en GitHub** (las
opciones se ven como casillas marcadas/desmarcadas) y para que se pueda
validar de forma estricta al compilar.

## 1. Frontmatter (metadatos del test)

```yaml
---
id: javascript-asincrono     # obligatorio · único · kebab-case · NO cambiarlo nunca
title: JavaScript asíncrono  # obligatorio
description: Texto corto     # opcional
category: JavaScript         # opcional · agrupa tests en la pantalla de inicio
difficulty: media            # opcional · baja | media | alta
version: 1                   # opcional · súbelo si cambias preguntas a fondo
shuffleQuestions: true       # opcional · por defecto false
shuffleOptions: true         # opcional · por defecto false
---
```

> El `id` es la clave con la que se guardan los resultados en IndexedDB. Si lo
> cambias, el historial anterior de ese test queda "huérfano".

## 2. Preguntas (cuerpo del Markdown)

Cada pregunta empieza con un encabezado de nivel 2 y termina donde empieza la
siguiente (o al final del fichero):

````markdown
## Enunciado de la pregunta (admite `código` y **negrita**)

Párrafos o bloques de código opcionales que forman parte del enunciado.

```js
console.log("hola");
```

- [ ] Opción incorrecta
- [x] Opción correcta
- [ ] Otra opción incorrecta

> Explicación de la respuesta. Puede ocupar varias líneas;
> cada una empieza por `>`.

Etiquetas: Concepto A, Concepto B
````

| Parte        | Sintaxis                          | Reglas                                                        |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| Enunciado    | `## texto` + bloque opcional      | Todo lo que hay entre el `##` y la primera opción.            |
| Opciones     | `- [ ]` / `- [x]`                 | Mínimo 2. **Exactamente una** marcada con `[x]`.              |
| Explicación  | Líneas que empiezan por `>`       | Obligatoria. Se muestra tras responder.                       |
| Etiquetas    | `Etiquetas: a, b, c`              | Obligatoria, ≥ 1. Separadas por comas. Alimentan el dashboard.|

### Reglas de parseo

- Los bloques de código con ``` se respetan: una línea `- [ ]` o `## ` dentro de
  un bloque de código **no** se interpreta como opción o pregunta.
- Las etiquetas se normalizan (espacios recortados, comparación sin
  distinguir mayúsculas), así que `Promesas` y `promesas` cuentan como el mismo
  concepto. Usa siempre la misma grafía para que el dashboard las muestre bien.
- Cada pregunta recibe un identificador estable `"<id-del-test>#<hash>"`
  calculado a partir del enunciado. Puedes reordenar preguntas sin perder sus
  estadísticas; si reescribes el enunciado, cuenta como pregunta nueva.
- Si un fichero no cumple el formato, el build falla con un mensaje que indica
  fichero, pregunta y motivo.
