import OpenAI from "openai";

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
