// INTAKE FORM
(function () {
  'use strict';

  const TOTAL_STEPS = 7;

  const welcomeScreen = document.getElementById('welcome-screen');
  const formScreen = document.getElementById('form-screen');
  const successScreen = document.getElementById('success-screen');
  const startBtn = document.getElementById('start-btn');
  const form = document.getElementById('intake-form');
  const nextBtn = document.getElementById('next-btn');
  const backBtn = document.getElementById('back-btn');
  const submitBtn = document.getElementById('submit-btn');
  const progressSteps = document.querySelectorAll('.progress-step');
  const formSteps = document.querySelectorAll('.form-step');
  const refNumberEl = document.getElementById('ref-number');

  if (!form) return;

  let currentStep = 1;

  /* ---------- Helpers ---------- */

  function hideElement(element) {
    if (!element) return;

    element.hidden = true;
    element.style.display = 'none';
  }

  function showElement(element) {
    if (!element) return;

    element.hidden = false;
    element.style.display = '';
  }

  function showScreen(screen) {
    [welcomeScreen, formScreen, successScreen].forEach(screenEl => {
      hideElement(screenEl);
    });

    showElement(screen);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function updateProgress() {
    progressSteps.forEach(step => {
      const num = Number(step.dataset.step);

      step.classList.remove(
        'is-active',
        'is-complete'
      );

      if (num === currentStep) {
        step.classList.add('is-active');
      } else if (num < currentStep) {
        step.classList.add('is-complete');
      }
    });
  }

  function showStep(step) {
    formSteps.forEach(stepEl => {
      const num = Number(stepEl.dataset.step);

      if (num === step) {
        showElement(stepEl);
        stepEl.classList.add('is-active');
      } else {
        hideElement(stepEl);
        stepEl.classList.remove('is-active');
      }
    });

    if (backBtn) {
      backBtn.hidden = step === 1;
    }

    if (nextBtn) {
      nextBtn.hidden = step === TOTAL_STEPS;
    }

    if (submitBtn) {
      const isLastStep = step === TOTAL_STEPS;

      submitBtn.hidden = !isLastStep;
      submitBtn.style.display = isLastStep ? '' : 'none';
    }

    currentStep = step;

    updateProgress();

    const activeStep = document.querySelector(
      `.form-step[data-step="${step}"]`
    );

    if (activeStep) {
      const first = activeStep.querySelector(
        'input, select, textarea, button'
      );

      if (first) {
        setTimeout(() => {
          first.focus({
            preventScroll: true
          });
        }, 80);
      }
    }
  }

  function clearErrors(stepEl) {
    if (!stepEl) return;

    stepEl.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
    });

    stepEl.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });

    stepEl.querySelectorAll('.is-invalid-group').forEach(el => {
      el.classList.remove('is-invalid-group');
    });
  }

  function setError(name, message) {
    const errorEl = document.querySelector(
      `[data-error-for="${name}"]`
    );

    if (errorEl) {
      errorEl.textContent = message;
    }

    const inputs = form.querySelectorAll(
      `[name="${name}"], [name="${name}[]"]`
    );

    inputs.forEach(input => {
      if (
        input.type === 'radio' ||
        input.type === 'checkbox'
      ) {
        const group = input.closest(
          '.radio-cards, .radio-row, .checkbox-list, .field-group'
        );

        if (group) {
          group.classList.add('is-invalid-group');
        }
      } else {
        input.classList.add('is-invalid');
      }
    });
  }

  function validateStep(step) {
    const stepEl = document.querySelector(
      `.form-step[data-step="${step}"]`
    );

    if (!stepEl) return true;

    clearErrors(stepEl);

    let valid = true;

    /* ---------- Step 1 ---------- */

    if (step === 1) {
      const seeking = form.querySelector(
        'input[name="seeking_services_for"]:checked'
      );

      if (!seeking) {
        setError(
          'seeking_services_for',
          'Please select who this intake is for.'
        );

        valid = false;
      }

      const relationshipGroup =
        document.getElementById('relationship-group');

      if (
        relationshipGroup &&
        !relationshipGroup.hidden
      ) {
        const rel =
          form.relationship_to_client.value;

        if (!rel) {
          setError(
            'relationship_to_client',
            'Please select your relationship to the client.'
          );

          valid = false;
        }
      }

      const first =
        form.first_name.value.trim();

      if (!first) {
        setError(
          'first_name',
          'First name is required.'
        );

        valid = false;
      }

      const last =
        form.last_name.value.trim();

      if (!last) {
        setError(
          'last_name',
          'Last name is required.'
        );

        valid = false;
      }

      const email =
        form.email.value.trim();

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        setError(
          'email',
          'Please enter a valid email address.'
        );

        valid = false;
      }
    }

    /* ---------- Step 2 ---------- */

    if (step === 2) {
      const services = form.querySelectorAll(
        'input[name="services_requested[]"]:checked'
      );

      if (services.length === 0) {
        setError(
          'services_requested',
          'Please select at least one service option.'
        );

        valid = false;
      }
    }

    /* ---------- Step 7 ---------- */

    if (step === 7) {
      if (!form.privacy_acknowledged.checked) {
        setError(
          'privacy_acknowledged',
          'Please acknowledge the privacy statement.'
        );

        valid = false;
      }

      if (!form.information_accuracy_confirmed.checked) {
        setError(
          'information_accuracy_confirmed',
          'Please confirm the accuracy of the information.'
        );

        valid = false;
      }
    }

    return valid;
  }

  /* ---------- Conditional fields ---------- */

  function initConditionals() {

    /* Who is this for */

    const seekingRadios =
      form.querySelectorAll(
        'input[name="seeking_services_for"]'
      );

    const relationshipGroup =
      document.getElementById(
        'relationship-group'
      );

    seekingRadios.forEach(radio => {
      radio.addEventListener('change', () => {

        const value = radio.value;

        if (
          value === 'my_child' ||
          value === 'another_person'
        ) {
          showElement(relationshipGroup);

          form.relationship_to_client.required = true;

        } else {
          hideElement(relationshipGroup);

          form.relationship_to_client.required = false;
          form.relationship_to_client.value = '';
        }
      });
    });


    /* PRP support areas */

    const serviceCheckboxes =
      form.querySelectorAll(
        'input[name="services_requested[]"]'
      );

    const prpAreasGroup =
      document.getElementById(
        'prp-areas-group'
      );

    serviceCheckboxes.forEach(cb => {

      cb.addEventListener('change', () => {

        const prpChecked =
          form.querySelector(
            'input[name="services_requested[]"][value="PRP"]'
          )?.checked;

        if (prpAreasGroup) {

          if (prpChecked) {
            showElement(prpAreasGroup);
          } else {
            hideElement(prpAreasGroup);

            prpAreasGroup
              .querySelectorAll(
                'input[type="checkbox"]'
              )
              .forEach(c => {
                c.checked = false;
              });
          }
        }
      });
    });


    /* Medication */

    const medRadios =
      form.querySelectorAll(
        'input[name="currently_taking_mental_health_medication"]'
      );

    const medNamesGroup =
      document.getElementById(
        'medication-names-group'
      );

    medRadios.forEach(radio => {

      radio.addEventListener('change', () => {

        if (radio.value === 'yes') {
          showElement(medNamesGroup);
        } else {
          hideElement(medNamesGroup);

          form.medication_names.value = '';
        }
      });
    });


    /* Insurance */

    const insuranceRadios =
      form.querySelectorAll(
        'input[name="has_health_insurance"]'
      );

    const insuranceFields =
      document.getElementById(
        'insurance-fields'
      );

    insuranceRadios.forEach(radio => {

      radio.addEventListener('change', () => {

        if (radio.value === 'yes') {
          showElement(insuranceFields);
        } else {
          hideElement(insuranceFields);

          form.insurance_provider.value = '';
          form.insurance_member_policy_id.value = '';
        }
      });
    });
  }


  /* ---------- Start Intake ---------- */

  startBtn?.addEventListener('click', () => {

    showScreen(formScreen);

    showStep(1);
  });


  /* ---------- Continue ---------- */

  nextBtn?.addEventListener('click', () => {

    if (!validateStep(currentStep)) {

      const firstError =
        document.querySelector(
          '.field-error:not(:empty)'
        );

      if (firstError) {
        firstError.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      return;
    }

    if (currentStep < TOTAL_STEPS) {
      showStep(currentStep + 1);
    }
  });


  /* ---------- Back ---------- */

  backBtn?.addEventListener('click', () => {

    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  });


  /* ---------- Submit ---------- */

  form.addEventListener(
    'submit',
    async function (e) {

      e.preventDefault();

      if (!validateStep(TOTAL_STEPS)) {

        const firstError =
          document.querySelector(
            '.field-error:not(:empty)'
          );

        if (firstError) {
          firstError.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }

        return;
      }

      const originalText =
        submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';

      try {

        const formData =
          new FormData(form);

        const response =
          await fetch(
            form.action,
            {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json'
              }
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (
          response.ok &&
          data &&
          data.success === true
        ) {

          if (
            refNumberEl &&
            data.reference_number
          ) {
            refNumberEl.textContent =
              data.reference_number;
          } else if (refNumberEl) {
            refNumberEl.textContent =
              data.reference || '—';
          }

          showScreen(successScreen);

        } else {

          const msg =
            data && data.message
              ? data.message
              : 'Something went wrong. Please try again or call us.';

          alert(msg);
        }

      } catch (err) {

        alert(
          'Unable to submit right now. Please check your connection or call us at 347-513-6514.'
        );

      } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  );


  /* ---------- Initialize ---------- */

  initConditionals();

  hideElement(formScreen);
  hideElement(successScreen);

  showElement(welcomeScreen);

  if (submitBtn) {
    submitBtn.hidden = true;
    submitBtn.style.display = 'none';
  }

  showStep(1);

})();