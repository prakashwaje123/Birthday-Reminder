window.addEventListener("load", () => {

  Notification.requestPermission()
    .then(permission => {
      console.log("Notification Permission:", permission);
    });

});

const API_URL = "https://script.google.com/macros/s/AKfycbz5qg75ds4qCKWEm4C_EFTYOZxCrohlA4sIhlyjx_KpqLM0YN2fcHqzR_EMIDpyYmLi/exec";

const form = document.getElementById("reminderForm");
const reminderList = document.getElementById("reminderList");



form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    date: document.getElementById("date").value,
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

  checkTodayReminders();

});



async function loadReminders() {

  const res = await fetch(API_URL);

  const data = await res.json();

  reminderList.innerHTML = "";

  data.forEach(person => {

    let icon = "🎂";

    if(person.type === "Anniversary"){
      icon = "💍";
    }

    if(person.type === "Special Day"){
      icon = "⭐";
    }

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <h3>${icon} ${person.name}</h3>
      <p><strong>Type:</strong> ${person.type}</p>
      <p><strong>Date:</strong> ${person.date}</p>
      <p><strong>Phone:</strong> ${person.phone}</p>
      <p>${person.notes}</p>
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

    const parts = person.date.trim().split("-");

    const eventMonth = parseInt(parts[1]);
    const eventDay = parseInt(parts[2]);

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