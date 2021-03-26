// URL
const location = window.location.href;

// If we're on reddit, we'll expand all expandable videos
if (location.includes('reddit.com')) {
	// When a key is pressed...
	document.onkeydown = async (e) => {
		// If the B key is pressed...
		if(e.keyCode == 66){
			// Get all expandable media
			[...document.querySelectorAll('.expando-button.video.collapsed')]
				// Loop through them and click
				.forEach((x) =>
					x.click()
				);

			// Neccessary delay
			await new Promise(resolve => setTimeout(resolve, 300));

			// They'll play as soon as they're expanded, clicking them again will ensure they're pause
			[...document.querySelectorAll('video')]
				.forEach((x) => {
					x.click();
				})
		}
	}
}

// Is wrapping your entire code in an IFFE bad practice?
// Perhaps, yet here it is 
(function(){
	// If the URL contains any of the following locations, don't execute any further code
	if (!['thread', 'yuki.la'].some((x) => location.includes(x))) return;

	// Select all thumbnail elements
	const all_videos = [...document.querySelectorAll('.fileThumb')].map((x) => {
		return {
			// The URL
			url: x.href,
			// This is the id to the actual media element
			id: x.previousSibling.id.slice(2),
		};
	})

	// Get all replies to a given ID
	const get_all_replies = (id) => {
		// Remove any contents in the reply container
		reply_container.innerHTML = '';

		// Add the initial msg
		reply_container
			.appendChild(document.getElementById(`m${id}`)
			.cloneNode(true));

		// Find all replies, append them too
		document.querySelectorAll(`[href='#p${id}']`).forEach((x, i) => {
			// Get the reply node
			const node = x.parentNode.cloneNode(true);

			if (i < 2) {
				// Append the node before its first child
				reply_container.insertAdjacentElement('afterbegin', node);
			} else {
				// Append to end of node
				reply_container.appendChild(node);
			}
		});
	};

	// Scroll to a post
	const scroll_to_msg = (id) => {
		document.getElementById(`pc${id}`).scrollIntoView(true);
	};

	// Change video using the current_index
	const change_video = () => {
		// Set the outter variable is_video
		is_video = all_videos[current_index].url.slice(-4) == 'webm';

		// Remove media from view
		video.style.display = 'none';
		image.style.display = 'none';
		
		// Set the media...
		let media = is_video ? video : image;

		// Set the media's src / styles
		media.style.display = 'block'
		media.src = '';
		media.src = all_videos[current_index].url;

		// Get replies and scroll post into view
		get_all_replies(all_videos[current_index].id);
		scroll_to_msg(all_videos[current_index].id);
	};

	// Initialise the thumbnail 'upcoming' view
	const init_upcoming = () => {
		// For all media... 
		all_videos.forEach((x, i) => {
			const sections = x.url.split('/');

			// Append the thumbnail to the upcoming section
			upcoming_container.insertAdjacentHTML(
				'beforeend',
				`<img 
					src="//i.4cdn.org/${sections[3]}/${sections[4].split('.')[0]}s.jpg"
					class="${i == 0 ? 'active' : ''}"
				/>`
			);
		});

		// Add the onclick event for each element
		[...upcoming_container.children].forEach((x, i) => {
			// On click switch media to the given index
			x.onclick = () => {
				upcoming_container.querySelector('.active').classList.remove('active');
				x.classList.toggle('active');

				current_index = i;
				change_video();
			}
		});
	};

	// Variables
	let running = false,
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
		reply_container,
		upcoming_container;
	
	// Insert the overlay
	document.body.insertAdjacentHTML('afterbegin',
		`<div class="rc-fullscreen-video hidden" id="vc_con">
			<video controls autoplay></video>
			<img />
			<div class="rc-reply-container hidden"></div>
			<div class="rc-reply-container rc-upcoming hidden"></div>
		</div>`
	);

	// Assign video_container element to variable
	video_container = document.getElementById('vc_con');

	// Assign child nodes to the variables
	video = video_container.childNodes[1];
	image = video_container.childNodes[3];
	reply_container = video_container.childNodes[5];
	upcoming_container = video_container.childNodes[7]
	
	// If the current page can use the upcoming view, use it
	if (!window.location.href.includes('yuki.la')) init_upcoming();
	
	// Init
	change_video();
	if (is_video) video.pause();

	// On video end event...
	video.onended = () => {
		// If they have autoroll enabled...
		if (autoroll) {
			// Roll over to the next video...
			current_index == all_videos.length - 1 ? current_index = 0 : current_index++;
			change_video()
		}
	}

	document.onkeydown = (e) => {
		// Textarea is used for creating posts, ensure that any keydown events
		// Aren't recognised whilst focused on it
		if (document.activeElement.tagName === 'TEXTAREA') return;

		// Key code
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
				document.body.style.overflowY = 'unset';
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
				[reply_container, upcoming_container].forEach((x) => {
					x.classList.toggle('hidden');
				});
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
