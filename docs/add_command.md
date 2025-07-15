# Ajouter une commande

1. Dans le fichier [commands.py], ajouter la fonction de la commande.

Exemple : Pour ajouter la commande awk

```python
def awk(arguments=None):
    run_command("awk", arguments=arguments)
```

#### Tester une tâche localement (pas à jour)

1. Générer un code Blockly depuis l'interface

2. Copier le code généré par les blocs dans solutoon.py
   (maintenant : Lors du clic sur le bouton **_Exécuter_**, le code est enregistré dans tests/gen/solution.py)
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

### Production (pas à jour)

Envoyer les fichiers sur le SVN (on verra plus tard)

## Interface Blockly/JavaScript

[Voir l'aide](../add_block.md)

## Librairie Python

[Voir l'aide](../docs/add_block.md)
