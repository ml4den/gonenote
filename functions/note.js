const someForm = `
  <!DOCTYPE html>
  <html>
  <body>
  <h1>Private Note</h1>
  <form action="/demos/requests" method="post">
    <div>
      <p>Note:</p>
      <textarea name="note" id="note" rows="4" cols="50">shh</textarea>
    </div>
    <div>
      <label for="say">Views: </label>
      <input type="number" name="views" id="views" value=1>
    </div>
    <div>
      <button>Save note</button>
    </div>
  </form>
  </body>
  </html>
  `;

function rawHtmlResponse(html) {
  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  };
  console.log('Returning form')
  return new Response(html, init);
}

addEventListener("fetch", event => {
  if (event.request.url.includes('form')){
      event.respondWith(rawHtmlResponse(someForm));
  }
  else if (event.request.method === 'GET'){
      event.respondWith(handleGetRequest(event.request))
  }
  else if (event.request.method === 'POST'){
      event.respondWith(handlePostRequest(event.request));
  }
})

async function handleGetRequest(request) {
    const { searchParams } = new URL(request.url);
    if (request.method === 'GET'){
        let id = searchParams.get('id')
        const note = await NOTES.get(id);
        console.log(note)
        console.log('id: ' + id)
        return new Response("was a get")
        //handleGetRequest(searchParams);
    }
    return new Response("Hello world")
}

async function readRequestBody(request) {
  console.log('readRequestBody fired')
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('form')) {
    const formData = await request.formData();
    const body = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return JSON.stringify(body);
  } else {
    return 'The request was invalid';
  }
}

async function handlePostRequest(request) {
  console.log('handlePostRequest fired')
  const reqBody = await readRequestBody(request);
  const uuid = self.crypto.randomUUID();
  await NOTES.put(uuid, reqBody, {expirationTtl: 2592000});
  reqBody['id'] = uuid;
  console.log(reqBody)
  return new Response(reqBody);
}