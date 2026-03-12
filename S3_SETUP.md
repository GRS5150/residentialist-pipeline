# S3 Bucket Setup for Knowledge Base

The Residentialist knowledge base is synced to AWS S3 for backup, versioning, and team access.

## Step 1: Prerequisites

You need:
1. AWS Account with us-east-2 region access
2. AWS CLI installed locally
3. AWS credentials configured

### Install AWS CLI

```bash
# macOS
brew install awscli

# Ubuntu/Linux
sudo apt install awscli

# Or via pip (any OS)
pip install awscli
```

## Step 2: Configure AWS Credentials

```bash
aws configure --profile residentialist
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-2`
- Default output format: `json`

### Get Your AWS Credentials

1. Go to AWS Console → IAM
2. Click "Users" → Your user name
3. Click "Security Credentials" tab
4. Create "Access Key" (if you don't have one)
5. Copy Access Key ID and Secret Access Key
6. Paste them when running `aws configure`

**Important**: Keep these credentials secret. Do NOT commit them to Git.

## Step 3: Create the S3 Bucket

Run this once to create the bucket:

```bash
aws s3api create-bucket \
  --bucket residentialist-knowledge \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2 \
  --profile residentialist
```

If you get an error about the bucket name already existing, it means the bucket is already created (S3 bucket names are globally unique).

## Step 4: Enable Versioning

```bash
aws s3api put-bucket-versioning \
  --bucket residentialist-knowledge \
  --versioning-configuration Status=Enabled \
  --region us-east-2 \
  --profile residentialist
```

Verify versioning is enabled:

```bash
aws s3api get-bucket-versioning \
  --bucket residentialist-knowledge \
  --region us-east-2 \
  --profile residentialist
```

Output should show: `"Status": "Enabled"`

## Step 5: Block Public Access (Security)

```bash
aws s3api put-public-access-block \
  --bucket residentialist-knowledge \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
  --region us-east-2 \
  --profile residentialist
```

This ensures only your AWS account can access the bucket.

## Step 6: Sync Knowledge Files to S3

From the residentialist directory:

```bash
cd /home/ubuntu/.openclaw/workspace/residentialist

# Dry run first (shows what would be uploaded)
./knowledge/sync_to_s3.sh --dry-run --profile residentialist

# If it looks good, do the actual sync
./knowledge/sync_to_s3.sh --profile residentialist
```

You should see:
```
✅ Bucket exists
✅ Versioning enabled
✅ Sync complete

S3 URL: https://residentialist-knowledge.s3.us-east-2.amazonaws.com/knowledge/
```

## Step 7: Verify Upload

List files in S3:

```bash
aws s3 ls s3://residentialist-knowledge/knowledge/ \
  --recursive \
  --region us-east-2 \
  --profile residentialist
```

View all versions (including history):

```bash
aws s3api list-object-versions \
  --bucket residentialist-knowledge \
  --prefix knowledge/ \
  --region us-east-2 \
  --profile residentialist
```

Download a file from S3:

```bash
aws s3 cp s3://residentialist-knowledge/knowledge/windows/windows_eval_knowledge_v1.1.md . \
  --region us-east-2 \
  --profile residentialist
```

## Usage: Sync Updates

After editing knowledge files locally:

```bash
# From residentialist directory
./knowledge/sync_to_s3.sh --profile residentialist
```

This will:
1. Upload new/changed files
2. Keep version history (S3 versioning)
3. Delete files from S3 that you deleted locally
4. Show you the S3 URL

## S3 Bucket Details

**Bucket Name**: `residentialist-knowledge`  
**Region**: `us-east-2` (Ohio)  
**Versioning**: Enabled (all file changes preserved)  
**Public Access**: Blocked (IAM only)  
**URL**: `https://residentialist-knowledge.s3.us-east-2.amazonaws.com/knowledge/`

## Directory Structure in S3

```
s3://residentialist-knowledge/
└── knowledge/
    ├── windows/
    │   ├── windows_eval_knowledge_v1.1.md
    │   ├── windows_material_safety_knowledge_v1.1.md
    │   ├── windows_deterministic_rubrics_v5.md
    │   ├── residentialist_universal_rubric_principles_v1.1.md
    │   └── henley_windows_packet_v1.1.md
    ├── faucets/        (when created)
    ├── countertops/    (when created)
    ├── system/         (when created)
    └── README.md
```

## Backup & Recovery

Since versioning is enabled, you can restore any previous version:

```bash
# List all versions of a file
aws s3api list-object-versions \
  --bucket residentialist-knowledge \
  --prefix "knowledge/windows/windows_eval_knowledge_v1.1.md" \
  --region us-east-2 \
  --profile residentialist

# Restore a specific version
aws s3api get-object \
  --bucket residentialist-knowledge \
  --key "knowledge/windows/windows_eval_knowledge_v1.1.md" \
  --version-id <VERSION_ID> \
  windows_eval_knowledge_v1.1.md \
  --region us-east-2 \
  --profile residentialist
```

## Costs

AWS S3 pricing for The Residentialist knowledge base:
- **Storage**: ~112KB = essentially free (<$0.01/month)
- **Versioning**: Minimal cost (just storage of older versions)
- **Requests**: Minimal cost (sync script makes ~10 requests)
- **Transfer**: Free (in region, first 1GB/month free)

**Estimated monthly cost**: <$1 (well within free tier)

## Troubleshooting

### "Bucket already exists"
The bucket name is globally unique. If it exists, it was created by you or someone else. To verify:
```bash
aws s3api head-bucket --bucket residentialist-knowledge --region us-east-2 --profile residentialist
```

### "Access Denied"
- Check AWS credentials are set correctly: `aws sts get-caller-identity --profile residentialist`
- Verify bucket exists and you have permissions
- Check IAM user has `S3FullAccess` policy (or at least `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`)

### Sync is slow
- Normal for first sync (all files uploaded)
- Subsequent syncs only upload changes
- Expect ~1-2 seconds per sync

## One-Time Setup Checklist

- [ ] Install AWS CLI (`pip install awscli`)
- [ ] Configure credentials (`aws configure --profile residentialist`)
- [ ] Create bucket (run the `create-bucket` command above)
- [ ] Enable versioning (run the `put-bucket-versioning` command above)
- [ ] Block public access (run the `put-public-access-block` command above)
- [ ] Sync files (`./knowledge/sync_to_s3.sh --profile residentialist`)
- [ ] Verify upload (run `aws s3 ls s3://residentialist-knowledge/...`)

## Regular Usage

After one-time setup:

```bash
# Whenever you update knowledge files
cd /home/ubuntu/.openclaw/workspace/residentialist
./knowledge/sync_to_s3.sh --profile residentialist
```

That's it. Everything else is automatic.

---

**Bucket URL**: https://residentialist-knowledge.s3.us-east-2.amazonaws.com/knowledge/

**Estimated setup time**: 5 minutes  
**First sync time**: 30 seconds  
**Future syncs**: 1-2 seconds  
**Monthly cost**: <$1
