/* =========================================================
   KIBAS — harga otomatis, jadwal groomer, booking via WhatsApp
   ========================================================= */
(function () {
  'use strict';
  const K = window.KIBAS;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rp = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  const r500 = (n) => Math.round(n / 500) * 500;
  const pad = (n) => String(n).padStart(2, '0');
  const hm = (m) => `${pad(Math.floor(m / 60))}.${pad(m % 60)}`;
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const durText = (m) => (m >= 60 ? `${Math.floor(m / 60)} jam${m % 60 ? ` ${m % 60} menit` : ''}` : `${m} menit`);

  const st = { species: 'dog', size: 1, coat: 'pendek', pkg: 'full', addons: new Set(), groomer: 'any', day: null, start: null, assigned: null, pickup: 'datang' };

  /* ---------------- pricing ---------------- */
  const pkgOf = (id) => K.PACKAGES.find((p) => p.id === id);
  const coatOf = () => K.COATS[st.species].find((c) => c.id === st.coat) || K.COATS[st.species][0];
  function basePrice(p) { return st.species === 'cat' ? p.cat : p.dog[st.size]; }
  function baseDur(p) { return st.species === 'cat' ? p.durCat : p.durDog[st.size]; }
  function quote() {
    const p = pkgOf(st.pkg), coat = coatOf();
    const pkgPrice = r500(basePrice(p) * (1 + coat.pct / 100));
    const adds = K.ADDONS.filter((a) => st.addons.has(a.id) && !p.includes.includes(a.id));
    const pick = K.PICKUP.find((x) => x.id === st.pickup);
    const dur = baseDur(p) + adds.reduce((s, a) => s + a.min, 0);
    return { p, coat, pkgPrice, adds, pick, dur, total: pkgPrice + adds.reduce((s, a) => s + a.price, 0) + pick.fee };
  }

  /* ---------------- schedule (contoh, dibuat dari seed) ---------------- */
  function seeded(str) {
    let h = 2166136261;
    for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    // avalanche akhir: teks yang beda satu karakter menghasilkan angka yang benar-benar berbeda
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const busyCache = new Map();
  function busy(groomer, dayIso) {
    const key = groomer + dayIso; if (busyCache.has(key)) return busyCache.get(key);
    const blocks = []; let t = K.OPEN * 60;
    for (let i = 0; i < 6 && t < K.CLOSE * 60 - 60; i++) {
      const r = seeded(key + i);
      const gap = Math.floor(r * 4) * 30;                 // jeda 0–90 menit
      const len = 60 + Math.floor(seeded(key + 'l' + i) * 4) * 30; // 60–150 menit
      const s = t + gap; if (s + len > K.CLOSE * 60) break;
      if (seeded(key + 'k' + i) > .35) blocks.push([s, s + len]);
      t = s + len;
    }
    busyCache.set(key, blocks); return blocks;
  }
  const isFree = (g, dayIso, s, e) => busy(g, dayIso).every(([a, b]) => e <= a || s >= b);
  function days() {
    const out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    for (let i = 0; out.length < K.DAYS_AHEAD; i++) { const x = new Date(d); x.setDate(d.getDate() + i); out.push(x); }
    return out;
  }
  function slotsFor(dayIso, dur) {
    const now = new Date(), today = iso(now) === dayIso, nowMin = now.getHours() * 60 + now.getMinutes();
    const out = [];
    for (let s = K.OPEN * 60; s + dur <= K.CLOSE * 60; s += K.STEP_MIN) {
      if (today && s <= nowMin + 30) { out.push({ s, g: null }); continue; }
      const gs = st.groomer === 'any' ? K.GROOMERS.map((g) => g.id) : [st.groomer];
      out.push({ s, g: gs.find((g) => isFree(g, dayIso, s, s + dur)) || null });
    }
    return out;
  }

  /* ---------------- render ---------------- */
  function renderPriceTable() {
    const head = `<thead><tr><th>Paket</th>${K.DOG_SIZES.map((s) => `<th>Anjing ${s.label}<small>${s.hint}</small></th>`).join('')}<th>Kucing<small>semua ukuran</small></th></tr></thead>`;
    const body = K.PACKAGES.map((p) => `<tr><th>${esc(p.name)}${p.popular ? '<span class="pop">Paling dipilih</span>' : ''}<small>${esc(p.desc)}</small></th>${p.dog.map((v) => `<td>${rp(v)}</td>`).join('')}<td>${rp(p.cat)}</td></tr>`).join('');
    $('#ptable').innerHTML = head + `<tbody>${body}</tbody>`;
  }

  function renderPet() {
    $('#species').innerHTML = [['dog', 'Anjing'], ['cat', 'Kucing']].map(([v, l]) => `<button type="button" data-species="${v}" aria-pressed="${st.species === v}">${l}</button>`).join('');
    $('#sizeWrap').hidden = st.species === 'cat';
    $('#sizes').innerHTML = K.DOG_SIZES.map((s) => `<button type="button" class="opt" data-size="${s.id}" aria-pressed="${st.size === s.id}">${s.label} · ${s.hint}<small>${esc(s.ex)}</small></button>`).join('');
    $('#coats').innerHTML = K.COATS[st.species].map((c) => `<button type="button" class="opt" data-coat="${c.id}" aria-pressed="${st.coat === c.id}">${esc(c.label)}<small>${c.pct ? `+${c.pct}%` : 'harga dasar'}</small></button>`).join('');
  }

  function renderPkgs() {
    const coat = coatOf();
    $('#pkgs').innerHTML = K.PACKAGES.map((p) => `<button type="button" class="pkg" data-pkg="${p.id}" aria-pressed="${st.pkg === p.id}"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span><em>${rp(r500(basePrice(p) * (1 + coat.pct / 100)))} · ${durText(baseDur(p))}</em></button>`).join('');
    const p = pkgOf(st.pkg);
    $('#addons').innerHTML = K.ADDONS.map((a) => {
      const incl = p.includes.includes(a.id);
      return `<label class="addon ${incl ? 'is-incl' : ''}"><input type="checkbox" data-addon="${a.id}" ${incl || st.addons.has(a.id) ? 'checked' : ''} ${incl ? 'disabled' : ''} />
        <span>${esc(a.name)}${incl ? '<small>Sudah termasuk paket ini</small>' : a.note ? `<small>${esc(a.note)}</small>` : ''}</span><em>${incl ? '—' : '+' + rp(a.price)}</em></label>`;
    }).join('');
  }

  function renderSchedule() {
    $('#groomers').innerHTML = [{ id: 'any', name: 'Siapa saja', note: 'paling cepat' }, ...K.GROOMERS].map((g) => `<button type="button" data-groomer="${g.id}" aria-pressed="${st.groomer === g.id}">${esc(g.name)}<small>${esc(g.note)}</small></button>`).join('');
    const ds = days();
    if (!st.day || K.CLOSED_DAYS.includes(new Date(st.day + 'T00:00').getDay())) st.day = iso(ds.find((d) => !K.CLOSED_DAYS.includes(d.getDay())));
    $('#days').innerHTML = ds.map((d, i) => {
      const closed = K.CLOSED_DAYS.includes(d.getDay());
      return `<button type="button" class="day" data-day="${iso(d)}" aria-pressed="${st.day === iso(d)}" ${closed ? 'disabled aria-label="Tutup"' : ''}><small>${i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : d.toLocaleDateString('id-ID', { weekday: 'short' })}</small><b>${d.getDate()}</b><small>${closed ? 'tutup' : d.toLocaleDateString('id-ID', { month: 'short' })}</small></button>`;
    }).join('');
    const { dur } = quote();
    const list = slotsFor(st.day, dur);
    const cur = list.find((x) => x.s === st.start);
    if (!cur || !cur.g) { st.start = null; st.assigned = null; } else st.assigned = cur.g;
    const free = list.filter((x) => x.g).length;
    $('#slotHint').textContent = free ? `Jam mulai yang cukup untuk durasi ${durText(dur)}:` : 'Tidak ada jam yang cukup di hari ini. Coba hari lain atau groomer lain.';
    $('#slots').innerHTML = list.map((x) => `<button type="button" class="slot" data-start="${x.s}" aria-pressed="${st.start === x.s}" ${x.g ? '' : 'disabled'}>${hm(x.s)}</button>`).join('');
  }

  function renderPickup() {
    $('#pickup').innerHTML = K.PICKUP.map((x) => `<button type="button" class="pick" data-pick="${x.id}" aria-pressed="${st.pickup === x.id}"><span><b>${esc(x.label)}</b><small>${esc(x.note)}</small></span><em>${x.fee ? rp(x.fee) : 'Gratis'}</em></button>`).join('');
    $('#addrWrap').hidden = st.pickup === 'datang';
  }

  function renderSummary() {
    const q = quote(), name = $('#petName').value.trim();
    const sizeTxt = st.species === 'cat' ? 'Kucing' : `Anjing ${K.DOG_SIZES[st.size].label}`;
    $('#sumTitle').textContent = `${name || 'Hewanmu'} · ${q.p.name}`;
    const g = st.assigned && K.GROOMERS.find((x) => x.id === st.assigned);
    const dayTxt = st.day ? new Date(st.day + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }) : '';
    $('#sumLines').innerHTML = [
      [`${q.p.name} · ${sizeTxt}, bulu ${q.coat.label.split(' ')[0].toLowerCase()}`, rp(q.pkgPrice)],
      ...q.adds.map((a) => [a.name, rp(a.price)]),
      [q.pick.label.split(' · ')[0] + (q.pick.fee ? ` (${q.pick.label.split(' · ')[1]})` : ''), q.pick.fee ? rp(q.pick.fee) : 'Gratis'],
      ['Jadwal', st.start != null ? `${dayTxt}, ${hm(st.start)}–${hm(st.start + q.dur)}` : 'Pilih jam'],
      ['Groomer', g ? g.name : '—'],
    ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#sumTotal').textContent = rp(q.total);
    $('#sumDur').textContent = `Perkiraan durasi ${durText(q.dur)}.`;
  }

  function renderAll() { renderPet(); renderPkgs(); renderSchedule(); renderPickup(); renderSummary(); }

  /* ---------------- message ---------------- */
  function message() {
    const q = quote(), g = K.GROOMERS.find((x) => x.id === st.assigned);
    const day = new Date(st.day + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const pet = st.species === 'cat' ? 'Kucing' : `Anjing ${K.DOG_SIZES[st.size].label} (${K.DOG_SIZES[st.size].hint})`;
    return [
      `Halo ${K.name}, saya mau booking grooming 🐾`, '',
      `Hewan: ${$('#petName').value.trim() || '-'} · ${pet}, bulu ${q.coat.label.toLowerCase()}`,
      `Paket: ${q.p.name} (${rp(q.pkgPrice)})`,
      ...(q.adds.length ? [`Tambahan: ${q.adds.map((a) => `${a.name} (${rp(a.price)})`).join(', ')}`] : []),
      `Jadwal: ${day}, ${hm(st.start)}–${hm(st.start + q.dur)} · groomer ${g.name}`,
      `Antar-jemput: ${q.pick.fee ? `${q.pick.label.split(' · ')[1]} (${rp(q.pick.fee)})` : 'tidak, datang sendiri'}`,
      ...(st.pickup !== 'datang' ? [`Alamat: ${$('#addr').value.trim()}`] : []),
      `Total estimasi: ${rp(q.total)}`, '',
      `Pemilik: ${$('#owner').value.trim()} · ${$('#wa').value.trim()}`,
      ...($('#note').value.trim() ? [`Catatan: ${$('#note').value.trim()}`] : []),
      'Vaksin: sudah', '',
      'Mohon dikonfirmasi ya, terima kasih!',
    ].join('\n');
  }

  function validate() {
    if (!$('#petName').value.trim()) return 'Isi nama hewanmu.';
    if (st.start == null) return 'Pilih jam mulai grooming.';
    if (st.pickup !== 'datang' && $('#addr').value.trim().length < 10) return 'Tulis alamat jemput yang lengkap.';
    if (!$('#owner').value.trim()) return 'Isi nama kamu.';
    if (!/^(\+?62|0)8\d{7,12}$/.test($('#wa').value.replace(/[\s-]/g, ''))) return 'Nomor WhatsApp belum valid, contoh 0812xxxxxxx.';
    if (!$('#vaksin').checked) return 'Centang konfirmasi vaksin dan kondisi sehat.';
    return '';
  }

  /* ---------------- events ---------------- */
  function bind() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-species],[data-size],[data-coat],[data-pkg],[data-groomer],[data-day],[data-start],[data-pick]');
      if (!t || t.disabled) return;
      const d = t.dataset;
      if (d.species) { st.species = d.species; st.coat = 'pendek'; }
      if (d.size) st.size = Number(d.size);
      if (d.coat) st.coat = d.coat;
      if (d.pkg) st.pkg = d.pkg;
      if (d.groomer) st.groomer = d.groomer;
      if (d.day) { st.day = d.day; st.start = null; }
      if (d.start) st.start = Number(d.start);
      if (d.pick) st.pickup = d.pick;
      $('#preview').innerHTML = '';
      renderAll();
    });
    $('#addons').addEventListener('change', (e) => {
      const id = e.target.dataset.addon; if (!id) return;
      e.target.checked ? st.addons.add(id) : st.addons.delete(id);
      renderPkgs(); renderSchedule(); renderSummary();
    });
    $('#petName').addEventListener('input', renderSummary);
    $('#bkForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = validate(), el = $('#err');
      if (err) { el.textContent = err; el.hidden = false; return; }
      el.hidden = true;
      const msg = message();
      if (K.DEMO || !K.WA_NUMBER) {
        $('#preview').innerHTML = `<p class="eyebrow" style="margin:6px 0 0">Mode demo · pesan untuk admin</p><div class="wa-preview"><div>${esc(msg)}</div></div>`;
        $('#preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      window.open(`https://wa.me/${K.WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }

  $('#faqList').innerHTML = K.FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  $('#footInfo').textContent = `${K.address} · ${K.hours}`;
  if (K.DEMO) { $('#demoBar').hidden = false; $('#demoLink').href = K.DEV_CONTACT_URL; }
  renderPriceTable(); renderAll(); bind();
})();
