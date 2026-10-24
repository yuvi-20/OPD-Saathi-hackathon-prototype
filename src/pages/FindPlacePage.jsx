import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PLACES } from '../data/hospital';
import { findShortestPath, calculatePathDistance, generateStepDirections } from '../utils/dijkstra';
import FloorPlanSVG from '../components/FloorPlanSVG';
import {
  MapPin,
  Navigation,
  Volume2,
  HelpCircle,
  Footprints,
  ArrowUpDown,
  Search,
  CheckCircle2,
  X,
  AlertTriangle,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { speakText, stopSpeech } from '../utils/tts';

export default function FindPlacePage() {
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');

  const {
    t,
    language,
    avoidStairs,
    setAvoidStairs,
    assistedMode
  } = useApp();

  // State
  const [startPlaceId, setStartPlaceId] = useState('ground_entrance');
  const [destPlaceId, setDestPlaceId] = useState(toParam && PLACES[toParam] ? toParam : 'first_opd_1');
  const [activeFloorView, setActiveFloorView] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLostCard, setShowLostCard] = useState(false);

  // If query param 'to' changes, update destination and floor
  useEffect(() => {
    if (toParam && PLACES[toParam]) {
      setDestPlaceId(toParam);
      setActiveFloorView(PLACES[toParam].floor);
    }
  }, [toParam]);

  // Compute Dijkstra shortest path
  const path = findShortestPath(startPlaceId, destPlaceId, avoidStairs) || [];
  const totalDistance = calculatePathDistance(path);
  const totalSteps = Math.round(totalDistance * 1.3); // ~1.3 walking steps per meter
  const estWalkMin = Math.max(1, Math.round(totalDistance / 40)); // ~40m/min relaxed pace for elderly

  // Generate step-by-step landmark directions
  const stepDirections = generateStepDirections(path, language);

  // Destination Place Object
  const destPlace = PLACES[destPlaceId] || PLACES['first_opd_1'];
  const startPlace = PLACES[startPlaceId] || PLACES['ground_entrance'];

  // Update active floor view to match destination if user switches destination
  const handleSelectDestination = (id) => {
    setDestPlaceId(id);
    if (PLACES[id]) {
      setActiveFloorView(PLACES[id].floor);
    }
  };

  const handleListenDirections = () => {
    const fullText = stepDirections.join('. ');
    speakText(fullText, language);
  };

  const handleImLost = () => {
    // Route to nearest help desk
    setDestPlaceId('ground_help_desk');
    setActiveFloorView(0);
    setShowLostCard(true);
  };

  // Filter places for search
  const placeList = Object.values(PLACES);
  const filteredPlaces = placeList.filter(p => {
    const name = (p[`name_${language}`] || p.name_en).toLowerCase();
    const landmark = (p[`landmark_${language}`] || p.landmark_en).toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    return name.includes(q) || landmark.includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-7 h-7 text-sky-600" />
            <span>{t.navigation.title}</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Dijkstra shortest path with visual landmarks and stair-free routing.
          </p>
        </div>

        {/* Avoid Stairs Switch & I'm Lost Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAvoidStairs(!avoidStairs)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              avoidStairs
                ? 'bg-purple-100 text-purple-900 border-2 border-purple-400 shadow-sm'
                : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
            }`}
            aria-pressed={avoidStairs}
          >
            <ArrowUpDown className="w-4 h-4 text-purple-600" />
            <span>{t.navigation.avoidStairsLabel}</span>
          </button>

          <button
            onClick={handleImLost}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-950" />
            <span>{t.buttons.iAmLost}</span>
          </button>
        </div>
      </div>

      {/* Assisted Mobility Navigation Notice */}
      {assistedMode && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3 text-amber-950 font-bold text-xs sm:text-sm shadow-sm">
          <span className="text-2xl">🦽</span>
          <div>
            <span className="font-extrabold uppercase text-[11px] text-amber-900 tracking-wider block">
              Assisted Mobility Active:
            </span>
            Stair-free routing is locked ON. The path routes exclusively through passenger lifts and gentle ramps for slow-walking and elderly patients.
          </div>
        </div>
      )}

      {/* Origin & Destination Selectors */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Location */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            📍 {t.navigation.fromLabel}
          </label>
          <select
            value={startPlaceId}
            onChange={(e) => setStartPlaceId(e.target.value)}
            className="w-full min-h-[52px] bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 rounded-xl px-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500"
          >
            <optgroup label="Ground Floor">
              {placeList.filter(p => p.floor === 0).map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
            <optgroup label="1st Floor (OPD)">
              {placeList.filter(p => p.floor === 1).map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
            <optgroup label="2nd Floor (Wards)">
              {placeList.filter(p => p.floor === 2).map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Destination Location */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            🎯 {t.navigation.toLabel}
          </label>
          <select
            value={destPlaceId}
            onChange={(e) => handleSelectDestination(e.target.value)}
            className="w-full min-h-[52px] bg-sky-50 hover:bg-sky-100 border-2 border-sky-400 rounded-xl px-3.5 text-sm font-black text-sky-950 focus:outline-none focus:border-sky-600"
          >
            <optgroup label="OPD Rooms (1st Floor)">
              {placeList.filter(p => p.floor === 1 && p.category === 'opd').map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
            <optgroup label="Inpatient Wards (2nd Floor)">
              {placeList.filter(p => p.floor === 2 && p.category === 'ward').map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
            <optgroup label="Facilities & Utilities (Ground Floor)">
              {placeList.filter(p => p.floor === 0).map(p => (
                <option key={p.id} value={p.id}>{p[`name_${language}`] || p.name_en}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Floor Plan Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4">
        {/* Floor Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-sky-600" />
            <span className="font-bold text-sm text-slate-800">
              {t.navigation.currentFloor.replace('{floor}', activeFloorView === 0 ? t.navigation.groundFloor : activeFloorView === 1 ? t.navigation.firstFloor : t.navigation.secondFloor)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { floor: 0, label: "Ground" },
              { floor: 1, label: "Floor 1 (OPD)" },
              { floor: 2, label: "Floor 2 (Wards)" }
            ].map(f => (
              <button
                key={f.floor}
                onClick={() => setActiveFloorView(f.floor)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeFloorView === f.floor
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Floor Map Component */}
        <FloorPlanSVG
          floor={activeFloorView}
          activePath={path}
          startPlaceId={startPlaceId}
          destinationPlaceId={destPlaceId}
          onSelectPlace={(p) => handleSelectDestination(p.id)}
        />

        {/* Route Stats Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block font-semibold">{t.navigation.distance}</span>
              <span className="font-black text-slate-900 text-base">{totalDistance} metres</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">{t.navigation.totalSteps}</span>
              <span className="font-black text-slate-900 text-base">{totalSteps} steps</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Walk Time</span>
              <span className="font-black text-emerald-700 text-base">{t.navigation.estimatedWalk.replace('{min}', estWalkMin)}</span>
            </div>
          </div>

          <button
            onClick={handleListenDirections}
            className="min-h-[46px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-2 shadow-sm"
          >
            <Volume2 className="w-5 h-5 text-yellow-300" />
            <span>{t.buttons.listen}</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Directions with Landmarks */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Footprints className="w-6 h-6 text-sky-600" />
          <span>{t.navigation.routeStepsTitle}</span>
        </h2>

        <div className="space-y-3">
          {stepDirections.map((stepText, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 hover:bg-sky-50/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                {stepText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* I AM LOST POPUP FLASHCARD */}
      {showLostCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-4 border-amber-500 shadow-2xl text-center space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowLostCard(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full"
            >
              <X className="w-7 h-7" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <HeartHandshake className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
                STAFF ASSISTANCE FLASHCARD
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {t.navigation.lostCardTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.navigation.lostCardInstruction}
              </p>
            </div>

            {/* Bilingual Destination Flashcard Box */}
            <div className="bg-amber-50 border-4 border-dashed border-amber-400 rounded-3xl p-6 space-y-3">
              <p className="text-xs font-extrabold text-amber-900 uppercase">
                Destination / गंतव्य:
              </p>
              <div className="text-2xl sm:text-3xl font-black text-slate-950">
                {destPlace[`name_${language}`] || destPlace.name_en}
              </div>
              <div className="text-lg font-bold text-sky-800">
                {destPlace.name_en} ({destPlace.floor === 0 ? "Ground Floor" : destPlace.floor === 1 ? "1st Floor" : "2nd Floor"})
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Landmark: {destPlace[`landmark_${language}`] || destPlace.landmark_en}
              </p>
            </div>

            <button
              onClick={() => setShowLostCard(false)}
              className="w-full min-h-[54px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-base shadow-md"
            >
              {t.buttons.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
