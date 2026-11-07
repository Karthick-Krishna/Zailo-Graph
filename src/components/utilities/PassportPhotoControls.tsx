import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { IdCard, Printer, Check, Shield } from 'lucide-react';

interface PassportStandard {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
}

const STANDARDS: PassportStandard[] = [
  { id: 'us', name: 'US Passport / Visa', country: 'United States', widthMm: 51, heightMm: 51 },
  { id: 'schengen', name: 'Schengen / EU Visa', country: 'Europe / UK', widthMm: 35, heightMm: 45 },
  { id: 'india', name: 'India Passport / OCI', country: 'India', widthMm: 35, heightMm: 45 },
  { id: 'australia', name: 'Australia Passport', country: 'Australia', widthMm: 35, heightMm: 45 },
];

export const PassportPhotoControls: React.FC = () => {
  const { executeActiveUtility, setCurrentParams } = useSession();
  const [activeStandard, setActiveStandard] = useState<PassportStandard>(STANDARDS[0]);
  const [sheetMode, setSheetMode] = useState<'single' | '4x6_grid'>('4x6_grid');
  const [whitenBg, setWhitenBg] = useState<boolean>(true);

  const handleApply = (standard = activeStandard, mode = sheetMode, whiten = whitenBg) => {
    const params = {
      targetWidthMm: standard.widthMm,
      targetHeightMm: standard.heightMm,
      sheetMode: mode,
      whitenedBackground: whiten,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  return (
    <div className="space-y-5">
      {/* Target Biometric Standard */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">Biometric Template</label>
        <div className="space-y-1.5">
          {STANDARDS.map((std) => {
            const isSelected = activeStandard.id === std.id;
            return (
              <button
                key={std.id}
                onClick={() => {
                  setActiveStandard(std);
                  handleApply(std, sheetMode, whitenBg);
                }}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900/10'
                    : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900">{std.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    {std.widthMm} × {std.heightMm} mm ({((std.widthMm / 25.4) * 300).toFixed(0)} × {((std.heightMm / 25.4) * 300).toFixed(0)} px @ 300 DPI)
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-neutral-500 uppercase px-2 py-0.5 bg-neutral-100 rounded-md">
                  {std.country}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sheet Output Layout */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Print Layout Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSheetMode('4x6_grid');
              handleApply(activeStandard, '4x6_grid', whitenBg);
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              sheetMode === '4x6_grid'
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>4×6" Print Sheet (6x)</span>
          </button>

          <button
            onClick={() => {
              setSheetMode('single');
              handleApply(activeStandard, 'single', whitenBg);
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              sheetMode === 'single'
                ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>Single Photo</span>
          </button>
        </div>
      </div>

      {/* Whiten Background Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
        <div>
          <span className="text-xs font-semibold text-neutral-800 block">Neutral White Background</span>
          <span className="text-[10px] text-neutral-400">Required by passport authorities</span>
        </div>
        <button
          onClick={() => {
            const next = !whitenBg;
            setWhitenBg(next);
            handleApply(activeStandard, sheetMode, next);
          }}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            whitenBg ? 'bg-neutral-900' : 'bg-neutral-300'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
            whitenBg ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Ready-to-print tip */}
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>Exported 4×6" sheets can be printed at any local pharmacy or photo lab for under 30 cents.</span>
      </div>
    </div>
  );
};

