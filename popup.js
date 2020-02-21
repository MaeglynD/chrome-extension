const binds = [
	'key_toggle',
	'key_prev',
	'key_next',
	'key_replies',
	'key_autoroll',
];

let bind_data,
	current_keydown;

chrome.storage.sync.get(binds, (data) => {
	bind_data = Object.entries(data);
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, { 'bind_data': data });
	});
	document.querySelectorAll('.e-key-change').forEach((x, i) => {
		x.addEventListener('focus', () => {
			x.placeholder = 'Press any key...';
		})
		x.addEventListener('blur', () => {
			if(x.value.length) {
				chrome.storage.sync.set({ [bind_data[i][0]]: current_keydown }, () => {
					bind_data[i][1] = current_keydown;
					chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
						chrome.tabs.sendMessage(tabs[0].id, { 
							'single_bind': [bind_data[i][0], current_keydown] 
						});
					});
				});
				x.placeholder = current_keydown;
			} else {
				x.placeholder = String.fromCharCode(bind_data[i][1]);
			}
		})
		x.placeholder = String.fromCharCode(bind_data[i][1]);
	});
	console.log('binds loaded');
});

document.onkeydown = (e) => {
	// ESC is reserved
	if (e.keyCode == '27') return;
	current_keydown = e.keyCode

	if(document.hasFocus() && document.activeElement.tagName == 'INPUT') {
		document.activeElement.value = String.fromCharCode(current_keydown);
		document.activeElement.blur();
	}

	

};