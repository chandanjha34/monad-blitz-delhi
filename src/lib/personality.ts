import OpenAI from "openai";
import type { SocialLinks } from "@/lib/types";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const taglines = [
  "Collecting vibes at chain speed",
  "Scanning souls, minting memories",
  "Monad speedrunner of social energy",
  "Playful human, onchain forever",
  "Turning handshakes into collectibles",
];

const traitPool = [
  "Curious",
  "Builder",
  "Explorer",
  "Friendly",
  "Creative",
  "Chaotic Good",
  "Fast Learner",
  "Meme Wizard",
  "Hackathon Hero",
  "Super Connector",
];

function hashName(name: string): number {
  return name
    .split("")
    .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
}

export function generatePersonality(name: string) {
  const h = hashName(name);
  const tagline = taglines[h % taglines.length];
  const traits = [
    traitPool[h % traitPool.length],
    traitPool[(h + 3) % traitPool.length],
    traitPool[(h + 7) % traitPool.length],
  ];

  return { tagline, traits };
}

export function createFallbackPoster(name: string, tagline: string, traits: string[]) {
  const safeName = name.replace(/[<>]/g, "");
  const safeTagline = tagline.replace(/[<>]/g, "");
  const traitText = traits.join(" • ");
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600'>
    <defs>
      <linearGradient id='g' x1='0%' x2='100%' y1='0%' y2='100%'>
        <stop offset='0%' stop-color='#34d399' />
        <stop offset='50%' stop-color='#f59e0b' />
        <stop offset='100%' stop-color='#f43f5e' />
      </linearGradient>
    </defs>
    <rect width='1200' height='1600' rx='60' fill='url(#g)' />
    <circle cx='1040' cy='180' r='120' fill='#ffffff88'/>
    <circle cx='170' cy='1380' r='140' fill='#ffffff66'/>
    <text x='100' y='220' font-family='Verdana' font-size='44' fill='#111'>Proof Go</text>
    <text x='100' y='320' font-family='Verdana' font-size='112' font-weight='700' fill='#111'>${safeName}</text>
    <text x='100' y='410' font-family='Verdana' font-size='42' fill='#1f2937'>${safeTagline}</text>
    <rect x='90' y='520' width='1020' height='180' rx='34' fill='#ffffffcc'/>
    <text x='130' y='625' font-family='Verdana' font-size='38' fill='#111'>${traitText}</text>
    <text x='100' y='1470' font-family='Verdana' font-size='40' fill='#111'>Instant finality powered by Monad ⚡</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

type SocialSignals = {
  avatarUrl?: string;
  snippets: string[];
};

export type PokemonPersona = {
  oneLiner: string;
  creativeComment: string;
  pokemonNature: string;
  pokemonType: string;
};

function normalizeSocialUrl(raw?: string): string | null {
  if (!raw) {
    return null;
  }

  const value = raw.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("@")) {
    return `https://x.com/${value.slice(1)}`;
  }

  if (/^[a-zA-Z0-9_\.]+$/.test(value)) {
    return `https://x.com/${value}`;
  }

  return `https://${value}`;
}

