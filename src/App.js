import './App.css';
import React, { useEffect, useState } from 'react';
import { RussiaMap } from './RussiaMap';
import myData from './StaticData/data.json'


function App() {
    const [isPinClicked, togglePin] = useState(false);

    useEffect(() => {
        // const svgElem = document.getElementById('svg2');

        let oDiv = document.getElementById('svg2'); // объект dom, соответствующий svg
        let vbCX = 0;
        let vbCY = 0;
        let vbCW = 0;
        let vbCH = 0;
        let zoomVal = 0; // увеличивать и уменьшать накопленное значение
        let zoomStepSize = 20; // увеличивать и уменьшать размер шага каждого изменения 20
        let removeFlag = false; // Управление щелчком и перетаскиванием, распознавание движения мыши, когда не щелкают
        let startX = 0; // начальное значение x координата
        let startY = 0; // начальное значение координаты y
        let moveX = 0; // Количество горизонтального перемещения влево положительно
        let moveY = 0; // Величина вертикального движения вверх положительна
        let endX = 0; // Координата x конечного прибытия
        let endY = 0; // Координата y конечного прибытия
        let zoomW = 1001; // Начальное значение> zoomStepSize * 2 Точное текущее значение может быть получено после первой прокрутки
        let zoomH = 1001; // Начальное значение> zoomStepSize * 2 Точное текущее значение может быть получено после первой прокрутки
        let zoomX = 0;
        let zoomY = 0;

        // Событие колеса мыши
        function onMouseWheel (e) {
            let ev = e || window.event;
            let down = true;
            // ev.wheelDelta был определен, ev.wheelDelta <0 означает true для прокрутки вниз, false означает прокрутку вверх
            // ev.wheelDelta не определено, ev.detail> 0 означает true для прокрутки вниз, false означает прокрутку вверх
            // wheelDelta и detail прямо противоположны. В Firefox wheelDelta не определена и может использовать только детали.
            down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
            if (down) {
                zoomOut() // уменьшить масштаб
            } else {
                zoomIn(); // увеличить
            }
            if (ev.preventDefault) {
                ev.preventDefault();
            }
            return false
        }
        function zoomIn () {
            if (zoomW > zoomStepSize * 2 && zoomH > zoomStepSize * 2) {
                zoomVal += zoomStepSize;
                zoomTo('in');
            }
        }
        function zoomOut () {
            zoomVal -= zoomStepSize;
            if (zoomVal >= -zoomStepSize * 11) {
                zoomTo('out')
            } else {
                zoomVal = -zoomStepSize * 11; // Минимальная усадка до -220 не может быть уменьшена
            }
        }
        function zoomTo (flag) {
            // Получить текущую позицию viewBox до изменения
            getCurrentVB()
            // *********** Расчет каждого значения после увеличения и уменьшения начинается ***********
            if (flag === 'in') {
                zoomX = vbCX + zoomStepSize;
                zoomY = vbCY + zoomStepSize;
                zoomW = vbCW - zoomStepSize * 2;
                zoomH = vbCH - zoomStepSize * 2;
            } else {
                zoomX = vbCX - zoomStepSize;
                zoomY = vbCY - zoomStepSize;
                zoomW = vbCW + zoomStepSize * 2;
                zoomH = vbCH + zoomStepSize * 2;
            }
            // *********** Расчет каждого значения после увеличения и уменьшения масштаба закончился ***********
            // Присваиваем вычисленный результат viewBox для обновления текущей позиции просмотра
            oDiv.setAttributeNS(null, 'viewBox', zoomX + ' ' + zoomY + ' ' + zoomW + ' ' + zoomH);
            // Получить текущую позицию viewBox после изменения, чтобы гарантировать, что vbCX vbCY vbCW vbCH всегда является значением текущего viewBox
            endZoom();
        }
        function endZoom () {
            getCurrentVB();
            // Окончательные (x, y) координаты вида после последовательных изменений масштабирования записываются и используются для масштабирования и перетаскивания
            endX = vbCX;
            endY = vbCY;
        }

        // событие щелчка мыши
        function moveDownMouse (evt) {
            removeFlag = true;
            startX = parseInt (evt.clientX); // абсцисса текущей точки
            startY = parseInt (evt.clientY); // ордината выбранной в данный момент точки
        }
        // событие движения мыши
        function moveMouse (evt) {
            if (removeFlag) {
                oDiv.setAttributeNS(null, 'style', 'cursor: move');
                moveX = parseInt (evt.clientX) -startX; // текущая точка-исходная точка = количество движения
                moveY = parseInt (evt.clientY) -startY; // текущая точка-исходная точка = количество движения
                vbCX = endX - moveX;
                vbCY = endY - moveY;
                // Обновляем позицию просмотра, отображаемую текущим viewBox
                oDiv.setAttributeNS(null, 'viewBox', vbCX + ' ' + vbCY + ' ' + vbCW + ' ' + vbCH);
            }
        }
        // Отпускаем событие после щелчка мышью
        function moveUpMouse () {
            oDiv.setAttributeNS(null, 'style', 'cursor: default');
            // Окончательные (x, y) координаты вида после серии движений записываются и используются для масштабирования и перетаскивания
            endX = vbCX;
            endY = vbCY;
            removeFlag = false;
        }

        // Получить информацию о позиции текущего представления VB
        function getCurrentVB () {
            vbCX = parseFloat(oDiv.viewBox.animVal.x)
            vbCY = parseFloat(oDiv.viewBox.animVal.y)
            vbCW = parseFloat(oDiv.viewBox.animVal.width)
            vbCH = parseFloat(oDiv.viewBox.animVal.height)
        }
        // Привязываем события к dom узлам с учетом совместимости
        function addEvent (obj, xEvent, fn) {
            if (obj.attachEvent) {
                obj.attachEvent('on' + xEvent, fn)
            } else {
                obj.addEventListener(xEvent, fn, false)
            }
        }

        addEvent(oDiv, 'mousewheel', onMouseWheel);
        addEvent(oDiv, 'DOMMouseScroll', onMouseWheel);
        oDiv.addEventListener('mousedown', moveDownMouse, false)
        oDiv.addEventListener('mouseup', moveUpMouse, false)
        oDiv.addEventListener('mousemove', moveMouse, false)
    }, [])

    useEffect(() => {
        const menuElems = document.querySelectorAll('.left-menu a');
        menuElems.forEach(item => {
            item.addEventListener('mouseenter', (event) => {
                const self = event.target;
                const selfClass = self.getAttribute('href');
                const color = self.dataset.color;
                const currentElem = document.querySelector(`.mapRegion a[href="${selfClass}"]`);
                const currentPolygon = currentElem.querySelectorAll('polygon');
                const currentPath = currentElem.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                self.classList.add('active');

                event.preventDefault();
                event.stopPropagation();
            })


            item.addEventListener('mouseleave', (event) => {
                const self = event.target;
                const selfClass = self.getAttribute('href');
                const currentElem = document.querySelector(`.mapRegion a[href="${selfClass}"]`);
                const currentPolygon = currentElem.querySelectorAll('polygon');
                const currentPath = currentElem.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = '');
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = '');
                self.classList.remove('active');

                event.preventDefault();
                event.stopPropagation();
            })
        })

        return menuElems.forEach(item => {
            item.removeEventListener('mouseenter', null);
            item.removeEventListener('mouseleave', null);
        })
    }, [])

    useEffect(() => {
        const menuElems = document.querySelectorAll('.map a');
        menuElems.forEach(item => {
            item.addEventListener('mouseenter', event => {
                const self = event.target;
                const selfClass = self.getAttribute('href');
                const currentElem = document.querySelector(`.left-menu a[href="${selfClass}"]`);
                const color = currentElem.dataset.color;
                const currentPolygon = self.querySelectorAll('polygon');
                const currentPath = self.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                if (currentElem) currentElem.classList.add('active');

                event.preventDefault();
                event.stopPropagation();
            })

            item.addEventListener('mouseleave', event => {
                const self = event.target;
                const selfClass = self.getAttribute('href');
                const currentElem = document.querySelector(`.left-menu a[href="${selfClass}"]`);
                const currentPolygon = self.querySelectorAll('polygon');
                const currentPath = self.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = ``);
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = ``);
                if (currentElem) currentElem.classList.remove('active');

                event.preventDefault();
                event.stopPropagation();
            })
        })

        return menuElems.forEach(item => {
            item.removeEventListener('mouseenter', null);
            item.removeEventListener('mouseleave', null);
        })
    }, [])

    useEffect(() => {
        const pinsElems = document.querySelectorAll("a[href='#SVGPIN']");
        pinsElems.forEach(item => {
            item.addEventListener('mouseenter', event => {
                const self = event.target;
                const color = item.dataset.color;
                const currentPolygon = self.querySelectorAll('polygon');
                const currentPath = self.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = `fill: ${color}; stroke-width: 2px`);
                item.classList.add('active');

                const svgContainer = document.getElementById('svg2');
                svgContainer.removeChild(item);
                svgContainer.appendChild(item);

                event.preventDefault();
                event.stopPropagation();
            })

            item.addEventListener('mouseleave', event => {
                const self = event.target;
                const currentPolygon = self.querySelectorAll('polygon');
                const currentPath = self.querySelectorAll('path');
                if (currentPolygon) currentPolygon.forEach(elem => elem.style.cssText = ``);
                if (currentPath) currentPath.forEach(elem => elem.style.cssText = ``);
                item.classList.remove('active');

                event.preventDefault();
                event.stopPropagation();
            })

            item.addEventListener('click', event => {
                const aboutDiv = document.getElementsByClassName('textAboutHide')[0];
                const textContater = document.createElement("p");
                const dataId = item.getAttribute('data-id');
                const newText = myData.find(item => item.id === dataId);
                const text = document.createTextNode(newText.info);
                textContater.appendChild(text);
                aboutDiv.innerHTML = '';
                aboutDiv.appendChild(textContater);
                aboutDiv.classList.add('textAbout')

                togglePin(true);

                const aboutDivBackground = document.getElementsByClassName('textAboutBackgroundHide')[0];
                aboutDivBackground.classList.add('textAboutBackground')

                event.preventDefault();
                event.stopPropagation();
            })
        })

        return pinsElems.forEach(item => {
            item.removeEventListener('mouseenter', null);
            item.removeEventListener('mouseleave', null);
            item.removeEventListener('click', null);
        })
    }, [])

  return (
    <div className="App">
         <div className="left-menu-container">
             <div className="menuBackground" />
             <div className="left-menu">
                 <ul>
                     <li id="Sevkav">
                         <a href="#Sevkav" data-id="1" className="map-tab-link" data-color="#ed9988">
                             Северо-Кавказский федеральный округ
                         </a>

                         <ul>
                             <li id="STA">
                                 <a href="#STA" data-id="1.1" className="map-tab-link" data-color="#ed9988">
                                     STA
                                 </a>
                             </li>
                             <li id="CE">
                                 <a href="#CE" data-id="1.2" className="map-tab-link" data-color="#ed9988">
                                     CE
                                 </a>
                             </li>
                             <li  id="KB">
                                 <a href="#KB" data-id="1.3" className="map-tab-link" data-color="#ed9988">
                                     KB
                                 </a>
                             </li>
                             <li  id="KC">
                                 <a href="#KC" data-id="1.4" className="map-tab-link" data-color="#ed9988">
                                     KC
                                 </a>
                             </li>
                             <li  id="SE">
                                 <a href="#SE" data-id="1.5" className="map-tab-link" data-color="#ed9988">
                                     SE
                                 </a>
                             </li>
                             <li  id="IN">
                                 <a href="#IN" data-id="1.6" className="map-tab-link" data-color="#ed9988">
                                     IN
                                 </a>
                             </li>
                             <li  id="DA">
                                 <a href="#DA" data-id="1.7" className="map-tab-link" data-color="#ed9988">
                                     DA
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Southern">
                         <a href="#Southern" data-id="2" className="map-tab-link" data-color="#ffd17f">
                             Южный федеральный округ
                         </a>

                         <ul>
                             <li  id="KDA">
                                 <a href="#KDA" data-id="2.1" className="map-tab-link" data-color="#ffd17f">
                                     KDA
                                 </a>
                             </li>
                             <li  id="AD">
                                 <a href="#AD" data-id="2.2" className="map-tab-link" data-color="#ffd17f">
                                     AD
                                 </a>
                             </li>
                             <li  id="ROS">
                                 <a href="#ROS" data-id="2.3" className="map-tab-link" data-color="#ffd17f">
                                     ROS
                                 </a>
                             </li>
                             <li  id="VGG">
                                 <a href="#VGG" data-id="2.4" className="map-tab-link" data-color="#ffd17f">
                                     VGG
                                 </a>
                             </li>
                             <li  id="AST">
                                 <a href="#AST" data-id="2.5" className="map-tab-link" data-color="#ffd17f">
                                     AST
                                 </a>
                             </li>
                             <li  id="KL">
                                 <a href="#KL" data-id="2.6" className="map-tab-link" data-color="#ffd17f">
                                     KL
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Central">
                         <a href="#Central" data-id="3" className="map-tab-link" data-color="#9ed765">
                             Центральный федеральный округ
                         </a>

                         <ul>
                             <li  id="KOS">
                                 <a href="#KOS" data-id="3.1" className="map-tab-link" data-color="#9ed765">
                                     KOS
                                 </a>
                             </li>
                             <li  id="YAR">
                                 <a href="#YAR" data-id="3.2" className="map-tab-link" data-color="#9ed765">
                                     YAR
                                 </a>
                             </li>
                             <li  id="IVA">
                                 <a href="#IVA" data-id="3.3" className="map-tab-link" data-color="#9ed765">
                                     IVA
                                 </a>
                             </li>
                             <li  id="VLA">
                                 <a href="#VLA" data-id="3.4" className="map-tab-link" data-color="#9ed765">
                                     VLA
                                 </a>
                             </li>
                             <li  id="ORL">
                                 <a href="#ORL" data-id="3.5" className="map-tab-link" data-color="#9ed765">
                                     ORL
                                 </a>
                             </li>
                             <li  id="">
                                 <a href="#LIP" data-id="3.6" className="map-tab-link" data-color="#9ed765">
                                     LIP
                                 </a>
                             </li>
                             <li  id="TUL">
                                 <a href="#TUL" data-id="3.7" className="map-tab-link" data-color="#9ed765">
                                     TUL
                                 </a>
                             </li>
                             <li  id="RYA">
                                 <a href="#RYA" data-id="3.8" className="map-tab-link" data-color="#9ed765">
                                     RYA
                                 </a>
                             </li>
                             <li  id="TAM">
                                 <a href="#TAM" data-id="3.9" className="map-tab-link" data-color="#9ed765">
                                     TAM
                                 </a>
                             </li>
                             <li  id="KLU">
                                 <a href="#KLU" data-id="3.10" className="map-tab-link" data-color="#9ed765">
                                     KLU
                                 </a>
                             </li>
                             <li  id="NGR">
                                 <a href="#NGR" data-id="3.11" className="map-tab-link" data-color="#9ed765">
                                     NGR
                                 </a>
                             </li>
                             <li  id="TVE">
                                 <a href="#TVE" data-id="3.12" className="map-tab-link" data-color="#9ed765">
                                     TVE
                                 </a>
                             </li>
                             <li  id="MOS">
                                 <a href="#MOS" data-id="3.13" className="map-tab-link" data-color="#9ed765">
                                     MOS
                                 </a>
                             </li>
                             <li  id="mow">
                                 <a href="#mow" data-id="3.14" className="map-tab-link" data-color="#9ed765">
                                     mow
                                 </a>
                             </li>
                             <li  id="BRY">
                                 <a href="#BRY" data-id="3.15" className="map-tab-link" data-color="#9ed765">
                                     BRY
                                 </a>
                             </li>
                             <li  id="SMO">
                                 <a href="#SMO" data-id="3.16" className="map-tab-link" data-color="#9ed765">
                                     SMO
                                 </a>
                             </li>
                             <li  id="KRS">
                                 <a href="#KRS" data-id="3.17" className="map-tab-link" data-color="#9ed765">
                                     KRS
                                 </a>
                             </li>
                             <li  id="BEL">
                                 <a href="#BEL" data-id="3.18" className="map-tab-link" data-color="#9ed765">
                                     BEL
                                 </a>
                             </li>
                             <li  id="VOR">
                                 <a href="#VOR" data-id="3.19" className="map-tab-link" data-color="#9ed765">
                                     VOR
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Volga">
                         <a href="#Volga" data-id="4" className="map-tab-link" data-color="#00d990">
                             Приволжский федеральный округ
                         </a>

                         <ul>
                             <li  id="NIZ">
                                 <a href="#NIZ" data-id="4.1" className="map-tab-link" data-color="#00d990">
                                     NIZ
                                 </a>
                             </li>
                             <li  id="KIR">
                                 <a href="#KIR" data-id="4.2" className="map-tab-link" data-color="#00d990">
                                     KIR
                                 </a>
                             </li>
                             <li  id="UD">
                                 <a href="#UD" data-id="4.3" className="map-tab-link" data-color="#00d990">
                                     UD
                                 </a>
                             </li>
                             <li  id="PER">
                                 <a href="#PER" data-id="4.4" className="map-tab-link" data-color="#00d990">
                                     PER
                                 </a>
                             </li>
                             <li  id="BA">
                                 <a href="#BA" data-id="4.5" className="map-tab-link" data-color="#00d990">
                                     BA
                                 </a>
                             </li>
                             <li  id="ORE">
                                 <a href="#ORE" data-id="4.6" className="map-tab-link" data-color="#00d990">
                                     ORE
                                 </a>
                             </li>
                             <li  id="CU">
                                 <a href="#CU" data-id="4.7" className="map-tab-link" data-color="#00d990">
                                     CU
                                 </a>
                             </li>
                             <li  id="ME">
                                 <a href="#ME" data-id="4.8" className="map-tab-link" data-color="#00d990">
                                     ME
                                 </a>
                             </li>
                             <li  id="ULY">
                                 <a href="#ULY" data-id="4.9" className="map-tab-link" data-color="#00d990">
                                     ULY
                                 </a>
                             </li>
                             <li  id="SAM">
                                 <a href="#SAM" data-id="4.10" className="map-tab-link" data-color="#00d990">
                                     SAM
                                 </a>
                             </li>
                             <li  id="TA">
                                 <a href="#TA" data-id="4.11" className="map-tab-link" data-color="#00d990">
                                     TA
                                 </a>
                             </li>
                             <li  id="PNZ">
                                 <a href="#PNZ" data-id="4.12" className="map-tab-link" data-color="#00d990">
                                     PNZ
                                 </a>
                             </li>
                             <li  id="SAR">
                                 <a href="#SAR" data-id="4.13" className="map-tab-link" data-color="#00d990">
                                     SAR
                                 </a>
                             </li>
                             <li  id="MO">
                                 <a href="#MO" data-id="4.14" className="map-tab-link" data-color="#00d990">
                                     MO
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Northwestern">
                         <a href="#Northwestern" data-id="5" className="map-tab-link" data-color="#4d94db">
                             Северо-Западный федеральный округ
                         </a>

                         <ul>
                             <li  id="NEN">
                                 <a href="#NEN" data-id="5.1" className="map-tab-link" data-color="#4d94db">
                                     NEN
                                 </a>
                             </li>
                             <li  id="MUR">
                                 <a href="#MUR" data-id="5.2" className="map-tab-link" data-color="#4d94db">
                                     MUR
                                 </a>
                             </li>
                             <li  id="PSK">
                                 <a href="#PSK" data-id="5.3" className="map-tab-link" data-color="#4d94db">
                                     PSK
                                 </a>
                             </li>
                             <li  id="KGD">
                                 <a href="#KGD" data-id="5.4" className="map-tab-link" data-color="#4d94db">
                                     KGD
                                 </a>
                             </li>
                             <li  id="LEN">
                                 <a href="#LEN" data-id="5.5" className="map-tab-link" data-color="#4d94db">
                                     LEN
                                 </a>
                             </li>
                             <li  id="PETER">
                                 <a href="#PETER" data-id="5.6" className="map-tab-link" data-color="#4d94db">
                                     PETER
                                 </a>
                             </li>
                             <li  id="KR">
                                 <a href="#KR" data-id="5.7" className="map-tab-link" data-color="#4d94db">
                                     KR
                                 </a>
                             </li>
                             <li  id="ARK">
                                 <a href="#ARK" data-id="5.8" className="map-tab-link" data-color="#4d94db">
                                     ARK
                                 </a>
                             </li>
                             <li  id="VLG">
                                 <a href="#VLG" data-id="5.9" className="map-tab-link" data-color="#4d94db">
                                     VLG
                                 </a>
                             </li>
                             <li  id="KO">
                                 <a href="#KO" data-id="5.10" className="map-tab-link" data-color="#4d94db">
                                     KO
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Urals">
                         <a href="#Urals" data-id="6" className="map-tab-link" data-color="#5d77c7">
                             Уральский федеральный округ
                         </a>

                         <ul>
                             <li  id="YAN">
                                 <a href="#YAN" data-id="6.1" className="map-tab-link" data-color="#5d77c7">
                                     YAN
                                 </a>
                             </li>
                             <li  id="KHM">
                                 <a href="#KHM" data-id="6.2" className="map-tab-link" data-color="#5d77c7">
                                     KHM
                                 </a>
                             </li>
                             <li  id="TYU">
                                 <a href="#TYU" data-id="6.3" className="map-tab-link" data-color="#5d77c7">
                                     TYU
                                 </a>
                             </li>
                             <li  id="CHE">
                                 <a href="#CHE" data-id="6.4" className="map-tab-link" data-color="#5d77c7">
                                     CHE
                                 </a>
                             </li>
                             <li  id="SVE">
                                 <a href="#SVE" data-id="6.5" className="map-tab-link" data-color="#5d77c7">
                                     SVE
                                 </a>
                             </li>
                             <li  id="KGN">
                                 <a href="#KGN" data-id="6.6" className="map-tab-link" data-color="#5d77c7">
                                     KGN
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Siberia">
                         <a href="#Siberia" data-id="7" className="map-tab-link" data-color="#6250b9">
                             Сибирский федеральный округ
                         </a>

                         <ul>
                             <li  id="KYA">
                                 <a href="#KYA" data-id="7.1" className="map-tab-link" data-color="#6250b9">
                                     KYA
                                 </a>
                             </li>
                             <li  id="OMS">
                                 <a href="#OMS" data-id="7.2" className="map-tab-link" data-color="#6250b9">
                                     OMS
                                 </a>
                             </li>
                             <li  id="TOM">
                                 <a href="#TOM" data-id="7.3" className="map-tab-link" data-color="#6250b9">
                                     TOM
                                 </a>
                             </li>
                             <li  id="NVS">
                                 <a href="#NVS" data-id="7.4" className="map-tab-link" data-color="#6250b9">
                                     NVS
                                 </a>
                             </li>
                             <li  id="ALT">
                                 <a href="#ALT" data-id="7.5" className="map-tab-link" data-color="#6250b9">
                                     ALT
                                 </a>
                             </li>
                             <li  id="KEM">
                                 <a href="#KEM" data-id="7.6" className="map-tab-link" data-color="#6250b9">
                                     KEM
                                 </a>
                             </li>
                             <li  id="KK">
                                 <a href="#KK" data-id="7.7" className="map-tab-link" data-color="#6250b9">
                                     KK
                                 </a>
                             </li>
                             <li  id="AL">
                                 <a href="#AL" data-id="7.8" className="map-tab-link" data-color="#6250b9">
                                     AL
                                 </a>
                             </li>
                             <li  id="TY">
                                 <a href="#TY" data-id="7.9" className="map-tab-link" data-color="#6250b9">
                                     TY
                                 </a>
                             </li>
                             <li  id="IRK">
                                 <a href="#IRK" data-id="7.10" className="map-tab-link" data-color="#6250b9">
                                     IRK
                                 </a>
                             </li>
                             <li  id="BU">
                                 <a href="#BU" data-id="7.11" className="map-tab-link" data-color="#6250b9">
                                     BU
                                 </a>
                             </li>
                             <li  id="Zabaykalsky">
                                 <a href="#Zabaykalsky" data-id="7.12" className="map-tab-link" data-color="#6250b9">
                                     Zabaykalsky
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="Far_Eastern">
                         <a href="#Far_Eastern" data-id="8" className="map-tab-link" data-color="#522e9a">
                             Дальневосточный федеральный округ
                         </a>

                         <ul>
                             <li  id="AMU">
                                 <a href="#AMU" data-id="8.1" className="map-tab-link" data-color="#522e9a">
                                     AMU
                                 </a>
                             </li>
                             <li  id="YEV">
                                 <a href="#YEV" data-id="8.2" className="map-tab-link" data-color="#522e9a">
                                     YEV
                                 </a>
                             </li>
                             <li  id="PRI">
                                 <a href="#PRI" data-id="8.3" className="map-tab-link" data-color="#522e9a">
                                     PRI
                                 </a>
                             </li>
                             <li  id="MAG">
                                 <a href="#MAG" data-id="8.4" className="map-tab-link" data-color="#522e9a">
                                     MAG
                                 </a>
                             </li>
                             <li  id="Sakhalin_island">
                                 <a href="#Sakhalin_island" data-id="8.5" className="map-tab-link" data-color="#522e9a">
                                     Sakhalin_island
                                 </a>
                             </li>
                             <li  id="Kuril_Islands">
                                 <a href="#Kuril_Islands" data-id="8.6" className="map-tab-link" data-color="#522e9a">
                                     Kuril_Islands
                                 </a>
                             </li>
                             <li  id="KAM">
                                 <a href="#KAM" data-id="8.7" className="map-tab-link" data-color="#522e9a">
                                     KAM
                                 </a>
                             </li>
                             <li  id="CHU">
                                 <a href="#CHU" data-id="8.8" className="map-tab-link" data-color="#522e9a">
                                     CHU
                                 </a>
                             </li>
                             <li  id="KHA">
                                 <a href="#KHA" data-id="8.9" className="map-tab-link" data-color="#522e9a">
                                     KHA
                                 </a>
                             </li>
                             <li  id="SA">
                                 <a href="#SA" data-id="8.10" className="map-tab-link" data-color="#522e9a">
                                     SA
                                 </a>
                             </li>
                         </ul>
                     </li>
                     <li  id="KRM">
                         <a href="#KRM" data-id="9" className="map-tab-link" data-color="#522e9a">
                             Крым
                         </a>
                     </li>
                     <li  id="SEV">
                         <a href="#SEV" data-id="10" className="map-tab-link" data-color="#522e9a">
                             Севастополь
                         </a>
                     </li>
                 </ul>
             </div>
         </div>
        <div className="iconsContainer">
            <RussiaMap data={myData} />
        </div>
        <div className="textAboutBackgroundHide" />
        <div className="textAboutHide" />
    </div>
  );
}

export default App;
