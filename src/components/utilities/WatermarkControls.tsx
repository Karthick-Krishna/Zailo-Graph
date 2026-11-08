import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
import { Grid, Image as ImageIcon, Type, Upload, Trash2, RotateCw } from 'lucide-react';

export const WatermarkControls: React.FC = () => {
  const { activeImage, executeActiveUtility, setCurrentParams } = useSession();

  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('© Imazora Studio');
  const [fontSize, setFontSize] = useState(28);
  const [opacity, setOpacity] = useState(0.75);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState<
    'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right' | 'tile'
  >('bottom-right');
  const [rotation, setRotation] = useState(0);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(0.18);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const initialRunRef = useRef<string | null>(null);

  const handleApply = (
    newType = watermarkType,
    newPos = position,
    newText = text,
    newSize = fontSize,
    newOpacity = opacity,
    newColor = color,
    newRot = rotation,
    newLogo = logoBlob,
    newScale = logoScale
  ) => {
    const params = {
      type: newType,
      text: newText,
      fontSize: newSize,
      opacity: newOpacity,
      color: newColor,
      position: newPos,
      rotation: newRot,
      logoBlob: newType === 'image' ? newLogo : undefined,
      logoScale: newScale,
    };
    setCurrentParams(params);
    executeActiveUtility(params);
  };

  useEffect(() => {
    if (!activeImage) return;
    const runKey = `${activeImage.id}_wm_${watermarkType}_${position}_${rotation}_${opacity}_${fontSize}_${logoBlob ? 'logo' : 'text'}`;
    if (initialRunRef.current !== runKey) {
      initialRunRef.current = runKey;
      handleApply();
    }
  }, [activeImage?.id]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoBlob(file);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setWatermarkType('image');
      handleApply('image', position, text, fontSize, opacity, color, rotation, file, logoScale);
    }
  };

  const removeLogo = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
    setLogoBlob(null);
    setWatermarkType('text');
    handleApply('text', position, text, fontSize, opacity, color, rotation, null, logoScale);
  };

  return (
    <div className="space-y-4">
      {/* Type Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl">
        <button
          onClick={() => {
            setWatermarkType('text');
            handleApply('text', position, text, fontSize, opacity, color, rotation, logoBlob, logoScale);
          }}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            watermarkType === 'text' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Text Watermark</span>
        </button>

        <button
          onClick={() => {
            setWatermarkType('image');
            handleApply('image', position, text, fontSize, opacity, color, rotation, logoBlob, logoScale);
          }}
          className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
            watermarkType === 'image' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image Logo</span>
        </button>
      </div>

      {/* Text Settings */}
      {watermarkType === 'text' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Watermark Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleApply(watermarkType, position, e.target.value, fontSize, opacity, color, rotation, logoBlob, logoScale);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              placeholder="e.g. © 2026 Your Name"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Font Size</span>
              <span className="font-mono">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="96"
              value={fontSize}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFontSize(val);
                handleApply(watermarkType, position, text, val, opacity, color, rotation, logoBlob, logoScale);
              }}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Text Color</label>
            <div className="flex items-center gap-2">
              {['#FFFFFF', '#000000', '#F59E0B', '#EF4444', '#3B82F6', '#10B981'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    handleApply(watermarkType, position, text, fontSize, opacity, c, rotation, logoBlob, logoScale);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                    color === c ? 'border-neutral-900 scale-110 shadow-sm' : 'border-neutral-200'
                  }`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  handleApply(watermarkType, position, text, fontSize, opacity, e.target.value, rotation, logoBlob, logoScale);
                }}
                className="w-7 h-7 rounded-lg border border-neutral-300 p-0 cursor-pointer"
                title="Custom color picker"
              />
            </div>
          </div>
        </div>
      )}

      {/* Logo Settings */}
      {watermarkType === 'image' && (
        <div className="space-y-3">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {logoUrl ? (
            <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo preview" className="w-10 h-10 object-contain rounded-lg border bg-white" />
                <span className="text-xs font-semibold text-neutral-800">Logo Loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="px-2 py-1 rounded-md text-[10px] font-semibold bg-white border border-neutral-200 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Change
                </button>
                <button
                  onClick={removeLogo}
                  className="p-1 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                  title="Remove logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 text-neutral-600 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer bg-neutral-50/50 hover:bg-neutral-50"
            >
              <Upload className="w-5 h-5 text-neutral-400" />
              <span className="text-xs font-semibold">Upload Watermark Logo (PNG/SVG)</span>
            </button>
          )}

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
              <span>Logo Relative Size</span>
              <span className="font-mono">{Math.round(logoScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={logoScale}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setLogoScale(val);
                handleApply(watermarkType, position, text, fontSize, opacity, color, rotation, logoBlob, val);
              }}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Universal Controls: Opacity & Rotation */}
      <div className="space-y-3 pt-2 border-t border-neutral-100">
        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Watermark Opacity</span>
            <span className="font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setOpacity(val);
              handleApply(watermarkType, position, text, fontSize, val, color, rotation, logoBlob, logoScale);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
            <span>Rotation Angle</span>
            <span className="font-mono">{rotation}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={rotation}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRotation(val);
              handleApply(watermarkType, position, text, fontSize, opacity, color, val, logoBlob, logoScale);
            }}
            className="w-full accent-neutral-900 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 mt-1">
            {[0, 45, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                onClick={() => {
                  setRotation(deg);
                  handleApply(watermarkType, position, text, fontSize, opacity, color, deg, logoBlob, logoScale);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border transition cursor-pointer ${
                  rotation === deg ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 9-Point Anchor Grid & Tile Pattern */}
      <div className="pt-2 border-t border-neutral-100">
        <label className="block text-xs font-semibold text-neutral-700 mb-2">9-Point Placement Anchor</label>
        <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto p-1.5 bg-neutral-100 rounded-xl">
          {[
            { id: 'top-left', label: 'TL' },
            { id: 'top', label: 'T' },
            { id: 'top-right', label: 'TR' },
            { id: 'left', label: 'L' },
            { id: 'center', label: 'C' },
            { id: 'right', label: 'R' },
            { id: 'bottom-left', label: 'BL' },
            { id: 'bottom', label: 'B' },
            { id: 'bottom-right', label: 'BR' },
          ].map((item) => {
            const isSelected = position === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPosition(item.id as any);
                  handleApply(watermarkType, item.id as any, text, fontSize, opacity, color, rotation, logoBlob, logoScale);
                }}
                className={`w-10 h-10 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isSelected ? 'bg-neutral-900 text-white shadow-sm' : 'bg-white hover:bg-neutral-200 text-neutral-600'
                }`}
                title={`Align ${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tile Repeat Button */}
        <button
          onClick={() => {
            setPosition('tile');
            handleApply(watermarkType, 'tile', text, fontSize, opacity, color, rotation, logoBlob, logoScale);
          }}
          className={`w-full mt-3 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
            position === 'tile'
              ? 'bg-neutral-900 border-neutral-900 text-white'
              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Full Diagonal Tiled Proofing Pattern</span>
        </button>
      </div>
    </div>
  );
};
