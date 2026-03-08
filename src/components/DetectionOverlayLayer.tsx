import React, { useMemo } from 'react';
import { DetectionOverlay } from '../types/detection';
import { PreviewLayout, mapBoxToPreview, mapPolygonToPreview } from '../utils/coordinateMapping';

interface DetectionOverlayLayerProps {
    overlays: DetectionOverlay[];
    layout: PreviewLayout;
    debugMode?: boolean;
}

/**
 * Renders AR-style overlays (bboxes or polygons) on top of the camera preview.
 * Resilient to aspect ratio differences between source and preview.
 */
export const DetectionOverlayLayer: React.FC<DetectionOverlayLayerProps> = ({
    overlays,
    layout,
    debugMode = false
}) => {
    const renderedOverlays = useMemo(() => {
        return overlays.map(ov => {
            const mappedBox = ov.box ? mapBoxToPreview(ov.box, layout) : null;
            const mappedPoly = ov.polygon ? mapPolygonToPreview(ov.polygon, layout) : null;

            return {
                ...ov,
                mappedBox,
                mappedPoly
            };
        }).filter(ov => ov.mappedBox || ov.mappedPoly);
    }, [overlays, layout]);

    if (layout.previewWidth === 0) return null;

    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden z-20"
            style={{
                width: layout.previewWidth,
                height: layout.previewHeight,
                left: layout.previewX,
                top: layout.previewY
            }}
        >
            <svg className="w-full h-full">
                {renderedOverlays.map((ov) => {
                    const color = ov.isStable ? '#3B82F6' : '#94A3B8'; // Blue for stable, Slate for tentative
                    const strokeWidth = ov.isStable ? 3 : 2;

                    if (ov.mappedPoly && ov.geometryType === 'polygon') {
                        const pointsStr = ov.mappedPoly.map((p: any) => `${p.x},${p.y}`).join(' ');
                        return (
                            <g key={ov.id}>
                                <polygon
                                    points={pointsStr}
                                    fill="transparent"
                                    stroke={color}
                                    strokeWidth={strokeWidth + 4}
                                    strokeOpacity={0.2}
                                />
                                <polygon
                                    points={pointsStr}
                                    fill={ov.isStable ? `${color}22` : 'transparent'}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    className="transition-all duration-300"
                                />

                                {debugMode && (
                                    <text
                                        x={ov.mappedPoly[0].x}
                                        y={ov.mappedPoly[0].y - 8}
                                        fill={color}
                                        fontSize="10"
                                        className="font-mono font-bold"
                                    >
                                        {ov.id} ({ov.geometryConfidence.toFixed(2)})
                                    </text>
                                )}
                            </g>
                        );
                    } else if (ov.mappedBox) {
                        const { left, top, width, height } = ov.mappedBox;
                        return (
                            <g key={ov.id}>
                                <rect
                                    x={left}
                                    y={top}
                                    width={width}
                                    height={height}
                                    fill={ov.isStable ? `${color}11` : 'transparent'}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    rx="4"
                                    className="transition-all duration-300"
                                />

                                <path
                                    d={`M ${left} ${top + 12} L ${left} ${top} L ${left + 12} ${top}`}
                                    stroke={color}
                                    strokeWidth={strokeWidth + 1}
                                    fill="none"
                                />
                                <path
                                    d={`M ${left + width - 12} ${top} L ${left + width} ${top} L ${left + width} ${top + 12}`}
                                    stroke={color}
                                    strokeWidth={strokeWidth + 1}
                                    fill="none"
                                />
                                <path
                                    d={`M ${left + width} ${top + height - 12} L ${left + width} ${top + height} L ${left + width - 12} ${top + height}`}
                                    stroke={color}
                                    strokeWidth={strokeWidth + 1}
                                    fill="none"
                                />
                                <path
                                    d={`M ${left} ${top + height - 12} L ${left} ${top + height} L ${left + 12} ${top + height}`}
                                    stroke={color}
                                    strokeWidth={strokeWidth + 1}
                                    fill="none"
                                />

                                {debugMode && (
                                    <text
                                        x={left}
                                        y={top - 8}
                                        fill={color}
                                        fontSize="10"
                                        className="font-mono font-bold"
                                    >
                                        {ov.id} ({ov.geometryConfidence.toFixed(2)})
                                    </text>
                                )}
                            </g>
                        );
                    }
                    return null;
                })}
            </svg>

            {/* Label Layer (Decoupled from geometry rendering) */}
            {renderedOverlays.map((ov) => {
                const labelText = ov.compactLabel || ov.displayText;
                if (!labelText || ov.labelDisplayStatus === 'hidden') return null;

                const box = ov.mappedBox || (ov.mappedPoly ? {
                    left: Math.min(...ov.mappedPoly.map((p: any) => p.x)),
                    top: Math.min(...ov.mappedPoly.map((p: any) => p.y)),
                    width: Math.max(...ov.mappedPoly.map((p: any) => p.x)) - Math.min(...ov.mappedPoly.map((p: any) => p.x)),
                    height: Math.max(...ov.mappedPoly.map((p: any) => p.y)) - Math.min(...ov.mappedPoly.map((p: any) => p.y))
                } : null);

                if (!box) return null;

                const isConfirmed = ov.labelDisplayStatus === 'confirmed';
                const isReview = ov.labelDisplayStatus === 'needs_review';

                let labelBgColor = 'bg-slate-900/80';
                let borderColor = 'border-white/20';
                let accentColor = 'bg-slate-400';

                if (isConfirmed) {
                    labelBgColor = 'bg-blue-600/90';
                    borderColor = 'border-blue-400/50';
                    accentColor = 'bg-white';
                } else if (isReview) {
                    labelBgColor = 'bg-amber-600/90';
                    borderColor = 'border-amber-400/50';
                    accentColor = 'bg-white';
                }

                return (
                    <div
                        key={`label-${ov.id}`}
                        className="absolute z-21 pointer-events-none transition-all duration-300"
                        style={{
                            left: box.left,
                            top: box.top - 28, // Moved up slightly for clearer view
                            maxWidth: Math.max(box.width, 140)
                        }}
                    >
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight ${labelBgColor} ${borderColor} border text-white shadow-2xl backdrop-blur-md whitespace-nowrap overflow-hidden text-ellipsis shadow-black/50`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${accentColor} animate-pulse`} />
                            {labelText}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
