This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Make & Wish : comment une carte est composée

1. **Formulaire** (`app/create/page.tsx`) : occasion, destinataire (prénom + lien), ton, message facultatif, photo.
2. **Profil d'occasion** (`lib/cards/occasion-profile.ts`) : chaque occasion a ses mises en page, ses palettes validées,
   son kit de décors (houx et ruban pour Noël, fleurs en papier pour la fête des mères, ballons et cadeaux pour un anniversaire…).
3. **Gemini** (`lib/ai/generate-card-designs.ts`) définit le concept graphique : idée, papier, typographie, décors et positions,
   kicker, titre, message, signature. Les mises en page et palettes sont tirées dans le profil pour garantir deux cartes différentes.
4. **Garde-fous** (`finalizeDesign`) : contraste vérifié, décors incohérents retirés, décors indispensables ajoutés,
   typographie compatible avec la mise en page.
5. **Rendu React** (`components/cards/`) : `decorations.tsx` dessine chaque décor en SVG (houx, baies, ruban de satin,
   fleurs et feuillages en papier découpé, tulipes, coffrets, ballons, cœurs, étoiles, confettis, cadre) et
   `card-renderer.tsx` assemble quatre mises en page : papeterie de luxe, affiche éditoriale, papier découpé floral, scène festive.
   Les tailles sont en `cqw` : la carte est identique en vignette, en aperçu, à l'impression et à l'export.

Configurez `GEMINI_API_KEY` côté serveur (jamais en `NEXT_PUBLIC_`) ; `GEMINI_MODEL` est optionnel (défaut `gemini-2.5-flash`).

La carte choisie est stockée en JSON dans la colonne `cards.poem` : les anciennes cartes texte continuent de s'afficher
grâce à `normalizeCardDesign`. Les nouveaux champs du schéma (`paper`, `content.kicker`, nouveaux types de décors) sont optionnels.

### Ajouter une occasion ou un décor

- Occasion : ajouter l'entrée dans `lib/events.ts` et `OCCASION_PROFILES`.
- Décor : ajouter le type dans `lib/schemas/card-design.ts`, dessiner le SVG et ses ancrages dans `components/cards/decorations.tsx`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
