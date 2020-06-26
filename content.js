// Is wrapping your entire code in an IFFE bad practice?
// Perhaps, yet here it is 
(function(){
	if (!window.location.href.includes('thread')) return;

	const all_videos = [...document.querySelectorAll('.fileThumb')].map((x) => {
		return {
			url: x.href,
			id: x.previousSibling.id.slice(2),
		};
	})

	const get_all_replies = (id) => {
		reply_container.innerHTML = '';
		reply_container.appendChild(document.getElementById(`m${id}`).cloneNode(true));
		document.querySelectorAll(`[href='#p${id}']`).forEach((x, i) => {
			const node = x.parentNode.cloneNode(true);
			if (i < 2) {
				reply_container.insertAdjacentElement('afterbegin', node);
				return;
			}
			reply_container.appendChild(node);
		});
	};

	const scroll_to_msg = (id) => {
		document.getElementById(`pc${id}`).scrollIntoView(true);
	};

	const change_video = () => {
		is_video = all_videos[current_index].url.slice(-4) == 'webm';
		video.style.display = 'none';
		image.style.display = 'none';

		let media = is_video ? video : image;

		media.style.display = 'block'
		media.src = '';
		media.src = all_videos[current_index].url;

		get_all_replies(all_videos[current_index].id);
		scroll_to_msg(all_videos[current_index].id);
	};

	let running = false,
		is_init = false,
		autoroll = true,
		binds = {
			key_toggle: '67',// C
			key_prev: '86', // V
			key_next: '66', // B
			key_replies: '78', // N
			key_autoroll: '65', // A
		},
		current_index = 0,
		is_video,
		video_container,
		video,
		image,
		reply_container;

	document.body.insertAdjacentHTML('afterbegin',
		`<div class="rc-fullscreen-video hidden" id="vc_con">
			<video controls autoplay></video>
			<img />
			<div class="rc-reply-container hidden"></div>
		</div>`
	);

	// Init
	video_container = document.getElementById('vc_con');
	video = video_container.childNodes[1];
	image = video_container.childNodes[3];
	reply_container = video_container.childNodes[5];
	change_video();
	video.onended = () => {
		if (autoroll) {
			current_index == all_videos.length - 1 ? current_index = 0 : current_index++;
			change_video()
		}
	}

	document.onkeydown = (e) => {
		const kc = e.keyCode
		// C [Toggle video playlist]
		if (kc == binds.key_toggle) {
			video_container.classList.toggle('hidden');
			running = !running;
			document.body.style.overflowY = running ? 'hidden' : 'unset';
			running && is_video ? video.play() : video.pause();
		}

		if (running) {
			// A [toggle auto-play next video]
			if (kc == binds.key_autoroll) {
				autoroll = !autoroll;
				autoroll ? video.removeAttribute('loop') : video.setAttribute('loop', '');
			}
			// ESC [Close player]
			if (kc == '27') {
				video_container.classList = 'rc-fullscreen-video hidden';
				running = false;
				if (is_video) video.pause();
				document.body.style.overflowY = 'hidden';
			}
			// V [Previous video]
			if (kc == binds.key_prev) {
				current_index == 0 ? current_index = all_videos.length - 1 : current_index--;
				change_video();
			}
			// B [Next video]
			if (kc == binds.key_next) {
				current_index == all_videos.length - 1 ? current_index = 0 : current_index++;
				change_video();
			}
			// N [Show replies]
			if (kc == binds.key_replies) {
				reply_container.classList.toggle('hidden');
			}
		}
	};

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.hasOwnProperty('bind_data')) {
				binds = request['bind_data'];
			}
			if (request.hasOwnProperty('single_bind')) {
				binds[request['single_bind'][0]] = request['single_bind'][1];
			}
		});
})();