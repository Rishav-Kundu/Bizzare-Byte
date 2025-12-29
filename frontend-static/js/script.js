// ======================
// LocalStorage Initialization
// ======================
if(!localStorage.getItem("events")) localStorage.setItem("events", JSON.stringify([]));
if(!localStorage.getItem("participants")) localStorage.setItem("participants", JSON.stringify({}));
if(!localStorage.getItem("organisers")) localStorage.setItem("organisers", JSON.stringify({}));
if(!localStorage.getItem("eventBudgets")) localStorage.setItem("eventBudgets", JSON.stringify({}));
if(!localStorage.getItem("organiserPassKeys")) localStorage.setItem("organiserPassKeys", JSON.stringify({}));

// ======================
// Admin & Student Login
// ======================
function adminLogin() {
    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;
    if(username==="admin" && password==="admin123"){
        localStorage.setItem("isAdmin","true");
        window.location.href="../admin/admin-dashboard.html";
    } else {
        alert("Invalid Admin credentials!");
    }
}

function studentLogin() {
    const name = document.getElementById("student-name").value;
    const reg = document.getElementById("student-reg").value;
    if(!name || !reg){ alert("Enter name and registration number"); return; }
    localStorage.setItem("studentName", name);
    localStorage.setItem("studentReg", reg);
    localStorage.setItem("isStudent","true");
    window.location.href="../student/student-dashboard.html";
}

function logout(){
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("isStudent");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentReg");
    localStorage.removeItem("organiserVerified");
    window.location.href="../index.html";
}

// ======================
// Admin Add Event
// ======================
function addEventWithDetails(){
    const name=document.getElementById("event-name").value;
    const date=document.getElementById("event-date").value;
    const desc=document.getElementById("event-desc").value;
    const budget=document.getElementById("organiser-budget").value;
    const passKey=document.getElementById("organiser-passkey").value;

    if(!name||!date||!desc){ alert("Fill all required fields!"); return; }

    let events=JSON.parse(localStorage.getItem("events")||"[]");
    if(events.some(e=>e.name===name)){ alert("Event with this name already exists!"); return; }
    events.push({name,date,desc});
    localStorage.setItem("events",JSON.stringify(events));

    if(budget || passKey){
        setOrganiserDetails(name, budget, passKey);
    }

    alert("Event added!");
    document.getElementById("event-name").value="";
    document.getElementById("event-date").value="";
    document.getElementById("event-desc").value="";
    document.getElementById("organiser-budget").value="";
    document.getElementById("organiser-passkey").value="";
    populateEventList();
}

function setOrganiserDetails(eventName, budget, passKey){
    let eventBudgets = JSON.parse(localStorage.getItem("eventBudgets")||"{}");
    if(budget) eventBudgets[eventName]=budget;
    localStorage.setItem("eventBudgets", JSON.stringify(eventBudgets));

    let organiserKeys = JSON.parse(localStorage.getItem("organiserPassKeys")||"{}");
    if(passKey) organiserKeys[eventName]=passKey;
    localStorage.setItem("organiserPassKeys", JSON.stringify(organiserKeys));
}

// ======================
// Populate Event List for Admin Add Event
// ======================
function populateEventList(){
    const listDiv = document.getElementById("event-list");
    if(!listDiv) return;
    let events=JSON.parse(localStorage.getItem("events")||"[]");
    listDiv.innerHTML="";
    if(events.length===0) { 
        listDiv.innerHTML="<p>No events yet.</p>"; 
        return; 
    }
    events.forEach(ev=>{
        const div = document.createElement("div");
        div.classList.add("event-block");
        div.innerHTML=`
            <h4>${ev.name} (${ev.date})</h4>
            <p>${ev.desc}</p>
            <button onclick="clearEvent('${ev.name}')">Clear Event</button>
        `;
        listDiv.appendChild(div);
    });
}

