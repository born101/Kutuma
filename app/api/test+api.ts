export async function GET(request: Request) {
  console.log('[Test API] GET request received');
  return new Response(JSON.stringify({ message: 'Test API works!' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(request: Request) {
  console.log('[Test API] POST request received');
  return new Response(JSON.stringify({ message: 'Test API POST works!' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
