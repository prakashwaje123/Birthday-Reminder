window.addEventListener("load", () => {

  Notification.requestPermission()
    .then(permission => {
      console.log("Notification Permission:", permission);
    });

});

const API_URL = "https://script.google.com/macros/s/AKfycbzgeAMEPFvGw4Fucrs384lI6wm9Mg0tkaajsh3IYFKMDzw8C_9IWkVjpj3LB9C8GhFm/exec";

const form = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");



form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputDate = document.getElementById("date").value;
  const inputName = document.getElementById("name").value;

  // 1. Fetch current data to check for duplicates
  const res = await fetch(API_URL);
  const existingData = await res.json();

  // 2. Check if an entry with the same name AND date already exists
  const isDuplicate = existingData.some(entry => 
    entry.date === inputDate && entry.name.toLowerCase() === inputName.toLowerCase()
  );

  if (isDuplicate) {
    alert("This event for " + inputName + " is already registered!");
    return; // Stop the submission
  }

  const data = {
    name: inputName,
    date: inputDate,
    type: document.getElementById("type").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value
  };

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  form.reset();
  loadReminders();
});


async function loadReminders() {

  const res = await fetch(API_URL);

  const data = await res.json();

  reminderList.innerHTML = "";

  const today = new Date();

  const currentYear = today.getFullYear();

  let upcoming = [];



  data.forEach(person => {

const eventDate = new Date(person.date);

const month = eventDate.getMonth() + 1;

const day = eventDate.getDate();

    let nextDate = new Date(
  currentYear,
  eventDate.getMonth(),
  eventDate.getDate()
);

if(nextDate < today){

  nextDate = new Date(
    currentYear + 1,
    eventDate.getMonth(),
    eventDate.getDate()
  );

}
    const diffTime = nextDate - today;

    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    upcoming.push({
      ...person,
      daysLeft: diffDays
    });

  });



  upcoming.sort((a, b) => a.daysLeft - b.daysLeft);



  upcoming.forEach(person => {

  const eventDate = new Date(person.date);

  const month = eventDate.getMonth() + 1;

  const day = eventDate.getDate();

  let icon = "🎂";

    if(person.type === "Anniversary"){
      icon = "💍";
    }

    if(person.type === "Special Day"){
      icon = "⭐";
    }

    let countdown = "";

    if(person.daysLeft === 0){
      countdown = "🎉 Today";
    }
    else if(person.daysLeft === 1){
      countdown = "Tomorrow";
    }
    else{
      countdown = `In ${person.daysLeft} days`;
    }

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <h3>${icon} ${person.name}</h3>
      <p><strong>${person.type}</strong></p>
      <p>${countdown}</p>
      <p>
${String(day).padStart(2,'0')}-
${String(month).padStart(2,'0')}-
${eventDate.getFullYear()}
</p>
    `;

    reminderList.appendChild(card);

  });

}


async function checkTodayReminders() {

  const res = await fetch(API_URL);

  const data = await res.json();

  const today = new Date();

  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  data.forEach(person => {

    const eventDate = new Date(person.date);

const eventMonth = eventDate.getMonth() + 1;

const eventDay = eventDate.getDate();

    if (
      todayMonth === eventMonth &&
      todayDate === eventDay
    ) {

      let message = "";

      if(person.type === "Birthday"){
        message = `🎂 Today is ${person.name}'s Birthday!`;
      }

      if(person.type === "Anniversary"){
        message = `💍 Today is ${person.name}'s Anniversary!`;
      }

      if(person.type === "Special Day"){
        message = `⭐ Today is ${person.name}'s Special Day!`;
      }

      if (Notification.permission === "granted") {

     alert(message);

new Notification("Celebration Reminder", {
  body: message
});

      }

    }

  });

}


loadReminders();

checkTodayReminders();
if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => {
      console.log("Service Worker Registered");
    });

}
