## [2.4.1](https://github.com/ashcoft/DomainCheck/compare/v2.4.0...v2.4.1) (2026-10-17)

### Bug Fixes

* build lookup links from encoded path segments ([e0ee7e5](https://github.com/ashcoft/DomainCheck/commit/e0ee7e5086e432177259d4fcf8055b3ea46e121e))
* build-release needs only test job ([e7366bc](https://github.com/ashcoft/DomainCheck/commit/e7366bc229349fa1ea0286b9918c399b0cc6170e))
* keep the lookup URL helper in an existing module ([1244682](https://github.com/ashcoft/DomainCheck/commit/1244682e80c22d47dfc165572bee0a6478a3d63b))
* Pin GitHub Actions to full SHA hashes for security ([618f01f](https://github.com/ashcoft/DomainCheck/commit/618f01fb3ad11c57defe309a9d2b010e6d66de3f))
* update build-release needs to include test job ([a7705ae](https://github.com/ashcoft/DomainCheck/commit/a7705aecd7f270fafab34fa6d526dba6391f233f))

# udomainflag

## 2.4.0

### Minor Changes

- Add HTTP protocol indicator feature (HTTP/1, HTTP/2, HTTP/3, QUIC, SPDY)
- Integration from pd4d10/http-indicator

### Breaking Changes

- Refactored to Chromium-only extension (removed Firefox support)
