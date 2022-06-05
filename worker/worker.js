const someForm = `
  <!DOCTYPE html>
  <html>
  <body>
  <h1>Private Note</h1>
  <form action="/submit" method="post">
    <div>
      <p>Note:</p>
      <textarea name="note" id="note" rows="4" cols="50">shh</textarea>
    </div>
    <div>
      <label for="say">TTL: </label>
      <input type="number" name="ttl" id="ttl" value=30>
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
    if (event.request.url.includes('form')) {
        event.respondWith(rawHtmlResponse(someForm));
    }
    else if (event.request.method === 'GET') {
        event.respondWith(handleGetRequest(event.request))
    }
    else if (event.request.method === 'POST') {
        event.respondWith(handlePostRequest(event.request));
    }
})

async function handleGetRequest(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id')

    if (id && id.length === 36) {
        const note = JSON.parse(await NOTES.get(id));

        if (note) {
            if (note.views == 1) {
                await NOTES.delete(id);
            } else if (note.views > 1) {
                note.views--;
                const noteList = await NOTES.list({ prefix: id });
                await NOTES.put(id, JSON.stringify(note), { expiration: noteList.keys[0].expiration });
            };

            return new Response(JSON.stringify({
                error: false,
                id: id,
                note: note.note,
            }),
                {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
        } else {
            return new Response(JSON.stringify({
                error: true,
                statusText: 'Note not found',
            }),
                {
                    status: 404,
                    statusText: 'Not Found',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
        }
    } else {
        return new Response(JSON.stringify({
            error: true,
            statusText: 'Bad Request',
        }),
            {
                status: 400,
                statusText: 'Bad Request',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            });
    }
}

async function readRequestBody(request) {
    const { headers } = request;
    const contentType = headers.get('content-type') || '';

    if (contentType.includes('form')) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1];
        }
        return body;
    } else {
        return {
            error: true,
            statusText: 'Bad Request',
        };
    }
}

async function handlePostRequest(request) {
    const reqBody = await readRequestBody(request);

    if (reqBody.error) {
        return new Response(JSON.stringify(reqBody),
            {
                status: 400,
                statusText: 'Bad Request',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            });
    }

    if (reqBody.note) {
        noteObj = {}
        noteObj.note = reqBody.note
        noteObj.views = Math.floor(reqBody.views) || 1;
        noteObj.ttl = Math.floor(reqBody.ttl) || 30;

        const uuid = self.crypto.randomUUID();
        try {
            await NOTES.put(uuid, JSON.stringify(noteObj), { expirationTtl: noteObj.ttl * 24 * 60 * 60 });
        } catch (error) {
            console.log(error)
            return new Response(JSON.stringify({
                error: true,
                statusText: error.message,
            }),
                {
                    status: 500,
                    statusText: 'Internal Server Error',
                    headers: {
                        'content-type': 'application/json;charset=UTF-8',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
        }

        return new Response(JSON.stringify({
            id: uuid
        }),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                },
            });
    }

    return new Response(JSON.stringify({
        error: true,
        statusText: "Bad Request",
    }),
        {
            status: 400,
            statusText: 'Bad Request',
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
            },
        });
}