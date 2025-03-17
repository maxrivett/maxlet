window.flashcards = (function() {
    let flashcard;     // the .card div
    let cardFront;     // front text
    let cardBack;      // back text
    let prevBtn, nextBtn, shuffleBtn;
  
    let flashcardIndex = 0;
    const transitionDuration = 600; // match CSS .card transition: transform 0.6s
  
    function initFlashcardsUI() {
      flashcard = document.getElementById('flashcard');
      cardFront = document.getElementById('cardFront');
      cardBack = document.getElementById('cardBack');
      prevBtn = document.getElementById('prevBtn');
      nextBtn = document.getElementById('nextBtn');
      shuffleBtn = document.getElementById('shuffleBtn');
  
      flashcard.addEventListener('click', function() {
        if (store.allQuestions.length > 0) {
          flashcard.classList.toggle('flip');
        }
      });
  
      nextBtn.addEventListener('click', () => {
        if (!store.allQuestions.length) return;
        let newIndex = (flashcardIndex + 1) % store.allQuestions.length;
        navigateFlashcard(newIndex);
      });
      prevBtn.addEventListener('click', () => {
        if (!store.allQuestions.length) return;
        let newIndex = (flashcardIndex - 1 + store.allQuestions.length) % store.allQuestions.length;
        navigateFlashcard(newIndex);
      });
      shuffleBtn.addEventListener('click', () => {
        storeAPI.updateAllQuestions();
        flashcardIndex = 0;
        showFlashcard(flashcardIndex);
      });
    }
  
    function showFlashcard(index) {
      if (!store.allQuestions.length) {
        flashcard.classList.remove('flip');
        cardFront.textContent = "No questions available. Add or switch sets in 'Add Questions'.";
        cardBack.textContent = "";
        return;
      }
      flashcard.classList.remove('flip');
      cardFront.textContent = store.allQuestions[index].question;
      cardBack.textContent = store.allQuestions[index].answer;
    }
  
    // If the card is flipped, unflip first, then wait 600ms to show new content
    function navigateFlashcard(newIndex) {
      if (flashcard.classList.contains('flip')) {
        flashcard.classList.remove('flip');
        setTimeout(() => {
          flashcardIndex = newIndex;
          showFlashcard(flashcardIndex);
        }, transitionDuration);
      } else {
        flashcardIndex = newIndex;
        showFlashcard(flashcardIndex);
      }
    }
  
    function enableButtons() {
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      shuffleBtn.disabled = false;
    }
    function disableButtons() {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      shuffleBtn.disabled = true;
    }
  
    function refreshFlashcards() {
      if (store.allQuestions.length) {
        enableButtons();
        flashcardIndex = 0;
        showFlashcard(flashcardIndex);
      } else {
        disableButtons();
        showFlashcard(0);
      }
    }
  
    function initializeFlashcards() {
      initFlashcardsUI();
      refreshFlashcards();
    }
  
    return {
      initializeFlashcards,
      refreshFlashcards
    };
  })();
  