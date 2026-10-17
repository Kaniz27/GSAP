/* Legal Centre — progress bar, contents list, scroll-spy, reveal, cookie preferences */
(function () {
   var doc = document.querySelector('.lg-doc');
   if (!doc) return;

   var sections = Array.prototype.slice.call(doc.querySelectorAll('.lg-sec[id]'));
   var tocList = document.getElementById('lgTocList');
   var bar = document.querySelector('.lg-progress');
   var ringBar = document.querySelector('.lg-ring .bar');
   var ringText = document.querySelector('.lg-ring span');
   var RING = 113.1;

   // Build the contents list from section headings
   var links = sections.map(function (sec, i) {
      var h2 = sec.querySelector('h2');
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.innerHTML = '<span class="n">' + (i < 9 ? '0' : '') + (i + 1) + '</span><span></span>';
      a.lastChild.textContent = h2 ? h2.textContent : sec.id;
      li.appendChild(a);
      if (tocList) tocList.appendChild(li);
      a.addEventListener('click', function (e) {
         e.preventDefault();
         var top = sec.getBoundingClientRect().top + window.pageYOffset - 100;
         window.scrollTo({ top: top, behavior: 'smooth' });
         if (history.replaceState) history.replaceState(null, '', '#' + sec.id);
      });
      return a;
   });

   var current = -1;
   function onScroll() {
      // reading progress through the document
      var rect = doc.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      if (ringBar) ringBar.style.strokeDashoffset = RING - RING * p;
      if (ringText) ringText.textContent = Math.round(p * 100) + '%';

      // active section
      var idx = 0;
      for (var i = 0; i < sections.length; i++) {
         if (sections[i].getBoundingClientRect().top < window.innerHeight * 0.35) idx = i;
      }
      if (idx !== current) {
         if (current > -1) { links[current].classList.remove('active'); sections[current].classList.remove('is-current'); }
         links[idx].classList.add('active');
         sections[idx].classList.add('is-current');
         current = idx;
      }
   }
   window.addEventListener('scroll', onScroll, { passive: true });
   window.addEventListener('resize', onScroll);
   onScroll();

   // Reveal on scroll
   var reveal = document.querySelectorAll('.lg-reveal');
   if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
         entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
         });
      }, { rootMargin: '0px 0px -8% 0px' });
      reveal.forEach(function (el) { io.observe(el); });
   } else {
      reveal.forEach(function (el) { el.classList.add('in'); });
   }

   // Print button
   var printBtn = document.getElementById('lgPrint');
   if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

   // Cookie preference centre (shares the banner's tjCookieConsent key)
   var prefs = document.getElementById('lgPrefs');
   if (prefs) {
      var boxes = prefs.querySelectorAll('input[data-cat]');
      var saved = document.getElementById('lgSaved');
      var stored = {};
      try { stored = JSON.parse(localStorage.getItem('tjCookiePrefs') || '{}') || {}; } catch (e) {}
      var consent = null;
      try { consent = localStorage.getItem('tjCookieConsent'); } catch (e) {}

      function paint() {
         boxes.forEach(function (b) { b.closest('.lg-pref').classList.toggle('on', b.checked); });
      }
      boxes.forEach(function (b) {
         var cat = b.getAttribute('data-cat');
         if (cat in stored) b.checked = !!stored[cat];
         else if (consent === 'accepted') b.checked = true;
         b.addEventListener('change', paint);
      });
      paint();

      function save(all) {
         var out = {};
         var anyOn = false;
         boxes.forEach(function (b) {
            if (all !== undefined) b.checked = all;
            out[b.getAttribute('data-cat')] = b.checked;
            if (b.checked) anyOn = true;
         });
         paint();
         try {
            localStorage.setItem('tjCookiePrefs', JSON.stringify(out));
            localStorage.setItem('tjCookieConsent', anyOn ? 'accepted' : 'declined');
         } catch (e) {}
         var banner = document.getElementById('tjCookieBanner');
         if (banner) banner.hidden = true;
         if (saved) {
            saved.classList.add('show');
            clearTimeout(save.t);
            save.t = setTimeout(function () { saved.classList.remove('show'); }, 2600);
         }
      }
      document.getElementById('lgSavePrefs').addEventListener('click', function () { save(); });
      document.getElementById('lgAcceptAll').addEventListener('click', function () { save(true); });
      document.getElementById('lgRejectAll').addEventListener('click', function () { save(false); });
   }
})();
