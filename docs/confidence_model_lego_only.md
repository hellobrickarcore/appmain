# Confidence Model: LEGO-Only

The final confidence of a detection is no longer a single detector score. It is a fusion of multiple factors that ensure brand truthfulness.

## Multi-Factor Fusion

1. **`geometryConfidence`**: How well the bounding box or polygon fits the visual boundaries of a physical object. Rejects "floating" boxes.
2. **`detectionConfidence`**: The raw model score for "brick-likeness".
3. **`legoBrandConfidence`**: The classifier score for official LEGO branding (stud logos, plastic texture, mold marks).
4. **`attributeConfidence`**: The combined score for color and dimensions.

## Final Calculation

`finalConfidence` = (`detectionConfidence` * 0.4) + (`legoBrandConfidence` * 0.4) + (`geometryConfidence` * 0.2)

- **High Confidence**: > 0.85
- **Medium Confidence**: 0.70 – 0.85
- **Uncertain**: < 0.70

## Reporting Buckets
Only detections with **High** or **Medium** confidence where `lego_brand_class == 'official_lego'` are included in the primary capture count.
