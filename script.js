'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-04-20T17:01:17.194Z',
    '2021-04-25T23:36:17.929Z',
    '2021-04-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const loginDetails = document.querySelector('.login--details');

const btnLogin = document.querySelector('.login__btn');
const btnLogout = document.querySelector('.logout__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const loginForm = document.querySelector('.login');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
// =====================FORMATING DATE=================
// This function will take a date and locale as an arguments to return it in formated way. Function declared outside to be re-used multiple times
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed === 0) return 'Today';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();

    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};
// =====================FORMATING CURRENCY=================
// This function will take a value, locale and currency as an arguments to return them in formated way. Function declared outside to be re-used multiple times
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
// =====================DISPLAYING MOVEMENTS=================
const displayMovements = function (acc, sort = false) {
  //The SORT parameter will determine if the movements will be display in oryginall order (sort = false (as default)) or if movements will be display in ascending order (sort = true)

  //".innerHTML" will return the WHOLE HTML content of given element
  // In this case is assining it to an empty string to clear the element before editing
  containerMovements.innerHTML = '';

  //if sort = true this variable will represent sortet copy of 'movements' array. Otherwise it will be equal to 'movements'
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // creting template literal to be pasted into desired HTML section. In this example the string was copied from the already existing elements.
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //generating new date
    const date = new Date(acc.movementsDates[i]);
    //calling function to format date
    const displayDate = formatMovementDate(date, acc.locale);
    //calling function to format currency
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>`;
    //Pasting above element into desired HTML section using "/insertAdjacentHTML()". First parameter 'afterbegin' is one of the pre-set values to choose. The second one is the element to paste. It can be either variable or string.
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// ==================== CREATING USERNAMES=================
//This function will take an array as an argument. Then .forEach will loop through each element of the array and add .userName key to each 'acc' object with value of transfermed .owner key value from the same object.
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

//================== UPDATE UI ===========
//This function is refractored collective of other function to be re-used multiple times
const updateUI = function (acc) {
  //Display movement
  displayMovements(acc);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  caclDisplaySummary(acc);
};

// =================CALCULATING BALANCE===================
//This function will accumulate all movements in the account, reduce them into single value add the `balance` property to the object and display result in the 'Current balance'.

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// ============= MONEY IN/OUT AND SUMMARY=================
//This method will calculate and display the total ammount of money in and money out. Also it will display the intrest

const caclDisplaySummary = function (acc) {
  const income = acc?.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

  const out = acc?.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//================= CURRENT ACC STORAGE=================
// This variable will be re-used in multiple functions. That's why it is defined in the global scope.
let currentAccount;
let timer;

// //FAKE ALWAYS LOGGED IN <----------DELETE LATER!!!!!!!!!!!
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Function called on log out/time out
const logOut = function () {
  clearInterval(timer);
  labelWelcome.textContent = `Log in to get started`;
  containerApp.style.opacity = 0;
  loginDetails.classList.remove('hidden');
  //Display Login form
  loginForm.classList.remove('hidden');
  //Hide Logout btn
  btnLogout.classList.add('hidden');
};

//================SETTING TIMER FOR AUTO LOG-OUT====================
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out
    if (time === 0) {
      logOut();
    }
    // Decrease 1sec
    time--;
  };
  // Set time to 5 minutes
  let time = 120;
  // Call the timer every secong

  tick(); //this function is called before the timer to prevent 1 sec lag.
  const timer = setInterval(tick, 1000);
  return timer;
};

//================LOGING IN====================
//This function will execute after the 'arrow' button is clicked in UI.
//Event handlers
//Passing an argument to the function and assigning the '.preventDefault' method to it will prevet the page from re-loading after submiting the form. This method will prevent any event from it's default behavior and allow us to handle it manually
btnLogin.addEventListener('click', function (event) {
  //prevent the form from submitting
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value.toLowerCase()
  );

  // Checking if current account exist (using optional chaining). If true: checking if provided PIN is in line with the pin inside the object
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and Welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100; //accesing style sheet and changing opaticy from 0 to 100.
    //Hide 'Available acc' box
    loginDetails.classList.add('hidden');
    //Hide login form
    loginForm.classList.add('hidden');
    //Display Logout btn
    btnLogout.classList.remove('hidden');

    const now = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    //*
    // const locale = navigator.language; // Will return 'en-GB' in my case.

    //3.
    // labelDate.textContent = new Intl.DateTimeFormat('en-GB', options).format(
    //   now
    // );
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //Clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur(); // will take the focus off the input field

    //Checking if timer is already running. (in case of logging between accounts). If TRUE- stop it.
    if (timer) clearInterval(timer);
    //Starting the timer
    timer = startLogOutTimer();
    //Update UI
    updateUI(currentAccount);
  }
});

// =============Logging Out ==================
btnLogout.addEventListener('click', function (e) {
  e.preventDefault;
  logOut();
});

// ============= TRANSFERING MONEY================
//This function fill transfer money to a different acc after clicking the button.
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // Taking data from the input
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );
  // checking if the amount is positive and there is enough money to transfer
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.userName !== currentAccount.userName
  ) {
    //updating movements of acc owner and receiver
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //Upadting UI
    updateUI(currentAccount);
  }
  //Clearing input fiel
  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  //Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

//============= REQUESTING A LOAN ================
// Condition to get a loan is that there has to be at least 1 deposit which has to be at least 10% of requested loan value
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  //retieving loan amount from the input
  const amount = Math.floor(inputLoanAmount.value);

  //checking if conditions (from discription) are met.
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      //transfering money
      currentAccount.movements.push(amount);

      //Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());

      //Updating UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';

  //Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});
//============= DELETING ACCOUNT ================
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  //Checking if credentials are in line with acc information
  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    // Looking for the index of the curren account inside of the 'accounts' array.
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    // removing account from the accounts array
    accounts.splice(index, 1);
    // logging out. (Hiding UI). Accesing stylesheet to change opacity of the cointainer
    containerApp.style.opacity = 0;
    loginDetails.classList.remove('hidden');
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
//============= SORTING MOVEMENTS ================
// This function will sort all the MOVEMENTS in the ascending order when 'sort' button is clicked, and return them back to normal on another click

//This 'state' variable will track if the movements are currently sorted, or not.
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
