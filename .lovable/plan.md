## Correção do cálculo de IMC no Teste de Dosha

**Arquivo:** `src/pages/TesteDeDosha.tsx` (linhas 219–223)

Trocar o parse atual da altura para aceitar vírgula como separador decimal.

**De:**
```ts
// IMC modifier
let altura = parseFloat(info.altura);
const peso = parseFloat(info.peso);
if (altura > 3) altura = altura / 100; // cm to m
const imc = peso / (altura * altura);
```

**Para:**
```ts
// IMC modifier
const alturaStr = String(info.altura).trim().replace(',', '.');
const alturaNum = parseFloat(alturaStr);
const altura = alturaNum > 3 ? alturaNum / 100 : alturaNum;
const peso = parseFloat(info.peso);
const imc = peso / (altura * altura);
```

Aceita `1,62`, `1.62` e `162`. Nenhuma outra lógica do teste é alterada.