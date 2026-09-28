const API_URL = 'https://gif-backend-jemy.onrender.com';

const checkNotifications = async () => {
  try {
    const res = await fetch(`${API_URL}/api/notifications`, {
      credentials: 'include'
    });
    
    if (res.status === 401) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    
    if (res.ok) {
      const data = await res.json();
      const notifications = data.notifications || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      let text = '';
      if (unreadCount > 9) text = '9+';
      else if (unreadCount > 0) text = unreadCount.toString();
      
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
  } catch (err) {
    console.error('Background fetch failed', err);
  }
};

// Listeners
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("pollNotifications", { periodInMinutes: 1 });
  checkNotifications();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pollNotifications") {
    checkNotifications();
  }
});
