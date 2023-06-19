const AirPollutionType = {
    PM25: 10008,
    PM10: 10007,
    O3: 10003
};

class AirKoreaStation {
    constructor(name, address, position, pm25, pm10, o3, dataTime) {
        this.name = name;
        this.address = address;
        this.position = position;
        this.pm25 = pm25;
        this.pm10 = pm10;
        this.o3 = o3;
        this.dataTime = dataTime;
    }

    get pm25Grade() {
        if (this.pm25 <= 15) {
            return 1;
        } else if (this.pm25 <= 35) {
            return 2;
        } else if (this.pm25 <= 75) {
            return 3;
        } else {
            return 4;
        }
    }

    get pm10Grade() {
        if (this.pm10 <= 30) {
            return 1;
        } else if (this.pm10 <= 80) {
            return 2;
        } else if (this.pm10 <= 150) {
            return 3;
        } else if (this.pm10 <= 600) {
            return 4;
        }
    }

    get o3Grade() {
        if (this.o3 <= 0.030) {
            return 1;
        } else if (this.o3 <= 0.09) {
            return 2;
        } else if (this.o3 <= 0.15) {
            return 3;
        } else {
            return 4;
        }
    }
}

const extraRegionPositions = new Map([
    ['경기북부', new naver.maps.LatLng(37.7381, 127.0337)],
    ['경기남부', new naver.maps.LatLng(37.2636, 127.0286)],
    ['영서', new naver.maps.LatLng(37.8813, 127.7298)],
    ['영동', new naver.maps.LatLng(37.7518, 128.8761)]
]);

const gradeMappings = new Map([
    ['좋음', 1],
    ['보통', 2],
    ['나쁨', 3],
    ['매우나쁨', 4]
])

const gradeColors = [, '#32a1ff', '#00c73c', '#fd9b5a', '#ff5959'];

const map = new naver.maps.Map('map', {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
    },
    mapTypeControl: true,
});

let myPosition = null;

const stations = [];
const pm25Forecasts = new Map(), pm10Forecasts = new Map(), o3Forecasts = new Map();
const markers = [];

window.onload = function () {
    showMyPosition(map);

    $("#search-input").on('input', function () {
        const query = $(this).val();
        const suggestions = $("#search-suggestions");
        loadSearchResults(query, myPosition, suggestions);
    });

    const messages = $('#nav-alerts');
    loadDisasterMessages(DisaterMessageType.FINE_DUST, messages);
};

function createMap() {
    loadMeasurements(function () {
        showMeasurements(AirPollutionType.PM25);
    });

    window.initmap = createMap;
}

function loadMeasurements(callback) {
    $.ajax({
        url: 'https://d.kbs.co.kr/now/selectAirMsrStnList',
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
        },
        success: function (response) {
            for (const item of response) {
                const year = parseInt(item.dataTime.substring(0, 4));
                if (year != 2023) continue;

                const month = parseInt(item.dataTime.substring(4, 6)) - 1;
                const day = parseInt(item.dataTime.substring(6, 8));
                const hour = parseInt(item.dataTime.substring(8, 10));
                const minute = parseInt(item.dataTime.substring(10, 12));
                const dataTime = new Date(year, month, day, hour, minute);

                const name = item.stationName;
                const address = item.addr;
                const lat = Number(item.dmX);
                const lng = Number(item.dmY);
                const position = new naver.maps.LatLng(lat, lng);

                const pm25 = parseInt(item.pm25Value);
                const pm10 = Number(item.pm10Value);
                const o3 = parseInt(item.o3Value);

                const station = new AirKoreaStation(name, address, position, pm25, pm10, o3, dataTime);
                stations.push(station);
            }

            callback();
        }
    });
}

function formatDate(date) {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadForecasts(callback) {
    const today = new Date();
    if (today.getHours() < 5) today.setDate(today.getDate() - 1);

    const url = new URL('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustFrcstDspth');
    url.searchParams.append('serviceKey', PUBLIC_PORTAL_SERVICE_KEY);
    url.searchParams.append('returnType', 'json');
    url.searchParams.append('searchDate', formatDate(today));
    url.searchParams.append('numOfRows', 30);

    $.ajax({
        url: url.href,
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*',
        },
        success: function (response) {
            for (const item of response.response.body.items) {
                const informCode = item.informCode;
                const informData = item.informData;

                switch (informCode) {
                    case 'PM25':
                        pm25Forecasts.set(informData, item);
                        break;
                    case 'PM10':
                        pm10Forecasts.set(informData, item);
                        break;
                    case 'O3':
                        o3Forecasts.set(informData, item);
                        break;
                }
            }

            callback();
        }
    });
}

function clearMarkers() {
    for (const marker of markers) {
        marker.setMap(null);
    }

    markers.length = 0;
}

