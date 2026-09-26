/* HEADER */
function initHeader() {
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!header || !hamburger || !mobileMenu) {
    return;
  }

  /* SCROLL HEADER */
  let ticking = false;

  const updateHeaderOnScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeaderOnScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeaderOnScroll();

  /* MENU OPEN / CLOSE */
  const openMenu = () => {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    document
      .querySelectorAll('.mobile-has-dropdown.is-open')
      .forEach(item => {
        item.classList.remove('is-open');
        const toggle = item.querySelector('.mobile-dropdown-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
  };

  hamburger.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = hamburger.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu.addEventListener('click', event => {
    if (event.target === mobileMenu) {
      closeMenu();
    }
  });

  mobileMenu
    .querySelectorAll('.mobile-nav-link:not(.mobile-dropdown-toggle)')
    .forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

  /* MOBILE DROPDOWNS */
  const mobileDropdownToggles = mobileMenu.querySelectorAll('.mobile-dropdown-toggle');

  mobileDropdownToggles.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      const parent = button.closest('.mobile-has-dropdown');
      if (!parent) return;

      const isOpen = parent.classList.contains('is-open');

      document
        .querySelectorAll('.mobile-has-dropdown.is-open')
        .forEach(item => {
          if (item !== parent) {
            item.classList.remove('is-open');
            const otherToggle = item.querySelector('.mobile-dropdown-toggle');
            if (otherToggle) {
              otherToggle.setAttribute('aria-expanded', 'false');
            }
          }
        });

      parent.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ESCAPE KEY */
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && hamburger.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* ACTIVE PAGE */
  const normalizePath = (path) => {
    if (!path) return '';
    return path
      .split('?')[0]
      .split('#')[0]
      .replace(/\/+$/, '')
      .split('/')
      .pop()
      .toLowerCase();
  };

  const currentPath = normalizePath(window.location.pathname);
  const isHomePage = currentPath === '' || currentPath === 'index.html';

  const pageMap = {
    'about.html': 'about',
    'services.html': 'services',
    'videos.html': 'videos',
    'faq.html': 'faq',
    'contact.html': 'contact',
    'appointment.html': 'appointment',
    'intake.html': 'intake'
  };

  const currentPage = isHomePage ? 'home' : (pageMap[currentPath] || '');

  document.querySelectorAll('[data-page]').forEach(element => {
    element.classList.toggle('is-active', element.dataset.page === currentPage);
  });

  /* CLOSE MENU ON DESKTOP */
  const desktopMediaQuery = window.matchMedia('(min-width: 992px)');

  const handleDesktopChange = event => {
    if (event.matches) {
      closeMenu();
    }
  };

  if (typeof desktopMediaQuery.addEventListener === 'function') {
    desktopMediaQuery.addEventListener('change', handleDesktopChange);
  } else if (typeof desktopMediaQuery.addListener === 'function') {
    desktopMediaQuery.addListener(handleDesktopChange);
  }
}

// FooterWordmark
function initFooterWordmark() {
  const wordmark = document.querySelector('.footer-wordmark');
  if (!wordmark) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          wordmark.classList.add('is-visible');
          observer.unobserve(wordmark);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  observer.observe(wordmark);
}

document.addEventListener('DOMContentLoaded', () => {

  const loadComponent = async (url, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load ${url}`);

      const html = await response.text();
      placeholder.innerHTML = html;

      if (placeholderId === 'header-placeholder') {
        requestAnimationFrame(() => {
          initHeader();
        });
      }

      if (placeholderId === 'footer-placeholder') {
        initFooterWordmark();
      }
    } catch (error) {
      console.warn('Component loading error:', error);
      placeholder.innerHTML = `<!-- Failed to load ${url} -->`;
    }
  };

  loadComponent('components/header.html', 'header-placeholder');
  loadComponent('components/footer.html', 'footer-placeholder');

  /* HERO VIDEO */
  const heroVideo = document.getElementById('hero-video');

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('autoplay', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('loop', '');

    const attemptPlayback = () => {
      const playPromise = heroVideo.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Hero video autoplay was blocked:', error);
        });
      }
    };

    if (heroVideo.readyState >= 2) {
      attemptPlayback();
    } else {
      heroVideo.addEventListener('canplay', attemptPlayback, { once: true });
    }
  }


  /* AOS */
  const initializeAOS = () => {
    if (typeof AOS === 'undefined') {
      console.error('AOS is not available. Check the AOS JavaScript file.');
      return;
    }

    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      mirror: false,
      anchorPlacement: 'top-bottom',
      disable: false
    });

    requestAnimationFrame(() => {
      AOS.refreshHard();
    });
  };

  if (document.readyState === 'complete') {
    initializeAOS();
  } else {
    window.addEventListener('load', initializeAOS, { once: true });
  }


  /* HERO TYPEWRITER */
  (function () {
    const el = document.getElementById('hero-typewriter');
    if (!el) return;

    const phrases = [
      'You are not alone.',
      'Help is here for you.',
      'Healing begins today.',
      'You matter. We care.'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseEnd = 2200;
    const pauseStart = 600;

    function type() {

      const current = phrases[phraseIndex];

      if (isPaused) {
        setTimeout(type, isDeleting ? pauseStart : pauseEnd);
        isPaused = false;
        return;
      }

      if (!isDeleting) {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isPaused = true;
          isDeleting = true;
          setTimeout(type, pauseEnd);
          return;
        }
        setTimeout(type, typeSpeed);
      } else {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          isPaused = true;
          setTimeout(type, pauseStart);
          return;
        }
        setTimeout(type, deleteSpeed);
      }
    }

    setTimeout(type, 900);
  })();


// FOOTER YEAR
  const yearSpan = document.getElementById('copyright-year');
  if (yearSpan) {
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear < 2026 ? 2026 : currentYear;
  }


  const wordmark = document.querySelector('.footer-wordmark');
  if (wordmark) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            wordmark.classList.add('is-visible');
            observer.unobserve(wordmark);
          }
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    observer.observe(wordmark);
  }

});


/* APPOINTMENT FORM */
(function () {
  const form = document.getElementById('appointment-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const currentTimeEl = document.getElementById('current-time');

  const popup = document.getElementById('form-popup');
  const popupIcon = document.getElementById('popup-icon');
  const popupTitle = document.getElementById('popup-title');
  const popupMessage = document.getElementById('popup-message');
  const popupNote = document.getElementById('popup-note');
  const popupClose = document.getElementById('popup-close');
  const popupBackdrop = document.getElementById('popup-backdrop');

  if (!form) return;

  function updateTimeAndStatus() {
    const now = new Date();

    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (currentTimeEl) {
      currentTimeEl.textContent = dateStr + ' • ' + timeStr;
    }

    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hour * 60 + minutes;

    const openMinutes = 9 * 60;
    const closeMinutes = 17 * 60;

    var isOpen = false;
    var message = '';

    if (day === 0) {
      message = 'Closed today • Opens Monday 9:00 AM';
    } else if (day === 6) {
      message = 'Saturday • By appointment only';
    } else {
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        isOpen = true;
        message = 'Office is open • Mon–Fri 9:00 AM – 5:00 PM';
      } else if (currentMinutes < openMinutes) {
        message = 'Currently closed • Opens today at 9:00 AM';
      } else {
        message = 'Currently closed • Opens tomorrow at 9:00 AM';
      }
    }

    if (statusText) statusText.textContent = message;
    if (statusDot) {
      statusDot.classList.toggle('is-open', isOpen);
      statusDot.classList.toggle('is-closed', !isOpen);
    }
  }

  updateTimeAndStatus();
  setInterval(updateTimeAndStatus, 30000);

  function openPopup(type, title, message, note) {
    if (!popup) return;

    popup.hidden = false;
    popup.classList.remove('is-success', 'is-error');
    popup.classList.add(type === 'success' ? 'is-success' : 'is-error');

    if (popupIcon) popupIcon.textContent = type === 'success' ? '✓' : '!';
    if (popupTitle) popupTitle.textContent = title;
    if (popupMessage) popupMessage.textContent = message;
    if (popupNote) popupNote.textContent = note || '';

    document.body.style.overflow = 'hidden';

    if (popupClose) popupClose.focus();
  }

  function closePopup() {
    if (!popup) return;
    popup.hidden = true;
    document.body.style.overflow = '';
  }

  if (popupClose) {
    popupClose.addEventListener('click', closePopup);
  }

  if (popupBackdrop) {
    popupBackdrop.addEventListener('click', closePopup);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup && !popup.hidden) {
      closePopup();
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      var formData = new FormData(form);

      var response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      var data = await response.json().catch(function () {
        return null;
      });

      if (response.ok && data && data.success === true) {
        form.reset();

        var successMessage = (data && data.message)
          ? data.message
          : 'Thank you! Your appointment request has been received.';

        if (data.reference_number) {
          successMessage += ' Reference: ' + data.reference_number + '.';
        }

        openPopup(
          'success',
          'Request received',
          successMessage,
          'We have received your request. A confirmation email will be sent to the address you provided. Our team will also contact you to finalize your appointment.'
        );
      } else {
        var errorMessage = (data && data.message)
          ? data.message
          : 'Something went wrong. Please try again or call us.';

        openPopup(
          'error',
          'Unable to submit',
          errorMessage,
          'If the problem continues, please call us at 347-513-6514 or 667-439-3750.'
        );
      }
    } catch (err) {
      openPopup(
        'error',
        'Connection error',
        'Unable to send your request right now.',
        'Please check your connection or call us directly at 347-513-6514.'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();

/* CONTACT FORM */
(function () {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');

  const popup = document.getElementById('contact-popup');
  const popupIcon = document.getElementById('contact-popup-icon');
  const popupTitle = document.getElementById('contact-popup-title');
  const popupMessage = document.getElementById('contact-popup-message');
  const popupNote = document.getElementById('contact-popup-note');
  const popupClose = document.getElementById('contact-popup-close');
  const popupBackdrop = document.getElementById('contact-popup-backdrop');

  if (!form) return;

  function openPopup(type, title, message, note) {
    if (!popup) return;

    popup.hidden = false;
    popup.classList.remove('is-success', 'is-error');
    popup.classList.add(type === 'success' ? 'is-success' : 'is-error');

    if (popupIcon) popupIcon.textContent = type === 'success' ? '✓' : '!';
    if (popupTitle) popupTitle.textContent = title;
    if (popupMessage) popupMessage.textContent = message;
    if (popupNote) popupNote.textContent = note || '';

    document.body.style.overflow = 'hidden';
    if (popupClose) popupClose.focus();
  }

  function closePopup() {
    if (!popup) return;
    popup.hidden = true;
    document.body.style.overflow = '';
  }

  if (popupClose) {
    popupClose.addEventListener('click', closePopup);
  }

  if (popupBackdrop) {
    popupBackdrop.addEventListener('click', closePopup);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup && !popup.hidden) {
      closePopup();
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      var formData = new FormData(form);

      var response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      var data = await response.json().catch(function () {
        return null;
      });

      if (response.ok && data && data.success === true) {
        form.reset();

        var successMessage = (data && data.message)
          ? data.message
          : 'Your message has been sent successfully.';

        if (data.reference_number) {
          successMessage += ' Reference: ' + data.reference_number + '.';
        }

        openPopup(
          'success',
          'Message sent',
          successMessage,
          'We have received your message. A confirmation email will be sent to the address you provided. Our team will respond as soon as possible.'
        );
      } else {
        var errorMessage = (data && data.message)
          ? data.message
          : 'Something went wrong. Please try again or call us.';

        openPopup(
          'error',
          'Unable to send',
          errorMessage,
          'If the problem continues, please call us at 347-513-6514 or 667-439-3750.'
        );
      }
    } catch (err) {
      openPopup(
        'error',
        'Connection error',
        'Unable to send your message right now.',
        'Please check your connection or call us directly at 347-513-6514.'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();

// FAQ PAGE

(function () {
  const accordion = document.getElementById('faq-accordion');
  const categoriesContainer = document.querySelector('.faq-categories');
  const emptyState = document.getElementById('faq-empty');

  if (!accordion) return;

  const faqData = [
    {
      category: "Services",
      question: "What is the difference between OMHC and PRP?",
      answer: "<p>OMHC (Outpatient Mental Health Clinic) focuses on clinical care such as individual therapy, family therapy, group therapy, psychiatric evaluation, and medication management for children and adults.</p><p>PRP (Psychiatric Rehabilitation Program) is designed for adults and emphasizes practical daily living skills, employment support, money management, social integration, and linkage to community resources.</p>"
    },
    {
      category: "Services",
      question: "Who can receive services at Droyal Mental Wellness?",
      answer: "<p>OMHC serves children, adolescents, and adults. PRP is available for adults who are working toward greater independence and stability in daily life.</p>"
    },
    {
      category: "Services",
      question: "Do you offer both therapy and medication management?",
      answer: "<p>Yes. Through our Outpatient Mental Health Clinic we provide therapy as well as psychiatric evaluation and medication management when it is appropriate for the individual’s care plan.</p>"
    },
    {
      category: "Appointments",
      question: "How do I request an appointment?",
      answer: "<p>You can request an appointment by calling us or by submitting the appointment request form on our website. Once we receive your request, our team will follow up to discuss next steps.</p>"
    },
    {
      category: "Appointments",
      question: "What should I expect at my first visit?",
      answer: "<p>The first visit typically focuses on understanding your needs and goals. We will gather relevant information and begin discussing how our services may support you. You are welcome to ask questions at any time.</p>"
    },
    {
      category: "Appointments",
      question: "Can I bring a family member or support person?",
      answer: "<p>Yes. Family involvement can be an important part of care when it is helpful for the person receiving services. You can discuss this preference with our team when scheduling or during your visit.</p>"
    },
    {
      category: "Getting Started",
      question: "I am not sure which program is right for me. What should I do?",
      answer: "<p>You do not need to decide on your own. When you contact us, we will listen to your situation and help guide you toward the most appropriate option—whether that is OMHC, PRP, or another path.</p>"
    },
    {
      category: "Getting Started",
      question: "Do I need a referral to begin services?",
      answer: "<p>In many cases you can reach out directly. Some situations or insurance plans may involve a referral. Our team can help clarify what is needed when you contact us.</p>"
    },
    {
      category: "Getting Started",
      question: "Where are you located?",
      answer: "<p>We are located at 301 Main Street, Suite 1E, Reisterstown, MD 21136. If you need directions or have questions about arriving for an appointment, please contact us.</p>"
    }
  ];

  let activeCategory = "All";

  function renderCategories() {
    if (!categoriesContainer) return;

    const categories = ["All", ...new Set(faqData.map(item => item.category))];

    categoriesContainer.innerHTML = categories.map(cat => `
      <button
        type="button"
        class="faq-category-btn${cat === activeCategory ? ' is-active' : ''}"
        role="tab"
        aria-selected="${cat === activeCategory}"
        data-category="${cat}"
      >
        ${cat}
      </button>
    `).join('');

    categoriesContainer.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        renderCategories();
        renderAccordion();
      });
    });
  }

  function renderAccordion() {
    const filtered = activeCategory === "All"
      ? faqData
      : faqData.filter(item => item.category === activeCategory);

    if (filtered.length === 0) {
      accordion.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    accordion.innerHTML = filtered.map((item, index) => {
      const id = `faq-item-${index}`;
      return `
        <div class="faq-item">
          <button
            type="button"
            class="faq-question"
            id="${id}-question"
            aria-expanded="false"
            aria-controls="${id}-answer"
          >
            <span>${item.question}</span>
            <span class="faq-question-icon" aria-hidden="true">
              <i class="fa-solid fa-plus"></i>
            </span>
          </button>
          <div
            class="faq-answer"
            id="${id}-answer"
            role="region"
            aria-labelledby="${id}-question"
            hidden
          >
            <div class="faq-answer-inner">
              <div class="faq-answer-content">
                ${item.answer}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach toggle listeners
    accordion.querySelectorAll('.faq-item').forEach(item => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        accordion.querySelectorAll('.faq-item.is-open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            const openBtn = openItem.querySelector('.faq-question');
            const openAnswer = openItem.querySelector('.faq-answer');
            openBtn.setAttribute('aria-expanded', 'false');
            openAnswer.hidden = true;
          }
        });

        item.classList.toggle('is-open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        answer.hidden = isOpen;
      });
    });
  }

  /* ---------- INIT ---------- */
  renderCategories();
  renderAccordion();
})();


