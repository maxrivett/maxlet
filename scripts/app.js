document.addEventListener('DOMContentLoaded', function() {
    // 1. Load data
    storeAPI.loadSetsFromStorage();
    storeAPI.updateAllQuestions();
  
    // 2. Initialize modules
    flashcards.initializeFlashcards();
    testMode.initializeTest();
    learnMode.initializeLearn();
    addQuestions.initializeAddQuestions();
  
    // Tab switching
    const flashcardsTab = document.getElementById('flashcardsTab');
    const testTab = document.getElementById('testTab');
    const learnTab = document.getElementById('learnTab');
    const addTab = document.getElementById('addTab');
  
    const flashcardsModeEl = document.getElementById('flashcardsMode');
    const testModeEl = document.getElementById('testMode');
    const learnModeEl = document.getElementById('learnMode');
    const addQuestionsModeEl = document.getElementById('addQuestionsMode');
  
    function switchMode(mode) {
      [flashcardsModeEl, testModeEl, learnModeEl, addQuestionsModeEl].forEach(el => el.classList.remove('active'));
      [flashcardsTab, testTab, learnTab, addTab].forEach(btn => btn.classList.remove('active'));
  
      if (mode === 'flashcards') {
        flashcardsModeEl.classList.add('active');
        flashcardsTab.classList.add('active');
        location.hash = '#flashcards';
      } else if (mode === 'test') {
        testModeEl.classList.add('active');
        testTab.classList.add('active');
        location.hash = '#test';
      } else if (mode === 'learn') {
        learnModeEl.classList.add('active');
        learnTab.classList.add('active');
        location.hash = '#learn';
        learnMode.updateLearnUI();
      } else if (mode === 'add') {
        addQuestionsModeEl.classList.add('active');
        addTab.classList.add('active');
        location.hash = '#add';
      }
    }
  
    flashcardsTab.addEventListener('click', () => switchMode('flashcards'));
    testTab.addEventListener('click', () => switchMode('test'));
    learnTab.addEventListener('click', () => switchMode('learn'));
    addTab.addEventListener('click', () => switchMode('add'));
  
    function checkHash() {
      const hash = location.hash.replace('#','');
      if (hash === 'test') {
        switchMode('test');
      } else if (hash === 'learn') {
        switchMode('learn');
      } else if (hash === 'add') {
        switchMode('add');
      } else {
        switchMode('flashcards');
      }
    }
    window.addEventListener('hashchange', checkHash);
    checkHash(); // On page load, pick tab from hash
  
    // 3. Question Set Dropdown
    const setSelector = document.getElementById('setSelector');
    const createSetBtn = document.getElementById('createSetBtn');
  
    window.populateSetSelectorInApp = function() {
      setSelector.innerHTML = '';
      const setNames = Object.keys(store.sets).sort();
      setNames.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        if (name === store.activeSet) {
          opt.selected = true;
        }
        setSelector.appendChild(opt);
      });
    };
  
    function populateSetSelector() {
      window.populateSetSelectorInApp();
    }
  
    setSelector.addEventListener('change', (e) => {
      storeAPI.setActiveSet(e.target.value);
      testMode.resetTest();
      learnMode.resetLearn();
      addQuestions.initializeAddQuestions();
      flashcards.refreshFlashcards();
    });
  
    createSetBtn.addEventListener('click', () => {
      const newName = prompt("Enter a name for the new set:");
      if (newName && newName.trim()) {
        storeAPI.createNewSet(newName.trim());
        populateSetSelector();
        setSelector.value = store.activeSet;
        // Switch to the "Add" tab right after creating the set
        switchMode('add');
        // Re-init so the new set is shown
        testMode.resetTest();
        learnMode.resetLearn();
        addQuestions.initializeAddQuestions();
        flashcards.refreshFlashcards();
      }
    });
  
    // Populate the dropdown initially
    populateSetSelector();
  });
  