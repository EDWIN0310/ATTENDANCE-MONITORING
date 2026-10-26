let view = "admin",
  admin = false,
  portalId = null,
  tab = "dash",
  editId = null,
  q = "",
  pm = 0,
  pendingPhoto = null;

function go(v) {
  view = v;
  render();
}

function render() {
  ["admin", "portal"].forEach(
    (v) => ($("n-" + v).className = v === view ? "on" : ""),
  );
  $("app").innerHTML =
    view === "admin"
      ? admin
        ? adminV()
        : adminLogin()
      : portalId
        ? portalV()
        : portalLogin();
}

function adminLogin() {
  return `<div class="card login">
    <h2 style="margin-top:0">Admin Log In</h2>
    <div id="aerr" style="color:var(--er)"></div>
    <p><input id="au" placeholder="Username"></p>
    <p><input id="ap" type="password" placeholder="Password" onkeydown="if(event.key==='Enter')alogin()"></p>
    <button class="p" onclick="alogin()">Log In</button>    
  </div>`;
}

function alogin() {
  if ($("au").value === "Edwin Villanueva" && $("ap").value === "EDWIN") {
    admin = true;
    render();
  } else {
    $("aerr").textContent = "Log in error: invalid username or password.";
  }
}

function adminV() {
  const T = [
    ["dash", "Dashboard"],
    ["students", "Manage Students"],
    ["att", "Attendance Management"],
    ["rep", "Reports & Analytics"],
    ["sms", "Send SMS / Email"],
  ];
  return (
    `<div class="card np">
      <div class="row">
        ${T.map(
          (t) =>
            `<button class="${
              tab === t[0] ? "on" : ""
            }" onclick="tab='${t[0]}';render()">${t[1]}</button>`,
        ).join("")}
        <button class="d" onclick="admin=false;render()" style="margin-left:auto">Log Out</button>
      </div>
    </div>` +
    (tab === "dash"
      ? dashT()
      : tab === "students"
        ? stuT()
        : tab === "att"
          ? attT()
          : tab === "rep"
            ? repT()
            : smsT())
  );
}

function stuT() {
  const e = S.students.find((s) => s.id === editId) || {};
  return `<div class="card">
    <h3 style="margin-top:0">${editId ? "Edit" : "Add"} student</h3>
    <div class="row">
      <input id="f1" placeholder="Student ID" value="${esc(e.id)}" ${editId ? "disabled" : ""}>
      <input id="f2" placeholder="Full name" value="${esc(e.name)}">
      <input id="f3" placeholder="Section" value="${esc(e.section)}">
      <input id="f4" placeholder="Parent phone / email" value="${esc(e.parent)}">
      <input id="f5" placeholder="Portal password" value="${esc(e.pw || "1234")}">
      <input type="file" accept="image/*" id="f6" onchange="pic(this)" title="Student photo">
      <button class="p" onclick="saveStu()">Save to Student DB</button>
      ${editId ? '<button onclick="editId=null;render()">Cancel</button>' : ""}
    </div>
    <div id="ferr" style="color:var(--er)"></div>
  </div>
  <div class="card sc">
    <p>
      <input placeholder="Search students (press Enter)" value="${esc(q)}" onchange="q=this.value.toLowerCase();render()">
    </p>
    <table>
      <tr>
        <th></th>
        <th>ID</th>
        <th>Name</th>
        <th>Section</th>
        <th>Parent contact</th>
        <th></th>
      </tr>
      ${S.students
        .filter((s) => (s.id + s.name + s.section).toLowerCase().includes(q))
        .map(
          (s) => `<tr>
            <td>${
              s.photo
                ? `<img src="${s.photo}" width="32" height="32" style="border-radius:50%" alt="">`
                : ""
            }</td>
            <td>${esc(s.id)}</td>
            <td>${esc(s.name)}</td>
            <td>${esc(s.section)}</td>
            <td>${esc(s.parent)}</td>
            <td>
              <button onclick="editId='${esc(s.id)}';render()">Edit</button>
              <button onclick="showQR('${esc(s.id)}')">QR</button>
              <button class="d" onclick="delStu('${esc(s.id)}',this)">Delete</button>
            </td>
          </tr>`,
        )
        .join("")}
    </table>
    <div id="qr" style="margin-top:12px"></div>
  </div>`;
}

function saveStu() {
  const o = {
    id: $("f1").value.trim(),
    name: $("f2").value.trim(),
    section: $("f3").value.trim(),
    parent: $("f4").value.trim(),
    pw: $("f5").value.trim() || "1234",
    photo:
      pendingPhoto ||
      (S.students.find((s) => s.id === editId) || {}).photo ||
      "",
    qr: (S.students.find((s) => s.id === editId) || {}).qr || "",
  };

  if (!o.id || !o.name) {
    $("ferr").textContent = "ID and name are required.";
    return;
  }

  const i = S.students.findIndex((s) => s.id === o.id);
  if (editId) {
    S.students[i] = o;
  } else if (i >= 0) {
    $("ferr").textContent = "ID already exists.";
    return;
  } else {
    S.students.push(o);
  }

  editId = null;
  pendingPhoto = null;
  save();
  render();
}

function delStu(id, b) {
  if (b.textContent !== "Sure?") {
    b.textContent = "Sure?";
    return;
  }
  S.students = S.students.filter((s) => s.id !== id);
  save();
  render();
}

function newToken() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let t = "QR-";
  for (let i = 0; i < 12; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}

/* ===== QR PART (the only part changed) ===== */
function loadQR(cb) {
  if (typeof makeQR === "function") return cb();
  const sc = document.createElement("script");
  sc.src = "qr-local.js";
  sc.onload = cb;
  sc.onerror = () => {
    $("qr").insertAdjacentHTML(
      "beforeend",
      '<p style="color:var(--er)">qr-local.js not found. Put it in the same folder as admin.html.</p>',
    );
  };
  document.head.appendChild(sc);
}

function showQR(id, regen) {
  const s = S.students.find((x) => x.id === id);
  if (!s) return;
  if (!s.qr || regen) {
    s.qr = newToken();
    save();
  }
  const d = $("qr");
  d.innerHTML = `<b>${esc(s.name)}</b> \u2013 ${
    regen
      ? "NEW QR created. The old QR no longer works."
      : "print this QR for the ID card"
  }<br><span class="mut">${esc(s.qr)}</span><br><br>`;

  loadQR(() => {
    const box = document.createElement("div");
    makeQR(box, s.qr, 260);
    const cv = box.querySelector("canvas");
    if (!cv) return;

    const im = new Image();
    im.src = cv.toDataURL("image/png");
    im.alt = "QR code";
    im.style.cssText =
      "display:block;max-width:100%;border:1px solid var(--bd)";
    d.appendChild(im);

    const dl = document.createElement("a");
    dl.href = im.src;
    dl.download = "QR-" + s.id + ".png";
    dl.textContent = "Download QR image";
    dl.style.cssText = "display:inline-block;margin:8px 12px 0 0";
    d.appendChild(dl);

    const b = document.createElement("button");
    b.textContent = "Make another new QR";
    b.className = "d";
    b.style.marginTop = "8px";
    b.onclick = () => showQR(id, true);
    d.appendChild(b);
  });
}
/* ===== END OF QR PART ===== */

let aDate = dk(Date.now());

function attT() {
  const L = S.logs
    .filter((l) => dk(l.ts) === aDate)
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));

  return `<div class="card">
    <h3 style="margin-top:0">Manual attendance override / edit</h3>
    <div class="row">
      <input type="date" value="${aDate}" onchange="aDate=this.value;render()">
      <select id="ms">
        ${S.students
          .map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`)
          .join("")}
      </select>
      <input type="time" id="mt" value="08:00">
      <select id="mty"><option>IN</option><option>OUT</option></select>
      <button class="p" onclick="addLog()">Add record</button>
    </div>
    <div class="sc">
      <table>
        <tr><th>Student</th><th>Type</th><th>Time</th><th></th></tr>
        ${
          L.map(
            (l) => `<tr>
          <td>${esc(nm(l.sid))}</td>
          <td>${l.type}</td>
          <td>${tm(l.ts)}</td>
          <td>
            <button onclick="flip('${l.id}')">Toggle IN/OUT</button>
            <button class="d" onclick="delLog('${l.id}')">Delete</button>
          </td>
        </tr>`,
          ).join("") ||
          '<tr><td class="mut">No records for this date.</td></tr>'
        }
      </table>
    </div>
  </div>`;
}

