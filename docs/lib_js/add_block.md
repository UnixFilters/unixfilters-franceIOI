# Ajouter un bloc

1. Dans le fichier [blocklyUnixFilters_lib.js], ajouter le bloc dans sa catégorie correspondante.\

Exemple : Pour ajouter l'option -b\[RANGE\] , il faut ajouter son flag et son type.

```javascript
const OPTIONS = [
  { flag: "v", type: "flag" },
  { flag: "k", type: "field_index" },
  { flag: "d", type: ["flag", "delimiter"] },
  (autres options...)
  { flag: "b", type: "field_index" },
];
```

Le bloc sera créé automatiquement grâce à la fonction makeOptionBlock(flag).

2. Dans le fichier [task.js], ajouter le nom du bloc. L'ordre du fichier correspond à l'ordre des blocs dans la boîte à outils.\

Exemple :

```javascript
function initTask(subTask) {
    includeBlocks: {
        generatedBlocks: {
            unixfilters: [
                "cat",
                "option_b_field_index"
            ],
        },
...
```
