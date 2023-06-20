# Buone pratiche per l'utilizzo del framework Lit

### 1. _Repeat_:

> Usare la direttiva **_repeat_** quando è necessario renderizzare una lista molto lunga o modificarla aggiungendogli e togliendogli uno o più elementi. Utilizzando un _map_ normale ogni volta che la lista viene aggiornata tutti gli elementi di essa devono essere rirenderizzati comportando un inutile utilizzo di risorse.
> Esempio usando il **_map_**:

```javascript
static properties = {
  colors: {},
};

constructor() {
  super();
  this.colors = ['red', 'green', 'blue'];
}

render() {
  return html`
    <ul>
      ${this.colors.map((color) =>
        html`<li style="color: ${color}">${color}</li>`
      )}
    </ul>
  `;
}
```

[DOCUMENTAZIONE](https://lit.dev/docs/templates/lists/#the-repeat-directive):

```js
repeat(items, keyFunction, itemTemplate)
```

- `items` &rarr; è un array o un iterabile
- `keyFunction`  &rarr; funzione che ottiene come argomento un singolo elemento e restituisce una chiave unica per identificare l'elemento
- `itemTemplate` &rarr; funzione che renderizza gli elementi utilizando l'elemnto e il suo indice, restituisce il `TemplateResult`

> Esempio usando la direttiva _repeat_:

```javascript
...
import {repeat} from 'lit/directives/repeat.js';
...

static properties = {
  employees: {},
};

constructor() {
  super();
  this.employees = [
    {
      id: 0,
      lastName: 'Rossi',
      firstName: 'Luca'
    },
    {
      id: 1,
      lastName: 'Bianchi',
      firstName: 'Sofia'
    },
    {
      id: 2,
      lastName: 'Verdi',
      firstName: 'Matteo'
    },
    {
      id: 3,
      lastName: 'Neri',
      firstName: 'Giulia'
    }
  ];
}

render() {
  return html`
    <ul>
      ${repeat(
        this.employees,
        (employee) => employee.id,
        (employee, index) => html`
          <li>${index}: ${employee.lastName}, ${employee.firstName}</li>
        `
      )}
    </ul>
  `;
}
```

### 2. Usare Built-in directives:

> Anziché usare costrutti js si possono usare delle direttive built-in in Lit come ad esempio:
>
> - [`when`](https://lit.dev/docs/templates/directives/#when) &rarr; renderizza un template tra due sulla base di una condizione (come `if/else`)
> - [`choose`](https://lit.dev/docs/templates/directives/#choose) &rarr; renderizza un template su molti basandosi su un valore (come `switch/case`)
> - [`map`](https://lit.dev/docs/templates/directives/#map) &rarr; Trasforma un iterabile con una funzione
> - [`repeat`](https://lit.dev/docs/templates/directives/#repeat) &rarr; Renderizza i valori da un iterabile nel DOM, con codifica facoltativa per abilitare la differenza dei dati e la stabilità del DOM
> - [`range`](https://lit.dev/docs/templates/directives/#range) &rarr; Crea un iterabile di numeri in una sequenza, utile per iterare un numero specifico di volte.