function addLog() {
  const ts = new Date(aDate + "T" + $("mt").value).toISOString();
  S.logs.push({ id: uid(), sid: $("ms").value, type: $("mty").value, ts });
  save();
  render();
}

function flip(id) {
  const l = S.logs.find((x) => x.id === id);
  l.type = l.type === "IN" ? "OUT" : "IN";
  save();
  render();
}

function delLog(id) {
  S.logs = S.logs.filter((x) => x.id !== id);
  save();
  render();
}

let rMode = "daily",
  rVal = dk(Date.now());

function repData() {
  const m = rMode === "daily" ? rVal : rVal.slice(0, 7);
  const inM = S.logs.filter((l) => dk(l.ts).startsWith(m));
  const head =
    rMode === "daily"
      ? ["ID", "Name", "Time-In", "Time-Out", "Status"]
      : ["ID", "Name", "Days present", "Total days", "Rate"];
  const days = new Set(inM.map((l) => dk(l.ts)));
  const rows = S.students.map((s) => {
    const mine = inM.filter((l) => l.sid === s.id);
    if (rMode === "daily") {
      const i = mine.find((l) => l.type === "IN"),
        o = [...mine].reverse().find((l) => l.type === "OUT");
      return [
        s.id,
        s.name,
        i ? tm(i.ts) : "-",
        o ? tm(o.ts) : "-",
        mine.length
          ? mine.some((l) => l.late)
            ? "Late"
            : "Present"
          : "Absent",
      ];
    }
    const p = new Set(mine.map((l) => dk(l.ts))).size;
    return [
      s.id,
      s.name,
      p,
      days.size,
      days.size ? Math.round((p / days.size) * 100) + "%" : "-",
    ];
  });
  return { head, rows };
}

