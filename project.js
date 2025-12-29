let flashcards = [];
let currentIndex = 0;
let isRandomMode = false;
let currentUser = null;

// Regex for client-side validation (restored for project requirements)
const usernameRegex = /^[a-zA-Z0-9]{3,}$/; // Alphanumeric, min 3 chars
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/; // Min 8 chars, 1 letter, 1 number, 1 special

// Load flashcards via AJAX (JSON)
function loadFlashcards() {
  if (!currentUser) return;
  $.ajax({
    url: 'server.php',
    method: 'POST',
    data: { action: 'get_flashcards', username: currentUser },
    dataType: 'json',
    success: function(data) {
      flashcards = data;
      updateCardCount();
    },
    error: function() {
      alert('Error loading flashcards.');
    }
  });
}

// Save flashcard via AJAX (JSON)
function saveFlashcard(question, answer) {
  $.ajax({
    url: 'server.php',
    method: 'POST',
    data: { action: 'add_flashcard', username: currentUser, question, answer },
    dataType: 'json',
    success: function() {
      loadFlashcards(); // Reload after save
    },
    error: function() {
      alert('Error saving flashcard.');
    }
  });
}

// Delete flashcard via AJAX
function deleteFlashcard(index) {
  const card = flashcards[index];
  $.ajax({
    url: 'server.php',
    method: 'POST',
    data: { action: 'delete_flashcard', username: currentUser, question: card.question },
    dataType: 'json',
    success: function() {
      loadFlashcards();
    },
    error: function() {
      alert('Error deleting flashcard.');
    }
  });
}

// Example XML-based AJAX (fetch user info)
function fetchUserInfoXML() {
  $.ajax({
    url: 'server.php',
    method: 'POST',
    data: { action: 'get_user_xml', username: currentUser },
    dataType: 'xml',
    success: function(xml) {
      // Parse XML
      const user = $(xml).find('user');
      console.log('User info (XML):', user.find('username').text());
      // Could display in UI if needed
    },
    error: function() {
      alert('Error fetching XML data.');
    }
  });
}

// Update card count
function updateCardCount() {
  $('#cardCount').text(`Total flashcards: ${flashcards.length}`);
}

// Show current flashcard (using jQuery)
function showCard() {
  $('#flashcardDisplay').empty();
  if (flashcards.length === 0) {
    $('#flashcardDisplay').append('<p>No flashcards yet! Add some on the home page.</p>');
    $('#counter').text('Card 0 of 0');
    return;
  }

  const card = flashcards[currentIndex];
  const flashcardElem = $('<div class="flashcard" id="flashcard"></div>');
  const front = $('<div class="front"></div>').text(card.question);
  const back = $('<div class="back"></div>').text(card.answer);
  flashcardElem.append(front).append(back);
  $('#flashcardDisplay').append(flashcardElem);

  flashcardElem.on('click', function() {
    $(this).toggleClass('flipped');
  });

  $('#counter').text(`Card ${currentIndex + 1} of ${flashcards.length}`);
}

// Go to review mode
function goToReview(random = false) {
  isRandomMode = random;
  if (isRandomMode) shuffleArray(flashcards);
  currentIndex = 0;
  $('#home').addClass('hidden');
  $('#review').removeClass('hidden');
  showCard();
}

// Shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Wrap all event listeners in document ready for unobtrusive binding
$(document).ready(function() {
  console.log('Document ready - event listeners bound!'); // Debug log to confirm ready fires

  // Handle login with validation and AJAX
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();

    // Client-side validation (comment out if not wanted)
    if (!usernameRegex.test(username)) {
      $('#loginError').text('Username must be alphanumeric and at least 3 characters.').removeClass('hidden');
      return;
    }
    if (!passwordRegex.test(password)) {
      $('#loginError').text('Password must be at least 8 characters with 1 letter, 1 number, and 1 special character.').removeClass('hidden');
      return;
    }

    $.ajax({
      url: 'server.php',
      method: 'POST',
      data: { action: 'login', username, password },
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          currentUser = username;
          $('#login').addClass('hidden');
          $('#home').removeClass('hidden');
          $('#logoutBtn').removeClass('hidden');
          loadFlashcards();
          fetchUserInfoXML(); // XML example
          $('#loginError').addClass('hidden');
        } else {
          $('#loginError').text(data.message).removeClass('hidden');
        }
      },
      error: function() {
        $('#loginError').text('Server error.').removeClass('hidden');
      }
    });
  });

  // Handle registration with validation and AJAX
  $('#registerBtn').on('click', function() {
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();

    // Client-side validation (comment out if not wanted)
    if (!usernameRegex.test(username)) {
      $('#loginError').text('Username must be alphanumeric and at least 3 characters.').removeClass('hidden');
      return;
    }
    if (!passwordRegex.test(password)) {
      $('#loginError').text('Password must be at least 8 characters with 1 letter, 1 number, and 1 special character.').removeClass('hidden');
      return;
    }
    // api call
    $.ajax({
      url: 'server.php',
      method: 'POST',
      data: { action: 'register', username, password },
      dataType: 'json',
      success: function(data) {
        $('#loginError').text(data.message).removeClass('hidden');
      },
      error: function() {
        $('#loginError').text('Server error.').removeClass('hidden');
      }
    });
  });

  // Handle logout
  $('#logoutBtn').on('click', function() {
    currentUser = null;
    flashcards = [];
    $('#home').addClass('hidden');
    $('#review').addClass('hidden');
    $('#login').removeClass('hidden');
    $('#logoutBtn').addClass('hidden');
    $('#username').val('');
    $('#password').val('');
  });

  // Toggle dark mode
  $('#darkModeToggle').on('click', function() {
    $('body').toggleClass('dark-mode');
  });

  // Add flashcard with client-side validation
  $('#addBtn').on('click', function() {
    const q = $('#question').val().trim();
    const a = $('#answer').val().trim();
    if (q && a) {
      saveFlashcard(q, a);
      $('#question').val('');
      $('#answer').val('');
    } else {
      alert('Please enter both question and answer.');
    }
  });

  // Other event listeners
  $('#showAllBtn').on('click', () => goToReview(false));
  $('#randomBtn').on('click', () => goToReview(true));
  $('#backBtn').on('click', () => {
    $('#review').addClass('hidden');
    $('#home').removeClass('hidden');
  });
  $('#nextBtn').on('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex + 1) % flashcards.length;
    showCard();
  });
  $('#prevBtn').on('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    showCard();
  });
  $('#flipBtn').on('click', () => {
    $('#flashcard').toggleClass('flipped');
  });
  $('#deleteBtn').on('click', () => {
    if (flashcards.length === 0) return;
    if (confirm('Delete this flashcard?')) {
      deleteFlashcard(currentIndex);
      if (currentIndex >= flashcards.length && currentIndex > 0) currentIndex--;
      showCard();
    }
  });

  // Initialize
  $('#login').removeClass('hidden');

  // Optional: Vanilla JS test (uncomment if needed for debugging)
  // document.addEventListener('DOMContentLoaded', function() {
  //   var btn = document.getElementById('registerBtn');
  //   if (btn) {
  //     btn.addEventListener('click', function() {
  //       console.log('Vanilla JS click test successful!');
  //     });
  //   } else {
  //     console.error('Register button not found!');
  //   }
  // });
});