export async function readServerData(): Promise<string> {
  const resp = await fetch('/api/hello');
  const data = await resp.json();
  console.log('Data from server:', data);
  return data.message;
}
