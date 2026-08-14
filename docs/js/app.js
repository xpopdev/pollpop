// PollPop shared helpers — fetch polls, render cards, tallies
async function fetchPolls(){
  const res = await fetch('data/polls.json');
  if(!res.ok) throw new Error('Failed to load polls.json');
  return res.json();
}
// also try absolute path if relative fails (when served from /p/)
async function fetchPollsRobust(){
  try{ return await fetchPolls(); }catch{
    const res = await fetch('../data/polls.json');
    if(!res.ok) throw new Error('Failed to load polls.json (robust)');
    return res.json();
  }
}

function getPollIdFromUrl(){
  const u = new URL(window.location.href);
  return u.searchParams.get('id') || u.searchParams.get('poll') || null;
}

function totalVotes(poll, tallies){
  const t = tallies && tallies[poll.id] ? tallies[poll.id] : poll.votes;
  return Object.values(t).reduce((a,b)=>a+b,0);
}
function votesFor(poll, tallies, optionId){
  const t = tallies && tallies[poll.id] ? tallies[poll.id] : poll.votes;
  return t[optionId]||0;
}

function shareUrlFor(poll){
  // canonical share URL — query param form (works everywhere)
  // also p/{slug}.html exists for OG crawlers
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  // if we're on index or poll.html, produce poll.html?id=slug
  // normalize: if current path contains pollpop-validation, keep it
  const origin = window.location.origin;
  const path = window.location.pathname;
  // derive root
  let root = path;
  if(root.includes('poll.html')) root = root.replace('poll.html','');
  if(root.includes('/p/')) root = root.replace(/\/p\/.*$/,'/');
  // fallback: use current directory
  const pollUrl = origin + root + 'poll.html?id=' + encodeURIComponent(poll.id);
  return pollUrl;
}

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }catch{
    const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); return true;
  }
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

window.PollPop = { fetchPolls, fetchPollsRobust, getPollIdFromUrl, totalVotes, votesFor, shareUrlFor, copyText, escapeHtml };