function showMeasurements(type) {
    clearMarkers();

    for (const station of stations) {
        let value, grade;

        switch (type) {
            case AirPollutionType.PM25:
                value = station.pm25;
                grade = station.pm25Grade;
                break;
            case AirPollutionType.PM10:
                value = station.pm10;
                grade = station.pm10Grade;
                break;
            case AirPollutionType.O3:
                value = station.o3;
                grade = station.o3Grade;
                break;
        }

        const marker = new naver.maps.Marker({
            map: map,
            position: station.position,
            icon: {
                content: `<div class="station-circle air-pollution-grade${grade}"></div>`
            }
        });

        naver.maps.Event.addListener(marker, 'click', function () {
            onStationMarkerClick(marker, station);
        });

        markers.push(marker);
    }
}

function showForecasts(type, date) {
    function createMap(data) {
        console.log(data);
        return data.informGrade.split(",").reduce((map, item) => {
            const [region, status] = item.split(" : ");
            map.set(region.trim(), status.trim());
            return map;
        }, new Map());
    }

    function performTask(forecasts) {
        clearMarkers();

        const dateString = formatDate(date);
        const forecastItem = forecasts.get(dateString);
        const forecastMap = createMap(forecastItem);

        for (const [regionName, forecast] of forecastMap) {
            const position = regionPositions.has(regionName) ? regionPositions.get(regionName) : extraRegionPositions.get(regionName);
            const gradeNumber = gradeMappings.get(forecast);

            const marker = new naver.maps.Marker({
                map: map,
                position: position,
                icon: {
                    content: `<div class="forecast-circle air-pollution-grade${gradeNumber}">
                                <small class="figure-caption">${regionName}</small><br>
                                <span>${forecast}</span>
                            </div>`,
                    anchor: naver.maps.Point(32, 32)
                }
            });

            naver.maps.Event.addListener(marker, 'click', function () {
                onRegionMarkerClick(marker, forecastItem, regionName, forecast);
            });

            markers.push(marker);
        }
    }

    let forecasts;

    switch (type) {
        case AirPollutionType.PM25:
            forecasts = pm25Forecasts;
            break;
        case AirPollutionType.PM10:
            forecasts = pm10Forecasts;
            break;
        case AirPollutionType.O3:
            forecasts = o3Forecasts;
            break;
    }

    if (pm25Forecasts.size == 0 || pm10Forecasts.size == 0 || o3Forecasts.size == 0) {
        loadForecasts(function () {
            performTask(forecasts);
        });
    }
    else {
        performTask(forecasts);
    }
}

function showData() {
    let type;

    if ($("#radio-pm25").is(":checked")) {
        type = AirPollutionType.PM25;
    }
    else if ($("#radio-pm10").is(":checked")) {
        type = AirPollutionType.PM10;
    }
    else {
        type = AirPollutionType.O3;
    }

    if ($("#radio-current").is(":checked")) {
        showMeasurements(type);
    }
    else {
        const date = new Date();
        if (date.getHours() < 5) date.setDate(today.getDate() - 1);

        if ($("#radio-tomorrow-forecast").is(":checked")) {
            date.setDate(date.getDate() + 1);
        }
        else if ($("#radio-2d-forecast").is(":checked")) {
            date.setDate(date.getDate() + 2);
        }

        showForecasts(type, date);
    }
}

function onStationMarkerClick(marker, station) {
    panTo(map, marker.getPosition());

    const grades = [, 'Good', 'Moderate', 'Unhealthy', 'Very unhealthy'];

    $('#air-station-name').text(station.name);
    $('#air-station-address').text(station.address);
    $('#air-pm25-value').text(station.pm25);
    $('#air-pm25-grade').css('color', gradeColors[station.pm25Grade]).text(grades[station.pm25Grade]);
    $('#air-pm10-value').text(station.pm10);
    $('#air-pm10-grade').css('color', gradeColors[station.pm10Grade]).text(grades[station.pm10Grade]);
    $('#air-o3-value').text(station.o3);
    $('#air-o3-grade').css('color', gradeColors[station.o3Grade]).text(grades[station.o3Grade]);
    $('#air-data-time').text(formatDate(station.dataTime));

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'block');
    $('#forecast-info').css('display', 'none');
}

function onRegionMarkerClick(marker, forecastItem, regionName, forecastGrade) {
    panTo(map, marker.getPosition());

    const forecastDate = new Date(forecastItem.informData);
    const gradeNumber = gradeMappings.get(forecastGrade);
    const analysis = forecastItem.informCause;
    const announcedTime = forecastItem.dataTime;

    $('#air-forecast-region-name').text(regionName);
    $('#air-forecast-date').text(formatDate(forecastDate));

    let forecastType;

    switch (forecastItem.informCode) {
        case 'PM25':
            forecastType = 'Ultrafine Dust (PM 2.5) Forecast';
            break;
        case 'PM10':
            forecastType = 'Fine Dust (PM 10) Forecast';
            break;
        case 'O3':
            forecastType = 'Ozone (O3) Forecast';
            break;
    }

    $("#air-forecast-type").text(forecastType);
    $('#air-forecast-grade').css('color', gradeColors[gradeNumber]).text(forecastGrade);
    $('#air-forecast-analysis').text(analysis);
    $('#air-forecast-announced-time').text(announcedTime);

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'none');
    $('#forecast-info').css('display', 'block');
}
