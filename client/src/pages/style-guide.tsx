import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const primaryColors = [
  { name: "50", hex: "#EEF2FF", bg: "#EEF2FF" },
  { name: "100", hex: "#E0E7FF", bg: "#E0E7FF" },
  { name: "200", hex: "#C7D2FE", bg: "#C7D2FE" },
  { name: "300", hex: "#A5B4FC", bg: "#A5B4FC" },
  { name: "400", hex: "#818CF8", bg: "#818CF8" },
  { name: "500", hex: "#4F46E5", bg: "#4F46E5" },
];

const greyscaleColors = [
  { name: "0", hex: "#F8F9FB", bg: "#F8F9FB" },
  { name: "25", hex: "#F6F8FA", bg: "#F6F8FA" },
  { name: "50", hex: "#ECEFF3", bg: "#ECEFF3" },
  { name: "100", hex: "#DFE1E7", bg: "#DFE1E7" },
  { name: "200", hex: "#C1C7D0", bg: "#C1C7D0" },
  { name: "300", hex: "#A4ACB9", bg: "#A4ACB9" },
  { name: "400", hex: "#818898", bg: "#818898" },
  { name: "500", hex: "#666D80", bg: "#666D80" },
  { name: "600", hex: "#36394A", bg: "#36394A" },
  { name: "700", hex: "#272835", bg: "#272835" },
  { name: "800", hex: "#1A1B25", bg: "#1A1B25" },
  { name: "900", hex: "#0D0D12", bg: "#0D0D12" },
];

const headings = [
  { label: "Heading 1", size: "48px", weight: "Semibold", lineHeight: "1.2", className: "text-[48px] font-semibold leading-[1.2]" },
  { label: "Heading 2", size: "40px", weight: "Semibold", lineHeight: "1.2", className: "text-[40px] font-semibold leading-[1.2]" },
  { label: "Heading 3", size: "32px", weight: "Semibold", lineHeight: "1.4", className: "text-[32px] font-semibold leading-[1.4]" },
  { label: "Heading 4", size: "24px", weight: "Semibold", lineHeight: "1.5", className: "text-[24px] font-semibold leading-[1.5]" },
  { label: "Heading 5", size: "20px", weight: "Semibold", lineHeight: "1.4", className: "text-[20px] font-semibold leading-[1.4]" },
  { label: "Heading 6", size: "16px", weight: "Semibold", lineHeight: "1.5", className: "text-[16px] font-semibold leading-[1.5]" },
];

const bodyStyles = [
  { label: "Body Large", size: "18px", lineHeight: "28px", className: "text-[18px] leading-[28px]" },
  { label: "Body Base", size: "16px", lineHeight: "24px", className: "text-[16px] leading-[24px]" },
  { label: "Body Small", size: "14px", lineHeight: "20px", className: "text-[14px] leading-[20px]" },
  { label: "Body XSmall", size: "12px", lineHeight: "16px", className: "text-[12px] leading-[16px]" },
];

const shadows = [
  { name: "XSmall", css: "0px 1px 2px rgba(13,13,18,0.06)" },
  { name: "Small", css: "0px 1px 3px rgba(13,13,18,0.05), 0px 1px 2px rgba(13,13,18,0.04)" },
  { name: "Medium", css: "0px 5px 10px -2px rgba(13,13,18,0.04), 0px 4px 8px -1px rgba(13,13,18,0.02)" },
  { name: "Large", css: "0px 12px 16px -4px rgba(13,13,18,0.08), 0px 4px 6px -2px rgba(13,13,18,0.03)" },
  { name: "XLarge", css: "0px 24px 48px -12px rgba(13,13,18,0.12)" },
  { name: "XXLarge", css: "0px 24px 48px -12px rgba(13,13,18,0.18)" },
];

function ColorSwatch({ name, hex, bg, palette }: { name: string; hex: string; bg: string; palette: string }) {
  const isDark = ["600", "700", "800", "900"].includes(name) || (palette === "primary" && ["400", "500"].includes(name));
  return (
    <div
      className="overflow-hidden rounded-lg border border-border/60 shadow-[0px_1px_2px_rgba(13,13,18,0.06)]"
      data-testid={`color-swatch-${palette}-${name}`}
    >
      <div className="h-[72px] w-full flex items-center justify-center" style={{ backgroundColor: bg }}>
        {isDark && (
          <span className="text-[11px] font-medium text-white/70">{hex}</span>
        )}
      </div>
      <div className="bg-white px-3 py-2.5">
        <p className="text-sm font-medium text-[#36394A]">{name}</p>
        <p className="text-xs text-[#666D80]/50 mt-0.5">{hex}</p>
      </div>
    </div>
  );
}