function repT() {
  const d = repData(),
    pr = d.rows.filter((r) => r[4] !== "Absent").length;
  return `<div class="card">
    <h3 style="margin-top:0">Generate daily / monthly report</h3>
    <div class="row np">
      <select onchange="rMode=this.value;render()">
        <option value="daily" ${rMode === "daily" ? "selected" : ""}>Daily</option>
        <option value="monthly" ${rMode === "monthly" ? "selected" : ""}>Monthly</option>
      </select>
      <input type="date" value="${rVal}" onchange="rVal=this.value;render()">
      <button class="p" onclick="csv()">Export Excel (CSV)</button>
      <button onclick="window.print()">Export PDF (Print)</button>
    </div>
    ${
      rMode === "daily"
        ? `<p class="mut">Analytics: ${pr} present, ${
            d.rows.length - pr
          } absent of ${d.rows.length}</p>`
        : ""
    }
    <div class="sc">
      <table>
        <tr>${d.head.map((h) => `<th>${h}</th>`).join("")}</tr>
        ${d.rows
          .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
          .join("")}
      </table>
    </div>
  </div>`;
}

function csv() {
  const d = repData(),
    t = [d.head, ...d.rows]
      .map((r) =>
        r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","),
      )
      .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" }));
  a.download = `attendance-${rMode}-${rVal}.csv`;
  a.click();
}

function smsT() {
  return `<div class="card">
    <h3 style="margin-top:0">Configure and send SMS / Email</h3>
    <div class="row">
      <select id="bt">
        <option value="all">All parents</option>
        ${[...new Set(S.students.map((s) => s.section))]
          .map((x) => `<option>${esc(x)}</option>`)
          .join("")}
      </select>
    </div>
    <p><textarea id="bm" rows="3" style="width:100%" placeholder="Message / automated alert"></textarea></p>
    <button onclick="prev()">Preview recipients</button>
    <button class="p" onclick="bcast()">Send alert / broadcast</button>
    <span id="bok" class="mut"></span>
    <div id="bpv" class="mut" style="margin-top:8px"></div>
    <p class="mut">Demo mode: messages are saved to the notification log. Connect an SMS/email gateway (e.g. Semaphore, Twilio) to deliver them for real.</p>
  </div>
  <div class="card sc">
    <div class="row">
      <h3 style="margin:0">Notification log</h3>
      <button class="d" style="margin-left:auto" onclick="clearNotes(this)">Delete all</button>
    </div>
    <table>
      <tr><th>Time</th><th>Student</th><th>To</th><th>Message</th><th></th></tr>
      ${[...S.notes]
        .reverse()
        .slice(0, 30)
        .map(
          (n) => `<tr>
            <td>${new Date(n.ts).toLocaleString()}</td>
            <td>${esc(nm(n.sid))}</td>
            <td>${esc(n.to)}</td>
            <td>${esc(n.msg)}</td>
            <td><button class="d" onclick="delNote('${n.id}',this)">Delete</button></td>
          </tr>`,
        )
        .join("")}
    </table>
  </div>`;
}

