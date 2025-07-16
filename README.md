# Unix Filters

Ce projet a été réalisé pendant mon stage de troisième année de licence d'Informatique à l'Université de Lille. 

* Le projet [unixfilters-franceIOI](https://github.com/UnixFilters/unixfilters-franceIOI) qui contient la librairie pour la définition des blocs en Blockly/JavaScript
Il est composé de deux parties principales :\
        - le front en JavaScript qui utilise la libriarie Blockly de Google : [/public](public)\
        - le back qui permet l'exécution des commandes Bash en Python en utilisant le module subprocess : [/python_lib](python_lib)
* Le projet [checker](https://github.com/UnixFilters/checker) qui gère la logique d'exécution de la commande et son évaluation par rapport à une solution donnée.

## Getting started

### Mode développement

#### unixfilters-franceIOI
Cloner le repo unixfilters-franceIOI

```bash
git clone https://github.com/waningcrescendo/unixfilters-franceIOI.git
```


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

Dans un autre terminal, installer Node.js

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

#### checker
Cloner le repo
```bash
git clone https://github.com/UnixFilters/checker.git
```

Dans le fichier [server.py](./python_lib/server.py), changer le chemin 
```python
PATH_BASE = "../../../../../../unixfilters_checker/exemple_checker/tests" # Remplacer par le chemin vers le dossier tests du checker
PATH_GEN = os.path.join(PATH_BASE, "gen")
PATH_FILES = os.path.join(PATH_BASE, "files")
```

### Mode production
Ajouter les fichiers modifiés sur le SVN

## Arborescence
### Interface Blockly/JavaScript

[Voir l'aide](./docs/add_block.md)
```bash
.\
├── blocklyUnixFilters_lib.js # Librairie contenant la définition des blocs
├── index.css # Style de la page html
├── index.html # Contenu de la tâche
├── jsongenerator.js # Génération du code pour chaque bloc
├── task.js # Contient les paramètres de la tâche (blocs disponibles, nombre de blocs autorisés,...)
└── unixfilters.js # Logique de l'affichage et de l'envoi de la commande au serveur
```
### Librairie Python

[Voir l'aide](./docs/add_lib.md)
```bash
.\
├── commands.py # Librairie définissant les différents filtres et exécutant la commande
└── server.py # Reçoit le code généré par les blocs et utilise la librairie pour récupérer le résultat et le renvoyer au front
```

## Suite de la documentation
* [Documentation fonctions](https://unixfilters.github.io/unixfilters-docs/)
* [Documentation checker](https://github.com/UnixFilters/checker/blob/main/docs/documentation_checker.md
* [Mise en place d'une tâche](https://github.com/UnixFilters/unixfilters-franceIOI/blob/main/docs/init_task.md)
