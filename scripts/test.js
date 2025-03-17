window.testMode = (function() {
    let testSetupEl, testInProgressEl, testCompleteEl;
    let totalQuestionsCountEl, testCountInput, startTestBtn;
    let testQuestionEl, answerInput, submitAnswerBtn;
    let testScoreEl, testResultEl;
    let finalScoreEl, testSummaryEl, restartTestBtn;
  
    let testQueue = [];
    let testAnswers = [];
    let testIndex = 0;
    let testScore = 0;
    let testAttempted = 0;
    let testCount = 0;
  
    function initTestUI() {
      testSetupEl = document.getElementById('testSetup');
      testInProgressEl = document.getElementById('testInProgress');
      testCompleteEl = document.getElementById('testComplete');
      totalQuestionsCountEl = document.getElementById('totalQuestionsCount');
      testCountInput = document.getElementById('testCountInput');
      startTestBtn = document.getElementById('startTestBtn');
  
      testQuestionEl = document.getElementById('testQuestion');
      answerInput = document.getElementById('answerInput');
      submitAnswerBtn = document.getElementById('submitAnswer');
      testScoreEl = document.getElementById('testScore');
      testResultEl = document.getElementById('testResult');
  
      finalScoreEl = document.getElementById('finalScore');
      testSummaryEl = document.getElementById('testSummary');
      restartTestBtn = document.getElementById('restartTest');
  
      startTestBtn.addEventListener('click', startTest);
      submitAnswerBtn.addEventListener('click', submitTestAnswer);
      answerInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          submitTestAnswer();
        }
      });
      restartTestBtn.addEventListener('click', resetTest);
    }
  
    function showTestStep(step) {
      testSetupEl.style.display = (step === 'setup') ? 'block' : 'none';
      testInProgressEl.style.display = (step === 'inprogress') ? 'block' : 'none';
      testCompleteEl.style.display = (step === 'complete') ? 'block' : 'none';
    }
  
    function resetTest() {
      testQueue = [];
      testAnswers = [];
      testIndex = 0;
      testScore = 0;
      testAttempted = 0;
      testCount = 0;
      testResultEl.textContent = '';
      testScoreEl.textContent = 'Score: 0/0 (0%)';
      testSummaryEl.innerHTML = '';
      finalScoreEl.innerHTML = '';
      testCountInput.value = '1';
      showTestStep('setup');
      updateTestUI();
    }
  
    function updateTestUI() {
      const totalCount = store.allQuestions.length;
      totalQuestionsCountEl.textContent = String(totalCount);
      startTestBtn.disabled = (totalCount === 0);
    }
  
    function startTest() {
      const totalCount = store.allQuestions.length;
      const desiredCount = parseInt(testCountInput.value, 10);
  
      if (isNaN(desiredCount) || desiredCount < 1 || desiredCount > totalCount) {
        alert(`Please enter a valid number between 1 and ${totalCount}.`);
        return;
      }
      testCount = desiredCount;
  
      shuffleArray(store.allQuestions);
      testQueue = store.allQuestions.slice(0, testCount);
      testAnswers = new Array(testCount).fill(null);
      testIndex = 0;
      testScore = 0;
      testAttempted = 0;
  
      showTestStep('inprogress');
      showTestQuestion();
      updateTestScore();
      answerInput.disabled = false;
      submitAnswerBtn.disabled = false;
    }
  
    function showTestQuestion() {
      if (testIndex < testQueue.length) {
        testQuestionEl.textContent = testQueue[testIndex].question;
        answerInput.value = '';
        answerInput.focus();
        testResultEl.textContent = '';
      } else {
        showTestResults();
      }
    }
  
    function updateTestScore() {
      let percentage = testAttempted > 0 ? ((testScore / testAttempted) * 100).toFixed(1) : 0;
      testScoreEl.textContent = `Score: ${testScore}/${testAttempted} (${percentage}%)`;
    }
  
    function submitTestAnswer() {
      if (testIndex >= testQueue.length) return;
      const userAnswer = answerInput.value.trim();
      const correctAnswer = testQueue[testIndex].answer.trim();
      testAnswers[testIndex] = userAnswer;
      testAttempted++;

      let waitTime = 1000;
  
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        testScore++;
        testResultEl.textContent = 'Correct!';
        testResultEl.style.color = 'green';
      } else {
        testResultEl.textContent = `Incorrect. The answer was: ${correctAnswer}`;
        testResultEl.style.color = 'red';
        waitTime += 2000; // wait longer if wrong answer
      }
      updateTestScore();
      testIndex++;
  
      setTimeout(() => {
        showTestQuestion();
      }, waitTime);
    }
  
    function showTestResults() {
      showTestStep('complete');
      let percentage = testAttempted > 0 ? ((testScore / testAttempted) * 100).toFixed(1) : 0;
      finalScoreEl.innerHTML = `Final Score: ${testScore}/${testAttempted} (${percentage}%)`;
  
      let summaryHtml = '';
      for (let i = 0; i < testQueue.length; i++) {
        const q = testQueue[i];
        const correct = q.answer.trim();
        const userA = testAnswers[i] ? testAnswers[i].trim() : '';
        const isCorrect = (userA.toLowerCase() === correct.toLowerCase());
        summaryHtml += `
          <div class="summary-item">
            <div><strong>Question:</strong> ${q.question}</div>
            <div><strong>Your Answer:</strong> <span class="${isCorrect ? 'correct' : 'incorrect'}">${userA || '(no answer)'}</span></div>
            <div><strong>Correct Answer:</strong> ${correct}</div>
          </div>
        `;
      }
      testSummaryEl.innerHTML = summaryHtml;
    }
  
    function initializeTest() {
      initTestUI();
      resetTest();
    }
  
    return {
      initializeTest,
      resetTest,
      updateTestUI
    };
  })();
  