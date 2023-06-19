const map = new naver.maps.Map('map', {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true,
    zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
    },
    mapTypeControl: true
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
    loadDisasterMessages(DisaterMessageType.EARTHQUAKE, messages);
};

function createMap() {
    loadRecords();

    window.initmap = createMap;
}

function clearMarkers() {
    for (const marker of markers) {
        marker.setMap(null);
    }

    markers.length = 0;
}

function loadRecords() {
    const url = new URL('https://www.safemap.go.kr/openApiService/data/getErthqkData.do');
    url.searchParams.append('serviceKey', SAFEMAP_SERVICE_KEY);
    url.searchParams.append('pageNo', 6);
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
                const x = Number(item.X);
                const y = Number(item.Y);

                const magnitude = Number(item.SMINTS);
                const magnitudeGrade = Math.ceil(magnitude);

                const radius = Math.log2(magnitude) * 24;

                const marker = new naver.maps.Marker({
                    map: map,
                    position: convertFromEPSG3857(x, y),
                    icon: {
                        content: `<div class="earthquake-circle earthquake-magnitude${magnitudeGrade}" style="width:${radius}px; height:${radius}px">
                                    <small class="figure-caption">${magnitude}</small>
                                </div>`
                    }
                });

                markers.push(marker);

                naver.maps.Event.addListener(marker, 'click', function () {
                    onMarkerClick(marker, item);
                });
            }
        },
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

    const date = item.OCCU_DE;
    const time = item.OCCU_TM;
    const dateTime = parseDateTime(date, time);

    const location = item.LC;
    const magnitude = item.SMINTS;

    $('#earthquake-location').text(location);
    $('#earthquake-magnitude').text(magnitude);
    $('#earthquake-date').text(formatDate(dateTime));
    $('#earthquake-time').text(formatTime(dateTime));

    $('#overall-info').css('display', 'none');
    $('#detail-info').css('display', 'block');
}