/* ===== DELETE (SMS / Email log) ===== */
function delNote(id, b) {
  if (b.textContent !== "Sure?") {
    b.textContent = "Sure?";
    return;
  }
  S.notes = S.notes.filter((n) => n.id !== id);
  save();
  render();
}

function clearNotes(b) {
  if (b.textContent !== "Click again to confirm") {
    b.textContent = "Click again to confirm";
    return;
  }
  S.notes = [];
  save();
  render();
}
/* ===== END DELETE ===== */

function bcast() {
  const m = $("bm").value.trim(),
    t = $("bt").value;
  if (!m) return;
  const r = S.students.filter((s) => t === "all" || s.section === t);
  r.forEach((s) =>
    S.notes.push({
      id: uid(),
      sid: s.id,
      to: s.parent,
      channel: "Broadcast",
      msg: m,
      ts: new Date().toISOString(),
    }),
  );
  save();
  render();
  $("bok").textContent = " Sent to " + r.length + " recipient(s).";
}

/* ---------- STUDENT PORTAL ---------- */
function portalLogin() {
  return `<div class="card login">
    <h2 style="margin-top:0">Portal Log In</h2>
    <div id="perr" style="color:var(--er)"></div>
    <p><input id="pu" placeholder="Student ID"></p>
    <p><input id="pp" type="password" placeholder="Password" onkeydown="if(event.key==='Enter')plogin()"></p>
    <button class="p" onclick="plogin()">Log In</button>
    <p class="mut">Demo: 2024-001 / 1234</p>
  </div>`;
}

function plogin() {
  const s = S.students.find(
    (x) => x.id === $("pu").value.trim() && x.pw === $("pp").value,
  );
  if (s) {
    portalId = s.id;
    render();
  } else {
    $("perr").textContent = "Log In Failed. Check your credentials.";
  }
}

function portalV() {
  const s = S.students.find((x) => x.id === portalId),
    n = new Date(new Date().getFullYear(), new Date().getMonth() + pm, 1),
    ym = n.getFullYear() + "-" + pad(n.getMonth() + 1),
    dim = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate(),
    f = new Date(n.getFullYear(), n.getMonth(), 1).getDay();

  const mine = S.logs
      .filter((l) => l.sid === portalId)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1)),
    pd = new Set(mine.map((l) => dk(l.ts)));

  let cal =
    ["S", "M", "T", "W", "T", "F", "S"]
      .map((d) => `<div class="h">${d}</div>`)
      .join("") + '<div class="h"></div>'.repeat(f);

  for (let d = 1; d <= dim; d++) {
    cal += `<div class="${pd.has(ym + "-" + pad(d)) ? "pr" : ""}">${d}</div>`;
  }

  return `<div class="card">
    <div class="row">
      <h2 style="margin:0">${esc(s.name)}</h2>
      <button class="d" onclick="portalId=null;render()" style="margin-left:auto">Log Out</button>
    </div>
    <h3>
      <button onclick="pm--;render()">◀</button>
      ${n.toLocaleString("default", { month: "long", year: "numeric" })}
      <button onclick="pm++;render()">▶</button>
    </h3>
    <div class="cal">${cal}</div>
    <p class="mut">Green = present</p>
  </div>
  <div class="card sc">
    <h3 style="margin-top:0">Attendance history</h3>
    <table>
      <tr><th>Date</th><th>Type</th><th>Time</th></tr>
      ${
        mine
          .map(
            (l) =>
              `<tr><td>${dk(l.ts)}</td><td>${l.type}</td><td>${tm(
                l.ts,
              )}</td></tr>`,
          )
          .join("") || '<tr><td class="mut">No records yet.</td></tr>'
      }
    </table>
  </div>
  <div class="card sc">
    <h3 style="margin-top:0">Notifications</h3>
    <table>
      ${
        S.notes
          .filter((x) => x.sid === portalId)
          .reverse()
          .map(
            (x) =>
              `<tr><td>${new Date(
                x.ts,
              ).toLocaleString()}</td><td>${esc(x.msg)}</td></tr>`,
          )
          .join("") || '<tr><td class="mut">No notifications.</td></tr>'
      }
    </table>
  </div>`;
}

