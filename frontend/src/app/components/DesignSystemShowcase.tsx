import { Badge } from "./ui/badge";

// Design System Showcase Component
export function DesignSystemShowcase() {
  return (
    <div className="p-8 space-y-12">
      <section>
        <h1 className="text-4xl font-bold text-[#1B2A4A] mb-2">ClubConnect Design System</h1>
        <p className="text-xl text-[#0EA8A8]">Connectez. Créez. Collaborez.</p>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Couleurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="h-24 rounded-lg bg-[#1B2A4A] mb-2"></div>
            <p className="font-semibold">Primary Navy</p>
            <p className="text-sm text-gray-600 font-mono">#1B2A4A</p>
          </div>
          <div>
            <div className="h-24 rounded-lg bg-[#0EA8A8] mb-2"></div>
            <p className="font-semibold">Accent Teal</p>
            <p className="text-sm text-gray-600 font-mono">#0EA8A8</p>
          </div>
          <div>
            <div className="h-24 rounded-lg bg-[#F5A623] mb-2"></div>
            <p className="font-semibold">Accent Amber</p>
            <p className="text-sm text-gray-600 font-mono">#F5A623</p>
          </div>
          <div>
            <div className="h-24 rounded-lg bg-[#F7F8FC] border border-gray-300 mb-2"></div>
            <p className="font-semibold">Warm White</p>
            <p className="text-sm text-gray-600 font-mono">#F7F8FC</p>
          </div>
          <div>
            <div className="h-24 rounded-lg bg-white border border-gray-300 mb-2"></div>
            <p className="font-semibold">Pure White</p>
            <p className="text-sm text-gray-600 font-mono">#FFFFFF</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Typographie</h2>
        <div className="space-y-4">
          <div>
            <h1 className="text-[32px] font-bold">Heading 1 - 32px Bold</h1>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <h2 className="text-[24px] font-bold">Heading 2 - 24px Bold</h2>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <h3 className="text-[20px] font-semibold">Heading 3 - 20px Semibold</h3>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <h4 className="text-[16px] font-semibold">Heading 4 - 16px Semibold</h4>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <p className="text-[16px]">Body Large - 16px Regular</p>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <p className="text-[14px]">Body Small - 14px Regular</p>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <p className="text-[12px]">Caption - 12px Regular</p>
            <p className="text-sm text-gray-600 font-mono mt-1">Plus Jakarta Sans</p>
          </div>
          <div>
            <p className="text-[14px] font-mono">Code/Timestamp - 14px DM Mono</p>
            <p className="text-sm text-gray-600 font-mono mt-1">DM Mono</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Badges & Pills</h2>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[#0EA8A8]">Technologie</Badge>
          <Badge className="bg-[#1B2A4A]">Arts</Badge>
          <Badge className="bg-[#F5A623]">En attente</Badge>
          <Badge className="bg-green-500">Actif</Badge>
          <Badge className="bg-red-500">Refusé</Badge>
          <Badge className="bg-purple-500">Président</Badge>
          <Badge className="bg-blue-500">Vice-Président</Badge>
          <Badge className="bg-[#0EA8A8]">Staff</Badge>
          <Badge className="bg-gray-500">Membre</Badge>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Système d'espacement (base 4px)</h2>
        <div className="space-y-2">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-20 text-sm font-mono text-gray-600">{size}px</div>
              <div
                className="h-8 bg-[#0EA8A8] rounded"
                style={{ width: `${size}px` }}
              ></div>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Border Radius</h2>
        <div className="flex gap-4">
          <div>
            <div className="w-24 h-24 bg-[#0EA8A8] rounded-lg mb-2"></div>
            <p className="text-sm font-mono">12px - Cards</p>
          </div>
          <div>
            <div className="w-24 h-24 bg-[#0EA8A8] rounded-md mb-2"></div>
            <p className="text-sm font-mono">8px - Buttons</p>
          </div>
          <div>
            <div className="w-24 h-24 bg-[#0EA8A8] rounded-[20px] mb-2"></div>
            <p className="text-sm font-mono">20px - Modals</p>
          </div>
        </div>
      </section>

      {/* Elevation */}
      <section>
        <h2 className="text-2xl font-bold text-[#1B2A4A] mb-4">Élévation</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="h-24 bg-white rounded-lg" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <p className="p-4 text-sm font-mono">Card Shadow</p>
          </div>
          <div className="h-24 bg-white rounded-lg hover:shadow-lg transition-shadow">
            <p className="p-4 text-sm font-mono">Hover Effect</p>
          </div>
          <div className="h-24 bg-white rounded-lg shadow-xl">
            <p className="p-4 text-sm font-mono">Modal Shadow</p>
          </div>
        </div>
      </section>
    </div>
  );
}
