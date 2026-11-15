(function () {
  'use strict';

  const q = document.getElementById('q');
  const results = document.getElementById('results');
  const catalog = document.getElementById('catalog');
  const heading = document.getElementById('catalogHeading');

  function fold(text) {
    return text.normalize('NFD').replace(/\p{M}/gu, '')
      .replace(/['\u02bb\u02bc\u02be\u02bf\u2018\u2019]/g, '')
      .replace(/[\u2010-\u2015\u2212]/g, '-').toLowerCase();
  }

  const entries = window.EPISTLES.map(epistle => ({
    epistle,
    title: fold(epistle.title),
    text: fold(epistle.text)
  }));

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  // Map a folded match back to the original text for the excerpt.
  function originalOffset(text, target) {
    let offset = 0;
    let foldedOffset = 0;
    for (const char of text) {
      if (foldedOffset >= target) return offset;
      foldedOffset += fold(char).length;
      offset += char.length;
    }
    return text.length;
  }

  function search() {
    const term = fold(q.value.trim());
    if (term.length < 2) {
      catalog.hidden = false;
      heading.hidden = false;
      results.innerHTML = '';
      return;
    }

    catalog.hidden = true;
    heading.hidden = true;
    const hits = entries.filter(entry => entry.title.includes(term) || entry.text.includes(term));
    results.innerHTML = '<h2>Results (' + hits.length + ')</h2>' + hits.map(entry => {
      const epistle = entry.epistle;
      const match = originalOffset(epistle.text, Math.max(0, entry.text.indexOf(term)));
      const start = Math.max(0, match - 85);
      const end = Math.min(epistle.text.length, match + 120);
      const excerpt = (start ? '…' : '') + epistle.text.slice(start, end) +
        (end < epistle.text.length ? '…' : '');
      return '<div class="result"><a href="epistles/' + String(epistle.n).padStart(3, '0') +
        '.html">Epistle ' + epistle.n + ': ' + escapeHtml(epistle.title) +
        '</a><p>' + escapeHtml(excerpt) + '</p></div>';
    }).join('');
  }

  function readQuery() {
    q.value = new URL(location.href).searchParams.get('q') || '';
    search();
  }

  function updateSearch() {
    search();
    const url = new URL(location.href);
    if (q.value.trim()) url.searchParams.set('q', q.value.trim());
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  q.addEventListener('input', updateSearch);
  document.getElementById('searchForm').addEventListener('submit', event => {
    event.preventDefault();
    updateSearch();
  });
  window.addEventListener('popstate', readQuery);
  readQuery();
})();
