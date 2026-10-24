import React from 'react';
import { PLACES } from '../data/hospital';
import { useApp } from '../context/AppContext';

export default function FloorPlanSVG({
  floor = 0,
  activePath = [],
  startPlaceId = null,
  destinationPlaceId = null,
  onSelectPlace = null,
  className = ""
}) {
  const { language, t } = useApp();

  // Filter places that belong to this floor
  const floorPlaces = Object.values(PLACES).filter(p => p.floor === floor);

  // Filter path nodes that are on this floor
  const pathNodesOnThisFloor = activePath
    .map(id => PLACES[id])
    .filter(p => p && p.floor === floor);

  // Build SVG path coordinate points string
  let pathD = "";
  if (pathNodesOnThisFloor.length > 1) {
    pathD = pathNodesOnThisFloor.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, "");
  }

  // Get localized name
  const getName = (p) => {
    return p[`name_${language}`] || p.name_en;
  };

  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 rounded-2xl shadow-inner border-2 border-slate-700 ${className}`}>
      {/* SVG Viewport */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-auto max-h-[500px] select-none touch-pan-x"
        aria-label={`Floor Plan Floor ${floor}`}
      >
        <defs>
          {/* Subtle grid pattern for hospital floor tiling */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>

          {/* Glow filter for active route */}
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Marker for route path head */}
          <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Floor Background */}
        <rect width="800" height="500" fill="#0f172a" />
        <rect width="800" height="500" fill="url(#grid)" opacity="0.6" />

        {/* Building Boundary Walls */}
        <rect
          x="30"
          y="30"
          width="740"
          height="440"
          rx="18"
          fill="none"
          stroke="#334155"
          strokeWidth="6"
        />

        {/* Corridor Guides */}
        {floor === 0 && (
          <g stroke="#1e293b" strokeWidth="20" strokeLinecap="round" opacity="0.4">
            <line x1="400" y1="440" x2="400" y2="200" /> {/* Central corridor */}
            <line x1="120" y1="200" x2="680" y2="200" /> {/* North corridor */}
            <line x1="120" y1="330" x2="680" y2="330" /> {/* South corridor */}
          </g>
        )}

        {floor === 1 && (
          <g stroke="#1e293b" strokeWidth="24" strokeLinecap="round" opacity="0.4">
            <line x1="140" y1="200" x2="660" y2="200" /> {/* Central hall corridor */}
            <line x1="400" y1="130" x2="400" y2="380" /> {/* Vertical cross */}
          </g>
        )}

        {floor === 2 && (
          <g stroke="#1e293b" strokeWidth="24" strokeLinecap="round" opacity="0.4">
            <line x1="180" y1="250" x2="650" y2="250" /> {/* Inpatient corridor */}
            <line x1="400" y1="130" x2="400" y2="350" />
          </g>
        )}

        {/* Specific Floor 0 Zones */}
        {floor === 0 && (
          <g>
            {/* Emergency Casualty Wing (Right) */}
            <rect x="590" y="260" width="160" height="130" rx="12" fill="#450a0a" stroke="#dc2626" strokeWidth="3" opacity="0.85" />
            <text x="670" y="290" fill="#fca5a5" fontSize="13" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'कैजुअल्टी / आपातकाल' : language === 'ta' ? 'அவசர சிகிச்சை' : 'CASUALTY (EMERGENCY)'}
            </text>
            <text x="670" y="308" fill="#f87171" fontSize="10" textAnchor="middle">24x7 Direct Entry</text>

            {/* Central Registration Area */}
            <rect x="310" y="280" width="180" height="90" rx="10" fill="#082f49" stroke="#0284c7" strokeWidth="2" opacity="0.75" />
            <text x="400" y="310" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'पंजीकरण काउंटर (1-4)' : language === 'ta' ? 'பதிவு கவுண்டர்கள்' : 'REGISTRATION (1-4)'}
            </text>

            {/* Pharmacy & Lab (Left) */}
            <rect x="60" y="140" width="130" height="100" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.75" />
            <text x="125" y="180" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'दवा वितरण (फार्मेसी)' : language === 'ta' ? 'மருந்தகம்' : 'PHARMACY'}
            </text>

            <rect x="220" y="140" width="120" height="100" rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" opacity="0.75" />
            <text x="280" y="180" fill="#a5b4fc" fontSize="12" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'लैब (जांच)' : language === 'ta' ? 'ஆய்வகம்' : 'LAB (TESTS)'}
            </text>
          </g>
        )}

        {/* Specific Floor 1 Zones */}
        {floor === 1 && (
          <g>
            {/* Waiting Hall A */}
            <rect x="300" y="220" width="200" height="100" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.9" />
            <text x="400" y="250" fill="#38bdf8" fontSize="14" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'प्रतीक्षा कक्ष A' : language === 'ta' ? 'காத்திருப்பு அறை A' : 'WAITING HALL A'}
            </text>
            <text x="400" y="275" fill="#94a3b8" fontSize="11" textAnchor="middle">
              {language === 'hi' ? '60 नीली कुर्सियां • टीवी डिस्प्ले' : language === 'ta' ? 'டிவி திரை வசதி' : '60 Chairs • Big TV Screen'}
            </text>
          </g>
        )}

        {/* Specific Floor 2 Zones */}
        {floor === 2 && (
          <g>
            {/* Central Nurses Station */}
            <circle cx="400" cy="250" r="45" fill="#312e81" stroke="#818cf8" strokeWidth="3" opacity="0.8" />
            <text x="400" y="255" fill="#c7d2fe" fontSize="11" fontWeight="bold" textAnchor="middle">
              {language === 'hi' ? 'नर्सिंग स्टेशन' : language === 'ta' ? 'செவிலியர் தளம்' : "NURSES' STN"}
            </text>
          </g>
        )}

        {/* DRAW ACTIVE ROUTE LINE */}
        {pathD && (
          <g>
            {/* Glowing background line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
              filter="url(#routeGlow)"
            />
            {/* Animated dashed bright path */}
            <path
              d={pathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="8 6"
              markerEnd="url(#arrowHead)"
              className="animate-pulse"
            />
          </g>
        )}

        {/* Place Nodes / Markers */}
        {floorPlaces.map((place) => {
          const isStart = place.id === startPlaceId;
          const isDest = place.id === destinationPlaceId;
          const isOnPath = activePath.includes(place.id);

          // Node badge colors
          let fillColor = "#334155";
          let strokeColor = "#64748b";
          let radius = 18;

          if (place.category === 'emergency') {
            fillColor = "#dc2626";
            strokeColor = "#fca5a5";
            radius = 22;
          } else if (place.category === 'opd') {
            fillColor = "#0284c7";
            strokeColor = "#7dd3fc";
          } else if (place.category === 'transit') {
            fillColor = "#7c3aed";
            strokeColor = "#c4b5fd";
          } else if (place.category === 'utility') {
            fillColor = "#0d9488";
            strokeColor = "#5eead4";
          } else if (place.category === 'ward') {
            fillColor = "#b45309";
            strokeColor = "#fcd34d";
          }

          if (isStart) {
            fillColor = "#16a34a";
            strokeColor = "#86efac";
            radius = 24;
          } else if (isDest) {
            fillColor = "#ea580c";
            strokeColor = "#fed7aa";
            radius = 26;
          }

          return (
            <g
              key={place.id}
              transform={`translate(${place.x}, ${place.y})`}
              className="cursor-pointer group"
              onClick={() => onSelectPlace && onSelectPlace(place)}
            >
              {/* Pulsing ring if destination or start */}
              {(isStart || isDest) && (
                <circle
                  r={radius + 8}
                  fill="none"
                  stroke={isDest ? "#f97316" : "#22c55e"}
                  strokeWidth="3"
                  className="animate-ping"
                  opacity="0.7"
                />
              )}

              {/* Main Node Circle */}
              <circle
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={isOnPath ? "3" : "1.5"}
                className="transition-transform group-hover:scale-110 shadow-lg"
              />

              {/* Icon symbol representation inside node */}
              <text
                y="5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize={radius > 20 ? "13" : "11"}
                fontWeight="bold"
                className="pointer-events-none"
              >
                {place.category === 'opd'
                  ? place.name_en.replace(/[^0-9]/g, '') || 'R'
                  : place.category === 'transit'
                  ? '↕'
                  : place.category === 'emergency'
                  ? '✚'
                  : place.category === 'utility'
                  ? '🚰'
                  : '•'}
              </text>

              {/* Node Label Below */}
              <g transform="translate(0, 32)">
                <rect
                  x="-75"
                  y="-10"
                  width="150"
                  height="22"
                  rx="6"
                  fill="#020617"
                  stroke="#334155"
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x="0"
                  y="5"
                  fill={isDest ? "#fb923c" : isStart ? "#4ade80" : "#f1f5f9"}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {getName(place).length > 20 ? getName(place).slice(0, 18) + '...' : getName(place)}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floor Plan Legend & Controls Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 p-2 sm:p-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
            <span>OPD Room</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            <span>Lift / Ramp (No Stairs)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span>Inpatient Ward</span>
          </div>
        </div>

        {destinationPlaceId && (
          <div className="text-amber-400 font-bold flex items-center gap-1">
            <span>🎯 Target: {PLACES[destinationPlaceId] ? getName(PLACES[destinationPlaceId]) : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
