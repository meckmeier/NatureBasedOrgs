// === Replace with your published CSV links ===
//https://script.google.com/macros/s/AKfycbwPyF0IRD5mmciyXzvMYgVWqPma02dzrad6nfvEWRppxIuMHsq4AryX32BzXcqtNp1XJQ/exec

const URLS = {
  Organization: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=0&single=true&output=csv",
  TrainingEvent: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=828882535&single=true&output=csv",
  Opportunity: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=1000267791&single=true&output=csv",
  SelfPacedTraining: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=1796065808&single=true&output=csv"
};

//replaces the papaparse code to use the constructed json instead.
async function loadData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbwecwSSEbzP2lUZp9F_bnwZI7gymVJyXs1kvuUhj6zOy_m6hZssVRH6dr_36FJqECEL0w/exec");
  const orgs = await response.json();
  console.log(orgs);
  renderCards(orgs);
}

//
// --- Load CSV via PapaParse ---
//function fetchCSV(url) {
  //return new Promise((resolve, reject) => {
    //Papa.parse(url, {
      //download: true,
      //header: true,
      //complete: results => resolve(results.data),
      //error: err => reject(err)
    //});
  //});
//}

//async function loadData() {
//  try {
//    // Fetch all tabs in parallel
//    const [orgs, trainings, opps, selfpaced] = await Promise.all([
//      fetchCSV(URLS.Organization),
//      fetchCSV(URLS.TrainingEvent),
//      fetchCSV(URLS.Opportunity),
//      fetchCSV(URLS.SelfPacedTraining)
//    ]);

    // Join children onto orgs
//    orgs.forEach(org => {
//      const orgName = org.Organization?.trim();
//      org.trainings = trainings.filter(t => t.Org?.trim() === orgName);
//      org.opportunities = opps.filter(o => o.Org?.trim() === orgName);
//     org.selfpaced = selfpaced.filter(s => s.Org?.trim() === orgName);
//    });

//    console.log("Organizations with children:", orgs);
//    renderCards(orgs);
//  } catch (err) {
//    console.error("Error loading data:", err);
//  }
//}

// --- Render org cards with collapsibles ---
function renderCards(orgs) {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  orgs.forEach(org => {
    const card = document.createElement("div");
    card.className = "card";

    let html = `<div class="card-col"><div class="col1"><h2>${org.Organization || "Unknown Org"}</h2>
                ${org.OrgURL ? `<p><a href="${org.OrgURL}" target="_blank">Website</a></p>` : ""}
                <p class="location">${org.Region || ""} |  ${org.County || "Statewide"} | ${org.City || ""} </p>
                </div><div class="col2"><p>${org.About || ""}</p>`

// Helper function to create collapsible sections
    function addCollapsible(title, records, formatter) {
      if (!records || records.length === 0) return;

      html += `
        <button class="collapsible">${title}</button>
        <ul class="content">${records.map(formatter).join("<br>")}</ul>
      `;
    }

    addCollapsible("Volunteer", org.opportunities, o =>
      `<li class="opp">${o.DateStart ?  o.DateStart  : ""} ${o.DateEnd ? " -" + o.DateEnd  : ""}
         ${o.Title || "Unnamed Opportunity"} 
         <p>${o.Description || ""}</li>
        `
    );

    addCollapsible("Training", org.trainings, t =>
      `<li class="trn">${t.Title || "Training"}  ${t.Date ? " (" + t.Date + ")" : ""}
      </li>`
    );

    addCollapsible("Self-Paced", org.selfpaced, s =>
      `<li class="selfp">${s.Title || "Course"} ${s.Link ? ` - <a href="${s.Link}" target="_blank">Link</a>` : ""}
      </li>`
    );

/* html += `</div>`
</div></div></div>
                <div class="span">*/
   

    card.innerHTML = html;
    container.appendChild(card);
  });

  enableCollapsibles();
}

// --- Set up toggle behavior for collapsibles ---
function enableCollapsibles() {
  const coll = document.getElementsByClassName("collapsible");
  for (let i = 0; i < coll.length; i++) {
    const content = coll[i].nextElementSibling;
    coll[i].classList.remove("active");  // ensure collapsed
    content.style.display = "none";      // ensure hidden

    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      content.style.display = content.style.display === "block" ? "none" : "block";
    });
  }
}

// --- Start loading data ---
loadData();

const toggleBtn = document.getElementById('filter-toggle');
const sidebar = document.getElementById('sidebar');


toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});
