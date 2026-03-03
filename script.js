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

async function loadArticles() {
    const RSS_URL = 'https://news.google.com/rss/search?q=ski+alpin+rts.ch&hl=fr&gl=CH&ceid=CH:fr';
    const PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(RSS_URL);
    const FALLBACK_IMG = 'Image/background.jpeg';

    try {
        const response = await fetch(PROXY, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const text = await response.text();

        const xml = new DOMParser().parseFromString(text, 'text/xml');
        const parseError = xml.querySelector('parsererror');
        if (parseError) throw new Error('XML parse error');

        const items = Array.from(xml.querySelectorAll('item'));
        if (items.length === 0) throw new Error('No items in feed');

        const articles = items.slice(0, 6).map(item => {
            const title = item.querySelector('title')?.textContent?.trim() || '';
            // <link> in RSS is a text node sibling of the element; textContent works in XML mode
            const link = item.querySelector('link')?.textContent?.trim() || '#';

            // Try media:thumbnail or media:content (namespace-agnostic query)
            let image = '';
            const mediaThumbnail = item.getElementsByTagNameNS('*', 'thumbnail')[0];
            const mediaContent = item.getElementsByTagNameNS('*', 'content')[0];
            if (mediaThumbnail) image = mediaThumbnail.getAttribute('url') || '';
            else if (mediaContent) image = mediaContent.getAttribute('url') || '';

            // Try extracting <img> from description HTML if still no image
            if (!image) {
                const desc = item.querySelector('description')?.textContent || '';
                const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch) image = imgMatch[1];
            }

            return { title, link, image: image || FALLBACK_IMG };
        }).filter(a => a.title);

        if (articles.length === 0) throw new Error('No valid articles parsed');
        displayArticles(articles);

    } catch (err) {
        console.error('Chargement RSS échoué, repli sur articles.json :', err.message);
        fetch('articles.json')
            .then(r => r.json())
            .then(displayArticles)
            .catch(e => console.error('Erreur articles.json :', e));
    }
}

function displayArticles(articles) {
    const articleList = document.getElementById('articles');
    if (!articleList) return;
    articleList.innerHTML = '';
    articles.forEach(article => {
        const li = document.createElement('li');
        li.classList.add('article-item');
        const a = document.createElement('a');
        a.href = article.link;
        a.target = '_blank';
        a.rel = 'noopener';
        const img = document.createElement('img');
        img.src = article.image;
        img.alt = article.title;
        img.onerror = function() { this.src = 'Image/background.jpeg'; };
        const h3 = document.createElement('h3');
        h3.textContent = article.title;
        a.append(img, h3);
        li.appendChild(a);
        articleList.appendChild(li);
    });
}

loadArticles();
