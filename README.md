# Mise

Application mobile de planification de repas pour étudiant·e·s : planning de la semaine, liste de courses générée et rangée par rayon, suivi du budget, prix par magasin.

## Stack

Expo (React Native) · TypeScript · Expo Router · Reanimated · expo-sqlite · Supabase

## Lancer le projet

```bash
npm install
npx expo start
```

Puis scanner le QR code avec Expo Go, ou lancer un simulateur.

## Scripts

```bash
npx tsc --noEmit        # vérification des types
npm run lint            # lint
npm test                # tests
npx expo export -p web  # version web
```

## Structure

```
app/          écrans (Expo Router)
components/   composants d'interface
features/     logique par domaine (planning, courses, magasins, budget)
db/           schéma et accès SQLite
supabase/     backend : migrations et fonctions
theme.ts      tokens du thème clair et sombre
```
