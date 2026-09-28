const API_URL = 'https://gif-backend-jemy.onrender.com';
const FRONTEND_URL = 'https://gif-get-issue-first.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
  const loadingEl = document.getElementById('loading');
  const loggedOutEl = document.getElementById('logged-out');
  const errorEl = document.getElementById('error');
  const emptyEl = document.getElementById('empty');
  const listEl = document.getElementById('notifications-list');
  const badgeEl = document.getElementById('unread-badge');
  const loginBtn = document.getElementById('login-btn');
  const viewAllBtn = document.getElementById('view-all-btn');

  const showState = (state) => {
    loadingEl.classList.add('hidden');
    loggedOutEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    listEl.classList.add('hidden');
    
    if (state === 'loading') loadingEl.classList.remove('hidden');
    if (state === 'logged-out') loggedOutEl.classList.remove('hidden');
    if (state === 'error') errorEl.classList.remove('hidden');
    if (state === 'empty') emptyEl.classList.remove('hidden');
    if (state === 'list') listEl.classList.remove('hidden');
  };

  const updateBadge = (count) => {
    let text = '';
    if (count > 9) text = '9+';
    else if (count > 0) text = count.toString();
    
    chrome.action.setBadgeText({ text });
    
    if (count > 0) {
      badgeEl.textContent = `${text} unread`;
      badgeEl.style.display = 'block';
    } else {
      badgeEl.style.display = 'none';
    }
  };

  const renderNotifications = (notifications) => {
    listEl.innerHTML = '';
    
    if (!notifications || notifications.length === 0) {
      showState('empty');
      return;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;
    updateBadge(unreadCount);

    showState('list');

    notifications.forEach(n => {
      const item = document.createElement('div');
      item.className = `notification ${n.isRead ? '' : 'unread'}`;
      
      const repoName = n.repository?.fullName || 'Unknown Repository';
      item.innerHTML = `
        <div class="notif-header">
          <span class="repo-name">${repoName}</span>
          <button class="dismiss-btn" title="Dismiss">&times;</button>
        </div>
        <p class="notif-title">#${n.issue?.number} ${n.issue?.title}</p>
        <div class="notif-time">${new Date(n.createdAt).toLocaleDateString()}</div>
      `;

      item.querySelector('.dismiss-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        item.style.opacity = '0.5';
        try {
          await fetch(`${API_URL}/api/notifications/${n.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          item.remove();
          if (listEl.children.length === 0) showState('empty');
          fetchNotifications(); // Silently refresh counts
        } catch (err) {
          console.error(err);
          item.style.opacity = '1';
        }
      });

      item.addEventListener('click', async () => {
        if (!n.isRead) {
          item.classList.remove('unread');
          try {
            await fetch(`${API_URL}/api/notifications/${n.id}/read`, {
              method: 'PATCH',
              credentials: 'include'
            });
            fetchNotifications();
          } catch (e) {
            console.error(e);
          }
        }
        
        const type = n.repository?.isPrivate ? 'private' : 'public';
        const url = `${FRONTEND_URL}/${type}/${repoName}?issue=${n.issue?.number}`;
        chrome.tabs.create({ url });
      });

      listEl.appendChild(item);
    });
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
        showState('logged-out');
        chrome.action.setBadgeText({ text: '' });
        return;
      }
      
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      renderNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      if (loadingEl.classList.contains('hidden') && listEl.classList.contains('hidden')) {
        showState('error');
        errorEl.textContent = 'Failed to load notifications.';
      }
    }
  };

  loginBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${FRONTEND_URL}/account` });
  });

  viewAllBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${FRONTEND_URL}/notifications` });
  });

  fetchNotifications();
});
