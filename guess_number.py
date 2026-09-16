#!/usr/bin/env python3
"""Jeu du nombre mystère : devine le nombre choisi au hasard par l'ordinateur."""

import random


def jouer(minimum: int = 1, maximum: int = 100, essais_max: int = 7) -> None:
    nombre_secret = random.randint(minimum, maximum)

    print(f"Je pense à un nombre entre {minimum} et {maximum}.")
    print(f"Tu as {essais_max} essais pour le trouver. Bonne chance !\n")

    for essai in range(1, essais_max + 1):
        try:
            proposition = int(input(f"Essai {essai}/{essais_max} : "))
        except ValueError:
            print("Merci d'entrer un nombre entier.")
            continue

        if proposition == nombre_secret:
            print(f"\n🎉 Bravo ! Tu as trouvé {nombre_secret} en {essai} essai(s) !")
            return
        elif proposition < nombre_secret:
            print("C'est plus grand.")
        else:
            print("C'est plus petit.")

    print(f"\n😢 Dommage, tu as épuisé tes essais. Le nombre était {nombre_secret}.")


def main() -> None:
    rejouer = "o"
    while rejouer.lower() in ("o", "oui", "y", "yes"):
        jouer()
        rejouer = input("\nRejouer ? (o/n) : ")


if __name__ == "__main__":
    main()
