# Unix Filters

Ce projet a été réalisé pendant mon stage de troisième année de licence d'Informatique à l'Université de Lille. Il est composé de deux parties principales :

- le front en JavaScript qui utilise la libriarie Blockly de Google : [/public](public)
- le back qui permet l'exécution des commandes Bash en Python en utilisant le module subprocess : [/python_lib](python_lib)

## Getting started

Cloner le repo

```bash
git clone https://github.com/waningcrescendo/unixfilters-franceIOI.git
```

### Mode développement

Ajouter le repo bebras-modules dans le dossier public

```bash
cd unixfilters-franceIOI/public
git clone https://github.com/France-ioi/bebras-modules.git
```

Mettre en place l'environnement virtuel pour le serveur Python

```bash
python3 -m venv venv
```

- Sur **Linux/macOS** :

```bash
source venv/bin/activate
```

- Sur **Windows** :

```bash
venv\Scripts\activate
```

Lancer le serveur python dans un environnement virtuel

```bash
python3 server.py
```

Lancer le serveur node à la racine

```bash
node server.js
```

URL en développement : http://localhost:3000

#### Tester une tâche localement

1. Générer un code Blockly depuis l'interface

2. Lors du clic sur le bouton **_Exécuter_**, le code est enregistré dans tests/gen/solution.py
   Exemple :

```python
cut(["-d", " ", "-f", "2,4", "commandes.txt"])
sort(["-t", "' '", "-k", "2,2nr"])
head(["-n", "5"])
```

3. Lancer le test :

```bash
python3 tests/gen/commands.py < tests/files/test01.in > tests/files/test01.solout
python3 tests/gen/checker.py tests/files/test01.solout tests/files/test01.in tests/files/test01.out
```

### Production

Envoyer les fichiers sur le SVN (on verra plus tard)

## Interface Blockly/JavaScript

.\
├── blocklyUnixFilters_lib.js --> librairie contenant la définition des blocs\
├── index.css --> style de la page html\
├── index.html --> contenu de la tâche\
├── jsongenerator.js --> génération du code pour chaque bloc\
├── task.js --> contient les paramètres de la tâche (blocs disponibles, nombre de blocs autorisés,...)\
└── unixfilters.js --> logique de l'affichage et de l'envoi de la commande au serveur\

### Aide

- [Ajouter un bloc](./docs/lib_js/add_block.md)

## Librairie Python

.\
├── commands.py --> librairie définissant les différents filtres et exécutant la commande\
└── server.py --> reçoit le code généré par les blocs et utilise la librairie pour récupérer le résultat et le renvoyer au front\

PAS PAREIL QUAND LE BLOC EST UNE COMMANDE OU UN SYMBOLE

### Aide

- [Ajouter une commande](./docs/lib_py/add_command.md)
