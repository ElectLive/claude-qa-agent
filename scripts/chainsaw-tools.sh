#!/usr/bin/env sh
# Installs what scripts/chainsaw-selftest.sh needs into $1 (default ./.selftest-chainsaw-bin):
# the chainsaw release binary (checksum-verified) and setup-envtest (needs Go). Used by CI.
set -eu
CHAINSAW_VERSION=${CHAINSAW_VERSION:-v0.2.15}
ENVTEST_VERSION=${ENVTEST_VERSION:-release-0.21}
bin=$(mkdir -p "${1:-.selftest-chainsaw-bin}" && cd "${1:-.selftest-chainsaw-bin}" && pwd)
arch=$(uname -m | sed 's/x86_64/amd64/; s/aarch64/arm64/')
tgz="chainsaw_linux_${arch}.tar.gz"
base="https://github.com/kyverno/chainsaw/releases/download/${CHAINSAW_VERSION}"
cd "$bin"
curl -sSLfO "$base/$tgz"
curl -sSLf "$base/checksums.txt" | grep " $tgz\$" | sha256sum -c -
tar xzf "$tgz" chainsaw && rm "$tgz"
GOBIN="$bin" go install "sigs.k8s.io/controller-runtime/tools/setup-envtest@${ENVTEST_VERSION}"
echo "$bin"
