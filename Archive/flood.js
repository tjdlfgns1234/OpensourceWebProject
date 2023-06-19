const htmlMarker1 = {
    content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-blue-1.png);background-size:contain;"></div>',
    size: N.Size(40, 40),
    anchor: N.Point(20, 20)
},
    htmlMarker2 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-blue-2.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker3 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-blue-3.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker4 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-blue-4.png);background-size:contain;"></div>',
        size: N.Size(40, 40),
        anchor: N.Point(20, 20)
    },
    htmlMarker5 = {
        content: '<div style="cursor:pointer;width:40px;height:40px;line-height:42px;font-size:10px;color:white;text-align:center;font-weight:bold;background:url(images/cluster-marker-blue-5.png);background-size:contain;"></div>',
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
});

let myPosition = null;

const markers = [];
const forecastOverlays = [], historyOverlays = [];

window.onload = function () {
    showMyPosition(map);

    $("#search-input").on('input', function () {
        const query = $(this).val();
        const suggestions = $("#search-suggestions");
        loadSearchResults(query, myPosition, suggestions);
    });

    const messages = $('#nav-alerts');
    loadDisasterMessages(DisaterMessageType.FLOOD, messages);
    loadDisasterMessages(DisaterMessageType.HEAVY_RAIN, messages);
};

function createMap() {
    loadOverlays();

    const url = new URL('https://www.safemap.go.kr/openApiService/data/getFludMarksData.do');
    url.searchParams.append('serviceKey', SAFEMAP_SERVICE_KEY);
    url.searchParams.append('numOfRows', 200);
    url.searchParams.append('dataType', 'json');

    $.ajax({
        url: url.href,
        Headers: {
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': '*'
        },
        success: handleResponse,
    });

    window.initmap = createMap;

    naver.maps.Event.addListener(map, 'dragend', function (event) {
        console.log("dragend: " + event);
        loadOverlays();
    });

    naver.maps.Event.addListener(map, 'zoom_changed', function (zoom) {
        console.log("zoom_changed: " + zoom);
        loadOverlays();
    });
}

function handleResponse(val) {
    for (const item of val.response.body.items) {
        const emdCode = parseInt(item.EMD_CD);
        const data = lookupEmdCode(emdCode);

        const marker = new naver.maps.Marker({
            position: data.position,
            icon: {
                url: 'images/flood_marker.png',
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

    const markerClustering = new MarkerClustering({
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
}

function loadOverlays() {
    const oldForecastOverlays = forecastOverlays.slice(0);
    const oldHistoryOverlays = historyOverlays.slice(0);

    setTimeout(function () {
        while (oldForecastOverlays.length > 0) {
            const overlay = oldForecastOverlays.pop();
            overlay.setMap(null);
        }

        while (oldHistoryOverlays.length > 0) {
            const overlay = oldHistoryOverlays.pop();
            overlay.setMap(null);
        }
    }, 1000);

    let overlay = createMapOverlay(map, "A2SM_FLOODFOVRRISK", "");
    forecastOverlays.push(overlay);

    overlay = createMapOverlay(map, "A2SM_FLUDMARKS", "A2SM_FludMarks");
    historyOverlays.push(overlay);
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

    const startDate = item.SAT_DATE;
    const startTime = item.SAT_TM;
    const endDate = item.END_DATE;
    const endTime = item.END_TM;
    const emdCode = item.EMD_CD;
    const depth = item.FLUD_SHIM;
    const grade = item.FLUD_GD;
    const area = item.FLUD_AR;
    const name = item.FLUD_NM;
    const cause = item.FLUD_NM2;

    const startDateTime = parseDateTime(startDate, startTime);
    const endDateTime = parseDateTime(endDate, endTime);
    const data = lookupEmdCode(parseInt(emdCode));

    $('#flood-start-date').text(formatDate(startDateTime));
    $('#flood-start-time').text(formatTime(startDateTime));
    $('#flood-end-date').text(formatDate(endDateTime));
    $('#flood-end-time').text(formatTime(endDateTime));
    $('#flood-location').text(data.address);
    $('#flood-depth').text(depth);
    $('#flood-grade').text(grade);
    $('#flood-area').text(parseInt(area).toLocaleString('en-US'));
    $('#flood-name').text(name);
    $('#flood-cause').text(cause);

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'block');
}

function panToMyPosition() {
    panTo(map, myPosition);
}
