/* shared.js - data + helpers used by BOTH scanner.html and admin.html.
   Both pages read/write the same localStorage key ("att1"), so they must be
   opened from the same origin (e.g. http://localhost). */

const $ = (id) => document.getElementById(id);

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

let S = { students: [], logs: [], notes: [] };

try {
  const r = localStorage.getItem("att1");
  if (r) S = JSON.parse(r);
} catch (e) {}

S.cfg = S.cfg || { start: "08:00" };

if (!S.students.length) {
  S.students = [
    {
      id: "251C-0001",
      name: "AARONE EDWIN F. VILLANUEVA",
      section: "BSIT - 2A",
      parent: "0976 134 8100 / aaroneedwin47@gmail.com",
      pw: "1234",
    },
    {
      id: "251C-0053",
      name: "GRAZIEL ILLYZA L. LOANZON",
      section: "BSIT - 2A",
      parent: "0917 000 0002 / parent2@mail.com",
      pw: "1234",
    },
    {
      id: "2024-0031",
      name: "SHAYNNA KAYE A. CACHILA",
      section: "BSIT - 2A",
      parent: "0917 000 0003 / parent3@mail.com",
      pw: "1234",
    },
    {
      id: "2024-0032",
      name: "PRINCESS DIANE DOROIN",
      section: "BSIT - 2A",
      parent: "0917 000 0003 / parent3@mail.com",
      pw: "1234",
    },
    {
      id: "2024-0033",
      name: "LUCERO SANNY JR.",
      section: "BSIT - 2A",
      parent: "0917 000 0003 / parent3@mail.com",
      pw: "1234",
    },
    {
      id: "2024-0034",
      name: "THRISTAN JAKE CACAO",
      section: "BSIT - 2A",
      parent: "0917 000 0003 / parent3@mail.com",
      pw: "1234",
    },
    {
      id: "2024-0034",
      name: "ARWIN BALASABAS",
      section: "BSIT - 2A",
      parent: "0917 000 0003 / parent3@mail.com",
      pw: "1234",
    },
  ];
}

const save = () => {
  try {
    localStorage.setItem("att1", JSON.stringify(S));
  } catch (e) {}
};

const pad = (n) => String(n).padStart(2, "0");

const dk = (t) => {
  const d = new Date(t);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
};

const tm = (t) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const nm = (id) => (S.students.find((s) => s.id === id) || { name: id }).name;

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const tm24 = (t) => {
  const d = new Date(t);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
};

const av = (s) =>
  s.photo
    ? `<img class="av" src="${s.photo}" alt="">`
    : `<div class="av">${esc(
        s.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join(""),
      )}</div>`;

function reload() {
  try {
    const r = localStorage.getItem("att1");
    if (r) {
      S = JSON.parse(r);
      S.cfg = S.cfg || { start: "08:00" };
    }
  } catch (e) {}
}
