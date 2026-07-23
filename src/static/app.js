document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity select (keep placeholder)
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Selecione uma atividade --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Horário:</strong> ${details.schedule}</p>
          <p class="spots"><strong>Vagas:</strong> <span class="spots-count">${spotsLeft}</span> restantes</p>
        `;

        // Participants container
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participantes:";
        participantsDiv.appendChild(participantsLabel);

        if (details.participants && details.participants.length) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;

            // Delete button
            const delBtn = document.createElement("button");
            delBtn.className = "trash-btn";
            delBtn.title = `Remover ${p}`;
            delBtn.innerHTML = `
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6h18" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 11v6" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `;
            delBtn.setAttribute('aria-label', `Remover ${p}`);
            delBtn.addEventListener("click", async () => {
              if (!confirm(`Remover ${p} de ${name}?`)) return;

              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const data = await res.json();
                if (res.ok) {
                  messageDiv.textContent = data.message;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  // Refresh activities list
                  fetchActivities();
                } else {
                  messageDiv.textContent = data.detail || "Erro ao remover participante";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
              } catch (err) {
                console.error(err);
              }
            });

            li.appendChild(delBtn);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        } else {
          const pEmpty = document.createElement("p");
          pEmpty.className = "no-participants";
          pEmpty.textContent = "Nenhum participante ainda";
          participantsDiv.appendChild(pEmpty);
        }

        activityCard.appendChild(participantsDiv);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
          // Refresh activities list to show new participant and updated vacancies
          fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
