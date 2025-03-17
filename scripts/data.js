window.store = {
    sets: {},         // { "SetName": [ {question, answer, learned}, ...], ... }
    activeSet: "",    // which set is selected
    allQuestions: []  // the currently loaded (and shuffled) Q&A for activeSet
  };
  
  // If no localStorage data, we initialize with some default questions
  function initDefaultQuestions() {
    return [
      { question: "What is 2 + 2?", answer: "4", learned: 0 },
      { question: "What is the capital of France?", answer: "Paris", learned: 0 },
      { question: "Who wrote 'To be, or not to be'?", answer: "William Shakespeare", learned: 0 }
    ];
  }
  
  function loadSetsFromStorage() {
    const data = localStorage.getItem('questionSets');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        store.sets = parsed.sets;
        store.activeSet = parsed.activeSet;
      } catch(e) {
        console.error("Error loading sets:", e);
        store.sets = { "Default": initDefaultQuestions() };
        store.activeSet = "Default";
        saveSetsToStorage();
      }
    } else {
      store.sets = { "Default": initDefaultQuestions() };
      store.activeSet = "Default";
      saveSetsToStorage();
    }
  
    // Ensure there's at least one set
    const setNames = Object.keys(store.sets);
    if (setNames.length === 0) {
      store.sets["Default"] = initDefaultQuestions();
      store.activeSet = "Default";
      saveSetsToStorage();
    }
    if (!store.sets[store.activeSet]) {
      store.activeSet = setNames[0];
      saveSetsToStorage();
    }
  
    // Ensure each question has a "learned" property
    for (let setName of Object.keys(store.sets)) {
      store.sets[setName].forEach(q => {
        if (typeof q.learned !== 'number') {
          q.learned = 0;
        }
      });
    }
  }
  
  function saveSetsToStorage() {
    const data = {
      sets: store.sets,
      activeSet: store.activeSet
    };
    localStorage.setItem('questionSets', JSON.stringify(data));
  }
  
  function getActiveQuestions() {
    return store.sets[store.activeSet] || [];
  }
  
  // Fisher-Yates shuffle
  function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] =
        [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
  
  function updateAllQuestions() {
    // Rebuild allQuestions from the active set
    const activeQs = getActiveQuestions();
    // Make sure each question has learned
    activeQs.forEach(q => {
      if (typeof q.learned !== 'number') {
        q.learned = 0;
      }
    });
    store.allQuestions = shuffleArray([...activeQs]);
  }
  
  function setActiveSet(name) {
    if (store.sets[name]) {
      store.activeSet = name;
      saveSetsToStorage();
      updateAllQuestions();
    }
  }
  
  function createNewSet(setName) {
    if (!setName.trim()) return;
    if (!store.sets[setName]) {
      store.sets[setName] = [];
      store.activeSet = setName;
      saveSetsToStorage();
      updateAllQuestions();
    }
  }
  
  function renameActiveSet(newName) {
    if (!newName.trim()) return;
    if (store.sets[newName]) {
      alert("A set with that name already exists.");
      return;
    }
    const oldName = store.activeSet;
    store.sets[newName] = store.sets[oldName];
    delete store.sets[oldName];
    store.activeSet = newName;
    saveSetsToStorage();
    updateAllQuestions();
  }
  
  function deleteActiveSet() {
    const setNames = Object.keys(store.sets);
    if (setNames.length === 1) {
      alert("Cannot delete the only set.");
      return;
    }
    delete store.sets[store.activeSet];
    const newActive = Object.keys(store.sets)[0];
    store.activeSet = newActive;
    saveSetsToStorage();
    updateAllQuestions();
  }
  
  function resetLearnedStats() {
    const qs = getActiveQuestions();
    qs.forEach(q => { q.learned = 0; });
    saveSetsToStorage();
    updateAllQuestions();
  }
  
  window.storeAPI = {
    loadSetsFromStorage,
    saveSetsToStorage,
    getActiveQuestions,
    updateAllQuestions,
    setActiveSet,
    createNewSet,
    renameActiveSet,
    deleteActiveSet,
    resetLearnedStats
  };
  