/* learn.js
   --------
   A "Learn" mode similar to Quizlet's. Each question has a "learned" integer.
   The lower the "learned" value, the more frequently the question appears.
   - If correct, learned++
   - If wrong, learned--
   - Weighted random selection: probability ~ 1/(1+learned)
   - "Reset Learned Stats" sets all learned = 0 for the active set

   STILL NOT FINISHED
*/

window.learnMode = (function() {
    let learnStatsEl, learnQuestionEl;
    let learnAnswerInput, learnSubmitBtn;
    let learnFeedbackEl, learnNextBtn;
    let resetLearnBtn;
  
    // The index of the question currently shown (in the active set array).
    // We'll pick it at random each time from the weighting function.
    let currentQuestionIndex = null;
    let inFeedback = false; // track if we've just answered
  
    // A simple function to pick the next question with weighting:
    // Probability ~ 1/(1 + question.learned).
    function pickNextWeighted() {
      const qs = storeAPI.getActiveQuestions();
      if (!qs.length) return -1;
      let sum = 0;
      const weights = qs.map(q => {
        // If learned is negative, clamp to 0
        if (q.learned < 0) q.learned = 0;
        const w = 1 / (1 + q.learned);
        sum += w;
        return w;
      });
      let r = Math.random() * sum;
      let accum = 0;
      for (let i = 0; i < qs.length; i++) {
        accum += weights[i];
        if (r <= accum) return i;
      }
      return qs.length - 1;
    }
  
    // Count how many are "learned" (i.e. learned >= 3).
    function countLearned() {
      const qs = storeAPI.getActiveQuestions();
      let c = 0;
      qs.forEach(q => {
        if (q.learned >= 3) c++;
      });
      return c;
    }
  
    function updateLearnStatsDisplay() {
      const total = storeAPI.getActiveQuestions().length;
      const learnedCount = countLearned();
      learnStatsEl.textContent = `You have learned ${learnedCount} out of ${total} questions (learned = 3).`;
    }
  
    function showNextQuestion() {
      const qs = storeAPI.getActiveQuestions();
      if (!qs.length) {
        learnQuestionEl.textContent = "No questions in this set!";
        learnAnswerInput.value = "";
        learnAnswerInput.disabled = true;
        learnSubmitBtn.disabled = true;
        return;
      }
      currentQuestionIndex = pickNextWeighted();
      inFeedback = false;
      learnFeedbackEl.textContent = "";
      learnNextBtn.style.display = "none";
      learnAnswerInput.value = "";
      learnAnswerInput.disabled = false;
      learnSubmitBtn.disabled = false;
  
      learnQuestionEl.textContent = qs[currentQuestionIndex].question;
      updateLearnStatsDisplay();
    }
  
    function submitLearnAnswer() {
      if (currentQuestionIndex == null) return;
      if (inFeedback) return; // already answered, wait for next
      const qs = storeAPI.getActiveQuestions();
      if (!qs.length) return;
  
      const userAnswer = learnAnswerInput.value.trim();
      const correctAnswer = qs[currentQuestionIndex].answer.trim();
  
      // Evaluate correctness
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        // correct
        qs[currentQuestionIndex].learned++;
        learnFeedbackEl.textContent = "Correct!";
        learnFeedbackEl.style.color = "green";
      } else {
        // incorrect
        qs[currentQuestionIndex].learned = Math.max(0, qs[currentQuestionIndex].learned - 1);
        learnFeedbackEl.textContent = `Incorrect. The answer was: ${correctAnswer}`;
        learnFeedbackEl.style.color = "red";
      }
      storeAPI.saveSetsToStorage(); // persist updated "learned"
      updateLearnStatsDisplay();
  
      // Show "Next" button
      learnNextBtn.style.display = "inline-block";
      learnAnswerInput.disabled = true;
      learnSubmitBtn.disabled = true;
      inFeedback = true;
    }
  
    function initLearnUI() {
      learnStatsEl = document.getElementById('learnStats');
      learnQuestionEl = document.getElementById('learnQuestion');
      learnAnswerInput = document.getElementById('learnAnswerInput');
      learnSubmitBtn = document.getElementById('learnSubmitBtn');
      learnFeedbackEl = document.getElementById('learnFeedback');
      learnNextBtn = document.getElementById('learnNextBtn');
      resetLearnBtn = document.getElementById('resetLearnBtn');
  
      learnSubmitBtn.addEventListener('click', submitLearnAnswer);
      learnAnswerInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          submitLearnAnswer();
        }
      });
      learnNextBtn.addEventListener('click', () => {
        showNextQuestion();
      });
      resetLearnBtn.addEventListener('click', () => {
        if (!confirm("Reset all 'learned' stats to 0 for this set?")) return;
        storeAPI.resetLearnedStats();
        // Refresh
        showNextQuestion();
      });
    }
  
    function resetLearn() {
      currentQuestionIndex = null;
      inFeedback = false;
      learnFeedbackEl.textContent = "";
      learnAnswerInput.value = "";
      learnAnswerInput.disabled = false;
      learnSubmitBtn.disabled = false;
      learnNextBtn.style.display = "none";
      updateLearnStatsDisplay();
    }
  
    function updateLearnUI() {
      // If the set is empty, disable everything
      const total = storeAPI.getActiveQuestions().length;
      if (total === 0) {
        learnQuestionEl.textContent = "No questions in this set!";
        learnAnswerInput.disabled = true;
        learnSubmitBtn.disabled = true;
        learnNextBtn.style.display = "none";
        learnFeedbackEl.textContent = "";
        learnStatsEl.textContent = "";
      } else {
        showNextQuestion();
      }
    }
  
    function initializeLearn() {
      initLearnUI();
      resetLearn();
    }
  
    return {
      initializeLearn,
      updateLearnUI,
      resetLearn
    };
  })();
  