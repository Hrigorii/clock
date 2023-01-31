window.onload = function () {


	function showClock(target) {

		const clock = document.createElement('div');
		clock.className = 'clock';
		const hour = document.createElement('img');
		hour.className = 'clock__hour';
		hour.src = './img/strela 2.png';
		const min = document.createElement('img');
		min.className = 'clock__min';
		min.src = './img/strela 3.png';
		const sec = document.createElement('img');
		sec.className = 'clock__sec';
		sec.src = './img/strela 1.png';
		clock.append(hour);
		clock.append(min);
		clock.append(sec);
		target.append(clock);
	}

	function createClock(target, timestamp) {

		showClock(target);

		const currentTime = timestamp ? new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5]) : new Date();
		let sec = currentTime.getSeconds();
		let min = currentTime.getMinutes() * 6;
		let hour = currentTime.getHours() * 30 + (currentTime.getMinutes() / 12) * 6

		const secArrow = target.querySelector('.clock__sec');
		const minArrow = target.querySelector('.clock__min');
		const hourArrow = target.querySelector('.clock__hour');

		function step() {
			secArrow.style.transform = `rotate(${sec}deg)`;
			minArrow.style.transform = `rotate(${min}deg)`;
			hourArrow.style.transform = `rotate(${hour}deg)`;
			if (sec > 360) {
				sec = 0;
				min += 6;
				switch (min) {
					case (72): hour += 6;
						break;
					case (144): hour += 6;
						break;
					case (216): hour += 6;
						break;
					case (290): hour += 6;
						break;
					case (360): hour += 6;
						break;
				}
				if (min > 360) {
					min = 0;
					if (hour > 360)
						hour = 0;
				}
			}
			sec += 6;
		}

		return setInterval(step, 1000);
	}

	function createVarItem(sity, id) {
		const div = document.createElement('div');
		div.className = 'show-var__item';
		div.dataset.varId = id;
		div.innerHTML = `
		<h2>${sity.display_name}</h2>
		<span>lat:${sity.lat}</span>
		<span>lon:${sity.lon}</span
		><span>type:${sity.type}</span>
		 `;
		showVar.append(div);
		return div;
	}

	function createClockItem(sity, timestamp) {
		const div = document.createElement('div');
		div.className = 'clock-item';
		const close = document.createElement('div');
		close.className = 'close';
		close.innerHTML = 'X';
		div.append(close);
		const title = document.createElement('div');
		title.className = 'clock-item__title';
		title.innerHTML = sity.name;
		div.append(title);
		const item = document.createElement('div');
		item.className = 'clock-item__item';
		div.dataset.clockId = createClock(item, timestamp);
		div.dataset.blockId = sity.id;
		div.append(item)
		items.append(div);
	}

	function clearShowVar() {
		Array.from(showVar.children).forEach(item => item.remove());
	}

	function clearAll() {
		clearShowVar();
		inputForm.sity.value = '';
		inputForm.lat.value = '';
		inputForm.lon.value = '';
		showVar.classList.remove('active');
	}

	function errorShow(error) {
		console.error(error);
		showError.innerHTML = `Ooops... something wrong try again`;
		showError.classList.add('active');
	}

	function clearError() {
		showError.innerHTML = '';
		showError.classList.remove('active');
	}

	function autosend(lat, lon, sity) {
		fetch(`https://api.ipgeolocation.io/timezone?apiKey=7b49894e5e6642c0820c0b69f287b426&lat=${lat}&long=${lon}`)

			.then(response => {
				if (response.ok) {
					localStorage.setItem(sity.place_id, JSON.stringify({ ...sity }));
				}
				return response.json();
			})
			.then(tdata => {
				const sityName = {
					name: sity.display_name.match(/(\D*?),/)[1],
					id: sity.place_id,
				};
				const date = tdata.date_time.replace(/-|:|\s/g, ',').split(',').map(item => +item);

				createClockItem(sityName, date);
			})
			.catch(error => errorShow(error));

		clearAll();

		// menuIcon.classList.remove('active-menu');
		// menuBody.classList.remove('active-menu');
		// document.body.classList.remove('lock');
	}

	async function getMyCity() {
		try {
			const response = await fetch('https://ipapi.co/json/');
			const data = await response.json();
			if (!data.city || data.city === '') {
				throw new Error('response has no sity name');
			}
			selfTime.querySelector('.clock-item__title').innerHTML = data.city;
		} catch (error) {
			console.error(error.message);
			selfTime.querySelector('.clock-item__title').innerHTML = 'Your Time';
		}
	}

	/////////////////////////////отображаем свое время //////////////////////////////////

	createClock(selfTime.querySelector('.clock-item__item'));

	getMyCity();

	/////////////////////////////отображаем сохраненные в localestorage часы //////////////////////////////////

	if (localStorage.length > 0) {
		let allKeys = Object.keys(localStorage);

		allKeys.map(id => {
			const localeData = JSON.parse(localStorage[id]);

			if (+id === localeData.place_id) {
				// API банит запросы интервалом менее 2 с
				setTimeout(() => {
					try {
						autosend(localeData.lat, localeData.lon, localeData);
					} catch (error) {
						console.error(error);
					}
				}, 2000);
			}
		})
	}

	/////////////////////////////вешаем слушатели событий для удаления болка с часами //////////////////////////////////

	document.querySelector('.items').addEventListener('click', (event) => {

		if (event.target.className === 'close active') {
			const selectedClock = event.target.closest('.clock-item');
			selectedClock.classList.add('deleted');
			setTimeout(() => {
				localStorage.removeItem(selectedClock.dataset.blockId);
				clearInterval(selectedClock.dataset.clockId);
				selectedClock.remove();
				console.log('deleted');
			}, 1000)
		}

		if (event.target.closest('div').className === 'clock') {
			event.target.closest('div').parentElement.parentElement.firstElementChild.classList.toggle('active');
		}
	})

	///////////////////////////// анимируем меню //////////////////////////////////

	const menuIcon = document.querySelector('.menu__icon');
	const menuBody = document.querySelector('.menu__body');

	if (menuIcon) {
		menuIcon.addEventListener('click', (event) => {
			document.body.classList.toggle('lock');
			menuIcon.classList.toggle('active-menu');
			menuBody.classList.toggle('active-menu');
			clearAll();
			clearError();
		})
	}

	cityName.addEventListener('change', () => {
		document.forms.inputForm.sity.disabled = false;
		document.forms.inputForm.lat.disabled = true;
		document.forms.inputForm.lon.disabled = true;
	})

	coords.addEventListener('change', () => {
		document.forms.inputForm.sity.setAttribute('disabled', true);
		document.forms.inputForm.lat.disabled = false;
		document.forms.inputForm.lon.disabled = false;
	})


	/////////////////////////////////////////// вешаем слушатель на кнопку отправить /////////////////////

	send.addEventListener('click', (event) => {
		event.preventDefault();
		clearShowVar();
		clearError();

		const inputForm = document.forms.inputForm;
		const target = document.querySelectorAll('input[type="radio"]');
		const [checedTarget] = Array.from(target).filter(target => target.checked);
		let url;

		if (checedTarget.value === 'cityName') {
			if (inputForm.sity.value.length > 1)
				url = `https://geocode.maps.co/search?city=${inputForm.sity.value}`;
		} else if (checedTarget.value === 'coords') {
			url = `https://geocode.maps.co/reverse?lat=${inputForm.lat.value}&lon=${inputForm.lon.value}`;
		}
		if (url) {
			fetch(url)
				.then(response => response.json())
				.then(sitydata => {

					if (sitydata.length !== undefined) {
						showVar.classList.add('active');
						sitydata.map(sity => {
							createVarItem(sity, sity.place_id).addEventListener('click', function sendData(event) {
								let [currentSity] = sitydata.filter(sity => {
									return sity.place_id === +event.target.closest('div').dataset.varId
								})
								autosend(currentSity.lat, currentSity.lon, currentSity);
							},);
						});
					} else {
						autosend(sitydata.lat, sitydata.lon, sitydata);
					}
				})
				.catch(error => errorShow(error));
		}
	})
}


