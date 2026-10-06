#!/usr/bin/env bash
set -euo pipefail
: "${AWS_SITE_BUCKET:?}" "${AWS_DISTRIBUTION_ID:?}" "${RELEASE_SHA:?}"
[[ "$RELEASE_SHA" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid release SHA' >&2; exit 1; }
node --input-type=module -e 'import fs from "node:fs"; if(JSON.parse(fs.readFileSync("dist/release.json", "utf8")).revision !== process.env.RELEASE_SHA) throw new Error("Artifact revision mismatch")'

# Keep every release bundle for recovery; S3 also retains prior object versions.
tar -czf "$RUNNER_TEMP/portfolio-release.tar.gz" -C dist .
aws s3 cp "$RUNNER_TEMP/portfolio-release.tar.gz" "s3://$AWS_SITE_BUCKET/_releases/$RELEASE_SHA/site.tar.gz" --cache-control 'private, no-store'
# Upload hashes before HTML. Old hashed assets remain usable for cached documents.
aws s3 sync dist/_astro/ "s3://$AWS_SITE_BUCKET/_astro/" --cache-control 'public, max-age=31536000, immutable'
aws s3 sync dist/ "s3://$AWS_SITE_BUCKET/" --exclude '_astro/*' --exclude '_releases/*' --delete --cache-control 'public, max-age=60, must-revalidate'
# A wildcard also clears clean URL aliases and cached 404s; hashed files are unchanged.
invalidation=$(aws cloudfront create-invalidation --distribution-id "$AWS_DISTRIBUTION_ID" --paths '/*' --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id "$AWS_DISTRIBUTION_ID" --id "$invalidation"
