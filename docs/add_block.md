# Ajouter un bloc

## Ajouter un bloc OPTION

1. Dans le fichier [blocklyUnixFilters_lib.js], ajouter le bloc dans sa catégorie correspondante.\

Exemple : Pour ajouter l'option -b\[RANGE\] , il faut ajouter son flag et son type.

```javascript
const OPTIONS = [
  { flag: "d", type: ["flag", "delimiter"] },
  (autres options...)
  { flag: "b", type: "field_index" },
];
```

Le bloc sera créé automatiquement grâce à la fonction makeOptionBlock(flag).

2. Dans le fichier [task.js], ajouter le nom du bloc. L'ordre du fichier correspond à l'ordre des blocs dans la boîte à outils. Le bloc aura ce nommage **option_lettre_type** où le type peut être flag/delimiter/field_index.

Exemple :

```javascript
function initTask(subTask) {
    includeBlocks: {
        generatedBlocks: {
            unixfilters: [
                "option_b_field_index"
            ],
        },
...
```

## Ajouter un bloc COMMAND

1. Dans le fichier [blocklyUnixFilters_lib.js], ajouter le bloc dans sa catégorie correspondante.\

Exemple : Pour ajouter une commande nommée commandeexemple, il faut ajouter son nom à la liste.

```javascript
const COMMAND_NAMES = [
    "cat",
    (autres commandes...),
    "commande_exemple"
    ];
```

Le bloc sera créé automatiquement grâce à la fonction makeUnixFilterBlock(commandName).

2. Dans le fichier [task.js], ajouter le nom du bloc. L'ordre du fichier correspond à l'ordre des blocs dans la boîte à outils. Le bloc aura ce nommage **nomdelacommande**

Exemple :

```javascript
function initTask(subTask) {
    includeBlocks: {
        generatedBlocks: {
            unixfilters: [
                "cat",
                "commande_exemple"
            ],
        },
...
```

Lors de l'ajout d'une commande, il ne faut pas oublier de créer sa fonction correspondante dans le fichier commands.py [voir la doc associée](../lib_py/add_command.md)

## Ajouter un bloc SYMBOL

1. Dans le fichier [blocklyUnixFilters_lib.js], ajouter le bloc dans sa catégorie correspondante.\

Exemple : Pour ajouter le symbole symboleExemple, il faut ajouter son nom et sa couleur.

```javascript
const SYMBOL_NAMES = [
  { name: "symbol_greater_than", colour: 25 },
  (autres symboles...)
  { name: "symbole_exemple", colour: 90 },
];
```

Le bloc sera créé automatiquement grâce à la fonction makeSymbolBlock(symbolObject).

2. Dans le fichier [task.js], ajouter le nom du bloc. L'ordre du fichier correspond à l'ordre des blocs dans la boîte à outils. Le bloc aura ce nommage **symbol_nomdusymbole**

Exemple :

```javascript
function initTask(subTask) {
    includeBlocks: {
        generatedBlocks: {
            unixfilters: [
                "cat",
                "symbol_symboleExemple"
            ],
        },
...
```

## Ajouter un nouveau bloc

Si aucune des structures de blocs ne vous convient, vous pouvez ajouter un nouveau bloc. Dans le fichier [blocklyUnixFilters_lib.js], la création du bloc peut se faire :

- Avec une fonction (voir la fonction makeGrepBlock())
- Avec une définition classique (voir le bloc text_input)

```javascript
        {
          name: "nom_du_bloc",
          blocklyJson: {
            message0: `%1 %2`, // Affichage des arguments
            args0: [
            // Ajouter un argument text input
              {
                type: "field_input", // type de l'argument : saisie de texte
                name: "PARAM_1", // nom du paramètre (à laisser car on peut de ce fait réutiliser les fonctions d'extraction)
                text: "", // texte par défaut dans l'input
              },
            // Ajouter une encoche
              {
                type: "input_value",
                name: "PARAM_0",
              },
            ],
            // pièce de puzzle sortante
            output: null,
            colour: 165,
          },
        },
```
