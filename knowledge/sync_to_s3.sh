#!/bin/bash

# Sync The Residentialist Knowledge Base to AWS S3
# Usage: ./sync_to_s3.sh [--dry-run] [--profile <aws-profile>]

set -e

# Configuration
BUCKET="residentialist-knowledge"
REGION="us-east-2"
KNOWLEDGE_DIR="$(dirname "$0")"
AWS_PROFILE="${AWS_PROFILE:-default}"

# Parse arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--dry-run] [--profile <aws-profile>]"
      exit 1
      ;;
  esac
done

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== The Residentialist S3 Sync ===${NC}"
echo "Bucket: $BUCKET"
echo "Region: $REGION"
echo "Profile: $AWS_PROFILE"
echo "Knowledge Directory: $KNOWLEDGE_DIR"
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${YELLOW}Error: AWS CLI not found. Install it first:${NC}"
  echo "  pip install awscli"
  echo "  aws configure --profile $AWS_PROFILE"
  exit 1
fi

# Check if bucket exists
echo -e "${BLUE}Checking bucket...${NC}"
if ! aws s3api head-bucket --bucket "$BUCKET" --region "$REGION" --profile "$AWS_PROFILE" 2>/dev/null; then
  echo -e "${YELLOW}Bucket does not exist. Create it first:${NC}"
  echo ""
  echo "  aws s3api create-bucket \\"
  echo "    --bucket $BUCKET \\"
  echo "    --region $REGION \\"
  echo "    --create-bucket-configuration LocationConstraint=$REGION \\"
  echo "    --profile $AWS_PROFILE"
  echo ""
  echo "  # Enable versioning:"
  echo "  aws s3api put-bucket-versioning \\"
  echo "    --bucket $BUCKET \\"
  echo "    --versioning-configuration Status=Enabled \\"
  echo "    --region $REGION \\"
  echo "    --profile $AWS_PROFILE"
  echo ""
  exit 1
fi
echo -e "${GREEN}✅ Bucket exists${NC}"

# Check versioning is enabled
VERSIONING=$(aws s3api get-bucket-versioning \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --profile "$AWS_PROFILE" \
  --query 'Status' \
  --output text)

if [ "$VERSIONING" != "Enabled" ]; then
  echo -e "${YELLOW}Warning: Versioning is not enabled. Enabling...${NC}"
  aws s3api put-bucket-versioning \
    --bucket "$BUCKET" \
    --versioning-configuration Status=Enabled \
    --region "$REGION" \
    --profile "$AWS_PROFILE"
fi
echo -e "${GREEN}✅ Versioning enabled${NC}"

# Sync knowledge directory
echo ""
echo -e "${BLUE}Syncing knowledge files...${NC}"

if [ "$DRY_RUN" = true ]; then
  echo "(DRY RUN - no files will be uploaded)"
  aws s3 sync "$KNOWLEDGE_DIR" "s3://$BUCKET/knowledge/" \
    --region "$REGION" \
    --profile "$AWS_PROFILE" \
    --exclude "sync_to_s3.sh" \
    --exclude ".git*" \
    --exclude "__pycache__" \
    --delete \
    --dryrun
else
  aws s3 sync "$KNOWLEDGE_DIR" "s3://$BUCKET/knowledge/" \
    --region "$REGION" \
    --profile "$AWS_PROFILE" \
    --exclude "sync_to_s3.sh" \
    --exclude ".git*" \
    --exclude "__pycache__" \
    --delete
fi

echo ""
echo -e "${GREEN}✅ Sync complete${NC}"
echo ""
echo "S3 URL: https://$BUCKET.s3.$REGION.amazonaws.com/knowledge/"
echo ""
echo "View all versions:"
echo "  aws s3api list-object-versions --bucket $BUCKET --prefix knowledge/ --profile $AWS_PROFILE"
echo ""
echo "List current files:"
echo "  aws s3 ls s3://$BUCKET/knowledge/ --recursive --region $REGION --profile $AWS_PROFILE"
