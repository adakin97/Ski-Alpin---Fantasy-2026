fetch('courses.json')
  .then(response => response.json())
  .then(data => {
    const tableBody = document.querySelector('#courses-table tbody');
    const events = data["Calendar Event"];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(course => getEndDate(course.Date) >= today);

    if (upcomingEvents.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#888;">Saison terminée</td></tr>';
      return;
    }

    const countryCode = {
      'Austria': 'aut', 'Switzerland': 'sui', 'USA': 'usa',
      'France': 'fra', 'Italy': 'ita', 'Finland': 'fin',
      'Norway': 'nor', 'Germany': 'ger', 'Slovenia': 'slo'
    };

    upcomingEvents.forEach((course, i) => {
      const row = document.createElement('tr');
      if (i === 0) row.classList.add('next-race');

      const code = countryCode[course.Country] || course.Country.toLowerCase().slice(0, 3);
      const flagHtml = `<img class="flag-img" src="flags/${code}.png" alt="${course.Country}" onerror="this.style.display='none'">`;

      const nextLabel = i === 0 ? '<span class="next-label">Prochaine</span>' : '';
      const eventLabel = course.Column6 ? `<span class="event-label">${course.Column6}</span>` : '';

      const badgesHtml = course.Event.split(',').map(d => {
        const disc = d.trim();
        return `<span class="race-badge badge-${disc}">${disc}</span>`;
      }).join('');

      row.innerHTML = `
        <td>${course.Date}${nextLabel}</td>
        <td>${flagHtml}${course.Country}</td>
        <td>${course.Place}${eventLabel}</td>
        <td>${badgesHtml}</td>
      `;

      tableBody.appendChild(row);
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

// Extrait la date de fin d'une plage comme "07-08.03.26" → parseDate("08.03.26")
function getEndDate(dateStr) {
  const parts = dateStr.split('-');
  return parseDate(parts[parts.length - 1]);
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
