# Unix Filters

Ce projet a été réalisé pendant mon stage de troisième année de licence d'Informatique à l'Université de Lille. Il est composé de deux parties principales :

- le front en JavaScript qui utilise la libriarie Blockly de Google : [/public](public)
- le back qui permet l'exécution des commandes Bash en Python en utilisant le module subprocess : [/python_lib](python_lib)

## Documentation détaillée

https://waningcrescendo.github.io/unixfilters-docs/

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
cd ../python_lib
```

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

Installer flask et lancer le serveur python dans un environnement virtuel

```bash
pip install flask-cors
```

```bash
python3 server.py
```

### Installer Node.js

Dans un autre terminal

#### Sur **Linux** (Debian/Ubuntu) :

```bash
sudo apt update
sudo apt install nodejs npm
```

#### Sur **macOS** :

```bash
brew install node
```

#### Sur **Windows** :

Télécharger et installer Node.js depuis [le site officiel](https://nodejs.org/).\

Vérifier l'installation :

```bash
node -v
npm -v
```

Installer les dépendances

```bash
npm install
```

À la racine du projet, lancer le serveur node

```bash
node server.js
```

URL en développement : http://localhost:3000

## Interface Blockly/JavaScript

[Voir l'aide](./docs/add_block.md)
.\
├── blocklyUnixFilters_lib.js --> librairie contenant la définition des blocs\
├── index.css --> style de la page html\
├── index.html --> contenu de la tâche\
├── jsongenerator.js --> génération du code pour chaque bloc\
├── task.js --> contient les paramètres de la tâche (blocs disponibles, nombre de blocs autorisés,...)\
└── unixfilters.js --> logique de l'affichage et de l'envoi de la commande au serveur

## Librairie Python

[Voir l'aide](./docs/add_lib.md)

.\
├── commands.py --> librairie définissant les différents filtres et exécutant la commande\
└── server.py --> reçoit le code généré par les blocs et utilise la librairie pour récupérer le résultat et le renvoyer au front