function clearEvent(eventName){
    if(!confirm(`Are you sure you want to delete the event "${eventName}"?`)) return;

    // Remove event from events
    let events = JSON.parse(localStorage.getItem("events")||"[]");
    events = events.filter(e => e.name !== eventName);
    localStorage.setItem("events", JSON.stringify(events));

    // Remove associated participants, organisers, budgets, keys
    let participants = JSON.parse(localStorage.getItem("participants")||"{}");
    delete participants[eventName];
    localStorage.setItem("participants", JSON.stringify(participants));

    let organisers = JSON.parse(localStorage.getItem("organisers")||"{}");
    delete organisers[eventName];
    localStorage.setItem("organisers", JSON.stringify(organisers));

    let budgets = JSON.parse(localStorage.getItem("eventBudgets")||"{}");
    delete budgets[eventName];
    localStorage.setItem("eventBudgets", JSON.stringify(budgets));

    let keys = JSON.parse(localStorage.getItem("organiserPassKeys")||"{}");
    delete keys[eventName];
    localStorage.setItem("organiserPassKeys", JSON.stringify(keys));

    alert(`Event "${eventName}" and its details cleared.`);
    populateEventList();
}

// ======================
// Populate Event Dropdown (Student & Organiser) ======================
function populateEventDropdown(selectId, submitBtnId){
    const select = document.getElementById(selectId);
    const submitBtn = document.getElementById(submitBtnId);
    if(!select) return;
    let events = JSON.parse(localStorage.getItem("events")||"[]");
    select.innerHTML="";
    if(events.length===0){
        const option = document.createElement("option");
        option.text="No events available"; option.value="";
        select.add(option);
        if(submitBtn) submitBtn.disabled=true;
    } else {
        events.forEach(ev=>{
            const option = document.createElement("option");
            option.text=ev.name; option.value=ev.name;
            select.add(option);
        });
        if(submitBtn) submitBtn.disabled=false;
    }
}

// ======================
// Student Participant Form ======================
function submitParticipantForm(){
    const eventName = document.getElementById("event-name").value;
    const dept = document.getElementById("dept").value;
    const section = document.getElementById("section").value;
    const rollNo = document.getElementById("roll-no").value;
    const performance = document.getElementById("performance").value;

    if(!eventName){ alert("Select an event"); return; }
    if(!dept || !section || !rollNo || !performance){ alert("Fill all fields"); return; }

    let participants = JSON.parse(localStorage.getItem("participants")||"{}");
    if(!participants[eventName]) participants[eventName]=[];
    participants[eventName].push({
        name: localStorage.getItem("studentName"),
        regNo: localStorage.getItem("studentReg"),
        dept, section, rollNo, performance
    });
    localStorage.setItem("participants", JSON.stringify(participants));
    alert("Participant details submitted for "+eventName);
    document.getElementById("dept").value="";
    document.getElementById("section").value="";
    document.getElementById("roll-no").value="";
    document.getElementById("performance").value="";
}

// ======================
// Student Organiser Section ======================
function verifyPassKey(){
    const eventName = document.getElementById("org-event-select").value;
    const enteredKey = document.getElementById("pass-key").value;
    let keys = JSON.parse(localStorage.getItem("organiserPassKeys")||"{}");
    if(keys[eventName] === enteredKey){
        localStorage.setItem("organiserVerified", eventName);
        window.location.href="organiser-section.html";
    } else {
        alert("Invalid pass key!");
    }
}

function submitOrganiserForm(){
    const eventName = localStorage.getItem("organiserVerified");
    const notes = document.getElementById("org-notes").value;
    if(!notes){ alert("Enter some notes"); return; }

    let organisers = JSON.parse(localStorage.getItem("organisers")||"{}");
    if(!organisers[eventName]) organisers[eventName]=[];
    organisers[eventName].push({
        name: localStorage.getItem("studentName"),
        regNo: localStorage.getItem("studentReg"),
        notes
    });
    localStorage.setItem("organisers", JSON.stringify(organisers));
    alert("Organiser notes saved for "+eventName);
    localStorage.removeItem("organiserVerified");
    window.location.href="student-dashboard.html";
}

