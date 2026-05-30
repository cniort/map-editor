# File de validation — les décisions qui t'attendent

> Le chef-de-projet **n'interrompt pas** ton flux. Quand il rencontre une décision
> qui requiert ton arbitrage (garde-fou `valider`), il la **consigne ici** et
> continue à avancer sur tout ce qu'il peut faire en autonomie.
>
> Au bon moment, tu lances `/valider` : tu tranches **tout le lot en une session**,
> tes décisions sont enregistrées, et l'agent **reprend la main** sur la base de tes choix.

## Format d'une entrée

```
### [Priorité] <projet> — <titre court de la décision>
- **Type** : <garde-fou concerné, ex. choix_architecture_majeur>
- **Contexte** : 2-4 lignes, assez pour décider sans aller fouiller le code.
- **Options** :
  - A) <option> _(recommandé)_ — implication
  - B) <option> — implication
- **Bloque** : <ce qui est en attente de cette décision, ou "rien d'autre">
- **Ajouté le** : AAAA-MM-JJ
- **Décision** : ⏳ en attente        # ⏳ en attente | ✅ <choix + date> | ❌ rejeté
```

## Règles
- Une décision **résolue** (`✅`/`❌`) reste ici jusqu'au prochain rapport, puis est archivée dans le journal.
- Les entrées sont triées par **priorité du projet** puis par ancienneté.
- Si une décision en bloque d'autres, l'indiquer dans **Bloque** pour que tu saisisses l'effet de levier.

---

## En attente

_(vide pour l'instant — le chef-de-projet remplira cette section)_