/* ============================================
   VIDEOS PAGE — FEATURED + GRID (additive)
   ============================================ */

(function () {
  const featuredEmbed = document.getElementById('featured-embed');
  const featuredTitle = document.getElementById('featured-title');
  const featuredDesc  = document.getElementById('featured-desc');
  const featuredDate  = document.getElementById('featured-date');
  const grid          = document.getElementById('videos-grid');
  const categoriesEl  = document.querySelector('.video-categories');
  const emptyState    = document.getElementById('videos-empty');

  if (!featuredEmbed || !grid) return;

  /* ---------- VIDEO DATA ---------- */
  /* Replace youtubeId values with real IDs when available */
  const videoData = [
    {
      id: 1,
      youtubeId: "dQw4w9WgXcQ",          // placeholder — replace with real ID
      title: "Welcome to Our Community",
      description: "A short introduction to the supportive environment at Droyal Mental Wellness.",
      date: "March 2025",
      category: "Community"
    },
    {
      id: 2,
      youtubeId: "dQw4w9WgXcQ",
      title: "Daily Living Skills in Action",
      description: "See how practical skills support greater independence and confidence.",
      date: "February 2025",
      category: "PRP"
    },
    {
      id: 3,
      youtubeId: "dQw4w9WgXcQ",
      title: "Group Connection Moments",
      description: "Highlights from group activities that foster connection and shared growth.",
      date: "January 2025",
      category: "Activities"
    },
    {
      id: 4,
      youtubeId: "dQw4w9WgXcQ",
      title: "A Calm Space for Progress",
      description: "A look at the professional yet welcoming setting where care takes place.",
      date: "December 2024",
      category: "Community"
    },
    {
      id: 5,
      youtubeId: "dQw4w9WgXcQ",
      title: "Building Everyday Routines",
      description: "Practical support that helps adults strengthen daily living skills.",
      date: "November 2024",
      category: "PRP"
    },
    {
      id: 6,
      youtubeId: "dQw4w9WgXcQ",
      title: "Community Gathering Highlights",
      description: "Moments of connection and encouragement from a recent gathering.",
      date: "October 2024",
      category: "Activities"
    }
  ];

  let activeCategory = "All";
  let activeVideoId  = videoData[0].id;

  /* ---------- HELPERS ---------- */
  function youtubeThumb(id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  function createEmbed(youtubeId) {
    return `
      <iframe
        src="https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1"
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
  }


  function setFeatured(video) {
    activeVideoId = video.id;
    featuredEmbed.innerHTML = createEmbed(video.youtubeId);
    featuredTitle.textContent = video.title;
    featuredDesc.textContent  = video.description;
    featuredDate.textContent  = video.date;


    grid.querySelectorAll('.video-card').forEach(card => {
      card.classList.toggle('is-active', Number(card.dataset.id) === video.id);
    });
  }


  function renderCategories() {
    if (!categoriesEl) return;

    const cats = ["All", ...new Set(videoData.map(v => v.category))];

    categoriesEl.innerHTML = cats.map(cat => `
      <button
        type="button"
        class="video-category-btn${cat === activeCategory ? ' is-active' : ''}"
        role="tab"
        aria-selected="${cat === activeCategory}"
        data-category="${cat}"
      >
        ${cat}
      </button>
    `).join('');

    categoriesEl.querySelectorAll('.video-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        renderCategories();
        renderGrid();
      });
    });
  }


  function renderGrid() {
    const filtered = activeCategory === "All"
      ? videoData
      : videoData.filter(v => v.category === activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    grid.innerHTML = filtered.map(video => `
      <article
        class="video-card${video.id === activeVideoId ? ' is-active' : ''}"
        data-id="${video.id}"
        tabindex="0"
        role="button"
        aria-label="Play video: ${video.title}"
      >
        <div class="video-card-thumb">
          <img
            src="${youtubeThumb(video.youtubeId)}"
            alt=""
            width="480"
            height="360"
            loading="lazy"
            decoding="async"
          >
          <div class="video-card-play" aria-hidden="true">
            <span class="video-card-play-icon">
              <i class="fa-solid fa-play"></i>
            </span>
          </div>
        </div>
        <div class="video-card-body">
          <h3 class="video-card-title">${video.title}</h3>
          <p class="video-card-desc">${video.description}</p>
          <p class="video-card-date">${video.date}</p>
        </div>
      </article>
    `).join('');


    grid.querySelectorAll('.video-card').forEach(card => {
      const activate = () => {
        const video = videoData.find(v => v.id === Number(card.dataset.id));
        if (video) {
          setFeatured(video);

          if (window.innerWidth < 768) {
            document.querySelector('.videos-featured')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      };

      card.addEventListener('click', activate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  /* ---------- INIT ---------- */
  setFeatured(videoData[0]);
  renderCategories();
  renderGrid();
})();


/* POLICY BANNER */

(function () {
  const STORAGE_KEY = 'droyal_policy_accepted';


  try {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return;
    }
  } catch (e) {

  }


  const banner = document.createElement('div');
  banner.id = 'policy-banner';
  banner.className = 'policy-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'policy-banner-title');
  banner.setAttribute('aria-describedby', 'policy-banner-desc');
  banner.hidden = true;

  banner.innerHTML = `
    <div class="policy-banner-inner">
      <div class="policy-banner-content">
        <p id="policy-banner-title" class="policy-banner-title">Your privacy matters</p>
        <p id="policy-banner-desc" class="policy-banner-text">
          We use this website to share information about our services and to receive appointment and contact requests.
          By continuing, you acknowledge our
          <a href="privacy.html">Privacy Policy</a> and
          <a href="terms.html">Terms of Use</a>.
        </p>
      </div>
      <div class="policy-banner-actions">
        <button type="button" class="btn btn--primary btn--sm" id="policy-accept-btn">
          Accept &amp; Continue
        </button>
      </div>
    </div>
  `;


  document.body.appendChild(banner);

  const acceptBtn = banner.querySelector('#policy-accept-btn');


  setTimeout(() => {
    banner.hidden = false;
    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });
  }, 1200);


  acceptBtn.addEventListener('click', () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {

    }

    banner.classList.remove('is-visible');

    setTimeout(() => {
      banner.remove();
    }, 400);
  });
})();