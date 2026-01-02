// Custom Language Selector with Google Translate
(function () {
  let currentLanguage = "en";
  let googleTranslateReady = false;

  function initLanguageSelector() {
    const wrapper = document.getElementById("gt-wrapper-13436449");
    if (!wrapper) return;

    // Create custom dropdown HTML
    const html = `
      <div class="language-selector">
        <button class="language-toggle">
          <span class="lang-icon">🌐</span>
          <span class="lang-text">EN</span>
          <span class="lang-arrow">▼</span>
        </button>
        <div class="language-menu">
          <a href="#" data-language="en" class="lang-option active">English</a>
          <a href="#" data-language="ar" class="lang-option">العربية</a>
        </div>
      </div>
      <div id="google_translate_element"></div>
    `;

    wrapper.innerHTML = html;

    // Add toggle functionality
    const toggle = wrapper.querySelector(".language-toggle");
    const menu = wrapper.querySelector(".language-menu");

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.toggle("open");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        menu.classList.remove("open");
      }
    });

    // Handle language selection
    const langOptions = wrapper.querySelectorAll(".lang-option");
    langOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = option.getAttribute("data-language");
        currentLanguage = lang;

        // Update active state
        langOptions.forEach((o) => o.classList.remove("active"));
        option.classList.add("active");

        // Update button text
        const langText = {
          en: "EN",
          ar: "AR",
        };
        toggle.querySelector(".lang-text").textContent = langText[lang];
        menu.classList.remove("open");

        // Translate page
        if (googleTranslateReady) {
          doTranslate(lang);
        }
      });
    });
  }

  function doTranslate(lang) {
    if (lang === "en") {
      // Clear Google Translate cookie and reload to reset
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      location.reload();
      return;
    }

    // For Arabic, wait for Google Translate element to be ready
    setTimeout(() => {
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        combo.value = lang;
        combo.dispatchEvent(new Event("change"));
        return;
      }

      // Fallback: Try clicking language in iframe
      try {
        const iframes = document.querySelectorAll("iframe");
        for (let i = 0; i < iframes.length; i++) {
          try {
            const iframeDoc =
              iframes[i].contentDocument || iframes[i].contentWindow.document;
            if (iframeDoc) {
              const links = iframeDoc.querySelectorAll("a");
              for (let j = 0; j < links.length; j++) {
                if (links[j].textContent.includes("Arabic")) {
                  links[j].click();
                  return;
                }
              }
            }
          } catch (e) {
            // Cross-origin error, expected
          }
        }
      } catch (e) {
        console.log("Frame search error");
      }
    }, 200);
  }

  // Monitor for Google Translate readiness
  function checkGoogleTranslateReady() {
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      googleTranslateReady = true;
      return true;
    }
    return false;
  }

  // Initialize Google Translate with proper setup
  function initGoogleTranslate() {
    // Add meta tag for Google Translate
    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = "verification-token";
    document.head.appendChild(meta);

    // Set up the callback
    window.googleTranslateElementInit = function () {
      try {
        new google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "ar,en",
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );

        googleTranslateReady = true;
      } catch (e) {
        console.log("Translate init error:", e);
      }
    };

    // Load Google Translate script with proper settings
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onload = function () {
      // Keep checking for readiness
      let attempts = 0;
      const checkReady = setInterval(() => {
        if (checkGoogleTranslateReady() || attempts > 50) {
          clearInterval(checkReady);
        }
        attempts++;
      }, 100);
    };
    document.head.appendChild(script);

    // Hide Google Translate UI
    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-gadget-simple { display: none !important; }
      .goog-te-gadget { display: none !important; }
      .goog-te-tooltip { display: none !important; }
      .skiptranslate { display: none !important; }
      #google_translate_element { display: none !important; }
      body { top: 0 !important; }
      .goog-te-menu-frame { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initLanguageSelector();
      initGoogleTranslate();
    });
  } else {
    initLanguageSelector();
    initGoogleTranslate();
  }
})();
