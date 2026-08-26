// ===== STATE =====
var MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
var DAYS_TR = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
var HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00'];

var selectedDate = new Date();
var calendarMonth = selectedDate.getMonth();
var calendarYear = selectedDate.getFullYear();
var calendarOpen = false;

// ===== HELPERS =====
function dateKey(d) {
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function getAppointments(key) {
  try {
    var data = localStorage.getItem('randevu_' + key);
    return data ? JSON.parse(data) : {};
  } catch(e) { return {}; }
}

function saveAppointments(key, data) {
  localStorage.setItem('randevu_' + key, JSON.stringify(data));
}

function dayHasAppointments(d) {
  var data = getAppointments(dateKey(d));
  for (var k in data) {
    if (data[k] && data[k].name) return true;
  }
  return false;
}

// ===== CALENDAR POPUP =====
function toggleCalendar() {
  var popup = document.getElementById('calendarPopup');
  var btn = document.getElementById('calendarToggle');
  calendarOpen = !calendarOpen;
  if (calendarOpen) {
    calendarMonth = selectedDate.getMonth();
    calendarYear = selectedDate.getFullYear();
    popup.className = 'calendar-popup show';
    btn.className = 'calendar-toggle-btn active';
    populateSelectors();
    renderCalendar();
  } else {
    popup.className = 'calendar-popup';
    btn.className = 'calendar-toggle-btn';
  }
}

function closeCalendar() {
  calendarOpen = false;
  document.getElementById('calendarPopup').className = 'calendar-popup';
  document.getElementById('calendarToggle').className = 'calendar-toggle-btn';
}

function populateSelectors() {
  var monthSel = document.getElementById('monthSelect');
  var yearSel = document.getElementById('yearSelect');

  monthSel.innerHTML = '';
  for (var i = 0; i < 12; i++) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = MONTHS_TR[i];
    if (i === calendarMonth) opt.selected = true;
    monthSel.appendChild(opt);
  }

  yearSel.innerHTML = '';
  for (var y = 2024; y <= 2035; y++) {
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === calendarYear) opt.selected = true;
    yearSel.appendChild(opt);
  }
}

function renderCalendar() {
  var container = document.getElementById('calendarDays');
  container.innerHTML = '';

  var firstDay = new Date(calendarYear, calendarMonth, 1);
  var lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  var startDow = (firstDay.getDay() + 6) % 7; // Monday=0

  var today = new Date();
  var todayKey = dateKey(today);
  var selKey = dateKey(selectedDate);

  // Previous month days
  var prevLast = new Date(calendarYear, calendarMonth, 0);
  for (var i = startDow - 1; i >= 0; i--) {
    var d = new Date(calendarYear, calendarMonth - 1, prevLast.getDate() - i);
    container.appendChild(createCalDay(d, true, todayKey, selKey));
  }

  // Current month days
  for (var day = 1; day <= lastDay.getDate(); day++) {
    var d = new Date(calendarYear, calendarMonth, day);
    container.appendChild(createCalDay(d, false, todayKey, selKey));
  }

  // Next month days to fill grid
  var totalCells = startDow + lastDay.getDate();
  var remaining = (7 - (totalCells % 7)) % 7;
  for (var i = 1; i <= remaining; i++) {
    var d = new Date(calendarYear, calendarMonth + 1, i);
    container.appendChild(createCalDay(d, true, todayKey, selKey));
  }
}

function createCalDay(d, isOther, todayKey, selKey) {
  var div = document.createElement('div');
  div.className = 'cal-day';
  div.textContent = d.getDate();
  if (isOther) div.className += ' other-month';
  if (dateKey(d) === todayKey) div.className += ' today';
  if (dateKey(d) === selKey) div.className += ' selected';
  if (dayHasAppointments(d)) div.className += ' has-appointments';

  var dateVal = new Date(d.getTime());
  div.onclick = function() {
    selectedDate = dateVal;
    closeCalendar();
    renderDayHeader();
    renderTable();
  };
  return div;
}

// ===== DAY DISPLAY =====
function renderDayHeader() {
  var el = document.getElementById('currentDate');
  var d = selectedDate;
  el.textContent = d.getDate() + ' ' + MONTHS_TR[d.getMonth()] + ' ' + d.getFullYear() + ' - ' + DAYS_TR[d.getDay()];
}