// ======================
// Admin Manage Participants / Organisers ======================
function populateParticipantList(){
    const container = document.getElementById("participant-list");
    if(!container) return;
    const participants = JSON.parse(localStorage.getItem("participants")||"{}");
    container.innerHTML="";
    if(Object.keys(participants).length===0){
        container.innerHTML="<p>No participants yet.</p>";
        return;
    }
    for(let eventName in participants){
        const div = document.createElement("div");
        div.classList.add("list-block");

        let tableHTML = `<h4>${eventName}</h4>
        <table>
        <tr>
            <th>Name</th><th>Reg No.</th><th>Dept</th><th>Section</th><th>Roll No</th><th>Performance</th>
        </tr>`;

        participants[eventName].forEach(p=>{
            tableHTML += `<tr>
                <td>${p.name}</td>
                <td>${p.regNo}</td>
                <td>${p.dept}</td>
                <td>${p.section}</td>
                <td>${p.rollNo}</td>
                <td>${p.performance}</td>
            </tr>`;
        });

        tableHTML += `</table>
            <button onclick="clearParticipantList('${eventName}')">Clear Participants</button>`;

        div.innerHTML = tableHTML;
        container.appendChild(div);
    }
}

function clearParticipantList(eventName){
    if(!confirm(`Clear all participants for "${eventName}"?`)) return;
    let participants = JSON.parse(localStorage.getItem("participants")||"{}");
    delete participants[eventName];
    localStorage.setItem("participants", JSON.stringify(participants));
    alert("Participants cleared for "+eventName);
    populateParticipantList();
}

function populateOrganiserList(){
    const container = document.getElementById("organiser-list");
    if(!container) return;
    const organisers = JSON.parse(localStorage.getItem("organisers")||"{}");
    const budgets = JSON.parse(localStorage.getItem("eventBudgets")||"{}");
    container.innerHTML="";
    if(Object.keys(organisers).length===0){
        container.innerHTML="<p>No organiser notes yet.</p>";
        return;
    }
    for(let eventName in organisers){
        const div = document.createElement("div");
        div.classList.add("list-block");

        let tableHTML = `<h4>${eventName} (Budget: ${budgets[eventName] || "N/A"})</h4>
        <table>
        <tr>
            <th>Name</th><th>Reg No.</th><th>Notes</th>
        </tr>`;

        organisers[eventName].forEach(o=>{
            tableHTML += `<tr>
                <td>${o.name}</td>
                <td>${o.regNo}</td>
                <td>${o.notes}</td>
            </tr>`;
        });

        tableHTML += `</table>
            <button onclick="clearOrganiserList('${eventName}')">Clear Organiser Notes</button>`;

        div.innerHTML = tableHTML;
        container.appendChild(div);
    }
}

function clearOrganiserList(eventName){
    if(!confirm(`Clear all organiser notes for "${eventName}"?`)) return;
    let organisers = JSON.parse(localStorage.getItem("organisers")||"{}");
    delete organisers[eventName];
    localStorage.setItem("organisers", JSON.stringify(organisers));
    alert("Organiser notes cleared for "+eventName);
    populateOrganiserList();
}

// ======================
// Public & Student View Events ======================
function showEvents(containerId){
    const container = document.getElementById(containerId);
    if(!container) return;
    const events = JSON.parse(localStorage.getItem("events")||"[]");
    container.innerHTML="";
    if(events.length===0){ container.innerHTML="<p>No events yet.</p>"; return; }
    events.forEach(ev=>{
        const div = document.createElement("div");
        div.classList.add("event-block");
        div.innerHTML = `<h3>${ev.name} (${ev.date})</h3><p>${ev.desc}</p>`;
        container.appendChild(div);
    });
}
