const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const form = document.getElementById('inputForm');
const inputTitle = document.getElementById('inputTitle');
const inputAuthor = document.getElementById('inputAuthor');
const inputYear = document.getElementById('inputYear');
const uncompleteList = document.querySelector('.uncomplete-list');
const completedList = document.querySelector('.completed-list');

function generateId([ ...title ]) {
  const milliSeconds = new Date().getMilliseconds();
  const firstChar = title[0].toUpperCase();
  return firstChar  + '' + milliSeconds;
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) return book;
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) return index;
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Sorry, your browser doesn\'t support web local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsedData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedData);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBookElement({ id, title, year, author, isComplete }) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = title;
  
  const textYear = document.createElement('p');
  textYear.innerText = `Released in ${year}`;
  
  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Written by ${author}`;

  
  const bookElement = document.createElement('article');
  bookElement.append(textTitle, textYear, textAuthor);
  bookElement.setAttribute('data-id', id);
  
  if (isComplete) {
    const btnUndo = document.createElement('button');
    btnUndo.classList.add('btn', 'btn-undo');
    btnUndo.innerText = 'Move to reading list';
    btnUndo.addEventListener('click', () => undoBookFromCompleted(id));
    
    bookElement.append(btnUndo);
  } else {
    const btnDone = document.createElement('button');
    btnDone.classList.add('btn', 'btn-done');
    btnDone.innerText = 'Finish reading';
    btnDone.addEventListener('click', () => addBookToCompleted(id));
    
    bookElement.append(btnDone);
  }

  const btnDelete = document.createElement('button');
  btnDelete.classList.add('btn', 'btn-delete');
  btnDelete.innerText = 'Delete book';
  btnDelete.addEventListener('click', () => deleteBook(id));

  bookElement.append(btnDelete);

  return bookElement;
}

function addBook() {
  const newBookData = {
    id: generateId(inputTitle.value),
    title: inputTitle.value,
    author: inputAuthor.value,
    year: inputYear.value,
    isComplete: false,
  }
  books.push(newBookData);

  alert('Succes add new book!');

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isComplete = true;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  
  if (bookTarget === null) return;

  bookTarget.isComplete = false;
  
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  const bookTarget = findBook(bookId);
  
  if (bookTarget === -1) return;
  
  const confirmDelete = confirm(`Are you sure want to delete ${bookTarget.title} book ?`);

  if (confirmDelete) {
    books.splice(bookIndex, 1);

    alert('Success delete the book!');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

document.addEventListener(SAVED_EVENT, () => {
  console.table(JSON.parse(localStorage.getItem(STORAGE_KEY)));
});

document.addEventListener('DOMContentLoaded', () => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    addBook();
  });

  if (isStorageExist()) loadDataFromStorage();
});

document.addEventListener(RENDER_EVENT, () => {
  form.reset();
  inputYear.blur();
  uncompleteList.innerHTML = '';
  completedList.innerHTML = '';

  for (const book of books) {
    const bookList = createBookElement(book);
    if (!book.isComplete) {
      uncompleteList.append(bookList);
    } else {
      completedList.append(bookList);
    }
  }
});
