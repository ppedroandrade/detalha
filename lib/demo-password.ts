// Hash no navegador é apenas higiene da demonstração, não autenticação de produção.
export async function demoPasswordHash(password:string, id:string) {
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${id}:${password}`));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
