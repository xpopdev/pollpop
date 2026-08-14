// PollPop analytics — localStorage + console, offline, no backend
// Events: poll_view, vote, cta_view, cta_click, fake_door_submit

const LS_EVENTS = 'pollpop_events';
const LS_TALLIES = 'pollpop_tallies';
const LS_VOTED = 'pollpop_voted';
const LS_VOTER_ID = 'pollpop_voter_id';

function uid(){
  return Math.random().toString(36).slice(2,9);
}

function getVoterId(){
  let id = localStorage.getItem(LS_VOTER_ID);
  if(!id){ id = 'v_'+uid()+Date.now().toString(36); localStorage.setItem(LS_VOTER_ID, id); }
  return id;
}

function getEvents(){
  try{ return JSON.parse(localStorage.getItem(LS_EVENTS)||'[]'); }catch{ return []; }
}
function saveEvents(arr){ localStorage.setItem(LS_EVENTS, JSON.stringify(arr)); }

function track(type, data={}){
  const ev = {
    type,
    timestamp: new Date().toISOString(),
    voter_id: getVoterId(),
    ...data
  };
  const arr = getEvents();
  arr.push(ev);
  saveEvents(arr);
  // console.log for validation — visible in devtools + can be scraped
  console.log(`[PollPop] ${type}`, ev);
  // also fire a synthetic count bump for metrics freshness
  try{ window.dispatchEvent(new CustomEvent('pollpop:track', {detail:ev})); }catch{}
  return ev;
}

// tallies: { pollId: { optionId: count } }
function getTallies(){ try{ return JSON.parse(localStorage.getItem(LS_TALLIES)||'null')||null; }catch{ return null; } }
function saveTallies(t){ localStorage.setItem(LS_TALLIES, JSON.stringify(t)); }

function getVotedMap(){ try{ return JSON.parse(localStorage.getItem(LS_VOTED)||'{}'); }catch{ return {}; } }
function saveVotedMap(m){ localStorage.setItem(LS_VOTED, JSON.stringify(m)); }

function hasVoted(pollId){ return !!getVotedMap()[pollId]; }
function setVoted(pollId, optionId){
  const m = getVotedMap(); m[pollId]=optionId; saveVotedMap(m);
}

// metrics helpers
function computeMetrics(){
  const events = getEvents();
  const byType = (t)=> events.filter(e=>e.type===t);
  const pollViews = byType('poll_view').length;
  const votes = byType('vote').length;
  const ctaViews = byType('cta_view').length;
  const ctaClicks = byType('cta_click').length;
  const fakeSubmits = byType('fake_door_submit').length;

  // unique voters = distinct voter_id that emitted a vote event (more accurate than poll_view)
  const uniqueVoters = new Set(byType('vote').map(e=>e.voter_id)).size;
  // fallback: if no votes yet, count unique voter_ids overall
  const uniqOverall = new Set(events.map(e=>e.voter_id)).size;

  const ctr = uniqueVoters ? (ctaClicks / uniqueVoters) : 0;
  const ctrOverall = uniqOverall ? (ctaClicks / uniqOverall) : 0;

  // per-poll breakdown
  const perPoll = {};
  for(const e of events){
    const pid = e.poll_id || 'unknown';
    if(!perPoll[pid]) perPoll[pid]={ views:0, votes:0, cta_views:0, cta_clicks:0, fake_submits:0 };
    if(e.type==='poll_view') perPoll[pid].views++;
    if(e.type==='vote') perPoll[pid].votes++;
    if(e.type==='cta_view') perPoll[pid].cta_views++;
    if(e.type==='cta_click') perPoll[pid].cta_clicks++;
    if(e.type==='fake_door_submit') perPoll[pid].fake_submits++;
  }

  return {
    total_events: events.length,
    poll_views: pollViews,
    votes,
    cta_views: ctaViews,
    cta_clicks: ctaClicks,
    fake_submits: fakeSubmits,
    unique_voters: uniqueVoters,
    unique_voters_overall: uniqOverall,
    ctr, // PRIMARY: cta_clicks / unique_voters
    ctr_overall: ctrOverall,
    per_poll: perPoll,
    events
  };
}

function verdictForCtr(ctr){
  if(ctr >= 0.08) return { label:'PASS — build real MVP', cls:'pass', detail:'CTR ≥ 0.08 — voter→creator loop validated. Proceed to 1–2 wk Supabase MVP.' };
  if(ctr >= 0.03) return { label:'RETRY — one iteration allowed', cls:'retry', detail:'CTR 0.03–0.08 — tweak CTA copy/placement/images, re-measure. If still <0.08 → KILL.' };
  return { label:'KILL — return to research', cls:'kill', detail:'CTR < 0.03 — voter→creator assumption falsified. Archive PollPop, try next idea.' };
}

// expose globally for console use + metrics.html
window.PollPopAnalytics = { track, getEvents, computeMetrics, verdictForCtr, getVoterId, hasVoted, setVoted, getTallies, saveTallies, getVotedMap };
