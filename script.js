// === Replace with your published CSV links ===
//https://script.google.com/macros/s/AKfycbwPyF0IRD5mmciyXzvMYgVWqPma02dzrad6nfvEWRppxIuMHsq4AryX32BzXcqtNp1XJQ/exec

const URLS = {
  Organization: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=0&single=true&output=csv",
  TrainingEvent: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=828882535&single=true&output=csv",
  Opportunity: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=1000267791&single=true&output=csv",
  SelfPacedTraining: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8IhuKkictR4g3jzM1PS_37qBkDcTwVlOhT4T9c0dDV9cV1VFpLhX076YLinxvzwBOmj-Y8AlbtL7y/pub?gid=1796065808&single=true&output=csv"
};

// Grab DOM elements
const regionFilter = document.getElementById("regionFilter");
const countyFilter = document.getElementById("countyFilter");
const aboutFilter = document.getElementById("aboutFilter");
const orgFilter = document.getElementById("orgFilter");
const chkOpps = document.getElementById("chkOpps");
const chkTraining = document.getElementById("chkTraining");
const chkSelfPaced = document.getElementById("chkSelfPaced");
const toggleBtn = document.getElementById('filter-toggle');
const sidebar = document.getElementById('sidebar');



let orgs=[];

//replaces the papaparse code to use the constructed json instead.
async function loadData() {
  const response = await fetch("https://script.google.com/macros/s/AKfycbwecwSSEbzP2lUZp9F_bnwZI7gymVJyXs1kvuUhj6zOy_m6hZssVRH6dr_36FJqECEL0w/exec");
  orgs = await response.json();
  console.log(orgs);
  populateFilters(orgs);
  renderCards(orgs);
}


//*populate the filter dropdowns with unique values from the orgs
function populateFilters(data) {
  const regions = [...new Set(data.map(org => org.Region))];
  const counties = [...new Set(data.map(org => org.County))];
  
  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });

  counties.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    countyFilter.appendChild(opt);
  });
}

function applyFilters() {
  const regionPicked = regionFilter.value;
  const countyPicked = countyFilter.value;
  const aboutText = aboutFilter.value.trim().toLowerCase();
  const orgText = orgFilter.value.trim().toLowerCase();
  const requireOpps = chkOpps.checked;
  const requireTraining = chkTraining.checked;
  const requireSelfPaced = chkSelfPaced.checked;

  const filtered = orgs.filter(org => {
    // Region
    if (regionPicked !== "all" && org.Region !== regionPicked) return false;

    // County
    if (countyPicked !== "all" && org.County !== countyPicked) return false;

    // About contains text
    if (aboutText && !org.About.toLowerCase().includes(aboutText)) return false;

    // Organization contains text
    if (orgText && !org.Organization.toLowerCase().includes(orgText)) return false;

    // Subarray checks (only if checkbox is checked)
    if (requireOpps && (!org.opportunities || org.opportunities.length === 0)) return false;
    if (requireTraining && (!org.trainings || org.trainings.length === 0)) return false;
    if (requireSelfPaced && (!org.selfpaced || org.selfpaced.length === 0)) return false;

    return true; // Keep this org
  });

  renderCards(filtered);
}

// Event listeners
regionFilter.addEventListener("change", applyFilters);
countyFilter.addEventListener("change", applyFilters);
aboutFilter.addEventListener("input", applyFilters);
orgFilter.addEventListener("input", applyFilters);
chkOpps.addEventListener("change", applyFilters);
chkTraining.addEventListener("change", applyFilters);
chkSelfPaced.addEventListener("change", applyFilters);

 toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});


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
      `<li class="opp">${o.DateStart ?  o.DateStart.substring(5, 10)  : ""} ${o.DateEnd ? " -" + o.DateEnd.substring(5, 10)  : ""}
         ${o.Title || "Unnamed Opportunity"} 
         <p>${o.Description || ""}
         <p>${o.VolunteerURL ? "<a href='" + o.VolunteerURL + "' target='_blank'>Click for more opportunities</a>" :""}</li>
        `
    );

    addCollapsible("Training", org.trainings, t =>
      `<li class="trn"> ${t.Date ?  t.Date.substring(5,10) : ""} ${t.Series ? t.Series  + ": " :""}  ${t.Title || "Training"} 
      <p>${t.Description || ""} ${t.RegistrationURL ? "<a href='" + t.RegistrationURL + "' target='_blank'>Registration</a>" : ""} </li>`
    );

    addCollapsible("Self-Paced", org.selfpaced, s =>
      `<li class="selfp">${s.Title || "Course"} ${s.Link ? "- <a href=" + s.Link + " target='_blank'>Link</a>" : ""}
      <p>${s.Description || ""} </li>`
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

