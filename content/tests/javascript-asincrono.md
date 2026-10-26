---
id: javascript-asincrono
title: JavaScript asíncrono
description: Promesas, async/await y el event loop.
category: JavaScript
difficulty: media
version: 1
shuffleQuestions: true
shuffleOptions: true
---

## ¿Qué imprime este código por consola?

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

- [ ] A, B, C, D
- [x] A, D, C, B
- [ ] A, D, B, C
- [ ] A, C, D, B

> El código síncrono se ejecuta primero (`A`, `D`). Después el event loop vacía
> la cola de **microtareas** (el `.then`, que imprime `C`) antes de pasar a la
> siguiente **macrotarea** (el `setTimeout`, que imprime `B`).

Etiquetas: Event loop, Microtareas, Promesas

## ¿Qué devuelve siempre una función declarada con `async`?

- [ ] El valor que aparezca en su `return`, sin modificar
- [x] Una `Promise`
- [ ] `undefined` si no hay `await` dentro
- [ ] Un objeto `Generator`

> Una función `async` **siempre** devuelve una promesa. Si haces `return 42`,
> la promesa se resuelve con `42`; si lanzas un error, la promesa se rechaza.

Etiquetas: async/await, Promesas

## ¿Qué método rechaza en cuanto **una** de las promesas falla?

- [x] `Promise.all`
- [ ] `Promise.allSettled`
- [ ] `Promise.any`
- [ ] Ninguno: todos esperan a que terminen todas

> `Promise.all` falla rápido (*fail-fast*): se rechaza con el primer error.
> `Promise.allSettled` espera a todas y nunca se rechaza, y `Promise.any` solo
> se rechaza si **todas** fallan.

Etiquetas: Promesas, Combinadores de promesas

## Dentro de un `try/catch`, ¿qué ocurre si haces `await` de una promesa rechazada?

- [ ] La función devuelve `undefined` en silencio
- [ ] Se lanza un error global que no se puede capturar
- [x] El rechazo se lanza como excepción y lo captura el `catch`
- [ ] El `await` se queda esperando indefinidamente

> `await` "desenvuelve" la promesa: si se resuelve, devuelve el valor; si se
> rechaza, **lanza** el motivo del rechazo como una excepción normal, que el
> bloque `catch` captura.

Etiquetas: async/await, Manejo de errores

## ¿Cuál es la forma correcta de lanzar dos peticiones independientes **en paralelo**?

- [ ] `const a = await fetch(u1); const b = await fetch(u2);`
- [x] `const [a, b] = await Promise.all([fetch(u1), fetch(u2)]);`
- [ ] `const a = fetch(await u1); const b = fetch(await u2);`
- [ ] `await (fetch(u1), fetch(u2));`

> Dos `await` seguidos ejecutan las peticiones **en serie**: la segunda no
> empieza hasta que termina la primera. Con `Promise.all` ambas arrancan a la
> vez y se espera a que terminen las dos.

Etiquetas: async/await, Combinadores de promesas, Rendimiento
