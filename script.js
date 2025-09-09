let selectedMood = null;

const moodButtons = document.querySelectorAll('.mood-btn');
const entryText = document.getElementById('entryText');
const saveButton = document.getElementById('saveEntry');
const quoteDisplay = document.getElementById('quote');

moodButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    moodButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to clicked button
    button.classList.add('active');

    // Store selected mood
    selectedMood = button.dataset.mood;
  });
});

saveButton.addEventListener('click', () => {
  const text = entryText.value.trim();
  if (!selectedMood) {
    alert('Please select a mood.');
    return;
  }
  if (!text) {
    alert('Please write something about your day.');
    return;
  }

//   const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const timestamp = new Date().toISOString(); // e.g. "2025-06-21T15:45:10.123Z"
  const today = timestamp.split('T')[0];
//   const currTime = timestamp.split('T')[1].split(':')[0]+':'+timestamp.split('T')[1].split(':')[1];
//   const now = new Date();
  const timestamp2 = new Date().toLocaleString(); // "6/21/2025, 1:33:00 PM"  
//   const today2 = timestamp2.split(', ')[0];
  const time = timestamp2.split(', ')[1];

  const entry = {
    mood: selectedMood,
    text: text,
    date: today,
    time: time,
  };

  // Save to localStorage
  localStorage.setItem(`journal-${timestamp2}`, JSON.stringify(entry));

  // Confirmation message (optional)
  alert('Entry saved!');

  // Fetch and display a quote
  fetchQuote(timestamp2);
//   loadPastEntries();
});

function fetchQuote(timestamp) {
  fetch('https://api.adviceslip.com/advice')
    .then(res => res.json())
    .then(data => {
      const quote = data.slip.advice;
      quoteDisplay.textContent = quote;

      localStorage.setItem(`quote-${timestamp}`, quote);
      loadPastEntries();
    })
    .catch(err => {
      quoteDisplay.textContent = "Could not fetch quote. Try again later.";
      console.error('Fetch failed:', err);
    });
}
  
function loadPastEntries() {
  const pastEntriesDiv = document.getElementById('pastEntries');
  pastEntriesDiv.innerHTML = ''; // clear existing

  const keys = Object.keys(localStorage).filter(key => key.startsWith('journal-'));

  // Sort by date (newest first)
  keys.sort((a, b) => b.localeCompare(a));

  keys.forEach(key => {
    const entry = JSON.parse(localStorage.getItem(key));
    const shortText = entry.text.length > 100 ? entry.text.substring(0, 100) + '...' : entry.text;

    // Get the matching quote using the timestamp portion of the key
    const timestamp = key.replace('journal-', '');
    const quote = localStorage.getItem(`quote-${timestamp}`) || "No quote saved.";

    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <strong>${entry.date}</strong> <strong>${entry.time}</strong> — Mood: ${getMoodEmoji(entry.mood)}
      <p class="entry-text">${shortText}</p>
      <blockquote>${quote}</blockquote>
      <div class="entry-actions">
        <button class="entry-btn edit-btn">✏️ Edit</button>
        <button class="entry-btn delete-btn">🗑️ Delete</button>
      </div>
    `;

    // Edit functionality
    card.querySelector('.edit-btn').addEventListener('click', () => {
      editEntry(key, entry, card);
    });

    // Delete functionality
    card.querySelector('.delete-btn').addEventListener('click', () => {
      deleteEntry(key);
    });

    pastEntriesDiv.appendChild(card);
  });
}
  
// Helper to show mood emoji
function getMoodEmoji(mood) {
  switch (mood) {
    case 'happy': return '😊';
    case 'neutral': return '😐';
    case 'sad': return '😔';
    case 'angry': return '😠';
    default: return '❓';
  }
}

function editEntry(key, entry, card) {
  // Replace content with editable fields
  card.innerHTML = `
    <strong>${entry.date}</strong> <strong>${entry.time}</strong>
    <textarea class="edit-text">${entry.text}</textarea>
    <select class="edit-mood">
      <option value="happy" ${entry.mood === "happy" ? "selected" : ""}>😊 Happy</option>
      <option value="sad" ${entry.mood === "sad" ? "selected" : ""}>😢 Sad</option>
      <option value="angry" ${entry.mood === "angry" ? "selected" : ""}>😠 Angry</option>
      <option value="neutral" ${entry.mood === "neutral" ? "selected" : ""}>😐 Neutral</option>
    </select>
    <button class="save-btn">Save</button>
    <button class="cancel-btn">Cancel</button>
  `;

  // Save button
  card.querySelector('.save-btn').addEventListener('click', () => {
    const newText = card.querySelector('.edit-text').value;
    const newMood = card.querySelector('.edit-mood').value;

    // Update localStorage
    entry.text = newText;
    entry.mood = newMood;
    localStorage.setItem(key, JSON.stringify(entry));

    // Reload past entries
    loadPastEntries();
  });

  // Cancel button (reload entries without saving)
  card.querySelector('.cancel-btn').addEventListener('click', () => {
    loadPastEntries();
  });
}

function deleteEntry(key) {
  if (confirm("Are you sure you want to delete this entry?")) {
    localStorage.removeItem(key);

    // Also delete matching quote if it exists
    const timestamp = key.replace('journal-', '');
    localStorage.removeItem(`quote-${timestamp}`);

    // Reload entries
    loadPastEntries();
  }
}

// Run on load  
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(`journal-${today}`);
  const savedQuote = localStorage.getItem(`quote-${today}`);

  if (saved) {
    const { mood, text } = JSON.parse(saved);
    selectedMood = mood;
    entryText.value = text;

    // Re-highlight selected mood button
    moodButtons.forEach(btn => {
      if (btn.dataset.mood === mood) {
        btn.classList.add('active');
      }
    });
  }

  if (savedQuote) {
    quoteDisplay.textContent = savedQuote;
  }
  loadPastEntries();
});