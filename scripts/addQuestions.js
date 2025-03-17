window.addQuestions = (function() {
    let formList, addRowBtn, saveFormBtn;
    let jsonText, refreshJsonBtn, importJsonBtn;
    let setNameInput, renameSetBtn, deleteSetBtn;
  
    function initAddUI() {
      formList = document.getElementById('formList');
      addRowBtn = document.getElementById('addRowBtn');
      saveFormBtn = document.getElementById('saveFormBtn');
      jsonText = document.getElementById('jsonText');
      refreshJsonBtn = document.getElementById('refreshJsonBtn');
      importJsonBtn = document.getElementById('importJsonBtn');
  
      setNameInput = document.getElementById('setNameInput');
      renameSetBtn = document.getElementById('renameSetBtn');
      deleteSetBtn = document.getElementById('deleteSetBtn');
  
      addRowBtn.addEventListener('click', addEmptyRow);
      saveFormBtn.addEventListener('click', saveFormData);
      refreshJsonBtn.addEventListener('click', refreshJsonBox);
      importJsonBtn.addEventListener('click', importJson);
  
      renameSetBtn.addEventListener('click', () => {
        storeAPI.renameActiveSet(setNameInput.value.trim());
        refreshAll();
        populateSetSelector();
        const setSelector = document.getElementById('setSelector');
        setSelector.value = store.activeSet;
      });
  
      deleteSetBtn.addEventListener('click', () => {
        if (!confirm("Are you sure you want to delete this set?")) return;
        storeAPI.deleteActiveSet();
        refreshAll();
        populateSetSelector();
        document.getElementById('setSelector').value = store.activeSet;
      });
    }
  
    function refreshFormEditor() {
      formList.innerHTML = '';
      const activeSetQs = storeAPI.getActiveQuestions();
      if (activeSetQs.length === 0) {
        formList.innerHTML = '<p>No questions yet in this set.</p>';
      } else {
        activeSetQs.forEach((item, index) => {
          const row = document.createElement('div');
          row.className = 'form-row';
  
          const qInput = document.createElement('input');
          qInput.type = 'text';
          qInput.placeholder = 'Question';
          qInput.value = item.question;
          qInput.addEventListener('change', function() {
            store.sets[store.activeSet][index].question = qInput.value;
          });
  
          const aInput = document.createElement('input');
          aInput.type = 'text';
          aInput.placeholder = 'Answer';
          aInput.value = item.answer;
          aInput.addEventListener('change', function() {
            store.sets[store.activeSet][index].answer = aInput.value;
          });
  
          const delBtn = document.createElement('button');
          delBtn.textContent = 'Delete';
          delBtn.className = 'deleteRow';
          delBtn.addEventListener('click', function() {
            store.sets[store.activeSet].splice(index, 1);
            storeAPI.saveSetsToStorage();
            refreshAll();
          });
  
          row.appendChild(qInput);
          row.appendChild(aInput);
          row.appendChild(delBtn);
          formList.appendChild(row);
        });
      }
    }
  
    function addEmptyRow() {
      // new question has "learned: 0" by default
      store.sets[store.activeSet].push({ question: '', answer: '', learned: 0 });
      refreshFormEditor();
    }
  
    function saveFormData() {
      const rows = document.querySelectorAll('.form-row');
      const updated = [];
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2) {
          const q = inputs[0].value.trim();
          const a = inputs[1].value.trim();
          if (q !== '' && a !== '') {
            updated.push({ question: q, answer: a, learned: 0 }); // ensure learned: 0
          }
        }
      });
      store.sets[store.activeSet] = updated;
      storeAPI.saveSetsToStorage();
      alert('Questions saved successfully!');
      storeAPI.updateAllQuestions();
      testMode.updateTestUI();
      flashcards.refreshFlashcards();
      learnMode.updateLearnUI();
    }
  
    function refreshJsonBox() {
      const activeSetQs = storeAPI.getActiveQuestions();
      jsonText.value = JSON.stringify(activeSetQs, null, 2);
    }
  
    function importJson() {
      try {
        const parsed = JSON.parse(jsonText.value);
        if (!Array.isArray(parsed)) {
          alert('Error: JSON must be an array of {question, answer, learned} objects.');
          return;
        }
        parsed.forEach(item => {
          if (typeof item.learned !== 'number') {
            item.learned = 0;
          }
        });
        store.sets[store.activeSet] = parsed;
        storeAPI.saveSetsToStorage();
        refreshAll();
        alert('Imported JSON successfully!');
      } catch (e) {
        alert('Error parsing JSON. Please check your syntax.');
      }
    }
  
    function refreshAll() {
      refreshFormEditor();
      refreshJsonBox();
      setNameInput.value = store.activeSet;
      storeAPI.updateAllQuestions();
      testMode.updateTestUI();
      flashcards.refreshFlashcards();
      learnMode.updateLearnUI();
    }
  
    function populateSetSelector() {
      if (typeof window.populateSetSelectorInApp === 'function') {
        window.populateSetSelectorInApp();
      }
    }
  
    function initializeAddQuestions() {
      initAddUI();
      refreshAll();
    }
  
    return {
      initializeAddQuestions,
      refreshFormEditor,
      refreshJsonBox
    };
  })();
  