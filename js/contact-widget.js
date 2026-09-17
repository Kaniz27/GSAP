/* ==========================================================================
   Floating "Get a Quote" contact widget — open/close + validation
   ========================================================================== */
(function () {
  'use strict';

  // Paste the URL your form should submit to (e.g. a Formspree/Getform/
  // your own API endpoint) between the quotes below. Leave empty to keep
  // the widget in "local only" mode (shows the success screen without
  // sending the data anywhere).
  var FORM_ENDPOINT = '';

  var fab = document.getElementById('tjQuoteFab');
  var overlay = document.getElementById('tjQuoteOverlay');
  var closeBtn = document.getElementById('tjQuoteClose');
  var form = document.getElementById('tjQuoteForm');
  var successView = document.getElementById('tjQuoteSuccess');
  var lastFocused = null;

  if (!fab || !overlay || !form) return;

  function openModal() {
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
    var firstField = form.querySelector('input, select, textarea');
    if (firstField) firstField.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    window.setTimeout(function () {
      overlay.classList.remove('is-open');
    }, 250);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  fab.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    ['quoteName', 'quoteBusinessType', 'quoteAddress', 'quoteEmail', 'quotePhone'].forEach(function (id) {
      var el = document.getElementById(id);
      var wrap = el.closest('.tj-quote-field');
      if (!el.value.trim()) {
        wrap.classList.add('is-invalid');
        valid = false;
      } else {
        wrap.classList.remove('is-invalid');
      }
    });

    var emailEl = document.getElementById('quoteEmail');
    var emailWrap = emailEl.closest('.tj-quote-field');
    var emailVal = emailEl.value.trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      emailWrap.classList.add('is-invalid');
      valid = false;
    }

    var productChosen = form.querySelector('input[name="quoteProduct"]:checked');
    var productWrap = document.getElementById('tjQuoteProductField');
    if (!productChosen) {
      productWrap.classList.add('is-invalid');
      valid = false;
    } else {
      productWrap.classList.remove('is-invalid');
    }

    if (!valid) return;

    var data = Object.fromEntries(new FormData(form).entries());
    var submitBtn = form.querySelector('.tj-quote-submit');
    var restoreLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending…</span>';

    var finish = function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = restoreLabel;
      form.classList.add('is-hidden');
      successView.classList.add('is-shown');
    };

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(finish).catch(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = restoreLabel;
        window.alert('Something went wrong sending your request. Please try again or call us directly.');
      });
    } else {
      window.setTimeout(finish, 400);
    }
  });
})();
