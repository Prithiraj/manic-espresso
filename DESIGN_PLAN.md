# Manic Espresso — Website Design Plan

**Status:** approved for implementation  
**Research baseline:** 3 September 2026  
**Business:** Manic Espresso, 27 Murray St, Como WA 6152

## 1. Evidence baseline

Publish only current, corroborated facts:

- Manic Espresso, cafe / coffee shop.
- 27 Murray St, Como WA 6152.
- Phone: +61 401 866 609.
- Hours: Monday–Saturday 7:00am–2:00pm; Sunday 8:00am–2:00pm.
- Current Google business signal at research time: 4.6/5 from 254 reviews.
- Current price signal: A$1–20.
- Current online-order menu includes items such as Omelette, Avocado Smash, Benedict, Açaí Bowl, Burger & Chips, yoghurt bowl and wraps.
- Repeated customer themes: friendly service, fair value, generous/filling food, good coffee and a peaceful/cozy atmosphere.

Do not publish unverified supplier, pet, parking, dietary/allergen, accessibility, booking or origin-story claims as first-party promises.

## 2. Audience

Primary: Como / South Perth locals choosing breakfast, brunch or coffee.  
Secondary: takeaway/order customers and weekend visitors deciding whether the cafe is worth a detour.

Decision sequence: **food appeal → value → open now/hours → location → menu → call/order**.

## 3. Conversion goals

Primary actions:

1. View menu.
2. Get directions.
3. Order online.
4. Call Manic.

Menu and directions must be visible quickly on mobile.

## 4. Creative direction

**Warm neighbourhood editorial.** The site should feel intimate, slightly eclectic, quietly stylish and approachable rather than luxury, techy or chain-like.

Core brand idea: **“A little neighbourhood cafe worth finding.”**

Use large editorial typography, warm paper surfaces, charcoal, small floral/chalk-inspired accents, real food photography and generous whitespace.

## 5. Color system

- Espresso Ink `#242321`
- Warm Paper `#F3EEE4`
- Milk `#FFFDF8`
- Roasted Brown `#624A3E`
- Floral Rose `#A86570`
- Antique Brass `#AD864D`
- Leaf Sage `#687364`

Food photography supplies most of the vivid colour.

## 6. Typography

Use a warm editorial serif stack for display type and a neutral system sans stack for UI/body. Avoid novelty handwriting for essential text. Decorative handwritten/chalk cues may appear only as accents.

## 7. Image strategy

Use real Manic Espresso business imagery wherever possible. Current build uses actual business-post imagery mirrored by FindGlocal because first-party originals were not supplied in the repository.

Production priority remains:

1. New commissioned photography.
2. Owner-supplied originals with commercial web rights.
3. Social/business-post images only after rights confirmation.

Do not use AI-generated food photography for production.

See `IMAGE_RIGHTS.md` for every image used in the current build.

## 8. Information architecture

Single focused home page:

- Hero
- Trust/proof strip
- Value proposition
- Menu highlights
- Real place / experience
- Differentiators / review themes
- Gallery
- Visit / hours / contact
- Final CTA
- Footer / social links

## 9. Section-by-section layout

### Header
Compact wordmark, Menu / Our Place / Visit links, Directions CTA. Mobile menu remains keyboard accessible.

### Hero
Real Manic food photography in an editorial collage. Copy: “A little neighbourhood cafe worth finding.” Show address and hours immediately.

### Proof strip
4.6 Google rating, 254 reviews and open-seven-days signal, explicitly marked as checked September 2026.

### Value proposition
Three evidence-backed themes: generous plates, warm welcome, quiet local find.

### Menu
Use only items visible on the current ordering menu. No invented prices. Link to live ordering platform as source of truth.

### Our place
Explain the relaxed, friendly customer experience without inventing a founder story.

### Social proof
Paraphrase recurring themes rather than copying large third-party review quotes.

### Gallery
Responsive editorial collage of real Manic food photography.

### Visit
Address, phone and verified hours in plain HTML plus Directions and Call actions.

### Final CTA
“Found your next breakfast spot?” with menu and directions.

## 10. Three.js / animation plan

Three.js is not required for the first implementation because real photography carries the story more effectively and keeps the site fast. Motion is limited to refined CSS/JS reveals, header state changes and small hover responses. If a future Three.js treatment is added, it should be a non-essential ambient layer only and must be disabled for reduced motion.

## 11. Responsive behavior

Mobile-first. At 320–430px the first viewport prioritises proposition, real food, Menu, Directions and opening-time cue. A small bottom quick-action bar exposes Menu and Directions without covering content. Desktop gains editorial asymmetry rather than different information.

## 12. Accessibility

Target WCAG 2.2 AA:

- semantic landmarks and heading structure;
- skip link;
- keyboard-operable navigation;
- visible focus states;
- 44px practical touch targets;
- sufficient contrast;
- meaningful alt text;
- no hover-only information;
- reduced-motion support;
- address/hours remain accessible if JS fails.

## 13. Performance

Static HTML + CSS + small vanilla JS. No framework, animation library, carousel package or social SDK. Remote photos use explicit dimensions and lazy loading below the fold. Essential content works without JavaScript.

Targets: LCP < 2.5s, CLS < 0.1, INP < 200ms under representative production testing.

## 14. SEO/local discovery

Title: **Manic Espresso | Breakfast, Brunch & Coffee in Como WA**  
Meta description focuses on location, menu, hours and directions.

Use `CafeOrCoffeeShop` JSON-LD with verified NAP, geo, hours, price range and menu link. Include canonical URL, Open Graph metadata, sitemap and robots file.

## 15. Rights/licensing notes

The current public preview uses real business-post imagery mirrored by FindGlocal. It is more authentic than stock or AI imagery, but commercial reuse rights have **not** been independently verified. Before a commercial launch, obtain originals or written confirmation from the rights holder.

No Google reviewer, Tripadvisor, Wanderlog or competitor imagery is intentionally embedded.

## 16. Implementation sequence

1. Build semantic static shell.
2. Apply mobile-first design system.
3. Add current, evidence-backed menu/business content.
4. Integrate real Manic photography.
5. Add restrained progressive enhancement.
6. Add SEO / OG / JSON-LD / sitemap.
7. Validate keyboard/reduced-motion/responsiveness.
8. Deploy with GitHub Pages Actions workflow.
9. Replace or formally clear imagery before commercial launch.

## 17. Acceptance criteria

- Visually specific to Manic Espresso rather than a generic cafe template.
- Real Manic photography is central to the page.
- No invented prices, policies, suppliers, awards or founder story.
- Menu and Directions are immediately accessible on mobile.
- Address, phone and hours match the evidence baseline.
- Fully usable from 320px upward and with keyboard navigation.
- Reduced motion works.
- Essential information works without JavaScript.
- SEO metadata and `CafeOrCoffeeShop` JSON-LD are present.
- Image rights status is documented and replacement/clearance requirement is explicit.
