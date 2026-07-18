(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle with persistence
  var root = document.documentElement;
  var storageKey = "tc-theme";
  var stored = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch (e) {}
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current =
        root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark");
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(storageKey, next);
      } catch (e) {}
    });
  }

  // Reveal-on-scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Active nav link based on section in view
  var navLinks = document.querySelectorAll(".nav-links a");
  var sections = Array.prototype.map.call(navLinks, function (a) {
    var id = a.getAttribute("href");
    if (!id || id.charAt(0) !== "#") return null;
    return document.querySelector(id);
  });

  function setActive() {
    var scrollY = window.scrollY + 120;
    var currentId = null;
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (!sec) continue;
      if (sec.offsetTop <= scrollY) {
        currentId = "#" + sec.id;
      }
    }
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === currentId) {
        a.classList.add("active");
      } else {
        a.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  // "Download PDF" buttons -> browser print dialog (Save as PDF)
  // Setting document.title beforehand controls the default filename Chrome/Edge
  // suggest in the "Save as PDF" destination.
  var pdfFilename = "Tejas_Chinchore_Resume";
  var originalTitle = document.title;

  function ensureAllRevealed() {
    var els = document.querySelectorAll(".reveal");
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add("is-visible");
    }
  }

  function printResume() {
    ensureAllRevealed();
    document.title = pdfFilename;
    window.print();
  }

  window.addEventListener("beforeprint", function () {
    ensureAllRevealed();
    document.title = pdfFilename;
  });
  window.addEventListener("afterprint", function () {
    document.title = originalTitle;
  });

  var printBtns = document.querySelectorAll("[data-print-resume]");
  for (var b = 0; b < printBtns.length; b++) {
    printBtns[b].addEventListener("click", function (e) {
      e.preventDefault();
      printResume();
    });
  }
})();
