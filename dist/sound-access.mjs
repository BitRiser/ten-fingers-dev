// A cosmetic feature gate, not authentication or protection of private data.
const digest='8835f492a7c86f65d900be580894bbc8f8becf17daa5c20ca2ba9526c7f7adbf';
export async function verifySoundCode(value){
 if(typeof value!=='string'||!/^\d{4}$/.test(value))return false;
 const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')===digest;
}
