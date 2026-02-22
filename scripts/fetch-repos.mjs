#!/usr/bin/env node
/**
 * Fetch GitHub org repositories + topics and generate data/repos.json
 *
 * Required env:
 *   ORG            (e.g. gargiolastech)
 * Optional env:
 *   GH_TOKEN       (recommended to avoid low unauth rate limits)
 *   PER_PAGE       (default 100)
 *   MAX_PAGES      (default 10)
 *
 * Writes:
 *   data/repos.json   (keyed by org)
 */
import fs from "node:fs/promises";

const ORG = process.env.ORG || "gargiolastech";
const TOKEN = process.env.GH_TOKEN || "";
const PER_PAGE = Number(process.env.PER_PAGE || "100");
const MAX_PAGES = Number(process.env.MAX_PAGES || "10");
const API = "https://api.github.com";

const headers = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

async function gh(url){
  const res = await fetch(url, { headers });
  if(!res.ok){
    const t = await res.text();
    throw new Error(`${res.status} ${res.statusText} for ${url}\n${t}`);
  }
  return res;
}

async function listOrgRepos(){
  const repos = [];
  for(let page=1; page<=MAX_PAGES; page++){
    const url = `${API}/orgs/${ORG}/repos?per_page=${PER_PAGE}&page=${page}&type=public&sort=updated&direction=desc`;
    const res = await gh(url);
    const data = await res.json();
    repos.push(...data);
    if(data.length < PER_PAGE) break;
  }
  return repos;
}

async function getTopics(full_name){
  const url = `${API}/repos/${full_name}/topics`;
  const res = await gh(url);
  const data = await res.json();
  return data.names ?? [];
}

function pick(repo, topics){
  return {
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
    description: repo.description,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    open_issues_count: repo.open_issues_count,
    language: repo.language,
    topics,
    updated_at: repo.updated_at,
    pushed_at: repo.pushed_at,
    created_at: repo.created_at,
    archived: repo.archived,
    visibility: repo.visibility,
    homepage: repo.homepage,
  };
}

async function main(){
  console.log(`Fetching org repos for: ${ORG}`);
  const repos = await listOrgRepos();
  console.log(`Repos: ${repos.length}`);

  const out = [];
  for(const r of repos){
    let topics = [];
    try{
      topics = await getTopics(r.full_name);
    }catch(e){
      console.warn(`Topics failed for ${r.full_name}: ${String(e).slice(0,160)}...`);
    }
    out.push(pick(r, topics));
  }

  const payload = {
    [ORG]: {
      generated_at: new Date().toISOString(),
      repos: out,
    }
  };

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile("data/repos.json", JSON.stringify(payload, null, 2), "utf-8");
  console.log("Written: data/repos.json");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
