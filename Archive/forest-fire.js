
const htmlMarker1 = {
    content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-red-1.png);background-size:contain;"></div>',
    size: N.Size(40, 40),
    anchor: N.Point(20, 20)
},
    htmlMarker2 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-red-2.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker3 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-red-3.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker4 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-red-4.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker5 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-red-5.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    };

const map = new naver.maps.Map('map', {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
    },
    mapTypeControl: true,
    mapTypeId: naver.maps.MapTypeId.TERRAIN
});

const gradeNames = [, '낮음', '보통', '높음', '매우높음'];
const markers = [], clusterMarkers = [];

window.onload = function () {
    showMyPosition(map);

    $("#search-input").on('input', function () {
        const query = $(this).val();
        const suggestions = $("#search-suggestions");
        loadSearchResults(query, myPosition, suggestions);
    });

    const messages = $('#nav-alerts');
    loadDisasterMessages(DisaterMessageType.FOREST_FIRE, messages);

    showCharts();
};

function createMap() {
    showRecords();

    window.initmap = createMap;
}

function clearMarkers() {
    for (const marker of markers) {
        marker.setMap(null);
    }

    for (const marker of clusterMarkers) {
        marker.setMap(null);
    }

    markers.length = 0;
    clusterMarkers.length = 0;
}

function showRecords() {
    const url = new URL('https://www.safemap.go.kr/openApiService/data/getFrfireSttusData.do');
    url.searchParams.append('serviceKey', SAFEMAP_SERVICE_KEY);
    url.searchParams.append('pageNo', 26);
    url.searchParams.append('numOfRows', 200);
    url.searchParams.append('dataType', 'json');

    $.ajax({
        url: url.href,
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*'
        },
        success: function (response) {
            clearMarkers();

            for (const item of response.response.body.items) {
                const marker = new naver.maps.Marker({
                    position: convertFromEPSG3857(item.X, item.Y),
                    icon: {
                        url: 'images/fire_marker.png',
                        size: new naver.maps.Size(25, 36),
                        scaledSize: new naver.maps.Size(25, 36),
                        origin: new naver.maps.Point(0, 0),
                        anchor: new naver.maps.Point(12, 18),
                    }
                });

                markers.push(marker);

                naver.maps.Event.addListener(marker, 'click', function () {
                    onMarkerClick(marker, item);
                });
            }

            const clusteredMarker = new MarkerClustering({
                minClusterSize: 2,
                maxZoom: 10,
                map: map,
                markers: markers,
                disableClickZoom: false,
                gridSize: 120,
                icons: [htmlMarker1, htmlMarker2, htmlMarker3, htmlMarker4, htmlMarker5],
                indexGenerator: [10, 100, 200, 500, 1000],
                stylingFunction: function (clusterMarker, count) {
                    $(clusterMarker.getElement()).find('div:first-child').text(count);
                }
            });

            clusterMarkers.push(clusteredMarker);
        },
    });
}

function showForecasts() {
    const url = new URL('http://apis.data.go.kr/1400377/forestPoint/forestPointListSidoSearch');
    url.searchParams.append('serviceKey', PUBLIC_PORTAL_SERVICE_KEY);
    url.searchParams.append('_type', 'json');
    url.searchParams.append('numOfRows', 20);

    $.ajax({
        url: url.href,
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
        },
        success: function (response) {
            clearMarkers();

            for (const item of response.response.body.items.item) {
                const value = item.meanavg;
                let grade, regionName;

                if (value < 51) {
                    grade = 1;
                }
                else if (value <= 65) {
                    grade = 2;
                }
                else if (value <= 85) {
                    grade = 3;
                }
                else {
                    grade = 4;
                }

                switch (item.doname) {
                    case '서울특별시':
                        regionName = '서울';
                        break;
                    case '부산광역시':
                        regionName = '부산';
                        break;
                    case '대구광역시':
                        regionName = '대구';
                        break;
                    case '인천광역시':
                        regionName = '인천';
                        break;
                    case '광주광역시':
                        regionName = '광주';
                        break;
                    case '대전광역시':
                        regionName = '대전';
                        break;
                    case '울산광역시':
                        regionName = '울산';
                        break;
                    case '세종특별자치시':
                        regionName = '세종';
                        break;
                    case '경기도':
                        regionName = '경기';
                        break;
                    case '충청북도':
                        regionName = '충북';
                        break;
                    case '충청남도':
                        regionName = '충남';
                        break;
                    case '전라북도':
                        regionName = '전북';
                        break;
                    case '전라남도':
                        regionName = '전남';
                        break;
                    case '경상북도':
                        regionName = '경북';
                        break;
                    case '경상남도':
                        regionName = '경남';
                        break;
                    case '제주특별자치도':
                        regionName = '제주';
                        break;
                    case '강원특별자치도':
                        regionName = '강원';
                        break;
                }

                const position = regionPositions.get(regionName);

                const marker = new naver.maps.Marker({
                    map: map,
                    position: position,
                    icon: {
                        content: `<div class="forecast-circle fire-forecast-grade${grade}">
                                <small class="figure-caption">${regionName}</small><br>
                                <span>${gradeNames[grade]}<small> (${value})</small></span>
                            </div>`,
                        anchor: naver.maps.Point(32, 32)
                    }
                });

                markers.push(marker);
            }
        }
    });
}

