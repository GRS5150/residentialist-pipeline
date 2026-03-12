# The Residentialist Knowledge Base

Central repository for all product evaluation knowledge files, rubrics, and system documentation.

## Directory Structure

```
knowledge/
├── windows/                    # Windows & doors category
│   ├── windows_eval_knowledge_v1.1.md
│   ├── windows_material_safety_knowledge_v1.1.md
│   ├── windows_deterministic_rubrics_v5.md
│   ├── residentialist_universal_rubric_principles_v1.1.md
│   └── henley_windows_packet_v1.1.md
├── faucets/                    # Faucets category (in development)
├── countertops/                # Countertops category (in development)
├── system/                     # System documentation & procedures
│   └── (to be added)
└── README.md                   # This file
```

## File Descriptions

### Windows Category

**windows_eval_knowledge_v1.1.md** (15KB)
- Source authority hierarchy (Tier 1-3)
- Frame/glass/spacer material hierarchies
- Business model classifications
- Performance tier definitions
- Known failure patterns
- Calibration benchmarks (6 reference products)

**windows_material_safety_knowledge_v1.1.md** (14KB)
- Category safety profile assessment
- Certification hierarchy (Tier 1-3)
- Frame material evaluations (PVC, fiberglass, aluminum, wood)
- Glazing system chemistry
- Installation foam advisory
- Interior finish safety assessment
- Healthy homes source hierarchy

**windows_deterministic_rubrics_v5.md** (37KB)
- Scoring tables for all metrics
- Quality subscore inputs (frame, hardware, glazing, finish)
- Durability subscore inputs (longevity, repairability, warranty)
- Performance subscore inputs (U-factor, air infiltration, SHGC, condensation, structural, VT)
- Data completeness grading
- Value indicator framework
- Overall score calculation methodology

**residentialist_universal_rubric_principles_v1.1.md** (15KB)
- 14 universal principles governing all categories
- Three-axis framework (Quality, Durability, Performance)
- Data hierarchy and certification floor scoring
- Three-tier data treatment (Active Vagueness, Certified-but-not-in-ADM, Genuinely Not Found)
- Warranty-lifespan alignment rules
- Professional consensus ceiling rules
- Geographic certification trust filter
- Principle validation through council sessions

**henley_windows_packet_v1.1.md** (31KB)
- Operator instructions for running the windows pipeline
- Windows-specific validation checklist
- Calibration products (6 benchmarks: Alpen Zenith, Marvin Elevate, Pella, Andersen, JW Siteline, JW V-2500)
- Three-bot prompts (Consensus Bot, Evaluator Bot, Material Safety Bot)
- Report assembly specifications

## Versioning

All files are tracked with Git for version history:
```bash
cd /home/ubuntu/.openclaw/workspace/residentialist
git log knowledge/
git show <commit>:knowledge/windows/windows_eval_knowledge_v1.1.md
```

S3 versioning is enabled so every upload preserves previous versions.

## Adding New Categories

When adding a new product category (e.g., faucets):

1. Create subdirectory: `mkdir -p knowledge/faucets/`
2. Create knowledge files:
   - `faucets_eval_knowledge_v1.0.md`
   - `faucets_material_safety_knowledge_v1.0.md`
   - `faucets_deterministic_rubrics_v1.0.md`
   - `faucets_packet_v1.0.md` (operator instructions)
3. Update this README
4. Push to S3: `./sync_to_s3.sh`

## Sync to S3

Push all knowledge files to AWS S3:

```bash
# From residentialist directory
./knowledge/sync_to_s3.sh

# Or manually
aws s3 sync knowledge/ s3://residentialist-knowledge/knowledge/ \
  --delete \
  --region us-east-2
```

The sync script preserves file versions in S3 (versioning is enabled on the bucket).

## Access Control

S3 Bucket: `residentialist-knowledge`
Region: `us-east-2` (same as EC2 instance)
Versioning: Enabled
Public Access: Blocked (IAM-only access)

Required AWS permissions:
- `s3:GetObject`
- `s3:PutObject`
- `s3:ListBucket`
- `s3:GetObjectVersion`

## Local Development

All knowledge files are checked into Git for local development:

```bash
# Clone locally
git clone <repo> residentialist

# Edit knowledge files
nano knowledge/windows/windows_eval_knowledge_v1.1.md

# Commit locally
git add knowledge/
git commit -m "Update Windows eval knowledge: add new source"

# Push to S3 when ready
./knowledge/sync_to_s3.sh
```

## File Size Reference

- Total knowledge base: ~112KB
- Windows category: ~112KB (100% of current knowledge base)
- Expected growth: ~20KB per new category when added

---

*Last Updated: March 7, 2026*  
*Managed by: sync_to_s3.sh*
