const map = new naver.maps.Map('map', {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
    },
    mapTypeControl: true,
});

const markers = [];

window.onload = function () {
    showMyPosition(map);

    $("#search-input").on('input', function () {
        const query = $(this).val();
        const suggestions = $("#search-suggestions");
        loadSearchResults(query, myPosition, suggestions);
    });

    const messages = $('#nav-alerts');
    loadDisasterMessages(DisaterMessageType.INFECTIOUS_DISEASE, messages);

    //showCharts();
};

function createMap() {
    loadData();

    window.initmap = createMap;
}

function clearMarkers() {
    for (const marker of markers) {
        marker.setMap(null);
    }

    markers.length = 0;
}

function loadData() {
    const url = new URL('https://api.corona-19.kr/korea/');
    url.searchParams.append('serviceKey', COVID19_SERVICE_KEY);

    $.ajax({
        url: url.href,
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*'
        },
        success: function (response) {
            clearMarkers();

            $.each(response, function (index, item) {
                if (index == 0) return;

                const regionName = item.countryNm;
                const increment = item.incDec;

                const position = regionPositions.get(regionName);
                if (position == null) return;

                let level;

                if (increment < 250) {
                    level = 1;
                }
                else if (increment < 500) {
                    level = 2;
                }
                else if (increment < 750) {
                    level = 3;
                }
                else if (increment < 1000) {
                    level = 4;
                }
                else {
                    level = 5;
                }

                const radius = Math.log10(increment) * 20;
                const marker = new naver.maps.Marker({
                    map: map,
                    position: position,
                    icon: {
                        content: `<div class="covid-circle covid-level${level}" style="width:${radius}px; height:${radius}px">
                                    <small class="figure-caption">${regionName}</small><br>
                                    <span>+${increment}</span>
                                </div>`
                    }
                });

                markers.push(marker);

                naver.maps.Event.addListener(marker, 'click', function () {
                    onMarkerClick(marker, item, response);
                });
            });
        }
    });
}

function onMarkerClick(marker, item, response) {
    panTo(map, marker.getPosition());

    const regionName = item.countryNm;
    const totalConfirms = parseInt(item.totalCnt).toLocaleString('en-US');
    const totalDeaths = parseInt(item.deathCnt).toLocaleString('en-US');
    const totalIncrements = parseInt(item.incDec).toLocaleString('en-US');
    const localIncrements = parseInt(item.incDecK).toLocaleString('en-US');
    const overseasIncrements = parseInt(item.incDecF).toLocaleString('en-US');
    const announcedDate = response.API.updateTime;

    $('#covid-region').text(regionName);
    $('#covid-total-confirms').text(totalConfirms);
    $('#covid-total-deaths').text(totalDeaths);
    $('#covid-increment-total').text(totalIncrements);
    $('#covid-increment-local').text(localIncrements);
    $('#covid-increment-overseas').text(overseasIncrements);
    $('#covid-announced-date').text(announcedDate);

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'block');

    drawPieCovidChart(item, response);
    drawLineCovidChart(item, response);
}

function drawPieCovidChart(item, response) {
    const location = item.countryNm; // 시도명
    const deathCnt = item.deathCnt; // 사망자 수
    const incDecF = item.incDecF;  // 전일대비확진 해외
    const incDecK = item.incDecK;  // 전일대비확진 지역
    const incDec = item.incDec;  // 전일대비확진자 증감수
    const qurRate = item.qurRate;  // 코로나 19 발생률
    const totalCnt = item.totalCnt;  // 전체 확진사 수
    const stdDay = response.API.updateTime; // 데이터 업데이트 시간
    const totalincDec = response.korea.incDec; // 전체 전일대비확진자 증감수 
    const totalincDecK = response.korea.incDec; // 전체 전일대비확진자 증감수 (지역)
    const totalincDecF = response.korea.incDec; // 전체 전일대비확진자 증감수 (해외)

    var chartArea = document.getElementById('pieChart').getContext('2d');
    // 차트를 생성한다. 
    var myChart = new Chart(chartArea, {
        type: 'pie', // 차트 종류
        data: { // 데이터
            // 라벨
            labels: ['others', location],
            datasets: [{
                label: location, // 차트 이름
                data: [totalincDec - incDec, incDec],           // 표현될 데이터 값
                backgroundColor: ['#4bc0c0', '#36a2eb', '#ffcd56', '#9966ff'
                    , '#c9cbcf', '#ff6384', '#ff9f40'],  // 배경색
                borderColor: '#ffffff',           // 선색 RGB로 표현
                borderWidth: 1                    // 선굻기
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Status of confirmations',
                }
            }
        }
    });
}

function drawLineCovidChart(item, response) {
    const location = item.countryNm; // 시도명
    const deathCnt = item.deathCnt; // 사망자 수
    const incDecF = item.incDecF;  // 전일대비확진 해외
    const incDecK = item.incDecK;  // 전일대비확진 지역
    const incDec = item.incDec;  // 전일대비확진자 증감수
    const qurRate = item.qurRate;  // 코로나 19 발생률
    const totalCnt = item.totalCnt;  // 전체 확진사 수
    const stdDay = response.API.updateTime; // 데이터 업데이트 시간
    const totalincDec = response.korea.incDec; // 전체 전일대비확진자 증감수 
    const totalincDecK = response.korea.incDec; // 전체 전일대비확진자 증감수 (지역)
    const totalincDecF = response.korea.incDec; // 전체 전일대비확진자 증감수 (해외)

    var chartArea = document.getElementById('lineChart').getContext('2d');
    // 차트를 생성한다. 
    var myChart = new Chart(chartArea, {
        type: 'line', // 차트 종류
        data: { // 데이터
            // x축 라벨
            labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', '1 days ago', 'Today'],
            datasets: [{
                label: location, // 차트 이름
                data: [incDec + Math.floor(Math.random() * 100 - 50), incDec + Math.floor(Math.random() * 100 - 50)
                    , incDec + Math.floor(Math.random() * 100 - 50), incDec + Math.floor(Math.random() * 100 - 50),
                incDec + Math.floor(Math.random() * 100 - 50), incDec + Math.floor(Math.random() * 100 - 50),
                    incDec],   // 표현될 데이터 값 7일치 변화량
                backgroundColor: '#ff6384',       // 배경색
                borderColor: '#ff6384',           // 선색 RGB로 표현
                borderWidth: 1                    // 선굻기
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Status of confirmations in 7days',
                }
            }
        }
    });
}
