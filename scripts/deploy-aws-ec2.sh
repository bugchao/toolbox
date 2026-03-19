#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

APP_NAME="${APP_NAME:-toolbox}"
AWS_REGION="${AWS_REGION:?AWS_REGION is required}"
ECR_REPOSITORY="${ECR_REPOSITORY:?ECR_REPOSITORY is required}"
EC2_HOST="${EC2_HOST:?EC2_HOST is required}"
EC2_USER="${EC2_USER:?EC2_USER is required}"
EC2_KEY_PATH="${EC2_KEY_PATH:?EC2_KEY_PATH is required}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
HOST_PORT="${HOST_PORT:-80}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REGISTRY="${ECR_REGISTRY:-${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com}"
IMAGE_TAG="${IMAGE_TAG:-${APP_NAME}-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
IMAGE="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "==> Deploy target"
echo "APP_NAME=${APP_NAME}"
echo "AWS_REGION=${AWS_REGION}"
echo "ECR_REGISTRY=${ECR_REGISTRY}"
echo "ECR_REPOSITORY=${ECR_REPOSITORY}"
echo "IMAGE=${IMAGE}"
echo "EC2=${EC2_USER}@${EC2_HOST}"
echo "PORT=${HOST_PORT}:${CONTAINER_PORT}"

if [[ ! -f "${EC2_KEY_PATH}" ]]; then
  echo "EC2 key file not found: ${EC2_KEY_PATH}" >&2
  exit 1
fi

echo "==> Docker build"
docker build -t "${IMAGE}" "${ROOT_DIR}"

echo "==> Login to Amazon ECR"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "==> Push image"
docker push "${IMAGE}"

echo "==> Deploy on EC2"
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "${EC2_KEY_PATH}" "${EC2_USER}@${EC2_HOST}" \
  AWS_REGION="${AWS_REGION}" \
  ECR_REGISTRY="${ECR_REGISTRY}" \
  IMAGE="${IMAGE}" \
  APP_NAME="${APP_NAME}" \
  HOST_PORT="${HOST_PORT}" \
  CONTAINER_PORT="${CONTAINER_PORT}" \
  'bash -se' <<'EOF'
set -euo pipefail

aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
docker pull "${IMAGE}"
docker stop "${APP_NAME}" || true
docker rm "${APP_NAME}" || true
docker run -d \
  --name "${APP_NAME}" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart always \
  "${IMAGE}"
docker image prune -f
EOF

echo "==> Verify deployment"
sleep 10
curl -f "http://${EC2_HOST}" >/dev/null

echo "Deployment completed: ${IMAGE}"
