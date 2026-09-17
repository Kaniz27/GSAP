/* ==========================================================================
   Floating "Get a Quote" contact widget — open/close + validation
   ========================================================================== */
(function () {
  'use strict';

  // Submits straight to the business inbox via FormSubmit.co (no backend
  // needed). The first submission after this goes live triggers a one-time
  // confirmation email to aislamuk83@gmail.com — click the link in it once
  // to activate delivery for this address.
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/aislamuk83@gmail.com';

  var fab = document.getElementById('tjQuoteFab');
  var overlay = document.getElementById('tjQuoteOverlay');
  var closeBtn = document.getElementById('tjQuoteClose');
  var form = document.getElementById('tjQuoteForm');
  var successView = document.getElementById('tjQuoteSuccess');
  var backBtn = document.getElementById('tjQuoteBack');
  var qrBox = document.getElementById('tjQuoteQr');
  var qrImg = document.getElementById('tjQuoteQrImg');
  var lastFocused = null;

  if (!fab || !overlay || !form) return;

  if (qrImg) {
    var qrTarget = window.location.href.split('#')[0];
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(qrTarget);
  }

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

  function backToForm() {
    successView.classList.remove('is-shown');
    form.classList.remove('is-hidden');
    if (qrBox) qrBox.classList.remove('is-hidden');
    var firstField = form.querySelector('input, select, textarea');
    if (firstField) firstField.focus();
  }

  fab.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  if (backBtn) backBtn.addEventListener('click', backToForm);

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
    data._subject = 'New website enquiry from ' + data.name;
    data._template = 'table';
    data._captcha = 'false';

    var submitBtn = form.querySelector('.tj-quote-submit');
    var restoreLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending…</span>';

    var finish = function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = restoreLabel;
      form.classList.add('is-hidden');
      if (qrBox) qrBox.classList.add('is-hidden');
      successView.classList.add('is-shown');
    };

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
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