function TypographyTab() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        <div className="relative rounded-2xl bg-[#F8F9FB] overflow-hidden" style={{ minHeight: "200px" }}>
          <div className="px-16 py-14 flex flex-col gap-4">
            <p className="text-[48px] font-semibold text-[#0D0D12] leading-tight" data-testid="text-font-name">
              Inter
            </p>
            <p className="text-lg text-[#666D80]">
              Download Font:{" "}
              <a
                href="https://fonts.google.com/specimen/Inter"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                data-testid="link-font-download"
              >
                https://fonts.google.com/specimen/Inter
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { weight: "Semibold", fontClass: "font-semibold" },
            { weight: "Medium", fontClass: "font-medium" },
            { weight: "Regular", fontClass: "font-normal" },
          ].map((item) => (
            <div
              key={item.weight}
              className="rounded-2xl bg-[#F8F9FB] p-6"
              data-testid={`typeface-${item.weight.toLowerCase()}`}
            >
              <div className="flex items-center gap-8">
                <div className="flex size-[92px] shrink-0 items-center justify-center rounded-xl bg-white shadow-[0px_12px_24px_0px_#f2f2f2]">
                  <span className={`text-[48px] ${item.fontClass} text-[#0D0D12] leading-[1.25]`}>Aa</span>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-semibold text-[#0D0D12]">Inter</p>
                  <p className="text-base text-[#818898]">{item.weight}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-10">
        <p className="text-[32px] font-semibold text-[#0D0D12] leading-[1.4]">Display</p>
        <div className="flex flex-col gap-4" data-testid="heading-64px">
          <p className="text-[64px] font-semibold text-[#0D0D12] leading-[80px] tracking-[-0.64px]">Display</p>
          <p className="text-sm font-medium text-[#666D80]">Display / Semibold / 64px / line-height 80px</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-10">
        <p className="text-[32px] font-semibold text-[#0D0D12] leading-[1.4]">Heading</p>
        <div className="flex flex-col gap-14">
          <div className="grid grid-cols-4 gap-8 items-end">
            {headings.slice(0, 4).map((h) => (
              <div key={h.label} className="flex flex-col gap-4" data-testid={`heading-${h.size}`}>
                <p className={`${h.className} text-[#0D0D12]`}>{h.label}</p>
                <p className="text-sm font-medium text-[#666D80]">
                  {h.label} / {h.weight} / {h.size}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-8 items-end">
            {headings.slice(4).map((h) => (
              <div key={h.label} className="flex flex-col gap-4" data-testid={`heading-${h.size}`}>
                <p className={`${h.className} text-[#0D0D12]`}>{h.label}</p>
                <p className="text-sm font-medium text-[#666D80]">
                  {h.label} / {h.weight} / {h.size}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-10">
        <p className="text-[32px] font-semibold text-[#0D0D12] leading-[1.4]">Body</p>
        <div className="flex flex-col gap-10">
          {bodyStyles.map((b) => (
            <div key={b.label} className="flex flex-col gap-6" data-testid={`body-${b.size}`}>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <p className={`${b.className} font-normal text-[#0D0D12]`}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-sm font-medium text-[#666D80]">
                    {b.label} / Regular / {b.size}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className={`${b.className} font-medium text-[#0D0D12]`}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                  <p className="text-sm font-medium text-[#666D80]">
                    {b.label} / Medium / {b.size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorsTab() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-medium text-[#0D0D12]">Primary</p>
          <p className="text-base text-[#36394A]">{primaryColors.length} colors</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {primaryColors.map((c) => (
            <ColorSwatch key={c.name} name={c.name} hex={c.hex} bg={c.bg} palette="primary" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xl font-medium text-[#0D0D12]">Greyscale</p>
          <p className="text-base text-[#36394A]">{greyscaleColors.length} colors</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {greyscaleColors.slice(0, 3).map((c) => (
            <ColorSwatch key={c.name} name={c.name} hex={c.hex} bg={c.bg} palette="greyscale" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {greyscaleColors.slice(3, 6).map((c) => (
            <ColorSwatch key={c.name} name={c.name} hex={c.hex} bg={c.bg} palette="greyscale" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {greyscaleColors.slice(6, 9).map((c) => (
            <ColorSwatch key={c.name} name={c.name} hex={c.hex} bg={c.bg} palette="greyscale" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {greyscaleColors.slice(9, 12).map((c) => (
            <ColorSwatch key={c.name} name={c.name} hex={c.hex} bg={c.bg} palette="greyscale" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShadowTab() {
  return (
    <div className="rounded-2xl bg-[#F8F9FB] p-12">
      <div className="grid grid-cols-3 gap-8">
        {shadows.map((s) => (
          <div
            key={s.name}
            className="flex h-[150px] flex-col items-start justify-end overflow-hidden rounded-lg bg-white p-4"
            style={{ boxShadow: s.css }}
            data-testid={`shadow-${s.name.toLowerCase()}`}
          >
            <p className="text-base text-[#36394A] tracking-[0.16px]">{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <div className="flex h-full flex-col" data-testid="page-style-guide">
      <Topbar title="Style Guide" />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          <PageHeader
            title="Style Guide"
            description="TeamSync Design System foundation — typography, colors, and shadows."
          />
          <div className="mt-6">
            <Tabs defaultValue="typography" data-testid="tabs-style-guide">
              <TabsList data-testid="tabs-list">
                <TabsTrigger value="typography" data-testid="tab-typography">Typography</TabsTrigger>
                <TabsTrigger value="colors" data-testid="tab-colors">Colors</TabsTrigger>
                <TabsTrigger value="shadow" data-testid="tab-shadow">Shadow</TabsTrigger>
              </TabsList>
              <div className="mt-8">
                <TabsContent value="typography">
                  <TypographyTab />
                </TabsContent>
                <TabsContent value="colors">
                  <ColorsTab />
                </TabsContent>
                <TabsContent value="shadow">
                  <ShadowTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