function onMarkerClick(marker, item) {
    panTo(map, marker.getPosition());

    function parseDateTime(dateString, timeString) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1;
        const day = parseInt(dateString.substring(6, 8), 10);

        const hour = parseInt(timeString.substring(0, 2), 10);
        const minute = parseInt(timeString.substring(2, 4), 10);

        return new Date(year, month, day, hour, minute);
    }

    const startDate = item.OCCU_DATE;
    const startTime = item.OCCU_TM;
    const startDateTime = parseDateTime(startDate, startTime);

    const endYear = parseInt(item.END_YEAR);
    const endMonth = parseInt(item.END_MT);
    const endDay = parseInt(item.END_DE);
    const endTime = item.END_TM;
    let endHour = parseInt(endTime.substring(0, 2));
    let endMinute = parseInt(endTime.substring(2, 4));
    const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);

    const address = item.ADRES;
    const damagedArea = Number(item.AR).toLocaleString('en-US');
    const damagedAmount = parseInt(item.AMOUNT).toLocaleString('en-US');
    const cause = item.RESN;

    $('#fire-start-date').text(formatDate(startDateTime));
    $('#fire-start-time').text(formatTime(startDateTime));
    $('#fire-end-date').text(formatDate(endDateTime));
    $('#fire-end-time').text(formatTime(endDateTime));

    $('#fire-address').text(address);
    $('#fire-damaged-area').text(damagedArea);
    $('#fire-damaged-amount').text(damagedAmount);
    $('#fire-cause').text(cause);

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'block');
}

const forecastChart = document.getElementById('forecast-chart');
const regionsChart = document.getElementById('regions-chart');
const causesChart = document.getElementById('causes-chart');

function showCharts() {
    new Chart(forecastChart, {
        data: {
            datasets: [{
                type: 'bar',
                label: '산불위험 예보지수',
                data: [26, 25, 20, 20, 25, 22, 19, 18, 19, 16],
            }],
            labels: ['서울', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '산불 위험 예보',
                },
                subtitle: {
                    display: true,
                    text: '5월 30일 오전 10시 발표'
                },
                legend: {
                    position: 'bottom',
                },
            }
        }
    });

    new Chart(regionsChart, {
        data: {
            datasets: [{
                type: 'bar',
                label: '2023년',
                data: [3, 94, 49, 29, 67, 42, 48, 62, 55, 0],
            }, {
                type: 'bar',
                label: '2022년',
                data: [9, 154, 78, 24, 65, 51, 56, 115, 105, 1],
            },
            {
                type: 'bar',
                label: '10년 평균',
                data: [11.2, 116, 75.4, 23.4, 32.2, 26.8, 43.3, 89.3, 48, 0.5],
            }],
            labels: ['서울', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '지역별 발생 현황'
                },
                legend: {
                    position: 'bottom',
                },
            }
        }
    });

    new Chart(causesChart, {
        data: {
            datasets: [{
                type: 'bar',
                label: '2023년',
                data: [68, 48, 60, 31, 26, 277]
            }, {
                type: 'bar',
                label: '2022년',
                data: [253, 44, 59, 53, 51, 296],
            },
            {
                type: 'bar',
                label: '10년 평균',
                data: [178, 69, 68, 30, 30, 160],
            }],
            labels: ['입산자실화', '농산부산물소각', '쓰레기소각', '담뱃불실화', '건축물화재비화', '기타']
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '원인별 산불 발생 현황'
                },
                legend: {
                    position: 'bottom',
                },
            }
        }
    });
}