async function fetchPageMeta(url: string): Promise<{ title?: string; description?: string; image?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ProofGoBot/1.0)",
      },
    });

    if (!response.ok) {
      return {};
    }

    const html = await response.text();
    const pick = (pattern: RegExp) => {
      const match = html.match(pattern);
      return match?.[1]?.trim();
    };

    const title = pick(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      ?? pick(/<title[^>]*>([^<]+)<\/title>/i);
    const description = pick(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      ?? pick(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const image = pick(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    return { title, description, image };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

async function collectSocialSignals(name: string, socials: SocialLinks): Promise<SocialSignals> {
  const urls = [
    normalizeSocialUrl(socials.x),
    normalizeSocialUrl(socials.linkedin),
    normalizeSocialUrl(socials.instagram),
  ].filter(Boolean) as string[];

  const snippets: string[] = [];
  let avatarUrl: string | undefined;

  for (const url of urls.slice(0, 3)) {
    const meta = await fetchPageMeta(url);
    if (meta.title) {
      snippets.push(meta.title);
    }
    if (meta.description) {
      snippets.push(meta.description);
    }
    if (!avatarUrl && meta.image) {
      avatarUrl = meta.image;
    }
  }

  if (socials.resume?.trim()) {
    snippets.push(socials.resume.trim());
  }

  if (snippets.length === 0) {
    snippets.push(`${name} is a curious internet explorer building friendships on Monad.`);
  }

  return { avatarUrl, snippets: snippets.slice(0, 6) };
}

function parsePersonaJson(text: string): PokemonPersona | null {
  try {
    const parsed = JSON.parse(text) as Partial<PokemonPersona>;
    if (
      typeof parsed.oneLiner === "string" &&
      typeof parsed.creativeComment === "string" &&
      typeof parsed.pokemonNature === "string" &&
      typeof parsed.pokemonType === "string"
    ) {
      return {
        oneLiner: parsed.oneLiner.slice(0, 120),
        creativeComment: parsed.creativeComment.slice(0, 200),
        pokemonNature: parsed.pokemonNature.slice(0, 60),
        pokemonType: parsed.pokemonType.slice(0, 40),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function fallbackPersona(name: string, traits: string[]): PokemonPersona {
  const seed = traits.join(" ").toLowerCase();
  const pokemonType =
    seed.includes("builder") || seed.includes("hero")
      ? "Steel"
      : seed.includes("creative") || seed.includes("meme")
        ? "Psychic"
        : "Electric";

  return {
    oneLiner: `${name} enters the arena with Monad-speed curiosity.`,
    creativeComment: `You are not seeing a human, this is a real-time encyclopedia in motion.`,
    pokemonNature: "Bold Strategist",
    pokemonType,
  };
}

async function generatePersonaFromSignals(
  name: string,
  tagline: string,
  traits: string[],
  signals: SocialSignals,
): Promise<PokemonPersona> {
  if (!openai) {
    return fallbackPersona(name, traits);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are generating playful Pokemon-style identity card text for a networking app. Return strict JSON with keys: oneLiner, creativeComment, pokemonNature, pokemonType.",
        },
        {
          role: "user",
          content: JSON.stringify({
            name,
            tagline,
            traits,
            socialSignals: signals.snippets,
            styleHint: "Creative, fun, internet-native, slightly dramatic but friendly.",
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackPersona(name, traits);
    }

    return parsePersonaJson(raw) ?? fallbackPersona(name, traits);
  } catch {
    return fallbackPersona(name, traits);
  }
}

async function generateCartoonFromSignals(
  name: string,
  persona: PokemonPersona,
  signals: SocialSignals,
): Promise<string | undefined> {
  if (!openai) {
    return signals.avatarUrl;
  }

  try {
    const avatarHint = signals.avatarUrl
      ? `Use the user's public profile image as reference style hint: ${signals.avatarUrl}`
      : "No profile image reference is available.";

    const prompt = `Create a cartoon portrait avatar card art for ${name}. 
Nature: ${persona.pokemonNature}. Type: ${persona.pokemonType}. 
The style should resemble collectible monster-trainer card art. 
${avatarHint}
Result should be chest-up portrait, expressive face, clean background, bright color palette.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return response?.data?.[0]?.url ?? signals.avatarUrl;
  } catch {
    return signals.avatarUrl;
  }
}

export function createPokemonCardPoster(
  name: string,
  tagline: string,
  traits: string[],
  persona: PokemonPersona,
  cartoonImageUrl?: string,
) {
  const safeName = name.replace(/[<>]/g, "");
  const safeTagline = tagline.replace(/[<>]/g, "");
  const safeComment = persona.creativeComment.replace(/[<>]/g, "");
  const safeOneLiner = persona.oneLiner.replace(/[<>]/g, "");
  const safeNature = persona.pokemonNature.replace(/[<>]/g, "");
  const safeType = persona.pokemonType.replace(/[<>]/g, "");
  const traitText = traits.join(" • ").replace(/[<>]/g, "");
  const imageBlock = cartoonImageUrl
    ? `<image href='${cartoonImageUrl}' x='96' y='238' width='1008' height='640' preserveAspectRatio='xMidYMid slice' />`
    : `<rect x='96' y='238' width='1008' height='640' fill='#d1fae5' />`;

  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1600'>
    <defs>
      <linearGradient id='foil' x1='0%' x2='100%' y1='0%' y2='100%'>
        <stop offset='0%' stop-color='#fef08a' />
        <stop offset='45%' stop-color='#f59e0b' />
        <stop offset='100%' stop-color='#fb7185' />
      </linearGradient>
      <linearGradient id='cardBg' x1='0%' x2='0%' y1='0%' y2='100%'>
        <stop offset='0%' stop-color='#fff8dc' />
        <stop offset='100%' stop-color='#ffe8b6' />
      </linearGradient>
    </defs>

    <rect x='16' y='16' width='1168' height='1568' rx='54' fill='url(#foil)' stroke='#111' stroke-width='10'/>
    <rect x='52' y='52' width='1096' height='1496' rx='42' fill='url(#cardBg)' stroke='#111' stroke-width='5'/>

    <rect x='90' y='92' width='1020' height='112' rx='24' fill='#fff' stroke='#111' stroke-width='4'/>
    <text x='118' y='164' font-family='Verdana' font-size='60' font-weight='700' fill='#111'>${safeName}</text>
    <text x='980' y='164' font-family='Verdana' font-size='38' font-weight='700' fill='#111' text-anchor='end'>HP 99</text>

    <rect x='90' y='232' width='1020' height='652' rx='24' fill='#fff' stroke='#111' stroke-width='4'/>
    ${imageBlock}

    <rect x='90' y='904' width='1020' height='520' rx='24' fill='#fff' stroke='#111' stroke-width='4'/>
    <text x='118' y='966' font-family='Verdana' font-size='34' fill='#111'>Type: ${safeType}</text>
    <text x='118' y='1014' font-family='Verdana' font-size='30' fill='#111'>Nature: ${safeNature}</text>
    <text x='118' y='1064' font-family='Verdana' font-size='30' fill='#111'>${safeOneLiner}</text>

    <rect x='110' y='1090' width='980' height='162' rx='18' fill='#fef9c3' stroke='#111' stroke-width='3'/>
    <text x='132' y='1140' font-family='Verdana' font-size='28' fill='#111'>${safeComment}</text>

    <text x='118' y='1294' font-family='Verdana' font-size='26' fill='#111'>Traits: ${traitText}</text>
    <text x='118' y='1340' font-family='Verdana' font-size='24' fill='#111'>Tagline: ${safeTagline}</text>

    <text x='90' y='1476' font-family='Verdana' font-size='28' fill='#111'>Proof Go • Monad Testnet ⚡</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function buildPokemonIdentityCard(
  name: string,
  tagline: string,
  traits: string[],
  socials: SocialLinks,
) {
  const signals = await collectSocialSignals(name, socials);
  const persona = await generatePersonaFromSignals(name, tagline, traits, signals);
  const cartoonImageUrl = await generateCartoonFromSignals(name, persona, signals);
  const posterUrl = createPokemonCardPoster(name, tagline, traits, persona, cartoonImageUrl);

  return {
    posterUrl,
    persona,
    cartoonImageUrl: cartoonImageUrl ?? null,
    sourceAvatarUrl: signals.avatarUrl ?? null,
    sourceSignals: signals.snippets,
  };
}

export async function generatePosterWithAI(
  name: string,
  tagline: string,
  traits: string[],
): Promise<string> {
  if (!openai) {
    return createFallbackPoster(name, tagline, traits);
  }

  try {
    const prompt = `Create a vibrant, playful social identity card for "${name}" on Monad blockchain. 
    Tagline: "${tagline}"
    Traits: ${traits.join(", ")}
    
    Style: Bright, sticker-style aesthetic with rounded corners, gradient background (greens, oranges, pinks), bold typography, fun emojis scattered throughout. Show Monad lightning bolt ⚡ somewhere. 
    Include the name prominently, tagline below, traits as badges. Modern, Web3 vibe but playful like a dating app profile meets NFT collectible.
    
    Make it look like an instant identity card someone would be excited to collect.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = response?.data?.[0]?.url;
    if (!imageUrl) {
      return createFallbackPoster(name, tagline, traits);
    }

    return imageUrl;
  } catch (error) {
    console.error("DALL-E generation failed, using fallback:", error);
    return createFallbackPoster(name, tagline, traits);
  }
}
