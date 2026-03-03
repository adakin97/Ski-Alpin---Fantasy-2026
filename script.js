fetch('courses.json')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector('#courses-table tbody');
    const events = data["Calendar Event"];

    events.forEach(course => {
      // Ligne principale pour chaque course
      const row = document.createElement('tr');
      const dates = expandDateRange(course.Date, course.Event.split(','));

      row.innerHTML = `
        <td>${course.Date}</td>
        <td>${course.Country}</td>
        <td>${course.Place}</td>
        <td>${course.Event}</td>
      `;

      tableBody.appendChild(row);

      // Ajouter les détails pour les plages de dates
      if (dates.length > 1) {
        const detailsRow = document.createElement('tr');
        const detailsCell = document.createElement('td');

        detailsCell.colSpan = 4; // Fusionne les colonnes
        detailsCell.innerHTML = `
          <div class="details">
            ${dates.map(d => `<div>${d.date} - ${d.event}</div>`).join('')}
          </div>
        `;

        detailsRow.appendChild(detailsCell);
        detailsRow.classList.add('details-row');
        detailsRow.style.display = 'none'; // Cacher par défaut
        tableBody.appendChild(detailsRow);

        // Ajout de la fonctionnalité d'affichage/masquage
        row.addEventListener('click', () => {
          const isVisible = detailsRow.style.display === 'table-row';
          detailsRow.style.display = isVisible ? 'none' : 'table-row';
        });
      }
    });
  })
  .catch(error => console.error('Error loading data:', error));

// Fonction pour créer des dates individuelles
function expandDateRange(dateRange, events) {
  if (!dateRange.includes('-')) {
    // Date unique
    return [{ date: dateRange, event: events[0] }];
  }

  const [start, end] = dateRange.split('-');
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  const result = [];
  let currentEventIndex = 0;

  while (startDate <= endDate) {
    result.push({
      date: formatDate(startDate),
      event: events[currentEventIndex] || 'TBD', // Si pas assez d'événements
    });
    startDate.setDate(startDate.getDate() + 1);
    currentEventIndex++;
  }

  return result;
}

// Utilitaire : Convertit une date "DD.MM.YY" en objet Date
function parseDate(dateString) {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(`20${year}`, month - 1, day);
}

// Utilitaire : Convertit un objet Date en "DD.MM.YY"
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

fetch('articles.json')
    .then(response => response.json())
    .then(data => {
        const articleList = document.getElementById('articles');
        data.forEach(article => {
            const li = document.createElement('li');
            li.classList.add('article-item');
            const a = document.createElement('a');
            a.href = article.link;
            a.target = '_blank';
            a.rel = 'noopener';
            const img = document.createElement('img');
            img.src = article.image || 'Image/background.jpeg';
            img.alt = article.title;
            img.onerror = function() { this.src = 'Image/background.jpeg'; };
            const h3 = document.createElement('h3');
            h3.textContent = article.title;
            a.append(img, h3);
            li.appendChild(a);
            articleList.appendChild(li);
        });
    })
    .catch(error => console.error('Erreur lors du chargement des articles:', error));
