# MEMO: Sierra Pacific DH — Material Class Lock & Correction Memo

**Date:** March 15, 2026  
**Status:** ACTIVE  
**Triggered by:** Bot 2 MATERIAL_RECLASSIFICATION_FLAG — multi-material manufacturer  

## BACKGROUND

Sierra Pacific Windows manufactures multiple product lines across different material classes:
- **H3 Fusion Technology / CSM (Custom Series Monoblock):** Aluminum-clad wood (primary premium line)
- **S-Series:** Vinyl
- **Various:** Other configurations

The Residentialist evaluation for "Sierra Pacific" targets the **H3 / CSM line** — their flagship aluminum-clad wood product. This is the product that competes in the Clad/Premium group alongside Loewen, Marvin Signature Ultimate, and Andersen E-Series.

## MATERIAL CLASS LOCK

**LOCKED: Aluminum-Clad Wood**

Do NOT reclassify. Do NOT flag for reclassification. The material class is Aluminum-Clad Wood based on:
- H3 Fusion Technology: extruded aluminum exterior, vinyl thermal break, solid wood interior
- This is the product line being evaluated
- Material ceiling: base 8, ceiling 9 (A-tier)

## PRE-APPROVED ASSUMPTIONS TABLE

| Spec | Evidence Basis | Confidence |
|------|----------------|------------|
| Material Class: Aluminum-Clad Wood | H3 Fusion Technology documented specification (aluminum/vinyl/wood tri-component) | HIGH |
| Product Line: H3 / CSM | Flagship premium line — this is the evaluated product | HIGH |
| Material Group: Clad/Premium | Aluminum-clad wood = clad group | HIGH |

## PIPELINE INSTRUCTION

1. When Bot 1 finds multiple Sierra Pacific product lines, focus research on the H3/CSM line specifically
2. Bot 2 MUST use material class "Aluminum-Clad Wood" — do not reclassify based on other product lines
3. If Bot 1 research includes data from S-Series (vinyl) or other lines, exclude that data from scoring
4. Proceed with standard evaluation using the H3/CSM specifications only
