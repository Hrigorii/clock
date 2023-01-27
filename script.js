window.onload = function () {


	function showClock(target) {

		const clock = document.createElement('div');
		clock.className = 'clock';
		clock.style.backgroundImage = './strela 2.png';
		const hour = document.createElement('img');
		hour.className = 'clock__hour';
		hour.src = './strela 2.png';
		const min = document.createElement('img');
		min.className = 'clock__min';
		min.src = './strela 3.png';
		const sec = document.createElement('img');
		sec.className = 'clock_sec';
		sec.src = './strela 1.png';
		clock.append(hour);
		clock.append(min);
		clock.append(sec);
		target.append(clock);
	}

	function currentTime(target, timestamp) {

		/////////////////////////////рисуем часы //////////////////////////////////

		showClock(target);

		/////////////////////////////устанавливаем начальное время //////////////////////////////////

		const currentTime = timestamp ? new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5]) : new Date();
		let sec = currentTime.getSeconds();
		let min = currentTime.getMinutes() * 6;
		let hour = currentTime.getHours() * 30 + (currentTime.getMinutes() / 12) * 6

		const secArrow = target.querySelector('.clock_sec');
		const minArrow = target.querySelector('.clock__min');
		const hourArrow = target.querySelector('.clock__hour');

		function step() {
			secArrow.style.transform = `rotate(${sec}deg)`;
			minArrow.style.transform = `rotate(${min}deg)`;
			hourArrow.style.transform = `rotate(${hour}deg)`;
			if (sec === 360) {
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
				if (min === 360) {
					min = 0;
					if (hour === 360)
						hour = 0;
				}
			}
			sec += 6;

		}

		///////////////////////////// запускаем время //////////////////////////////////

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
	}

	function createClockItem(sity, timestamp) {
		const div = document.createElement('div');
		div.className = 'wrapper-item';
		const close = document.createElement('div');
		close.className = 'close';
		close.innerHTML = '[X]';
		div.append(close);
		const title = document.createElement('div');
		title.className = 'wrapper-item__title';
		title.innerHTML = sity;
		div.append(title);
		const item = document.createElement('div');
		item.className = 'wrapper-item__item';
		div.dataset.clockId = currentTime(item, timestamp);
		div.append(item)
		items.append(div);
	}

	function clearShowVar() {
		Array.from(showVar.children).forEach(item => item.remove());
		showVar.removeEventListener('click', send);
	}

	/////////////////////////////отображаем свое время //////////////////////////////////

	currentTime(selfTime.querySelector('.wrapper-item__item'));
	// async function getMyCity() {
	// 	const response = await fetch('https://ipapi.co/json/');
	// 	const data = await response.json();
	// 	selfTime.querySelector('.wrapper-item__title').innerHTML = data.city
	// }

	// getMyCity();

	/////////////////////////////вешаем слушатели событий для удаления болка с часами //////////////////////////////////

	document.querySelector('.items').addEventListener('click', (event) => {
		if (event.target.className === 'close active') {
			clearInterval(event.target.closest('.wrapper-item').dataset.clockId);
			event.target.closest('.wrapper-item').remove();
		}
		if (event.target.closest('div').className === 'clock') {
			event.target.closest('div').parentElement.parentElement.firstElementChild.classList.toggle('active');
		}
	})

	///////////////////////////// анимируем меню //////////////////////////////////

	const menuIcon = document.querySelector('.menu_icon');
	const menuBody = document.querySelector('.menu_body');
	if (menuIcon) {
		menuIcon.addEventListener('click', (event) => {
			document.body.classList.toggle('lock');
			menuIcon.classList.toggle('active-menu');
			menuBody.classList.toggle('active-menu');
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

		// очистка временного блока с городами

		clearShowVar();

		// удаление обработчика с болка с городами

		showVar.removeEventListener('click', send);

		// получение данных из формы

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

				// от сервера получаем список найденных городов

				.then(sitydata => {

					// показываем список городов

					showVar.classList.add('active');
					sitydata.map((sity, index) => {
						createVarItem(sity, index);
					});

					// вешаем слушатель на список

					showVar.addEventListener('click', function send(event) {

						// получаем нужный город

						let currentSity = sitydata[event.target.closest('div').dataset.varId];
						fetch(`https://api.ipgeolocation.io/timezone?apiKey=7b49894e5e6642c0820c0b69f287b426&lat=${currentSity.lat}&long=${currentSity.lon}`)
							.then(response => response.json())
							.then(tdata => {
								const sityName = currentSity.display_name.match(/(\D*?),/)[1];
								const date = tdata.date_time.replace(/-|:|\s/g, ',').split(',').map(item => +item);

								createClockItem(sityName, date);
							})
						clearShowVar()
						inputForm.reset();
						showVar.removeEventListener('click', send);
						showVar.classList.remove('active');
						// menuIcon.classList.remove('active-menu');
						// menuBody.classList.remove('active-menu');
						// document.body.classList.remove('lock');
					},)

				})
		}
	})

}


