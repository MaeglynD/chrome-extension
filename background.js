chrome.runtime.onInstalled.addListener(function () {
	const binds = {
		'key_toggle': '67',
		'key_prev': '86',
		'key_next': '66',
		'key_replies': '78',
		'key_autoroll': '65'
	}
	chrome.storage.sync.set(binds, function () {
		console.log('binds set');
	});
});