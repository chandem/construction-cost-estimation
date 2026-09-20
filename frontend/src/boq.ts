import type { Project } from "./api";
const API_BASE_URL=(import.meta.env.VITE_API_BASE_URL as string|undefined)?.replace(/\/$/,"")||"http://localhost:8000";
export type BOQItem={id:string;item_no:number;description:string;unit:string;quantity:number;unit_rate:number;amount:number;rate_analysis_id?:string|null;section_id?:string|null};
export type BOQSection={id:string;project_id:string;name:string;code?:string|null;description?:string|null;sort_order:number};
async function request<T>(url:string,options?:RequestInit):Promise<T>{const r=await fetch(`${API_BASE_URL}${url}`,options);if(!r.ok)throw new Error(`Request failed (${r.status})`);return r.status===204?undefined as T:r.json()}
export const listBOQ=(id:string)=>request<BOQItem[]>(`/projects/${id}/boq`);
export const listSections=(id:string)=>request<BOQSection[]>(`/projects/${id}/boq/sections`);
export const createBOQ=(projectId:string,item:Omit<BOQItem,"id"|"amount">)=>request<BOQItem>(`/projects/${projectId}/boq`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});
