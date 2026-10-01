/** Small build-time Markdown subset: no HTML evaluation or runtime dependencies. */
const listMatch = line => /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
const tableLine = line => /^\s*\|.*\|\s*$/.test(line);
const tableCells = line => line.trim().slice(1,-1).split(/(?<!\\)\|/).map(s=>s.trim().replace(/\\\|/g,'|'));
const separator = line => tableLine(line) && tableCells(line).every(c=>/^:?-{3,}:?$/.test(c));
export function parseBlocks(text) {
  const lines=text.replace(/\r\n?/g,'\n').split('\n');
  const blocks=[]; let i=0;
  const startBlock = index => !lines[index]?.trim() || listMatch(lines[index]) || tableLine(lines[index]) || /^\s*>/.test(lines[index]);
  function list(base) {
    const ordered=/\d/.test(listMatch(lines[i])[2]); const items=[];
    while(i<lines.length) {
      const m=listMatch(lines[i]);
      if(!m || m[1].length!==base || /\d/.test(m[2])!==ordered) break;
      const item={text:m[3]};i++;
      while(i<lines.length) {
        if(!lines[i].trim()) {
          let next=i+1;while(next<lines.length&&!lines[next].trim())next++;
          const nm=listMatch(lines[next]??'');
          if(nm && nm[1].length>=base) {i=next;continue;}
          break;
        }
        const child=listMatch(lines[i]);
        if(child && child[1].length>base) {
          (item.children??=[]).push(list(child[1].length));continue;
        }
        if(child || !/^\s+\S/.test(lines[i])) break;
        item.text+=' '+lines[i].trim();i++;
      }
      items.push(item);
    }
    return {kind:'list',ordered,items};
  }
  while(i<lines.length) {
    if(!lines[i].trim() || /^\s*---+\s*$/.test(lines[i])) {i++;continue;}
    if(tableLine(lines[i])&&separator(lines[i+1]??'')) {
      const columns=tableCells(lines[i]);i+=2;const rows=[];
      while(i<lines.length&&tableLine(lines[i])) {
        const row=tableCells(lines[i++]);
        if(row.length!==columns.length)throw new Error(`Malformed table: expected ${columns.length} cells, found ${row.length}`);
        rows.push(row);
      }
      blocks.push({kind:'table',columns,rows});continue;
    }
    if(tableLine(lines[i]))throw new Error(`Table missing separator: ${lines[i]}`);
    const lm=listMatch(lines[i]); if(lm){blocks.push(list(lm[1].length));continue;}
    if(/^\s*>/.test(lines[i])) {
      const quote=[];while(i<lines.length&&/^\s*>/.test(lines[i]))quote.push(lines[i++].replace(/^\s*>\s?/,''));
      blocks.push({kind:'quote',text:quote.join(' ')});continue;
    }
    const p=[lines[i++].trim()];while(i<lines.length&&!startBlock(i))p.push(lines[i++].trim());
    blocks.push({kind:'paragraph',text:p.join(' ')});
  }
  return blocks;
}

export function splitLessons(source) {
  // Big-paste exports can join the next heading directly to the previous answer.
  const clean=source.replace(/\r\n?/g,'\n').replace(/(?<!\n)(## Materials 101\s*·\s*Lesson\s+\d+:)/g,'\n\n$1');
  const headings=[...clean.matchAll(/^## Materials 101\s*·\s*Lesson\s+(\d+):\s*(.+)$/gm)];
  if(headings.length!==30)throw new Error(`Expected 30 Materials lessons, found ${headings.length}`);
  return headings.map((m,i)=>{
    const number=Number(m[1]);if(number!==i+1)throw new Error(`Missing, duplicate or out-of-order lesson ${i+1}`);
    let body=clean.slice(m.index+m[0].length,headings[i+1]?.index??clean.length).trim();
    // Exporter/browser handoff chatter is not course content.
    if(number===30)body=body.split(/\n---\s*\n/)[0].trim();
    return {number,title:m[2].trim(),body};
  });
}

export function parseLesson({number,title,body},lessonId,notes=[],sources=[]) {
  const practiceAt=body.search(/^\*\*Try one[.:]/m);
  let practice;
  if(practiceAt>=0) {
    let p=body.slice(practiceAt).replace(/^\*\*Try one[.:]\*\*\s*/, '').trim();
    body=body.slice(0,practiceAt).trim();
    // Answer may follow the last question on the same line.
    const answer=p.search(/(?:You should get|Answers:|Answer:|Screen, then pick\. Answer:|Screen, rank, and state the price\. Answer:|Possible answers:)/);
    if(answer<0)throw new Error(`Lesson ${number} has a practice question without an answer`);
    practice={prompt:parseBlocks(p.slice(0,answer).trim()),answer:parseBlocks(p.slice(answer).trim())};
  }
  const headings=[...body.matchAll(/^###\s+(.+)$/gm)];
  if(!headings.length)throw new Error(`Lesson ${number} has no sections`);
  const intro=parseBlocks(body.slice(0,headings[0].index).trim());
  const sections=headings.map((m,i)=>({heading:m[1].trim(),blocks:parseBlocks(body.slice(m.index+m[0].length,headings[i+1]?.index??body.length).trim())}));
  for(const s of sections)if(!s.blocks.length)throw new Error(`Empty section ${number}/${s.heading}`);
  return {lessonId,lessonNumber:number,title,intro,sections,...(practice?{practice}:{}),notes,...(sources.length?{sources}:{})};
}
