export async function api<T>(url:string, method='GET', body?:unknown):Promise<T> {
  const response=await fetch(url,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  const value=await response.json();
  if(!response.ok) throw new Error(value.error ?? 'Falha de comunicação.');
  return value as T;
}
