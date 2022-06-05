# Gone Note
 
 ## Intro
 Send encrypted self-destructing notes securely.
 
 ## Architecture
- Frontend - fully static HTML deployed from this repo to [Cloudflare Pages](https://pages.cloudflare.com/).
- Backend - powered by a [Cloudflare Workers](https://workers.cloudflare.com/) - a global serverless runtime. The worker source is in `./worker`.
- Storage - Encrypted notes are stored on Cloudflare Workers [KV](https://developers.cloudflare.com/workers/runtime-apis/kv/), a global, low-latency, key-value data store.
 
 ## How it works
 1. A note is encrypted with a key that is generated locally in the browser.
 2. The encrypted note value is sent to a Cloudflare worker that saves it in KV.
 3. The worker returns an ID which can be used to get the note.
 4. The browser generates a link containing the note ID and the key.
 5. When a note is read using the link, the worker is contacted with the note ID. The key is never sent.
 6. The browser uses the key from the link to decrypt the note value received by the worker.
 7. The encrypted note is deleted from KV when its view count is exceeded, or when it expires.

## Security
- Zero knowledge - the key is never sent to the backend.
- Keys are generated securely by [CryptoJS](https://github.com/brix/crypto-js).
- Notes are encrypted by CryptoJS using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard).
- The CryptoJS library is verified using [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).
- Note links are protected by [HTTPS](https://en.wikipedia.org/wiki/HTTPS#Overview).

## To do
- The code needs to be refactored and made more readable to make it easier to verify the trustworthiness of the service, or raise issues.
- Branding and SEO/Open Graph improvements are needed.