// ===== TABLE =====
function renderTable() {
  var tbody = document.getElementById('appointmentsBody');
  tbody.innerHTML = '';
  var key = dateKey(selectedDate);
  var appointments = getAppointments(key);

  for (var i = 0; i < HOURS.length; i++) {
    var hour = HOURS[i];
    var apt = appointments[hour] || null;
    var tr = document.createElement('tr');

    // Time cell
    var tdTime = document.createElement('td');
    var badge = document.createElement('span');
    badge.className = 'time-badge';
    badge.textContent = hour;
    tdTime.appendChild(badge);
    tr.appendChild(tdTime);

    if (apt && apt.name) {
      // Saved appointment
      var tdName = document.createElement('td');
      var nameSpan = document.createElement('span');
      nameSpan.className = 'saved-name';
      nameSpan.textContent = apt.name;
      tdName.appendChild(nameSpan);
      tr.appendChild(tdName);

      var tdPhone = document.createElement('td');
      var phoneSpan = document.createElement('span');
      phoneSpan.className = 'saved-phone';
      phoneSpan.textContent = apt.phone || '-';
      tdPhone.appendChild(phoneSpan);
      tr.appendChild(tdPhone);

      var tdAction = document.createElement('td');
      tdAction.style.textAlign = 'center';
      var slotStatus = document.createElement('div');
      slotStatus.className = 'slot-status';
      var badgeFull = document.createElement('span');
      badgeFull.className = 'badge-full';
      badgeFull.textContent = '✓ Dolu';
      slotStatus.appendChild(badgeFull);
      var btnEdit = document.createElement('button');
      btnEdit.className = 'btn-edit';
      btnEdit.textContent = '✏️ Düzenle';
      btnEdit.setAttribute('data-hour', hour);
      btnEdit.onclick = function() {
        editAppointment(this.getAttribute('data-hour'));
      };
      slotStatus.appendChild(btnEdit);
      var btnDel = document.createElement('button');
      btnDel.className = 'btn-delete';
      btnDel.textContent = 'Sil';
      btnDel.setAttribute('data-hour', hour);
      btnDel.onclick = function() {
        var h = this.getAttribute('data-hour');
        if (confirm(h + ' randevusunu silmek istediğinize emin misiniz?')) {
          deleteAppointment(h);
        }
      };
      slotStatus.appendChild(btnDel);
      tdAction.appendChild(slotStatus);
      tr.appendChild(tdAction);
    } else {
      // Empty slot - input fields
      var tdName = document.createElement('td');
      var inputName = document.createElement('input');
      inputName.type = 'text';
      inputName.placeholder = 'Ad Soyad';
      inputName.id = 'name_' + hour.replace(':', '');
      tdName.appendChild(inputName);
      tr.appendChild(tdName);

      var tdPhone = document.createElement('td');
      var inputPhone = document.createElement('input');
      inputPhone.type = 'tel';
      inputPhone.placeholder = 'Telefon No';
      inputPhone.id = 'phone_' + hour.replace(':', '');
      tdPhone.appendChild(inputPhone);
      tr.appendChild(tdPhone);

      var tdAction = document.createElement('td');
      tdAction.style.textAlign = 'center';
      var btnSave = document.createElement('button');
      btnSave.className = 'btn-save';
      btnSave.textContent = 'Kaydet';
      btnSave.setAttribute('data-hour', hour);
      btnSave.onclick = function() {
        saveSlot(this.getAttribute('data-hour'));
      };
      tdAction.appendChild(btnSave);
      tr.appendChild(tdAction);
    }

    tbody.appendChild(tr);
  }
}

function saveSlot(hour) {
  var hKey = hour.replace(':', '');
  var nameInput = document.getElementById('name_' + hKey);
  var phoneInput = document.getElementById('phone_' + hKey);
  var name = nameInput.value.trim();
  var phone = phoneInput.value.trim();

  if (!name) {
    alert('Lütfen ad soyad giriniz.');
    nameInput.focus();
    return;
  }

  var key = dateKey(selectedDate);
  var appointments = getAppointments(key);
  appointments[hour] = { name: name, phone: phone };
  saveAppointments(key, appointments);
  renderTable();
}

function deleteAppointment(hour) {
  var key = dateKey(selectedDate);
  var appointments = getAppointments(key);
  delete appointments[hour];
  saveAppointments(key, appointments);
  renderTable();
}

