import { ImageResponse } from "next/og";

// Share images for Learn pages (1200x630, the size LinkedIn, X, Facebook, iMessage and Slack all expect).
// One consistent card: brand mark, a short label, a large title with the "like you're 5" accent, and company logos.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

const BG = "#05070d";

type Font = { name: string; data: ArrayBuffer; weight: 500 | 800; style: "normal" };

/** Inter 500 and 800 from Google Fonts (served as TTF, which the image renderer needs). Falls back to the default font. */
async function interFonts(): Promise<Font[]> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Inter:wght@500;800", { next: { revalidate: 2592000 } })).text();
    const urls = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?url\((https:[^)]+\.ttf)\)/g)];
    const fonts = await Promise.all(
      urls.map(async ([, weight, url]) => ({
        name: "Inter",
        data: await (await fetch(url, { next: { revalidate: 2592000 } })).arrayBuffer(),
        weight: Number(weight) as 500 | 800,
        style: "normal" as const,
      })),
    );
    return fonts.filter((font) => font.weight === 500 || font.weight === 800);
  } catch {
    return [];
  }
}

/** A company logo as a data URL, or null when the logo host has none. Cached for a week. */
async function logoData(symbol: string): Promise<string | null> {
  try {
    const response = await fetch(`https://images.financialmodelingprep.com/symbol/${symbol.replace(".", "-")}.png`, {
      next: { revalidate: 604800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok || !(response.headers.get("content-type") ?? "").startsWith("image/")) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${response.headers.get("content-type")};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function Logo({ symbol, src }: { symbol: string; src: string | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 132, height: 132, borderRadius: 32, background: "#ffffff", boxShadow: "0 20px 50px rgba(0,0,0,.45)", overflow: "hidden" }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} width={104} height={104} style={{ objectFit: "contain" }} alt="" />
      ) : (
        <div style={{ display: "flex", color: BG, fontSize: 64, fontWeight: 800 }}>{symbol[0]}</div>
      )}
    </div>
  );
}

export async function ogCard(input: { label: string; title: string; accent?: string; symbols?: string[]; footer?: string }) {
  const symbols = (input.symbols ?? []).slice(0, 2);
  const [logos, fonts] = await Promise.all([Promise.all(symbols.map(logoData)), interFonts()]);
  const long = input.title.length > 34;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "56px 72px",
          color: "#ffffff",
          fontFamily: fonts.length ? "Inter" : "sans-serif",
          fontWeight: 500,
          backgroundColor: BG,
          backgroundImage: "radial-gradient(circle at 60% 0%, rgba(92,130,255,.38) 0%, rgba(92,130,255,0) 55%), radial-gradient(circle at 100% 0%, rgba(155,110,255,.28) 0%, rgba(155,110,255,0) 40%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 14, background: "#ffffff", color: BG, fontSize: 24, fontWeight: 800 }}>MF</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -0.8 }}>Metric Finance</div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 44, marginTop: 8 }}>
          {symbols.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {symbols.map((symbol, index) => (
                <div key={symbol} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  {index > 0 && <div style={{ display: "flex", color: "#7f8fb6", fontSize: 30, fontWeight: 800 }}>vs</div>}
                  <Logo symbol={symbol} src={logos[index]} />
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 18px", border: "2px solid rgba(143,168,250,.4)", borderRadius: 999, color: "#a9bdff", fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>{input.label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 22, fontSize: long ? 60 : 76, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.5 }}>{input.title}</div>
            {input.accent && <div style={{ display: "flex", marginTop: 10, fontSize: long ? 50 : 60, fontWeight: 800, letterSpacing: -2, color: "#a9bdff" }}>{input.accent}</div>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#7f8fb6", fontSize: 24 }}>
          <div style={{ display: "flex" }}>{input.footer ?? "Free daily brief on your stocks at 5 PM ET"}</div>
          <div style={{ display: "flex", color: "#b3c9ff" }}>metricfinance.app</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