function pic(i) {
  const f = i.files[0];
  if (!f) return;
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const m = Math.min(im.width, im.height);
    c.getContext("2d").drawImage(
      im,
      (im.width - m) / 2,
      (im.height - m) / 2,
      m,
      m,
      0,
      0,
      160,
      160,
    );
    pendingPhoto = c.toDataURL("image/jpeg", 0.7);
  };
  im.src = URL.createObjectURL(f);
}

function dashT() {
  const t = dk(Date.now()),
    L = S.logs
      .filter((l) => dk(l.ts) === t)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1)),
    p = new Set(L.map((l) => l.sid)),
    lt = new Set(L.filter((l) => l.late).map((l) => l.sid)),
    n = S.students.length;

  return `<div class="card">
    <h3 style="margin-top:0">Admin Dashboard – ${t}</h3>
    <div class="stats">
      <div class="stat"><b>${n}</b>Students</div>
      <div class="stat"><b>${p.size}</b>Present</div>
      <div class="stat"><b>${lt.size}</b>Late</div>
      <div class="stat"><b>${n - p.size}</b>Absent</div>
      <div class="stat"><b>${n ? Math.round((p.size / n) * 100) : 0}%</b>Rate</div>
    </div>
    <div class="row" style="margin-top:12px">
      Late after <input type="time" value="${S.cfg.start}" onchange="S.cfg.start=this.value;save()">
      <button onclick="absentAlert()">Send absent alert to parents</button>
      <button onclick="bk()">Backup</button>
      <label class="mut">Restore <input type="file" accept=".json" onchange="rs(this)"></label>
    </div>
  </div>
  <div class="card sc">
    <h3 style="margin-top:0">Live activity today</h3>
    <table>
      <tr><th>Student</th><th>Type</th><th>Time</th><th>Status</th></tr>
      ${
        L.slice(0, 12)
          .map(
            (l) => `<tr>
          <td>${esc(nm(l.sid))}</td>
          <td>${l.type}</td>
          <td>${tm(l.ts)}</td>
          <td>${l.late ? '<b class="late">Late</b>' : "On time"}</td>
        </tr>`,
          )
          .join("") || '<tr><td class="mut">No scans yet today.</td></tr>'
      }
    </table>
  </div>`;
}

function absentAlert() {
  const t = dk(Date.now()),
    p = new Set(S.logs.filter((l) => dk(l.ts) === t).map((l) => l.sid));
  S.students
    .filter((s) => !p.has(s.id))
    .forEach((s) =>
      S.notes.push({
        id: uid(),
        sid: s.id,
        to: s.parent,
        channel: "Alert",
        msg: s.name + " has no attendance record today (" + t + ")",
        ts: new Date().toISOString(),
      }),
    );
  save();
  tab = "sms";
  render();
}

function prev() {
  const v = $("bt").value,
    r = S.students.filter((s) => v === "all" || s.section === v);
  $("bpv").innerHTML =
    "<b>" +
    r.length +
    " recipient(s):</b><br>" +
    r.map((s) => esc(s.name) + " → " + esc(s.parent)).join("<br>");
}

function bk() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(S)], { type: "application/json" }),
  );
  a.download = "attendance-backup.json";
  a.click();
}

function rs(i) {
  const f = i.files[0];
  if (!f) return;
  f.text().then((t) => {
    try {
      S = JSON.parse(t);
      S.cfg = S.cfg || { start: "08:00" };
      save();
      render();
    } catch (e) {}
  });
}

window.addEventListener("storage", () => {
  reload();
  if (
    (admin && ["dash", "att", "rep"].includes(tab) && view === "admin") ||
    (view === "portal" && portalId)
  )
    render();
});

render();