function editAppointment(hour) {
  var key = dateKey(selectedDate);
  var appointments = getAppointments(key);
  var apt = appointments[hour];
  if (!apt) return;

  var hKey = hour.replace(':', '');

  // Find the row for this hour and replace content with inputs
  var tbody = document.getElementById('appointmentsBody');
  var rows = tbody.getElementsByTagName('tr');
  for (var i = 0; i < rows.length; i++) {
    var badge = rows[i].querySelector('.time-badge');
    if (badge && badge.textContent === hour) {
      var tr = rows[i];
      // Replace name cell
      var tdName = tr.cells[1];
      tdName.innerHTML = '';
      var inputName = document.createElement('input');
      inputName.type = 'text';
      inputName.value = apt.name;
      inputName.id = 'edit_name_' + hKey;
      tdName.appendChild(inputName);

      // Replace phone cell
      var tdPhone = tr.cells[2];
      tdPhone.innerHTML = '';
      var inputPhone = document.createElement('input');
      inputPhone.type = 'tel';
      inputPhone.value = apt.phone || '';
      inputPhone.id = 'edit_phone_' + hKey;
      tdPhone.appendChild(inputPhone);

      // Replace action cell
      var tdAction = tr.cells[3];
      tdAction.innerHTML = '';
      tdAction.style.textAlign = 'center';
      var btnContainer = document.createElement('div');
      btnContainer.className = 'slot-status';

      var btnUpdate = document.createElement('button');
      btnUpdate.className = 'btn-save';
      btnUpdate.textContent = '✓ Güncelle';
      btnUpdate.setAttribute('data-hour', hour);
      btnUpdate.onclick = function() {
        updateAppointment(this.getAttribute('data-hour'));
      };
      btnContainer.appendChild(btnUpdate);

      var btnCancel = document.createElement('button');
      btnCancel.className = 'btn-cancel';
      btnCancel.textContent = '✕ İptal';
      btnCancel.onclick = function() {
        renderTable();
      };
      btnContainer.appendChild(btnCancel);

      tdAction.appendChild(btnContainer);

      // Focus on name input
      inputName.focus();
      inputName.select();
      break;
    }
  }
}

function updateAppointment(hour) {
  var hKey = hour.replace(':', '');
  var nameInput = document.getElementById('edit_name_' + hKey);
  var phoneInput = document.getElementById('edit_phone_' + hKey);
  var name = nameInput.value.trim();
  var phone = phoneInput.value.trim();

  if (!name) {
    alert('Lütfen ad soyad giriniz.');
    nameInput.focus();
    return;
  }

  var key = dateKey(selectedDate);
  var appointments = getAppointments(key);
  appointments[hour] = { name: name, phone: phone };
  saveAppointments(key, appointments);
  renderTable();
}

// ===== EVENT LISTENERS =====
document.getElementById('calendarToggle').onclick = function(e) {
  e.stopPropagation();
  toggleCalendar();
};

document.getElementById('calendarPopup').onclick = function(e) {
  e.stopPropagation();
};

document.addEventListener('click', function() {
  if (calendarOpen) closeCalendar();
});

document.getElementById('prevMonth').onclick = function() {
  calendarMonth--;
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  populateSelectors();
  renderCalendar();
};

document.getElementById('nextMonth').onclick = function() {
  calendarMonth++;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  populateSelectors();
  renderCalendar();
};

document.getElementById('monthSelect').onchange = function() {
  calendarMonth = parseInt(this.value);
  renderCalendar();
};

document.getElementById('yearSelect').onchange = function() {
  calendarYear = parseInt(this.value);
  renderCalendar();
};

document.getElementById('prevDay').onclick = function() {
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1);
  renderDayHeader();
  renderTable();
};

document.getElementById('nextDay').onclick = function() {
  selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
  renderDayHeader();
  renderTable();
};

document.getElementById('clearDay').onclick = function() {
  var key = dateKey(selectedDate);
  if (confirm('Bu günün tüm randevularını silmek istediğinize emin misiniz?')) {
    localStorage.removeItem('randevu_' + key);
    renderTable();
  }
};

// ===== THEME TOGGLE =====
function initTheme() {
  var saved = localStorage.getItem('randevu_theme');
  if (saved === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeIcon').textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    document.getElementById('themeIcon').textContent = '🌙';
  }
}

document.getElementById('themeToggle').onclick = function() {
  var isLight = document.body.classList.toggle('light-theme');
  document.getElementById('themeIcon').textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('randevu_theme', isLight ? 'light' : 'dark');
};

// ===== INIT =====
initTheme();
renderDayHeader();
renderTable();
