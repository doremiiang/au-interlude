import { MESSAGE_CONTACTS } from '../../data/apps.js';
import { MESSAGE_THREADS } from '../../data/messages.js';

const CHAT_DATA = MESSAGE_THREADS;

const escapeHTML = (value = '') => {
return String(value).replace(/[&<>"']/g, (char) => {
const entities = {
'&': '&',
'<': '<',
'>': '>',
'"': '"',
"'": '''
};

return entities[char];

});
};

const getContact = (contactId) => {
return MESSAGE_CONTACTS.find(
(contact) => contact.id === contactId
);
};

const getMessages = (contactId) => {
return Array.isArray(CHAT_DATA[contactId])
? CHAT_DATA[contactId]
: [];
};

const getTimestamp = (message) => {
return new Date(
${message.date}T${message.time}:00
).getTime();
};

const formatTime = (time) => {
return time || '';
};

const formatDate = (dateString) => {
const date = new Date(${dateString}T12:00:00);

return new Intl.DateTimeFormat('id-ID', {
weekday: 'long',
day: 'numeric',
month: 'long',
year: 'numeric'
}).format(date);
};

const formatShortDate = (dateString) => {
const date = new Date(${dateString}T12:00:00);

return new Intl.DateTimeFormat('id-ID', {
day: 'numeric',
month: 'short'
}).format(date);
};

const getLastMessage = (contactId) => {
const messages = getMessages(contactId);

if (!messages.length) return null;

return [...messages].sort(
(a, b) => getTimestamp(b) - getTimestamp(a)
)[0];
};

const getContactPreview = (contactId) => {
const lastMessage = getLastMessage(contactId);

if (!lastMessage) return 'Belum ada pesan.';

const prefix = lastMessage.sender === 'shaqil'
? 'Anda: '
: contactId === 'family'
? ${getContact(lastMessage.sender)?.name || lastMessage.sender}: 
: '';

return prefix + lastMessage.text;
};

const getPreviewTime = (contactId) => {
const lastMessage = getLastMessage(contactId);

if (!lastMessage) return '';

return formatTime(lastMessage.time);
};

const renderAvatar = (contact, large = false) => {
const initials = contact.initials || contact.name
.split(' ')
.map((word) => word[0])
.join('')
.slice(0, 2);

return   <div class="message-avatar${large ? ' message-avatar-large' : ''}">   <span>${escapeHTML(initials)}</span>   </div>  ;
};

const renderMessagesHeader = (title = 'Messages') => {
return `
<header class="app-header messages-header">
<button  
class="app-back-button"  
type="button"  
data-action="close-app"  
aria-label="Kembali ke Home"  
>
<svg viewBox="0 0 24 24" aria-hidden="true">
<path  
d="M15 18l-6-6 6-6"  
fill="none"  
stroke="currentColor"  
stroke-width="2"  
stroke-linecap="round"  
stroke-linejoin="round"  
/>
</svg>
</button>

<h1>${escapeHTML(title)}</h1>  

  <span class="messages-header-spacer"></span>  
</header>

`;
};

const renderContactRow = (contact) => {
const lastMessage = getLastMessage(contact.id);

return `
<button  
class="message-contact-row"  
type="button"  
data-action="open-chat"  
data-contact-id="${escapeHTML(contact.id)}"  
>
${renderAvatar(contact)}

<span class="message-contact-copy">  
    <strong>${escapeHTML(contact.name)}</strong>  
    <span>${escapeHTML(getContactPreview(contact.id))}</span>  
  </span>  

  <span class="message-contact-meta">  
    <time>  
      ${lastMessage ? escapeHTML(getPreviewTime(contact.id)) : ''}  
    </time>  
    <svg viewBox="0 0 24 24" aria-hidden="true">  
      <path  
        d="M9 18l6-6-6-6"  
        fill="none"  
        stroke="currentColor"  
        stroke-width="1.8"  
        stroke-linecap="round"  
        stroke-linejoin="round"  
      />  
    </svg>  
  </span>  
</button>

`;
};

const renderContactList = (searchTerm = '') => {
const query = searchTerm.trim().toLowerCase();

const filteredContacts = MESSAGE_CONTACTS.filter((contact) => {
const searchableText = [
contact.name,
contact.subtitle,
getContactPreview(contact.id)
].join(' ').toLowerCase();

return searchableText.includes(query);

});

if (!filteredContacts.length) {
return   <div class="message-list-empty">   <p>Tidak ada percakapan yang cocok.</p>   </div>  ;
}

return filteredContacts
.map(renderContactRow)
.join('');
};

const renderMessagesList = (surface) => {
surface.innerHTML = `
${renderMessagesHeader()}

<section class="messages-screen">  
  <div class="messages-page-title">  
    <h2>Messages</h2>  
    <p>Semua percakapan</p>  
  </div>  

  <label class="app-search messages-search">  
    <svg viewBox="0 0 24 24" aria-hidden="true">  
      <circle  
        cx="10.8"  
        cy="10.8"  
        r="6.8"  
        fill="none"  
        stroke="currentColor"  
        stroke-width="1.8"  
      />  
      <path  
        d="m16 16 4.2 4.2"  
        fill="none"  
        stroke="currentColor"  
        stroke-width="1.8"  
        stroke-linecap="round"  
      />  
    </svg>  

    <input  
      type="search"  
      placeholder="Cari"  
      aria-label="Cari percakapan"  
      data-role="message-search"  
      autocomplete="off"  
    />  
  </label>  

  <div  
    class="message-contact-list"  
    data-role="contact-list"  
  >  
    ${renderContactList()}  
  </div>  
</section>

`;
};

function renderMessageBubble(message) {
const isOutgoing = message.direction === 'outgoing';

return   <div class="message-bubble ${   isOutgoing ? 'message-outgoing' : 'message-incoming'   }">   <p>${escapeHTML(message.text)}</p>   <time>${escapeHTML(formatTime(message.time))}</time>   </div>  ;
}

const renderConversation = (contactId) => {
const messages = [...getMessages(contactId)].sort(
(a, b) => getTimestamp(a) - getTimestamp(b)
);

if (!messages.length) {
return   <div class="message-empty-history">   Belum ada percakapan.   </div>  ;
}

let previousDate = '';

return messages.map((message) => {
let dateDivider = '';

if (message.date !== previousDate) {  
  dateDivider = `  
    <div class="message-date-divider">  
      <span>${escapeHTML(formatDate(message.date))}</span>  
    </div>  
  `;  

  previousDate = message.date;  
}  

return `  
  ${dateDivider}  
  ${renderMessageBubble(message, contactId)}  
`;

}).join('');
};

const renderMessageThread = (surface, contactId) => {
const contact = getContact(contactId);

if (!contact) return;

const subtitle = contact.id === 'family'
? 'Grup keluarga'
: contact.subtitle || '';

surface.innerHTML = `
<header class="app-header messages-header">
<button  
class="app-back-button"  
type="button"  
data-action="back-to-list"  
aria-label="Kembali ke daftar percakapan"  
>
<svg viewBox="0 0 24 24" aria-hidden="true">
<path  
d="M15 18l-6-6 6-6"  
fill="none"  
stroke="currentColor"  
stroke-width="2"  
stroke-linecap="round"  
stroke-linejoin="round"  
/>
</svg>
</button>

<h1>${escapeHTML(contact.name)}</h1>  

  <span class="messages-header-spacer"></span>  
</header>  

<section class="message-thread">  
  <div class="thread-profile">  
    ${renderAvatar(contact, true)}  

    <strong>${escapeHTML(contact.name)}</strong>  
    <span>${escapeHTML(subtitle)}</span>  
  </div>  

  <div class="thread-history" data-role="thread-history">  
    <div class="message-bubbles">  
      ${renderConversation(contactId)}  
    </div>  
  </div>  
</section>

`;

const history = surface.querySelector(
'[data-role="thread-history"]'
);

if (history) {
history.scrollTop = history.scrollHeight;
}
};

export function renderMessages(surface, onClose) {
let activeContactId = null;

const handleClick = (event) => {
const actionElement = event.target.closest('[data-action]');

if (!actionElement || !surface.contains(actionElement)) {  
  return;  
}  

const action = actionElement.dataset.action;  

if (action === 'close-app') {  
  onClose();  
  return;  
}  

if (action === 'open-chat') {  
  const contactId = actionElement.dataset.contactId;  

  if (!getContact(contactId)) return;  

  activeContactId = contactId;  
  renderMessageThread(surface, activeContactId);  
  return;  
}  

if (action === 'back-to-list') {  
  activeContactId = null;  
  renderMessagesList(surface);  
}

};

const handleInput = (event) => {
if (event.target.matches('[data-role="message-search"]')) {
const searchTerm = event.target.value;
const contactList = surface.querySelector(
'[data-role="contact-list"]'
);

if (contactList) {  
    contactList.innerHTML = renderContactList(searchTerm);  
  }  
}

};

surface.addEventListener('click', handleClick);
surface.addEventListener('input', handleInput);

renderMessagesList(surface);

return () => {
surface.removeEventListener('click', handleClick);
surface.removeEventListener('input', handleInput);
};
}

